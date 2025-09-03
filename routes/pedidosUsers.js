const express = require('express');
const app = express();
const Produtos = require('../models/Produtos');
const Graficas = require('../models/Graficas');
const User = require('../models/User');
const Carteira = require('../models/Carteira');
const VariacoesProduto = require('../models/VariacoesProduto');
const Pedidos = require('../models/Pedidos');
const ItensPedido = require('../models/ItensPedido');
const Enderecos = require('../models/Enderecos');
const ProdutosExc = require('../models/ProdutosExc');
const VariacoesProdutoExc = require('../models/VariacoesProdutoExc');
const CarteiraEmpresas = require('../models/CarteiraEmpresas');
const {Op} = require('sequelize');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const axios = require('axios');
const apiKangu = "19d3069503b19af19c14b73936a9a17f5b0eaba676b2a925d9d6d732f6b577e7";
const XLSX = require('xlsx');
const {google} = require('googleapis');
const GOOGLE_API_FOLDER_ID = '1F7sQzOnnbqn0EnUeT4kWrNOzsVFP-bG1';
const stream = require('stream');
const ultramsg = require('ultramsg-whatsapp-api');
const instance_id = "instance93146";
const ultramsg_token = "5oc4vmkit6fcyxym";
const api = new ultramsg(instance_id, ultramsg_token);
const pagarme = require('pagarme');
const qr = require('qrcode');
const cron = require('node-cron');
const request = require('request');
const nodemailer = require('nodemailer');
const rp = require('request-promise');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { client, sendMessage } = require('./api/whatsapp-web');
const bcrypt = require('bcrypt');
const TransacoesCarteira = require('../models/TransacoesCarteira');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
require('dayjs/plugin/utc');
require('dayjs/plugin/timezone');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

const Holidays = require('date-holidays');

const hd = new Holidays('BR'); // Brasil

function adicionarHorasUteis(inicio, horasParaAdicionar) {
  let atual = dayjs(inicio);
  let horasRestantes = horasParaAdicionar;

  while (horasRestantes > 0) {
    atual = atual.add(1, 'hour');

    const diaDaSemana = atual.day(); // 0 = Domingo, 6 = Sábado
    const dataFormatada = atual.format('YYYY-MM-DD');

    const ehFds = diaDaSemana === 0 || diaDaSemana === 6;
    const ehFeriado = !!hd.isHoliday(new Date(dataFormatada));

    if (!ehFds && !ehFeriado) {
      horasRestantes--;
    }
  }

  return atual;
}

const { cobrancaPixAsaas, cobrancaBoletoAsaas, cobrancaCartaoAsaas, consultarCobranca, agendarNfsAsaas, emitirNfs, consultarNf } = require('./api/asaas');
const QRcode = require('qrcode')

// Use o cliente conforme necessário
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto para uso no pedidosUsers.js');
});

/*async function sendMessage(rawNumber, message) {
  if (!rawNumber || !message) {
      throw new Error('Número ou mensagem não fornecidos.');
  }

  try {
      // Remove todos os caracteres que não sejam dígitos
      const cleanedNumber = rawNumber.replace(/\D/g, '');

      // Adiciona o código do país (Brasil = 55) na frente do número
      const completeNumber = `55${cleanedNumber}`;

      const chatId = `${completeNumber}@c.us`;

      console.log('Enviando mensagem para:', chatId); // Log para verificar o chatId
      await client.sendMessage(chatId, message);

      return { status: 'success', message: 'Mensagem enviada com sucesso.' };
  } catch (error) {
      console.error('Erro ao enviar a mensagem:', error.message);
      throw new Error('Erro ao enviar a mensagem: ' + error.message);
  }
}*/

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'seuSegredoDeSessao', // Substitua com um segredo seguro
  resave: false,
  saveUninitialized: true
}));
const os = require('os');
const ItensPedidos = require('../models/ItensPedido');
const UserEmpresas = require('../models/Users-Empresas');
const pagarmeKeyProd = "sk_KVlgJBsKOTQagkmR";
const pagarmeKeyTest = "sk_test_05ddc95c6ce442a796c7ebbe2376185d";

// Obtém os detalhes da rede da máquina
const interfaces = os.networkInterfaces();

// Itera sobre os interfaces de rede
Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((details) => {
        // Verifica se o endereço é IPv4 e não é um endereço interno
        if (details.family === 'IPv4' && !details.internal) {
            console.log('Endereço IP da máquina:', details.address);
        }
    });
});

