const Sequelize = require('sequelize');
const db = require('./db');
//const Produtos = require('./Produtos');

const VariacoesProduto = db.define('variacoesprodutoexc', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    idProduto: {
        type: Sequelize.INTEGER,
    },
    marca: {
        type: Sequelize.JSON // Agora é JSON
    },
    modelo: {
        type: Sequelize.JSON // Agora é JSON
    },
    material: {
        type: Sequelize.JSON, // Agora é JSON
    },
    formato: {
        type: Sequelize.JSON, // Agora é JSON
    },
    enobrecimento: {
        type: Sequelize.JSON, // Agora é JSON
    },
    cor: {
        type: Sequelize.JSON, // Agora é JSON
    },  
    acabamento: {
        type: Sequelize.JSON, // Agora é JSON
    },
    quantidades: {
        type: Sequelize.STRING,  // Armazenará as quantidades possíveis em formato JSON
    },
});

//VariacoesProduto.belongsTo(Produtos, { foreignKey: 'idProduto' });
//VariacoesProduto.sync({ force: true });
VariacoesProduto.sync()

module.exports = VariacoesProduto;
