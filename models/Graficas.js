const Sequelize = require('sequelize')
const db = require('./db')


const Graficas = db.define('graficas', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    userCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    enderecoCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    cepCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    cidadeCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    estadoCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    cnpjCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    telefoneCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    inscricaoEstadualCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    bancoCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    agenciaCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    contaCorrenteCad: {
        type : Sequelize.STRING(255),
        allowNull: true,
    },
    produtos: {
        type: Sequelize.JSON,
        allowNull: false, // Certifique-se de que não seja nulo
    },
    emailCad: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    passCad: {
        type: Sequelize.STRING(255),
        allowNull: true
    }
});


// CRIAR A TABELA
Graficas.sync();
//Graficas.sync({ force: true })
// Exportar o modelo Grafica para uso em outros lugares
module.exports = Graficas;