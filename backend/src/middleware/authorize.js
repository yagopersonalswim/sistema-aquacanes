// Middleware para autorização baseada em perfis
const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Usuário não autenticado.'
      });
    }

    // Verificar se o tipo do usuário está na lista de roles permitidos
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Perfil '${req.user.tipo}' não tem permissão para esta ação.`,
        requiredRoles: roles,
        userRole: req.user.tipo
      });
    }

    next();
  };
};

// Middleware específico para administradores
const adminOnly = authorize('admin');

// Middleware específico para professores e administradores
const professorOrAdmin = authorize('professor', 'admin');

// Middleware específico para responsáveis, professores e administradores
const responsavelOrProfessorOrAdmin = authorize('responsavel', 'professor', 'admin');

// Middleware para verificar se o usuário pode acessar dados de um aluno específico
const canAccessStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const user = req.user;

    // Administradores e professores podem acessar qualquer aluno
    if (user.tipo === 'admin' || user.tipo === 'professor') {
      return next();
    }

    // Responsáveis só podem acessar seus próprios alunos
    if (user.tipo === 'responsavel') {
      // Aqui seria necessário verificar se o usuário é responsável pelo aluno
      // Por enquanto, vamos permitir (será implementado quando tivermos o modelo Student)
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você não tem permissão para acessar este aluno.'
    });

  } catch (error) {
    console.error('Erro no middleware canAccessStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário pode acessar dados de uma turma específica
const canAccessClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const user = req.user;

    // Administradores podem acessar qualquer turma
    if (user.tipo === 'admin') {
      return next();
    }

    // Professores só podem acessar suas próprias turmas
    if (user.tipo === 'professor') {
      // Aqui seria necessário verificar se o professor é responsável pela turma
      // Por enquanto, vamos permitir (será implementado quando tivermos o modelo Class)
      return next();
    }

    // Responsáveis só podem acessar turmas onde seus alunos estão matriculados
    if (user.tipo === 'responsavel') {
      // Aqui seria necessário verificar se algum aluno do responsável está na turma
      // Por enquanto, vamos permitir (será implementado quando tivermos os modelos)
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você não tem permissão para acessar esta turma.'
    });

  } catch (error) {
    console.error('Erro no middleware canAccessClass:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário pode modificar dados de outro usuário
const canModifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    // Administradores podem modificar qualquer usuário
    if (user.tipo === 'admin') {
      return next();
    }

    // Usuários só podem modificar seus próprios dados
    if (user._id.toString() === userId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode modificar seus próprios dados.'
    });

  } catch (error) {
    console.error('Erro no middleware canModifyUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar permissões de relatórios
const canAccessReports = authorize('admin', 'professor');

// Middleware para verificar permissões financeiras
const canAccessFinancial = authorize('admin');

// Middleware para verificar permissões de configuração
const canAccessSettings = authorize('admin');

module.exports = {
  authorize,
  adminOnly,
  professorOrAdmin,
  responsavelOrProfessorOrAdmin,
  canAccessStudent,
  canAccessClass,
  canModifyUser,
  canAccessReports,
  canAccessFinancial,
  canAccessSettings
};

