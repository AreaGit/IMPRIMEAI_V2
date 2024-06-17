const Sequelize = require("sequelize");
const db = require("./db");

const Newsletter = db.define("newsletter", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING(255),
        allowNull: true
    }
});

//Criar a Tabela
Newsletter.sync();
//Newsletter.sync({ force: true });

module.exports = Newsletter;