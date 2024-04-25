const Sequelize = require("sequelize");
const db = require("./db");

const Carteira = db.define('carteira', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER, // ID do usuário associado à carteira
        allowNull: false,
    },
    saldo: {
        type: Sequelize.DECIMAL(10, 2), // Saldo da carteira
        allowNull: false,
    },
    statusPag: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },
    idTransacao: {
        type: Sequelize.STRING(255),
    },
});

//Carteira.sync({force:true});
Carteira.sync();

module.exports = Carteira;