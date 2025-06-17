const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Plan = require('../models/Plan');
const moment = require('moment');

// Criar novo pagamento
const createPayment = async (req, res) => {
  try {
    const {
      aluno,
      plano,
      descricao,
      valor,
      dataVencimento,
      competencia,
      metodoPagamento
    } = req.body;

    // Verificar se o aluno existe
    const alunoExistente = await Student.findById(aluno);
    if (!alunoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se o plano existe
    const planoExistente = await Plan.findById(plano);
    if (!planoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    const novoPayment = new Payment({
      aluno,
      plano,
      descricao,
      valor: valor || planoExistente.valor,
      valorOriginal: valor || planoExistente.valor,
      dataVencimento,
      competencia,
      metodoPagamento,
      criadoPor: req.user.id
    });

    await novoPayment.save();

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      data: { payment: novoPayment }
    });

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar pagamentos
const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      aluno,
      status,
      dataInicio,
      dataFim,
      competenciaAno,
      competenciaMes,
      metodoPagamento
    } = req.query;

    const filtros = {};

    if (aluno) filtros.aluno = aluno;
    if (status) filtros.status = status;
    if (metodoPagamento) filtros['metodoPagamento.tipo'] = metodoPagamento;
    if (competenciaAno) filtros['competencia.ano'] = parseInt(competenciaAno);
    if (competenciaMes) filtros['competencia.mes'] = parseInt(competenciaMes);

    if (dataInicio && dataFim) {
      filtros.dataVencimento = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filtros)
      .sort({ dataVencimento: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter pagamento por ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });

  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Confirmar pagamento
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodoPagamento, observacoes } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status === 'pago') {
      return res.status(400).json({
        success: false,
        message: 'Pagamento já foi confirmado'
      });
    }

    payment.marcarComoPago(metodoPagamento);
    payment.processadoPor = req.user.id;
    
    if (observacoes) {
      payment.historico.push({
        data: new Date(),
        usuario: req.user.id,
        acao: 'observacao_adicionada',
        observacoes
      });
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Pagamento confirmado com sucesso',
      data: { payment }
    });

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar pagamento
const cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status === 'pago') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um pagamento já confirmado'
      });
    }

    payment.cancelar(motivo, req.user.id);
    await payment.save();

    res.json({
      success: true,
      message: 'Pagamento cancelado com sucesso',
      data: { payment }
    });

  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Aplicar desconto
const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, percentual, motivo } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status === 'pago') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível aplicar desconto em pagamento já confirmado'
      });
    }

    payment.aplicarDesconto(valor, percentual, motivo);
    
    payment.historico.push({
      data: new Date(),
      usuario: req.user.id,
      acao: 'desconto_aplicado',
      observacoes: `Desconto aplicado: ${motivo}`
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Desconto aplicado com sucesso',
      data: { payment }
    });

  } catch (error) {
    console.error('Erro ao aplicar desconto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas financeiras
const getFinancialStats = async (req, res) => {
  try {
    const { ano, mes } = req.query;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;

    // Receita do mês
    const receitaMensal = await Payment.getReceitaMensal(anoAtual, mesAtual);

    // Inadimplência
    const inadimplencia = await Payment.getInadimplencia();

    // Pagamentos pendentes
    const pagamentosPendentes = await Payment.countDocuments({
      status: 'pendente',
      dataVencimento: { $gte: new Date() }
    });

    // Pagamentos vencidos
    const pagamentosVencidos = await Payment.countDocuments({
      status: { $in: ['pendente', 'vencido'] },
      dataVencimento: { $lt: new Date() }
    });

    // Receita por método de pagamento
    const receitaPorMetodo = await Payment.aggregate([
      {
        $match: {
          status: 'pago',
          'competencia.ano': anoAtual,
          'competencia.mes': mesAtual
        }
      },
      {
        $group: {
          _id: '$metodoPagamento.tipo',
          total: { $sum: '$valor' },
          quantidade: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        receitaMensal: receitaMensal.totalReceita,
        totalPagamentosMes: receitaMensal.totalPagamentos,
        inadimplencia: inadimplencia.totalInadimplencia,
        pagamentosVencidos: inadimplencia.totalPagamentosVencidos,
        pagamentosPendentes,
        receitaPorMetodo
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerar relatório financeiro
const generateFinancialReport = async (req, res) => {
  try {
    const {
      dataInicio,
      dataFim,
      status,
      aluno,
      metodoPagamento
    } = req.query;

    const filtros = {};

    if (status) filtros.status = status;
    if (aluno) filtros.aluno = aluno;
    if (metodoPagamento) filtros['metodoPagamento.tipo'] = metodoPagamento;

    if (dataInicio && dataFim) {
      filtros.dataVencimento = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }

    const pipeline = [
      { $match: filtros },
      {
        $group: {
          _id: {
            status: '$status',
            metodo: '$metodoPagamento.tipo'
          },
          totalValor: { $sum: '$valor' },
          quantidade: { $sum: 1 },
          valorMedio: { $avg: '$valor' }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          totalPorStatus: { $sum: '$totalValor' },
          quantidadePorStatus: { $sum: '$quantidade' },
          metodos: {
            $push: {
              metodo: '$_id.metodo',
              valor: '$totalValor',
              quantidade: '$quantidade'
            }
          }
        }
      }
    ];

    const relatorio = await Payment.aggregate(pipeline);

    res.json({
      success: true,
      data: { relatorio }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerar cobrança em lote
const generateBulkCharges = async (req, res) => {
  try {
    const { competencia, alunosIds, planoId } = req.body;

    if (!competencia || !competencia.mes || !competencia.ano) {
      return res.status(400).json({
        success: false,
        message: 'Competência (mês e ano) é obrigatória'
      });
    }

    const plano = await Plan.findById(planoId);
    if (!plano) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    const alunos = await Student.find({
      _id: { $in: alunosIds },
      status: 'ativo'
    });

    const pagamentosGerados = [];

    for (const aluno of alunos) {
      // Verificar se já existe cobrança para esta competência
      const cobrancaExistente = await Payment.findOne({
        aluno: aluno._id,
        'competencia.mes': competencia.mes,
        'competencia.ano': competencia.ano
      });

      if (!cobrancaExistente) {
        const dataVencimento = new Date(competencia.ano, competencia.mes - 1, plano.diaVencimento || 10);
        
        const novoPayment = new Payment({
          aluno: aluno._id,
          plano: plano._id,
          descricao: `Mensalidade ${competencia.mes}/${competencia.ano} - ${plano.nome}`,
          valor: plano.valor,
          valorOriginal: plano.valor,
          dataVencimento,
          competencia,
          metodoPagamento: {
            tipo: 'boleto'
          },
          criadoPor: req.user.id
        });

        await novoPayment.save();
        pagamentosGerados.push(novoPayment);
      }
    }

    res.json({
      success: true,
      message: `${pagamentosGerados.length} cobranças geradas com sucesso`,
      data: { pagamentosGerados }
    });

  } catch (error) {
    console.error('Erro ao gerar cobranças:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  confirmPayment,
  cancelPayment,
  applyDiscount,
  getFinancialStats,
  generateFinancialReport,
  generateBulkCharges
};

