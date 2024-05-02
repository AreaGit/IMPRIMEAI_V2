const Sequelize = require('sequelize')
const db = require('./db')
const Produtos = require('./Produtos');

const ItensPedidos = db.define('itenspedidos', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    idPed: {
        type: Sequelize.INTEGER,
    },
    idProduto: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    nomeProd: {
        type : Sequelize.STRING(255),
        allowNull: false,
    },
    quantidade: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    valorProd: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
    },
    acabamento: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    cor: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    enobrecimento: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    formato: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    material: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    linkDownload: {
        type: Sequelize.STRING(255)
    },
    nomeArquivo: {
        type: Sequelize.STRING(255)
    },
    raio: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    statusPed: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    statusPag: {
        type: Sequelize.STRING(255),
    },
    graficaAtend: {
        type: Sequelize.STRING(255),
    },
    graficaCancl: {
        type: Sequelize.STRING(255)
    },
    graficaFin: {
        type: Sequelize.STRING(255),
    }
})

ItensPedidos.belongsTo(Produtos, { foreignKey: 'idProduto' });
//ItensPedidos.sync({force:true})
ItensPedidos.sync()

module.exports = ItensPedidos