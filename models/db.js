const Sequelize = require('sequelize')
const DataTypes = require('sequelize')

const sequelize = new Sequelize("infoimprimeai", "infoimprimeai", "admBancoD@dos2", {
    host: "infoimprimeai.mysql.dbaas.com.br",
    dialect: 'mysql'
})
sequelize.authenticate()
.then(function () {
    console.log("Conectado ao banco de dados da Locaweb com sucesso!")
}).catch(function() {
    console.log("Erro ao conectar com o banco de dados")
});

/*const sequelize = new Sequelize("listauser", "root", "", {
    host: "localhost",
    dialect: 'mysql'
})
sequelize.authenticate()
.then(function () {
    console.log("Conectado ao banco de dados com sucesso!")
}).catch(function() {
    console.log("Erro ao conectar com o banco de dados")
});*/

module.exports = sequelize;