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
const {Op} = require('sequelize');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const axios = require('axios');
const ultramsg = require('ultramsg-whatsapp-api');
const instance_id = "instance74906";
const ultramsg_token = "sltm2rrl2h6j9r2j";
const api = new ultramsg(instance_id, ultramsg_token);
const qr = require('qrcode');
const cron = require('node-cron');
const request = require('request');
const nodemailer = require('nodemailer');
const rp = require('request-promise');
const Sequelize = require('sequelize');
const fs = require('fs');
const apiKeyBingMaps = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'seuSegredoDeSessao', // Substitua com um segredo seguro
  resave: false,
  saveUninitialized: true
}));

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
      const graficaId = req.cookies.userId;
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
          statusPed: ['Aguardando', 'Pedido Aceito Pela Gráfica', 'Finalizado', 'Pedido Entregue pela Gráfica'],
          statusPag: 'Pago'
        },
      });
  
      let pedidosProximos = [];
      let pedidoAssociado = null;
  
      for (let pedido of pedidosCadastrados) {
        const enderecosPedido = await Enderecos.findAll({
          where: {
            id: pedido.id,
          },
        });
  
        for (let enderecoPedido of enderecosPedido) {
          console.log(`Verificando pedido com o Id: ${pedido.id} e Endereço Id: ${enderecoPedido.id}`);
  
          const enderecoEntregaInfo = {
            endereco: enderecoPedido.rua,
            cep: enderecoPedido.cep,
            cidade: enderecoPedido.cidade,
            estado: enderecoPedido.estado,
          };
  
          const coordinatesEnd = await getCoordinatesFromAddress(enderecoEntregaInfo, apiKey);
  
          if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
            console.log(`Latitude do Endereço de Entrega:`, coordinatesEnd.latitude);
            console.log(`Longitude do Endereço de Entrega:`, coordinatesEnd.longitude);
  
            const graficas = await Graficas.findAll();
  
            let distanciaMinima = Infinity;
            let graficaMaisProxima = null;
  
            for (let graficaAtual of graficas) {
              // Get coordinates for the graphic's address
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
  
            const raioEndereco = enderecoPedido.raio;
  
            if (distanciaMinima <= raioEndereco && graficaMaisProxima) {
              let produtosGrafica;
  
              // Verifica se graficaMaisProxima.produtos é uma string JSON
              if (typeof graficaMaisProxima.produtos === 'string') {
                  const fixedJsonString = graficaMaisProxima.produtos.replace(/'/g, '"'); // Substitui todas as aspas simples por aspas duplas
                  produtosGrafica = JSON.parse(fixedJsonString);
              } else {
                  produtosGrafica = graficaMaisProxima.produtos;
              }
              if (pedido.graficaCancl == graficaMaisProxima.id) {
                console.log(`Pedido cancelado pela gráfica atual. Redirecionando para outra gráfica próxima. Pedido ID: ${pedido.idPed}`);
          
                const enderecoEntregaInfo = {
                  endereco: enderecoPedido.rua,
                  cep: enderecoPedido.cep,
                  cidade: enderecoPedido.cidade,
                  estado: enderecoPedido.estado,
                };
            
                const coordinatesEnd = await getCoordinatesFromAddress(enderecoEntregaInfo, apiKey);
            
                if (coordinatesEnd.latitude !== null && coordinatesEnd.longitude !== null) {
                  const graficas = await Graficas.findAll({
                    where: {
                      id: {
                        [Op.ne]: pedido.graficaCancl, // Op.ne significa "não igual"
                      },
                    },
                  });
            
                  let distanciaMinima = Infinity;
                  let graficaMaisProxima = null;
            
                  for (let graficaAtual of graficas) {
                    // Get coordinates for the graphic's address
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
            
                  const raioEndereco = enderecoPedido.raio;
            
                  if (graficaMaisProxima) {
                    // Atualiza o pedido para a gráfica mais próxima
                    const produtosGrafica = JSON.parse(graficaMaisProxima.produtos);
            
                    console.log("ID", graficaMaisProxima)
                    if (produtosGrafica[pedido.nomeProd]) {
                      console.log(`Distância entre a gráfica e o endereço de entrega (raio ${raioEndereco} km):`, distanciaMinima, 'km');
            
                      const pedidoAssociado = {
                        ...pedido.dataValues,
                        enderecoId: enderecoPedido.id,
                        graficaId: graficaMaisProxima.id,
                      };
            
                      pedidosProximos.push(pedidoAssociado);
            
                      // Atualiza o pedido removendo a associação com a gráfica que cancelou
                      await pedido.update({
                        graficaId: graficaMaisProxima.id,
                        //graficaCancl: null,
                      });
            
                      console.log(`Pedido redirecionado com sucesso para a gráfica ID ${graficaMaisProxima.id}`);
      
                    } else {
                      console.log('A gráfica mais próxima não faz o produto necessário. Procurando outra gráfica...', error);
                    }
                  } else {
                    console.log('Nenhuma gráfica próxima encontrada para redirecionamento.');
                  }
                } else {
                  console.log(`Coordenadas nulas para o Endereço de Entrega.`);
                }
                break;
              }else if (produtosGrafica[pedido.nomeProd] ) {
                console.log(`Distância entre a gráfica e o endereço de entrega (raio ${raioEndereco} km):`, distanciaMinima, 'km');
                const pedidoAssociado = {
                  ...pedido.dataValues,
                  enderecoId: enderecoPedido.id,
                  graficaId: graficaMaisProxima.id,
                };
  
                pedidosProximos.push(pedidoAssociado);
              } else {
                console.log('A gráfica mais próxima não faz o produto necessário. Procurando outra gráfica...', error);
  
                for (let graficaAtual of graficas) {
                  let produtosGraficaAtual;
  
                  // Verifica se graficaAtual.produtos é uma string JSON
                  if (typeof graficaAtual.produtos === 'string') {
                      const fixedJsonString = graficaAtual.produtos.replace(/'/g, '"'); // Substitui todas as aspas simples por aspas duplas
                      produtosGraficaAtual = JSON.parse(fixedJsonString);
                  } else {
                      produtosGraficaAtual = graficaAtual.produtos;
                  }
  
                  if (produtosGraficaAtual[pedido.nomeProd]) {
                    console.log(`Encontrada outra gráfica próxima que faz o produto necessário.`);
                    const pedidoAssociado = {
                      ...pedido.dataValues,
                      enderecoId: enderecoPedido.id,
                      graficaId: graficaAtual.id,
                    };
  
                    pedidosProximos.push(pedidoAssociado);
                    break;
                  }
                }
              }
            } else {
              console.log('Nenhuma gráfica próxima encontrada ou a distância é maior que o raio permitido.');
            }
          } else {
            console.log(`Coordenadas nulas para o Endereço de Entrega.`);
          }
        }
      }
      if (pedidosProximos.length > 0) {
        // Filter orders only for the graphic with the closest proximity
        console.log("TODOS OS PEDIDOS", pedidosProximos);
      
        const pedidosParaGrafica = pedidosProximos.filter((pedido) => {
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
  
      if (error.response) {
        console.error('Detalhes do erro de resposta:', error.response.status, error.response.statusText);
  
        try {
          const errorData = await error.response.json();
          console.error('Detalhes adicionais do erro:', errorData);
        } catch (jsonError) {
          console.error('Erro ao analisar o corpo JSON da resposta:', jsonError.message);
        }
      }
  
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao buscar pedidos cadastrados', message: error.message });
      }
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
      const usuario = await User.findByPk(idUserPed);
  
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
      const { pedidoId, novoStatus } = req.body;
  
      // Atualize o status do pedido na tabela Pedidos
      const graficaId = req.cookies.userId; // Assuming the graphics company's ID is stored in a cookie
      console.log(graficaId)
      const pedido = await ItensPedido.findByPk(pedidoId);
      if (!pedido) {
        return res.json({ success: false, message: 'Pedido não encontrado.' });
      }
  
      pedido.statusPed = novoStatus;
      pedido.graficaAtend = graficaId; // Save the graphics company's ID
      await pedido.save();
  
      if(novoStatus === "Pedido Entregue pela Gráfica") {
        pedido.statusPed = novoStatus;
        pedido.graficaAtend = graficaId; // Save the graphics company's ID
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
    const idGrafica = req.cookies.userId;
  
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

  module.exports = app;