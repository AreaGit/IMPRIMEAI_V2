const express = require('express');
const app = express();
const Produtos = require('../models/Produtos');
const Graficas = require('../models/Graficas');
const User = require('../models/User');
const UserEmpresas = require('../models/Users-Empresas');
const Carteira = require('../models/Carteira');
const VariacoesProduto = require('../models/VariacoesProduto');
const Pedidos = require('../models/Pedidos');
const ItensPedido = require('../models/ItensPedido');
const Enderecos = require('../models/Enderecos');
const Entregas = require('../models/Entregas');
const Saques = require('../models/Saques');
const {Op} = require('sequelize');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const axios = require('axios');
const ultramsg = require('ultramsg-whatsapp-api');
const instance_id = "instance93146";
const ultramsg_token = "5oc4vmkit6fcyxym";
const api = new ultramsg(instance_id, ultramsg_token);
const pagarme = require('pagarme');
const pagarmeKeyProd = "sk_e74e3fe1ccbe4ae080f70d85d94e2c68";
const pagarmeKeyTest = "sk_test_05ddc95c6ce442a796c7ebbe2376185d";
const qr = require('qrcode');
const cron = require('node-cron');
const request = require('request');
const nodemailer = require('nodemailer');
const rp = require('request-promise');
const Sequelize = require('sequelize');
const fs = require('fs');
const ItensPedidos = require('../models/ItensPedido');
const ProdutosExc = require('../models/ProdutosExc');
const { Console } = require('console');
const apiKeyBingMaps = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
const { PDFDocument, StandardFonts } = require('pdf-lib');
const {google} = require('googleapis');
const GOOGLE_API_FOLDER_ID = '1F7sQzOnnbqn0EnUeT4kWrNOzsVFP-bG1';
const stream = require('stream');
const path = require('path');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'seuSegredoDeSessao', // Substitua com um segredo seguro
  resave: false,
  saveUninitialized: true
}));
const { client, sendMessage, sendMedia } = require('./api/whatsapp-web');

// Use o cliente conforme necessário

async function enviarNotificacaoWhatsapp(destinatario, corpo) {
  return await sendMessage(destinatario, corpo);
}

