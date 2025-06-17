import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  CreditCard,
  Activity,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAlunos: 0,
      alunosAtivos: 0,
      totalTurmas: 0,
      turmasAtivas: 0,
      receitaMensal: 0,
      presencaMedia: 0,
      totalContratos: 0,
      contratosAtivos: 0
    },
    charts: {
      receitaMensal: [],
      presencaPorMes: [],
      alunosPorNivel: [],
      pagamentosPorStatus: [],
      evolucaoAlunos: []
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados de diferentes APIs
      const [studentsRes, classesRes, paymentsRes, contractsRes] = await Promise.all([
        api.get('/students/stats'),
        api.get('/classes/stats'),
        api.get('/payments/stats'),
        api.get('/contracts/stats')
      ]);

      // Dados mockados para gráficos (em produção viriam das APIs)
      const mockChartData = {
        receitaMensal: [
          { mes: 'Jan', receita: 42000, meta: 45000 },
          { mes: 'Fev', receita: 38000, meta: 45000 },
          { mes: 'Mar', receita: 47000, meta: 45000 },
          { mes: 'Abr', receita: 51000, meta: 45000 },
          { mes: 'Mai', receita: 49000, meta: 45000 },
          { mes: 'Jun', receita: 53000, meta: 45000 }
        ],
        presencaPorMes: [
          { mes: 'Jan', presenca: 85 },
          { mes: 'Fev', presenca: 88 },
          { mes: 'Mar', presenca: 82 },
          { mes: 'Abr', presenca: 90 },
          { mes: 'Mai', presenca: 87 },
          { mes: 'Jun', presenca: 92 }
        ],
        alunosPorNivel: [
          { nivel: 'Iniciante', quantidade: 45, cor: '#8884d8' },
          { nivel: 'Básico', quantidade: 38, cor: '#82ca9d' },
          { nivel: 'Intermediário', quantidade: 32, cor: '#ffc658' },
          { nivel: 'Avançado', quantidade: 25, cor: '#ff7300' },
          { nivel: 'Competição', quantidade: 16, cor: '#8dd1e1' }
        ],
        pagamentosPorStatus: [
          { status: 'Pago', quantidade: 142, cor: '#10b981' },
          { status: 'Pendente', quantidade: 28, cor: '#f59e0b' },
          { status: 'Vencido', quantidade: 12, cor: '#ef4444' }
        ],
        evolucaoAlunos: [
          { mes: 'Jan', novos: 12, cancelamentos: 3, total: 145 },
          { mes: 'Fev', novos: 8, cancelamentos: 5, total: 148 },
          { mes: 'Mar', novos: 15, cancelamentos: 2, total: 161 },
          { mes: 'Abr', novos: 10, cancelamentos: 4, total: 167 },
          { mes: 'Mai', novos: 18, cancelamentos: 1, total: 184 },
          { mes: 'Jun', novos: 14, cancelamentos: 6, total: 192 }
        ]
      };

      setDashboardData({
        stats: {
          totalAlunos: studentsRes.data?.data?.total || 156,
          alunosAtivos: studentsRes.data?.data?.ativos || 142,
          totalTurmas: classesRes.data?.data?.total || 12,
          turmasAtivas: classesRes.data?.data?.ativas || 10,
          receitaMensal: paymentsRes.data?.data?.receitaMensal || 45600,
          presencaMedia: 87.5,
          totalContratos: contractsRes.data?.data?.total || 89,
          contratosAtivos: contractsRes.data?.data?.ativo || 76
        },
        charts: mockChartData
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'matricula',
      message: 'Nova matrícula: João Silva na turma Infantil A',
      time: '2 horas atrás',
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'pagamento',
      message: 'Pagamento recebido: Maria Santos - R$ 320,00',
      time: '4 horas atrás',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'contrato',
      message: 'Contrato assinado: Pedro Oliveira',
      time: '6 horas atrás',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      id: 4,
      type: 'alerta',
      message: 'Turma Adulto B com baixa frequência (65%)',
      time: '1 dia atrás',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
  ];

  const quickActions = [
    {
      title: 'Nova Matrícula',
      description: 'Cadastrar novo aluno',
      icon: Users,
      href: '/students/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Criar Turma',
      description: 'Configurar nova turma',
      icon: GraduationCap,
      href: '/classes/new',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Calendário',
      description: 'Ver aulas do dia',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Financeiro',
      description: 'Gestão financeira',
      icon: DollarSign,
      href: '/financial',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserTypeLabel = (tipo) => {
    const labels = {
      admin: 'Administrador',
      professor: 'Professor',
      responsavel: 'Responsável',
    };
    return labels[tipo] || tipo;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.nome}!
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao painel {getUserTypeLabel(user?.tipo)}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Estatísticas principais */}
      {(user?.tipo === 'admin' || user?.tipo === 'professor') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalAlunos}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.stats.alunosAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.turmasAtivas}</div>
              <p className="text-xs text-muted-foreground">
                de {dashboardData.stats.totalTurmas} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.stats.receitaMensal)}
              </div>
              <p className="text-xs text-green-600">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.contratosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                de {dashboardData.stats.totalContratos} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {(user?.tipo === 'admin') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Receita Mensal
              </CardTitle>
              <CardDescription>
                Evolução da receita vs meta mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.charts.receitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Receita"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="meta" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Meta"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Presença por Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Presença Média
              </CardTitle>
              <CardDescription>
                Percentual de presença por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.charts.presencaPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[70, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="presenca" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    name="Presença"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Alunos por Nível */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Distribuição por Nível
              </CardTitle>
              <CardDescription>
                Quantidade de alunos por nível de natação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.charts.alunosPorNivel}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nivel, quantidade }) => `${nivel}: ${quantidade}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {dashboardData.charts.alunosPorNivel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução de Alunos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Evolução de Alunos
              </CardTitle>
              <CardDescription>
                Novos alunos vs cancelamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.charts.evolucaoAlunos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="novos" fill="#10b981" name="Novos" />
                  <Bar dataKey="cancelamentos" fill="#ef4444" name="Cancelamentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ações rápidas */}
        {(user?.tipo === 'admin' || user?.tipo === 'professor') && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color} text-white border-none`}
                      onClick={() => window.location.href = action.href}
                    >
                      <action.icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Atividades recentes */}
        <div className={user?.tipo === 'responsavel' ? 'lg:col-span-3' : ''}>
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas atualizações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção específica para responsáveis */}
      {user?.tipo === 'responsavel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Filhos</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos seus filhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Ana Silva</p>
                    <p className="text-sm text-gray-600">Turma Infantil A - Nível Básico</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Pedro Silva</p>
                    <p className="text-sm text-gray-600">Turma Juvenil B - Nível Intermediário</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas</CardTitle>
              <CardDescription>
                Horários das próximas aulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div>
                    <p className="font-medium">Ana Silva</p>
                    <p className="text-sm text-gray-600">Hoje, 16:00 - 17:00</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
                  <div>
                    <p className="font-medium">Pedro Silva</p>
                    <p className="text-sm text-gray-600">Amanhã, 18:00 - 19:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

