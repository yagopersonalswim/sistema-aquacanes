import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Save,
  ArrowLeft,
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { api } from '../lib/api';

const AttendancePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [observations, setObservations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lessons/${lessonId}`);
      
      if (response.data.success) {
        const lessonData = response.data.data.lesson;
        setLesson(lessonData);
        
        // Inicializar estado de presença
        const initialAttendance = {};
        const initialObservations = {};
        
        lessonData.listaPresenca.forEach(item => {
          initialAttendance[item.aluno._id] = item.status;
          initialObservations[item.aluno._id] = item.observacoes || '';
        });
        
        setAttendance(initialAttendance);
        setObservations(initialObservations);
      }
    } catch (error) {
      console.error('Erro ao carregar aula:', error);
      setError('Erro ao carregar dados da aula');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleObservationChange = (studentId, observation) => {
    setObservations(prev => ({
      ...prev,
      [studentId]: observation
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Preparar dados para envio
      const presencas = Object.keys(attendance).map(studentId => ({
        alunoId: studentId,
        status: attendance[studentId],
        observacoes: observations[studentId] || ''
      }));

      const response = await api.post(`/lessons/${lessonId}/attendance`, {
        presencas
      });

      if (response.data.success) {
        setSuccess('Presença salva com sucesso!');
        setTimeout(() => {
          navigate('/calendar');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao salvar presença:', error);
      setError('Erro ao salvar presença. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      presente: 'bg-green-100 text-green-800 border-green-300',
      falta: 'bg-red-100 text-red-800 border-red-300',
      falta_justificada: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      atestado: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      presente: 'Presente',
      falta: 'Falta',
      falta_justificada: 'Falta Justificada',
      atestado: 'Atestado'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      presente: <CheckCircle className="h-4 w-4" />,
      falta: <XCircle className="h-4 w-4" />,
      falta_justificada: <AlertCircle className="h-4 w-4" />,
      atestado: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <User className="h-4 w-4" />;
  };

  const calculateStats = () => {
    const total = Object.keys(attendance).length;
    const presente = Object.values(attendance).filter(status => status === 'presente').length;
    const falta = Object.values(attendance).filter(status => status === 'falta').length;
    const faltaJustificada = Object.values(attendance).filter(status => status === 'falta_justificada').length;
    const atestado = Object.values(attendance).filter(status => status === 'atestado').length;
    
    return {
      total,
      presente,
      falta,
      faltaJustificada,
      atestado,
      percentualPresenca: total > 0 ? Math.round((presente / total) * 100) : 0
    };
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

  if (!lesson) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Aula não encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/calendar')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-blue-600" />
                Controle de Presença
              </h1>
              <p className="text-gray-600 mt-1">
                {lesson.titulo} - {lesson.turma?.nome}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={saveAttendance}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Presença
            </>
          )}
        </Button>
      </div>

      {/* Informações da Aula */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-medium">
                  {new Date(lesson.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Horário</p>
                <p className="font-medium">{lesson.horaInicio} - {lesson.horaFim}</p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Professor</p>
                <p className="font-medium">{lesson.professor?.nome}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Turma</p>
                <p className="font-medium">{lesson.turma?.nome}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total de Alunos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.presente}</p>
              <p className="text-sm text-gray-600">Presentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.falta}</p>
              <p className="text-sm text-gray-600">Faltas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.faltaJustificada}</p>
              <p className="text-sm text-gray-600">Justificadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.percentualPresenca}%</p>
              <p className="text-sm text-gray-600">Frequência</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagens */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Presença</CardTitle>
          <CardDescription>
            Marque a presença de cada aluno e adicione observações se necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lesson.listaPresenca.map((item) => (
              <div key={item.aluno._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{item.aluno.nome}</h4>
                    <p className="text-sm text-gray-600">ID: {item.aluno._id}</p>
                  </div>
                  
                  {/* Botões de Status */}
                  <div className="flex space-x-2">
                    {['presente', 'falta', 'falta_justificada', 'atestado'].map((status) => (
                      <Button
                        key={status}
                        variant={attendance[item.aluno._id] === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAttendanceChange(item.aluno._id, status)}
                        className={attendance[item.aluno._id] === status ? getStatusColor(status) : ''}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1 hidden sm:inline">
                          {getStatusLabel(status)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Atual */}
                <div className="mt-3">
                  <Badge className={getStatusColor(attendance[item.aluno._id])}>
                    {getStatusIcon(attendance[item.aluno._id])}
                    <span className="ml-1">
                      {getStatusLabel(attendance[item.aluno._id])}
                    </span>
                  </Badge>
                </div>

                {/* Campo de Observações */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Observações
                  </label>
                  <Textarea
                    placeholder="Adicione observações sobre o aluno nesta aula..."
                    value={observations[item.aluno._id] || ''}
                    onChange={(e) => handleObservationChange(item.aluno._id, e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar (fixo no bottom em mobile) */}
      <div className="sticky bottom-4 flex justify-center md:hidden">
        <Button
          onClick={saveAttendance}
          disabled={saving}
          className="min-w-[200px] shadow-lg"
          size="lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Presença
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AttendancePage;

