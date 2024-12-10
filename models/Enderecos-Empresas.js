const Sequelize = require('sequelize');
const db = require('./db');

const EnderecosEmpresas = db.define('enderecosempresas', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    rua: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    cep: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    bairro: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    cidade: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    numero: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    complemento: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

//CRIAR A TABELA
EnderecosEmpresas.sync();
//EnderecosEmpresas.sync({ force: true });

module.exports = EnderecosEmpresas;