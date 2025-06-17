import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

// Páginas placeholder que serão implementadas nas próximas fases
import StudentsPage from './pages/StudentsPage';
import StudentRegistration from './pages/StudentRegistration';
import ClassesPage from './pages/ClassesPage';
import CalendarPage from './pages/CalendarPage';
import AttendancePage from './pages/AttendancePage';
import EvaluationsPage from './pages/EvaluationsPage';
import FinancialPage from './pages/FinancialPage';

const TeachersPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Gestão de Professores</h1>
    <p className="text-gray-600">Módulo de professores em desenvolvimento...</p>
  </div>
);

const PedagogicalPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Módulo Pedagógico</h1>
    <p className="text-gray-600">Módulo pedagógico em desenvolvimento...</p>
  </div>
);

const FinancialPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Gestão Financeira</h1>
    <p className="text-gray-600">Módulo financeiro em desenvolvimento...</p>
  </div>
);

const ContractsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Contratos Digitais</h1>
    <p className="text-gray-600">Módulo de contratos em desenvolvimento...</p>
  </div>
);

const ReportsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Relatórios e Analytics</h1>
    <p className="text-gray-600">Módulo de relatórios em desenvolvimento...</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Configurações</h1>
    <p className="text-gray-600">Módulo de configurações em desenvolvimento...</p>
  </div>
);

// Páginas específicas para professores
const MyClassesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Minhas Turmas</h1>
    <p className="text-gray-600">Visualização das turmas do professor...</p>
  </div>
);

const EvaluationsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Avaliações</h1>
    <p className="text-gray-600">Módulo de avaliações em desenvolvimento...</p>
  </div>
);

const AttendancePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Controle de Presença</h1>
    <p className="text-gray-600">Módulo de presença em desenvolvimento...</p>
  </div>
);

// Páginas específicas para responsáveis
const MyChildrenPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Meus Filhos</h1>
    <p className="text-gray-600">Acompanhamento dos filhos em desenvolvimento...</p>
  </div>
);

const PaymentsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Pagamentos</h1>
    <p className="text-gray-600">Módulo de pagamentos em desenvolvimento...</p>
  </div>
);

// Página 404
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Página não encontrada</p>
      <button 
        onClick={() => window.history.back()}
        className="text-blue-600 hover:text-blue-500"
      >
        Voltar
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas com layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Redirecionar / para /dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard - acessível para todos */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Rotas para Admin */}
              <Route path="students" element={
                <ProtectedRoute allowedRoles={['admin', 'professor']}>
                  <StudentsPage />
                </ProtectedRoute>
              } />
              
              <Route path="students/new" element={
                <ProtectedRoute allowedRoles={['admin', 'professor']}>
                  <StudentRegistration />
                </ProtectedRoute>
              } />
              
              <Route path="teachers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeachersPage />
                </ProtectedRoute>
              } />
              
              <Route path="classes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ClassesPage />
                </ProtectedRoute>
              } />
              
              <Route path="calendar" element={
                <ProtectedRoute allowedRoles={['admin', 'professor']}>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              
              <Route path="lessons/:lessonId/attendance" element={
                <ProtectedRoute allowedRoles={['admin', 'professor']}>
                  <AttendancePage />
                </ProtectedRoute>
              } />
              
              <Route path="evaluations" element={
                <ProtectedRoute allowedRoles={['admin', 'professor']}>
                  <EvaluationsPage />
                </ProtectedRoute>
              } />
              
              <Route path="financial" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FinancialPage />
                </ProtectedRoute>
              } />
              
              <Route path="schedule" element={<SchedulePage />} />
              
              <Route path="pedagogical" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PedagogicalPage />
                </ProtectedRoute>
              } />
              
              <Route path="financial" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FinancialPage />
                </ProtectedRoute>
              } />
              
              <Route path="contracts" element={<ContractsPage />} />
              
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Rotas específicas para professores */}
              <Route path="my-classes" element={
                <ProtectedRoute allowedRoles={['professor']}>
                  <MyClassesPage />
                </ProtectedRoute>
              } />
              
              <Route path="evaluations" element={
                <ProtectedRoute allowedRoles={['professor']}>
                  <EvaluationsPage />
                </ProtectedRoute>
              } />
              
              <Route path="attendance" element={
                <ProtectedRoute allowedRoles={['professor']}>
                  <AttendancePage />
                </ProtectedRoute>
              } />
              
              {/* Rotas específicas para responsáveis */}
              <Route path="my-children" element={
                <ProtectedRoute allowedRoles={['responsavel']}>
                  <MyChildrenPage />
                </ProtectedRoute>
              } />
              
              <Route path="payments" element={
                <ProtectedRoute allowedRoles={['responsavel']}>
                  <PaymentsPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

