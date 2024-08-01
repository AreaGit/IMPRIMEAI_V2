const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const User = require('../models/User');
const Produtos = require('../models/Produtos');
const VariacoesProduto = require('../models/VariacoesProduto');
const Graficas = require('../models/Graficas');
const multer = require('multer');
const nodemailer = require('nodemailer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const pagarmeKeyProd = "sk_e74e3fe1ccbe4ae080f70d85d94e2c68";
const pagarmeKeyTest = "sk_test_05ddc95c6ce442a796c7ebbe2376185d";
const axios = require('axios');
const request = require('request-promise');
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function enviarEmailNotificacao(destinatario, assunto, corpo) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: "gabrieldiastrin63@gmail.com",
      pass: "bwep pyqq zocy ljsi"
    }
  })

  const info = await transporter.sendMail({
    from: 'admin@imprimeai.com.br',
    to: destinatario,
    subject: assunto,
    text: corpo,
  });

  console.log('E-mail enviado:', info);
}

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
    // Geração do código de verificação
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

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
            passCad: hashedPassword,
            verificationCode: verificationCode // Salve o código de verificação
        });
        const mensagemStatus = `Seu código de verificação é: ${verificationCode}`
        await enviarEmailNotificacao(emailCad, `Código de Verificação do usuário ${userCad}`, mensagemStatus);
        res.json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
        
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
});

