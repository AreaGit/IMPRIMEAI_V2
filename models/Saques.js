const Sequelize = require('sequelize');
const db = require('./db');

const Saques = db.define('saques', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    idPed: {
      type: Sequelize.INTEGER
    },
    idGrafica: {
      type: Sequelize.INTEGER
    },
    valorGrafica: {
      type: Sequelize.DECIMAL(10, 2)
    },
    valorAdm: {
      type: Sequelize.DECIMAL(10, 2)
    },
    graficaSacou: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    admSacou: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
  }, {
    indexes: [
      {
        fields: ['idPed']
      },
      {
        fields: ['idGrafica']
      }
    ]
});

//Saques.sync({force: true});
Saques.sync();

module.exports = Saques;