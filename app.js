const express = require('express');
const app = express();
const PORT = 8080;
const fs = require('fs');
const path = require('path');
const cadastros = require('./routes/cadastros');
const pedidosUsers = require('./routes/pedidosUsers');
const graficasServer = require('./routes/graficasServer')
const Produtos = require('./models/Produtos');
const VariacoesProduto = require('./models/VariacoesProduto');
const Newsletter = require('./models/Newsletter');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const redis = require('redis');
const client = redis.createClient({
  host: '127.0.0.1', // Substitua pelo endereço IP do seu servidor Redis
  port: 6379,         // Porta onde o Redis está escutando
});

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

client.connect();
// Função para obter produtos de comunicação visual com caching
const getCachedComunicacaoVisualProducts = async (page, limit) => {
  const cacheKey = `comunicacaoVisual:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Comunicação Visual' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de adesivos com caching
const getCachedAdesivosProducts = async (page, limit) => {
  const cacheKey = `adesivos:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Adesivos e Etiquetas' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de brindes com caching
const getCachedBrindesProducts = async (page, limit) => {
  const cacheKey = `brindes:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Brindes' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de brindes com caching
const getCachedCartazesProducts = async (page, limit) => {
  const cacheKey = `cartazes:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Cartazes' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de papelaria com caching
const getCachedPapelariaProducts = async (page, limit) => {
  const cacheKey = `papelaria:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Papelaria' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de cartões com caching
const getCachedCartoesProducts = async (page, limit) => {
  const cacheKey = `cartoes:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Cartões de Visita' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de folders com caching
const getCachedFoldersProducts = async (page, limit) => {
  const cacheKey = `folders:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Folders e Panfletos' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de pastas com caching
const getCachedPastasProducts = async (page, limit) => {
  const cacheKey = `pastas:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Pastas' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de imãs com caching
const getCachedImasProducts = async (page, limit) => {
  const cacheKey = `imas:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Imãs' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
// Função para obter produtos de sacolas com caching
const getCachedSacolasProducts = async (page, limit) => {
  const cacheKey = `sacolas:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const produtos = await Produtos.findAndCountAll({
    where: { categProd: 'Sacolas' },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expire after 1 hour
  });

  return produtos;
};
app.use(express.static(path.join(__dirname)));
app.use('/', cadastros);
app.use('/', pedidosUsers);
app.use('/', graficasServer);
//Rota get de início
app.get('/', (req, res) => {
    try {
        const indexHtmlContent = fs.readFileSync("index.html", "utf8");
        res.send(indexHtmlContent);
      } catch (err) {
        console.error("Erro ao ler o arquivo index.html:", err);
        res.status(500).send("Erro interno do servidor");
      }
});
//Rota get para pegar as imagens dos produtos
app.get('/imagens/:id', async (req, res) => {
  try {
    const idDoProduto = req.params.id;

    // Consulta o banco de dados para obter a imagem do produto pelo ID
    const produto = await Produtos.findByPk(idDoProduto);

    if (!produto || !produto.imgProd) {
      // Se o produto não for encontrado ou não houver imagem, envie uma resposta de erro 404
      return res.status(404).send('Imagem não encontrada');
    }

    const imgBuffer = produto.imgProd;

    // Detecta a extensão da imagem com base no tipo de arquivo
    let extensao = 'jpg'; // Default para JPEG
    if (imgBuffer[0] === 0x89 && imgBuffer[1] === 0x50 && imgBuffer[2] === 0x4E && imgBuffer[3] === 0x47) {
      extensao = 'png'; // Se os primeiros bytes correspondem a PNG, use PNG
    }

    // Define o cabeçalho da resposta com base na extensão
    res.setHeader('Content-Type', `image/${extensao}`);

    // Envie a imagem como resposta
    res.end(imgBuffer);
  } catch (error) {
    console.error('Erro ao buscar imagem do produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});
//Rota get da página de comunicação visual
app.get('/comunicacao-visual', async(req, res) => {
  try {
    const comunicacaoVisualHtmlContent = fs.readFileSync(path.join(__dirname, "html", "comunicacao-visual.html"), "utf-8");
    res.send(comunicacaoVisualHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo comunicacao-visual.html:", err)
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para renderizar os produtos na página de comunicacao-visual
app.get('/api/produtos/comunicacao-visual', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const produtos = await getCachedComunicacaoVisualProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de adesivos
app.get('/adesivos', (req, res) => {
  try {
    const adesivosHtmlContent = fs.readFileSync(path.join(__dirname, "html", "adesivos-etiquetas.html"), "utf-8");
    res.send(adesivosHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo adesivos-etiquetas.html:" ,err)
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota para renderizar os produtos de adesivos
app.get('/api/produtos/adesivos-etiquetas', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const produtos = await getCachedAdesivosProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de brindes
app.get('/brindes', (req, res) => {
  try {
    const brindesHtmlContent = fs.readFileSync(path.join(__dirname, "html", "brindes.html"), "utf-8");
    res.send(brindesHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo brindes.html");
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para renderizar os produtos de brindes
app.get('/api/produtos/brindes', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const produtos = await getCachedBrindesProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de cartazes
app.get('/cartazes', (req ,res) => {
  try {
    const cartazesHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cartazes.html"), "utf-8");
    res.send(cartazesHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo cartazes.html");
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para renderizar os produtos de cartazes
app.get('/api/produtos/cartazes', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const produtos = await getCachedCartazesProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de papelaria
app.get('/papelaria', (req, res) => {
  try {
    const papelariaHtmlContent = fs.readFileSync(path.join(__dirname, "html", "papelaria.html"), "utf-8");
    res.send(papelariaHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo papelaria.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos de papelaria
app.get('/api/produtos/papelaria', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedPapelariaProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de cartão de visita
app.get('/cartoes', (req, res) => {
  try {
    const cartaoHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cartao-visita.html"), "utf-8");
    res.send(cartaoHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo cartao-visita.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos de cartões de visita
app.get('/api/produtos/cartoes', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedCartoesProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de folders e panfletos
app.get('/folders', (req, res) => {
  try {
    const foldersHtmlContent = fs.readFileSync(path.join(__dirname, "html", "folders.html"), "utf-8");
    res.send(foldersHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo folders.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos de folders
app.get('/api/produtos/folders', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedFoldersProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de pastas
app.get('/pastas', (req, res) => {
  try {
    const pastasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "pastas.html"), "utf-8");
    res.send(pastasHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo pastas.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos pastas
app.get('/api/produtos/pastas', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedPastasProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de imas
app.get('/imas', (req, res) => {
  try {
    const imasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "imas.html"), "utf-8");
    res.send(imasHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo imas.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos imas
app.get('/api/produtos/imas', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedImasProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Rota get da página de imas
app.get('/sacolas', (req, res) => {
  try {
    const sacolasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "sacolas.html"), "utf-8");
    res.send(sacolasHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo sacolas.html");
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota com paginação e caching para produtos sacolas
app.get('/api/produtos/sacolas', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const produtos = await getCachedSacolasProducts(page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Rota get da página de carrinho
app.get('/carrinho', (req, res) => {
  try {
      const carrinhoHtmlContent = fs.readFileSync(path.join(__dirname, "html", "carrinho.html"), "utf8");
      res.send(carrinhoHtmlContent);
  } catch (err) {
      console.error("Erro ao ler o arquivo carrinho.html:", err);
      res.status(500).send("Erro interno do servidor");
  }
});
//Rota get da página de cadastro
app.get('/cadastro', (req, res) => {
  try {
    const cadastroHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cadastro.html"), "utf-8");
    res.send(cadastroHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo cadastro.html:", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get da página de login
app.get('/login', (req, res) => {
  try {
    const loginHtmlContent = fs.readFileSync(path.join(__dirname, "html", "login.html"), "utf-8");
    res.send(loginHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo login.html:", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get da página de cadastro de produtos
app.get('/cadastro-produtos', (req ,res) => {
  try {
    const cadastroProdutosHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cad-prods.html"), "utf-8");
    res.send(cadastroProdutosHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo cad-prods.html:" ,err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get da página de detalhes dos produtos
app.get('/detalhes-produtos', (req, res) => {
  try {
    const detalhesProdutosContentHtml = fs.readFileSync(path.join(__dirname, "html", "detalhes-produtos.html"), "utf-8");
    res.send(detalhesProdutosContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo cad-prods.html:" ,err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rotas get para mostrar o produto e as suas variações
app.get('/produto/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await Produtos.findByPk(productId); // Use o método correto para buscar o produto

    if (!produto) {
      res.status(404).json({ mensagem: 'Produto não encontrado' });
    } else {
      res.json({
        id: produto.id,
        nomeProd: produto.nomeProd,
        descProd: produto.descProd,
        valorProd: produto.valorProd,
        raioProd: produto.raioProd,
        imgProd: produto.imgProd, // Include the main product image
        imgProd2: produto.imgProd2, // Include additional image 1
        imgProd3: produto.imgProd3, // Include additional image 2
        imgProd4: produto.imgProd4, // Include additional image 3
        gabaritoProd: produto.gabaritoProd,
        // Adicione outras propriedades do produto conforme necessário
      });
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}); 

app.get('/variacoes-produto/:id', async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    // Buscar as variações do produto com base no ID do produto
    const variacoes = await VariacoesProduto.findAll({
      where: { idProduto: produtoId }
    });

    res.json(variacoes);
  } catch (error) {
    console.error('Erro ao buscar variações do produto:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});
//Rota get para a página de formato de entrega
app.get('/formato-entrega', (req,res) => {
  try {
    const formatoEntregaContentHtml = fs.readFileSync(path.join(__dirname, "html", "formato-entrega.html"), "utf-8");
    res.send(formatoEntregaContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo formato-entrega.html:" ,err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de dados de entrega
app.get('/dados-entrega', (req, res) => {
  try {
    const dadosEntregaContentHtml = fs.readFileSync(path.join(__dirname, "html", "local-entrega.html"), "utf-8");
    res.send(dadosEntregaContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo local-entrega.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de multiplos enderecos
app.get('/multiplos-enderecos', (req, res) => {
  try {
    const multiplosEnderecosContentHtml = fs.readFileSync(path.join(__dirname, "html", "multiplos-enderecos.html"), "utf-8");
    res.send(multiplosEnderecosContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo multiplos-enderecos.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de upload de arquivos
app.get('/upload', (req, res) => {
  try {
    const uploadContentHtml = fs.readFileSync(path.join(__dirname, "html", "upload.html"), "utf-8");
    res.send(uploadContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo upload.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de pagamento
app.get('/pagamento', (req, res) => {
  try {
    const pagamentoContentHtml = fs.readFileSync(path.join(__dirname, "html", "pagamento.html"), "utf-8");
    res.send(pagamentoContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo pagamento.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de retirada
app.get('/retirada', (req, res) => {
  try {
    const retiradaContentHtml = fs.readFileSync(path.join(__dirname, "html", "retirada.html"), "utf-8");
    res.send(retiradaContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo retirada.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota post para pesquisa de produtos
app.post('/pesquisar-produtos', async (req, res) => {
  try {
    const { query } = req.body;

    // Realize a pesquisa de produtos usando o operador "like" para correspondência parcial
    const produtos = await Produtos.findAll({
      where: {
        nomeProd: {
          [Op.like]: `%${query}%`
        }
      }
    });

    res.json({ produtos });
  } catch (error) {
    console.error('Erro na pesquisa de produtos:', error);
    res.status(500).json({ error: 'Erro na pesquisa de produtos', message: error.message });
  }
});
//Rota get para a página de perfil
app.get('/perfil', (req, res) => {
  try {
    const perfilContentHtml = fs.readFileSync(path.join(__dirname, "html", "perfil.html"), "utf-8");
    res.send(perfilContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo perfil.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de carteira do usuário
app.get('/carteira', (req, res) => {
  try {
    const carteiraContentHtml = fs.readFileSync(path.join(__dirname, "html", "carteira.html"), "utf-8");
    res.send(carteiraContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo carteira.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de pedidos do usuário
app.get('/pedidosUsuario', (req, res) => {
  try {
    const pedidosUsuarioContentHtml = fs.readFileSync(path.join(__dirname, "html", "pedidosUsuario.html"), "utf-8");
    res.send(pedidosUsuarioContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo pedidosUsuario.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de detalhes dos pedidos do usuário
app.get('/detalhesPedidosUser', (req, res) => {
  try {
    const detalhesPedidosUserContentHtml = fs.readFileSync(path.join(__dirname, "html", "detalhes-pedidosUser.html"), "utf-8");
    res.send(detalhesPedidosUserContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo detalhes-pedidosUser.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de cadastro das gráficas
app.get('/cadastro-graficas', (req, res) => {
  try {
    const cadastroGraficasContentHtml = fs.readFileSync(path.join(__dirname, "html", "cadastro-graficas.html"), "utf-8");
    res.send(cadastroGraficasContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo cadastro-graficas.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de login das gráficas
app.get('/login-graficas', (req, res) => {
  try {
    const loginGraficasContentHtml = fs.readFileSync(path.join(__dirname, "html", "login-graficas.html"), "utf-8");
    res.send(loginGraficasContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo login-graficas.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de pedidos das gráficas
app.get('/pedidos', (req, res) => {
  try {
    const pedidosGraficasContentHtml = fs.readFileSync(path.join(__dirname, "html", "pedidos-grafica.html"), "utf-8");
    res.send(pedidosGraficasContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo pedidos-grafica.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de detalhes dos pedidos das gráficas
app.get('/detalhes-pedidos', (req, res) => {
  try {
    const detalhesPedidosGraficasContentHtml = fs.readFileSync(path.join(__dirname, "html", "detalhesPedidosGrafica.html"), "utf-8");
    res.send(detalhesPedidosGraficasContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo detalhesPedidosGrafica.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a painel administrativo
app.get('/painel-administrativo', (req, res) => {
  try {
    const painelAdmContentHtml = fs.readFileSync(path.join(__dirname, "html", "painel-adm.html"), "utf-8");
    res.send(painelAdmContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo painel-adm.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de verificação de conta
app.get('/verificacao', (req, res) => {
  try {
    const verificacaoContentHtml = fs.readFileSync(path.join(__dirname, "html", "verificacaoUser.html"), "utf-8");
    res.send(verificacaoContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo verificacaoUser.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de central de ajuda
app.get('/central-de-ajuda', (req, res) => {
  try {
    const centralAjudaContentHtml = fs.readFileSync(path.join(__dirname, "html", "centralAjuda.html"), "utf-8");
    res.send(centralAjudaContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo centralAjuda.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página de política de privacidade
app.get('/politica-de-privacidade', (req, res) => {
  try {
    const politicaContentHtml = fs.readFileSync(path.join(__dirname, "html", "politica.html"), "utf-8");
    res.send(politicaContentHtml);
  }catch (err) {
    console.log("Erro ao ler o arquivo politica.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota get para a página do blog do site
app.get('/blog', (req, res) => {
  try {
    const blogContentHtml = fs.readFileSync(path.join(__dirname, "html", "blog.html"), "utf-8");
    res.send(blogContentHtml);
  }catch(err) {
    console.log("Erro ao ler o arquivo blog.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
app.post('/inscrever-newsletter', async (req, res) => {
  const email = req.body.email;
  try {
    const subscriber = await Newsletter.create({ email });
    console.log('Inscrição adicionada ao banco de dados:', subscriber.email);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: "gabrieldiastrin63@gmail.com",
        pass: "bwep pyqq zocy ljsi"
      }
    });

    const mailOptions = {
      from: 'gabrieldiastrin63@gmail.com',
      to: email,
      subject: 'Bem-vindo à nossa Newsletter!',
      html: '<p>Obrigado por se inscrever em nossa newsletter!</p>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      console.log('Email enviado:', info.response);
      res.send('Inscrição bem-sucedida!');
    });
  } catch (error) {
    console.error('Erro ao adicionar inscrição ao banco de dados:', error);
    res.status(500).send('Erro ao se inscrever na newsletter.');
  }
});
//Rota get para a página de sobre
app.get('/sobre', (req, res) => {
  try {
    const sobreContentHtml = fs.readFileSync(path.join(__dirname, "html", "sobre.html"), "utf-8");
    res.send(sobreContentHtml);
  }catch(err) {
    console.log("Erro ao ler o arquivo sobre.html: ", err);
    res.status(500).send("Erro interno do servidor");
  }
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} https://localhost:${PORT}`);
});