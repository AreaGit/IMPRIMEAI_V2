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
      // Criar recebedor no Pagar.me
      const body =  {
        register_information: {
          main_address: {
            street: endereçoCad,
            complementary: 'Nenhum',
            street_number: 'Nenhum',
            neighborhood: 'Nenhum',
            city: cidadeCad,
            state: estadoCad,
            zip_code: cepCad,
            reference_point: 'Gráfica',
          },
          company_name: userCad,
          trading_name: userCad,
          email: emailCad,
          document: cnpjCad,
          type: 'corporation',
          site_url: 'https://www.imprimeai.com.br',
          annual_revenue: 0,
          corporation_type: 'LTDA',
          founding_date: "Nenhum",
          phone_numbers: [
            {
              ddd: '21',
              number: '994647568',
              type: 'mobile',
            },
          ],
          managing_partners: [
            {
              name: userCad,
              email: emailCad,
              document: cnpjCad,
              type: 'individual',
              monthly_income: 120000,
              professional_occupation: 'Vendedor',
              self_declared_legal_representative: true,
              address: {
                street: endereçoCad,
                complementary: 'Nenhum',
                street_number: 'Nenhum',
                neighborhood: 'Nenhum',
                city: cidadeCad,
                state: estadoCad,
                zip_code: cepCad,
                reference_point: 'Gráfica',
              },
              phone_numbers: [
                {
                  ddd: '27',
                  number: '999992628',
                  type: 'mobile',
                },
              ],
            },
          ],
        },
        default_bank_account: {
          holder_name: 'Tony Stark',
          holder_type: 'individual',
          holder_document: '26224451990',
          bank: '341',
          branch_number: '1234',
          branch_check_digit: '6',
          account_number: '12345',
          account_check_digit: '6',
          type: 'checking',
        },
        transfer_settings: {
          transfer_enabled: false,
          transfer_interval: 'Daily',
          transfer_day: 0,
        },
        automatic_anticipation_settings: {
          enabled: true,
          type: 'full',
          volume_percentage: 50,
          delay: null,
        },
        code: '1234',
      };
      
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
        street: 'Conselheiro Justino',
        complementary: 'Apto 81',
        street_number: '336',
        neighborhood: 'Campestre',
        city: 'Santo André',
        state: 'SP',
        zip_code: '09070-580',
        reference_point: 'Ao lado da Academia'
      },
      company_name: 'Gráfica Gabriel ADM',
      trading_name: 'Gráfica Gabriel ADM LTDA',
      email: 'gabrieldiastrin63@gmail.com',
      document: '05226702000101',
      type: 'corporation',
      site_url: 'https://www.imprimeai.com.br',
      annual_revenue: 1000000,
      corporation_type: 'LTDA',
      founding_date: '2008-06-26',
      phone_numbers: [
        {
          ddd: '11',
          number: '959099039',
          type: 'mobile'
        }
      ],
      managing_partners: [
        {
          name: 'Gabriel',
          email: 'gabrieldiastrin63@gmail.com',
          document: '05.226.702/0001-01',
          type: 'corporatiom',
          monthly_income: 120000,
          mother_name: 'Nome da mae',
          birthdate: '12/10/1995',
          professional_occupation: 'Vendedor',
          self_declared_legal_representative: true,
          address: {
            street: 'Conselheiro Justino',
            complementary: 'Apto 81',
            street_number: '336',
            neighborhood: 'Campestre',
            city: 'Santo André',
            state: 'SP',
            zip_code: '09070-580',
            reference_point: 'Ao lado da Academia'
          },
          phone_numbers: [
            {
              ddd: '11',
              number: '959099039',
              type: 'mobile'
            }
          ]
        }
      ]
    },
    default_bank_account: {
      holder_name: 'Gabriel',
      holder_type: 'company', // Change holder_type to "company"
      holder_document: '05226702000101',
      bank: '341',
      branch_number: '1234',
      branch_check_digit: '6',
      account_number: '12345',
      account_check_digit: '6',
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
    code: '3421'
  },
  json: true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});

module.exports = app;