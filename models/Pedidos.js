const Sequelize = require('sequelize');
const db = require('./db');
const ItensPedidos = require('./ItensPedido');
const Enderecos = require('./Enderecos');

const Pedidos = db.define('pedidos', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    idUserPed: {
        type: Sequelize.INTEGER,
    },
    nomePed: {
        type : Sequelize.STRING(255),
        allowNull:true
    },
    quantPed: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    valorPed: {
        type: Sequelize.FLOAT, // Use FLOAT para valores decimais
        allowNull: false,
    },
    statusPed: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    metodPag: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    idTransacao: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    raio: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    graficaAtend: {
        type: Sequelize.STRING(255),
    },
    graficaCancl: {
        type: Sequelize.STRING(255),
    },
});

Pedidos.hasMany(ItensPedidos, { foreignKey: 'idPed'});
Pedidos.hasMany(Enderecos, { foreignKey: 'idPed'});

//Pedidos.sync({force: true});
Pedidos.sync()

module.exports = Pedidos;
