const seedUsers = require('./users');

const runSeeds = async () => {
  console.log('🌱 Iniciando seeds do banco de dados...');
  
  try {
    // Executar seed de usuários
    await seedUsers();
    
    console.log('🎉 Todos os seeds foram executados com sucesso!');
    console.log('\n📋 Usuários criados:');
    console.log('   Admin: admin@aquavida.com.br / Admin123!');
    console.log('   Professor: professor@aquavida.com.br / Prof123!');
    console.log('   Responsável: responsavel@aquavida.com.br / Resp123!');
    
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
  
  process.exit(0);
};

// Executar seeds
runSeeds();

