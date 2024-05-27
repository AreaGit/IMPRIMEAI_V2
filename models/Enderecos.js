const Sequelize = require('sequelize')
const db = require('./db')
const Produtos = require('./Produtos');

const Enderecos = db.define('enderecos', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    idPed: {
        type: Sequelize.INTEGER,
        allownull: true
    },
    rua: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    cep: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    cidade: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    estado: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    numero: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    complemento: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    bairro: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    cuidados: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    celular: {
        type: Sequelize.STRING(255),
        allownull: false
    }, 
    quantidade: {
        type: Sequelize.STRING(255),
        allownull: false
    },
    raio: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    idProduto: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    tipoEntrega: {
        type: Sequelize.STRING(255),
    },
    frete: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
}, {
    indexes: [
        {
            unique: false,
            fields: ['idPed'],
            name: 'idx_idPed'
        },
        {
            unique: false,
            fields: ['idProduto'],
            name: 'idx_idProduto'
        },
        {
            unique: false,
            fields: ['tipoEntrega'],
            name: 'idx_tipoEntrega'
        }
    ]
});
//Criar Tabela
Enderecos.belongsTo(Produtos, { foreignKey: 'idProduto' });
Enderecos.sync()
//Enderecos.sync({force:true})

module.exports = Enderecos