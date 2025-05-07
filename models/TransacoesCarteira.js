const Sequelize = require("sequelize");
const db = require("./db");

const TransacoesCarteira = db.define('transacoesCarteira', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  tipo: {
    type: Sequelize.STRING, // Crédito ou Débito
    allowNull: false
  },
  valor: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  saldoAnterior: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  saldoAtual: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  }
});

// CRIAR TABELA
//TransacoesCarteira.sync({ force: true });
TransacoesCarteira.sync();
module.exports = TransacoesCarteira;