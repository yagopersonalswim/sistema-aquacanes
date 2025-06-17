const mongoose = require('mongoose');
const User = require('../../src/models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Conectar ao banco de dados
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🗄️  Conectado ao MongoDB para seed');

    // Limpar usuários existentes
    await User.deleteMany({});
    console.log('🧹 Usuários existentes removidos');

    // Criar usuário administrador
    const adminUser = await User.create({
      nome: 'Administrador',
      email: 'admin@aquavida.com.br',
      senha: 'Admin123!',
      tipo: 'admin'
    });

    console.log('👤 Usuário administrador criado:', adminUser.email);

    // Criar usuário professor
    const professorUser = await User.create({
      nome: 'Professor João',
      email: 'professor@aquavida.com.br',
      senha: 'Prof123!',
      tipo: 'professor'
    });

    console.log('👨‍🏫 Usuário professor criado:', professorUser.email);

    // Criar usuário responsável
    const responsavelUser = await User.create({
      nome: 'Maria Silva',
      email: 'responsavel@aquavida.com.br',
      senha: 'Resp123!',
      tipo: 'responsavel'
    });

    console.log('👩‍👧‍👦 Usuário responsável criado:', responsavelUser.email);

    console.log('✅ Seed de usuários concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no seed de usuários:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão com MongoDB fechada');
  }
};

module.exports = seedUsers;

// Executar se chamado diretamente
if (require.main === module) {
  seedUsers();
}

