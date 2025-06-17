# Configuração do Ambiente

## Variáveis de Ambiente

### Backend (.env)
```
# Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/escola_natacao

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_token_muito_forte_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Pagamentos
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
PAGSEGURO_EMAIL=seu_email_pagseguro
PAGSEGURO_TOKEN=seu_token_pagseguro

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000/uploads
```

## Dependências

### Backend (package.json)
```json
{
  "name": "escola-natacao-backend",
  "version": "1.0.0",
  "description": "Backend para sistema de gestão de escola de natação",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node database/seeds/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.13.0",
    "nodemailer": "^6.9.4",
    "joi": "^17.9.2",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "moment": "^2.29.4",
    "mercadopago": "^1.5.17"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend (package.json)
```json
{
  "name": "escola-natacao-frontend",
  "version": "1.0.0",
  "description": "Frontend para sistema de gestão de escola de natação",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.45.4",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "react-signature-canvas": "^1.0.6",
    "react-datepicker": "^4.16.0",
    "react-select": "^5.7.4",
    "react-toastify": "^9.1.3",
    "moment": "^2.29.4",
    "tailwindcss": "^3.3.3",
    "lucide-react": "^0.263.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

## Estrutura de Pastas Detalhada

### Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── classController.js
│   │   ├── attendanceController.js
│   │   ├── evaluationController.js
│   │   ├── paymentController.js
│   │   ├── contractController.js
│   │   ├── materialController.js
│   │   ├── communicationController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Class.js
│   │   ├── Attendance.js
│   │   ├── Evaluation.js
│   │   ├── Plan.js
│   │   ├── Payment.js
│   │   ├── Contract.js
│   │   ├── Material.js
│   │   └── Communication.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── classes.js
│   │   ├── attendances.js
│   │   ├── evaluations.js
│   │   ├── payments.js
│   │   ├── contracts.js
│   │   ├── materials.js
│   │   ├── communications.js
│   │   └── dashboard.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   ├── pdfService.js
│   │   └── uploadService.js
│   └── utils/
│       ├── validators.js
│       ├── helpers.js
│       └── constants.js
├── uploads/
│   ├── avatars/
│   ├── videos/
│   ├── contracts/
│   └── receipts/
├── database/
│   └── seeds/
│       ├── index.js
│       ├── users.js
│       ├── plans.js
│       └── materials.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Footer.js
│   │   │   ├── Loading.js
│   │   │   ├── Modal.js
│   │   │   └── ConfirmDialog.js
│   │   ├── forms/
│   │   │   ├── FormField.js
│   │   │   ├── FormSelect.js
│   │   │   ├── FormDatePicker.js
│   │   │   └── FormSignature.js
│   │   ├── tables/
│   │   │   ├── DataTable.js
│   │   │   ├── Pagination.js
│   │   │   └── TableFilters.js
│   │   ├── charts/
│   │   │   ├── LineChart.js
│   │   │   ├── BarChart.js
│   │   │   ├── PieChart.js
│   │   │   └── DashboardCard.js
│   │   └── calendar/
│   │       ├── Calendar.js
│   │       ├── CalendarEvent.js
│   │       └── CalendarFilters.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── ForgotPassword.js
│   │   ├── dashboard/
│   │   │   └── Dashboard.js
│   │   ├── students/
│   │   │   ├── StudentList.js
│   │   │   ├── StudentForm.js
│   │   │   ├── StudentDetail.js
│   │   │   └── StudentEnrollment.js
│   │   ├── classes/
│   │   │   ├── ClassList.js
│   │   │   ├── ClassForm.js
│   │   │   └── ClassDetail.js
│   │   ├── attendance/
│   │   │   ├── AttendanceList.js
│   │   │   ├── AttendanceForm.js
│   │   │   └── AttendanceReport.js
│   │   ├── evaluations/
│   │   │   ├── EvaluationList.js
│   │   │   ├── EvaluationForm.js
│   │   │   └── EvaluationDetail.js
│   │   ├── financial/
│   │   │   ├── PaymentList.js
│   │   │   ├── PaymentDetail.js
│   │   │   └── FinancialReport.js
│   │   ├── contracts/
│   │   │   ├── ContractList.js
│   │   │   ├── ContractForm.js
│   │   │   └── ContractSign.js
│   │   └── profile/
│   │       └── Profile.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── NotificationContext.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── classService.js
│   │   ├── attendanceService.js
│   │   ├── evaluationService.js
│   │   ├── paymentService.js
│   │   └── contractService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── .env
├── .gitignore
├── package.json
└── tailwind.config.js
```

## Comandos de Instalação

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env com suas configurações
npm start
```

### Banco de Dados
```bash
# Instalar MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# Iniciar MongoDB
sudo systemctl start mongodb

# Executar seeds
cd backend
npm run seed
```