app.get('/api/carrinho', (req, res) => {
  try {
    // Primeiro, tente obter o ID do usuário principal nos cookies
    let userId = req.cookies.userId || req.cookies.userIdTemp;

    // Se não houver `userId` nem `userIdTemp`, gere um temporário e salve como `userIdTemp`
    if (!userId) {
      userId = Math.floor(Math.random() * 999) + 1;
      res.cookie('userIdTemp', userId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Expira em 1 dia
    }

    // Filtra o carrinho da sessão pelo ID do usuário
    const carrinho = req.session.carrinho?.filter(item => item.userId === userId) || [];

    // Envia os dados do carrinho do usuário como resposta em JSON
    res.json(carrinho);
  } catch (error) {
    console.error('Erro ao obter os dados do carrinho:', error);
    res.status(500).json({ message: 'Erro ao obter os dados do carrinho' });
  }
});

app.get('/api/endereco', (req, res) => {
  try {
    // Obtenha os dados do carrinho da sessão
    const endereco = req.session.endereco || [];
    // Envie os dados do carrinho como resposta em JSON
    res.json(endereco);
  } catch (error) {
    console.error('Erro ao obter os dados do carrinho:', error);
    res.status(500).json({ message: 'Erro ao obter os dados do carrinho' });
  }
});

app.post('/adicionar-ao-carrinho/:produtoId', async (req, res) => {
    try {
      const produtoId = req.params.produtoId;
      const { quantidade, ...variacoesSelecionadas } = req.body; // A quantidade do produto a ser adicionada
      let userId = req.cookies.userId;
      console.log(req.body)
      if(!userId) {
        userId = req.cookies.userIdTemp;
      }

      // Verifique se a quantidade é um número válido
      if (typeof quantidade !== 'number' || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
  
      // Consulte o banco de dados para obter as informações do produto
      const produto = await Produtos.findByPk(produtoId);
  
      // Verifique se o produto existe
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
  
      // Inicialize o carrinho se ainda não existir na sessão
      if (!req.session.carrinho) {
        req.session.carrinho = [];
      }
  
      // Verifique se o produto já está no carrinho
      const produtoNoCarrinho = req.session.carrinho.find((item) => item.produtoId === produto.id);
  
      if (produtoNoCarrinho) {
        // Se o produto já estiver no carrinho, atualize a quantidade
        produtoNoCarrinho.quantidade += quantidade;
        produtoNoCarrinho.subtotal = produtoNoCarrinho.quantidade * produto.valorProd;
      } else {
        // Caso contrário, adicione o produto ao carrinho
        req.session.carrinho.push({
          userId: userId,
          produtoId: produto.id,
          nomeProd: produto.nomeProd,
          quantidade: quantidade,
          valorUnitario: produto.valorProd,
          subtotal: quantidade * produto.valorProd,
          raioProd: produto.raioProd,
          marca: variacoesSelecionadas.marca,
          modelo: variacoesSelecionadas.modelo,
          acabamento: variacoesSelecionadas.acabamento,
          cor: variacoesSelecionadas.cor,
          enobrecimento: variacoesSelecionadas.enobrecimento,
          formato: variacoesSelecionadas.formato,
          material: variacoesSelecionadas.material,
        });
      }
  
      // Responda com uma mensagem de sucesso e o carrinho atualizado
      res.json({ message: 'Produto adicionado ao carrinho com sucesso', carrinho: req.session.carrinho });
      console.log(req.session.carrinho)
    } catch (error) {
      console.error('Erro ao adicionar o produto ao carrinho:', error);
      res.status(500).json({ message: 'Erro ao adicionar o produto ao carrinho' });
    }
  });

  app.post('/editar-carrinho/:produtoId', async (req, res) => {
    try {
      let userId = req.cookies.userId;
  
      console.log("Recebido no Backend - Produto ID:", req.params.produtoId);
      console.log("Recebido no Backend - Quantidade:", req.body);
  
      const produtoId = Number(req.params.produtoId);
      const quantidade = Number(req.body.quantidade);

      if (!userId) {
        userId = req.cookies.userIdTemp;
      }
  
      // Verifique se a quantidade é um número válido
      if (typeof quantidade !== 'number' || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
  
      // Verifique se o carrinho existe na sessão
      if (!req.session.carrinho) {
        return res.status(400).json({ message: 'Carrinho não encontrado' });
      }
  
      // Encontre o produto no carrinho
      const produtoNoCarrinho = req.session.carrinho.find((item) => item.produtoId === produtoId && item.userId === userId);
  
      if (!produtoNoCarrinho) {
        return res.status(404).json({ message: 'Produto não encontrado no carrinho' });
      }
  
      // Atualize a quantidade e o subtotal
      produtoNoCarrinho.quantidade = quantidade;
      produtoNoCarrinho.subtotal = produtoNoCarrinho.quantidade * produtoNoCarrinho.valorUnitario;
  
      // Responda com uma mensagem de sucesso e o carrinho atualizado
      res.json({ message: 'Quantidade do produto atualizada com sucesso', carrinho: req.session.carrinho, novoSubTotal: produtoNoCarrinho.subtotal });
      console.log(req.session.carrinho);
    } catch (error) {
      console.error('Erro ao editar a quantidade do produto no carrinho:', error);
      res.status(500).json({ message: 'Erro ao editar a quantidade do produto no carrinho' });
    }
  });  

  app.post('/adicionar-ao-carrinho-empresa/:produtoId', async (req, res) => {
    try {
      const produtoId = req.params.produtoId;
      const { quantidade, ...variacoesSelecionadas } = req.body; // A quantidade do produto a ser adicionada
      let userId = req.cookies.userId;
      console.log(req.body)
      if(!userId) {
        userId = req.cookies.userIdTemp;
      }

      // Verifique se a quantidade é um número válido
      if (typeof quantidade !== 'number' || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
      }
  
      // Consulte o banco de dados para obter as informações do produto
      const produto = await ProdutosExc.findByPk(produtoId);
  
      // Verifique se o produto existe
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
  
      // Inicialize o carrinho se ainda não existir na sessão
      if (!req.session.carrinho) {
        req.session.carrinho = [];
      }
  
      // Verifique se o produto já está no carrinho
      const produtoNoCarrinho = req.session.carrinho.find((item) => item.produtoId === produto.id);
  
      if (produtoNoCarrinho) {
        // Se o produto já estiver no carrinho, atualize a quantidade
        produtoNoCarrinho.quantidade += quantidade;
        produtoNoCarrinho.subtotal = produtoNoCarrinho.quantidade * produto.valorProd;
      } else {
        // Caso contrário, adicione o produto ao carrinho
        req.session.carrinho.push({
          tipo: "Empresas",
          userId: userId,
          produtoId: produto.id,
          nomeProd: produto.nomeProd,
          quantidade: quantidade,
          valorUnitario: produto.valorProd,
          subtotal: quantidade * produto.valorProd,
          raioProd: produto.raioProd,
          arte: produto.gabaritoProd,
          marca: variacoesSelecionadas.marca,
          modelo: variacoesSelecionadas.modelo,
          acabamento: variacoesSelecionadas.acabamento,
          cor: variacoesSelecionadas.cor,
          enobrecimento: variacoesSelecionadas.enobrecimento,
          formato: variacoesSelecionadas.formato,
          material: variacoesSelecionadas.material,
        });
      }
  
      // Responda com uma mensagem de sucesso e o carrinho atualizado
      res.json({ message: 'Produto adicionado ao carrinho com sucesso', carrinho: req.session.carrinho });
      console.log(req.session.carrinho)
    } catch (error) {
      console.error('Erro ao adicionar o produto ao carrinho:', error);
      res.status(500).json({ message: 'Erro ao adicionar o produto ao carrinho' });
    }
  });

  app.delete('/remover-do-carrinho/:produtoId', (req, res) => {
    try {
      const produtoId = req.params.produtoId;
  
      // Verifique se o carrinho existe na sessão
      if (!req.session.carrinho) {
        return res.status(400).json({ message: 'Carrinho vazio' });
      }
  
      // Encontre o índice do produto no carrinho
      const index = req.session.carrinho.findIndex(item => item.produtoId == produtoId);
  
      if (index === -1) {
        return res.status(404).json({ message: 'Produto não encontrado no carrinho' });
      }
  
      // Remova o produto do carrinho
      req.session.carrinho.splice(index, 1);
  
      // Responda com uma mensagem de sucesso
      res.json({ message: 'Produto removido do carrinho com sucesso' });
    } catch (error) {
      console.error('Erro ao remover o produto do carrinho:', error);
      res.status(500).json({ message: 'Erro ao remover o produto do carrinho' });
    }
  });
// Rota para aplicar o desconto do cupom no carrinho
app.get('/aplicar-desconto-cupom/:cupom', (req, res) => {
  const cupomInserido = req.params.cupom;
  const carrinho = req.session.carrinho;

  // Verificar se o cupom inserido é válido
  if (cupomInserido === 'JORGE RAMOS') { // Substitua 'JORGE RAMOS' pelo seu cupom válido
      try {
          // Calcular o valor total atual do carrinho
          let valorTotalCarrinho = 0;
          for (const produto of carrinho) {
              valorTotalCarrinho += produto.subtotal;
          }

          // Aplicar o desconto de 5% no valor total do carrinho
          const valorDesconto = valorTotalCarrinho * 0.05;
          const novoValorTotal = valorTotalCarrinho - valorDesconto;

          // Atualizar os subtotais de cada item no carrinho, se necessário
          for (const produto of carrinho) {
              produto.subtotal *= 0.95; // Aplica o desconto de 5% em cada subtotal
              produto.descontado = true;
          }

          // Atualizar a sessão do carrinho com os novos valores
          req.session.carrinho = carrinho;
          console.log("Carrinho com desconto do cupom: ", carrinho);
          // Retornar o novo carrinho com os descontos aplicados
          res.json({ carrinho: carrinho, novoValorTotal: novoValorTotal });
      } catch (error) {
          console.error('Erro ao aplicar desconto do cupom:', error);
          res.status(500).json({ error: 'Erro ao aplicar desconto do cupom' });
      }
  } else {
      res.status(400).json({ error: 'Cupom inválido' });
  }
});
// Rota post para salvar o endereço do usuário
app.post('/salvar-endereco-no-carrinho', async (req, res) => {
  try {
    const {
      enderecoData: {
        nomeCliente,
        rua,
        numeroRua,
        complemento,
        cep,
        estado,
        cidade,
        bairro,
        email,
        telefone,
        downloadLinks, // Recebe o array de downloadLinks
      }
    } = req.body;

    // Criar um objeto de endereço base
    const enderecoBase = {
      nomeCliente,
      rua,
      numeroRua,
      complemento,
      bairro,
      cep,
      cidade,
      estado,
      email,
      telefone,
      tipoEntrega: 'Único Endereço'
    };

    // Salve o endereço base na sessão
    req.session.endereco = enderecoBase;

    // Calcule o frete e salve na sessão
    const { graficaMaisProxima, distanciaMinima, custoDoFrete } = await encontrarGraficaMaisProxima(enderecoBase);
    console.log('Gráfica mais próxima:', graficaMaisProxima);
    console.log('Distância mínima:', distanciaMinima);
    console.log('Custo do Frete:', custoDoFrete);

    // Defina o frete na sessão
    req.session.frete = custoDoFrete;
    enderecoBase.frete = custoDoFrete;

    // Crie um array para armazenar endereços quebrados
    const enderecosQuebrados = [];

    // Verificar se o carrinho já existe na sessão
    if (req.session.carrinho && req.session.carrinho.length > 0) {
      // Iterar sobre o carrinho e criar endereços quebrados
      req.session.carrinho.forEach((produto, index) => {
        const produtoLink = downloadLinks[index] ? downloadLinks[index].downloadLink : null;

        for (let i = 0; i < produto.quantidade; i++) {
          const enderecoQuebrado = { 
            ...enderecoBase, 
            downloadLink: produtoLink // Associa o link de download ao endereço quebrado
          };
          enderecosQuebrados.push(enderecoQuebrado);
        }
      });

      // Atualizar cada produto no carrinho com o endereço correspondente
      req.session.carrinho.forEach((produto, index) => {
        produto.endereco = enderecosQuebrados[index];
      });

      // Salve os endereços quebrados na sessão
      req.session.endereco = enderecosQuebrados;
    }
    // Agora podemos enviar a resposta ao cliente com os dados da gráfica mais próxima e o custo do frete
    console.log(req.session.endereco);
    res.json({
      success: true,
      graficaMaisProxima,
      distanciaMinima,
      custoDoFrete
    });
  } catch (error) {
    console.error('Erro ao salvar endereço no carrinho:', error);
    res.status(500).json({ error: 'Erro ao salvar endereço no carrinho' });
  }
});
// Rota para obter o valor do frete da sessão
app.get('/api/frete', (req, res) => {
  try {
    // Obtenha o valor do frete da sessão
    const frete = req.session.frete || null;

    // Envie o valor do frete como resposta em JSON
    res.json({ frete });
  } catch (error) {
    console.error('Erro ao obter o valor do frete da sessão:', error);
    res.status(500).json({ error: 'Erro ao obter o valor do frete da sessão' });
  }
});

app.get("/perfil/dados", async (req, res) => {
  try {
    // Verifique se o cookie "userId" está definido
    const userId = req.cookies.userId

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Use o modelo User para buscar o usuário no banco de dados pelo ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna os dados do usuário como JSON
    res.json({
      user
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/perfil/dados-adm", async (req, res) => {
  try {
    const userId = req.query.id;
    // Buscar o usuário
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Buscar saldo da carteira
    const saldoDepositosPagos = await Carteira.sum('saldo', {
      where: {
        userId: userId,
        statusPag: 'PAGO' // Apenas transações com status "PAGO"
      }
    });

    // Consulte o banco de dados para obter a soma de todos os depósitos de saída associados ao usuário
    const saldoSaidas = await Carteira.sum('saldo', {
      where: {
        userId: userId,
        statusPag: 'SAIDA' // Apenas transações com status "SAÍDA"
      }
    });

    // Calcule o saldo final subtraindo o valor total das saídas do valor total dos depósitos pagos
    const saldoFinal = saldoDepositosPagos - saldoSaidas;

    // Retornar os dados do usuário com saldo
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
      cpfCad: user.cpfCad,
      userCad: user.userCad,
      userId: user.id,
      tipo: user.tipo,
      saldoCarteira: saldoFinal.toFixed(2)
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
// Função para Gerar Comprovante PDF de Carteira
async function gerarComprovante(user, valor, saldoAntes, saldoDepois, tipo) {
  const usuario = await User.findByPk(user);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const nomeArquivo = `comprovante-${usuario.id}-${timestamp}.pdf`;
      const caminhoArquivo = path.join(__dirname, '../comprovantes', nomeArquivo);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(caminhoArquivo);
      doc.pipe(stream);

      doc.fontSize(18).text('Comprovante de Transação', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Nome: ${usuario.userCad}`);
      doc.text(`E-mail: ${usuario.emailCad}`);
      doc.text(`Telefone: ${usuario.telefoneCad || '-'}`);
      doc.text(`Data da Transação: ${new Date().toLocaleString('pt-BR')}`);
      doc.text(`Tipo de Operação: ${tipo === 'crédito' ? 'Crédito' : 'Débito'}`);
      doc.text(`Valor: R$ ${parseFloat(valor).toFixed(2)}`);
      doc.text(`Saldo Antes: R$ ${parseFloat(saldoAntes).toFixed(2)}`);
      doc.text(`Saldo Depois: R$ ${parseFloat(saldoDepois).toFixed(2)}`);

      doc.moveDown();
      doc.text('Imprimeai Serviços de Impressão LTDA');
      doc.text('CNPJ: 54.067.133/0001-04');
      doc.text('https://imprimeai.com.br');

      doc.end();

      stream.on('finish', () => {
        resolve(nomeArquivo); // nome do arquivo pode ser salvo no banco ou retornado
      });

      const telefone = usuario.telefoneCad;
      const mensagemWhatsapp = "Olá " + usuario.userCad + ", tudo bem? 😊\n" + "Queremos te avisar que seu saldo foi atualizado!\n" + "Verifique a mudança em seu perfil.\n" + "Se precisar de algo mais ou tiver alguma dúvida, por favor nos chame.\n\n" +
      "Obrigado!\n\n" +
      "Siga-nos no Insta\n" +
      "https://www.instagram.com/imprimeai.com.br e fique por dentro das novidades, cupons de desconto e assuntos importantes sobre gráfica e comunicação visual!\n\n" +
      "*Tá com pressa? Imprimeaí!*";

      enviarNotificacaoWhatsapp(telefone, mensagemWhatsapp)
    } catch (err) {
      reject(err);
    }
  });
};
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, rua, numero, complemento, estado, cidade, bairro,
      cpf, telefone, tipo, email, senha, saldo
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const dadosAtualizados = {
      userCad: nome,
      endereçoCad: rua,
      numCad: numero,
      compCad: complemento,
      estadoCad: estado,
      cidadeCad: cidade,
      bairroCad: bairro,
      cpfCad: cpf,
      telefoneCad: telefone,
      tipo: tipo,
      emailCad: email
    };

    if (senha && senha.trim() !== "") {
      const hashedPassword = await bcrypt.hash(senha, 10);
      dadosAtualizados.senha = hashedPassword;
    }

    await user.update(dadosAtualizados);

    // 🧮 Recalcular saldo baseado nos registros de entrada e saída
    const saldoDepositosPagos = await Carteira.sum('saldo', {
      where: {
        userId: id,
        statusPag: 'PAGO'
      }
    });

    const saldoSaidas = await Carteira.sum('saldo', {
      where: {
        userId: id,
        statusPag: 'SAIDA'
      }
    });

    const novoSaldo = saldo;

    // 🔍 Buscar carteira principal (saldo atual)
    const carteira = saldoDepositosPagos - saldoSaidas;

    let saldoAnterior = carteira;
    const diferenca = Math.abs(novoSaldo - saldoAnterior);

    if (diferenca < 0.01) {
      console.log("✅ Saldo não foi alterado. Nenhuma ação realizada na carteira.");
    } else {
      console.log("🔁 Saldo alterado. Atualizando carteira e gerando comprovante...");

      const tipoTransacao = novoSaldo > saldoAnterior ? 'crédito' : 'débito';

      await Carteira.create({ userId: id, saldo: novoSaldo, statusPag: 'PAGO' });

      await TransacoesCarteira.create({
        userId: id,
        valor: diferenca,
        tipo: tipoTransacao,
        descricao: 'Saldo ajustado manualmente após atualização de usuário',
        saldoAnterior,
        saldoAtual: novoSaldo
      });

      await gerarComprovante(id, diferenca, saldoAnterior, novoSaldo, tipoTransacao);
    }

    res.json({ message: "Usuário e saldo atualizados com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post('/salvar-endereco-retirada-no-carrinho', async (req, res) => {
  const {
    nomeCliente,
    rua,
    numeroRua,
    complemento,
    cep,
    estado,
    cidade,
    bairro,
    email,
    telefone,
    downloadLinks // Recebe o array de downloadLinks
  } = req.body;

  // Criar um objeto de endereço base
  const enderecoBase = {
    nomeCliente,
    rua,
    numeroRua,
    complemento,
    cep,
    cidade,
    estado,
    bairro,
    email,
    telefone,
    tipoEntrega: 'Entrega a Retirar na Loja'
  };

  // Verificar se o carrinho já existe na sessão
  req.session.carrinho = req.session.carrinho || [];

  // Criar um array para armazenar endereços quebrados
  const enderecosQuebrados = [];

  // Iterar sobre o carrinho e criar endereços quebrados
  req.session.carrinho.forEach((produto, index) => {
    const produtoLink = downloadLinks[index] ? downloadLinks[index].downloadLink : null;

    for (let i = 0; i < produto.quantidade; i++) {
      const enderecoQuebrado = { 
        ...enderecoBase, 
        downloadLink: produtoLink // Associa o link de download ao endereço quebrado
      };
      enderecosQuebrados.push(enderecoQuebrado);
    }
  });

  // Atualizar cada produto no carrinho com o endereço correspondente
  req.session.carrinho.forEach((produto, index) => {
    produto.endereco = enderecosQuebrados[index];
  });

  // Salvar os endereços quebrados na sessão
  req.session.endereco = enderecosQuebrados;

  console.log('Endereços Quebrados:', enderecosQuebrados);
  console.log('Conteúdo da Sessão:', req.session);

  // Enviar uma resposta de sucesso
  res.json({ success: true });
});

async function getCoordinatesFromAddressEnd(enderecoEntregaInfo, apiKey) {
  const {rua, cep, estado, cidade} = enderecoEntregaInfo;
  const formattedAddressEnd = `${rua}, ${cep}, ${cidade}, ${estado}`;
  const geocodingUrlEnd = `https://dev.virtualearth.net/REST/v1/Locations/${encodeURIComponent(formattedAddressEnd)}?o=json&key=${apiKey}`

  try {
    const response = await fetch(geocodingUrlEnd);

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
      const coordinates = data.resourceSets[0].resources[0].point.coordinates;
      return { latitude: coordinates[0], longitude: coordinates[1] };
    } else {
      console.error('Nenhum resultado de geocodificação encontrado para o endereço:', formattedAddressEnd);
      return { latitude: null, longitude: null };
    }
  }catch (error) {
    console.error('Erro ao obter coordenadas de geocodificação:', error.message);
    return { latitude: null, longitude: null, errorMessage: error.message };
  }
}
// Função para obter coordenadas geográficas (latitude e longitude) a partir do endereço usando a API de Geocodificação do Bing Maps
async function getCoordinatesFromAddress(addressInfo, apiKey) {
    const { endereco, cep, cidade, estado } = addressInfo;
    const formattedAddress = `${endereco}, ${cep}, ${cidade}, ${estado}`;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formattedAddress)}&key=${`57ae2ecb054049b9aba4dc7eada833a3`}&language=pt&pretty=1`;

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    } else {
      return { latitude: null, longitude: null, errorMessage: 'Nenhum resultado encontrado' };
    }
  } catch (error) {
    return { latitude: null, longitude: null, errorMessage: error.message };
  }
  }

// Função para calcular a distância haversine entre duas coordenadas geográficas
function haversineDistance(lat1, lon1, lat2, lon2) {
  // Fórmula haversine
  const R = 6371; // Raio médio da Terra em quilômetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

async function encontrarGraficaMaisProxima(endereco) {
  try {
    const enderecoDoFrete = {
      rua: endereco.rua,
      bairro: endereco.bairro,
      cep: endereco.cep,
      cidade: endereco.cidade,
      estado: endereco.estado,
    };

    const formattedAddress = `${enderecoDoFrete.rua}, ${enderecoDoFrete.cep}, ${enderecoDoFrete.cidade}, ${enderecoDoFrete.estado}`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formattedAddress)}&format=json&limit=1`;

    const response = await axios.get(nominatimUrl, {
      headers: {
        'User-Agent': 'imprimeai-backend/1.0'
      },
      timeout: 15000
    });

    let coordinatesEnd = { latitude: null, longitude: null };

    if (response.data.length > 0) {
      coordinatesEnd = {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    } else {
      console.error('Nenhum resultado de geocodificação encontrado para o endereço:', formattedAddress);
      return { latitude: null, longitude: null, errorMessage: 'Nenhum resultado encontrado' };
    }

    if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
      console.log(`Latitude do Endereço de Entrega:`, coordinatesEnd.latitude);
      console.log(`Longitude do Endereço de Entrega:`, coordinatesEnd.longitude);

      const graficas = await Graficas.findAll();

      let distanciaMinima = Infinity;
      let graficaMaisProxima = null;

      for (let graficaAtual of graficas) {
        const graficaAddress = `${graficaAtual.enderecoCad}, ${graficaAtual.cepCad}, ${graficaAtual.cidadeCad}, ${graficaAtual.estadoCad}`;
        const graficaUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(graficaAddress)}&format=json&limit=1`;

        const graficaResp = await axios.get(graficaUrl, {
          headers: {
            'User-Agent': 'imprimeai-backend/1.0'
          },
          timeout: 15000
        });

        if (graficaResp.data.length === 0) continue;

        const graficaCoordinates = {
          latitude: parseFloat(graficaResp.data[0].lat),
          longitude: parseFloat(graficaResp.data[0].lon)
        };

        const distanceToGrafica = haversineDistance(
          graficaCoordinates.latitude,
          graficaCoordinates.longitude,
          coordinatesEnd.latitude,
          coordinatesEnd.longitude
        );

        if (distanceToGrafica < distanciaMinima) {
          distanciaMinima = distanceToGrafica;
          graficaMaisProxima = graficaAtual;
        }
      }

      let custoPorKm;
      let custoDoFrete;
      if (distanciaMinima <= 2) {
        custoPorKm = 10.00;
      } else if (distanciaMinima <= 5) {
        custoPorKm = 4.00;
      } else if (distanciaMinima <= 10) {
        custoPorKm = 3.33;
      } else {
        custoPorKm = 2.15;
      }

      if (distanciaMinima * custoPorKm > 45) {
        custoDoFrete = 45.00;
      } else {
        custoDoFrete = parseFloat((distanciaMinima * custoPorKm).toFixed(2));
      }

      return {
        graficaMaisProxima,
        distanciaMinima,
        custoDoFrete
      };
    }
  } catch (err) {
    console.error('Erro ao encontrar a gráfica mais próxima:', err.message);
  }
}
async function encontrarGraficaMaisProxima2(enderecosSalvos) {
  try {
    const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';

    const resultadosFrete = [];
    let somaDosFretes = 0;

    for (let endereco of enderecosSalvos) {
      const enderecoDoFrete = {
        rua: endereco.rua,
        bairro: endereco.bairro,
        cep: endereco.cep,
        cidade: endereco.cidade,
        estado: endereco.estado,
      };

      const coordinatesEnd = await getCoordinatesFromAddress(enderecoDoFrete, apiKey);
      if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
        console.log(`Latitude do Endereço de Entrega:`, coordinatesEnd.latitude);
        console.log(`Longitude do Endereço de Entrega:`, coordinatesEnd.longitude);

        const graficas = await Graficas.findAll();

        let distanciaMinima = Infinity;
        let graficaMaisProxima = null;

        for (let graficaAtual of graficas) {
          const graficaCoordinates = await getCoordinatesFromAddress({
            endereco: graficaAtual.enderecoCad,
            cep: graficaAtual.cepCad,
            cidade: graficaAtual.cidadeCad,
            estado: graficaAtual.estadoCad,
          }, apiKey);

          const distanceToGrafica = haversineDistance(graficaCoordinates.latitude, graficaCoordinates.longitude, coordinatesEnd.latitude, coordinatesEnd.longitude);

          if (distanceToGrafica < distanciaMinima) {
            distanciaMinima = distanceToGrafica;
            graficaMaisProxima = graficaAtual;
          }
        }

        console.log('Gráfica mais próxima:', graficaMaisProxima);
        console.log('Distância mínima:', distanciaMinima);
        
        // Lógica de escalonagem de frete por km
        let custoPorKm;
        if (distanciaMinima <= 2) {
          custoPorKm = 10.00;
        } else if (distanciaMinima <= 5) {
          custoPorKm = 4.00;
        } else if (distanciaMinima <= 10) {
          custoPorKm = 3.33;
        } else {
          custoPorKm = 2.76;
        }

        const custoDoFrete = parseFloat((distanciaMinima * custoPorKm).toFixed(2));
        somaDosFretes += custoDoFrete;

        resultadosFrete.push({
          endereco,
          graficaMaisProxima,
          distanciaMinima,
          custoDoFrete
        });
      }
    }

    return {
      resultadosFrete,
      somaDosFretes: parseFloat(somaDosFretes.toFixed(2))
    };

    } catch (err) {
    console.error('Erro ao encontrar as gráficas mais próximas:', err);
  }
}
app.post('/upload', upload.single('filePlanilha'), async (req, res) => {
  if (req.file) {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    try {
      const carrinho = req.session.carrinho || [];
      const enderecosSalvos = [];

      // Defina o índice da linha a partir da qual você deseja começar a iterar
      const startRowIndex = 19;
      // Iterar a partir da linha especificada
      for (let i = startRowIndex; i < sheet.length; i++) {
        const row = sheet[i];
        // Certifique-se de que a linha possui pelo menos 10 colunas (ajuste conforme necessário)
        if (row.length >= 10) {
          const endereco = {
            cep: row[1],
            rua: row[2],
            numeroRua: row[3],
            complemento: row[4],
            bairro: row[5],
            cidade: row[6],
            estado: row[7],
            cuidados: row[8],
            telefone: row[9],
            quantidade: row[0], // Quantidade especificada
          };
          enderecosSalvos.push(endereco);
        }
      }

      // Certifique-se de que o carrinho tenha produtos
      if (carrinho.length === 0) {
        return res.status(400).send('O carrinho está vazio. Adicione produtos antes de usar a planilha.');
      }

      // Encontrar os fretes para todos os endereços salvos e calcular a soma total dos fretes
      const { resultadosFrete, somaDosFretes } = await encontrarGraficaMaisProxima2(enderecosSalvos);
      
      // Quebrar produtos com base nos endereços salvos
      const carrinhoQuebrado = [];
      let enderecoIndex = 0; // Índice para rastrear os endereços
      const sufixoAleatorio = Math.floor(Math.random() * 1000000);

      carrinho.forEach((produto, produtoIndex) => {
        const produtoId = produto.produtoId;
        const quantidadeTotal = produto.quantidade;

        enderecosSalvos.forEach((endereco, index) => {
          const quantidadeEndereco = endereco.quantidade; // Quantidade especificada para esse endereço
          
          if (quantidadeEndereco > 0 && quantidadeEndereco <= quantidadeTotal) {
            const frete = resultadosFrete[index].custoDoFrete; // Pegar o custo do frete correspondente ao endereço

            carrinhoQuebrado.push({
              produtoId: `${produtoId}_${sufixoAleatorio}_${index}`,
              nomeProd: produto.nomeProd,
              quantidade: quantidadeEndereco,
              valorUnitario: produto.valorUnitario,
              subtotal: produto.valorUnitario * quantidadeEndereco,
              raioProd: produto.raioProd,
              marca: produto.marca,
              modelo: produto.modelo,
              acabamento: produto.acabamento,
              cor: produto.cor,
              enobrecimento: produto.enobrecimento,
              formato: produto.formato,
              material: produto.material,
              nomeArquivo: produto.nomeArquivo,
              downloadLink: produto.downloadLink,
              tipoEntrega: 'Múltiplos Enderecos',
              endereco: {
                ...endereco,
                tipoEntrega: 'Múltiplos Enderecos',
                frete: frete,
              },
            });

            // Subtrai a quantidade já alocada
            produto.quantidade -= quantidadeEndereco;
          }
        });
      });

      // Atualizar a sessão com o carrinho quebrado
      req.session.carrinho = carrinhoQuebrado;

      console.log('Carrinho Quebrado:', carrinhoQuebrado);
      console.log('Soma dos Fretes:', somaDosFretes);

      res.send('Planilha enviada e dados salvos no carrinho com sucesso.');
    } catch (error) {
      console.error('Erro ao processar a planilha:', error);
      res.status(500).send('Erro ao processar a planilha.');
    }
  } else {
    res.status(400).send('Nenhum arquivo enviado.');
  }
});
// Mapeamento de MIME types para extensões de arquivo
const mimeToExt = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  // Adicione outros tipos MIME conforme necessário
};

const getExtensionFromMime = (mimetype) => mimeToExt[mimetype] || '';

// Configuração do Multer para salvar os arquivos na pasta 'uploads'
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (file.originalname === '15456') {
      const basename = 'Enviar Arte Depois';
      const extension = ''; // Sem extensão
      cb(null, `${basename}${extension}`);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let extension = path.extname(file.originalname);

      if (!extension) {
        // Se o originalname não tem extensão, use a extensão do tipo MIME
        extension = getExtensionFromMime(file.mimetype);
      }

      const basename = path.basename(file.originalname, extension);
      cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
  }
});

const upload2 = multer({ 
  storage: storage2,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Middleware para parsing de JSON
app.use(express.json());

// Rota para fazer o upload dos arquivos e salvar os links de download no carrinho
app.post('/api/upload', upload2.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = files.map(file => ({
      nomeArquivo: file.originalname,
      downloadLink: file.originalname === '15456' ? 'Enviar Arte Depois' : `/uploads/${file.filename}`
    }));

    // Atualizar os links de download na sessão do carrinho
    const { session } = req;
    const carrinho = session.carrinho || [];

    uploadedFiles.forEach((file) => {
      const produtoIndex = carrinho.findIndex((produto) => !produto.downloadLink);
      if (produtoIndex !== -1) {
        // Encontrou um produto sem link de download
        carrinho[produtoIndex].downloadLink = file.downloadLink;
        carrinho[produtoIndex].nomeArquivo = file.nomeArquivo;
      }
    });

    session.carrinho = carrinho;

    console.log('Arquivos enviados:', uploadedFiles);
    console.log('Carrinho após Atualizado', carrinho);
    res.status(200).send('Upload concluído com sucesso');
  } catch (error) {
    console.error('Erro durante o upload:', error);
    res.status(500).send('Erro durante o upload');
  }
});
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//Função para fazer upload dos arquivos ao google drive
async function uploadFile(file) {
  console.log('File Object:', file);
  const nomeArquivo = file.originalname;
  if (file.originalname.trim() === "Enviar Arte Depois") {
    return { webViewLink: "Enviar Arte Depois", nomeArquivo: "Enviar Arte Depois" };
  }else {
  const fileMetaData = {
    'name': file.originalname, // Use file.originalname instead of 'file.originalname'
    'parents': [GOOGLE_API_FOLDER_ID],
  };

  const media = {
    mimeType: file.mimetype,
    body: stream.Readable.from(file.buffer),
    length: file.size,
  };

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const auth = await new google.auth.GoogleAuth({
        keyFile: './googledrive.json',
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      const driveService = google.drive({
        version: 'v3',
        auth
      });

      const response = await driveService.files.create({
        resource: fileMetaData,
        media: media,
        fields: 'id,webViewLink',
        timeout: 10000, // 60 seconds timeout
      });

      const fileId = response.data.id;
      const webViewLink = response.data.webViewLink;

      const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

      return { fileId, webViewLink, downloadLink, nomeArquivo };
    } catch (err) {
      console.error('Error during file upload:', err);
      retryCount++;
    }
  }

  throw new Error('Max retry attempts reached. Upload failed.');
}
}
// Rota para obter todos os registros da tabela Graficas
app.get('/graficas', async (req, res) => {
  try {
    const carrinho = req.session.carrinho
    const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
    const enderecoUsuario = req.query;
    const raioDeBusca = carrinho[0].raioProd; // Suponha que o raio de busca esteja armazenado na sessão do carrinho

    const endereco = {
      rua: enderecoUsuario.rua,
      bairro: enderecoUsuario.bairro,
      cep: enderecoUsuario.cep,
      cidade: enderecoUsuario.cidade,
      estado: enderecoUsuario.estado,
    };

    // Obter coordenadas do endereço do usuário
    const coordinatesEnd = await getCoordinatesFromAddress(endereco, apiKey);

    if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
      const graficas = await Graficas.findAll();
      const graficasProximas = [];

      // Iterar sobre todas as gráficas para encontrar as mais próximas dentro do raio
      for (let graficaAtual of graficas) {
        const graficaCoordinates = await getCoordinatesFromAddress({
          endereco: graficaAtual.enderecoCad,
          cep: graficaAtual.cepCad,
          cidade: graficaAtual.cidadeCad,
          estado: graficaAtual.estadoCad,
        }, apiKey);

        const distanceToGrafica = haversineDistance(graficaCoordinates.latitude, graficaCoordinates.longitude, coordinatesEnd.latitude, coordinatesEnd.longitude);

        if (distanceToGrafica <= raioDeBusca) {
          graficasProximas.push(graficaAtual);
        }
      }

      // Retornar os dados das gráficas próximas dentro do raio de busca
      res.send(graficasProximas);
    } else {
      throw new Error('Não foi possível encontrar as coordenadas do endereço do usuário');
    }
  } catch (error) {
    console.error('Erro ao buscar as gráficas:', error);
    res.status(500).send('Erro ao buscar as gráficas');
  }
});

app.post('/criar-pedidos', async (req, res) => {
  const { metodPag, idTransacao, valorPed, linkPagamento, dataVencimento } = req.body;
  const carrinhoQuebrado = req.session.carrinho || [];
  const enderecoDaSessao = req.session.endereco;
  const userId = req.cookies.userId

  try {
    if (carrinhoQuebrado.length === 0) {
      throw new Error('Carrinho vazio.');
    }

    const user = await User.findByPk(userId);

    const isMultipleAddresses = carrinhoQuebrado[0].tipoEntrega === 'Múltiplos Enderecos';

    const totalUnidades = carrinhoQuebrado.reduce((total, produto) => total + produto.quantidade, 0);
    const totalAPagar = await Promise.all(carrinhoQuebrado.map(async (produto) => {
      const produtoInfo = await Produtos.findByPk(produto.produtoId);
      return produtoInfo.valorProd * produto.quantidade;
    })).then(valores => valores.reduce((total, valor) => total + valor, 0));

    const pedido = await Pedidos.create({
      idUserPed: req.cookies.userId,
      nomePed: 'Pedido Geral',
      quantPed: totalUnidades,
      valorPed: totalAPagar,
      statusPed: metodPag === 'BOLETO' ? 'Esperando Pagamento' : 'Pago',
      metodPag: metodPag,
      idTransacao: idTransacao,
      dataVencimento: dataVencimento
    });

    const enderecosPromises = carrinhoQuebrado.map(async (produto) => {
      const endereco = produto.endereco || {};
      return Enderecos.create({
        idPed: pedido.id,
        rua: endereco.rua,
        cep: endereco.cep,
        cidade: endereco.cidade,
        numero: endereco.numeroRua,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        quantidade: produto.quantidade,
        celular: endereco.telefone,
        estado: endereco.estado,
        cuidados: endereco.cuidados,
        raio: produto.raioProd,
        produtos: produto.produtoId,
        idProduto: produto.produtoId,
        tipoEntrega: endereco.tipoEntrega,
        frete: endereco.frete
      });
    });

    const enderecos = await Promise.all(enderecosPromises);

    const itensPedidoPromises = carrinhoQuebrado.map(async (produto, index) => {
      const produtoInfo = await Produtos.findByPk(produto.produtoId);
      return ItensPedido.create({
        idPed: pedido.id,
        idUserPed: req.cookies.userId,
        idProduto: produto.produtoId,
        nomeProd: produtoInfo.nomeProd,
        quantidade: produto.quantidade,
        valorProd: produtoInfo.valorProd,
        raio: produto.raioProd,
        marca: produto.marca,
        modelo: produto.modelo,
        acabamento: produto.acabamento,
        cor: produto.cor,
        enobrecimento: produto.enobrecimento,
        formato: produto.formato,
        material: produto.material,
        arquivo: produto.arquivo,
        statusPed: carrinhoQuebrado.some(p => p.downloadLink === "Enviar Arte Depois") ? 'Pedido em Aberto' : 'Recebido',
        statusPag: metodPag === 'BOLETO' ? 'Esperando Pagamento' : metodPag === 'Carteira Usuário' ? 'Pago' : 'Aguardando',
        linkDownload: produto.downloadLink,
        nomeArquivo: produto.nomeArquivo,
        arteEmpresas: produto.arte == null || produto.arte === "" ? "Não há" : produto.arte,
        tipo: "Normal",
        enderecoId: enderecos[index].id
      });
    });

    const itensPedido = await Promise.all(itensPedidoPromises);

    // Buscar informações do usuário para o WhatsApp
    const usuario = await User.findByPk(userId, { attributes: ['telefoneCad', 'userCad'] });
    if (usuario) {

      const carrinho = req.session.carrinho;
      // Calcula o valor total, incluindo o frete corretamente para cada item
      const totalAmount = carrinho.reduce((total, item) => {
      let itemSubtotal;

      if (item.endereco.tipoEntrega === "Único Endereço") {
        itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
      } else if (item.endereco.tipoEntrega === "Entrega a Retirar na Loja") {
        itemSubtotal = item.valorUnitario * item.quantidade;
      } else {
        itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
      }
      
      return total + itemSubtotal; // sem conversão para centavos
    }, 0);

      const hojeComHifen = new Date().toISOString().split('T')[0];
      const dadosNfse = {
        payment: idTransacao,
        customer: user.customer_asaas_id,
        externalReference: Math.floor(Math.random() * 999) + 1,
        value: totalAmount,
        effectiveDate: hojeComHifen
      };

      // Verificar se o pagamento é diferente de "Carteira Usuário"
      if (metodPag !== 'Carteira Usuário' && metodPag !== 'BOLETO') {
        const nfse = await agendarNfsAsaas(dadosNfse);
        const invoice = nfse.id;
        
        const nfseEmitida = await emitirNfs(invoice);
        const externalReference = nfseEmitida.externalReference;
        
        const notaAutorizada = await consultarNf(externalReference);
        console.log('Nota autorizada:', notaAutorizada);
        const nfseUrl = notaAutorizada.pdfUrl;
        
        pedido.nfseUrl = nfseUrl;
        pedido.statusPag = 'Pago';
        await pedido.save();
      }
    }

    if(metodPag != 'BOLETO') {
    const nome = usuario.userCad;
      const telefone = usuario.telefoneCad;
      const linkDetalhamento = `https://www.imprimeai.com.br/detalhesPedidosUser?idPedido=${pedido.id}`
      const mensagemWhatsapp = `Oi, ${nome}! Tudo bem? 😊

Parabéns pela sua escolha! 🎊
Obrigado por confiar sua impressão à ImprimeAí. Nosso time está super feliz por poder te atender!

Se precisar de algo mais ou tiver qualquer dúvida, é só nos chamar.

📦 Em breve, você receberá novidades sobre o andamento do seu pedido #${pedido.id}.
Você também pode acompanhar tudo pelo site:
🔗 ${linkDetalhamento}

📸 Siga nosso Instagram: @imprimeai.com.br
Lá você encontra novidades, cupons de desconto e dicas de comunicação visual. 

Obrigada,

Pri !
✨ Tá com pressa? ImprimeAí!`;

    // Chamada da função de verificação da gráfica  
    if (isMultipleAddresses) {
      await verificarGraficaMaisProximaEAtualizar2(itensPedido, enderecos);
    } else {
      await verificarGraficaMaisProximaEAtualizar(itensPedido[0], enderecos[0]);
    }
      await enviarNotificacaoWhatsapp(telefone, mensagemWhatsapp);
    } else{
      const nome = usuario.userCad;
      const telefone = usuario.telefoneCad;
      const linkDetalhamento = `https://www.imprimeai.com.br/detalhesPedidosUser?idPedido=${pedido.id}`;
      mensagemWhatsapp = `Oi, ${nome}! Tudo bem? 😊
        
Parabéns pela sua escolha! 🎊
Muito obrigado por confiar sua impressão à ImprimeAí. Nosso time está super feliz por poder te atender!
        
Para que possamos liberar seu pedido #${pedido.id}, lembramos que é necessário efetuar o pagamento do boleto. Você pode acessar o seu boleto clicando no link abaixo:
        
🔗 ${linkPagamento}

O prazo para o pagamento é de até dois dias a partir da data de emissão. Após a confirmação do pagamento, seu pedido será liberado e você receberá atualizações sobre o andamento. 📦
        
Caso precise de qualquer ajuda ou tenha dúvidas, estamos à disposição para te apoiar. 🙂
        
📸 Ah, aproveite para seguir nosso Instagram: @imprimeai.com.br, lá você encontra novidades, cupons de desconto e dicas de comunicação visual!

Obrigada,
        
Pri!
✨ Tá com pressa? ImprimeAí!`;
await enviarNotificacaoWhatsapp(telefone, mensagemWhatsapp);
    }

    // Limpar a sessão
    req.session.carrinho = [];
    req.session.endereco = {};

    // Enviar resposta ao cliente
    res.status(200).json({ message: 'Pedido criado com sucesso!', idPed: pedido.id });

  } catch (error) {
    console.error('Erro ao criar pedidos:', error);
    res.status(500).json({ error: 'Erro ao criar pedidos' });
  }
});

app.post('/criar-pedidos-empresas', async (req, res) => {
  const { metodPag, idTransacao, valorPed, linkPagamento, dataVencimento } = req.body;
  const carrinhoQuebrado = req.session.carrinho || [];
  const enderecoDaSessao = req.session.endereco;
  const userId = req.cookies.userId

  try {
    if (carrinhoQuebrado.length === 0) {
      throw new Error('Carrinho vazio.');
    }
    
    const user = await UserEmpresas.findByPk(userId);

    const isMultipleAddresses = carrinhoQuebrado[0].tipoEntrega === 'Múltiplos Enderecos';

    const totalUnidades = carrinhoQuebrado.reduce((total, produto) => total + produto.quantidade, 0);
    const totalAPagar = await Promise.all(carrinhoQuebrado.map(async (produto) => {
      const produtoInfo = await ProdutosExc.findByPk(produto.produtoId);
      return produtoInfo.valorProd * produto.quantidade;
    })).then(valores => valores.reduce((total, valor) => total + valor, 0));

    const dataAtual = dayjs().tz('America/Sao_Paulo');
    const dataPrevisaoProducao = adicionarHorasUteis(dayjs(), 72);

    const pedido = await Pedidos.create({
      idUserPed: req.cookies.userId,
      nomePed: 'Pedido Geral',
      quantPed: totalUnidades,
      valorPed: totalAPagar,
      statusPed: metodPag === 'BOLETO' ? 'Esperando Pagamento' : 'Pago',
      metodPag: metodPag,
      idTransacao: idTransacao,
      dataPrevisaoProducao: dataPrevisaoProducao.toISOString(),
      dataVencimento: dataVencimento
    });

    const enderecosPromises = carrinhoQuebrado.map(async (produto) => {
      const endereco = produto.endereco || {};
      return Enderecos.create({
        idPed: pedido.id,
        rua: endereco.rua,
        cep: endereco.cep,
        cidade: endereco.cidade,
        numero: endereco.numeroRua,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        quantidade: produto.quantidade,
        celular: endereco.telefone,
        estado: endereco.estado,
        cuidados: endereco.cuidados,
        raio: produto.raioProd,
        produtos: produto.produtoId,
        idProduto: produto.produtoId,
        tipoEntrega: endereco.tipoEntrega,
        frete: endereco.frete
      });
    });

    const enderecos = await Promise.all(enderecosPromises);

    const itensPedidoPromises = carrinhoQuebrado.map(async (produto, index) => {
      const produtoInfo = await ProdutosExc.findByPk(produto.produtoId);
      return ItensPedido.create({
        idPed: pedido.id,
        idUserPed: req.cookies.userId,
        idProduto: produto.produtoId,
        nomeProd: produtoInfo.nomeProd,
        quantidade: produto.quantidade,
        valorProd: produtoInfo.valorProd,
        raio: produto.raioProd,
        marca: produto.marca,
        modelo: produto.modelo,
        acabamento: produto.acabamento,
        cor: produto.cor,
        enobrecimento: produto.enobrecimento,
        formato: produto.formato,
        material: produto.material,
        arquivo: produto.arquivo,
        statusPed: carrinhoQuebrado.some(p => p.downloadLink === "Enviar Arte Depois") ? 'Pedido em Aberto' : 'Recebido',
        statusPag: (metodPag === 'Boleto' || metodPag === 'BOLETO')
        ? 'Esperando Pagamento'
        : (metodPag === 'Carteira Usuário' || metodPag === 'PIX' || metodPag === 'CARTÃO')
        ? 'Pago'
        : 'Aguardando',
        linkDownload: produto.downloadLink,
        nomeArquivo: produto.nomeArquivo,
        arteEmpresas: produto.arte == null || produto.arte === "" ? "Não há" : produto.arte,
        tipo: "Empresas",
        enderecoId: enderecos[index].id
      });
    });

    const itensPedido = await Promise.all(itensPedidoPromises);

    // Chamada da função de verificação da gráfica

    // Buscar informações do usuário para o WhatsApp
    const usuario = await UserEmpresas.findByPk(userId, { attributes: ['telefoneCad', 'userCad'] });
    if (usuario) {

      if(metodPag == 'BOLETO' || 'PIX' || 'CARTÃO') {

        const carrinho = req.session.carrinho;
        // Calcula o valor total, incluindo o frete corretamente para cada item
        const totalAmount = carrinho.reduce((total, item) => {
          let itemSubtotal;
          
          if (item.endereco.tipoEntrega === "Único Endereço") {
            itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
          } else if (item.endereco.tipoEntrega === "Entrega a Retirar na Loja") {
            itemSubtotal = item.valorUnitario * item.quantidade;
          } else {
            itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
          }
          
          return total + itemSubtotal; // sem conversão para centavos
        }, 0);

        const hojeComHifen = new Date().toISOString().split('T')[0];
      const dadosNfse = {
        payment: idTransacao,
        customer: user.customer_asaas_id,
        externalReference:  Math.floor(Math.random() * 999) + 1,
        value: totalAmount,
        effectiveDate: hojeComHifen
      };
        if (metodPag !== 'Carteira Usuário' && metodPag !== 'BOLETO') {
          const nfse = await agendarNfsAsaas(dadosNfse);
          const invoice = nfse.id;
          
          const nfseEmitida = await emitirNfs(invoice);
          const externalReference = nfseEmitida.externalReference;
          
          const notaAutorizada = await consultarNf(externalReference);
          console.log('Nota autorizada:', notaAutorizada);
          const nfseUrl = notaAutorizada.pdfUrl;
          
          pedido.nfseUrl = nfseUrl
          pedido.statusPag = 'Pago'
          pedido.save();
        }

      }
    }

    if(metodPag != 'BOLETO') {
    const nome = usuario.userCad;
      const telefone = usuario.telefoneCad;
      const linkDetalhamento = `https://www.imprimeai.com.br/detalhesPedidosUser?idPedido=${pedido.id}`
      const mensagemWhatsapp = `Oi, ${nome}! Tudo bem? 😊

Parabéns pela sua escolha! 🎊
Obrigado por confiar sua impressão à ImprimeAí. Nosso time está super feliz por poder te atender!

Se precisar de algo mais ou tiver qualquer dúvida, é só nos chamar.

📦 Em breve, você receberá novidades sobre o andamento do seu pedido #${pedido.id}.
Você também pode acompanhar tudo pelo site:
🔗 ${linkDetalhamento}

📸 Siga nosso Instagram: @imprimeai.com.br
Lá você encontra novidades, cupons de desconto e dicas de comunicação visual. 

Obrigada,

Pri !
✨ Tá com pressa? ImprimeAí!`;

      await enviarNotificacaoWhatsapp(telefone, mensagemWhatsapp);
      await verificarGraficaMaisProximaEAtualizar(itensPedido[0], enderecos[0]);
    } else{
      const nome = usuario.userCad;
      const telefone = usuario.telefoneCad;
      mensagemWhatsapp = `Oi, ${nome}! Tudo bem? 😊
        
Parabéns pela sua escolha! 🎊
Muito obrigado por confiar sua impressão à ImprimeAí. Nosso time está super feliz por poder te atender!
        
Para que possamos liberar seu pedido #${pedido.id}, lembramos que é necessário efetuar o pagamento do boleto. Você pode acessar o seu boleto clicando no link abaixo:
        
🔗 ${linkPagamento}

O prazo para o pagamento é de até dois dias a partir da data de emissão. Após a confirmação do pagamento, seu pedido será liberado e você receberá atualizações sobre o andamento. 📦
        
Caso precise de qualquer ajuda ou tenha dúvidas, estamos à disposição para te apoiar. 🙂
        
📸 Ah, aproveite para seguir nosso Instagram: @imprimeai.com.br, lá você encontra novidades, cupons de desconto e dicas de comunicação visual!

Obrigada,
        
Pri!
✨ Tá com pressa? ImprimeAí!`;
await enviarNotificacaoWhatsapp(telefone, mensagemWhatsapp);
    }

    // Limpar a sessão
    req.session.carrinho = [];
    req.session.endereco = {};

    // Enviar resposta ao cliente
    res.status(200).json({ message: 'Pedido criado com sucesso!' });

  } catch (error) {
    console.error('Erro ao criar pedidos:', error);
    res.status(500).json({ error: 'Erro ao criar pedidos' });
  }
});

async function isProdutoExclusivo(nomeProduto) {
  const produto = await ProdutosExc.findOne({ where: { nomeProd: nomeProduto } });
  return !!produto;
}

async function verificarGraficaMaisProximaEAtualizar(itensPedido, enderecoPedido) {
  try {
    console.log("Iniciando verificação da gráfica mais próxima...");

    if (!Array.isArray(itensPedido)) {
      console.log("Itens do pedido não estão em array, convertendo...");
      itensPedido = [itensPedido];
    }

    const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';

    const enderecoEntregaInfo = {
      endereco: enderecoPedido.rua,
      cep: enderecoPedido.cep,
      cidade: enderecoPedido.cidade,
      estado: enderecoPedido.estado
    };

    console.log("Obtendo coordenadas do endereço de entrega:", enderecoEntregaInfo);
    const coordinatesEnd = await getCoordinatesFromAddress(enderecoEntregaInfo, apiKey);
    console.log("Coordenadas de entrega:", coordinatesEnd);

    if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
      console.log("Buscando gráficas no banco de dados...");
      const graficas = await Graficas.findAll();
      console.log(`Total de gráficas encontradas: ${graficas.length}`);

      let distanciaMinima = Infinity;
      let graficaMaisProxima = null;

      for (let grafica of graficas) {
        console.log(`Calculando distância até a gráfica: ${grafica.userCad}`);
        const graficaCoordinates = await getCoordinatesFromAddress({
          endereco: grafica.enderecoCad,
          cep: grafica.cepCad,
          cidade: grafica.cidadeCad,
          estado: grafica.estadoCad,
        }, apiKey);

        const distanceToGrafica = haversineDistance(
          graficaCoordinates.latitude,
          graficaCoordinates.longitude,
          coordinatesEnd.latitude,
          coordinatesEnd.longitude
        );

        console.log(`Distância até ${grafica.userCad}: ${distanceToGrafica.toFixed(2)} km`);

        if (distanceToGrafica < distanciaMinima) {
          distanciaMinima = distanceToGrafica;
          graficaMaisProxima = grafica;
        }
      }

      console.log(`Gráfica mais próxima: ${graficaMaisProxima?.userCad || 'Nenhuma'} a ${distanciaMinima.toFixed(2)} km`);

      const raioEndereco = enderecoPedido.raio;
      if (distanciaMinima <= raioEndereco && graficaMaisProxima) {
        console.log(`A gráfica ${graficaMaisProxima.userCad} está dentro do raio (${raioEndereco} km)`);

        let produtosGrafica;
        if (typeof graficaMaisProxima.produtos === 'string') {
          const fixedJsonString = graficaMaisProxima.produtos.replace(/'/g, '"');
          produtosGrafica = JSON.parse(fixedJsonString);
        } else {
          produtosGrafica = graficaMaisProxima.produtos;
        }

        const produtosPedido = itensPedido.map(item => item.nomeProd);
        const produtosAtendidos = Object.keys(produtosGrafica || {});
        const produtosAtendiveis = produtosPedido.filter(produto =>
          produtosAtendidos.includes(produto)
        );

        console.log("Produtos do pedido:", produtosPedido);
        console.log("Produtos atendidos pela gráfica:", produtosAtendidos);
        console.log("Produtos atendíveis:", produtosAtendiveis);

        const produtosExclusivosBanco = await ProdutosExc.findAll({ attributes: ['nomeProd'] });
        const nomesProdutosExclusivos = produtosExclusivosBanco.map(p => p.nomeProd);
        const temProdutoExclusivo = produtosPedido.some(produto =>
          nomesProdutosExclusivos.includes(produto)
        );

        console.log("Produtos exclusivos no sistema:", nomesProdutosExclusivos);
        console.log("Contém produto exclusivo no pedido?", temProdutoExclusivo);

        if (produtosAtendiveis.length > 0 || temProdutoExclusivo) {
          console.log(`A gráfica ${graficaMaisProxima.userCad} pode atender ao pedido.`);

          let mensagemStatus = `Novo pedido ID ${itensPedido[0].idPed}.`;
          if (itensPedido[0].statusPed === 'Pedido em Aberto') {
            mensagemStatus =
              `Olá, *Equipe da Gráfica ${graficaMaisProxima.userCad}*, tudo bem com vocês?\n\n` +
              `Passando para avisar que temos um pedido está em aberto por aí -- é o número ${itensPedido[0].idPed} e aguardando o envio da arte do cliente. Fique atento ao painel de pedidos! \n` +
              `👉 https://imprimeai.com.br/login-graficas \n\n` +
              `Equipe de Suporte\nimprimeai.com.br`;
          } else {
            mensagemStatus =
              `Olá, *Equipe da Gráfica ${graficaMaisProxima.userCad}*, tudo bem com vocês?\n\n` +
              `Passando para avisar que temos um pedido pendente de atendimento por aí -- é o número ${itensPedido[0].idPed}. \n` +
              `👉 https://imprimeai.com.br/login-graficas \n\n` +
              `Equipe de Suporte\nimprimeai.com.br`;
          }

          console.log("Enviando mensagem para WhatsApp...");
          await enviarNotificacaoWhatsapp(graficaMaisProxima.telefoneCad, mensagemStatus);
          console.log(`Gráfica ${graficaMaisProxima.userCad} notificada com sucesso.`);
        } else {
          console.log(`A gráfica mais próxima não atende aos produtos nem há produtos exclusivos.`);
        }
      } else {
        console.log(`Nenhuma gráfica encontrada dentro do raio de ${raioEndereco} km.`);
      }
    } else {
      console.log("Coordenadas do endereço de entrega são inválidas.");
    }
  } catch (error) {
    console.error("Erro na função verificarGraficaMaisProximaEAtualizar:", error);
    throw error;
  }
}
    
async function verificarGraficaMaisProximaEAtualizar2(itensPedido, enderecos) {
      try {
        const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
        let graficasNotificadas = []; // Array para armazenar os IDs das gráficas notificadas

        for (let pedidoCadastrado of itensPedido) {
          for (let enderecoPedido of enderecos) {
            console.log(`Verificando endereço com o Id: ${enderecoPedido.id}`);
      
            const enderecoEntregaInfo = {
              endereco: enderecoPedido.rua,
              cep: enderecoPedido.cep,
              cidade: enderecoPedido.cidade,
              estado: enderecoPedido.estado,
            };
      
            const coordinatesEnd = await getCoordinatesFromAddress(enderecoEntregaInfo, apiKey);
      
            if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
              console.log(`Latitude do Endereço de Entrega: ${coordinatesEnd.latitude}`);
              console.log(`Longitude do Endereço de Entrega: ${coordinatesEnd.longitude}`);
      
              let graficas = await Graficas.findAll();
      
              let distanciaMinima = Infinity;
              let graficaMaisProxima = null;
      
              for (let grafica of graficas) {
                const graficaCoordinates = await getCoordinatesFromAddress({
                  endereco: grafica.enderecoCad,
                  cep: grafica.cepCad,
                  cidade: grafica.cidadeCad,
                  estado: grafica.estadoCad,
                }, apiKey);
      
                const distanceToGrafica = haversineDistance(graficaCoordinates.latitude, graficaCoordinates.longitude, coordinatesEnd.latitude, coordinatesEnd.longitude);
      
                if (distanceToGrafica < distanciaMinima) {
                  distanciaMinima = distanceToGrafica;
                  graficaMaisProxima = grafica;
                }
              }
      
              const raioEndereco = enderecoPedido.raio;
      
              if (distanciaMinima <= raioEndereco && graficaMaisProxima) {
                let produtosGrafica;
                if (typeof graficaMaisProxima.produtos === 'string') {
                  const fixedJsonString = graficaMaisProxima.produtos.replace(/'/g, '"');
                  produtosGrafica = JSON.parse(fixedJsonString);
                } else {
                  produtosGrafica = graficaMaisProxima.produtos;
                }
      
                if (produtosGrafica && produtosGrafica[pedidoCadastrado.nomeProd]) {
                  // Verificar se a gráfica já foi notificada para este pedido
                  if (!graficasNotificadas.includes(graficaMaisProxima.id)) {
                    await pedidoCadastrado.update({
                      graficaAtend: graficaMaisProxima.id,
                    });
      
                    // Salvar o ID da gráfica no graficaAtend do pedido
                    pedidoCadastrado.graficaAtend = graficaMaisProxima.id;
      
                    let mensagemStatus = '';
      
                    if (pedidoCadastrado.statusPed === 'Recebido') {
                       mensagemStatus = `Olá *Parceiro ${graficaMaisProxima.userCad}*, tudo bem?\n\n` +
                      `Estou passando para avisar que temos um pedido aguardando atendimento de vocês. \n` +
                      `O número do pedido é ${itensPedido[0].idPed} e ele precisa ser processado o quanto antes. \n` +
                      `Você pode acessa-lo para dar um aceite por aqui: \n`+
                      `https://imprimeai.com.br/login-graficas\n`+
                      `Fique à vontade para nos avisar se houver qualquer dúvida ou necessidade de mais informações para dar sequência.\n\n` +
                      `Agradecemos a parceria e ficamos no aguardo do retorno. Caso precisem de algo, estamos à disposição!\n\n` +
                      `Atenciosamente,\n` +
                      `Suporte imprimeai.com.br`;
                    } else {
                       mensagemStatus = `Olá *Parceiro ${graficaMaisProxima.userCad}*, tudo bem?\n\n` +
                      `Estou passando para avisar que temos um pedido em Aberto para ser atendido. Fique atento ao seu Painel de Pedidos! \n` +
                      `O número do pedido é ${itensPedido[0].idPed} e ele precisa ser processado o quanto antes. \n` +
                      `Fique à vontade para nos avisar se houver qualquer dúvida ou necessidade de mais informações para dar sequência.\n\n` +
                      `Agradecemos a parceria e ficamos no aguardo do retorno. Caso precisem de algo, estamos à disposição!\n\n` +
                      `Atenciosamente,\n` +
                      `Suporte imprimeai.com.br`;
                    }
      
                    await enviarEmailNotificacao(graficaMaisProxima.emailCad, `Novo Pedido - ID ${pedidoCadastrado.id}`, mensagemStatus);
                    await enviarNotificacaoWhatsapp(graficaMaisProxima.telefoneCad, `Novo Pedido - ${mensagemStatus}`);
      
                    // Adicionar o ID da gráfica notificada ao array
                    graficasNotificadas.push(graficaMaisProxima.id);
                  } else {
                    console.log(`A gráfica ${graficaMaisProxima.id} já foi notificada para o pedido ${pedidoCadastrado.id}`);
                    await pedidoCadastrado.update({
                      graficaAtend: graficaMaisProxima.id,
                    });
                  }   
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos cadastrados:', error);
        // Tratamento de erros
      }
}
    async function enviarEmailNotificacao(destinatario, assunto, corpo) {
      const transporter = nodemailer.createTransport({
        host: 'email-ssl.com.br',  // Servidor SMTP da LocalWeb
        port: 465,                 // Porta para SSL (465)
        secure: true,              // Usar conexão segura (SSL)
        auth: {
          user: 'no-reply@imprimeai.com.br',  // E-mail que você vai usar para enviar
          pass: 'H0ndur@s',                    // Senha do e-mail
        },
      })

      const info = await transporter.sendMail({
        from: 'no-reply@imprimeai.com.br',
        to: destinatario,
        subject: assunto,
        text: corpo,
      });
    
      console.log('E-mail enviado:', info);
    }

    async function enviarNotificacaoWhatsapp(destinatario, corpo) {
      try {
          const response = await sendMessage(destinatario, corpo);
          console.log(`Mensagem enviada com sucesso para a gráfica ${destinatario}:`, response);
          return response;
      } catch (error) {
          console.error(`Erro ao enviar mensagem para a gráfica ${destinatario}:`, error);
          throw error;
      }
  }  

  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: "gabrieldiastrin63@gmail.com",
      pass: "bwep pyqq zocy ljsi"
    }
  })
  
// Agendar a tarefa para ser executada a cada 5 segundos
// Agendar a tarefa para ser executada a cada 5 segundos
cron.schedule('* * * * *', async () => {
  console.log('Verificando pagamentos pendentes...');
  await verificarPagamentosPendentes();
  console.log('Verificação de pagamentos concluída.');
});
    
cron.schedule('* * * * *', async () => {
  console.log('Verificação de pagamentos Carteira...');
  verificarPagamentosPendentesCarteira();
  console.log('Verificação de pagamentos Carteira concluída.');
});

cron.schedule('* * * * *', async () => {
  console.log('Verificação de pagamentos Carteira Empresas...');
  verificarPagamentosPendentesCarteiraEmpresas();
  console.log('Verificação de pagamentos Carteira Empresas concluída.');
});

async function verificarPagamentosPendentes() {
  try {
    const pedidosAguardandoPagamento = await Pedidos.findAll({ where: { statusPed: 'Esperando Pagamento' } });

    for (const pedido of pedidosAguardandoPagamento) {
      const transacaoId = pedido.idTransacao;
      const user = await User.findByPk(pedido.idUserPed);
      const hoje = new Date();
      const hojeUTC = new Date(hoje.toISOString().split('T')[0]);

      const dataVencimento = new Date(pedido.dataVencimento);
      const dataVencimentoUTC = new Date(dataVencimento.toISOString().split('T')[0]);

      const diffMillis = dataVencimentoUTC.getTime() - hojeUTC.getTime();
      const diffDias = Math.floor(diffMillis / (1000 * 60 * 60 * 24));

      // 📢 Notificação 1 dia antes do vencimento
      if (diffDias === 1 && !pedido.notificacaoVencimento1Dia) {
        await enviarNotificacaoWhatsapp(
          user.telefoneCad,
          `⚠️ Atenção: sua cobrança vence amanhã (${dataVencimento.toLocaleDateString('pt-BR')}). Evite juros e complicações! Realize o pagamento agora e fique em dia.`
        );
        pedido.notificacaoVencimento1Dia = true;
        await pedido.save();
      }

      // 📢 Notificação no dia do vencimento
      if (diffDias === 0 && !pedido.notificacaoVencimentoHoje) {
        await enviarNotificacaoWhatsapp(
          user.telefoneCad,
          `Oi,  ${user.userCad}! Tudo bem? 😊

Parabéns pela sua escolha! 🎊
Seu pedido ${pedido.id} já foi registrado com a gente , mas
lembramos que ele será confirmado assim que o pagamento do boleto for identificado.
Assim que isso acontecer, você receberá uma notificação automática e poderá acompanhar todas as etapas diretamente no portal.

Qualquer dúvida, é só falar com a gente! 💬

Obrigada,
Pri ✨
Tá com pressa? ImprimeAí!`
        );
        pedido.notificacaoVencimentoHoje = true;
        await pedido.save();
      }

      try {
        const cobranca = await consultarCobranca(transacaoId);

        // ✅ Pagamento confirmado
        if ((cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') && !pedido.notificacaoPagamentoRecebido) {
          await enviarNotificacaoWhatsapp(
            user.telefoneCad,
            `✅ Pagamento confirmado com sucesso! Seu compromisso foi cumprido e o seu pedido já foi liberado. Ele está a caminho da gráfica mais próxima para ser processado. Agradecemos muito pela sua pontualidade e confiança!`
          );

          const dadosNfse = {
            payment: transacaoId,
            customer: user.customer_asaas_id,
            externalReference: Math.floor(Math.random() * 999) + 1,
            value: user.saldo,
            effectiveDate: hoje.toISOString().split('T')[0],
          };

          const nfse = await agendarNfsAsaas(dadosNfse);
          const invoice = nfse.id;
          const nfseEmitida = await emitirNfs(invoice);
          const externalReference = nfseEmitida.externalReference;
          const notaAutorizada = await consultarNf(externalReference);

          pedido.nfseUrl = notaAutorizada.pdfUrl;
          pedido.statusPed = 'Pago';
          pedido.notificacaoPagamentoRecebido = true;
          await pedido.save();

          await ItensPedido.update({ statusPag: 'Pago' }, { where: { idPed: pedido.id } });

          const itensPedido = await ItensPedido.findAll({ where: { idPed: pedido.id } });
          const enderecos = await Enderecos.findAll({ where: { idPed: pedido.id } });
          
          const isMultipleAddresses = enderecos.length > 1; // Considera múltiplos endereços se houver mais de um

          // Chama a função para verificar a gráfica mais próxima e atualizar os itens do pedido
          if (isMultipleAddresses) {
            await verificarGraficaMaisProximaEAtualizar2(itensPedido, enderecos);
          } else {
            await verificarGraficaMaisProximaEAtualizar(itensPedido[0], enderecos[0]);
          }

        // ❗ Pagamento vencido — notificar uma vez
        } else if ((cobranca.status === 'OVERDUE' || diffDias < 0) && !pedido.notificacaoCobrancaVencida) {
          await enviarNotificacaoWhatsapp(
            user.telefoneCad,
            `Oi, ${user.userCad} Tudo bem? ✨

Notamos que o boleto do pedido ${pedido.id} venceu e não foi compensado.
Por isso, o pedido não pôde ser confirmado em nossa produção.

👉 Mas não se preocupe! Você pode:

Refazer o pedido normalmente em nosso site; ou

Usar a carteira digital ImprimeAí: basta carregar créditos e, a cada compra, o pagamento é confirmado automaticamente — sem precisar gerar um novo boleto a cada vez.

🔗 Acesse sua conta e escolha a melhor opção para você:
imprimeai.com.br/perfil

Qualquer dúvida, estamos aqui para ajudar! 💬

Obrigada,
Pri ✨
Tá com pressa? ImprimeAí!`
          );
          pedido.notificacaoCobrancaVencida = true;
          await pedido.save();

        } else {
          console.log(`Aguardando pagamento... Status atual: ${cobranca.status}`);
        }

      } catch (error) {
        console.log('Erro ao consultar cobrança:', error);
      }
    }

  } catch (error) {
    console.error('Erro ao verificar pagamentos pendentes:', error);
  }
}
  
async function verificarPagamentosPendentesCarteiraEmpresas() {
  try {
    const transacoesPendentes = await CarteiraEmpresas.findAll({ where: { statusPag: 'ESPERANDO PAGAMENTO' } });
    console.log('Transações pendentes:', transacoesPendentes); 
    
    // Iterar sobre as transações pendentes encontradas
    for (const transacao of transacoesPendentes) {
      // Verificar o status do pagamento no Pagarme usando o ID da transação
      const transactionId = transacao.idTransacao;
      const itemPedido = await ItensPedido.findOne({ where: { idPed: transacao.id } }); // Buscar o item do pedido
      let user;

      if (itemPedido.tipo === 'Empresas') {
        // Se o tipo do item for 'Empresas', busca na tabela UsersEmpresas
        user = await UserEmpresas.findOne({ where: { id: transacao.idUserPed } });
      } else {
        // Caso contrário, busca na tabela User
        user = await User.findByPk(transacao.idUserPed);
      }
      const hojeComHifen = new Date().toISOString().split('T')[0];
      console.log('Transaction ID:', transactionId); // Check if transactionId is defined
      try {
       const cobranca = await consultarCobranca(transactionId);
       //console.log('Transaction found:', response); // Check if transaction is defined
       // Verificar se a transação está paga
       if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
         const dadosNfse = {
           payment: transactionId,
            customer: user.customer_asaas_id,
            externalReference:  Math.floor(Math.random() * 999) + 1,
            value: user.saldo,
            effectiveDate: hojeComHifen
          };

          const nfse = await agendarNfsAsaas(dadosNfse);
          const invoice = nfse.id;
          
          const nfseEmitida = await emitirNfs(invoice);
          const externalReference = nfseEmitida.externalReference;
          
          const notaAutorizada = await consultarNf(externalReference);
          console.log('Nota autorizada:', notaAutorizada);
          const nfseUrl = notaAutorizada.pdfUrl;
          
          transacao.nfseUrl = nfseUrl
          transacao.statusPag = 'PAGO'
          transacao.save();
        } else if (cobranca.status === 'OVERDUE') {
          console.log('Pagamento não realizado dentro do prazo.');
        } else {
          console.log(`Aguardando pagamento... Status atual: ${cobranca.status}`);
        }
      } catch (error) {
        // Verificar se o erro é de transação não encontrada
        console.log(error)
      }
    }
  } catch(error) {
    console.error('Erro ao verificar pagamentos pendentes:', error);
  }
}

async function verificarPagamentosPendentesCarteira() {
  try {
    const transacoesPendentes = await Carteira.findAll({ where: { statusPag: 'ESPERANDO PAGAMENTO' } });
    console.log('Transações pendentes:', transacoesPendentes); 
    
    // Iterar sobre as transações pendentes encontradas
    for (const transacao of transacoesPendentes) {
      // Verificar o status do pagamento no Pagarme usando o ID da transação
      const transactionId = transacao.idTransacao;
      const user = await User.findByPk(transacao.userId);
      const hojeComHifen = new Date().toISOString().split('T')[0];
      console.log('Transaction ID:', transactionId); // Check if transactionId is defined
      try {
        const cobranca = await consultarCobranca(transactionId);
       //console.log('Transaction found:', response); // Check if transaction is defined
       // Verificar se a transação está paga
       if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED' || cobranca.status === 'PENDING') {
         const dadosNfse = {
           payment: transactionId,
            customer: user.customer_asaas_id,
            externalReference:  Math.floor(Math.random() * 999) + 1,
            value: user.saldo,
            effectiveDate: hojeComHifen
          };

          const nfse = await agendarNfsAsaas(dadosNfse);
          const invoice = nfse.id;
          
          const nfseEmitida = await emitirNfs(invoice);
          const externalReference = nfseEmitida.externalReference;
          
          const notaAutorizada = await consultarNf(externalReference);
          console.log('Nota autorizada:', notaAutorizada);
          const nfseUrl = notaAutorizada.pdfUrl;
          
          transacao.nfseUrl = nfseUrl
          transacao.statusPag = 'PAGO'
          transacao.save();
        } else if (cobranca.status === 'OVERDUE') {
          console.log('Pagamento não realizado dentro do prazo.');
        } else {
          console.log(`Aguardando pagamento... Status atual: ${cobranca.status}`);
        }
        } catch (error) {
          console.log(error)
        }
      }
    } catch(error) {
      console.error('Erro ao verificar pagamentos pendentes:', error);
    }
}

app.post('/registrarPagamento', async (req, res) => {
  let { userId, valor, metodoPagamento, status, idTransacao, urlTransacao } = req.body;
  console.log("REGISTRANDO NA CARTEIRA", userId, valor, metodoPagamento, status, urlTransacao);
  
  try {
    if (typeof valor === 'string') {
      valor = parseFloat(valor.replace(',', '.'));
    }

    let carteira = await Carteira.findOne({ where: { userId } });

    // Se a carteira não existir, você pode decidir se vai criar ou não
    // if (!carteira) {
    //   carteira = await Carteira.create({ userId, saldo: 0 });
    // }

    const pagamento = await Carteira.create({
      saldo: valor,
      statusPag: status,
      userId,
      idTransacao,
      urlTransacao: urlTransacao
    });

    console.log('Pagamento registrado com sucesso:', { userId, valor, metodoPagamento, status });

    const user = await User.findByPk(userId);
    const nome = user.userCad;
    const telefone = user.telefoneCad;
    let mensagem = `Olá ${nome}! 👋
Recebemos a recarga realizada em sua carteira no valor de R$ ${valor}. 🎉
Muito obrigado pela confiança! 😊
Se precisar de algo, estamos à disposição.
    
Atenciosamente,
IMPRIMEAI`;

    await enviarNotificacaoWhatsapp(telefone, mensagem);

    res.status(200).send('Pagamento registrado com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar o pagamento:', error);
    res.status(500).send('Erro ao registrar o pagamento');
  }
});
  
  // Rota para buscar o saldo do usuário e exibi-lo na página HTML
  // Rota para buscar o saldo do usuário
  app.get('/saldoUsuario', async (req, res) => {
    const { userId } = req.cookies; // Obtenha o userId dos cookies
  
    try {
      // Consulte o banco de dados para obter a soma de todos os depósitos pagos associados ao usuário
      const saldoDepositosPagos = await Carteira.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'PAGO' // Apenas transações com status "PAGO"
        }
      });
  
      // Consulte o banco de dados para obter a soma de todos os depósitos de saída associados ao usuário
      const saldoSaidas = await Carteira.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'SAIDA' // Apenas transações com status "SAÍDA"
        }
      });
  
      // Calcule o saldo final subtraindo o valor total das saídas do valor total dos depósitos pagos
      const saldoFinal = saldoDepositosPagos - saldoSaidas;
  
      // Exiba o saldo final na resposta da API
      res.json({ saldo: saldoFinal });
    } catch (error) {
      
      console.error('Erro ao buscar saldo do usuário:', error);
      res.status(500).send('Erro ao buscar saldo do usuário');
    }
  });
  
  // Rota para descontar o valor da compra do saldo da carteira do usuário
  app.post('/descontarSaldo', async (req, res) => {
    const { userId } = req.cookies; // Obtenha o userId dos cookies
    const { valorPed, metodPag } = req.body;
    console.log(userId);
    console.log(req.body);
    try {
      // Encontre a carteira do usuário pelo userId
      let carteira = await Carteira.findOne({ where: { userId } });
  
      // Verifique se a carteira existe
      if (!carteira) {
        throw new Error('Carteira não encontrada para o usuário');
      }
  
      // Verifique se o saldo é suficiente para a compra
      if (carteira.saldo < valorPed) {
        throw new Error('Saldo insuficiente na carteira');
      }
  
      // Crie uma nova entrada de transação de saída na tabela de Carteiras
      await Carteira.create({
        userId: userId,
        saldo: valorPed, // O valor será negativo para indicar uma transação de saída
        statusPag: 'SAIDA'
      });
  
      // Envie uma resposta de sucesso
      res.status(200).send('Saldo descontado com sucesso da carteira');
    } catch (error) {
      console.error('Erro ao descontar saldo da carteira:', error);
      res.status(500).send('Erro ao descontar saldo da carteira');
    }
  });
  
  // Rota para buscar as transações do usuário com base no ID do usuário
  app.get('/transacoesUsuario/:userId', async (req, res) => {
    try {
      // Obtenha o ID do usuário a partir dos parâmetros da URL
      const userId = req.params.userId;
  
      // Consulte o banco de dados para obter as transações do usuário
      const transacoes = await Carteira.findAll({
        where: { userId: userId }
      });
  
      // Mapeie os dados das transações para um formato adequado (se necessário)
      const transacoesFormatadas = transacoes.map(transacao => ({
        id: transacao.id,
        valor: transacao.saldo,
        tipo: getTipoTransacao(transacao.statusPag) // Determina o tipo de transação com base no status
      }));
  
      // Envie os dados das transações como resposta
      res.json({ transacoes: transacoesFormatadas });
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar transações do usuário' });
    }
  });


  app.post('/registrarPagamento-empresas', async (req, res) => {
    const { userId, valor, metodoPagamento, status, idTransacao } = req.body;
    console.log("REGISTRANDO NA CARTEIRA", userId, valor, metodoPagamento, status)
    try {
      // Encontre a carteira do usuário pelo userId
      let carteira = await CarteiraEmpresas.findOne({ where: { userId } });
  
      // Se a carteira não existir, crie uma nova
      if (!carteira) {
        //carteira = await Carteira.create({ userId, saldo: 0 }); // Saldo inicial 0
      }
  
      // Crie uma entrada na tabela Carteira para registrar o pagamento
      const pagamento = await CarteiraEmpresas.create({
        saldo: valor,
        statusPag: status,
        userId: userId,
        idTransacao: idTransacao
      });
  
      console.log('Pagamento registrado com sucesso:', { userId, valor, metodoPagamento, status });
  
      res.status(200).send('Pagamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar o pagamento:', error);
      res.status(500).send('Erro ao registrar o pagamento');
    }
  });
  
  // Rota para buscar o saldo do usuário e exibi-lo na página HTML
  // Rota para buscar o saldo do usuário
  app.get('/saldoUsuario-empresas', async (req, res) => {
    const { userId } = req.cookies; // Obtenha o userId dos cookies
  
    try {
      // Consulte o banco de dados para obter a soma de todos os depósitos pagos associados ao usuário
      const saldoDepositosPagos = await CarteiraEmpresas.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'PAGO' // Apenas transações com status "PAGO"
        }
      });
  
      // Consulte o banco de dados para obter a soma de todos os depósitos de saída associados ao usuário
      const saldoSaidas = await CarteiraEmpresas.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'SAIDA' // Apenas transações com status "SAÍDA"
        }
      });
  
      // Calcule o saldo final subtraindo o valor total das saídas do valor total dos depósitos pagos
      const saldoFinal = saldoDepositosPagos - saldoSaidas;
  
      // Exiba o saldo final na resposta da API
      res.json({ saldo: saldoFinal });
    } catch (error) {
      console.error('Erro ao buscar saldo do usuário:', error);
      res.status(500).send('Erro ao buscar saldo do usuário');
    }
  });
  
  // Rota para descontar o valor da compra do saldo da carteira do usuário
  app.post('/descontarSaldo-empresas', async (req, res) => {
    const { userId } = req.cookies; // Obtenha o userId dos cookies
    const { valorPed, metodPag } = req.body;
    console.log(userId);
    try {
      // Encontre a carteira do usuário pelo userId
      let carteira = await CarteiraEmpresas.findOne({ where: { userId } });
  
      // Verifique se a carteira existe
      if (!carteira) {
        throw new Error('Carteira não encontrada para o usuário');
      }

      // Consulte o banco de dados para obter a soma de todos os depósitos pagos associados ao usuário
      const saldoDepositosPagos = await CarteiraEmpresas.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'PAGO' // Apenas transações com status "PAGO"
        }
      });
  
      // Consulte o banco de dados para obter a soma de todos os depósitos de saída associados ao usuário
      const saldoSaidas = await CarteiraEmpresas.sum('saldo', {
        where: {
          userId: userId,
          statusPag: 'SAIDA' // Apenas transações com status "SAÍDA"
        }
      });
  
      // Calcule o saldo final subtraindo o valor total das saídas do valor total dos depósitos pagos
      const saldoFinal = saldoDepositosPagos - saldoSaidas;
  
      // Verifique se o saldo é suficiente para a compra
      if (saldoFinal < valorPed) {
        throw new Error('Saldo insuficiente na carteira');
      }
  
      // Crie uma nova entrada de transação de saída na tabela de Carteiras
      await CarteiraEmpresas.create({
        userId: userId,
        saldo: valorPed, // O valor será negativo para indicar uma transação de saída
        statusPag: 'SAIDA'
      });
  
      // Envie uma resposta de sucesso
      res.status(200).send('Saldo descontado com sucesso da carteira');
    } catch (error) {
      console.error('Erro ao descontar saldo da carteira:', error);
      res.status(500).send('Erro ao descontar saldo da carteira');
    }
  });
  
  // Rota para buscar as transações do usuário com base no ID do usuário
  app.get('/transacoesUsuario-empresas/:userId', async (req, res) => {
    try {
      // Obtenha o ID do usuário a partir dos parâmetros da URL
      const userId = req.params.userId;
  
      // Consulte o banco de dados para obter as transações do usuário
      const transacoes = await CarteiraEmpresas.findAll({
        where: { userId: userId }
      });
  
      // Mapeie os dados das transações para um formato adequado (se necessário)
      const transacoesFormatadas = transacoes.map(transacao => ({
        id: transacao.id,
        valor: transacao.saldo,
        tipo: getTipoTransacao(transacao.statusPag) // Determina o tipo de transação com base no status
      }));
  
      // Envie os dados das transações como resposta
      res.json({ transacoes: transacoesFormatadas });
    } catch (error) {
      console.error('Erro ao buscar transações do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar transações do usuário' });
    }
  });
  
  // Função para determinar o tipo de transação com base no status
  function getTipoTransacao(statusPag) {
    if (statusPag === 'SAIDA') {
      return 'Saída';
    } else if (statusPag === 'ESPERANDO PAGAMENTO') {
      return 'Esperando'; // Exibe "ESPERANDO PAGAMENTO" se o status for esse
    } else {
      return 'Entrada';
    }
  }

  async function conectarPagarme(apiKey) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            uri: 'https://api.pagar.me/core/v5/orders',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
                'Content-Type': 'application/json'
            }
        };
  
        request(options, function(error, response, body) {
            if (error) {
                reject(error);
                return;
            }
  
            if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve(true); // Conexão bem-sucedida
            } else {
                resolve(false); // Conexão falhou
            }
        });
    });
  }
  
  // Exemplo de uso:
  const apiKey = 'sk_34a31b18f0db49cd82be2a285152e1b2';
  conectarPagarme(apiKey)
    .then(conexaoBemSucedida => {
        if (conexaoBemSucedida) {
            console.log('Conexão bem-sucedida com o Pagar.me');
        } else {
            console.log('Falha na conexão com o Pagar.me');
        }
    })
    .catch(error => {
        console.error('Erro ao conectar ao Pagar.me:', error);
    });
  
    // Defina a rota para verificar o status da transação do cartão de crédito no Pagarme
  app.get('/verificarStatusTransacao', async (req, res) => {
    try {
        const chargeId = req.query.chargeId; // Obtenha o ID da transação do cliente
        const apiKey = 'sk_KVlgJBsKOTQagkmR'; // Substitua pelo sua chave de API do Pagarme
        
        // Faça uma solicitação GET para a API do Pagarme para obter o status da transação
        const response = await axios.get(`https://api.pagar.me/core/v5/charges/${chargeId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
            }
        });
  
        // Verifique se a solicitação foi bem-sucedida
        if (response.status === 200) {
            const statusTransacao = response.data.status; // Obtenha o status da transação da resposta
            res.json({ status: statusTransacao }); // Envie o status da transação de volta para o cliente
        } else {
            // Se a solicitação não foi bem-sucedida, envie uma mensagem de erro para o cliente
            res.status(500).send('Erro ao verificar o status da transação');
        }
    } catch (error) {
        // Em caso de erro, envie uma mensagem de erro para o cliente
        console.error('Erro ao verificar o status da transação:', error);
        res.status(500).send('Erro ao verificar o status da transação');
    }
  });

  app.get('/pedidos-usuario/:userId', async (req, res) => {
    const userId = req.cookies.userId;
  
    try {
      // Consulte o banco de dados para buscar os pedidos do usuário com base no userId
      const pedidosDoUsuario = await Pedidos.findAll({
        where: {
          idUserPed: userId,
        },
        include: [
          {
            model: ItensPedido,
            where: { tipo: 'Normal' },
            attributes: ['statusPed', 'nomeProd', 'idProduto'], // Inclua apenas a coluna 'statusPed'
          },
          {
            model: Enderecos,
            attributes: ['frete']
          }
        ],
      });
  
      // Renderize a página HTML de pedidos-usuario e passe os pedidos como JSON
      res.json({ pedidos: pedidosDoUsuario });
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar pedidos do usuário', message: error.message });
    }
  });

app.get('/pedidos-usuario-empresa/:userId', async (req, res) => {
  const userId = req.params.userId; // Usando userId diretamente dos parâmetros da URL

  // Verificar se userId está disponível
  if (!userId) {
    return res.status(400).json({ error: 'User ID não encontrado' });
  }

  try {
    // Consulta os pedidos do usuário com tipo "Empresas"
    const pedidosDoUsuario = await Pedidos.findAll({
      where: {
        idUserPed: userId, // Filtro pelo userId
      },
      include: [
        {
          model: ItensPedido, // Carrega os itens do pedido
          where: { tipo: 'Empresas' }, // Filtro para itens do tipo 'Empresas'
          attributes: ['statusPed', 'nomeProd', 'idProduto'],
        },
        {
          model: Enderecos, // Inclui os endereços do pedido
          attributes: ['frete'],
        }
      ],
    });

    // Verificar se foi encontrado algum pedido
    if (pedidosDoUsuario.length === 0) {
      return res.status(404).json({ error: 'Nenhum pedido encontrado para este usuário.' });
    }

    // Retornar os pedidos encontrados
    res.json({ pedidos: pedidosDoUsuario });
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos do usuário', message: error.message });
  }
});
  
  app.get('/imagens/:id', async (req, res) => {
    try {
      const idDoProduto = req.params.id;
  
      // Consulta o banco de dados para obter a URL da imagem do produto pelo ID
      const produto = await Produtos.findByPk(idDoProduto);
  
      if (!produto || !produto.imgProd) {
        // Se o produto não for encontrado ou não houver URL da imagem, envie uma resposta de erro 404
        return res.status(404).send('Imagem não encontrada');
      }
  
      const imgProdUrl = produto.imgProd;
  
      // Envie a URL da imagem como resposta
      res.json({ imgProdUrl });
    } catch (error) {
      console.error('Erro ao buscar URL da imagem do produto:', error);
      res.status(500).send('Erro interno do servidor');
    }
  });

  app.get('/imagens-empresa/:id', async (req, res) => {
    try {
      const idDoProduto = req.params.id;
  
      // Consulta o banco de dados para obter a URL da imagem do produto pelo ID
      const produto = await ProdutosExc.findByPk(idDoProduto);
  
      if (!produto || !produto.imgProd) {
        // Se o produto não for encontrado ou não houver URL da imagem, envie uma resposta de erro 404
        return res.status(404).send('Imagem não encontrada');
      }
  
      const imgProdUrl = produto.imgProd;
  
      // Envie a URL da imagem como resposta
      res.json({ imgProdUrl });
    } catch (error) {
      console.error('Erro ao buscar URL da imagem do produto:', error);
      res.status(500).send('Erro interno do servidor');
    }
  });

  app.get('/detalhes-pedidoUser/:idPedido', async (req, res) => {
    try {
      const idPedido = req.params.idPedido;
  
      // Consulte o banco de dados para buscar os detalhes do pedido com base no idPedido
      const detalhesPedido = await Pedidos.findByPk(idPedido, {
        include: [
          {
            model: ItensPedidos,
            include: [
              {
                model: Produtos,
                attributes: ['imgProd'], // Inclua apenas a coluna imgProd da tabela Produtos
              },
            ],
          },
          { model: Enderecos },
        ],
      });
  
      if (!detalhesPedido) {
        // Se o pedido não for encontrado, retorne um erro 404
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
  
      // Filtrar apenas os endereços associados ao pedido
      const enderecosDoPedido = detalhesPedido.enderecos;
  
      // Filtrar apenas os itens pedidos associados ao pedido
      const itensDoPedido = detalhesPedido.itenspedidos.map((item) => ({
        id: item.id,
        idProduto: item.idProduto,
        nomeProd: item.nomeProd,
        quantidade: item.quantidade,
        valorProd: item.valorProd,
        marca: item.marca,
        modelo: item.modelo,
        acabamento: item.acabamento,
        cor: item.cor,
        enobrecimento: item.enobrecimento,
        formato: item.formato,
        material: item.material,
        linkDownload: item.linkDownload,
        nomeArquivo: item.nomeArquivo,
        tipo: item.tipo,
        arteEmpresas: item.arteEmpresas,
      }));
  
      // Enviar para o cliente os endereços e itens associados ao pedido
      res.json({ enderecos: enderecosDoPedido, itens: itensDoPedido });
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      res
        .status(500)
        .json({ error: 'Erro ao buscar detalhes do pedido', message: error.message });
    }
  });

  app.get('/detalhes-pedidoAprovadoUser/:idPedido', async (req, res) => {
  try {
    const idPedido = req.params.idPedido;

    const pedido = await Pedidos.findByPk(idPedido, {
      include: [
        {
          model: ItensPedido, // cuidado: o nome certo do model deve bater
          include: [
            {
              model: Produtos,
              attributes: [
                'id',
                'nomeProd',
                'valorProd',
                'imgProd'
              ],
            },
          ],
        },
        {
          model: Enderecos
        }
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Mapeando os itens com dados do produto
    const itensDoPedido = pedido.itenspedidos.map(item => ({
      id: item.id,
      idProduto: item.idProduto,
      nomeProd: item.nomeProd || item.produto?.nomeProd,
      quantidade: item.quantidade,
      valorProd: item.valorProd || item.produto?.valorProd,
      marca: item.marca,
      modelo: item.modelo,
      acabamento: item.acabamento,
      cor: item.cor,
      enobrecimento: item.enobrecimento,
      formato: item.formato,
      material: item.material,
      linkDownload: item.linkDownload,
      nomeArquivo: item.nomeArquivo,
      tipo: item.tipo,
      arteEmpresas: item.arteEmpresas,
      imgProd: item.produto?.imgProd || null
    }));

    const enderecosDoPedido = pedido.enderecos;

    // Montando resposta organizada
    res.json({
      pedido: {
        id: pedido.id,
        status: pedido.statusPed,
        total: pedido.total,
        data: pedido.createdAt,
        metodo: pedido.metodPag
      },
      itens: itensDoPedido,
      enderecos: enderecosDoPedido
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({
      error: 'Erro ao buscar detalhes do pedido',
      message: error.message
    });
  }
});

app.post('/processarPagamento-pix', async(req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  const dataAtual = new Date();
  
  // Pega o ano, mês e dia
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos
  
  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  // Calcula o valor total, incluindo o frete corretamente para cada item
  const totalAmount = carrinho.reduce((total, item) => {
    let itemSubtotal;

    if (item.endereco.tipoEntrega === "Único Endereço") {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    } else if (item.endereco.tipoEntrega === "Entrega a Retirar na Loja") {
      itemSubtotal = item.valorUnitario * item.quantidade;
    } else {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    }

    return total + itemSubtotal; // sem conversão para centavos
  }, 0);

  console.log('Total Amount (normal):', totalAmount);

  const dadosCliente = {
    customer: perfilData.customer,
    value: totalAmount,
    dueDate: dataFormatada
  };

  const cobrancaPix = await cobrancaPixAsaas(dadosCliente);
  console.log(cobrancaPix);
  const url = cobrancaPix.invoiceUrl;
  const idCobranca = cobrancaPix.id;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      urlPix: url
    }
  });
  
});

// Rota GET para obter informações sobre uma cobrança específica
app.get('/status-cobranca/:payment_id', async(req, res) => {
  const payment_id = req.params.payment_id;

  const statusCobranca = await consultarCobranca(payment_id);
  console.log(statusCobranca);

  res.json({
    status: statusCobranca.status
  });
});

app.post('/processarPagamento-boleto', async(req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  const dataAtual = new Date();

  // Calcula o valor total, incluindo o frete corretamente para cada item
  const totalAmount = carrinho.reduce((total, item) => {
    let itemSubtotal;

    if (item.endereco.tipoEntrega === "Único Endereço") {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    } else if (item.endereco.tipoEntrega === "Entrega a Retirar na Loja") {
      itemSubtotal = item.valorUnitario * item.quantidade;
    } else {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    }

    return total + itemSubtotal; // sem conversão para centavos
  }, 0);

  console.log('Total Amount (normal):', totalAmount);

  // Pega o ano, mês e dia
  dataAtual.setDate(dataAtual.getDate() + 2); // Adiciona dois dias à data atual

  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos

  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const dadosCliente = {
    customer: perfilData.customer,
    value: totalAmount,
    dueDate: dataFormatada
  };

  const cobrancaBoleto = await cobrancaBoletoAsaas(dadosCliente);
  console.log(cobrancaBoleto);
  const idCobranca = cobrancaBoleto.id;
  const pdfBoleto = cobrancaBoleto.bankSlipUrl;
  const urlTransacao = cobrancaBoleto.invoiceUrl;
  const dueDate = cobrancaBoleto.dueDate;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      pdfBoleto: pdfBoleto,
      urlTransacao: urlTransacao,
      dueDate: dueDate
    }
  });

});

app.post('/processarPagamento-cartao', async(req ,res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  const formData = req.body.formData;
  const dataAtual = new Date();

  // Calcula o valor total, incluindo o frete corretamente para cada item
  const totalAmount = carrinho.reduce((total, item) => {
    let itemSubtotal;

    if (item.endereco.tipoEntrega === "Único Endereço") {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    } else if (item.endereco.tipoEntrega === "Entrega a Retirar na Loja") {
      itemSubtotal = item.valorUnitario * item.quantidade;
    } else {
      itemSubtotal = (item.valorUnitario * item.quantidade) + item.endereco.frete;
    }

    return total + itemSubtotal; // sem conversão para centavos
  }, 0);

  console.log('Total Amount (normal):', totalAmount);

  // Pega o ano, mês e dia
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos

  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const documento = perfilData.numeroDocumento.replace(/[.\-\/]/g, '');
  const cep = perfilData.cepCliente.replace(/[.\-]/g, '');
  const telefone = perfilData.telefoneCad.replace(/[()\s\-]/g, '');

  const dadosCliente = {
    value: totalAmount,
    dueDate: dataFormatada,
    customer: perfilData.customer,
    holder_name: formData.nomeTitular,
    number: formData.numCar,
    expiryMonth: formData.mesExp,
    expiryYear: formData.anoExp,
    ccv: formData.cvvCard,
    name: perfilData.nomeCliente,
    email: perfilData.emailCliente,
    document: perfilData.numeroDocumento.replace(/[.\-\/]/g, ''),
    postalCode: cep,
    addressNumber: perfilData.numeroResidenciaCliente,
    phone: telefone
  };

  const cobrancaCartao = await cobrancaCartaoAsaas(dadosCliente);
  console.log(cobrancaCartao);
  const idCobranca = cobrancaCartao.id;
  const comprovanteCobranca =  cobrancaCartao.invoiceUrl;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      comprovanteCobranca: comprovanteCobranca,
      urlTransacao: comprovanteCobranca
    }
  });
});

app.post('/processarPagamento-pix-carteira', async(req, res) => {
  const perfilData = req.body.perfilData;
  const value = perfilData.totalCompra;
  const dataAtual = new Date();

  // Pega o ano, mês e dia
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos

  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const dadosCliente = {
    customer: perfilData.customer,
    value: value,
    dueDate: dataFormatada
  };

  const cobrancaPix = await cobrancaPixAsaas(dadosCliente);
  console.log(cobrancaPix);
  const url = cobrancaPix.invoiceUrl;
  const idCobranca = cobrancaPix.id;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      urlPix: url
    }
  });
});

app.post('/processarPagamento-boleto-carteira', async(req, res) => {
  const perfilData = req.body.perfilData;
  const value = req.body.valor;
  const dataAtual = new Date();

  // Pega o ano, mês e dia
  dataAtual.setDate(dataAtual.getDate() + 2); // Adiciona dois dias à data atual

  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos

  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const dadosCliente = {
    customer: perfilData.customer,
    value: value,
    dueDate: dataFormatada
  };
  
  const cobrancaBoleto = await cobrancaBoletoAsaas(dadosCliente);
  console.log(cobrancaBoleto);
  const idCobranca = cobrancaBoleto.id;
  const pdfBoleto = cobrancaBoleto.bankSlipUrl;
  const urlTransacao = cobrancaBoleto.invoiceUrl;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      pdfBoleto: pdfBoleto,
      urlTransacao: urlTransacao
    }
  });

});

app.post('/processarPagamento-cartao-carteira', async(req ,res) => {
  const formData = req.body.formData;
  const perfilData = req.body.perfilData;
  const totalCompra = req.body.valor;
  const dataAtual = new Date();
  
  // Pega o ano, mês e dia
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos
  
  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const cpf = perfilData.cpfCliente.replace(/[.\-]/g, '');
  const cep = perfilData.cepCliente.replace(/[.\-]/g, '');
  const telefone = perfilData.telefoneCad.replace(/[()\s\-]/g, '');

  const dadosCliente = {
    value: totalCompra,
    dueDate: dataFormatada,
    customer: perfilData.customer,
    holder_name: formData.nomeTitular,
    number: formData.numCar,
    expiryMonth: formData.mesExp,
    expiryYear: formData.anoExp,
    ccv: formData.cvvCard,
    name: perfilData.nomeCliente,
    email: perfilData.emailCliente,
    cpfCnpj: cpf,
    postalCode: cep,
    addressNumber: perfilData.numeroResidenciaCliente,
    phone: telefone
  };

  const cobrancaCartao = await cobrancaCartaoAsaas(dadosCliente);
  const idCobranca = cobrancaCartao.id;
  const comprovanteCobranca =  cobrancaCartao.invoiceUrl;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      comprovanteCobranca: comprovanteCobranca,
      urlTransacao: comprovanteCobranca
    }
  });

});

app.post('/processarPagamento-cartao-carteira-cnpj', async(req ,res) => {
  const formData = req.body.formData;
  const perfilData = req.body.perfilData;
  const totalCompra = req.body.valor;
  const dataAtual = new Date();
  
  console.log(perfilData)

  // Pega o ano, mês e dia
  const ano = dataAtual.getFullYear();
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mes começa do 0, então somamos 1
  const dia = dataAtual.getDate().toString().padStart(2, '0'); // Garantir que o dia tenha dois dígitos
  
  // Formata a data
  const dataFormatada = `${ano}-${mes}-${dia}`;

  const cnpj = perfilData.cnpjCliente.replace(/[.\-]/g, '');
  const cep = perfilData.cepCliente.replace(/[.\-]/g, '');
  const telefone = perfilData.telefoneCad.replace(/[()\s\-]/g, '');

  const dadosCliente = {
    value: totalCompra,
    dueDate: dataFormatada,
    customer: perfilData.customer,
    holder_name: formData.nomeTitular,
    number: formData.numCar,
    expiryMonth: formData.mesExp,
    expiryYear: formData.anoExp,
    ccv: formData.cvvCard,
    name: perfilData.nomeCliente,
    email: perfilData.emailCliente,
    cpfCnpj: cnpj,
    postalCode: cep,
    addressNumber: perfilData.numeroResidenciaCliente,
    phone: telefone
  };

  const cobrancaCartao = await cobrancaCartaoAsaas(dadosCliente);
  const idCobranca = cobrancaCartao.id;
  const comprovanteCobranca =  cobrancaCartao.invoiceUrl;

  res.json({
    status: 'success',
    message: 'Transação feita com sucesso!',
    data: {
      payment_id: idCobranca,
      comprovanteCobranca: comprovanteCobranca,
      urlTransacao: comprovanteCobranca
    }
  });

});

app.post('/uploadGoogleDrive', upload.single('file'), async (req, res) => {
  const file = req.file;
  const idProduto = req.body.idProduto;

  if (!file || !idProduto) {
    return res.status(400).send('No file or idProduto provided.');
  }

  try {
    const result = await uploadFile(file);
    const pedidoId = req.body.pedidoId;
    // Atualize o produto no banco de dados com o downloadLink
    await atualizarProduto(idProduto, result.webViewLink, pedidoId, result.nomeArquivo);
    // Verifique se todos os produtos do pedido têm linkDownload diferente de "Enviar Arte Depois"
    const todosProdutosEnviados = await verificarTodosProdutosEnviados(pedidoId);

    // Se todos os produtos foram enviados, atualize o status do pedido para "Aguardando"
    if (todosProdutosEnviados) {
      await atualizarStatusPedido(pedidoId, 'Recebido');
    }

    res.json(result);
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function atualizarProduto(idProduto, webViewLink, pedidoId, nomeArquivo) {
  await ItensPedidos.update({ linkDownload: webViewLink, nomeArquivo: nomeArquivo }, { where: { idPed: pedidoId, idProduto: idProduto } });
}
// Função para obter o ID do pedido por ID do produto
async function obterPedidoIdPorIdProduto(idProduto) {
  const itemPedido = await ItensPedidos.findOne({ where: { idProduto: idProduto } });
  if (itemPedido) {
    return itemPedido.idPed;
  }
  throw new Error(`Produto com idProduto ${idProduto} não encontrado.`);
}

async function notificarGrafica(pedidoId) {
  try {
    const pedido = await ItensPedidos.findByPk(pedidoId);
    if (pedido) {
      const graficaId = pedido.getDataValue('graficaAtend');

      if (graficaId) {
        const grafica = await Graficas.findByPk(graficaId);

        if (grafica) {
          console.log(`Notificando a gráfica com ID ${grafica.id} sobre o pedido com ID ${pedidoId}.`);

          // Sua lógica de notificação aqui
          const destinatarioEmail = grafica.emailCad;
          const destinatarioWhatsapp = grafica.telefoneCad;

          // Exemplo de notificação por e-mail
          await enviarEmailNotificacao(destinatarioEmail, 'Novo Pedido a ser Atendido', 'Novo Pedido a ser Atendido - Um pedido acabou de ser liberado, abra seu painel da gráfica.');

          // Exemplo de notificação por WhatsApp
          await enviarNotificacaoWhatsapp(destinatarioWhatsapp, 'Novo Pedido a ser Atendido - Um pedido acabou de ser liberado, abra seu painel da gráfica.');
        } else {
          console.log(`Gráfica com ID ${graficaId} não encontrada.`);
        }
      } else {
        console.log(`Pedido com ID ${pedidoId} não possui gráfica associada.`);
      }
    } else {
      console.log(`Pedido com ID ${pedidoId} não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao notificar a gráfica:', error);
  }
}
// Função para verificar se todos os produtos do pedido foram enviados
async function verificarTodosProdutosEnviados(idPedido) {
  const produtosEnviarArteDepois = await ItensPedidos.findAll({
    where: {
      idPed: idPedido,
      linkDownload: 'Enviar Arte Depois',
    },
  });

  // Se há produtos com "Enviar Arte Depois", não atualize o status do pedido
  if (produtosEnviarArteDepois.length > 0) {
    return false;
  }

  const todosEnviados = await ItensPedidos.findAll({
    where: {
      idPed: idPedido,
      linkDownload: {
        [Sequelize.Op.ne]: 'Enviar Arte Depois',
      },
    },
  });

  // Se todos os produtos foram enviados, atualize o status do pedido para 'Aguardando'
  if (todosEnviados.length > 0) {
    await atualizarStatusPedido(idPedido, 'Recebido');
    console.log('Notificando a Gráfica!')
    await notificarGrafica(idPedido);  // Adiciona a notificação para a gráfica
    return true;
  }

  return false;
}

// Função para atualizar o status do pedido
async function atualizarStatusPedido(pedidoId, novoStatus) {
  await Pedidos.update({ statusPed: novoStatus }, { where: { id: pedidoId } });
  await ItensPedidos.update({ statusPed: novoStatus }, { where: { idPed: pedidoId } });
}

module.exports = app;