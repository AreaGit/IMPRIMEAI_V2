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
          statusPed: 'Aguardando',
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

  module.exports = app;