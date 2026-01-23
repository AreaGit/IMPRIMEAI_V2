const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const User = require('../models/User');
const UsersEmpresas = require('../models/Users-Empresas');
const Produtos = require('../models/Produtos');
const VariacoesProduto = require('../models/VariacoesProduto');
const ProdutosExc = require('../models/ProdutosExc');
const VariacoesProdutoExc = require('../models/VariacoesProdutoExc');
const Empresas = require('../models/Empresas');
const Graficas = require('../models/Graficas');
const multer = require('multer');
const nodemailer = require('nodemailer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const pagarmeKeyProd = "sk_KVlgJBsKOTQagkmR";
const pagarmeKeyTest = "sk_test_05ddc95c6ce442a796c7ebbe2376185d";
const axios = require('axios');
const request = require('request-promise');
const xlsx = require('xlsx');
const upload2 = multer({ storage: multer.memoryStorage() });
const { sendMessage } = require('./api/whatsapp-web');
const EnderecosEmpresas = require('../models/Enderecos-Empresas');
const { criarClienteAsaas } = require('./api/asaas')
const path = require('path');
const UsersAdm = require('../models/UsersAdm');
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function enviarEmailNotificacao(destinatario, assunto, corpoHtml, corpoTexto = null) {
  const transporter = nodemailer.createTransport({
    host: 'email-ssl.com.br',
    port: 465,
    secure: true,
    auth: {
      user: 'contato@imprimeai.com.br',
      pass: 'Z1mb@bue',
    },
  });

  const info = await transporter.sendMail({
    from: '"ImprimeAi" <contato@imprimeai.com.br>',
    to: destinatario,
    subject: assunto,

    // Fallback (boa prática)
    text: corpoTexto || 'Este email contém conteúdo em HTML. Caso não visualize corretamente, utilize um cliente compatível.',

    // HTML premium
    html: corpoHtml,
  });

  console.log('E-mail enviado:', info.messageId);
}

async function enviarNotificacaoWhatsapp(destinatario, corpo) {
  return await sendMessage(destinatario, corpo);
}

function gerarVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function formatCnpjCpf(value) {
  const CPF_LENGTH = 11;
  const cnpjCpf = value.replace(/\D/g, '');
  if (cnpjCpf.length === CPF_LENGTH) {
    return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatarTelefone(telefone) {
  let telefoneLimpo = telefone.replace(/\D/g, '');
  let ddd = telefoneLimpo.slice(0, 2);
  let numero = telefoneLimpo.slice(2);
  return `${ddd} ${numero}`;
}

async function importarUsuariosDoExcel(caminhoArquivo) {
  try {
    const workbook = xlsx.readFile(caminhoArquivo);
    const primeiraAba = workbook.SheetNames[0];
    const planilha = workbook.Sheets[primeiraAba];
    const dados = xlsx.utils.sheet_to_json(planilha);
    console.log('Dados da planilha:', dados);

    for (const item of dados) {
      const verificationCode = gerarVerificationCode();
      const cpfFormatado = formatCnpjCpf(item.cnpjCad || '');
      const telefoneFormatado = formatarTelefone(item.telefoneCad || '');

      const dadosCliente = {
        name: item.userCad,
        document: cpfFormatado,
        email: item.emailCad,
        phone: telefoneFormatado,
        address: item.endereçoCad,
        addressNumber: item.numCad,
        complement: item.compCad,
        province: item.bairroCad,
        postalCode: item.cepCad,
        externalReference: Math.floor(Math.random() * 999) + 1
      };

      let customer_asaas_id = '';

        const clienteAsaas = await criarClienteAsaas(dadosCliente);
        customer_asaas_id = clienteAsaas.id;

      await UsersEmpresas.create({
        customer_asaas_id: customer_asaas_id,
        userCad: item.userCad || '',
        nomeGerente: item.nomeGerente || '',
        endereçoCad: item.endereçoCad || '',
        numCad: item.numCad || '',
        compCad: item.compCad || '',
        bairroCad: item.bairroCad || '',
        cepCad: item.cepCad || '',
        cidadeCad: item.cidadeCad || '',
        estadoCad: item.estadoCad || '',
        cnpjCad: item.cnpjCad || '',
        telefoneCad: item.telefoneCad || '',
        empresa: item.empresa || '',
        particularidades: item.particularidades || '',
        produtos: item.produtos,
        emailCad: item.emailCad || '',
        email_fiscal: item.emailFiscal || '',
        passCad: item.passCad || '',
        verificationCode,
        verificado: false
      });
    }

    console.log('✅ Usuários importados e clientes Asaas criados com sucesso!');
  } catch (erro) {
    console.error('❌ Erro ao importar usuários:', erro);
  }
}

const caminhoPlanilha = path.join(__dirname, 'Cadastro de Usuários em Massa CPQ.xlsx');
//importarUsuariosDoExcel(caminhoPlanilha);

async function hashSenhasUsuarios() {
  try {
    const usuarios = await UsersEmpresas.findAll();

    for (const usuario of usuarios) {
      const senha = usuario.passCad;

      // Ignora se não houver senha cadastrada
      if (!senha) continue;

      // Verifica se a senha já está hasheada (bcrypt começa com $2b$ ou $2a$)
      if (senha.startsWith('$2b$') || senha.startsWith('$2a$')) {
        continue;
      }

      const hash = await bcrypt.hash(senha, 10);

      await usuario.update({ passCad: hash });
      console.log(`Senha atualizada para o usuário ID ${usuario.id}`);
    }

    console.log('✅ Todas as senhas foram hasheadas com sucesso.');
  } catch (erro) {
    console.error('❌ Erro ao hashear senhas:', erro);
  }
}

//hashSenhasUsuarios();

function mensagemCodigoWhatsapp({ nome, codigo }) {
  return `
🔐 *Confirmação de cadastro — ImprimeAi*

Olá${nome ? `, ${nome}` : ''}!  
Para concluir seu cadastro com segurança, utilize o código abaixo:

➡️ *${codigo}*

Este código é pessoal e válido por tempo limitado.  
Caso você não tenha solicitado este cadastro, basta ignorar esta mensagem.

Estamos à disposição.  
— *Equipe ImprimeAi*
`.trim();
}

function mensagemCodigoCnpjWhatsapp({ codigo }) {
  return `
🔐 *Recuperação de acesso — ImprimeAi*

Recebemos uma solicitação para recuperação de acesso vinculada a este WhatsApp.

Para continuar com segurança, utilize o código abaixo:

➡️ *${codigo}*

Este código é pessoal e válido por tempo limitado.  
Caso você não tenha solicitado esta ação, ignore esta mensagem.

— *Equipe ImprimeAi*
`.trim();
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

    function formatCnpjCpf(value) {
      const CPF_LENGTH = 11;
      const cnpjCpf = value.replace(/\D/g, '');
      
      if (cnpjCpf.length === CPF_LENGTH) {
        return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3-\$4");
      } 
      
      return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3/\$4-\$5");
    };

    function formatarTelefone(telefone) {
      // Remover todos os caracteres que não são números
      let telefoneLimpo = telefone.replace(/\D/g, '');
      
      // Extrair o DDD (primeiros 2 números) e o restante do número
      let ddd = telefoneLimpo.slice(0, 2);
      let numero = telefoneLimpo.slice(2);
      
      // Retornar no formato desejado
      return `${ddd} ${numero}`;
    }

    const cpfFormatado = formatCnpjCpf(cpfCad);
    const telefoneFormatado = formatarTelefone(telefoneCad);

    const dadosCliente = {
      name: userCad,
      document: cpfFormatado,
      email: emailCad,
      phone: telefoneFormatado,
      address: endereçoCad,
      addressNumber: numCad,
      complement: compCad,
      province: bairroCad,
      postalCode: cepCad,
      externalReference: Math.floor(Math.random() * 999) + 1
    }

      const clienteAsaas = await criarClienteAsaas(dadosCliente);
      const customer_asaas_id = clienteAsaas.id;

        const mensagemStatus = `Seu código de verificação é: ${verificationCode}`
        //await enviarEmailNotificacao(emailCad, `Código de Verificação do usuário ${userCad}`, mensagemStatus);
        const mensagemWhatsapp = mensagemCodigoWhatsapp({
          nome: userCad,
          codigo: verificationCode
        });

        await enviarNotificacaoWhatsapp(telefoneCad, mensagemWhatsapp);

                const newUser = await User.create({
            userCad: userCad,
            customer_asaas_id: customer_asaas_id,
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

        res.json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
        
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
});

// Rota para cadastrar a marca
app.post('/cadastrar-marca', async (req, res) => {
  const { nomeMarca, logo } = req.body;

  if (!nomeMarca || !logo) {
    return res.status(400).json({ message: 'Nome da marca e logo são obrigatórios.' });
  }

  try {
    // Remover o prefixo base64 e converter para buffer
    const logoBuffer = Buffer.from(logo.split(',')[1], 'base64');

    // Salvar no banco de dados
    const novaEmpresa = await Empresas.create({
      nome: nomeMarca,
      logo: logoBuffer,
    });

    res.status(201).json({ message: 'Marca cadastrada com sucesso.', empresa: novaEmpresa });
  } catch (error) {
    console.error('Erro ao cadastrar a marca:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

app.post("/cadastrarUser-empresas", async (req, res) => { 
  try {
      const { userCad, cnpjCad, endereçoCad, numCad, compCad, bairroCad, cepCad, cidadeCad, estadoCad, inscricaoEstadualCad, telefoneCad, produtos, empresa, emailCad, passCad } = req.body;
      const hashedPassword = await bcrypt.hash(passCad, 10);

  // Verifique se já existe um usuário com o mesmo CPF, email ou senha
  const existingUser = await UsersEmpresas.findOne({
    where: {
      [Op.or]: [
        { cnpjCad: cnpjCad },
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

    function formatarCNPJ(cnpj) {
      cnpj = cnpj.replace(/\D+/g, ''); // Remove caracteres não numéricos
      if (cnpj.length !== 14) {
        return cnpj; // Retorna o valor original se não tiver 14 dígitos
      }
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    function formatarTelefone(telefone) {
      // Remover todos os caracteres que não são números
      let telefoneLimpo = telefone.replace(/\D/g, '');
      
      // Extrair o DDD (primeiros 2 números) e o restante do número
      let ddd = telefoneLimpo.slice(0, 2);
      let numero = telefoneLimpo.slice(2);
      
      // Retornar no formato desejado
      return `${ddd} ${numero}`;
    }

    const cnpjFormatado = formatarCNPJ(cnpjCad);
    const telefoneFormatado = formatarTelefone(telefoneCad);

    const dadosCliente = {
      name: userCad,
      document: cnpjFormatado,
      email: emailCad,
      phone: telefoneFormatado,
      address: endereçoCad,
      addressNumber: numCad,
      complement: compCad,
      province: bairroCad,
      postalCode: cepCad,
      externalReference: Math.floor(Math.random() * 999) + 1
    }

      const clienteAsaas = await criarClienteAsaas(dadosCliente);
      const customer_asaas_id = clienteAsaas.id;

      const newUser = await UsersEmpresas.create({
          customer_asaas_id: customer_asaas_id,
          userCad: userCad,
          cnpjCad: cnpjCad,
          endereçoCad: endereçoCad,
          numCad: numCad,
          compCad: compCad,
          bairroCad: bairroCad,
          cepCad: cepCad,
          cidadeCad: cidadeCad,
          estadoCad: estadoCad,
          inscricaoEstadualCad: inscricaoEstadualCad,
          telefoneCad: telefoneCad,
          empresa: empresa,
          produtos: produtos,
          emailCad: emailCad,
          passCad: hashedPassword,
          verificationCode: verificationCode // Salve o código de verificação
      });
      const mensagemStatus = `Seu código de verificação é: ${verificationCode}`
      //await enviarEmailNotificacao(emailCad, `Código de Verificação do usuário ${userCad}`, mensagemStatus);
      //await enviarNotificacaoWhatsapp(telefoneCad, `Seu código de verificação é: ${verificationCode}`);
      res.json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
      
  } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

app.post('/verificar-codigo', async (req, res) => {
  try {
      const { emailCad, verificationCode } = req.body;

      console.log(emailCad, verificationCode);

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
    res.clearCookie("userIdTemp")
    // Gere um token de autenticação (exemplo simples)
    const token = Math.random().toString(16).substring(2);

    res.json({ message: "Login bem-sucedido", token: token, userCad: user.userCad });
    console.log(token)
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao Fazer o Login <br> Preencha os Campos Corretamente" });
  }
});

// Função para gerar abreviação personalizada
function gerarAbreviacao(empresa) {
  // Palavras que devem ser ignoradas na sigla
  const palavrasIgnoradas = ["de", "do", "da", "das", "dos", "e"];
  
  return empresa
    .split(' ') // Divide o nome em palavras
    .filter(palavra => !palavrasIgnoradas.includes(palavra.toLowerCase())) // Remove palavras ignoradas
    .map(palavra => palavra[0]) // Pega a primeira letra das palavras restantes
    .join('') // Junta as letras para formar a abreviação
    .toLowerCase(); // Converte para minúsculas
}

app.post("/loginUserCnpj-empresas", async (req, res) => {
  try {
    const { cnpjCad, passCad } = req.body;
    console.log(req.body);

    // Verifique se o usuário e a empresa existem no banco de dados
    const user = await UsersEmpresas.findOne({
      where: { cnpjCad: cnpjCad },
      attributes: ['id', 'passCad', 'userCad', 'empresa'], // Inclui userCad na busca
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Verifique se a senha está correta
    const passwordMatch = await bcrypt.compare(passCad, user.passCad);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    res.cookie("userId", user.id);
    res.cookie('userCad', user.userCad);
    const empresa = encodeURIComponent(user.empresa);
    res.cookie('empresa', empresa, {
      encode: String, // Evita dupla codificação
    });
    // Retorne sucesso e a URL de redirecionamento com a abreviação
    res.json({
      success: true,
      message: "Login bem-sucedido",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
});

app.post("/loginUser-empresas", async (req, res) => {
  try {
    const { emailCad, passCad } = req.body;

    // Verifique se o usuário e a empresa existem no banco de dados
    const user = await UsersEmpresas.findOne({
      where: { emailCad: emailCad },
      attributes: ['id', 'passCad', 'userCad', 'empresa'], // Inclui userCad na busca
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Verifique se a senha está correta
    const passwordMatch = await bcrypt.compare(passCad, user.passCad);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    res.cookie("userId", user.id);
    res.cookie('userCad', user.userCad);
    const empresa = encodeURIComponent(user.empresa);
    res.cookie('empresa', empresa, {
      encode: String, // Evita dupla codificação
    });
    // Retorne sucesso e a URL de redirecionamento com a abreviação
    res.json({
      success: true,
      message: "Login bem-sucedido",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
});

app.get("/logout", (req, res) => {
  // Excluir o cookie "userCad"
  res.clearCookie("username");
  res.clearCookie("userCad")
  res.clearCookie("userId");

  // Redirecionar para a página de login ou para onde desejar
  res.redirect("/login");
});

app.post('/enviar-email-redefinir', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email recebido para redefinir:", email);

    const transporter = nodemailer.createTransport({
      host: 'email-ssl.com.br',
      port: 465,
      secure: true,
      auth: {
        user: 'contato@imprimeai.com.br',
        pass: 'Z1mb@bue',
      },
    });

    const resetLink = "https://imprimeai.com.br/redefinir-senha";

    const html = `
    <div style="margin:0; padding:0; background:linear-gradient(180deg,#F69896 0%, #ffffff 60%); font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; box-shadow:0 3px 3px rgba(0,0,0,0.08); padding:40px;">

              <!-- Cabeçalho -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <h1 style="margin:0; font-size:24px; font-weight:600; color:#000000;">
                    Redefinição de senha
                  </h1>
                  <p style="margin:12px 0 0; font-size:15px; color:#A7A9AC;">
                    Segurança e tranquilidade para sua conta
                  </p>
                </td>
              </tr>

              <!-- Corpo -->
              <tr>
                <td style="font-size:15px; line-height:1.8; color:#000000;">
                  <p style="margin:0 0 16px;">
                    Olá,
                  </p>

                  <p style="margin:0 0 16px;">
                    Recebemos uma solicitação para redefinir a senha associada à sua conta.
                    Pensando na sua segurança, criamos um acesso exclusivo para que você
                    possa definir uma nova senha de forma simples e protegida.
                  </p>

                  <p style="margin:0;">
                    Para continuar, basta clicar no botão abaixo:
                  </p>
                </td>
              </tr>

              <!-- Botão -->
              <tr>
                <td align="center" style="padding:36px 0;">
                  <a href="${resetLink}"
                    style="
                      background-color:#F37160;
                      color:#ffffff;
                      text-decoration:none;
                      padding:16px 36px;
                      border-radius:8px;
                      font-size:16px;
                      font-weight:600;
                      display:inline-block;
                    ">
                    Redefinir minha senha
                  </a>
                </td>
              </tr>

              <!-- Aviso -->
              <tr>
                <td style="font-size:14px; line-height:1.6; color:#A7A9AC;">
                  <p style="margin:0 0 12px;">
                    Caso você não tenha solicitado esta redefinição, nenhuma ação é necessária.
                    Sua conta permanecerá segura.
                  </p>

                  <p style="margin:0;">
                    Este link é pessoal e válido por tempo limitado.
                  </p>
                </td>
              </tr>

              <!-- Rodapé -->
              <tr>
                <td style="padding-top:40px; border-top:1px solid #A7A9AC; text-align:center;">
                  <p style="margin:0 0 8px; font-size:12px; color:#A7A9AC;">
                    © ${new Date().getFullYear()} ImprimeAi
                  </p>
                  <p style="margin:0; font-size:12px; color:#A7A9AC;">
                    Este é um e-mail automático. Por favor, não responda.
                  </p>
                </td>
              </tr>

            </table>
            <!-- /Card -->
    
          </td>
        </tr>
      </table>
    </div>
    `;

    await transporter.sendMail({
      from: '"ImprimeAi" <contato@imprimeai.com.br>',
      to: email,
      subject: "Redefina sua senha com segurança",
      html,
    });

    res.json({ message: "Email de redefinição enviado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar e-mail." });
  }
});

app.post('/redefinir-senha', async (req, res) => {
  const { email, senha } = req.body;

  try {
      // 1. Busca o usuário pelo e-mail
      const user = await User.findOne({ where: { emailCad: email } });
      
      if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 2. Cria um hash da nova senha usando bcrypt
      const hashedPassword = await bcrypt.hash(senha, 10);

      // 3. Atualiza a senha do usuário
      await User.update({ passCad: hashedPassword }, { where: { emailCad: email } });

      // 4. Remove o cookie emailUser
      res.clearCookie('emailUser');

      // 5. Responde com sucesso
      res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ error: 'Erro ao redefinir senha. Tente novamente mais tarde.' });
  }
});

app.post('/solicitar-parceiro', async (req, res) => {
  try {
    const { nome, localidade, telefone, email, mensagem, produtos } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !localidade || !telefone || !email || !mensagem) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    // Transformar o objeto produtos em uma string
    const produtosSelecionados = Object.keys(produtos)
      .filter(produto => produtos[produto])
      .join(', ');

    // Configurar o corpo do e-mail
    const corpoEmail = `
    <div style="margin:0; padding:0; background:linear-gradient(180deg,#F69896 0%, #ffffff 60%); font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="max-width:600px; background:#ffffff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); padding:40px;">

              <!-- Cabeçalho -->
              <tr>
                <td style="padding-bottom:32px;">
                  <h1 style="margin:0; font-size:22px; font-weight:600; color:#000000;">
                    Nova solicitação de parceria
                  </h1>
                  <p style="margin:8px 0 0; font-size:14px; color:#A7A9AC;">
                    Um novo parceiro demonstrou interesse em colaborar com a ImprimeAi
                  </p>
                </td>
              </tr>

              <!-- Dados do solicitante -->
              <tr>
                <td style="padding-bottom:24px;">
                  <h2 style="margin:0 0 16px; font-size:16px; color:#F37160;">
                    Dados do solicitante
                  </h2>

                  <p style="margin:0 0 8px; font-size:15px; color:#000000;">
                    <strong>Nome:</strong> ${nome}
                  </p>
                  <p style="margin:0 0 8px; font-size:15px; color:#000000;">
                    <strong>Localidade:</strong> ${localidade}
                  </p>
                  <p style="margin:0 0 8px; font-size:15px; color:#000000;">
                    <strong>Telefone:</strong> ${telefone}
                  </p>
                  <p style="margin:0; font-size:15px; color:#000000;">
                    <strong>E-mail:</strong> ${email}
                  </p>
                </td>
              </tr>

              <!-- Produtos -->
              <tr>
                <td style="padding-bottom:24px;">
                  <h2 style="margin:0 0 16px; font-size:16px; color:#F37160;">
                    Produtos de interesse
                  </h2>

                  <p style="margin:0; font-size:15px; line-height:1.6; color:#000000;">
                    ${produtosSelecionados || 'Não informado'}
                  </p>
                </td>
              </tr>

              <!-- Mensagem -->
              <tr>
                <td style="padding-bottom:32px;">
                  <h2 style="margin:0 0 16px; font-size:16px; color:#F37160;">
                    Mensagem do solicitante
                  </h2>

                  <div style="background:#f9f9f9; border-left:4px solid #EF4126; padding:16px; border-radius:6px;">
                    <p style="margin:0; font-size:15px; line-height:1.7; color:#000000;">
                      ${mensagem}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Rodapé -->
              <tr>
                <td style="padding-top:24px; border-top:1px solid #A7A9AC; text-align:center;">
                  <p style="margin:0 0 8px; font-size:12px; color:#A7A9AC;">
                    © ${new Date().getFullYear()} ImprimeAi
                  </p>
                  <p style="margin:0; font-size:12px; color:#A7A9AC;">
                    Solicitação enviada através do site institucional
                  </p>
                </td>
              </tr>

            </table>
            <!-- /Card -->

          </td>
        </tr>
      </table>
    </div>
    `;

    // Enviar o e-mail usando a função enviarEmailNotificacao
    await enviarEmailNotificacao('contato@imprimeai.com.br', 'Nova Solicitação de Parceria', corpoEmail);

    // Responder com sucesso
    res.status(200).json({ message: "Solicitação de parceria enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao processar solicitação de parceria:", err);
    res.status(500).json({ message: "Erro interno do servidor. Tente novamente mais tarde." });
  }
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
      quantidades
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
    const quantidadesJSON = JSON.stringify(quantidades.split(',')); // Processando as quantidades

    // Insira os dados na tabela de VariaçõesProduto
    const variacoesProduto = await VariacoesProduto.create({
      idProduto: novoProduto.id,
      material: materialJSON,
      formato: formatoJSON,
      enobrecimento: enobrecimentoJSON,
      cor: corJSON,
      acabamento: acabamentoJSON,
      quantidades: quantidadesJSON, // Armazenando as quantidades
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

app.post('/cadastrar-produtos-planilha', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo de planilha não enviado.' });
    }

    // Ler a planilha carregada
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Lê a primeira aba da planilha
    const sheet = workbook.Sheets[sheetName];

    // Converte a planilha para um array de objetos
    const produtos = xlsx.utils.sheet_to_json(sheet);

    // Itera sobre os produtos e cadastra cada um no banco de dados
    for (const produto of produtos) {
      const {
        nomeProd,
        descProd,
        valorProd,
        categoriaProd,
        categoriaProd2,
        categoriaProd3,
        raioProd,
        marca,
        modelo,
        material,
        formato,
        enobrecimento,
        cor,
        acabamento,
        quantidades,
        imgProd,
        imgProd2,
        imgProd3,
        imgProd4,
      } = produto;

      // Insere o produto na tabela Produtos
      const novoProduto = await Produtos.create({
        nomeProd: nomeProd,
        descProd: descProd,
        valorProd: valorProd,
        categProd: categoriaProd,
        categProd2: categoriaProd2,
        categProd3: categoriaProd3, 
        raioProd: raioProd,
        imgProd: imgProd,
        imgProd2: imgProd2,
        imgProd3: imgProd3,
        imgProd4: imgProd4,
      });

      let modeloJSON
      let marcaJSON
      let materialJSON
      let formatoJSON
      let enobrecimentoJSON
      let corJSON
      let acabamentoJSON
      // Converte arrays para strings JSON
      if(modelo == null) {
         modeloJSON = "Não há"
      } else {
        modeloJSON = JSON.stringify(modelo.split(','));
      } 
      
      if(marca == null) {
         marcaJSON = "Não há"
      } else {
        marcaJSON = JSON.stringify(marca.split(','));
      } 
      
      if(material == null) {
         materialJSON = "Não há"
      } else {
        materialJSON = JSON.stringify(material.split(','));
      } 
      
      if(formato == null) {
         formatoJSON = "Não há"
      } else {
        formatoJSON = JSON.stringify(formato.split(','));
      } 
      
      if(enobrecimento == null) { 
         enobrecimentoJSON = "Não há"
      } else {
        enobrecimentoJSON = JSON.stringify(enobrecimento.split(','));
      } 
      
      if(cor == null) {
          corJSON = "Não há"
      } else {
        corJSON = JSON.stringify(cor.split(','));
      } 
      
      if(acabamento == null) {
         acabamentoJSON = "Não há"
      } else {
        acabamentoJSON = JSON.stringify(acabamento.split(','));
      }
      
      // Converte quantidades para string se não for string
      const quantidadesString = Array.isArray(quantidades)
        ? `[${quantidades.join(',')}]` // Se for array, transforma em string com colchetes
        : `[${quantidades.toString().replace(/\./g, '')}]`; // Remove pontos da string
      // Insira as variações do produto na tabela VariacoesProduto
      await VariacoesProduto.create({
        idProduto: novoProduto.id,
        marca: marcaJSON,
        modelo: modeloJSON,
        material: materialJSON,
        formato: formatoJSON,
        enobrecimento: enobrecimentoJSON,
        cor: corJSON,
        acabamento: acabamentoJSON,
        quantidades: quantidadesString, // Armazenando as quantidades
      });
    }

    res.json({ message: 'Produtos cadastrados com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar produtos:', error);
    res.status(500).json({ message: 'Erro ao cadastrar produtos', error: error.message });
  }
}); 

app.post('/cadastrar-produtosexclusivos-planilha', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo de planilha não enviado.' });
    }

    // Ler a planilha carregada
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Lê a primeira aba da planilha
    const sheet = workbook.Sheets[sheetName];

    // Converte a planilha para um array de objetos
    const produtos = xlsx.utils.sheet_to_json(sheet);

    // Itera sobre os produtos e cadastra cada um no banco de dados
    for (const produto of produtos) {
      const {
        nomeProd,
        descProd,
        valorProd,
        categoriaProd,
        categoriaProd2,
        categoriaProd3,
        empresa,
        raioProd,
        marca,
        modelo,
        material,
        formato,
        enobrecimento,
        cor,
        acabamento,
        quantidades,
        imgProd,
        imgProd2,
        imgProd3,
        imgProd4,
        gabaritoProd,
      } = produto;

      // Insere o produto na tabela Produtos
      const novoProduto = await ProdutosExc.create({
        nomeProd: nomeProd,
        descProd: descProd,
        valorProd: valorProd,
        categProd: categoriaProd,
        categProd2: categoriaProd2,
        categProd3: categoriaProd3, 
        empresa: empresa,
        raioProd: raioProd,
        imgProd: imgProd,
        imgProd2: imgProd2,
        imgProd3: imgProd3,
        imgProd4: imgProd4,
        gabaritoProd: gabaritoProd,
      });

      let modeloJSON
      let marcaJSON
      let materialJSON
      let formatoJSON
      let enobrecimentoJSON
      let corJSON
      let acabamentoJSON
      // Converte arrays para strings JSON
      if(modelo == null) {
         modeloJSON = "Não há"
      } else {
        modeloJSON = JSON.stringify(modelo.split(','));
      } 
      
      if(marca == null) {
         marcaJSON = "Não há"
      } else {
        marcaJSON = JSON.stringify(marca.split(','));
      } 
      
      if(material == null) {
         materialJSON = "Não há"
      } else {
        materialJSON = JSON.stringify(material.split(','));
      } 
      
      if(formato == null) {
         formatoJSON = "Não há"
      } else {
        formatoJSON = JSON.stringify(formato.split(','));
      } 
      
      if(enobrecimento == null) { 
         enobrecimentoJSON = "Não há"
      } else {
        enobrecimentoJSON = JSON.stringify(enobrecimento.split(','));
      } 
      
      if(cor == null) {
          corJSON = "Não há"
      } else {
        corJSON = JSON.stringify(cor.split(','));
      } 
      
      if(acabamento == null) {
         acabamentoJSON = "Não há"
      } else {
        acabamentoJSON = JSON.stringify(acabamento.split(','));
      }
      
      // Converte quantidades para string se não for string
      const quantidadesString = Array.isArray(quantidades)
        ? `[${quantidades.join(',')}]` // Se for array, transforma em string com colchetes
        : `[${quantidades.toString().replace(/\./g, '')}]`; // Remove pontos da string
      // Insira as variações do produto na tabela VariacoesProduto
      await VariacoesProdutoExc.create({
        idProduto: novoProduto.id,
        marca: marcaJSON,
        modelo: modeloJSON,
        material: materialJSON,
        formato: formatoJSON,
        enobrecimento: enobrecimentoJSON,
        cor: corJSON,
        acabamento: acabamentoJSON,
        quantidades: quantidadesString, // Armazenando as quantidades
      });
    }

    res.json({ message: 'Produtos cadastrados com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar produtos:', error);
    res.status(500).json({ message: 'Erro ao cadastrar produtos', error: error.message });
  }
}); 
app.post('/cadastro-enderecos-empresa', async (req, res) => {
  const { id_usuario, rua, cep, bairro, estado, cidade, numero, complemento } = req.body;

  if (!id_usuario || !rua || !cep || !bairro || !estado || !cidade || !numero) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
      const novoEndereco = await EnderecosEmpresas.create({
          id_usuario,
          rua,
          cep,
          bairro,
          estado,
          cidade,
          numero,
          complemento: complemento || null,
      });
      res.status(201).json(novoEndereco);
  } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar endereço.' });
  }
});
app.post("/cadastro-graficas", async (req, res) => { 
  try {
    const { userCad, cnpjCad, endereçoCad, cepCad, cidadeCad, estadoCad, bairroCad, compCad, numCad, telefoneCad, bancoCad, agenciaCad, contaCorrenteCad, codBanco, digitoConta, produtos, emailCad, passCad } = req.body;
    const hashedPassword = await bcrypt.hash(passCad, 10);
    
    // Formata CNPJ e número da conta
    const cnpjFormatado = cnpjCad.replace(/[^\d]+/g, '');
    const contaCorrenteSemHifen = contaCorrenteCad.replace(/-/g, '');

    // Validação do CNPJ com 14 dígitos
    if (cnpjFormatado.length !== 14) {
      return res.status(400).json({ message: "CNPJ inválido. Deve conter 14 dígitos." });
    }

    // Formatação e Validação do Telefone
    const telefoneMatch = telefoneCad.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
    if (!telefoneMatch) {
      return res.status(400).json({ message: "Número de telefone inválido. O formato deve ser (DD) NNNNN-NNNN" });
    }
    const ddd = telefoneMatch[1];
    const telefone = `${telefoneMatch[2]}${telefoneMatch[3]}`; // Remove traço do número

    // Função para calcular o dígito verificador da agência (se necessário)
    function calcularDigitoAgencia(agencia) {
      const pesos = [5, 4, 3, 2];
      let soma = 0;
      for (let i = 0; i < agencia.length; i++) {
          soma += parseInt(agencia[i]) * pesos[i];
      }
      const mod11 = soma % 11;
      let digito = 11 - mod11;
      if (digito === 10 || digito === 11) digito = 0;
      return digito.toString();
    }
    const digitoVerificador = calcularDigitoAgencia(agenciaCad);

    // Verifica se a gráfica já está cadastrada pelo e-mail
    const existingGrafica = await Graficas.findOne({ where: { emailCad } });
    if (existingGrafica) {
      return res.status(400).json({ message: "Já existe uma Gráfica com este e-mail cadastrado" });
    }

    // Configuração do request para criar o recebedor no Pagar.me
    const options = {
      method: 'POST',
      url: 'https://api.pagar.me/core/v5/recipients',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`sk_KVlgJBsKOTQagkmR:`).toString('base64')
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
          founding_date: new Date().toISOString().split('T')[0],
          phone_numbers: [{ ddd, number: telefone, type: 'mobile' }],
          managing_partners: [{
            name: userCad,
            email: emailCad,
            document: cnpjFormatado,
            type: 'corporation',
            monthly_income: 120000,
            mother_name: 'Nulo',
            birthdate: new Date().toISOString().split('T')[0],
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
            phone_numbers: [{ ddd, number: telefone, type: 'mobile' }]
          }]
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
        code: Math.floor(1000 + Math.random() * 9000).toString()
      },
      json: true
    };

    // Faz a requisição para o Pagar.me e cadastra no banco
    const pagarmeResponse = await request(options);
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
      status: "Em análise",
      emailCad,
      passCad: hashedPassword
    });

    res.json({ message: 'Gráfica cadastrada com sucesso!', Graficas: newGrafica, PagarMe: pagarmeResponse });
  } catch (error) {
    console.error('Erro ao cadastrar gráfica:', error);
    res.status(500).json({ message: 'Erro ao cadastrar gráfica', error });
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

// Função para gerar um código de 4 dígitos
function gerarCodigo() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Rota 1 - Enviar código para o e-mail
app.post("/enviar-codigo-cpq", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersEmpresas.findOne({ where: { emailCad: email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "E-mail não encontrado." });
    }

    const codigo = gerarCodigo();
    console.log("Código Gerado: ", codigo);
    user.verificationCode = codigo;
    await user.save();

    const htmlCodigo = `
    <div style="margin:0; padding:0; background:linear-gradient(180deg,#F69896 0%, #ffffff 60%); font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="max-width:560px; background:#ffffff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); padding:40px;">

              <!-- Cabeçalho -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <h1 style="margin:0; font-size:22px; font-weight:600; color:#000000;">
                    Código de recuperação de senha
                  </h1>
                  <p style="margin:12px 0 0; font-size:14px; color:#A7A9AC;">
                    Confirmação segura para acesso à sua conta
                  </p>
                </td>
              </tr>

              <!-- Texto -->
              <tr>
                <td style="font-size:15px; line-height:1.8; color:#000000;">
                  <p style="margin:0 0 16px;">
                    Olá,
                  </p>

                  <p style="margin:0 0 16px;">
                    Recebemos uma solicitação para redefinir a senha da sua conta.
                    Para garantir a sua segurança, utilize o código abaixo para
                    prosseguir com a recuperação.
                  </p>
                </td>
              </tr>

              <!-- Código -->
              <tr>
                <td align="center" style="padding:32px 0;">
                  <div
                    style="
                      display:inline-block;
                      background:#f9f9f9;
                      border:1px dashed #F37160;
                      padding:16px 32px;
                      border-radius:8px;
                      font-size:24px;
                      font-weight:700;
                      letter-spacing:4px;
                      color:#EF4126;
                    ">
                    ${codigo}
                  </div>
                </td>
              </tr>

              <!-- Aviso -->
              <tr>
                <td style="font-size:14px; line-height:1.6; color:#A7A9AC;">
                  <p style="margin:0 0 12px;">
                    Este código é pessoal, temporário e válido por um curto período.
                  </p>

                  <p style="margin:0;">
                    Caso você não tenha solicitado esta ação, ignore este e-mail.
                    Sua conta permanecerá segura.
                  </p>
                </td>
              </tr>

              <!-- Rodapé -->
              <tr>
                <td style="padding-top:36px; border-top:1px solid #A7A9AC; text-align:center;">
                  <p style="margin:0 0 8px; font-size:12px; color:#A7A9AC;">
                    © ${new Date().getFullYear()} ImprimeAi
                  </p>
                  <p style="margin:0; font-size:12px; color:#A7A9AC;">
                    Este é um e-mail automático. Por favor, não responda.
                  </p>
                </td>
              </tr>

            </table>
            <!-- /Card -->

          </td>
        </tr>
      </table>
    </div>
    `;

    // Enviar e-mail com o código
    await enviarEmailNotificacao(
      email,
      "Código de recuperação de senha",
      htmlCodigo,
      `Seu código de recuperação é: ${codigo}`
    );

    res.cookie("email", email, { httpOnly: true });
    return res.json({ success: true, message: "Código enviado para o e-mail." });
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    return res.status(500).json({ success: false, message: "Erro ao enviar código." });
  }
});

// Rota 2 - Verificar código
app.post("/verificar-codigo-cpq", async (req, res) => {
  const { codigo } = req.body;
  const email = req.body.email;
  console.log(email)

  if (!email) {
    return res.status(400).json({ success: false, message: "Sessão expirada. Tente novamente." });
  }

  try {
    const user = await UsersEmpresas.findOne({ where: {emailCad: email, verificationCode: codigo } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Código incorreto." });
    }

    return res.json({ success: true, message: "Código validado." });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return res.status(500).json({ success: false, message: "Erro interno." });
  }
});

// Rota 3 - Trocar senha
app.post("/trocar-senha-cpq", async (req, res) => {
  const { senha } = req.body;
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ success: false, message: "Sessão expirada. Tente novamente." });
  }

  try {
    const user = await UsersEmpresas.findOne({ where: { emailCad: email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    // Hash da nova senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    user.passCad = hashedSenha;
    user.codigoRecuperacao = null;
    await user.save();

    res.clearCookie("email");

    return res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return res.status(500).json({ success: false, message: "Erro ao trocar senha." });
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

// Rota 1 - Enviar código para o whatsapp cadastrado via Cnpj
app.post("/enviar-codigo-cnpj-cpq", async (req, res) => {
  const { cnpj } = req.body;

  try {
    const user = await UsersEmpresas.findOne({ where: { cnpjCad: cnpj } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Cnpj não encontrado." });
    }

    const codigo = gerarCodigo();
    console.log("Código Gerado: ", codigo);
    user.verificationCode = codigo;
    await user.save();

    // Enviar whatsapp com o código
    const mensagemWhatsapp = mensagemCodigoCnpjWhatsapp({
      codigo
    });

    await enviarNotificacaoWhatsapp(user.telefoneCad, mensagemWhatsapp);

    res.cookie("whatsapp", user.telefoneCad, { httpOnly: true });
    return res.json({ success: true, message: "Código enviado para o whatsapp." });
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    return res.status(500).json({ success: false, message: "Erro ao enviar código." });
  }
});

// Rota 2 - Verificar código via Cnpj
app.post("/verificar-codigo-cnpj-cpq", async (req, res) => {
  const { codigo } = req.body;
  const cnpj = req.body.cnpj;
  console.log(cnpj)

  if (!cnpj) {
    return res.status(400).json({ success: false, message: "Sessão expirada. Tente novamente." });
  }

  try {
    const user = await UsersEmpresas.findOne({ where: {cnpjCad: cnpj, verificationCode: codigo } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Código incorreto." });
    }

    return res.json({ success: true, message: "Código validado." });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return res.status(500).json({ success: false, message: "Erro interno." });
  }
});

// Rota 3 - Trocar senha via Cnpj
app.post("/trocar-senha-cnpj-cpq", async (req, res) => {
  const { senha } = req.body;
  const cnpj = req.body.cnpj;
  console.log(cnpj)

  if (!cnpj) {
    return res.status(400).json({ success: false, message: "Sessão expirada. Tente novamente." });
  }

  try {
    const user = await UsersEmpresas.findOne({ where: { cnpjCad: cnpj } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    // Hash da nova senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    user.passCad = hashedSenha;
    user.codigoRecuperacao = null;
    await user.save();

    res.clearCookie("email");

    return res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao trocar senha:", error);
    return res.status(500).json({ success: false, message: "Erro ao trocar senha." });
  }
});

app.post('/login-adm-cpq', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifique se o usuário existe no banco de dados
    const user = await UsersAdm.findOne({ where: { email: email} });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    // Verifique se a senha está correta
    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.cookie('nameAdm', user.name);
    res.cookie('idAdm', user.id)

    // Gere um token de autenticação (exemplo simples)
    const token = Math.random().toString(16).substring(2);

    res.json({ message: "Login bem-sucedido", token: token, user: user });
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;