app.post('/verificar-codigo', async (req, res) => {
  try {
      const { emailCad, verificationCode } = req.body;

      const user = await User.findOne({ where: { emailCad: emailCad } });

      if (!user) {
          return res.status(400).json({ message: 'Usuário não encontrado' });
      }

      if (user.verificationCode === verificationCode) {
          // Código de verificação está correto, marque o usuário como verificado
          user.verificado = true;
          await user.save();

          return res.json({ message: 'Verificação bem-sucedida!' });
      } else {
          return res.status(400).json({ message: 'Código de verificação inválido' });
      }
  } catch (error) {
      console.error('Erro ao verificar código:', error);
      res.status(500).json({ message: 'Erro ao verificar código' });
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
      acabamento,
      imgProd,
      imgProd2,
      imgProd3,
      imgProd4,
    } = req.body;
    const gabaritoProd = req.files['gabaritoProd'] ? req.files['gabaritoProd'][0] : null // Gabarito do produto

    console.log(imgProd2, imgProd3, imgProd4, gabaritoProd);

    // Insira os dados na tabela Produtos
    const novoProduto = await Produtos.create({
      nomeProd: nomeProd,
      descProd: descProd,
      valorProd: valorProd,
      categProd: categoriaProd,
      raioProd: raioProd,
      imgProd: imgProd,
      imgProd2: imgProd2,
      imgProd3: imgProd3,
      imgProd4: imgProd4,
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
    const { userCad, cnpjCad, endereçoCad, cepCad, cidadeCad, estadoCad, bairroCad, compCad, numCad, telefoneCad, bancoCad, agenciaCad, contaCorrenteCad, codBanco, digitoConta, produtos, emailCad, passCad } = req.body;
    const hashedPassword = await bcrypt.hash(passCad, 10);
    const cnpjFormatado = cnpjCad.replace(/[^\d]+/g, '');
    const contaCorrenteSemHifen = contaCorrenteCad.replace(/-/g, '');
    const digitoVerificador = calcularDigitoAgencia(agenciaCad);

    function calcularDigitoAgencia(agencia) {
      const pesos = [5, 4, 3, 2];  // Pesos fixos para cada dígito
      let soma = 0;
  
      // Calcula a soma dos dígitos da agência multiplicados pelos seus pesos
      for (let i = 0; i < agencia.length; i++) {
          soma += parseInt(agencia[i]) * pesos[i];
      }
  
      // Calcula o módulo da soma
      const mod11 = soma % 11;
  
      // Define o dígito verificador
      let digito = 11 - mod11;
      if (digito === 10 || digito === 11) {
          digito = 0;  // Se o resultado for 10 ou 11, o dígito é 0
      }
  
      return digito.toString();
  }
    // Validação do CNPJ
    if (cnpjFormatado.length !== 14) {
      return res.status(400).json({
        message: "CNPJ inválido. Deve conter 14 dígitos."
      });
    }

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

    const today = new Date().toISOString().split('T')[0];

    const generateRandomCode = () => {
      return Math.floor(1000 + Math.random() * 9000).toString();
    };

    // Extração correta do DDD e número de telefone
    const telefoneMatch = telefoneCad.match(/\((\d{2})\)\s*(\d{4,5}-\d{4})/);
    if (!telefoneMatch) {
      return res.status(400).json({
        message: "Número de telefone inválido. O formato deve ser (DD) NNNNN-NNNN"
      });
    }
    const ddd = telefoneMatch[1];
    const telefone = telefoneMatch[2].replace('-', '');

    const options = {
      method: 'POST',
      url: 'https://api.pagar.me/core/v5/recipients',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64')
      },
      body: {
        register_information: {
          main_address: {
            street: endereçoCad.split(',')[0],
            complementary: compCad,
            street_number: numCad,
            neighborhood: bairroCad,
            city: cidadeCad,
            state: estadoCad,
            zip_code: cepCad,
            reference_point: 'Nenhum'
          },
          company_name: userCad,
          trading_name: userCad,
          email: emailCad,
          document: cnpjFormatado,
          type: 'corporation',
          site_url: 'https://imprimeai.com.br',
          annual_revenue: 1000000,
          corporation_type: 'LTDA',
          founding_date: today,
          phone_numbers: [
            {
              ddd: ddd,
              number: telefone,
              type: 'mobile'
            }
          ],
          managing_partners: [
            {
              name: userCad,
              email: emailCad,
              document: cnpjFormatado,
              type: 'corporation',
              monthly_income: 120000,
              mother_name: 'Nulo',
              birthdate: today,
              professional_occupation: 'Gráfica',
              self_declared_legal_representative: true,
              address: {
                street: endereçoCad.split(',')[0],
                complementary: compCad,
                street_number: numCad,
                neighborhood: bairroCad,
                city: cidadeCad,
                state: estadoCad,
                zip_code: cepCad,
                reference_point: 'Nenhum'
              },
              phone_numbers: [
                {
                  ddd: ddd,
                  number: telefone,
                  type: 'mobile'
                }
              ]
            }
          ]
        },
        default_bank_account: {
          holder_name: userCad,
          holder_document: cnpjFormatado,
          holder_type: 'company',
          bank: codBanco,
          branch_number: agenciaCad,
          branch_check_digit: digitoVerificador,
          account_number: contaCorrenteSemHifen,
          account_check_digit: digitoConta,
          type: 'checking'
        },
        transfer_settings: {
          transfer_enabled: false,
          transfer_interval: 'Daily',
          transfer_day: 0
        },
        automatic_anticipation_settings: {
          enabled: true,
          type: 'full',
          volume_percentage: 50,
          delay: null
        },
        code: generateRandomCode()
      },
      json: true
    };

    try {
      const pagarmeResponse = await request(options);
      console.log(pagarmeResponse);
      const newGrafica = await Graficas.create({
        userCad,
        cnpjCad,
        enderecoCad: endereçoCad,
        cepCad,
        cidadeCad,
        estadoCad,
        bairroCad,
        compCad,
        numCad,
        telefoneCad,
        bancoCad,
        agenciaCad,
        contaCorrenteCad,
        produtos,
        recipientId: pagarmeResponse.id,
        emailCad,
        passCad: hashedPassword
      });

      console.log(newGrafica);
      res.json({ message: 'Gráfica cadastrada com sucesso!', Graficas: newGrafica, PagarMe: pagarmeResponse });
    } catch (pagarmeError) {
      console.error('Erro ao criar recebedor no Pagar.me:', pagarmeError);
      res.status(500).json({ message: 'Erro ao criar recebedor no Pagar.me', error: pagarmeError });
    }
  } catch (error) {
    console.error('Erro ao cadastrar gráfica:', error);
    res.status(500).json({ message: 'Erro ao cadastrar gráfica' });
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

/*const options = {
  method: 'GET',
  url: 'https://api.pagar.me/core/v5/recipients?page=1&size=10',
  headers: {
    'accept': 'application/json',
    'Authorization': `Basic ${Buffer.from(pagarmeKeyProd + ':').toString('base64')}`
  }
};

request(options, function (error, response, body) {
  if (error) {
    console.error('Erro ao listar recebedores:', error);
    return;
  }

  console.log('Recebedores:', body);
});*/

module.exports = app;