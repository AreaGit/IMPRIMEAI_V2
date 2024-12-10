const Sequelize = require("sequelize");
const db = require("./db");

const CarteiraEmpresas = db.define('carteiraempresas', {
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

//CarteiraEmpresas.sync({force:true});
CarteiraEmpresas.sync();

module.exports = CarteiraEmpresas;