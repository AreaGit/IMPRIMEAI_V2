const Sequelize = require('sequelize');
const db = require('./db');
//const Produtos = require('./Produtos');

const VariacoesProduto = db.define('variacoesproduto', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    idProduto: {
        type: Sequelize.INTEGER,
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
});

//VariacoesProduto.belongsTo(Produtos, { foreignKey: 'idProduto' });
//VariacoesProduto.sync({ force: true });
VariacoesProduto.sync()

module.exports = VariacoesProduto;
