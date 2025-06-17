import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  DollarSign, 
  Plus, 
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  FileText,
  Download,
  Users,
  Clock
} from 'lucide-react';
import { api } from '../lib/api';

const FinancialPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    metodoPagamento: '',
    competenciaAno: new Date().getFullYear(),
    competenciaMes: ''
  });
  const [stats, setStats] = useState({
    receitaMensal: 0,
    totalPagamentosMes: 0,
    inadimplencia: 0,
    pagamentosVencidos: 0,
    pagamentosPendentes: 0,
    receitaPorMetodo: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.metodoPagamento) params.append('metodoPagamento', filters.metodoPagamento);
      if (filters.competenciaAno) params.append('competenciaAno', filters.competenciaAno);
      if (filters.competenciaMes) params.append('competenciaMes', filters.competenciaMes);
      
      const response = await api.get(`/payments?${params.toString()}`);
      
      if (response.data.success) {
        setPayments(response.data.data.payments);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setError('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.competenciaAno) params.append('ano', filters.competenciaAno);
      if (filters.competenciaMes) params.append('mes', filters.competenciaMes);
      
      const response = await api.get(`/payments/stats?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      const metodoPagamento = {
        tipo: 'dinheiro'
      };
      
      await api.patch(`/payments/${paymentId}/confirm`, { metodoPagamento });
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setError('Erro ao confirmar pagamento');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: <Clock className="h-4 w-4 text-yellow-600" />,
      pago: <Check className="h-4 w-4 text-green-600" />,
      vencido: <AlertCircle className="h-4 w-4 text-red-600" />,
      cancelado: <X className="h-4 w-4 text-gray-600" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      vencido: 'Vencido',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getMetodoIcon = (metodo) => {
    const icons = {
      boleto: <FileText className="h-4 w-4" />,
      cartao_credito: <CreditCard className="h-4 w-4" />,
      cartao_debito: <CreditCard className="h-4 w-4" />,
      pix: <DollarSign className="h-4 w-4" />,
      dinheiro: <DollarSign className="h-4 w-4" />,
      transferencia: <DollarSign className="h-4 w-4" />
    };
    return icons[metodo] || <DollarSign className="h-4 w-4" />;
  };

  const getMetodoLabel = (metodo) => {
    const labels = {
      boleto: 'Boleto',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      transferencia: 'Transferência'
    };
    return labels[metodo] || metodo;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const filteredPayments = payments.filter(payment =>
    payment.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-green-600" />
            Gestão Financeira
          </h1>
          <p className="text-gray-600 mt-1">
            Controle de pagamentos, receitas e inadimplência
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {/* Implementar geração de relatório */}}
          >
            <Download className="mr-2 h-4 w-4" />
            Relatório
          </Button>
          <Button
            onClick={() => navigate('/financial/new-payment')}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Cobrança
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.receitaMensal)}
                </p>
                <p className="text-sm text-gray-600">Receita Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalPagamentosMes}</p>
                <p className="text-sm text-gray-600">Pagamentos no Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.inadimplencia)}
                </p>
                <p className="text-sm text-gray-600">Inadimplência</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pagamentosPendentes}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pagamentosVencidos}</p>
                <p className="text-sm text-gray-600">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por aluno ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.metodoPagamento} onValueChange={(value) => setFilters({...filters, metodoPagamento: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os métodos</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.competenciaMes.toString()} onValueChange={(value) => setFilters({...filters, competenciaMes: value ? parseInt(value) : ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os meses</SelectItem>
                {Array.from({length: 12}, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.competenciaAno.toString()} onValueChange={(value) => setFilters({...filters, competenciaAno: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum pagamento encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || Object.values(filters).some(f => f) 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando sua primeira cobrança'
                    }
                  </p>
                  <Button onClick={() => navigate('/financial/new-payment')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Cobrança
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{payment.aluno?.nome}</CardTitle>
                    <CardDescription className="mt-1">
                      {payment.descricao}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(payment.status)}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{getStatusLabel(payment.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Valor e vencimento */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(payment.valor)}
                      </p>
                      {payment.valorOriginal !== payment.valor && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(payment.valorOriginal)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Vencimento</p>
                      <p className="font-medium">{formatDate(payment.dataVencimento)}</p>
                    </div>
                  </div>

                  {/* Método de pagamento */}
                  <div className="flex items-center">
                    {getMetodoIcon(payment.metodoPagamento?.tipo)}
                    <span className="ml-2 text-sm text-gray-600">
                      {getMetodoLabel(payment.metodoPagamento?.tipo)}
                    </span>
                  </div>

                  {/* Competência */}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {payment.competencia?.mes}/{payment.competencia?.ano}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/financial/payments/${payment._id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {payment.status === 'pendente' && (
                      <Button
                        size="sm"
                        onClick={() => confirmPayment(payment._id)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FinancialPage;

