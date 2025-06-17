import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    porNivel: {}
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
    loadStats();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      
      if (response.data.success) {
        setStudents(response.data.data.students);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar lista de alunos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/students/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) {
      return;
    }

    try {
      const response = await api.delete(`/students/${studentId}`);
      
      if (response.data.success) {
        setStudents(students.filter(student => student._id !== studentId));
        loadStats(); // Recarregar estatísticas
      }
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      setError('Erro ao excluir aluno');
    }
  };

  // Filtrar alunos baseado na busca e filtros
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.cpf.includes(searchTerm);
    
    const matchesLevel = !filterLevel || student.nivelNatacao === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  const getNivelBadgeColor = (nivel) => {
    const colors = {
      iniciante: 'bg-gray-100 text-gray-800',
      basico: 'bg-blue-100 text-blue-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-green-100 text-green-800',
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  const getNivelLabel = (nivel) => {
    const labels = {
      iniciante: 'Iniciante',
      basico: 'Básico',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    };
    return labels[nivel] || nivel;
  };

  const calculateAge = (birthDate) => {
    return Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
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
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            Gestão de Alunos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os alunos cadastrados na escola
          </p>
        </div>
        <Button
          onClick={() => navigate('/students/new')}
          className="flex items-center"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos Inativos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Novos este Mês</p>
                <p className="text-2xl font-bold text-purple-600">
                  {students.filter(s => {
                    const created = new Date(s.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os níveis</option>
                <option value="iniciante">Iniciante</option>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
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

      {/* Lista de Alunos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum aluno encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterLevel 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece cadastrando o primeiro aluno'
                    }
                  </p>
                  {!searchTerm && !filterLevel && (
                    <Button onClick={() => navigate('/students/new')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Cadastrar Primeiro Aluno
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.nome}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {calculateAge(student.dataNascimento)} anos
                    </CardDescription>
                  </div>
                  <Badge className={getNivelBadgeColor(student.nivelNatacao)}>
                    {getNivelLabel(student.nivelNatacao)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{student.telefone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {student.endereco.cidade}, {student.endereco.estado}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      student.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-600 capitalize">
                      {student.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Cadastrado em {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/students/${student._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/students/${student._id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteStudent(student._id)}
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
      {filteredStudents.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredStudents.length} de {students.length} alunos
        </div>
      )}
    </div>
  );
};

export default StudentsPage;

