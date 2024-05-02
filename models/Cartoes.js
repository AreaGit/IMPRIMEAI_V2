const Sequelize = require("sequelize")
const db = require("./db")

const Cartoes = db.define('cartoes', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    cardNumber: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    cardHolderName: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    expirationDate: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    cvv: {
        type: Sequelize.STRING(4),
        allowNull: false
    }
})

Cartoes.sync({force:true})
//Cartoes.sync()

module.exports = Cartoes