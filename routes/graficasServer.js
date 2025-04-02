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
const { Console } = require('console');
const apiKeyBingMaps = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
const { PDFDocument } = require('pdf-lib');
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
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto para uso no graficaServer.js');
});

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
  async function getCoordinatesFromAddress(addressInfo, apiKey) {
    const { endereco, cep, cidade, estado } = addressInfo;
    const formattedAddress = `${endereco}, ${cep}, ${cidade}, ${estado}`;
    const geocodingUrl = `https://dev.virtualearth.net/REST/v1/Locations/${encodeURIComponent(formattedAddress)}?o=json&key=${apiKey}`;
  
    try {
      const response = await fetch(geocodingUrl);
  
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
        const coordinates = data.resourceSets[0].resources[0].point.coordinates;
        return { latitude: coordinates[0], longitude: coordinates[1] };
      } else {
        console.error('Nenhum resultado de geocodificação encontrado para o endereço:', formattedAddress);
        return { latitude: null, longitude: null };
      }
    } catch (error) {
      console.error('Erro ao obter coordenadas de geocodificação:', error.message);
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
      const graficaId = req.cookies.graficaId;
      if (!graficaId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
  
      const grafica = await Graficas.findByPk(graficaId);
  
      if (!grafica) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
  
      const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
  
      const pedidosCadastrados = await ItensPedido.findAll({
        where: {
          statusPed: ['Aguardando', 'Pedido Aceito Pela Gráfica', 'Finalizado', 'Pedido Enviado pela Gráfica', 'Pedido Entregue pela Gráfica'],
          statusPag: ['Pago', 'Aguardando']
        },
      });
  
      const graficas = await Graficas.findAll();
  
      const pedidosProximos = await Promise.all(pedidosCadastrados.map(async (pedido) => {
        const enderecosPedido = await Enderecos.findAll({
          where: { id: pedido.id },
        });
  
        const pedidosFiltrados = await Promise.all(enderecosPedido.map(async (enderecoPedido) => {
          console.log(`Verificando pedido com o Id: ${pedido.id} e Endereço Id: ${enderecoPedido.id}`);
  
          const enderecoEntregaInfo = {
            endereco: enderecoPedido.rua,
            cep: enderecoPedido.cep,
            cidade: enderecoPedido.cidade,
            estado: enderecoPedido.estado,
          };
  
          const coordinatesEnd = await getCoordinatesFromAddress(enderecoEntregaInfo, apiKey);
  
          if (coordinatesEnd.latitude && coordinatesEnd.longitude) {
            console.log(`Latitude do Endereço de Entrega:`, coordinatesEnd.latitude);
            console.log(`Longitude do Endereço de Entrega:`, coordinatesEnd.longitude);
  
            let distanciaMinima = Infinity;
            let graficaMaisProxima = null;
  
            // Usando Promise.all para calcular a distância das gráficas em paralelo
            const graficasProximas = await Promise.all(graficas.map(async (graficaAtual) => {
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
            }));
  
            await Promise.all(graficasProximas); // Aguarda todas as promessas de distância serem resolvidas
  
            if (distanciaMinima <= enderecoPedido.raio && graficaMaisProxima) {
              let produtosGrafica;
  
              if (typeof graficaMaisProxima.produtos === 'string') {
                const fixedJsonString = graficaMaisProxima.produtos.replace(/'/g, '"');
                produtosGrafica = JSON.parse(fixedJsonString);
              } else {
                produtosGrafica = graficaMaisProxima.produtos;
              }
  
              console.log(produtosGrafica);
              console.log(pedido.nomeProd);
  
              if (produtosGrafica[pedido.nomeProd]) {
                const pedidoAssociado = {
                  ...pedido.dataValues,
                  enderecoId: enderecoPedido.id,
                  graficaId: graficaMaisProxima.id,
                };
  
                return pedidoAssociado;
              }
            }
          }
          return null; // Retorna null se não for encontrado um pedido válido
        }));
  
        return pedidosFiltrados.filter(pedido => pedido !== null);
      }));
  
      const todosPedidos = pedidosProximos.flat(); // Achata o array de pedidos
  
      if (todosPedidos.length > 0) {
        console.log("TODOS OS PEDIDOS", todosPedidos);
  
        const pedidosParaGrafica = todosPedidos.filter((pedido) => {
          return pedido.graficaId === grafica.id;
        });
  
        if (pedidosParaGrafica.length > 0) {
          console.log(`Pedidos próximos à gráfica com ID ${grafica.id}:`, pedidosParaGrafica);
          res.json({ pedidos: pedidosParaGrafica });
        } else {
          console.log('Nenhum pedido próximo à gráfica atual encontrado.');
          res.json({ message: 'Nenhum pedido próximo à gráfica atual encontrado.' });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos cadastrados:', error);
      res.status(500).json({ message: 'Erro ao buscar pedidos cadastrados', error: error.message });
    }
  });  

  app.get('/detalhes-pedido/:idPedido/:idProduto', async (req, res) => {
    try {
      const { idPedido, idProduto } = req.params;
  
      // Buscar detalhes do pedido
      const pedido = await Pedidos.findByPk(idPedido, {
        include: [
          {
            model: ItensPedido,
            where: { idPed: idPedido, idProduto: idProduto },
            include: [
              {
                model: Produtos,
                attributes: ['id', 'nomeProd', 'descProd', 'valorProd', 'categProd', 'raioProd', 'imgProd'],
              },
            ],
          },
          {
            model: Enderecos,
            where: { idPed: idPedido, idProduto: idProduto },
            include: [
              {
                model: Produtos,
                attributes: ['id'], // Adicione outros atributos do Produto conforme necessário
              },
            ],
            distinct: true, // Garante endereços distintos
          },
          // ... outras associações necessárias
        ],
      });
  
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
  
      // Agora que temos o pedido, buscamos o usuário correspondente
      const { idUserPed } = pedido;
      let usuario;
      if(pedido.itenspedidos[0].tipo == "Empresas") {
        usuario = await UserEmpresas.findByPk(idUserPed);
      } else {
        usuario = await User.findByPk(idUserPed);
      }
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
  
      // Respondendo com os detalhes do pedido e informações do usuário
      res.json({ pedido, usuario });
  
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
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

  app.post('/atualizar-status-pedido', async (req, res) => {
    try {
      const { pedidoId, novoStatus, tipoPed } = req.body;

      // Atualize o status do pedido na tabela Pedidos
      const graficaId = req.cookies.graficaId; // Assuming the graphics company's ID is stored in a cookie
      console.log(graficaId)
      const pedido = await ItensPedido.findOne( { where: {idPed: pedidoId} } );
      const tablePedidos = await Pedidos.findOne({ where: {id: pedidoId} });
      const tableEnderecos = await Enderecos.findOne({ where: {idPed: pedidoId} });
      if (!pedido) {
        return res.json({ success: false, message: 'Pedido não encontrado.' });
      }
      // Procurar o usuário pelo idUser
      const ped = await ItensPedidos.findOne( { where: {idPed: pedidoId} } );
      const userId = ped.idUserPed; // Ou qualquer forma que você tenha o id do usuário
      let user;
      if(ped.tipo == "Empresas") {
        user = await UserEmpresas.findByPk(userId);
      } else {
        user = await User.findByPk(userId)
      }

      // Verifica se o tipo de entrega é "Entrega a Retirar na Loja"
    if (tableEnderecos.tipoEntrega === "Entrega a Retirar na Loja") {
      const grafica = await Graficas.findByPk(graficaId);
      if (!grafica) {
        return res.status(404).json({ message: 'Gráfica não encontrada' });
      }

      // Atualiza o endereço do pedido com os dados da gráfica
      const enderecoPedido = await Enderecos.findOne( { where: {idPed: pedidoId} } );
      if (enderecoPedido) {
        enderecoPedido.rua = grafica.enderecoCad;
        enderecoPedido.cidade = grafica.cidadeCad;
        enderecoPedido.estado = grafica.estadoCad;
        enderecoPedido.cep = grafica.cepCad;
        enderecoPedido.tipoEntrega = 'Entrega a Retirar na Loja';
        await enderecoPedido.save();
        console.log('Endereço atualizado para os dados da gráfica.');
      } else {
        console.log('Endereço do pedido não encontrado.');
      }
    }

      if(tipoPed == "Mult") {
        if (!pedido) {
          return res.json({ success: false, message: 'Pedido não encontrado.' });
        }
        pedido.statusPed = novoStatus;
        pedido.graficaAtend = graficaId; // Save the graphics company's ID
        await pedido.save();
      } else{
        // Pega o ID da gráfica nos cookies
        const graficaId = req.cookies.graficaId; // Assuming the graphics company's ID is stored in a cookie
        console.log(graficaId);

        // Procura o pedido com base no 'idPed' na tabela 'ItensPedido'
        const pedido = await ItensPedido.findOne({ where: { idPed: pedidoId } });

        // Também busca o pedido na tabela 'Pedidos' baseado em 'id'
        const tablePedidos = await Pedidos.findOne({ where: { id: pedidoId } });

        if (!pedido || !tablePedidos) {
          return res.json({ success: false, message: 'Pedido não encontrado.' });
        }

        // Procura o usuário pelo 'idUserPed' do pedido
        const userId = pedido.idUserPed;
        const user = await User.findByPk(userId);

        // Atualiza o status do pedido
        pedido.statusPed = novoStatus;
        pedido.graficaAtend = graficaId; // Salva o ID da gráfica que está atendendo o pedido
        await pedido.save();
      }
      
      if(novoStatus === "Pedido Aceito Pela Gráfica") {
        //mensagem whatsapp
        const corpoMensagem = "Olá! Temos o prazer de informar que seu pedido foi aceito pela gráfica e está em processo de produção. Em breve entraremos em contato para fornecer atualizações sobre o progresso e a entrega. Agradecemos por escolher nossos serviços!😉";
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
        console.log("Mensagem enviada Com Sucesso!")
      }else if(novoStatus === "Finalizado") {
        //mensagem whatsapp
        const corpoMensagem = "Olá! Seu pedido foi finalizado e está pronto para retirada ou entrega. Por favor, entre em contato conosco para agendar a retirada ou fornecer detalhes de entrega. Obrigado por escolher nossos serviços!😉";
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
        console.log("Mensagem enviada Com Sucesso!")
      }else if(novoStatus === "Pedido Enviado pela Gráfica") {
        //mensagem whatsapp
        const corpoMensagem = "Olá! Seu pedido foi despachado e está a caminho do seu endereço. Estamos trabalhando para garantir que ele chegue até você o mais rápido possível. Obrigado por escolher nossos serviços!😉";
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
        console.log("Mensagem enviada Com Sucesso!")
      }else {
        console.log("Não foi possível encontrar o pedido!")
      }

      if (novoStatus === "Pedido Entregue pela Gráfica") {
        const valorTotalPedido = tablePedidos.valorPed;
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

      return res.json({ success: true, graficaAtend: graficaId, /*itensPedidos*/ });
    } catch (error) {
      console.error('Erro ao atualizar o status do pedido:', error);
      return res.json({ success: false, message: 'Erro ao atualizar o status do pedido.' });
    }
  });

  app.post('/cancelar-pedido/:idPedido/:idGrafica', async (req, res) => {
    try {
      const graficaId = req.params.idGrafica;
      const idPedido = req.body.idPedido;
  
      console.log('Grafica ID', graficaId, 'Pedido ID', idPedido);
  
      // Atualize o pedido
      const pedido = await ItensPedido.findByPk(idPedido);
  
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
  
      await pedido.update({
        graficaCancl: graficaId,
      });
  
      // Atualize os itens do pedido
      const itensPedido = await ItensPedido.findAll({
        where: {
          id: idPedido,
        },
      });
  
      for (const itemPedido of itensPedido) {
        await itemPedido.update({
          graficaCancl: graficaId,
        });
      }
  
      res.json({ success: true, message: `Pedido ${idPedido} cancelado com sucesso` });
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      res.status(500).json({ error: 'Erro ao cancelar pedido', message: error.message });
    }
  });
  
  app.post('/atualizar-endereco-entrega', async (req, res) => {
    const idPedido = req.body.pedidoId;
    const idGrafica = req.cookies.graficaId;
  
    try {
      // Verificar se o pedido existe
      const pedido = await Pedidos.findByPk(idPedido);
      const enderecoPedido = await Enderecos.findByPk(idPedido);
  
      if (!pedido || !enderecoPedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
  
      // Verificar se o endereço do pedido indica "Entrega a Retirar na Loja"
      if (enderecoPedido.tipoEntrega === 'Entrega a Retirar na Loja') {
        // Buscar a gráfica no banco de dados usando o idGrafica
        const grafica = await Graficas.findByPk(idGrafica);
  
        if (!grafica) {
          return res.status(404).json({ error: 'Gráfica não encontrada' });
        }
  
        // Atualizar o endereço do pedido com os dados da gráfica
        enderecoPedido.rua = grafica.endereçoCad;
        enderecoPedido.cidade = grafica.cidadeCad;
        enderecoPedido.estado = grafica.estadoCad;
        enderecoPedido.cep = grafica.cepCad;
        enderecoPedido.tipoEntrega = 'Entrega a Retirar na Loja';
  
        // Salvar as alterações no banco de dados
        await enderecoPedido.save();
  
        // Retornar uma resposta de sucesso
        res.json({ success: true, message: 'Endereço de entrega atualizado com sucesso' });
      } else {
        // Se o endereço não for "Entrega a Retirar na Loja", retornar uma mensagem indicando que não é necessário atualizar
        res.json({ success: false, message: 'Endereço de entrega já está atualizado' });
      }
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

    // Ajustar texto para as posições corretas dentro das caixas
    page.drawText(`${enderecoData.id}`, { x: 134, y: 638, size: 12 }); // ID
    page.drawText(`${enderecoData.nomeGrafica}`, { x: 330, y: 638, size: 12 }); // LOJA
    page.drawText(enderecoData.nomeEmpresa = enderecoData.nomeEmpresa === undefined ? `${enderecoData.cliente}` : `${enderecoData.nomeEmpresa} - ${enderecoData.cliente}`, { x: 134, y: 610, size: 12 }); // CLIENTE
    page.drawText(`${enderecoData.endereco}`, { x: 134, y: 580, size: 12 }); // ENDEREÇO
    page.drawText(`${enderecoData.cidade}`, { x: 134, y: 550, size: 9 }); // CIDADE
    page.drawText(`${enderecoData.estado}`, { x: 322, y: 550, size: 12 }); // UF
    page.drawText(enderecoData.nomeGerente = enderecoData.nomeGerente === undefined ? `${enderecoData.responsavel}` : `${enderecoData.nomeGerente}`, { x: 440, y: 550, size: 9 }); // RESPONSÁVEL PELO RECEBIMENTO
    page.drawText(`${enderecoData.quantidade}`, { x: 80, y: 450, size: 12 }); // QUANTIDADE
    page.drawText(`${enderecoData.item}`, { x: 134, y: 450, size: 12 }); // NOME DO ITEM

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

    const corpoMensagem = `Olá! Temos o prazer de informar que seu pedido foi entregue com sucesso para ${recEnt} no horário ${horEnt}. Esperamos que você esteja satisfeito com nossos produtos e serviços. Se precisar de mais alguma coisa, não hesite em nos contatar. Obrigado!😉`;
    const corpoObs = `Observações do pedido ${obsEnt}`;

    const arquivosRecebidos = [
      { arquivo: fotoEnt, prefixo: 'foto' },
      { arquivo: produtoEnt, prefixo: 'produto' },
      { arquivo: protocoloEnt, prefixo: 'protocolo' }
    ];

    // Array para armazenar os caminhos dos arquivos salvos
    const imagePaths = [];

    // Salvar cada arquivo no diretório temporário
    arquivosRecebidos.forEach((item) => {
      if (item.arquivo) {
        const caminho = `./routes/${item.prefixo}_${Date.now()}_${item.arquivo.originalname}`;
        fs.writeFileSync(caminho, item.arquivo.buffer);
        imagePaths.push(caminho);
      }
    });
    
    try {
      // Enviar mensagens pelo WhatsApp
      if(obsEnt.length) {
        await enviarNotificacaoWhatsapp(user.telefoneCad, corpoObs);
      }
      await enviarNotificacaoWhatsapp(user.telefoneCad, corpoMensagem);
      await enviarNotificacaoWhatsappComMidia(user.telefoneCad, imagePaths, 'Evidências');
    
      console.log('Mensagens enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
    } finally {
      // Remover arquivos temporários
      imagePaths.forEach((path) => {
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      });
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
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

  module.exports = app;