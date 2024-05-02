const Sequelize = require('sequelize')
const db = require('./db')


const Entregas = db.define('entrega', {
    id: {
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
    },
    idPed: {
        type: Sequelize.INTEGER
    },
    destinatario: {
        type: Sequelize.STRING(255)
    },
    horario: {
        type: Sequelize.STRING(255),
    },
    foto: {
        type: Sequelize.BLOB('long'),
    }
})


//Entregas.sync({force: true})
Entregas.sync()

module.exports = Entregas