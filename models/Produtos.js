const Sequelize = require('sequelize');
const db = require('./db'); // Certifique-se de que o caminho para o arquivo de configuração do banco de dados esteja correto.
const VariacoesProduto = require('./VariacoesProduto');

const Produtos = db.define('produtos', {
  nomeProd: {
    type: Sequelize.STRING(255),
    allowNull: false, // Não permitir valores nulos
  },
  descProd: {
    type: Sequelize.TEXT, // Use TEXT para descrições mais longas
    allowNull: false,
  },
  valorProd: {
    type: Sequelize.FLOAT, // Use FLOAT para valores decimais
    allowNull: false,
  },
  categProd: {
    type: Sequelize.STRING, // Use STRING para categorias
    allowNull: false,
  },
  raioProd: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  imgProd: {
    type: Sequelize.BLOB('long'), // Use BLOB para armazenar imagens
    allowNull: true, // Alterado para não permitir valores nulos, se as imagens forem obrigatórias.
  },
  imgProd2: {
    type: Sequelize.BLOB('long'), // Use BLOB para armazenar imagens
    allowNull: true, // Alterado para não permitir valores nulos, se as imagens forem obrigatórias.
  },
  imgProd3: {
    type: Sequelize.BLOB('long'), // Use BLOB para armazenar imagens
    allowNull: true, // Alterado para não permitir valores nulos, se as imagens forem obrigatórias.
  },
  imgProd4: {
    type: Sequelize.BLOB('long'), // Use BLOB para armazenar imagens
    allowNull: true, // Alterado para não permitir valores nulos, se as imagens forem obrigatórias.
  },
  gabaritoProd: {
    type: Sequelize.BLOB('long'),
    allowNull: true,
  },
},  {
  indexes: [
    {
      unique: false,
      fields: ['categProd'],
      name: 'idx_categProd'
    },
    {
      unique: false,
      fields: ['nomeProd'],
      name: 'idx_nomeProd'
    },
    {
      unique: false,
      fields: ['categProd', 'nomeProd'],
      name: 'idx_categProd_nomeProd'
    },
    {
      unique: false,
      fields: ['valorProd'],
      name: 'idx_valorProd'
    },
  ]
});

// Configurar a associação com VariacoesProduto
Produtos.hasMany(VariacoesProduto, { foreignKey: 'idProduto' });

// Sincronizar o modelo com o banco de dados
Produtos.sync() // Use isso para criar ou atualizar a tabela
//Produtos.sync({ force: true }) // Use isso para recriar a tabela (cuidado, dados existentes serão apagados)

module.exports = Produtos;