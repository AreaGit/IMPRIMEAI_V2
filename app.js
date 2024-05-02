const express = require('express');
const app = express();
const PORT = 8082;
const fs = require('fs');
const path = require('path');
const cadastros = require('./routes/cadastros');
const pedidosUsers = require('./routes/pedidosUsers');
const Produtos = require('./models/Produtos');
const VariacoesProduto = require('./models/VariacoesProduto');
const { Op } = require('sequelize');
app.use(express.static(path.join(__dirname)));
app.use('/', cadastros);
app.use('/', pedidosUsers);
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
  try {
    // Consulta o banco de dados para obter os produtos de Comunicação Visual
    const produtosComunicacaoVisual = await Produtos.findAll({
      where: {
        categProd: 'Comunicação Visual',
      },
    });

    // Envia os produtos como resposta JSON
    res.json({ produtos: produtosComunicacaoVisual });
  } catch (error) {
    console.error('Erro ao buscar produtos de Comunicação Visual:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
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
  try {
    // Consulta o banco de dados para obter os produtos de Adesivos e Etiquetas
    const produtosAdesivosEtiquetas = await Produtos.findAll({
      where: {
        categProd: 'Adesivos e Etiquetas',
      },
    });

    // Envia os produtos como resposta JSON
    res.json({ produtos: produtosAdesivosEtiquetas });
  } catch (error) {
    console.error('Erro ao buscar produtos de Adesivos e Etiquetas:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
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
  try {
    // Consulta o banco de dados para obter os produtos de Brindes
    const produtosBrindes = await Produtos.findAll({
      where: {
        categProd: 'Brindes',
      },
    });

    // Envia os produtos como resposta JSON
    res.json({ produtos: produtosBrindes });
  } catch (error) {
    console.error('Erro ao buscar produtos de Brindes:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
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
  try {
    // Consulta o banco de dados para obter os produtos de Cartazes
    const produtosCartazes = await Produtos.findAll({
      where: {
        categProd: 'Cartazes',
      },
    });

    // Envia os produtos como resposta JSON
    res.json({ produtos: produtosCartazes });
  } catch (error) {
    console.error('Erro ao buscar produtos de Cartazes:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
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
//Rota get para renderizar os produtos de papelaria
app.get('/api/produtos/papelaria', async (req, res) => {
  try {
    // Consulta o banco de dados para obter os produtos de Cartazes
    const produtosPapelaria = await Produtos.findAll({
      where: {
        categProd: 'Papelaria',
      },
    });

    // Envia os produtos como resposta JSON
    res.json({ produtos: produtosPapelaria });
  } catch (error) {
    console.error('Erro ao buscar produtos de Papelaria:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
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
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} http://localhost:8082`);
});