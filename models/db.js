const Sequelize = require('sequelize')
const DataTypes = require('sequelize')

/*const sequelize = new Sequelize("infoimprimeai", "infoimprimeai", "admBancoD@dos2", {
    host: "infoimprimeai.mysql.dbaas.com.br",
    dialect: 'mysql'
})
sequelize.authenticate()
.then(function () {
    console.log("Conectado ao banco de dados da Locaweb com sucesso!")
}).catch(function() {
    console.log("Erro ao conectar com o banco de dados")
});*/

const sequelize = new Sequelize("imprimeai_dev", "imprimeai_dev", "admBancoD@dos2", {
    host: "imprimeai_dev.mysql.dbaas.com.br",
    dialect: 'mysql'
})
sequelize.authenticate()
.then(function () {
    console.log("Conectado ao banco de dados de desenvolvimento com sucesso!")
}).catch(function() {
    console.log("Erro ao conectar com o banco de dados")
});

module.exports = sequelize;