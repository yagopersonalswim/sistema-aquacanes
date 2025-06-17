import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { 
  Waves,
  Home,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Navegação baseada no tipo de usuário
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];
    if (user?.tipo === 'admin') {
      return [
        ...baseItems,
        { name: 'Alunos', href: '/students', icon: Users },
        { name: 'Professores', href: '/teachers', icon: GraduationCap },
        { name: 'Turmas', href: '/classes', icon: BookOpen },
        { name: 'Calendário', href: '/calendar', icon: Calendar },
        { name: 'Pedagógico', href: '/pedagogical', icon: BookOpen },
        { name: 'Financeiro', href: '/financial', icon: DollarSign },
        { name: 'Contratos', href: '/contracts', icon: FileText },
        { name: 'Relatórios', href: '/reports', icon: BarChart },
        { name: 'Configurações', href: '/settings', icon: Settings },
      ];
    }

    if (user?.tipo === 'professor') {
      return [
        ...baseItems,
        { name: 'Minhas Turmas', href: '/my-classes', icon: GraduationCap },
        { name: 'Alunos', href: '/students', icon: Users },
        { name: 'Calendário', href: '/calendar', icon: Calendar },
        { name: 'Avaliações', href: '/evaluations', icon: BookOpen },
        { name: 'Presença', href: '/attendance', icon: Calendar },
      ];
    }

    if (user?.tipo === 'responsavel') {
      return [
        ...baseItems,
        { name: 'Meus Filhos', href: '/my-children', icon: Users },
        { name: 'Horários', href: '/schedule', icon: Calendar },
        { name: 'Financeiro', href: '/payments', icon: DollarSign },
        { name: 'Contratos', href: '/contracts', icon: FileText },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AquaVida</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`
                  w-full justify-start text-left
                  ${isActive(item.href) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </div>
        </nav>

        {/* User info e logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.tipo}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {navigationItems.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Perfil do usuário */}
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.tipo}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

