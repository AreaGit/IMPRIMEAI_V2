const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const User = require('../models/User');
const Produtos = require('../models/Produtos');
const VariacoesProduto = require('../models/VariacoesProduto');
const Graficas = require('../models/Graficas');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/cadastrar", async (req, res) => { 
    try {
        const { userCad, cpfCad, endereçoCad, numCad, compCad, bairroCad, cepCad, cidadeCad, estadoCad, inscricaoEstadualCad, telefoneCad, emailCad, passCad } = req.body;
        const hashedPassword = await bcrypt.hash(passCad, 10);

            // Verifique se já existe um usuário com o mesmo CPF, email ou senha
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { emailCad: emailCad },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Já existe um usuário com este e-mail cadastrado",
      });
    }

        const newUser = await User.create({
            userCad: userCad,
            cpfCad: cpfCad,
            endereçoCad: endereçoCad,
            numCad: numCad,
            compCad: compCad,
            bairroCad: bairroCad,
            cepCad: cepCad,
            cidadeCad: cidadeCad,
            estadoCad: estadoCad,
            inscricaoEstadualCad: inscricaoEstadualCad,
            telefoneCad: telefoneCad,
            emailCad: emailCad,
            passCad: hashedPassword
        });

        res.json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
        
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
});

app.post("/login", async (req, res) => {
  try {
    const { emailCad, passCad } = req.body;

    // Verifique se o usuário existe no banco de dados
    const user = await User.findOne({ where: { emailCad: emailCad} });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const passwordMatch = await bcrypt.compare(passCad, user.passCad);

    // Verifique se a senha está correta
    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.cookie('userCad', user.userCad);
    res.cookie("userId", user.id);

    // Gere um token de autenticação (exemplo simples)
    const token = Math.random().toString(16).substring(2);

    res.json({ message: "Login bem-sucedido", token: token });
    console.log(token)
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao Fazer o Login <br> Preencha os Campos Corretamente" });
  }
});

app.get("/logout", (req, res) => {
  // Verifique se o usuário está autenticado (você pode usar middleware de autenticação aqui)
  if (!req.cookies.userCad) {
      // Se o usuário não estiver autenticado, redirecione para a página de login ou onde desejar
      return res.redirect("/login");
  }

  // Excluir o cookie "userCad"
  res.clearCookie("userCad");
  res.clearCookie("userId");

  // Redirecionar para a página de login ou para onde desejar
  res.redirect("/");
});

