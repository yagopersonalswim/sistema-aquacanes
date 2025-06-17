import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { api } from '../lib/api';

const CalendarPage = () => {
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLessons, setSelectedLessons] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const mes = currentDate.getMonth() + 1;
      const ano = currentDate.getFullYear();
      
      const response = await api.get(`/lessons/calendar?mes=${mes}&ano=${ano}`);
      
      if (response.data.success) {
        setCalendar(response.data.data.calendario);
      }
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
      setError('Erro ao carregar calendário');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      agendada: <Clock className="h-4 w-4 text-blue-600" />,
      em_andamento: <Play className="h-4 w-4 text-green-600" />,
      concluida: <CheckCircle className="h-4 w-4 text-green-600" />,
      cancelada: <XCircle className="h-4 w-4 text-red-600" />,
      adiada: <AlertCircle className="h-4 w-4 text-yellow-600" />
    };
    return icons[status] || <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      agendada: 'bg-blue-100 text-blue-800',
      em_andamento: 'bg-green-100 text-green-800',
      concluida: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      adiada: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendada: 'Agendada',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
      adiada: 'Adiada'
    };
    return labels[status] || status;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedLessons([]);
  };

  const selectDate = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedLessons(calendar[dateKey] || []);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior para completar a primeira semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        dateKey: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Dias do mês atual
    const today = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date: day,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === today
      });
    }

    // Dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        dateKey: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
            <CalendarIcon className="mr-3 h-8 w-8 text-blue-600" />
            Calendário de Aulas
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todas as aulas agendadas
          </p>
        </div>
        <Button
          onClick={() => navigate('/lessons/new')}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => {
                  const hasLessons = calendar[day.dateKey]?.length > 0;
                  const isSelected = selectedDate === day.dateKey;

                  return (
                    <div
                      key={index}
                      className={`
                        relative p-2 min-h-[80px] border rounded cursor-pointer transition-colors
                        ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                        ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                        ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                      `}
                      onClick={() => selectDate(day.dateKey)}
                    >
                      <div className="text-sm font-medium">{day.date}</div>
                      
                      {hasLessons && (
                        <div className="mt-1 space-y-1">
                          {calendar[day.dateKey].slice(0, 2).map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className={`text-xs px-1 py-0.5 rounded truncate ${getStatusBadgeColor(lesson.status)}`}
                            >
                              {lesson.horaInicio} - {lesson.turma?.nome}
                            </div>
                          ))}
                          {calendar[day.dateKey].length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{calendar[day.dateKey].length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do dia selecionado */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? (
                  `Aulas de ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
                ) : (
                  'Selecione uma data'
                )}
              </CardTitle>
              <CardDescription>
                {selectedLessons.length > 0 ? (
                  `${selectedLessons.length} aula(s) agendada(s)`
                ) : (
                  'Nenhuma aula agendada'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedLessons.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedDate ? 'Nenhuma aula neste dia' : 'Selecione uma data no calendário'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedLessons.map((lesson) => (
                    <div key={lesson._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.titulo}</h4>
                          <p className="text-sm text-gray-600">{lesson.turma?.nome}</p>
                        </div>
                        <Badge className={getStatusBadgeColor(lesson.status)}>
                          {getStatusLabel(lesson.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {lesson.horaInicio} - {lesson.horaFim}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {lesson.professor?.nome}
                        </div>
                        {lesson.estatisticas && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {lesson.estatisticas.presentes}/{lesson.estatisticas.totalAlunos} presentes
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/lessons/${lesson._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/lessons/${lesson._id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {lesson.status === 'agendada' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/lessons/${lesson._id}/attendance`)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Presença
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

