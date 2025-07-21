const Sequelize = require("sequelize");
const db = require("./db");
const { type } = require("os");

const UsersAdm = db.define('usersadm', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    empresa: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING(255),
        allowNull: false
    }
});

// CRIAR TABELA
//UsersAdm.sync({ force: true });
UsersAdm.sync();

module.exports = UsersAdm;