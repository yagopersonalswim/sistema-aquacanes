# Sistema de Gestão de Escola de Natação

## Visão Geral

Sistema web completo para gestão de escola de natação com funcionalidades de inscrição, gestão de turmas, controle de presença, módulo pedagógico, financeiro, contrato digital e dashboard administrativo.

## Arquitetura do Sistema

### Stack Tecnológico

**Backend:**
- Node.js 20.x
- Express.js 4.x
- MongoDB com Mongoose
- JWT para autenticação
- bcrypt para criptografia de senhas
- Multer para upload de arquivos
- PDFKit para geração de PDFs
- Nodemailer para envio de emails

**Frontend:**
- React 18.x
- React Router para roteamento
- Context API para gerenciamento de estado
- Axios para requisições HTTP
- Chart.js para gráficos
- React Hook Form para formulários
- Tailwind CSS para estilização
- React Signature Canvas para assinatura digital

**Banco de Dados:**
- MongoDB (NoSQL)
- Mongoose ODM

### Estrutura de Diretórios

```
escola-natacao/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   ├── uploads/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── docs/
└── database/
    └── seeds/
```

## Modelos de Dados

### Usuários (Users)
```javascript
{
  _id: ObjectId,
  nome: String,
  email: String,
  senha: String (hash),
  tipo: String, // 'admin', 'professor', 'responsavel'
  ativo: Boolean,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Alunos (Students)
```javascript
{
  _id: ObjectId,
  nomeCompleto: String,
  dataNascimento: Date,
  sexo: String,
  cpf: String,
  rg: String,
  endereco: {
    rua: String,
    numero: String,
    bairro: String,
    cidade: String,
    cep: String,
    estado: String
  },
  email: String,
  telefone: String,
  whatsapp: String,
  responsavel: {
    nome: String,
    cpf: String,
    telefone: String,
    email: String
  },
  nivelNatacao: String,
  restricoesMedicas: String,
  consentimentoImagem: Boolean,
  turmaId: ObjectId,
  ativo: Boolean,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Professores (Teachers)
```javascript
{
  _id: ObjectId,
  usuarioId: ObjectId,
  nome: String,
  cpf: String,
  telefone: String,
  email: String,
  especialidades: [String],
  ativo: Boolean,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Turmas (Classes)
```javascript
{
  _id: ObjectId,
  nome: String,
  faixaEtaria: {
    min: Number,
    max: Number
  },
  horarios: [{
    diaSemana: Number, // 0-6 (domingo-sábado)
    horaInicio: String,
    horaFim: String
  }],
  professorId: ObjectId,
  maxAlunos: Number,
  alunosIds: [ObjectId],
  ativa: Boolean,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Presenças (Attendances)
```javascript
{
  _id: ObjectId,
  turmaId: ObjectId,
  alunoId: ObjectId,
  data: Date,
  presente: Boolean,
  justificativa: String,
  observacoes: String,
  criadoEm: Date
}
```

### Avaliações (Evaluations)
```javascript
{
  _id: ObjectId,
  alunoId: ObjectId,
  professorId: ObjectId,
  data: Date,
  habilidades: [{
    nome: String,
    nota: Number,
    observacoes: String
  }],
  observacoesGerais: String,
  videos: [String], // URLs dos vídeos
  criadoEm: Date
}
```

### Planos (Plans)
```javascript
{
  _id: ObjectId,
  nome: String,
  tipo: String, // 'mensal', 'trimestral', 'semestral', 'avulso'
  valor: Number,
  duracao: Number, // em meses
  descricao: String,
  ativo: Boolean,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Pagamentos (Payments)
```javascript
{
  _id: ObjectId,
  alunoId: ObjectId,
  planoId: ObjectId,
  valor: Number,
  dataVencimento: Date,
  dataPagamento: Date,
  status: String, // 'pendente', 'pago', 'vencido'
  metodoPagamento: String,
  transacaoId: String,
  linkPagamento: String,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Contratos (Contracts)
```javascript
{
  _id: ObjectId,
  alunoId: ObjectId,
  responsavelId: ObjectId,
  planoId: ObjectId,
  conteudo: String,
  assinado: Boolean,
  dataAssinatura: Date,
  assinaturaDigital: String, // Base64 da assinatura
  ipAssinatura: String,
  criadoEm: Date
}
```

### Materiais (Materials)
```javascript
{
  _id: ObjectId,
  nome: String,
  tipo: String,
  quantidade: Number,
  quantidadeDisponivel: Number,
  observacoes: String,
  criadoEm: Date,
  atualizadoEm: Date
}
```

### Comunicados (Communications)
```javascript
{
  _id: ObjectId,
  titulo: String,
  conteudo: String,
  tipo: String, // 'geral', 'turma', 'individual'
  destinatarios: [ObjectId],
  remetente: ObjectId,
  lido: Boolean,
  criadoEm: Date
}
```

## Funcionalidades por Perfil

### Administrador
- Acesso completo a todos os módulos
- Dashboard com métricas e gráficos
- Gestão de usuários, professores e alunos
- Controle financeiro completo
- Geração de relatórios
- Configurações do sistema

### Professor
- Visualização de suas turmas
- Controle de presença
- Avaliações pedagógicas
- Upload de vídeos
- Comunicação com responsáveis

### Responsável/Aluno
- Visualização do calendário
- Histórico de presenças
- Boletos e pagamentos
- Histórico pedagógico
- Contrato assinado
- Canal de comunicação

## APIs Principais

### Autenticação
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

### Usuários
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Alunos
- GET /api/students
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id
- GET /api/students/:id/history

### Turmas
- GET /api/classes
- POST /api/classes
- PUT /api/classes/:id
- DELETE /api/classes/:id
- POST /api/classes/:id/students

### Presenças
- GET /api/attendances
- POST /api/attendances
- PUT /api/attendances/:id
- GET /api/attendances/class/:classId
- GET /api/attendances/student/:studentId

### Avaliações
- GET /api/evaluations
- POST /api/evaluations
- PUT /api/evaluations/:id
- GET /api/evaluations/student/:studentId

### Financeiro
- GET /api/payments
- POST /api/payments
- PUT /api/payments/:id
- GET /api/payments/student/:studentId
- POST /api/payments/:id/generate-link

### Contratos
- GET /api/contracts
- POST /api/contracts
- PUT /api/contracts/:id/sign
- GET /api/contracts/student/:studentId

## Segurança

### Autenticação e Autorização
- JWT tokens com expiração
- Refresh tokens para renovação
- Middleware de autorização por perfil
- Validação de entrada em todas as rotas

### Proteção de Dados
- Criptografia de senhas com bcrypt
- Validação e sanitização de dados
- Proteção contra ataques CSRF
- Rate limiting nas APIs
- Logs de auditoria

### LGPD
- Consentimento explícito para uso de dados
- Direito ao esquecimento
- Portabilidade de dados
- Minimização de dados coletados
- Criptografia de dados sensíveis

## Responsividade

### Mobile First
- Design responsivo com breakpoints
- Touch-friendly interfaces
- Navegação otimizada para mobile
- Formulários adaptados para telas pequenas
- Componentes de calendário mobile-friendly

### Acessibilidade
- Contraste adequado de cores
- Navegação por teclado
- Labels descritivos
- Feedback visual e sonoro
- Suporte a leitores de tela

