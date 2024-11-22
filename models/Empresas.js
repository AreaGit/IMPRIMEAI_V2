const Sequelize = require("sequelize");
const db = require("./db");

const Empresas = db.define("empresas", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    nome: {
        type: Sequelize.STRING(255), // Nome da marca
        allowNull: false,
    },  
    logo: {
        type: Sequelize.BLOB('long'), // Armazenar a imagem como BLOB (long para arquivos maiores)
        allowNull: false,
    },
});

//CRIAR TABELA
//Empresas.sync({force: true});
Empresas.sync();

module.exports = Empresas;