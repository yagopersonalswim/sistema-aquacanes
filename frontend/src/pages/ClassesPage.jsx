import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Users, 
  Clock, 
  Calendar,
  MapPin,
  Eye, 
  Edit, 
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '../lib/api';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    ativas: 0,
    inativas: 0,
    totalAlunos: 0,
    vagasDisponiveis: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
    loadStats();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      setError('Erro ao carregar lista de turmas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/classes/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta turma?')) {
      return;
    }

    try {
      const response = await api.delete(`/classes/${classId}`);
      
      if (response.data.success) {
        setClasses(classes.filter(cls => cls._id !== classId));
        loadStats(); // Recarregar estatísticas
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      setError('Erro ao excluir turma');
    }
  };

  // Filtrar turmas baseado na busca
  const filteredClasses = classes.filter(cls => 
    cls.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.professor?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.faixaEtaria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status) => {
    const colors = {
      ativa: 'bg-green-100 text-green-800',
      inativa: 'bg-gray-100 text-gray-800',
      suspensa: 'bg-yellow-100 text-yellow-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ativa: 'Ativa',
      inativa: 'Inativa',
      suspensa: 'Suspensa',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  };

  const formatHorarios = (horarios) => {
    return horarios.map(h => `${h.diaSemana} ${h.horaInicio}-${h.horaFim}`).join(', ');
  };

  const getOcupacaoColor = (atual, maximo) => {
    const percentual = (atual / maximo) * 100;
    if (percentual >= 90) return 'text-red-600';
    if (percentual >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

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
            <GraduationCap className="mr-3 h-8 w-8 text-blue-600" />
            Gestão de Turmas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie todas as turmas e horários da escola
          </p>
        </div>
        <Button
          onClick={() => navigate('/classes/new')}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Turmas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Turmas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalAlunos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vagas Disponíveis</p>
                <p className="text-2xl font-bold text-orange-600">{stats.vagasDisponiveis}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aulas Hoje</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {classes.filter(cls => {
                    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
                    return cls.horarios.some(h => h.diaSemana.toLowerCase() === hoje.toLowerCase());
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome da turma, professor ou faixa etária..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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

      {/* Lista de Turmas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma turma encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Tente ajustar o termo de busca'
                      : 'Comece criando a primeira turma'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => navigate('/classes/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeira Turma
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <Card key={cls._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cls.nome}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      {cls.faixaEtaria}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(cls.status)}>
                    {getStatusLabel(cls.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Professor */}
                <div className="flex items-center text-sm text-gray-600">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {cls.professor?.nome || 'Professor não atribuído'}
                    </p>
                    <p className="text-xs text-gray-500">Professor responsável</p>
                  </div>
                </div>

                {/* Horários */}
                <div className="flex items-start text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Horários</p>
                    <p className="text-xs">
                      {cls.horarios.length > 0 
                        ? formatHorarios(cls.horarios)
                        : 'Horários não definidos'
                      }
                    </p>
                  </div>
                </div>

                {/* Ocupação */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-600">Ocupação</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getOcupacaoColor(cls.alunosMatriculados?.length || 0, cls.capacidadeMaxima)}`}>
                      {cls.alunosMatriculados?.length || 0}/{cls.capacidadeMaxima}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cls.capacidadeMaxima - (cls.alunosMatriculados?.length || 0)} vagas livres
                    </p>
                  </div>
                </div>

                {/* Local */}
                {cls.local && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{cls.local}</span>
                  </div>
                )}

                {/* Ações */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/classes/${cls._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/classes/${cls._id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/classes/${cls._id}/students`)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Alunos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClass(cls._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo dos resultados */}
      {filteredClasses.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredClasses.length} de {classes.length} turmas
        </div>
      )}
    </div>
  );
};

export default ClassesPage;