app.post('/cadastrar-produto', upload.fields([
  { name: 'imgProd', maxCount: 1 },
  { name: 'imgProd2', maxCount: 1 },
  { name: 'imgProd3', maxCount: 1 },
  { name: 'imgProd4', maxCount: 1 },
  { name: 'gabaritoProd', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      nomeProd,
      descProd,
      valorProd,
      categoriaProd,
      raioProd,
      material,
      formato,
      enobrecimento,
      cor,
      acabamento
    } = req.body;
    const imgProd = req.files['imgProd'] ? req.files['imgProd'][0] : null; // Main product image
    const imgProd2 = req.files['imgProd2'] ? req.files['imgProd2'][0] : null; // Additional image 1
    const imgProd3 = req.files['imgProd3'] ? req.files['imgProd3'][0] : null; // Additional image 2
    const imgProd4 = req.files['imgProd4'] ? req.files['imgProd4'][0] : null; // Additional image 3
    const gabaritoProd = req.files['gabaritoProd'] ? req.files['gabaritoProd'][0] : null // Gabarito do produto

    console.log(imgProd2, imgProd3, imgProd4, gabaritoProd);

    // Insira os dados na tabela Produtos
    const novoProduto = await Produtos.create({
      nomeProd: nomeProd,
      descProd: descProd,
      valorProd: valorProd,
      categProd: categoriaProd,
      raioProd: raioProd,
      imgProd: imgProd ? imgProd.buffer : null,
      imgProd2: imgProd2 ? imgProd2.buffer : null,
      imgProd3: imgProd3 ? imgProd3.buffer : null,
      imgProd4: imgProd4 ? imgProd4.buffer : null,
      gabaritoProd: gabaritoProd ? gabaritoProd.buffer : null,
    });

    // Converte arrays para strings JSON
    const materialJSON = JSON.stringify(material.split(','));
    const formatoJSON = JSON.stringify(formato.split(','));
    const enobrecimentoJSON = JSON.stringify(enobrecimento.split(','));
    const corJSON = JSON.stringify(cor.split(','));
    const acabamentoJSON = JSON.stringify(acabamento.split(','));

    // Insira os dados na tabela de VariaçõesProduto
    const variacoesProduto = await VariacoesProduto.create({
      idProduto: novoProduto.id,
      material: materialJSON,
      formato: formatoJSON,
      enobrecimento: enobrecimentoJSON,
      cor: corJSON,
      acabamento: acabamentoJSON,
    });

    const categoria = categoriaProd.toLowerCase().replace(/ /g, '-');
    res.json({
      message: 'Produto cadastrado com sucesso',
      produto: novoProduto,
      variacoes: variacoesProduto,
      categoria: categoria,
    });
    console.log("Produto cadastrado com sucesso!", novoProduto, variacoesProduto, categoria);
  } catch (error) {
    console.error('Erro ao cadastrar o produto:', error);
    res.status(500).json({
      error: 'Erro ao cadastrar o produto',
      message: error.message,
    });
  }
});

app.post("/cadastro-graficas", async (req, res) => { 
 
  try {
      const { userCad, cnpjCad, endereçoCad, cepCad, cidadeCad, estadoCad, inscricaoEstadualCad, telefoneCad, bancoCad, agenciaCad, contaCorrenteCad,produtos, emailCad, passCad } = req.body;
      const hashedPassword = await bcrypt.hash(passCad, 10);

      const existingGrafica = await Graficas.findOne({
        where: {
          [Op.or]: [
            { emailCad: emailCad },
          ],
        },
      });
  
      if (existingGrafica) {
        return res.status(400).json({
          message: "Já existe uma Gráfica com este e-mail cadastrado",
        });
      }

      const newGrafica = await Graficas.create({
          userCad: userCad,
          cnpjCad: cnpjCad,
          enderecoCad: endereçoCad,
          cepCad: cepCad,
          cidadeCad: cidadeCad,
          estadoCad: estadoCad,
          inscricaoEstadualCad: inscricaoEstadualCad,
          telefoneCad: telefoneCad,
          bancoCad: bancoCad,
          agenciaCad: agenciaCad,
          contaCorrenteCad: contaCorrenteCad,
          produtos: produtos,
          emailCad: emailCad,
          passCad: hashedPassword
      });

      console.log(newGrafica)
      res.json({ message: 'Gráfica cadastrada com sucesso!', Graficas: newGrafica });
      
  } catch (error) {
      console.error('Erro ao cadastrar grafica:', error);
      res.status(500).json({ message: 'Erro ao cadastrar grafica' });
  }
});

app.post("/login-graficas", async (req, res) => {
  try {
    const { emailCad, passCad } = req.body;

    // Verifique se o usuário existe no banco de dados
    const grafica = await Graficas.findOne({ where: { emailCad: emailCad} });

    if (!grafica) {
      return res.status(401).json({ message: "Grafica não encontrada" });
    }

    const passwordMatch = await bcrypt.compare(passCad, grafica.passCad);

    // Verifique se a senha está correta
    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.cookie('graficaUserCad', grafica.userCad);
    res.cookie('graficaId', grafica.id)

    // Gere um token de autenticação (exemplo simples)
    const token = Math.random().toString(16).substring(2);

    res.json({ message: "Login bem-sucedido", token: token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao Fazer o Login <br> Preencha os Campos Corretamente" });
  }
});


module.exports = app;