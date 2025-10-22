const Sequelize = require("sequelize");
const db = require("./db");

const LogsPagamentos = db.define("LogsPagamentos", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  referenciaId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  statusAnterior: {
    type: Sequelize.STRING,
    allowNull: true
  },
  statusNovo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  mensagem: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  dataHora: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: "logs_pagamentos",
  timestamps: false
});

//LogsPagamentos.sync({force:true});
LogsPagamentos.sync();

module.exports = LogsPagamentos;