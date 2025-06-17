# 🏊‍♀️ Sistema de Gestão de Escola de Natação AquaVida

## 📋 Visão Geral

O **AquaVida** é um sistema completo e profissional para gestão de escolas de natação, desenvolvido com tecnologias modernas e arquitetura escalável. O sistema oferece uma solução integrada para administração, professores e responsáveis, com funcionalidades abrangentes para todos os aspectos da gestão escolar.

## 🎯 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login seguro com JWT e bcrypt
- Três perfis de usuário: Administrador, Professor e Responsável
- Sistema de refresh tokens
- Controle de tentativas de login
- Recuperação de senha por email

### 👥 Gestão de Alunos
- Formulário completo de inscrição
- Dados pessoais, responsável e contato de emergência
- Informações médicas e restrições
- Histórico de natação e experiência
- Controle de documentos e anexos
- Estatísticas e relatórios

### 🏫 Gestão de Turmas
- Criação e configuração de turmas
- Controle de horários e professores
- Gestão de vagas e lista de espera
- Alocação automática e manual de alunos
- Estatísticas de ocupação

### 📅 Calendário e Presença
- Calendário mensal interativo
- Agendamento de aulas
- Controle individual de presença
- Histórico de frequência
- Relatórios de presença por período
- Justificativas e observações

### 📚 Módulo Pedagógico
- Sistema completo de avaliações
- Avaliação por habilidades técnicas
- Controle de evolução por estilo de natação
- Aspectos comportamentais
- Relatórios de desenvolvimento
- Histórico pedagógico completo

### 💰 Módulo Financeiro
- Gestão completa de pagamentos
- Múltiplos métodos de pagamento
- Controle de inadimplência
- Cálculo automático de juros e multas
- Relatórios financeiros
- Dashboard com métricas

### 📋 Contratos Digitais
- Contratos com assinatura eletrônica
- Verificação de integridade
- Controle de vigência
- Renovação automática
- Histórico de alterações
- Conformidade com LGPD

### 📊 Dashboard Administrativo
- Gráficos interativos com Recharts
- Métricas em tempo real
- Estatísticas por módulo
- Ações rápidas
- Visão geral do negócio

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Proteção contra ataques

### Frontend
- **React** - Biblioteca JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Recharts** - Gráficos interativos
- **React Hook Form** - Formulários
- **Zod** - Validação de dados
- **Axios** - Cliente HTTP
- **Lucide Icons** - Ícones modernos

### Segurança
- **Express Rate Limit** - Rate limiting
- **Express Slow Down** - Speed limiting
- **XSS Protection** - Proteção contra XSS
- **Content Security Policy** - CSP
- **Input Sanitization** - Sanitização de dados

## 📁 Estrutura do Projeto

```
escola-natacao/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações (DB, etc.)
│   │   ├── controllers/    # Controladores das rotas
│   │   ├── middleware/     # Middlewares (auth, security)
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Definição das rotas
│   │   ├── services/       # Serviços e lógica de negócio
│   │   └── utils/          # Utilitários
│   ├── uploads/            # Arquivos enviados
│   ├── database/           # Seeds e migrações
│   ├── .env               # Variáveis de ambiente
│   ├── server.js          # Arquivo principal
│   └── package.json       # Dependências
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── lib/          # Configurações e utilitários
│   │   ├── pages/        # Páginas da aplicação
│   │   └── App.jsx       # Componente principal
│   ├── public/           # Arquivos estáticos
│   ├── .env             # Variáveis de ambiente
│   └── package.json     # Dependências
└── docs/                # Documentação
    ├── arquitetura.md   # Arquitetura do sistema
    ├── configuracao.md  # Guia de configuração
    └── contrato-template.md # Template de contrato
```

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- MongoDB 5+
- npm ou pnpm

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd escola-natacao
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Criar arquivo .env
cp .env.example .env
```

### 3. Configurar Variáveis de Ambiente (Backend)
```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/escola_natacao

# JWT
JWT_SECRET=sua_chave_secreta_super_forte_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_secreta_aqui
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Configurar Frontend
```bash
cd ../frontend
npm install

# Criar arquivo .env
cp .env.example .env
```

