const Sequelize = require('sequelize')
const db = require('./db')
const Produtos = require('./Produtos');
const Graficas = require('./Graficas');

const ItensPedidos = db.define('itenspedidos', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    idUserPed: {
        type: Sequelize.INTEGER,
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
    marca: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    modelo: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    arteEmpresas: {
        type: Sequelize.STRING(255)
    },
    tipo: {
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
        type: Sequelize.INTEGER,
    },
    graficaCancl: {
        type: Sequelize.STRING(255)
    },
    graficaFin: {
        type: Sequelize.STRING(255),
    }
},{
    indexes: [
        {
            unique: false,
            fields: ['idUserPed'],
            name: 'idx_idUserPed'
        },
        {
            unique: false,
            fields: ['idProduto'],
            name: 'idx_idProduto'
        },
        {
            unique: false,
            fields: ['statusPed'],
            name: 'idx_statusPed'
        },
        {
            unique: false,
            fields: ['idPed'],
            name: 'idx_idPed'
        },
        {
            unique: false,
            fields: ['graficaAtend'],
            name: 'idx_graficaAtend'
        },
        {
            unique: false,
            fields: ['graficaCancl'],
            name: 'idx_graficaCancl'
        },
    ]
});

ItensPedidos.belongsTo(Graficas, { foreignKey: 'graficaAtend', as: 'grafica' });
ItensPedidos.belongsTo(Produtos, { foreignKey: 'idProduto' });
//ItensPedidos.sync({force:true})
ItensPedidos.sync()

module.exports = ItensPedidos