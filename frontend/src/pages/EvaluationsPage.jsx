import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { api } from '../lib/api';

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    periodo: '',
    status: '',
    turma: ''
  });
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    rascunho: 0,
    finalizada: 0,
    enviada: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadEvaluations();
    loadClasses();
    loadStats();
  }, [filters]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.periodo) params.append('periodo', filters.periodo);
      if (filters.status) params.append('status', filters.status);
      if (filters.turma) params.append('turma', filters.turma);
      
      const response = await api.get(`/evaluations?${params.toString()}`);
      
      if (response.data.success) {
        setEvaluations(response.data.data.evaluations);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes');
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/evaluations');
      if (response.data.success) {
        const allEvaluations = response.data.data.evaluations;
        setStats({
          total: allEvaluations.length,
          rascunho: allEvaluations.filter(e => e.status === 'rascunho').length,
          finalizada: allEvaluations.filter(e => e.status === 'finalizada').length,
          enviada: allEvaluations.filter(e => e.status === 'enviada_responsavel').length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      rascunho: <Clock className="h-4 w-4 text-yellow-600" />,
      finalizada: <CheckCircle className="h-4 w-4 text-green-600" />,
      enviada_responsavel: <Send className="h-4 w-4 text-blue-600" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      rascunho: 'bg-yellow-100 text-yellow-800',
      finalizada: 'bg-green-100 text-green-800',
      enviada_responsavel: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      rascunho: 'Rascunho',
      finalizada: 'Finalizada',
      enviada_responsavel: 'Enviada'
    };
    return labels[status] || status;
  };

  const getPeriodoLabel = (periodo) => {
    const labels = {
      mensal: 'Mensal',
      bimestral: 'Bimestral',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual'
    };
    return labels[periodo] || periodo;
  };

  const getNotaColor = (nota) => {
    if (nota >= 9) return 'text-green-600';
    if (nota >= 8) return 'text-blue-600';
    if (nota >= 7) return 'text-yellow-600';
    if (nota >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConceito = (nota) => {
    if (nota >= 9) return 'Excelente';
    if (nota >= 8) return 'Muito Bom';
    if (nota >= 7) return 'Bom';
    if (nota >= 6) return 'Regular';
    if (nota >= 5) return 'Insuficiente';
    return 'Inadequado';
  };

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.aluno?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evaluation.turma?.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            Avaliações Pedagógicas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe o desenvolvimento dos alunos
          </p>
        </div>
        <Button
          onClick={() => navigate('/evaluations/new')}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.rascunho}</p>
                <p className="text-sm text-gray-600">Em Rascunho</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.finalizada}</p>
                <p className="text-sm text-gray-600">Finalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.enviada}</p>
                <p className="text-sm text-gray-600">Enviadas</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por aluno, título ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.periodo} onValueChange={(value) => setFilters({...filters, periodo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os períodos</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="bimestral">Bimestral</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="enviada_responsavel">Enviada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.turma} onValueChange={(value) => setFilters({...filters, turma: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as turmas</SelectItem>
                {classes.map(classe => (
                  <SelectItem key={classe._id} value={classe._id}>
                    {classe.nome}
                  </SelectItem>
                ))}
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

      {/* Lista de Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvaluations.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma avaliação encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || Object.values(filters).some(f => f) 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando sua primeira avaliação pedagógica'
                    }
                  </p>
                  <Button onClick={() => navigate('/evaluations/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Avaliação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredEvaluations.map((evaluation) => (
            <Card key={evaluation._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{evaluation.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {evaluation.aluno?.nome} • {evaluation.turma?.nome}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(evaluation.status)}>
                    {getStatusIcon(evaluation.status)}
                    <span className="ml-1">{getStatusLabel(evaluation.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{new Date(evaluation.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{getPeriodoLabel(evaluation.periodo)}</span>
                    </div>
                  </div>

                  {/* Notas (se finalizada) */}
                  {evaluation.status !== 'rascunho' && evaluation.notas && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-600">Técnica</p>
                          <p className={`font-bold ${getNotaColor(evaluation.notas.tecnica)}`}>
                            {evaluation.notas.tecnica?.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Comportamento</p>
                          <p className={`font-bold ${getNotaColor(evaluation.notas.comportamento)}`}>
                            {evaluation.notas.comportamento?.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Geral</p>
                          <p className={`font-bold ${getNotaColor(evaluation.notas.geral)}`}>
                            {evaluation.notas.geral?.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <Badge variant="outline" className={getNotaColor(evaluation.notas.geral)}>
                          <Award className="h-3 w-3 mr-1" />
                          {getConceito(evaluation.notas.geral)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/evaluations/${evaluation._id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {evaluation.status === 'rascunho' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/evaluations/${evaluation._id}/edit`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {evaluation.status === 'finalizada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Implementar envio */}}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Enviar
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

export default EvaluationsPage;