async function enviarNotificacaoWhatsappComMidia(destinatario, caminhosMidia, legenda) {
  try {
    if (!Array.isArray(caminhosMidia) || caminhosMidia.length === 0) {
      throw new Error('Nenhum caminho de mídia fornecido para envio.');
    }

    // Chama a função sendMedia com o número do destinatário, os caminhos das mídias e a legenda
    const response = await sendMedia(destinatario, caminhosMidia, legenda);
    console.log(`Mídia(s) enviada(s) com sucesso para o número ${destinatario}:`, response);
    return response;
  } catch (error) {
    console.error(`Erro ao enviar mídia(s) para o número ${destinatario}:`, error);
    throw error;
  }
}

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
async function getCoordinatesFromAddress(addressInfo, apiKey = '5a60ea0d353449a7b80f2a203218387e') {
  const { endereco, cep, cidade, estado } = addressInfo;
  const formattedAddress = `${endereco}, ${cep}, ${cidade}, ${estado}`;
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(formattedAddress)}&lang=pt&apiKey=${'5a60ea0d353449a7b80f2a203218387e'}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.features.length > 0) {
      const { lat, lon } = response.data.features[0].properties;
      return { latitude: lat, longitude: lon };
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
  
app.get('/pedidos-cadastrados', async (req, res) => {
  try {
    console.log('🔍 Iniciando rota /pedidos-cadastrados');

    const graficaId = req.cookies.graficaId;
    if (!graficaId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const grafica = await Graficas.findByPk(graficaId);
    if (!grafica) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Buscar itens dos pedidos
    const itens = await ItensPedido.findAll({
      where: {
        statusPed: { [Op.in]: ['Recebido', 'Em Produção', 'Finalizado/Enviado para Transporte', 'Entregue'] },
        statusPag: { [Op.in]: ['Pago', 'Aguardando'] }
      },
      raw: true
    });

    if (!itens.length) {
      return res.json({ pedidos: [] });
    }

    // Agrupar por idPed
    const pedidosAgrupados = itens.reduce((acc, item) => {
      if (!acc[item.idPed]) {
        acc[item.idPed] = {
          idPed: item.idPed,
          statusPed: item.statusPed,
          createdAt: item.createdAt,
          produtos: []
        };
      }

      acc[item.idPed].produtos.push({
        idProduto: item.idProduto,
        nomeProd: item.nomeProd,
        quantidade: item.quantidade
      });

      return acc;
    }, {});

    const resultado = Object.values(pedidosAgrupados);

    return res.json({ pedidos: resultado });

  } catch (error) {
    console.error('❌ Erro ao buscar pedidos cadastrados:', error);
    return res.status(500).json({ message: 'Erro ao buscar pedidos cadastrados', error: error.message });
  }
});

app.get('/pedido-detalhes', async (req, res) => {
  try {
    console.log('🔍 Iniciando rota /pedido-detalhes');

    const graficaId = req.cookies.graficaId;
    console.log('🧾 ID da gráfica recebido:', graficaId);

    if (!graficaId) {
      console.warn('⚠️ Usuário não autenticado. Cookie graficaId não encontrado.');
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const grafica = await Graficas.findByPk(graficaId);
    const loja = grafica.userCad;
    if (!grafica) {
      console.warn('⚠️ Gráfica não encontrada no banco de dados.');
      return res.status(404).json({ message: "Gráfica não encontrada" });
    }
    console.log('✅ Gráfica autenticada:', grafica.nomeFantasia || grafica.id);

    const pedidoId = req.query.id;
    console.log(`🔎 ID do Pedido recebido: ${pedidoId}`);
    
    if (!pedidoId) {
      return res.status(400).json({ message: "ID do pedido não fornecido" });
    }

    // Usando findOne para buscar o pedido pelo idPed
    const pedido = await ItensPedido.findOne({ where: { idPed: pedidoId } });
    if (!pedido) {
      console.error(`❌ Pedido com ID ${pedidoId} não encontrado.`);
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    console.log(`📦 Pedido encontrado: ${pedido.id}, Produto: ${pedido.nomeProd}`);

    // Buscar os produtos associados a esse pedido
    const produtosPedido = await ItensPedido.findAll({
      where: {
        idPed: pedido.idPed,   // Usando idPed diretamente
      }
    });

    const enderecosPedido = await Enderecos.findAll({
      where: {
        idPed: pedido.idPed
      }
    });

    let nomeCliente = "Não informado";
    if (pedido.tipo === "Empresas") {
      const user = await UserEmpresas.findByPk(pedido.idUserPed);
      if (user) {
        nomeCliente = `${user.userCad}`;
      }
    } else if (pedido.tipo === "Normal") {
      const user = await User.findByPk(pedido.idUserPed);
      if (user) {
        nomeCliente = user.userCad; // ou user.nomeCompleto, dependendo do modelo
      }
    }

    console.log(`🧾 Produtos encontrados para o pedido: ${produtosPedido.length}`);

    if (produtosPedido.length > 0) {
      return res.json({ pedido, produtos: produtosPedido, enderecos: enderecosPedido, nomeCliente, loja });
    } else {
      console.log('🔕 Nenhum produto encontrado para este pedido.');
      return res.json({ message: 'Nenhum produto encontrado para este pedido.' });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar pedido detalhes:', error);
    return res.status(500).json({ message: 'Erro ao buscar pedido detalhes', error: error.message });
  }
});

  app.get('/imagem-produto/:id', async (req, res) => {
    try {
      const idProduto = req.params.id;
      
      // Busca o produto no banco de dados pelo ID
      const produto = await Produtos.findByPk(idProduto);
  
      if (!produto || !produto.imgProd) {
        // Se o produto ou a imagem não existir, envie uma imagem padrão ou retorne um erro
        return res.status(404).sendFile('caminho/para/imagem_padrao.jpg', { root: __dirname });
      }
  
      // Converte o BLOB para uma URL de imagem e envia como resposta
      const imagemBuffer = Buffer.from(produto.imgProd, 'binary');
      res.set('Content-Type', 'image/jpeg'); // Altere conforme o tipo de imagem que você está armazenando
      res.send(imagemBuffer);
    } catch (error) {
      console.error('Erro ao buscar imagem do produto:', error);
      res.status(500).send('Erro ao buscar imagem do produto');
    }
  });

// ==========================
// Detalhes do pedido
// ==========================
app.get('/detalhes-pedido/:idPedido/:idProduto', async (req, res) => {
  try {
    const { idPedido, idProduto } = req.params;

    // Buscar pedido com itens e endereços
    const pedido = await Pedidos.findByPk(idPedido, {
      include: [
        {
          model: ItensPedido,
          where: { idPed: idPedido },
          include: [
            {
              model: Produtos,
              attributes: ['id', 'nomeProd', 'descProd', 'valorProd', 'categProd', 'raioProd', 'imgProd'],
            },
          ],
        },
        {
          model: Enderecos,
          where: { idPed: idPedido },
          required: false, // Permite pedidos sem endereços
        },
      ],
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Buscar usuário
    const { idUserPed } = pedido;
    let usuario;
    const tipo = pedido.itenspedidos[0].tipo;
    if (tipo === "Empresas") {
      usuario = await UserEmpresas.findByPk(idUserPed);
    } else {
      usuario = await User.findByPk(idUserPed);
    }

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ pedido, usuario });
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
  }
});

// ==========================
// Atualizar status do pedido
// ==========================
app.post('/atualizar-status-pedido', async (req, res) => {
  try {
    const { pedidoId, novoStatus, tipoPed } = req.body;
    const graficaId = req.cookies.graficaId;

    // Buscar pedido e endereço
    const pedido = await Pedidos.findByPk(pedidoId, { include: [ItensPedido, Enderecos] });
    if (!pedido) return res.json({ success: false, message: 'Pedido não encontrado' });

    const enderecos = pedido.enderecos;
    const itensPedido = pedido.itenspedidos;

    // Atualiza endereço se for "Retirar na Loja"
    if (enderecos.length > 0 && enderecos[0].tipoEntrega === "Entrega a Retirar na Loja") {
      const grafica = await Graficas.findByPk(graficaId);
      if (grafica) {
        for (const endereco of enderecos) {
          endereco.rua = grafica.enderecoCad;
          endereco.cidade = grafica.cidadeCad;
          endereco.estado = grafica.estadoCad;
          endereco.cep = grafica.cepCad;
          endereco.tipoEntrega = 'Entrega a Retirar na Loja';
          await endereco.save();
        }
      }
    }

    // Atualiza status dos itens
    for (const item of itensPedido) {
      item.statusPed = novoStatus;
      item.graficaAtend = graficaId;
      await item.save();
    }

    // Buscar usuário
    const userId = itensPedido[0].idUserPed;
    let user;
    if (itensPedido[0].tipo === "Empresas") {
      user = await UserEmpresas.findByPk(userId);
    } else {
      user = await User.findByPk(userId);
    }

    // Enviar notificação WhatsApp
    if(novoStatus === "Em produção") {
        //mensagem whatsapp
        const corpoMensagem = `Olá, ${user.userCad}! 👋

Que alegria ter você com a gente!
Seu pedido já está em produção e nossa equipe está cuidando de cada detalhe para que o resultado supere suas expectativas. 🖨️

Em breve, você receberá novas atualizações sobre o andamento e a previsão de entrega.

Obrigada por escolher a ImprimeAí — é um orgulho ter você como cliente! 😉

Pri
✨ Tá com pressa? ImprimeAí!`;
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
        console.log("Mensagem enviada Com Sucesso!")
      }else if(novoStatus === "Finalizado/Enviado para Transporte") {
        //mensagem whatsapp
        const corpoMensagem = `Olá, ${user.userCad}! 👋

Boas notícias! 🎉
Seu pedido foi finalizado com sucesso e está pronto para seguir para o transporte.
Nossa equipe cuidou de cada detalhe para que ele chegue perfeito até você. 📦

Em breve, você receberá informações sobre a conclusão da entrega.

Obrigado por escolher a ImprimeAí — é um orgulho ter você como cliente! 😉

Pri
✨ Tá com pressa? ImprimeAí!`;
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
        console.log("Mensagem enviada Com Sucesso!")
      }else {
        console.log("Não foi possível encontrar o pedido!")
      }

      if (novoStatus === "Entregue") {
        const valorTotalPedido = pedido.valorPed;
        const valorAdm = valorTotalPedido * 0.20;
        const valorGrafica = valorTotalPedido * 0.80;
      
        const createdAt = new Date();
        const calcularDataElegibilidade = (createdAt) => {
          const date = new Date(createdAt);
          const day = date.getDate();
          const month = date.getMonth();
          const year = date.getFullYear();
          
          let elegibilityDate;
      
          if (day <= 15) {
            elegibilityDate = new Date(year, month + 1, 1);
          } else {
            elegibilityDate = new Date(year, month + 1, 15);
          }
      
          return elegibilityDate;
        };
      
        const dataElegibilidade = calcularDataElegibilidade(createdAt);
      
        // Criar registro na tabela de saques
        await Saques.create({
          idPed: pedidoId,
          idGrafica: graficaId,
          valorGrafica: valorGrafica.toFixed(2), // Convertendo para formato monetário
          valorAdm: valorAdm.toFixed(2), // Convertendo para formato monetário
          dataElegibilidade: dataElegibilidade, // Adicionando a data de elegibilidade
          createdAt: createdAt
        });
      
        pedido.graficaFin = graficaId;
        await pedido.save();
      }      

    res.json({ success: true, graficaAtend: graficaId });
  } catch (error) {
    console.error('Erro ao atualizar o status do pedido:', error);
    res.json({ success: false, message: 'Erro ao atualizar o status do pedido' });
  }
});

// ==========================
// Cancelar pedido
// ==========================
app.post('/cancelar-pedido/:idPedido/:idGrafica', async (req, res) => {
  try {
    const graficaId = req.params.idGrafica;
    const idPedido = req.body.idPedido;

    const itensPedido = await ItensPedido.findAll({ where: { idPed: idPedido } });
    if (!itensPedido || itensPedido.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    for (const item of itensPedido) {
      item.graficaCancl = graficaId;
      await item.save();
    }

    res.json({ success: true, message: `Pedido ${idPedido} cancelado com sucesso` });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro ao cancelar pedido', message: error.message });
  }
});

// ==========================
// Atualizar endereço de entrega
// ==========================
app.post('/atualizar-endereco-entrega', async (req, res) => {
  const idPedido = req.body.pedidoId;
  const idGrafica = req.cookies.graficaId;

  try {
    const pedido = await Pedidos.findByPk(idPedido);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    const enderecosPedido = await Enderecos.findAll({ where: { idPed: idPedido } });
    if (!enderecosPedido || enderecosPedido.length === 0) {
      return res.status(404).json({ error: 'Endereços do pedido não encontrados' });
    }

    const grafica = await Graficas.findByPk(idGrafica);
    if (!grafica) return res.status(404).json({ error: 'Gráfica não encontrada' });

    for (const endereco of enderecosPedido) {
      if (endereco.tipoEntrega === 'Entrega a Retirar na Loja') {
        endereco.rua = grafica.enderecoCad;
        endereco.cidade = grafica.cidadeCad;
        endereco.estado = grafica.estadoCad;
        endereco.cep = grafica.cepCad;
        endereco.tipoEntrega = 'Entrega a Retirar na Loja';
        await endereco.save();
      }
    }

    res.json({ success: true, message: 'Endereços de entrega atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar o endereço de entrega:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
  app.post('/gerarProtocoloEntrega', async(req, res) => {
    const enderecoData = req.body;  // Dados recebidos no corpo da requisição
    
    console.log('Dados recebidos para gerar protocolo:', enderecoData);
  
    // Caminho do arquivo
    const pdfPath = path.resolve(__dirname, '../arquivos/PROTOCOLO DE ENTREGA - IMPRIMEAI.pdf');
    
    // Ler o arquivo PDF como bytes
    const pdfBytes = fs.readFileSync(pdfPath);

    // Carregar o PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Selecionar a página onde será feita a edição
    const page = pdfDoc.getPage(0);

    const MAX_WIDTH = 390; // Defina o limite máximo da largura (em pontos) para a linha de texto
    const lineHeight = 14; // Defina a altura da linha, ou seja, o espaço entre as linhas
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
    // Função para desenhar o texto com quebras de linha
    const drawTextWithLineBreaks = (page, text, x, y, size) => {
      const textWidth = font.widthOfTextAtSize(text, size);
  
      if (textWidth > MAX_WIDTH) {
        const words = text.split(' ');
        let currentLine = '';
        let currentY = y;
  
        words.forEach(word => {
          const lineWidth = font.widthOfTextAtSize(currentLine + word, size);
  
          if (lineWidth < MAX_WIDTH) {
            // Se o texto atual não ultrapassar o limite, continue a linha
            currentLine += word + ' ';
          } else {
            // Caso contrário, desenhe a linha atual e reinicie com a palavra
            page.drawText(currentLine.trim(), { x, y: currentY, size });
            currentLine = word + ' ';
            currentY -= lineHeight;
          }
        });
  
        // Desenhe a última linha
        page.drawText(currentLine.trim(), { x, y: currentY, size });
      } else {
        // Se não precisar quebrar, desenha o texto simples
        page.drawText(text, { x, y, size });
      }
    };

    // Ajustar texto para as posições corretas dentro das caixas
    page.drawText(`${enderecoData.id}`, { x: 134, y: 638, size: 12 }); // ID
    page.drawText(`${enderecoData.nomeGrafica}`, { x: 330, y: 638, size: 12 }); // LOJA
    page.drawText(enderecoData.nomeEmpresa = enderecoData.nomeEmpresa === undefined ? `${enderecoData.cliente}` : `${enderecoData.nomeEmpresa} - ${enderecoData.cliente}`, { x: 134, y: 610, size: 12 }); // CLIENTE
    page.drawText(`${enderecoData.endereco}`, { x: 134, y: 580, size: 12 }); // ENDEREÇO
    page.drawText(`${enderecoData.cidade}`, { x: 134, y: 550, size: 9 }); // CIDADE
    page.drawText(`${enderecoData.estado}`, { x: 322, y: 550, size: 12 }); // UF
    page.drawText(enderecoData.nomeGerente = enderecoData.nomeGerente === undefined ? `${enderecoData.responsavel}` : `${enderecoData.nomeGerente}`, { x: 440, y: 550, size: 9 }); // RESPONSÁVEL PELO RECEBIMENTO
    page.drawText(`${enderecoData.quantidade}`, { x: 80, y: 360, size: 12 }); // QUANTIDADE
    page.drawText(`${enderecoData.item}`, { x: 134, y: 360, size: 12 }); // NOME DO ITEM
    // Verificar e desenhar as observações, com quebra de linha se necessário
    if (enderecoData.observacoes) {
      drawTextWithLineBreaks(page, `${enderecoData.observacoes}`, 90, 490, 9); // OBSERVAÇÕES DA ENTREGA
    } else {
      page.drawText(`Não há observações`, { x: 134, y: 490, size: 12 }); // OBSERVAÇÕES DA ENTREGA
    }

    // Salvar o PDF editado
    const pdfBytesEdited = await pdfDoc.save();
    //fs.writeFileSync(`./routes/PROTOCOLO DE ENTREGA ${enderecoData.id}.pdf`, pdfBytesEdited);
    const result = await uploadFile(pdfBytesEdited, `PROTOCOLO DE ENTREGA PEDIDO ${enderecoData.id}`);

    console.log('PDF editado com sucesso!');
    res.json({ success: true, message: 'Protocolo gerado com sucesso!', protocolo: result });
  });
  async function uploadFile(file, name) {
    console.log('File Object:', file);
  
    const nomeArquivo = name;
    const fileMetaData = {
      'name': nomeArquivo, // Nome do arquivo
      'parents': [GOOGLE_API_FOLDER_ID], // ID da pasta no Google Drive
    };
  
    // Certifique-se de que file.buffer seja um Buffer
    const buffer = Buffer.from(file.buffer); // Converter ArrayBuffer para Buffer
  
    // Criar o stream legível a partir do Buffer
    const readableStream = stream.Readable.from(buffer); // Usar Readable.from para transformar o Buffer em um stream
  
    // Corpo da requisição para upload
    const media = {
      mimeType: file.mimetype,
      body: readableStream, // Passar o stream legível aqui
      length: file.size,
    };
  
    const maxRetries = 3;
    let retryCount = 0;
  
    // Tentativas de upload com retry
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
          fields: 'id,webViewLink', // Retorna o ID e o link para visualizar no Drive
          timeout: 10000, // Timeout de 10 segundos para a requisição
        });
  
        // Extraindo os dados da resposta
        const fileId = response.data.id;
        const webViewLink = response.data.webViewLink;
  
        const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
        return { fileId, webViewLink, downloadLink, nomeArquivo };
        
      } catch (err) {
        console.error(`Attempt ${retryCount + 1} failed:`, err.message);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error('Max retry attempts reached. Upload failed.');
          throw new Error('Max retry attempts reached. Upload failed.');
        }
      }
    }
  }

  async function uploadFileEntrega(file, name) {
  const nomeArquivo = name;
  const fileMetaData = {
    'name': nomeArquivo, // Nome do arquivo
    'parents': [GOOGLE_API_FOLDER_ID], // ID da pasta no Google Drive
  };

  // Certifique-se de que file.buffer seja um Buffer
  const buffer = Buffer.from(file.buffer); // Converter ArrayBuffer para Buffer

  // Criar o stream legível a partir do Buffer
  const readableStream = stream.Readable.from(buffer); // Usar Readable.from para transformar o Buffer em um stream

  // Corpo da requisição para upload
  const media = {
    mimeType: file.mimetype,
    body: readableStream, // Passar o stream legível aqui
    length: file.size,
  };

  try {
    const auth = await new google.auth.GoogleAuth({
      keyFile: './googledrive.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const driveService = google.drive({ version: 'v3', auth });

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id,webViewLink', // Retorna o ID e o link para visualizar no Drive
      timeout: 10000, // Timeout de 10 segundos para a requisição
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;

    // Criando o link de download
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return { fileId, webViewLink, downloadLink };
    
  } catch (err) {
    console.error('Erro ao fazer upload para o Google Drive:', err.message);
    throw err;
  }
}

// Rota para receber os dados do formulário de entrega
app.post('/dadosEntrega', upload.fields([
  { name: 'fotoEnt', maxCount: 1 },
  { name: 'produtoEnt', maxCount: 1 },
  { name: 'protocoloEnt', maxCount: 1 }
]), async (req, res) => {
  const recEnt = req.body.recEnt;
  const horEnt = req.body.horEnt;
  const pedidoId = req.body.pedidoId;
  const tipo = req.body.tipo;
  const obsEnt = req.body.obsEnt;

  const fotoEnt = req.files['fotoEnt']?.[0];
  const produtoEnt = req.files['produtoEnt']?.[0];
  const protocoloEnt = req.files['protocoloEnt']?.[0];

  try {
    // Salvar dados no banco de dados
    await Entregas.create({
      idPed: pedidoId,
      destinatario: recEnt,
      horario: horEnt,
      foto: fotoEnt.buffer,
      produto: produtoEnt?.buffer,
      protocolo: protocoloEnt?.buffer,
      observacoes: obsEnt,
    });

    const ped = await Pedidos.findByPk(pedidoId);
    const userId = ped.idUserPed;
    let user;

    if (tipo === "Empresas") {
      user = await UserEmpresas.findByPk(userId);
    } else {
      user = await User.findByPk(userId);
    }
    
    const corpoObs = `Observações do pedido ${obsEnt}`;

    // Fazer o upload dos arquivos para o Google Drive
    const arquivosRecebidos = [
      { arquivo: fotoEnt, prefixo: 'foto' },
      { arquivo: produtoEnt, prefixo: 'produto' },
      { arquivo: protocoloEnt, prefixo: 'protocolo' }
    ];

    const linksArquivos = [];

    // Upload de cada arquivo e salvar os links
    for (const item of arquivosRecebidos) {
      if (item.arquivo) {
        const resultado = await uploadFileEntrega(item.arquivo, item.prefixo + Date.now());
        linksArquivos.push(resultado.downloadLink);
      }
    }

    // Substituir "LINK" pelo link real dos arquivos
    const linksNaMensagem = linksArquivos.map((link, index) => `🔗 Link do arquivo ${index + 1}: ${link}`).join("\n");

    const corpoMensagem = `Olá, ${user.userCad}! 👋

Boas notícias! 🎉
Seu pedido foi entregue com sucesso para (${user.userCad}, ${recEnt} e ${horEnt}) 📦

Para sua segurança e comodidade, você pode acessar as evidências da entrega e fotos do protocolo através do link abaixo:
🔗 Ver evidências e fotos do pedido

${linksNaMensagem}

Esperamos que você esteja satisfeito com nossos produtos e serviços.
Se precisar de qualquer coisa, não hesite em nos contatar.

Obrigada por escolher a ImprimeAí — é sempre um prazer atendê-lo! 😉

Pri
✨ Tá com pressa? ImprimeAí!`;


    try {
      // Enviar mensagens pelo WhatsApp
      if (obsEnt.length) {
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoObs);
      }
      await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
    
      console.log('Mensagens enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
    }

    res.send('Dados de entrega recebidos com sucesso!');
  } catch (error) {
    console.error('Erro ao processar entrega:', error);
    res.status(500).send('Erro ao processar entrega.');
  }
});


app.get("/perfilGrafica/dados", async (req, res) => {
  try {
    // Verifique se o cookie "userId" está definido
    const userId = req.cookies.graficaId

    if (!userId) {
      return res.status(401).json({ message: "Gráfica não autenticada" });
    }

    // Use o modelo Grafica para buscar o usuário no banco de dados pelo ID
    const user = await Graficas.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Gráfica não encontrada" });
    }

    // Retorna os dados do usuário como JSON
    res.json({
      userCad: user.userCad,
      userId: userId,
      user
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

  module.exports = app;