### 5. Configurar Variáveis de Ambiente (Frontend)
```env
# URL da API do backend
VITE_API_URL=http://localhost:5000/api

# Outras configurações
VITE_APP_NAME=AquaVida
VITE_APP_VERSION=1.0.0
```

### 6. Inicializar Banco de Dados
```bash
cd ../backend

# Executar seeds (criar usuários iniciais)
npm run seed
```

### 7. Executar o Sistema

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 👤 Usuários Padrão

Após executar os seeds, os seguintes usuários estarão disponíveis:

### Administrador
- **Email:** admin@aquavida.com.br
- **Senha:** Admin123!
- **Perfil:** Administrador completo

### Professor
- **Email:** professor@aquavida.com.br
- **Senha:** Prof123!
- **Perfil:** Professor

### Responsável
- **Email:** responsavel@aquavida.com.br
- **Senha:** Resp123!
- **Perfil:** Responsável/Aluno

## 🚀 Deploy em Produção

### Preparação
1. Configure variáveis de ambiente para produção
2. Configure MongoDB Atlas ou servidor MongoDB
3. Configure domínio e SSL
4. Configure email SMTP
5. Configure gateway de pagamento

### Backend (Node.js)
```bash
# Build para produção
npm run build

# Executar em produção
npm start
```

### Frontend (React)
```bash
# Build para produção
npm run build

# Servir arquivos estáticos
npm run preview
```

## 📱 Uso do Sistema

### Para Administradores
1. **Dashboard**: Visão geral com métricas e gráficos
2. **Alunos**: Gerenciar inscrições e dados dos alunos
3. **Turmas**: Criar e gerenciar turmas e horários
4. **Professores**: Cadastrar e gerenciar professores
5. **Calendário**: Visualizar e gerenciar aulas
6. **Financeiro**: Controlar pagamentos e inadimplência
7. **Contratos**: Gerenciar contratos digitais
8. **Relatórios**: Gerar relatórios diversos

### Para Professores
1. **Dashboard**: Visão das suas turmas e aulas
2. **Calendário**: Suas aulas agendadas
3. **Presença**: Marcar presença dos alunos
4. **Avaliações**: Avaliar desenvolvimento dos alunos
5. **Turmas**: Visualizar alunos das suas turmas

### Para Responsáveis
1. **Dashboard**: Informações do(s) filho(s)
2. **Calendário**: Aulas do(s) filho(s)
3. **Presença**: Histórico de frequência
4. **Avaliações**: Desenvolvimento pedagógico
5. **Financeiro**: Situação de pagamentos
6. **Contratos**: Visualizar contratos

## 🔧 Manutenção

### Backup do Banco de Dados
```bash
mongodump --db escola_natacao --out backup/
```

### Restaurar Backup
```bash
mongorestore --db escola_natacao backup/escola_natacao/
```

### Logs
- Backend: Logs no console e arquivo (se configurado)
- Frontend: Logs no console do navegador
- MongoDB: Logs do sistema

### Monitoramento
- API Health: `GET /api/health`
- Status do sistema via dashboard
- Métricas de performance

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

#### Backend não inicia
- Verificar se MongoDB está rodando
- Verificar variáveis de ambiente
- Verificar se a porta 5000 está livre

#### Frontend não conecta com Backend
- Verificar URL da API no .env
- Verificar CORS no backend
- Verificar se backend está rodando

#### Erro de autenticação
- Verificar JWT_SECRET no .env
- Limpar localStorage do navegador
- Verificar se usuário existe no banco

### Logs de Debug
```bash
# Backend com logs detalhados
DEBUG=* npm run dev

# Frontend com logs
npm run dev -- --debug
```

## 📞 Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:

- **Documentação**: Consulte os arquivos em `/docs`
- **Issues**: Reporte problemas no repositório
- **Email**: suporte@aquavida.com.br

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para escolas de natação**

Sistema AquaVida - Gestão Completa para Escolas de Natação
Versão 1.0.0 - 2025

