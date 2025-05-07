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
const Empresas = require('./models/Empresas');
const Graficas = require('./models/Graficas');
const Pedidos = require('./models/Pedidos');
const ItensPedido = require('./models/ItensPedido');
const Enderecos = require('./models/Enderecos');
const Newsletter = require('./models/Newsletter');
const Saques = require('./models/Saques');
const ProdutosExc = require('./models/ProdutosExc');
const VariacoesProdutoExc = require('./models/VariacoesProdutoExc');
const UsersEmpresas = require('./models/Users-Empresas');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const redis = require('redis');
const { _ } = require('pagarme');
const multer = require('multer');
const axios = require('axios');
const apiKey = 'sk_e74e3fe1ccbe4ae080f70d85d94e2c68'; // sua chave de API
const pagarmeKeyTest = "sk_test_05ddc95c6ce442a796c7ebbe2376185d";
const pagarmeKeyProd = "sk_e74e3fe1ccbe4ae080f70d85d94e2c68";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const NodeCache = require('node-cache');
const productCache = new NodeCache({ stdTTL: 200, checkperiod: 1 });
const Sequelize = require('sequelize');
const UserEmpresas = require('./models/Users-Empresas');
const EnderecosEmpresas = require('./models/Enderecos-Empresas');
const CarteiraEmpresas = require('./models/CarteiraEmpresas');
const User = require('./models/User');
const Carteira = require('./models/Carteira');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const TransacoesCarteira = require('./models/TransacoesCarteira');
const client = redis.createClient({
  host: '127.0.0.1', // Substitua pelo endereço IP do seu servidor Redis
  port: 6379,         // Porta onde o Redis está escutando
});

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

client.connect();
async function enviarEmailNotificacao(destinatario, assunto, corpo) {
  const transporter = nodemailer.createTransport({
    host: 'email-ssl.com.br',  // Servidor SMTP da LocalWeb
    port: 465,                 // Porta para SSL (465)
    secure: true,              // Usar conexão segura (SSL)
    auth: {
      user: 'atendimento@imprimeai.com.br',  // E-mail que você vai usar para enviar
      pass: 'Z1mb@bue',                    // Senha do e-mail
    },
  })

  const info = await transporter.sendMail({
    from: 'atendimento@imprimeai.com.br',
    to: destinatario,
    subject: assunto,
    text: corpo,
  });

  console.log('E-mail enviado:', info);
}
async function enviarNotificacaoWhatsapp(destinatario, corpo) {
  try {
      const response = await sendMessage(destinatario, corpo);
      console.log(`Mensagem de código de verificação enviada com sucesso para o cliente ${destinatario}:`, response);
      return response;
  } catch (error) {
      console.error(`Erro ao enviar mensagem para o cliente ${destinatario}:`, error);
      throw error;
  }
}
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
    where: { categProd: 'Adesivos' },
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

