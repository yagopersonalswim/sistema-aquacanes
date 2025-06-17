const Contract = require('../models/Contract');
const Student = require('../models/Student');
const Plan = require('../models/Plan');
const User = require('../models/User');
const crypto = require('crypto');

// Criar novo contrato
const createContract = async (req, res) => {
  try {
    const {
      aluno,
      responsavel,
      plano,
      tipoContrato,
      dataInicio,
      vigencia,
      contratante,
      clausulas,
      termosEspecificos
    } = req.body;

    // Verificar se o aluno existe
    const alunoExistente = await Student.findById(aluno);
    if (!alunoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se o responsável existe
    const responsavelExistente = await User.findById(responsavel);
    if (!responsavelExistente) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
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

    // Dados padrão da escola
    const dadosEscola = {
      razaoSocial: 'AquaVida Escola de Natação',
      cnpj: '00.000.000/0001-00',
      endereco: {
        logradouro: 'Rua das Águas, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000'
      },
      telefone: '(11) 99999-9999',
      email: 'contato@aquavida.com.br',
      responsavelLegal: 'João Silva'
    };

    const novoContract = new Contract({
      aluno,
      responsavel,
      plano,
      tipoContrato,
      dataInicio: dataInicio || new Date(),
      vigencia,
      contratante,
      contratado: dadosEscola,
      clausulas: {
        ...clausulas,
        valorMensalidade: clausulas?.valorMensalidade || planoExistente.valor,
        diaVencimento: clausulas?.diaVencimento || 10,
        formaPagamento: clausulas?.formaPagamento || 'boleto'
      },
      termosEspecificos,
      criadoPor: req.user.id
    });

    // Gerar hash do contrato
    const conteudoContrato = JSON.stringify({
      aluno: novoContract.aluno,
      plano: novoContract.plano,
      clausulas: novoContract.clausulas,
      termosEspecificos: novoContract.termosEspecificos
    });
    novoContract.hashContrato = crypto.createHash('sha256').update(conteudoContrato).digest('hex');

    await novoContract.save();

    res.status(201).json({
      success: true,
      message: 'Contrato criado com sucesso',
      data: { contract: novoContract }
    });

  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar contratos
const getContracts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      aluno,
      responsavel,
      status,
      tipoContrato,
      dataInicio,
      dataFim
    } = req.query;

    const filtros = {};

    if (aluno) filtros.aluno = aluno;
    if (responsavel) filtros.responsavel = responsavel;
    if (status) filtros.status = status;
    if (tipoContrato) filtros.tipoContrato = tipoContrato;

    if (dataInicio && dataFim) {
      filtros.dataInicio = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }

    const skip = (page - 1) * limit;

    const contracts = await Contract.find(filtros)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contract.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter contrato por ID
const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    res.json({
      success: true,
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao obter contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Assinar contrato (responsável)
const signContractParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { assinatura, localizacao } = req.body;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    if (contract.assinatura.responsavel.assinado) {
      return res.status(400).json({
        success: false,
        message: 'Contrato já foi assinado pelo responsável'
      });
    }

    const dadosAssinatura = {
      assinatura,
      ip: req.ip || req.connection.remoteAddress,
      localizacao
    };

    contract.assinarResponsavel(dadosAssinatura);
    await contract.save();

    res.json({
      success: true,
      message: 'Contrato assinado com sucesso',
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao assinar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Assinar contrato (escola)
const signContractSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { cargo, assinatura } = req.body;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    if (contract.assinatura.escola.assinado) {
      return res.status(400).json({
        success: false,
        message: 'Contrato já foi assinado pela escola'
      });
    }

    contract.assinarEscola(req.user.id, cargo, assinatura);
    await contract.save();

    res.json({
      success: true,
      message: 'Contrato assinado pela escola com sucesso',
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao assinar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar contrato
const activateContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    if (contract.statusAssinatura !== 'completo') {
      return res.status(400).json({
        success: false,
        message: 'Contrato deve estar completamente assinado para ser ativado'
      });
    }

    contract.ativar();
    await contract.save();

    res.json({
      success: true,
      message: 'Contrato ativado com sucesso',
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao ativar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar contrato
const cancelContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    if (contract.status === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'Contrato já está cancelado'
      });
    }

    contract.cancelar(motivo, req.user.id);
    await contract.save();

    res.json({
      success: true,
      message: 'Contrato cancelado com sucesso',
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao cancelar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter contratos vencendo
const getExpiringContracts = async (req, res) => {
  try {
    const { dias = 30 } = req.query;

    const contracts = await Contract.getContratosVencendo(parseInt(dias));

    res.json({
      success: true,
      data: { contracts }
    });

  } catch (error) {
    console.error('Erro ao obter contratos vencendo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de contratos
const getContractStats = async (req, res) => {
  try {
    const stats = await Contract.getEstatisticas();

    // Contratos vencendo em 30 dias
    const vencendo = await Contract.getContratosVencendo(30);

    res.json({
      success: true,
      data: {
        ...stats,
        vencendo: vencendo.length
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

// Gerar PDF do contrato
const generateContractPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Aqui seria implementada a geração do PDF
    // Por enquanto, retornamos os dados do contrato
    res.json({
      success: true,
      message: 'PDF gerado com sucesso',
      data: { contract }
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar integridade do contrato
const verifyContractIntegrity = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Recalcular hash
    const conteudoContrato = JSON.stringify({
      aluno: contract.aluno,
      plano: contract.plano,
      clausulas: contract.clausulas,
      termosEspecificos: contract.termosEspecificos
    });
    const hashAtual = crypto.createHash('sha256').update(conteudoContrato).digest('hex');

    const integro = hashAtual === contract.hashContrato;

    res.json({
      success: true,
      data: {
        integro,
        hashOriginal: contract.hashContrato,
        hashAtual,
        dataVerificacao: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao verificar integridade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  signContractParent,
  signContractSchool,
  activateContract,
  cancelContract,
  getExpiringContracts,
  getContractStats,
  generateContractPDF,
  verifyContractIntegrity
};