const getCategoriasPorProdutosUsuario = async (userId) => {
  try {
    const user = await UsersEmpresas.findByPk(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    let produtosUsuario;
    if (typeof user.produtos === "string") {
      try {
        produtosUsuario = JSON.parse(user.produtos);
      } catch (parseError) {
        throw new Error("Erro ao analisar o campo 'produtos'.");
      }
    } else if (typeof user.produtos === "object" && user.produtos !== null) {
      produtosUsuario = user.produtos;
    } else {
      throw new Error("O campo 'produtos' não é válido.");
    }

    const nomesProdutos = Object.keys(produtosUsuario).map((nome) =>
      nome.trim().toLowerCase()
    );

    console.log("Nomes dos produtos:", nomesProdutos); // Verificar os nomes dos produtos

    const produtos = await ProdutosExc.findAll({
      where: {
        nomeProd: nomesProdutos,
      },
      attributes: ["nomeProd", "categProd2"], // Usar o campo correto
    });

    if (produtos.length === 0) {
      throw new Error("Nenhuma categoria encontrada para os produtos do usuário.");
    }

    const categoriasUnicas = Array.from(
      new Set(produtos.map((produto) => produto.categProd2)) // Ajuste conforme o nome correto
    );


    console.log(categoriasUnicas)

    return categoriasUnicas;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error(error.message);
  }
};

//getCategoriasPorProdutosUsuario(1);
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
  const { page = 1, limit = 1000 } = req.query;
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
  const { page = 1, limit = 1000 } = req.query;
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
  const { page = 1, limit = 1000 } = req.query;
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
  const { page = 1, limit = 1000 } = req.query;
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
  const { page = 1, limit = 1000 } = req.query;

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
  const { page = 1, limit = 1000 } = req.query;

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
  const { page = 1, limit = 1000 } = req.query;

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
  const { page = 1, limit = 1000 } = req.query;

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
  const { page = 1, limit = 1000 } = req.query;

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
  const { page = 1, limit = 1000 } = req.query;

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
// Função para renderizar os produtos com caching
app.get('/api/produtos/:categoria', async (req, res) => {
  const { page = 1, limit = 1000 } = req.query;
  const categoria = req.params.categoria;

  try {
    const produtos = await getCachedProductsByCategory(categoria, page, limit);
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

// Função para obter produtos de uma categoria específica com caching
const getCachedProductsByCategory = async (categoria, page, limit) => {
  //categoria = "Folhetos"
  console.log("Categoria buscada: ", categoria)
  const cacheKey = `${categoria}:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // Busca produtos onde qualquer uma das colunas de categoria corresponde à categoria enviada
  const produtos = await Produtos.findAndCountAll({
    where: {
      [Op.or]: [
        { categProd: categoria },
        { categProd2: categoria },
        { categProd3: categoria }
      ]
    },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']]
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expira após 1 hora
  });

  return produtos;
};

// Rota para servir a página HTML de categorias de produtos
app.get('/categorias', (req, res) => {
  try {
    const categoriasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "categorias-produtos.html"), "utf8");
    res.send(categoriasHtmlContent);
  } catch (err) {
    console.error("Erro ao ler o arquivo categorias-produtos.html:", err);
    res.status(500).send("Erro interno do servidor");
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
app.get('/api/quantidades/:produtoId', async (req, res) => {
  try {
    const { produtoId } = req.params;

    // Encontre as variações do produto pelo ID do produto
    const variacoesProduto = await VariacoesProduto.findOne({
      where: { idProduto: produtoId },
    });

    if (!variacoesProduto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Converta as quantidades de volta para um array de números
    const quantidades = JSON.parse(variacoesProduto.quantidades);

    res.json({ quantidades });
  } catch (error) {
    console.error('Erro ao obter as quantidades:', error);
    res.status(500).json({ error: 'Erro ao obter as quantidades' });
  }
});
// Rota para buscar todos os produtos no cadastro das Gráficas
app.get('/api-graf/produtos', async (req, res) => {
  try {
    const produtos = await Produtos.findAll({
      attributes: ['nomeProd'] // Retorna apenas o campo nome
    });
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});
app.get('/api-empresas/produtos', async (req, res) => {
  try {
    const produtos = await ProdutosExc.findAll({
      attributes: ['nomeProd'] // Retorna apenas o campo nome
    });
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
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
app.get('/produto/:id/gabarito', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await Produtos.findByPk(productId);

    if (!produto || !produto.gabaritoProd) {
      return res.status(404).json({ mensagem: 'Gabarito não encontrado' });
    }

    // Tratamento do conteúdo do PDF
    const pdfContent = Buffer.from(produto.gabaritoProd, 'binary'); // Assumindo que o conteúdo está armazenado como string
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${produto.nomeProd}_gabarito.pdf`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Erro ao baixar gabarito:', error);
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
//Rota get para a página de endereços salvos
app.get('/enderecos-salvos', (req, res) => {
  try {
    const enderecosSalvosContentHtml = fs.readFileSync(path.join(__dirname, "html", "enderecos-salvos.html"), "utf-8");
    res.send(enderecosSalvosContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo enderecos-salvos.html: ", err);
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
async function getProducts() {
  const produtos = await Produtos.findAll({
      attributes: ['id', 'nomeProd', 'imgProd', 'categProd', 'valorProd']
  });
  return produtos.map(produto => produto.dataValues);
}

app.get('/api/produtos', async (req, res) => {
  try {
      const cacheKey = 'produtos-todos';
      let produtos = productCache.get(cacheKey);

      if (!produtos) {
          produtos = await getProducts();
          productCache.set(cacheKey, produtos);
      }

      res.json(produtos);
  } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});
app.get('/api/produtos-editar/:id', async (req, res) => {
  const produtoId = req.params.id;

  try {
    // Encontra o produto pelo ID
    const produto = await Produtos.findByPk(produtoId, {
      attributes: ['id', 'nomeProd', 'imgProd', 'imgProd2', 'imgProd3', 'imgProd4', 'descProd', 'valorProd', 'categProd', 'raioProd', 'gabaritoProd']
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log(produto)

    // Formata o produto para enviar como resposta
    const produtoFormatado = {
      id: produto.id,
      nome: produto.nomeProd,
      descricao: produto.descProd,
      valor: produto.valorProd,
      imagem: produto.imgProd,
      imagem2: produto.imgProd2,
      imagem3: produto.imgProd3,
      imagem4: produto.imgProd4,
      categoria: produto.categProd,
      raio: produto.raioProd,
      gabarito: produto.gabaritoProd,
    };

    res.json(produtoFormatado);
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).send('Erro ao buscar produto');
  }
});
//Rota get para a página de login do painel administrativa
app.get('/login-adm', (req ,res) => {
  try {
    const loginAdmContentHtml = fs.readFileSync(path.join(__dirname, "html", "loginAdm.html"), "utf-8");
    res.send(loginAdmContentHtml);
    } catch (err) {
      console.log("Erro ao ler o arquivo loginAdm.html", err);
      res.status(500).send("Erro interno do servidor");
  }
});
//Rota para edição de produtos
app.post('/editar-produto/:id', upload.fields([
  { name: 'gabarito', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nomeProd, descProd, valorProd, categoriaProd, raioProd, imagem, imagem2, imagem3, imagem4 } = req.body;
    const { gabarito } = req.files;

    console.log('Dados recebidos:', { nomeProd, descProd, valorProd, categoriaProd, raioProd, imagem, imagem2, imagem3, imagem4 });
    console.log('Arquivos recebidos:', { gabarito });

    const produto = await Produtos.findByPk(req.params.id);

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualiza apenas os campos recebidos
    if (nomeProd !== undefined) {
      produto.nomeProd = nomeProd;
    }
    if (descProd !== undefined) {
      produto.descProd = descProd;
    }
    if (valorProd !== undefined) {
      produto.valorProd = valorProd;
    }
    if (categoriaProd !== undefined) {
      produto.categProd = categoriaProd;
    }
    if (raioProd !== undefined) {
      produto.raioProd = raioProd;
    }

    // Atualiza as imagens apenas se elas forem recebidas
    if (imagem && imagem.length > 0) {
      produto.imgProd = imagem;
    }
    if (imagem2 && imagem2.length > 0) {
      produto.imgProd2 = imagem2;
    }
    if (imagem3 && imagem3.length > 0) {
      produto.imgProd3 = imagem3;
    }
    if (imagem4 && imagem4.length > 0) {
      produto.imgProd4 = imagem4;
    }
    if (gabarito && gabarito.length > 0) {
      produto.gabaritoProd = gabarito[0].buffer;
    }

    await produto.save();

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao editar o produto:', error);
    res.status(500).json({
      error: 'Erro ao editar o produto',
      message: error.message,
    });
  }
});
//Rota get para a página de edição de produtos
app.get('/editar-produtos', (req, res) => {
  try {
    const editarProdHtmlContent =  fs.readFileSync(path.join(__dirname, "html", "editar-produtos.html"), "utf-8");
    res.send(editarProdHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo editarProdHtmlContent.html", err);
    res.status(500).send("Erro interno do serviodor");
  }
});
//Rota get para enviar todas as gráficas para o lado do cliente
app.get('/api/graficas', async (req, res) => {
  try {
    // Consulte o banco de dados para buscar as gráficas cadastradas
    const graficas = await Graficas.findAll();
    // Envie as gráficas como resposta em JSON
    res.json(graficas);
  } catch (err) {
    console.log("Erro ao enviar gráficas", err);
    res.status(500).json({ error: 'Erro ao buscar gráficas' });
  }
});
//Rota get para a página de editar gráficas
app.get('/editar-graficas', (req, res) => {
  try {
    const editarGraficasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "editar-graficas.html"), "utf-8");
    res.send(editarGraficasHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo editar-graficas.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
app.get('/api/graficas/:id', async (req, res) => {
  const graficaId = req.params.id;

  try {
    // Encontra a gráfica pelo ID
    const graficas = await Graficas.findByPk(graficaId, {
      attributes: ['id', 'userCad', 'emailCad', 'estadoCad', 'cidadeCad', 'produtos', 'enderecoCad', 'cepCad', 'cnpjCad', 'telefoneCad', 'bancoCad', 'agenciaCad', 'contaCorrenteCad', 'recipientId']
    });

    if (!graficas) {
      return res.status(404).json({ error: 'Gráfica não encontrada' });
    }

    // Formata os dados da gráfica para enviar como resposta
    const graficaFormatada = {
      id: graficas.id,
      userCad: graficas.userCad,
      emailCad: graficas.emailCad,
      estadoCad: graficas.estadoCad,
      cidadeCad: graficas.cidadeCad,
      enderecoCad: graficas.enderecoCad,
      cepCad: graficas.cepCad,
      cnpjCad: graficas.cnpjCad,
      telefoneCad: graficas.telefoneCad,
      produtos: graficas.produtos,
      bancoCad: graficas.bancoCad,
      agenciaCad: graficas.agenciaCad,
      contaCorrente: graficas.contaCorrenteCad,
      recipientId: graficas.recipientId
    };

    res.json(graficaFormatada);
  } catch (err) {
    console.error('Erro ao buscar grafica:', err);
    res.status(500).send('Erro ao buscar grafica');
  }
});
app.post('/editar-grafica/:id', upload.none(), async (req, res) => {
  try {
    const { nome, email, estado, cidade, produtos, endereco, cep, cnpj, telefone, banco, agencia, conta } = req.body;
    const id = req.params.id;
    console.log("DADOS RECEBIDOS: ", req.body);

    // Validação dos dados (adicione conforme necessário)
    if (!id || !nome || !endereco || !cep || !cidade || !estado || !telefone || !cnpj || !banco || !agencia || !conta || !produtos || !email) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Busca a gráfica pelo ID
    const grafica = await Graficas.findByPk(id);

    if (!grafica) {
      return res.status(404).json({ error: 'Gráfica não encontrada' });
    }

    // Atualiza os dados da gráfica
    grafica.userCad = nome;
    grafica.enderecoCad = endereco;
    grafica.cepCad = cep;
    grafica.cidadeCad = cidade;
    grafica.estadoCad = estado;
    grafica.telefoneCad = telefone;
    grafica.cnpjCad = cnpj;
    grafica.bancoCad = banco;
    grafica.agenciaCad = agencia;
    grafica.contaCorrenteCad = conta;

    // Transformar a string em um array, removendo espaços extras ao redor de cada produto
    const produtosArray = produtos.split(',').map(produto => produto.trim());
    // Criar um objeto JavaScript com base no array de produtos
    const graficaProdutos = {};
    produtosArray.forEach(produto => {
      graficaProdutos[produto] = true;
    });
    // Converter o objeto JavaScript em uma string JSON formatada
    const graficaProdutosJSON = JSON.stringify(graficaProdutos, null, 4);
    const cleanedString = graficaProdutosJSON.replace(/\\/g, '');
    const graficaProdutos2 = JSON.parse(cleanedString);  
    grafica.produtos = graficaProdutos2;

    grafica.emailCad = email;

    // Salva as alterações no banco de dados
    await grafica.save();

    res.json({ message: 'Informações da gráfica atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao editar informações da gráfica:', error);
    res.status(500).json({
      error: 'Erro ao editar informações da gráfica',
      message: error.message,
    });
  }
});
//Rota get para pegar todos os pedidos
app.get('/pedidos-todos', async (req, res) => {
  try {
      const pedidos = await Pedidos.findAll({
          include: [
              {
                  model: ItensPedido,
              },
              {
                  model: Enderecos,
              },
          ],
      });
      res.status(200).json({ pedidos });
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
});
//Rota get para a página de detalhes dos pedidos para o adm
app.get('/detalhes-pedidoAdm', (req, res) => {
  try {
    const pedidoAdmHtmlContent = fs.readFileSync(path.join(__dirname, "html", "detalhesPedidosAdm.html"), "utf-8");
    res.send(pedidoAdmHtmlContent);
  } catch (err) {
    console.log("Erro ao ler o arquivo detalhesPedidosAdm.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para obter saldo
app.get('/api/balance', async (req, res) => {
  try {
    // Calcular o saldo total do admin
    const adminBalance = await Saques.sum('valorAdm', {
      where: {
        admSacou: false
      }
    });

    res.json({ adminBalance: adminBalance.toFixed(2) });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
});
//Rota para fazer o saque do valor disponível do pagarme
app.post('/api/withdraw', async (req, res) => {
  const { amount } = req.body; // Extraindo amount de req.body
  const amountNumber = Number(amount); // Convertendo amount para número
  console.log(amountNumber);
  try {
    const response = await axios.post('https://api.pagar.me/1/transfers', {
      api_key: apiKey,
      amount: amountNumber * 100, // convertendo para centavos
      recipient_id: 're_clvchabno0fqc019tlus65sde' // Substitua com o ID do recebedor
    });
    console.log(response)
    //if(response.data.status == )
    res.json(response.data);
  } catch (error) {
    console.error('Error making withdrawal:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao fazer saque' });
  }
});
//Rota get para a página de saldo da gráfica
app.get('/saldo-grafica', (req, res) => {
  try {
  const saldoGraficaHtmlContent = fs.readFileSync(path.join(__dirname, "html", "saldo-grafica.html"), "utf-8");
  res.send(saldoGraficaHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo saldo-grafica.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
app.get('/api/saldo-grafica', async (req, res) => {
  const { graficaId } = req.query; // Recebe o ID da gráfica via query parameter

  if (!graficaId) {
    return res.status(400).json({ error: 'ID da gráfica é necessário' });
  }

  try {
    // Obter a data atual
    const now = new Date();
    
    // Calcular o saldo total da gráfica considerando a data de elegibilidade e o ID da gráfica
    const graficaBalance = await Saques.sum('valorGrafica', {
      where: {
        graficaSacou: false,
        idGrafica: graficaId,
        dataElegibilidade: {
          [Op.lte]: now
        }
      }
    });

    res.json({ graficaBalance: graficaBalance ? graficaBalance.toFixed(2) : '0.00' });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
});
app.get('/api/full-balance-grafica', async (req, res) => {
  const { graficaId } = req.query; // Recebe o ID da gráfica via query parameter

  if (!graficaId) {
    return res.status(400).json({ error: 'ID da gráfica é necessário' });
  }

  try {
    // Calcular o saldo total da gráfica considerando a data de elegibilidade e o ID da gráfica
    const graficaBalance = await Saques.sum('valorGrafica', {
      where: {
        graficaSacou: false,
        idGrafica: graficaId
      }
    });

    // Se não houver saldo, definir como 0
    const total = graficaBalance ? parseFloat(graficaBalance) : 0.00;

    // Calcular o valor com desconto de 3,5%
    const desconto = total * 0.035;
    const valorComDesconto = total - desconto;

    res.json({
      total: total.toFixed(2),
      desconto: desconto.toFixed(2),
      valorComDesconto: valorComDesconto.toFixed(2)
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
});
// Rota para fazer o saque do valor disponível do Pagar.me
app.post('/api/withdraw-grafica', async (req, res) => {
  let { amount, recipient_id } = req.body; // valor a ser sacado
  amount = Math.round(amount * 100);

  if (amount <= 0) {
    return res.status(400).json({ error: 'O valor do saque deve ser positivo' });
  }

  try {
    const now = new Date();
    // Buscar os pedidos elegíveis para saque
    const pedidosParaSaque = await Saques.findAll({
      where: {
        graficaSacou: false,
        dataElegibilidade: {
          [Op.lte]: now
        }
      }
    });

    // Calcular o valor total disponível para saque
    let totalDisponivel = 0;
    for (const pedido of pedidosParaSaque) {
      totalDisponivel += Number(pedido.valorGrafica);
    }

    // Verificar se o valor solicitado está disponível
    if (amount > totalDisponivel) {
      console.log("Valor solicitado excede o saldo disponível");
      return res.status(400).json({ error: 'Valor solicitado excede o saldo disponível' });
    }

    // Realizar o saque usando a API do Pagar.me
    const response = await axios.post(
      `https://api.pagar.me/core/v5/recipients/${recipient_id}/withdrawals`,
      {
        amount: amount
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(pagarmeKeyProd + ':').toString('base64')}`
        }
      }
    );

    // Marcar os pedidos como sacados até que o valor total sacado seja coberto
    let totalSaque = 0;
    for (const pedido of pedidosParaSaque) {
      if (totalSaque + Number(pedido.valorGrafica) <= amount) {
        totalSaque += Number(pedido.valorGrafica);
        pedido.graficaSacou = true;
        await pedido.save();
      } else {
        break;
      }
    }

    res.json({
      message: 'Saque realizado com sucesso',
      totalSaque: totalSaque,
      response: response.data
    });
  } catch (error) {
    console.error('Erro ao fazer saque:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao fazer saque' });
  }
});
app.post('/api/full-withdraw-grafica', async (req, res) => {
  let { amount, recipient_id } = req.body; // valor a ser sacado
  amount = Math.round(amount * 100);

  if (amount <= 0) {
    return res.status(400).json({ error: 'O valor do saque deve ser positivo' });
  }

  try {
        // Buscar os pedidos elegíveis para saque
        const pedidosParaSaque = await Saques.findAll({
          where: {
            graficaSacou: false,
          }
        });
    // Calcular o valor total disponível para saque
    let totalDisponivel = 0;
    for (const pedido of pedidosParaSaque) {
      totalDisponivel += Number(pedido.valorGrafica);
    }

    // Verificar se o valor solicitado está disponível
    if (amount > totalDisponivel) {
      console.log("Valor solicitado excede o saldo disponível");
      return res.status(400).json({ error: 'Valor solicitado excede o saldo disponível' });
    }

    // Realizar o saque usando a API do Pagar.me
    const response = await axios.post(
      `https://api.pagar.me/core/v5/recipients/${recipient_id}/withdrawals`,
      {
        amount: amount
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(pagarmeKeyProd + ':').toString('base64')}`
        }
      }
    );

    // Marcar os pedidos como sacados até que o valor total sacado seja coberto
    let totalSaque = 0;
    for (const pedido of pedidosParaSaque) {
      if (totalSaque + Number(pedido.valorGrafica) <= amount) {
        totalSaque += Number(pedido.valorGrafica);
        pedido.graficaSacou = true;
        await pedido.save();
      } else {
        break;
      }
    }

    res.json({
      message: 'Saque realizado com sucesso',
      totalSaque: totalSaque,
      response: response.data
    });
  } catch (error) {
    console.error('Erro ao fazer saque:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao fazer saque' });
  }
});
//Rota get para mostrar a página de locais de retirada
app.get('/retirada', (req, res) => {
  try {
    const retiradaContentHtml = fs.readFileSync(path.join(__dirname, "html", "retirada.html"), "utf-8");
    res.send(retiradaContentHtml);
  }catch(error) {
    console.log("Erro ao ler o arquivo retirada.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para página de tutoriais do usuário
app.get('/tutoriais', (req, res) => {
  try {
    const tutoriaisContentHtml = fs.readFileSync(path.join(__dirname, "html", "tutoriais.html"), "utf-8");
    res.send(tutoriaisContentHtml);
  } catch(err) {
    console.log("Erro ao ler o arquivo tutoriais.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para página de cadastro de produtos via planilha
app.get('/cadastro-planilha', (req, res) => {
  try {
    const cadastroPlanilhaContentHtml = fs.readFileSync(path.join(__dirname, "html", "cadastro-produtos-planilha.html"), "utf-8");
    res.send(cadastroPlanilhaContentHtml);
  } catch(err) {
    console.log("Erro ao ler o arquivo cadatro-produtos-planilha.html", err);
    res.status(500).send("Erro interno do servidor", err)
  }
});
//Rota get para formulário para solicitações de novos parceiros
app.get('/seja-um-parceiro', (req, res) => {
  try {
    const formParceiroContentHtml = fs.readFileSync(path.join(__dirname, "html", "parceiro.html"), "utf-8");
    res.send(formParceiroContentHtml)
  } catch (err) {
    console.log("Erro ao ler o arquivo parceiro.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para a página para envio de e-mail para redefinir a senha
app.get('/esqueci-senha', (req, res) => {
  try {
    const esqueciContentHtml = fs.readFileSync(path.join(__dirname, "html", "esqueci-senha.html"), "utf-8");
    res.send(esqueciContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo esqueci-senha.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para página de link enviado
app.get('/link-enviado', (req, res) => {
  try {
    const linkEnviadoContentHtml = fs.readFileSync(path.join(__dirname, "html", "link-enviado.html"), "utf-8");
    res.send(linkEnviadoContentHtml);
  } catch (err) {
    console.log("Erro ao ler o arquivo link-enviado.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para página para redefinir senha
app.get('/redefinir-senha', (req, res) => {
  try {
    const redefinirSenhaHtmlContent = fs.readFileSync(path.join(__dirname, "html", "redefinir-senha.html"), "utf-8");
    res.send(redefinirSenhaHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo redefinir-senha.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});

//ROTAS IMPRIMEAI EMPRESAS

//Rota get para a página de cadastro
app.get('/empresas/cadastro', (req, res) => {
  try {
    const cadastroEmpresasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cadastroUser-empresas.html"), "utf-8");
    res.send(cadastroEmpresasHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo cadastroUser-empresas.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para a página de cadastro de marcas
app.get('/empresas/cadastro-marcas', (req, res) => {
  try {
    const cadastroMarcasEmpresasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "cadastro-marcas.html"), "utf-8");
    res.send(cadastroMarcasEmpresasHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo cadastro-marcas.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para a página de login
app.get('/empresas/login', (req, res) => {
  try {
    const loginEmpresasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "login-empresas.html"), "utf-8");
    res.send(loginEmpresasHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo login.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});
//Rota get para página de cadastro de produtos exclusivos via planilha
app.get('/empresas/cadastro-planilha-exclusivos', (req, res) => {
  try {
    const cadastroPlanilhaContentHtml = fs.readFileSync(path.join(__dirname, "html", "cadastro-produtosexclusivos-planilha.html"), "utf-8");
    res.send(cadastroPlanilhaContentHtml);
  } catch(err) {
    console.log("Erro ao ler o arquivo cadatro-produtosexclusivos-planilha.html", err);
    res.status(500).send("Erro interno do servidor", err)
  }
});
//Rota get para o painel dinâmico da loja
/*app.get('/:empresa/inicio', (req, res) => {
  try {
    const portalEmpresaHtmlContent = fs.readFileSync(path.join(__dirname, "html", "portal.html"), "utf-8");
    res.send(portalEmpresaHtmlContent);
  } catch(err) {
    console.log("Erro ao ler o arquivo portal.html", err);
    res.status(500).send("Erro interno do servidor", err);
  }
});*/
app.get('/api/empresa/nome', (req, res) => {
  const empresa = decodeURIComponent(req.cookies.empresa || '');
  if (!empresa) {
    return res.status(400).json({ message: 'Nome da empresa não encontrado.' });
  }
  res.json({ empresa });
});
//Rota get para pegar informações da empresa
app.get('/api/empresa/logo', async (req, res) => {
  try {
    // Recupera o nome da empresa dos cookies
    const empresaCookie = req.cookies.empresa;

    if (!empresaCookie) {
      return res.status(400).json({ message: 'Nome da empresa não encontrado nos cookies.' });
    }

    // Decodifica o nome da empresa
    const nomeEmpresa = decodeURIComponent(empresaCookie);

    // Busca a empresa no banco de dados
    const empresa = await Empresas.findOne({
      where: { nome: nomeEmpresa },
      attributes: ['logo'], // Retorna apenas o campo logo
    });

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }

    // Converte o BLOB para base64 e retorna
    const logoBase64 = empresa.logo.toString('base64');
    res.json({ logo: `data:image/png;base64,${logoBase64}` });
  } catch (error) {
    console.error('Erro ao buscar a logo da empresa:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});
//Rota get para pegar os produtos da empresa
app.get('/api-produtos/empresa', async (req, res) => {
  try {
    // Recupera o nome da empresa dos parâmetros da URL
    const empresa = req.cookies.empresa;
    console.log(empresa)
    // Validação básica do parâmetro
    if (!empresa) {
      return res.status(400).json({ error: "Nome da empresa não fornecido ou inválido." });
    }

    // Busca os produtos no banco filtrando pelo nome da empresa
    const produtos = await ProdutosExc.findAll({
      where: { empresa }, // Substitua "empresa" pelo nome exato da coluna no banco
    });

    // Verifica se encontrou produtos
    if (produtos.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado para esta empresa." });
    }

    // Retorna os produtos encontrados
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos. Tente novamente mais tarde." });
  }
});
//Rotas get para mostrar o produto e as suas variações
app.get('/produto-empresa/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await ProdutosExc.findByPk(productId); // Use o método correto para buscar o produto

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
app.get('/produto-empresa/:id/gabarito', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await ProdutosExc.findByPk(productId);

    if (!produto || !produto.gabaritoProd) {
      return res.status(404).json({ mensagem: 'Gabarito não encontrado' });
    }

    // Tratamento do conteúdo do PDF
    const pdfContent = Buffer.from(produto.gabaritoProd, 'binary'); // Assumindo que o conteúdo está armazenado como string
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${produto.nomeProd}_gabarito.pdf`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Erro ao baixar gabarito:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});
app.get('/variacoes-produto-empresa/:id', async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    // Buscar as variações do produto com base no ID do produto
    const variacoes = await VariacoesProdutoExc.findAll({
      where: { idProduto: produtoId }
    });

    res.json(variacoes);
  } catch (error) {
    console.error('Erro ao buscar variações do produto:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});
app.get('/api/quantidades-empresa/:produtoId', async (req, res) => {
  try {
    const { produtoId } = req.params;

    // Encontre as variações do produto pelo ID do produto
    const variacoesProduto = await VariacoesProdutoExc.findOne({
      where: { idProduto: produtoId },
    });

    if (!variacoesProduto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Converta as quantidades de volta para um array de números
    const quantidades = JSON.parse(variacoesProduto.quantidades);

    res.json({ quantidades });
  } catch (error) {
    console.error('Erro ao obter as quantidades:', error);
    res.status(500).json({ error: 'Erro ao obter as quantidades' });
  }
});
// Rota dinâmica para carregar a página de pedidos do usuário com o nome da empresa
app.get('/:empresa/pedidos-usuario', (req, res) => {
  try {
    const { empresa } = req.params;

    // Validação básica para o nome da empresa
    if (!empresa) {
      return res.status(400).send("Nome da empresa não fornecido.");
    }

    // Carrega o arquivo HTML de carrinho
    const pedidosHtmlContent = fs.readFileSync(
      path.join(__dirname, 'html', 'pedidosUsuario-empresa.html'),
      'utf-8'
    );

    // Serve o arquivo HTML
    res.send(pedidosHtmlContent);
  } catch (err) {
    console.error("Erro ao carregar a página pedidosUsuario-empresa.html", err);
    res.status(500).send("Erro interno do servidor.");
  }
});
// Rota dinâmica para carregar a página de pedidos do usuário com o nome da empresa
app.get('/:empresa/detalhesPedidosUser', (req, res) => {
  try {
    const { empresa } = req.params;

    // Validação básica para o nome da empresa
    if (!empresa) {
      return res.status(400).send("Nome da empresa não fornecido.");
    }

    // Carrega o arquivo HTML de carrinho
    const pedidosHtmlContent = fs.readFileSync(
      path.join(__dirname, 'html', 'detalhesPedidosUser-empresa.html'),
      'utf-8'
    );

    // Serve o arquivo HTML
    res.send(pedidosHtmlContent);
  } catch (err) {
    console.error("Erro ao carregar a página detalhesPedidosUser-empresa.html", err);
    res.status(500).send("Erro interno do servidor.");
  }
});
app.get('/pagamento-empresas', (req, res) => {
  try {
    const pagamentoEmpresasHtmlContent = fs.readFileSync(path.join(__dirname, "html", "pagamento-empresa.html"), "utf-8");
    res.send(pagamentoEmpresasHtmlContent);
  } catch(err) {
    console.log("Erro ao carregar a página pagamento-empresa.html", err);
    res.status(500).send("Erro interno do servidor.")
  }
});
//Rota get para tela de login de usuários do portal da CPQ
app.get('/cpq/', (req, res) => {
  try {
    const cpqLoginHtmlContent = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "login.html"), "utf-8");
    res.send(cpqLoginHtmlContent);
  } catch(err) {
    console.log("Erro ao carregar a página login.html", err);
    res.status(500).send("Erro interno do servidor.")
  }
});
//Rota get para a tela do portal de usuários da CPQ
app.get('/cpq/inicio', (req, res) => {
  try {
    const cpqInicioHtmlContent = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "portal.html"), "utf-8");
    res.send(cpqInicioHtmlContent);
  } catch(err) {
    console.log("Erro ao carregar a página portal.html", err);
    res.status(500).send("Erro interno do servidor.")
  }
});
// Rota get para pegar as categorias do usuário
app.get("/categorias-produtos-usuario/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const categorias = await getCategoriasPorProdutosUsuario(userId);

    res.json({
      message: "Categorias únicas recuperadas com sucesso.",
      categorias,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//Rota de api para pegar produtos
app.get('/api-produtos/cpq', async (req, res) => {
  try {
    // Recupera o nome da empresa dos parâmetros da URL
    const empresa = "Casa do Pão de Queijo";
    const userId = req.cookies.userId;
    console.log(empresa)
    // Validação básica do parâmetro
    if (!empresa) {
      return res.status(400).json({ error: "Nome da empresa não fornecido ou inválido." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    // Busca o registro do usuário na tabela UserEmpresas
    const user = await UserEmpresas.findOne({
      where: { id: userId },
      attributes: ['produtos'], // Busca apenas a coluna de produtos
    });

    if (!user || !user.produtos) {
      return res.status(404).json({
        error: "Produtos não encontrados para este usuário.",
      });
    }

    // Converte os produtos (JSON) em um array de chaves
    // Converte os produtos (JSON) em um array de chaves, removendo espaços extras
    const produtosUsuario = Object.keys(user.produtos)
      .filter((key) => user.produtos[key] === true)
      .map((produto) => produto.trim()); // Remove espaços em torno do nome do produto


    if (produtosUsuario.length === 0) {
      return res.status(404).json({
        message: "Nenhum produto habilitado para este usuário.",
      });
    }
      
    // Busca os produtos no banco filtrando pelo nome da empresa e lista de produtos
    const produtos = await ProdutosExc.findAll({
      where: {
        empresa, // Certifique-se de que "empresa" é o nome correto da coluna no banco
        nomeProd: { [Sequelize.Op.in]: produtosUsuario }, // Usando Sequelize.Op.in para filtrar pela lista
      },
    });

    // Verifica se encontrou produtos
    if (produtos.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado para esta empresa." });
    }

    // Retorna os produtos encontrados
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos. Tente novamente mais tarde." });
  }
});
// Rota dinâmica para carregar a página de detalhes do produto da cpq
app.get('/cpq/detalhes-produtos', (req, res) => {
  try {
    const { empresa } = "Casa do Pão de Queijo";

    // Carrega o arquivo HTML de detalhes do produto
    const detalhesHtmlContent = fs.readFileSync(
      path.join(__dirname, 'html/empresas_cpq_html', 'detalhes-produtos.html'),
      'utf-8'
    );

    // Serve o arquivo HTML
    res.send(detalhesHtmlContent);
  } catch (err) {
    console.error("Erro ao carregar a página detalhes-produtos.html", err);
    res.status(500).send("Erro interno do servidor.");
  }
});
//Rotas get para mostrar o produto e as suas variações
app.get('/produto-empresa/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await ProdutosExc.findByPk(productId); // Use o método correto para buscar o produto

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
app.get('/produto-empresa/:id/gabarito', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const produto = await ProdutosExc.findByPk(productId);

    if (!produto || !produto.gabaritoProd) {
      return res.status(404).json({ mensagem: 'Gabarito não encontrado' });
    }

    // Tratamento do conteúdo do PDF
    const pdfContent = Buffer.from(produto.gabaritoProd, 'binary'); // Assumindo que o conteúdo está armazenado como string
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${produto.nomeProd}_gabarito.pdf`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Erro ao baixar gabarito:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});
app.get('/variacoes-produto-empresa/:id', async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    // Buscar as variações do produto com base no ID do produto
    const variacoes = await VariacoesProdutoExc.findAll({
      where: { idProduto: produtoId }
    });

    res.json(variacoes);
  } catch (error) {
    console.error('Erro ao buscar variações do produto:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});
app.get('/api/quantidades-empresa/:produtoId', async (req, res) => {
  try {
    const { produtoId } = req.params;

    // Encontre as variações do produto pelo ID do produto
    const variacoesProduto = await VariacoesProdutoExc.findOne({
      where: { idProduto: produtoId },
    });

    if (!variacoesProduto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Converta as quantidades de volta para um array de números
    const quantidades = JSON.parse(variacoesProduto.quantidades);

    res.json({ quantidades });
  } catch (error) {
    console.error('Erro ao obter as quantidades:', error);
    res.status(500).json({ error: 'Erro ao obter as quantidades' });
  }
});
// Rota dinâmica para carregar a página de carrinho da cpq
app.get('/cpq/carrinho', (req, res) => {
  try {
    // Carrega o arquivo HTML de carrinho
    const carrinhoHtmlContent = fs.readFileSync(
      path.join(__dirname, 'html/empresas_cpq_html', 'carrinho.html'),
      'utf-8'
    );

    // Serve o arquivo HTML
    res.send(carrinhoHtmlContent);
  } catch (err) {
    console.error("Erro ao carregar a página carrinho-empresa.html", err);
    res.status(500).send("Erro interno do servidor.");
  }
});
//Rota para pesquisa de produtos da cpq
app.post('/pesquisar-produtos-cpq', async (req, res) => {
  try {
    const { query } = req.body;

    // Realize a pesquisa de produtos usando o operador "like" para correspondência parcial
    const produtos = await ProdutosExc.findAll({
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
// Rota dinâmica para carregar a página de carrinho da cpq
app.get('/cpq/perfil', (req, res) => {
  try {
    // Carrega o arquivo HTML de carrinho
    const perfilHtmlContent = fs.readFileSync(
      path.join(__dirname, 'html/empresas_cpq_html', 'perfil.html'),
      'utf-8'
    );

    // Serve o arquivo HTML
    res.send(perfilHtmlContent);
  } catch (err) {
    console.error("Erro ao carregar a página perfil.html", err);
    res.status(500).send("Erro interno do servidor.");
  }
});
//Rota get para pegar os dados do perfil do usuário
app.get("/perfil/dados-empresa", async (req, res) => {
  try {
    // Verifique se o cookie "userId" está definido
    const userId = req.cookies.userId

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Use o modelo User para buscar o usuário no banco de dados pelo ID
    const user = await UserEmpresas.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna os dados do usuário como JSON
    res.json({
      emailCad: user.emailCad,
      cepCad: user.cepCad,
      cidadeCad: user.cidadeCad,
      estadoCad: user.estadoCad,
      endereçoCad: user.endereçoCad,
      telefoneCad: user.telefoneCad,
      numCad: user.numCad,
      compCad: user.compCad,
      bairroCad: user.bairroCad,
      cnpjCad: user.cnpjCad,
      userCad: user.userCad,
      userId: userId,
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
app.get('/enderecos-empresa/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
      const enderecos = await EnderecosEmpresas.findAll({ where: { id_usuario } });
      res.status(200).json(enderecos);
  } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar endereços.' });
  }
});
app.get('/cpq/categorias', (req,res) => {
  try {
    const categoriasHtmlContent = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "categorias.html"), "utf8");
    res.send(categoriasHtmlContent);
  } catch (err) {
    console.error("Erro ao ler o arquivo categorias.html:", err);
    res.status(500).send("Erro interno do servidor");
  }
});
// Função para renderizar os produtos com caching
app.get('/api/produtos-empresas/:categoria', async (req, res) => {
  const { page = 1, limit = 1000 } = req.query;
  const categoria = req.params.categoria;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const produtos = await getCachedProductsByCategoryEmpresas(userId, categoria, page, limit);
    res.json({
      totalItems: produtos.count,
      totalPages: Math.ceil(produtos.count / limit),
      currentPage: parseInt(page),
      produtos: produtos.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função para obter produtos de uma categoria específica com caching
const getCachedProductsByCategoryEmpresas = async (userId, categoria, page, limit) => {
  console.log("Categoria buscada: ", categoria);

  // Recupera os produtos habilitados para o usuário
  const user = await UserEmpresas.findOne({
    where: { id: userId },
    attributes: ['produtos'],
  });

  if (!user || typeof user.produtos !== 'object') {
    throw new Error("Produtos não encontrados ou inválidos para este usuário.");
  }

  const produtosUsuario = Object.keys(user.produtos)
    .filter((key) => user.produtos[key] === true)
    .map((produto) => produto.trim());

  if (produtosUsuario.length === 0) {
    throw new Error("Nenhum produto habilitado para este usuário.");
  }

  // Gera uma chave de cache que inclui o ID do usuário e a lista de produtos habilitados
  const cacheKey = `${userId}:${categoria}:products:${page}:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // Busca produtos que correspondem à categoria e são habilitados para o usuário
  const produtos = await ProdutosExc.findAndCountAll({
    where: {
      [Op.and]: [
        { 
          nomeProd: { [Op.in]: produtosUsuario },
        },
        {
          [Op.or]: [
            { categProd: categoria },
            { categProd2: categoria },
            { categProd3: categoria },
          ],
        },
      ],
    },
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['nomeProd', 'ASC']],
  });

  await client.set(cacheKey, JSON.stringify(produtos), {
    EX: 3600, // Expira após 1 hora
  });

  return produtos;
};

app.get('/cpq/painel-administrativo', (req,res) => {
  try {
    const administrativoHtmlContent = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "administrativo.html"), "utf8");
    res.send(administrativoHtmlContent);
  } catch (err) {
    console.error("Erro ao ler o arquivo administrativo.html:", err);
    res.status(500).send("Erro interno do servidor");
  }
});
app.get('/allusers', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'userCad', 'emailCad', 'telefoneCad']
    });

    const usersWithBalance = await Promise.all(users.map(async user => {
      const userId = user.id;

      const saldoDepositosPagos = await Carteira.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'PAGO'
        }
      }) || 0;

      const saldoSaidas = await Carteira.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'SAIDA'
        }
      }) || 0;

      const saldoFinal = saldoDepositosPagos - saldoSaidas;

      return {
        id: user.id,
        name: user.userCad,
        email: user.emailCad,
        telefoneCad: user.telefoneCad,
        balance: saldoFinal
      };
    }));

    res.json(usersWithBalance);

  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});
app.get('/saldo-allusers', async (req, res) => {
  try {
      const users = await UsersEmpresas.findAll({ attributes: ['id', 'userCad', 'emailCad'] });

      const usersWithBalance = await Promise.all(users.map(async user => {
          const carteira = await CarteiraEmpresas.findOne({ where: { userId: user.id } }); // findPkId (Find by Primary Key)
          return {
              id: user.id,
              name: user.userCad,
              email: user.emailCad,
              balance: carteira ? carteira.saldo : 0
          };
      }));

      res.json(usersWithBalance);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar usuários e saldos' });
  }
});

app.get('/pedidos-allusers', async (req, res) => {
  try {
    const { userId } = req.params;

    const pedidos = await Pedidos.findAll({
        where: { idUserPed: userId },
        include: [
            {
                model: ItensPedido,
                where: { tipo: "Empresas" },
                attributes: ["idPed", "statusPed"],
                required: true
            }
        ]
    });

    // Remover pedidos duplicados pelo idPedido
    const pedidosUnicos = [];
    const pedidosMap = new Set();

    pedidos.forEach(pedido => {
      const idPedido = pedido.ItensPedidos[0].idPed; // Ajustado para acessar corretamente a relação
      if (!pedidosMap.has(idPedido)) {
          pedidosMap.add(idPedido);
          pedidosUnicos.push({
              idPedido,
              statusPed: pedido.ItensPedidos[0].statusPed
          });
      }
  });

    res.json({ pedidos: pedidosUnicos });
} catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
}
});

app.get('/cpq/login-adm', (req, res) => {
  try {
    const loginAdmContentHtml = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "login-adm.html"), "utf8");
    res.send(loginAdmContentHtml)
  } catch (error) {
    console.error("Erro ao ler o arquivo login-adm.html:", err);
    res.status(500).send("Erro interno do servidor");
  }
});

app.get('/cpq/esqueci-senha', (req, res) => {
  try {
    const esqueciContentHtml = fs.readFileSync(path.join(__dirname, "html/empresas_cpq_html", "esqueci-senha.html"), "utf-8");
    res.send(esqueciContentHtml);
  } catch (error) {
    console.error("Erro ao ler o arquivo esqueci-senha.html:", error);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota GET para projetos especiais
app.get('/projetos-especiais', (req,res) => {
  try {
    const projetosContentHtml = fs.readFileSync(path.join(__dirname, "html", "projetos-especiais.html"), "utf-8");
    res.send(projetosContentHtml);
  } catch (error) {
    console.error("Erro ao let o arquivo projetos-especiais.html:", error);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota POST para solicitar orçamento
app.post("/solicitar-orcamento", upload.single("anexo"), async(req, res) => {
  try {
      const { nome, celular, quantidade, largura, altura, impressao, material, acabamento, cobertura, observacoes } = req.body;
      const anexo = req.file ? req.file.filename : null; // Nome do arquivo salvo
      console.log("Arquivo recebido:", req.file);

      const corpoHtml = `
      <h2>📩 Solicitação de Orçamento - Imprimeai</h2>
      <p>Olá, equipe da Imprimeai!</p>
      <p>Gostaria de solicitar um orçamento para um serviço de impressão. Seguem abaixo os detalhes do meu pedido:</p>
      <ul>
        <li><strong>Nome:</strong> ${nome}</li>
        <li><strong>Celular:</strong> ${celular}</li>
        <li><strong>Quantidade:</strong> ${quantidade}</li>
        <li><strong>Dimensões:</strong> ${largura} x ${altura} cm</li>
        <li><strong>Tipo de Impressão:</strong> ${impressao}</li>
        <li><strong>Material:</strong> ${material}</li>
        <li><strong>Acabamento:</strong> ${acabamento}</li>
        <li><strong>Cobertura:</strong> ${cobertura}</li>
        <li><strong>Observações adicionais:</strong> ${observacoes || "Nenhuma"}</li>
      </ul>
      ${anexo ? "<p>📎 Além disso, estou anexando um arquivo relacionado ao pedido para referência.</p>" : ""}
      <p>Aguardo o retorno com o orçamento e prazo estimado para produção. Caso precisem de mais informações, fico à disposição.</p>
      <p><strong>Atenciosamente,</strong><br>
      ${nome}<br>
      ${celular}</p>
    `;

    await enviarEmailNotificacao('contato@imprimeai.com.br', 'Nova Solicitação de Orçamento', corpoHtml);
      // Simulação de resposta (substituir por lógica de banco de dados se necessário)
      return res.json({
          success: true,
          message: "Orçamento recebido com sucesso!",
      });
  } catch (error) {
      return res.status(500).json({ success: false, message: "Erro no envio do orçamento", error: error.message });
  }
});
//Rota GET para o painel administrativo
app.get('/administradores/painel', (req, res) => {
  try {
    const painelAdmContentHtml = fs.readFileSync(path.join(__dirname, "html", "administrativo.html"), "utf-8");
    res.send(painelAdmContentHtml)
  } catch (error) {
    console.error("Erro ao ler o arquivo administrativo.html:", error);
    res.status(500).send("Erro interno do servidor");
  }
});
//Rota GET para página de edição de informações do usuários
app.get('/administradores/editar-usuario', (req, res) => {
try {
  const editarUsuariosContentHtml = fs.readFileSync(path.join(__dirname, "html", "editar-user.html"), "utf-8");
  res.send(editarUsuariosContentHtml);
} catch (error) {
  console.error("Erro ao ler o arquivo editar-user.html:", error);
  res.status(500).send("Erro interno do servidor");
}
});
// Rota DElETE para deletar usuários
app.delete('/users/:id', async(req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Excluir dados vinculados (pedidos, carteira, etc.)
    await Pedidos.destroy({ where: { idUserPed: id } });
    await ItensPedido.destroy({ where: { idUserPed: id } });
    await Carteira.destroy({ where: { userId: id } });

    // Excluir o próprio usuário
    await user.destroy();

    res.json({ message: 'Usuário e dados relacionados excluídos com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno ao excluir usuário' });
  }
});
// Rota GET para buscar pedidos por usuário
app.get('/pedidos/usuario/:userId', async(req, res) => {
  try {
    const { userId } = req.params;

    const pedidos = await Pedidos.findAll({
      where: { idUserPed: userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ItensPedido,
          where: { idUserPed: userId },
          required: false
        },
        {
          model: Enderecos,
          required: false
        }
      ]
    });

    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos do usuário' });
  }
});
// Rota GET para a página de histórico de pedidos
app.get('/administradores/historico-pedidos', async(req, res) => {
  try {
    const historicoPedidosContentHtml = fs.readFileSync(path.join(__dirname, "html", "historico-pedidos.html"), "utf-8");
    res.send(historicoPedidosContentHtml);
  } catch (error) {
    console.error("Erro ao ler o arquivo historico-pedidos.html:", error);
    res.status(500).send("Erro interno do servidor");
  }
});
// Rota GET para o filtro de pedidos por data, status e usuário
app.get('/api/pedidos', async(req, res) => {
  try {
  const { dataInicio, dataFim, status, usuarioId } = req.query;
    const where = {};

    if (status) {
      where.statusPed = status;
    }

    if (usuarioId) {
      where.idUserPed = usuarioId;
    }

    if (dataInicio && dataFim) {
      where.createdAt = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const pedidos = await Pedidos.findAll({
      where,
      include: [ItensPedido, Enderecos]
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});
// Rota PUT para atualizar status do pedido
app.put('/atualizar-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const pedidoId = req.params.id;

    const pedido = await Pedidos.findByPk(pedidoId, {
      include: [{ model: ItensPedido, as: 'itenspedidos' }]
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Atualiza o status do pedido
    pedido.statusPed = status;
    await pedido.save();

    // Atualiza o status de cada item do pedido
    for (const item of pedido.itenspedidos) {
      item.statusPed = status;
      await item.save();
    }

    res.json({ success: true, pedido });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
// Rota GET para exportar pedidos em CSV
app.get('/exportar-pedidos/csv', async (req, res) => {
  try {
    const pedidos = await Pedidos.findAll({
      include: [{ model: ItensPedido, as: 'itenspedidos' }],
      order: [['createdAt', 'DESC']]
    });

    const dados = pedidos.map(ped => {
      const item = ped.itenspedidos?.[0] || {};
      return {
        ID: ped.id,
        Produto: item.nomeProd || '-',
        Quantidade: item.quantidade || '-',
        Status: item.statusPed || ped.statusPed,
        Data: new Date(ped.createdAt).toLocaleDateString('pt-BR')
      };
    });

    const json2csv = new Parser();
    const csv = json2csv.parse(dados);

    res.header('Content-Type', 'text/csv');
    res.attachment('pedidos.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Erro ao exportar CSV:', err);
    res.status(500).json({ error: 'Erro ao gerar CSV' });
  }
});
// Rota GET para exportar pedidos em PDF
app.get('/exportar-pedidos/pdf', async (req, res) => {
  try {
    const pedidos = await Pedidos.findAll({
      include: [{ model: ItensPedido, as: 'itenspedidos' }],
      order: [['createdAt', 'DESC']]
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos.pdf');

    doc.fontSize(18).text('Relatório de Pedidos', { align: 'center' });
    doc.moveDown();

    pedidos.forEach(ped => {
      const item = ped.itenspedidos?.[0] || {};
      doc.fontSize(12).text(`ID: #${ped.id}`);
      doc.text(`Produto: ${item.nomeProd || '-'}`);
      doc.text(`Quantidade: ${item.quantidade || '-'}`);
      doc.text(`Status: ${item.statusPed || ped.statusPed}`);
      doc.text(`Data: ${new Date(ped.createdAt).toLocaleDateString('pt-BR')}`);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Erro ao exportar PDF:', err);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});
// Rota GET das informações gerais do painel
app.get('/dashboard/resumo-geral', async (req, res) => {
  try {
    const totalUsuarios = await User.count();

    const totalPedidos = await Pedidos.count();

    const resultadoCarteira = await Carteira.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('saldo')), 'totalSaldo']
      ],
      raw: true
    });

    const totalSaldoCarteiras = parseFloat(resultadoCarteira[0].totalSaldo || 0).toFixed(2);

    res.json({
      totalUsuarios,
      totalPedidos,
      totalSaldoCarteiras
    });
  } catch (error) {
    console.error('Erro ao buscar resumo geral:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo geral' });
  }
});
// Rota GET para pedidos mensais
app.get('/dashboard/pedidos-mensais', async (req, res) => {
  try {
    const resultados = await Pedidos.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'mes'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'quantidade']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });

    const dados = resultados.map(r => ({
      mes: r.get('mes'),
      quantidade: r.get('quantidade')
    }));

    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar pedidos mensais:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar dados' });
  }
});
// Rota GET para os usuarios mensais
app.get("/dashboard/usuarios-mensais", async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'mes'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'quantidade']
      ],
      group: [Sequelize.fn('MONTH', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'ASC']]
    });

    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dados = usuarios.map(u => ({
      mes: meses[u.dataValues.mes - 1],
      quantidade: u.dataValues.quantidade
    }));

    res.json(dados);
  } catch (error) {
    console.error("Erro ao obter dados de usuários mensais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// Rota GET para movimentações da carteira
app.get("/dashboard/movimentacoes-carteira", async (req, res) => {
  try {
    const movimentacoes = await TransacoesCarteira.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'mes'],
        [Sequelize.fn('SUM', Sequelize.col('valor')), 'total']
      ],
      group: [Sequelize.fn('MONTH', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'ASC']]
    });

    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const dados = movimentacoes.map(m => ({
      mes: meses[m.dataValues.mes - 1],
      total: parseFloat(m.dataValues.total)
    }));

    res.json(dados);
  } catch (error) {
    console.error("Erro ao obter dados de movimentações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// Rota GET para listar todos os admins
app.get("/admin/admins", async (req, res) => {
  const admins = await User.findAll({ where: { tipo: "admin" } });
  res.json(admins);
});
//Rota POST para cadastrar administrador
app.post("/admins", async (req, res) => {
  const { nome, email, senha } = req.body;

  const hashedPassword = await bcrypt.hash(senha, 10);
  const novoAdmin = await User.create({
    userCad: nome,
    emailCad: email,
    senha: hashedPassword,
    tipo: "admin"
  });

  res.json({ message: "Administrador criado com sucesso!", admin: novoAdmin });
});
// Rota DELETE para deletar administrador
app.delete("/admins/:id", async (req, res) => {
  const { id } = req.params;

  const admin = await User.findOne({ where: { id, tipo: "admin" } });
  if (!admin) return res.status(404).json({ message: "Administrador não encontrado" });

  await admin.destroy();
  res.json({ message: "Administrador excluído com sucesso!" });
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} https://localhost:${PORT}`);
});