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
const apiKangu = "19d3069503b19af19c14b73936a9a17f5b0eaba676b2a925d9d6d732f6b577e7";
const XLSX = require('xlsx');
const {google} = require('googleapis');
const GOOGLE_API_FOLDER_ID = '1F7sQzOnnbqn0EnUeT4kWrNOzsVFP-bG1';
const stream = require('stream');
const ultramsg = require('ultramsg-whatsapp-api');
const instance_id = "instance75591";
const ultramsg_token = "voqt7bp0dfrdvgd4";
const api = new ultramsg(instance_id, ultramsg_token);
const pagarme = require('pagarme');
const qr = require('qrcode');
const cron = require('node-cron');
const request = require('request');
const nodemailer = require('nodemailer');
const rp = require('request-promise');
const Sequelize = require('sequelize');
const fs = require('fs');
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
const pagarmeKeyProd = "sk_e74e3fe1ccbe4ae080f70d85d94e2c68";
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
    // Obtenha os dados do carrinho da sessão
    const carrinho = req.session.carrinho || [];
    // Envie os dados do carrinho como resposta em JSON
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
          produtoId: produto.id,
          nomeProd: produto.nomeProd,
          quantidade: quantidade,
          valorUnitario: produto.valorProd,
          subtotal: quantidade * produto.valorProd,
          raioProd: produto.raioProd,
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
//Rota post para salvar o endereço do usuário
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
      }
    } = req.body;

    const endereco = {
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

    // Salve o endereço na sessão
    req.session.endereco = endereco;

    // Calcule o frete e salve na sessão
    const { graficaMaisProxima, distanciaMinima, custoDoFrete } = await encontrarGraficaMaisProxima(endereco);
    console.log('Gráfica mais próxima:', graficaMaisProxima);
    console.log('Distância mínima:', distanciaMinima);
    console.log('Custo do Frete:', custoDoFrete);

    // Defina o frete na sessão
    req.session.frete = custoDoFrete;
    endereco.frete = custoDoFrete;

    // Atualize o endereço de cada produto no carrinho com o endereço do usuário
    if (req.session.carrinho && req.session.carrinho.length > 0) {
      req.session.carrinho.forEach((produto) => {
        produto.endereco = { ...endereco }; // Copia o endereço do usuário para cada produto no carrinho
      });
    }
    // Agora podemos enviar a resposta ao cliente com os dados da gráfica mais próxima e o custo do frete
    console.log(endereco);
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
      userId: userId,
    });
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post('/salvar-endereco-retirada-no-carrinho', async(req, res) => {
  const enderecoData = {
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
  } = req.body;
  
  const endereco = {
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
  // Salve o endereço na sessão
  req.session.endereco = endereco;

  // Salve o endereço também no carrinho (lógica específica do aplicativo)
  req.session.carrinho = req.session.carrinho || [];

  // Crie um array para armazenar endereços quebrados com base na quantidade total de produtos no carrinho
  const enderecosQuebrados = [];

  // Itere sobre o carrinho e adicione os endereços quebrados ao array
  req.session.carrinho.forEach((produto) => {
    for (let i = 0; i < produto.quantidade; i++) {
      const enderecoQuebrado = { ...endereco, tipoEntrega: 'Entrega a Retirar na Loja' };
      enderecosQuebrados.push(enderecoQuebrado);
    }
  });

  // Atualize cada produto no carrinho com o endereço correspondente
  req.session.carrinho.forEach((produto, index) => {
    produto.endereco = enderecosQuebrados[index];
  });

  req.session.endereco = enderecosQuebrados;

  console.log('Endereços Quebrados:', enderecosQuebrados);
  console.log('Conteúdo da Sessão:', req.session);

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

async function encontrarGraficaMaisProxima(endereco) {
  try {
    const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';

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
      
      // Calcular o custo do frete com base na distância e arredondar para duas casas decimais
      const custoDoFrete = parseFloat((distanciaMinima * 2).toFixed(2)); // 2 reais por quilômetro
      
      return {
        graficaMaisProxima,
        distanciaMinima,
        custoDoFrete
      };
    }
  } catch (err) {
    console.error('Erro ao encontrar a gráfica mais próxima:', err);
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
        
        // Calcular o custo do frete com base na distância e arredondar para duas casas decimais
        const custoDoFrete = parseFloat((distanciaMinima * 2).toFixed(2)); // 2 reais por quilômetro
        
        somaDosFretes += custoDoFrete; // Adicionar o custo do frete ao total de fretes

        resultadosFrete.push({
          endereco,
          graficaMaisProxima,
          distanciaMinima,
          custoDoFrete
        });
      }
    }

    // Retornar a soma total dos fretes junto com os resultados de frete
    return {
      resultadosFrete,
      somaDosFretes
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
            quantidade: row[0],
          };
          // Adicione o endereço à lista de endereços com base na quantidade especificada
          for (let j = 0; j < row[0]; j++) {
            enderecosSalvos.push(endereco);
          }
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
      
      carrinho.forEach((produto, produtoIndex) => {
        const produtoId = produto.produtoId;
        const quantidade = produto.quantidade;

        for (let i = 0; i < quantidade; i++) {
          const endereco = enderecosSalvos[enderecoIndex];
          const frete = resultadosFrete[enderecoIndex].custoDoFrete; // Pegar o custo do frete correspondente ao endereço
          enderecoIndex = (enderecoIndex + 1) % enderecosSalvos.length; // Avança para o próximo endereço

          carrinhoQuebrado.push({
            // Adicionando sufixo único ao ID do produto
            produtoId: `${produtoId}_${produtoIndex}_${i}`,
            nomeProd: produto.nomeProd,
            quantidade: 1,
            valorUnitario: produto.valorUnitario,
            subtotal: produto.subtotal,
            raioProd: produto.raioProd,
            acabamento: produto.acabamento,
            cor: produto.cor,
            enobrecimento: produto.enobrecimento,
            formato: produto.formato,
            material: produto.material,
            arquivo: produto.nomeArquivo,
            downloadLink: produto.downloadLink,
            tipoEntrega: 'Múltiplos Enderecos',
            endereco: {
              ...endereco, // Copy existing address properties
              frete: frete, // Add shipping cost to the address object
            },
          });
        }
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
//Chamada para fazer o upload dos arquivos e salvar o link de download no carrinho
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = [];

    for (const file of files) {
      const result = await uploadFile(file);
      uploadedFiles.push(result);
    }

    // Atualizar os links de download na sessão do carrinho
    const { session } = req;
    const carrinho = session.carrinho || [];

    uploadedFiles.forEach((file) => {
      const produtoIndex = carrinho.findIndex((produto) => !produto.downloadLink);
      
      if (produtoIndex !== -1) {
        // Encontrou um produto sem link de download
        carrinho[produtoIndex].downloadLink = file.webViewLink;
        carrinho[produtoIndex].nomeArquivo = file.nomeArquivo;
      }
    });

    session.carrinho = carrinho;

    console.log('Arquivos enviados para o Google Drive:', uploadedFiles);
    console.log('Carrinho após Atualizado', carrinho);
    res.status(200).send('Upload para o Google Drive concluído com sucesso');
  } catch (error) {
    console.error('Erro durante o upload para o Google Drive:', error);
    res.status(500).send('Erro durante o upload para o Google Drive');
  }
});
//Função para fazer upload dos arquivos ao google drive
async function uploadFile(file) {
  console.log('File Object:', file);
  const nomeArquivo = file.originalname;
  if (file.originalname.trim() === "Enviar Arte Depois") {
    return { webViewLink: "Enviar Arte Depois" };
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
  try {
    console.log('1');
    const metodPag = req.body.metodPag;
    const idTransacao = req.body.idTransacao;
    console.log(idTransacao);
    console.log(metodPag);
    console.log(req.session.endereco)
    const carrinhoQuebrado = req.session.carrinho || [];
    const enderecoDaSessao = req.session.endereco;
    if (carrinhoQuebrado.length > 0 && carrinhoQuebrado[0].tipoEntrega === 'Múltiplos Enderecos') {
      const totalAPagar = await Promise.all(carrinhoQuebrado.map(async (produtoQuebrado) => {
        const produto = await Produtos.findByPk(produtoQuebrado.produtoId);
        return produto.valorProd * produtoQuebrado.quantidade;
      })).then((valores) => valores.reduce((total, valor) => total + valor, 0));

      const pedido = await Pedidos.create({
        idUserPed: req.cookies.userId,
        nomePed: 'Pedido Geral',
        quantPed: carrinhoQuebrado.length,
        valorPed: totalAPagar,
        statusPed: metodPag === 'Boleto' ? 'Esperando Pagamento' : 'Pago',
        metodPag: metodPag,
        idTransacao: idTransacao
        // ... outros campos relevantes ...
      });

      const itensPedidoPromises = carrinhoQuebrado.map(async (produtoQuebrado) => {
        const produto = await Produtos.findByPk(produtoQuebrado.produtoId);
        const itemPedido = await ItensPedido.create({
          idPed: pedido.id,
          idProduto: produtoQuebrado.produtoId,
          nomeProd: produto.nomeProd,
          quantidade: produtoQuebrado.quantidade,
          valorProd: produto.valorProd,
          raio: produtoQuebrado.raioProd,
          acabamento: produtoQuebrado.acabamento,
          cor: produtoQuebrado.cor,
          enobrecimento: produtoQuebrado.enobrecimento,
          formato: produtoQuebrado.formato,
          material: produtoQuebrado.material,
          arquivo: produtoQuebrado.arquivo,
          statusPed: carrinhoQuebrado.some(produtoQuebrado => produtoQuebrado.downloadLink === "Enviar Arte Depois")
            ? 'Pedido em Aberto'
            : 'Aguardando',
          statusPag: metodPag === 'Boleto' ? 'Esperando Pagamento' : metodPag === 'Carteira Usuário' ? 'Pago' : 'Aguardando',
          linkDownload: produtoQuebrado.downloadLink,
          nomeArquivo: produtoQuebrado.arquivo,
          // ... outros campos relevantes ...
        });
        await verificarGraficaMaisProximaEAtualizar(itemPedido);
        return itemPedido;
      });

      const itensPedido = await Promise.all(itensPedidoPromises);

      const enderecosPromises = carrinhoQuebrado.map(async (produtoQuebrado) => {
        return Enderecos.create({
          idPed: pedido.id,
          rua: produtoQuebrado.endereco.rua,
          cep: produtoQuebrado.endereco.cep,
          cidade: produtoQuebrado.endereco.cidade,
          numero: produtoQuebrado.endereco.numeroRua,
          complemento: produtoQuebrado.endereco.complemento,
          bairro: produtoQuebrado.endereco.bairro,
          quantidade: produtoQuebrado.quantidade,
          celular: produtoQuebrado.endereco.telefone,
          estado: produtoQuebrado.endereco.estado,
          cuidados: produtoQuebrado.endereco.cuidados,
          raio: produtoQuebrado.raioProd,
          produtos: produtoQuebrado.produtoId,
          idProduto: produtoQuebrado.produtoId,
          tipoEntrega: produtoQuebrado.tipoEntrega,
          frete: produtoQuebrado.frete
          // ... outros campos relevantes ...
        });
      });

      const enderecos = await Promise.all(enderecosPromises);

      req.session.carrinho = [];
      req.session.endereco = {};

      res.json({ message: 'Mini Pedido criado com sucesso', pedido });
    } else {
      console.log('2');
      const totalAPagar = await Promise.all(carrinhoQuebrado.map(async (produtoNoCarrinho) => {
        const produto = await Produtos.findByPk(produtoNoCarrinho.produtoId);
        return produto.valorProd * produtoNoCarrinho.quantidade;
      })).then((valores) => valores.reduce((total, valor) => total + valor, 0));

      const pedido = await Pedidos.create({
        idUserPed: req.cookies.userId,
        nomePed: 'Pedido Geral',
        quantPed: 1,
        valorPed: totalAPagar,
        statusPed: metodPag === 'Boleto' ? 'Esperando Pagamento' : 'Pago',
        metodPag: metodPag,
        idTransacao: idTransacao,
        //raio: produto.raioProd,
      });

      const enderecosQuebradosPromises = carrinhoQuebrado.map(async (produtoNoCarrinho, index) => {
        const produto = await Produtos.findByPk(produtoNoCarrinho.produtoId);
        const enderecoQuebrado = {
          idPed: pedido.id,
          rua: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.rua : null,
          cep: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.cep : null,
          cidade: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.cidade : null,
          numero: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.numeroRua : null,
          complemento: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.complemento : null,
          bairro: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.bairro : null,
          quantidade: produtoNoCarrinho.quantidade,
          celular: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.telefone : null,
          estado: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.estado : null,
          cuidados: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.nomeCliente : null,
          raio: produtoNoCarrinho.raioProd,
          idProduto: produtoNoCarrinho.produtoId,
          tipoEntrega: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.tipoEntrega : null,
          frete: produtoNoCarrinho.endereco ? produtoNoCarrinho.endereco.frete : null,
        };
      
        const enderecoCriado = await Enderecos.create(enderecoQuebrado);
      
        return enderecoCriado;
      });
      
      const enderecosQuebrados = await Promise.all(enderecosQuebradosPromises);      

      const itensPedidoPromises = carrinhoQuebrado.map(async (produtoNoCarrinho, index) => {
        const produto = await Produtos.findByPk(produtoNoCarrinho.produtoId);
        const endereco = enderecosQuebrados[index];

        const itemPedido = await ItensPedido.create({
          idPed: pedido.id,
          idProduto: produtoNoCarrinho.produtoId,
          nomeProd: produto.nomeProd,
          quantidade: produtoNoCarrinho.quantidade,
          valorProd: produto.valorProd,
          raio: produtoNoCarrinho.raioProd,
          acabamento: produtoNoCarrinho.acabamento,
          cor: produtoNoCarrinho.cor,
          enobrecimento: produtoNoCarrinho.enobrecimento,
          formato: produtoNoCarrinho.formato,
          material: produtoNoCarrinho.material,
          arquivo: produtoNoCarrinho.arquivo,
          statusPed: carrinhoQuebrado.some(produtoQuebrado => produtoQuebrado.downloadLink === "Enviar Arte Depois")
            ? 'Pedido em Aberto'
            : 'Aguardando',
          statusPag: metodPag === 'Boleto' ? 'Esperando Pagamento' : metodPag === 'Carteira Usuário' ? 'Pago' : 'Aguardando',
          linkDownload: produtoNoCarrinho.downloadLink,
          nomeArquivo: produtoNoCarrinho.nomeArquivo,
          enderecoId: endereco.id,
        });

        await verificarGraficaMaisProximaEAtualizar(itemPedido);
        return itemPedido;
      });

      req.session.carrinho.forEach((produto, index) => {
        produto.endereco = enderecosQuebrados[index];
      });

      req.session.carrinho = [];
      req.session.endereco = {};

      res.json({ message: 'Pedido criado com sucesso', pedido });
    }
  } catch (error) {
    console.error('Erro ao criar pedidos:', error);
    res.status(500).json({ error: 'Erro ao criar pedidos' });
  }
});

    async function verificarGraficaMaisProximaEAtualizar(pedido) {
      try {
        const apiKey = 'Ao6IBGy_Nf0u4t9E88BYDytyK5mK3kObchF4R0NV5h--iZ6YgwXPMJEckhAEaKlH';
    
        const pedidosCadastrados = await ItensPedido.findAll({
          /*where: {
            statusPed: 'Aguardando',
          },*/
        });
    
        let pedidosProximos = [];
        
        // Conjunto para armazenar IDs de gráficas já notificadas
        let graficasNotificadas = new Set();
    
        for (let pedidoCadastrado of pedidosCadastrados) {
          const enderecosPedido = await Enderecos.findAll({
            where: {
              id: pedidoCadastrado.id,
            },
          });
    
          let enderecoNotificado = false;
    
          for (let enderecoPedido of enderecosPedido) {
            console.log(`Verificando pedido com o Id: ${pedidoCadastrado.id} e Endereço Id: ${enderecoPedido.id}`);
    
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
                // Verifica se a gráfica já foi notificada
                if (graficasNotificadas.has(graficaAtual.id)) {
                  continue;
                }
    
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
    
              if (distanciaMinima <= raioEndereco && graficaMaisProxima && !enderecoNotificado) {
                let produtosGrafica;
              // Verifica se graficaMaisProxima.produtos é uma string JSON
              if (typeof graficaMaisProxima.produtos === 'string') {
                  const fixedJsonString = graficaMaisProxima.produtos.replace(/'/g, '"'); // Substitui todas as aspas simples por aspas duplas
                  produtosGrafica = JSON.parse(fixedJsonString);
              } else {
                  produtosGrafica = graficaMaisProxima.produtos;
              }     
                if (produtosGrafica[pedidoCadastrado.nomeProd]) {
                  const pedidoAssociado = {
                    ...pedidoCadastrado.dataValues,
                    enderecoId: enderecoPedido.id,
                    graficaId: graficaMaisProxima.id,
                  };
    
                  pedidosProximos.push(pedidoAssociado);
    
                  await pedidoCadastrado.update({
                    graficaAtend: graficaMaisProxima.id,
                  });
    
                  // Notifica a gráfica apenas uma vez
                  if (!enderecoNotificado) {
                    let mensagemStatus = '';

                    if (pedidoAssociado.statusPed === 'Aguardando') {
                      mensagemStatus = 'Você tem um novo pedido em Aguardo para ser atendido. Abra o seu Painel de Pedidos!';
                    } else {
                      mensagemStatus = 'Você tem um novo pedido em Aberto para ser atendido. Fique atento ao seu Painel de Pedidos!';
                    }

                    await enviarEmailNotificacao(graficaMaisProxima.emailCad, `Novo Pedido - ID ${pedidoCadastrado.id}`, mensagemStatus);
                    await enviarNotificacaoWhatsapp(graficaMaisProxima.telefoneCad, `Novo Pedido - ${mensagemStatus}`);

                    enderecoNotificado = true; // Marca o endereço como notificado
                    graficasNotificadas.add(graficaMaisProxima.id); // Marca a gráfica como notificada
                    break;
                  }
                }
              }
            }
          }
        }
    
        if (pedidosProximos.length > 0) {
          console.log("TODOS OS PEDIDOS", pedidosProximos);
          // Restante do código para filtrar e retornar os pedidos
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos cadastrados:', error);
        // Restante do código para tratamento de erros
      }
    }
    
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
        from: 'gabrieldiastrin63@gmail.com',
        to: destinatario,
        subject: assunto,
        text: corpo,
      });
    
      console.log('E-mail enviado:', info);
    }

    async function enviarNotificacaoWhatsapp(destinatario, corpo) {
      try {
          const response = await api.sendChatMessage(destinatario, corpo);
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
  
  async function verificarPagamentosPendentes() {
    try {
        // Consultar pedidos com status 'Esperando Pagamento' no seu banco de dados
        const pedidosAguardandoPagamento = await Pedidos.findAll({ where: { statusPed: 'Esperando Pagamento' } });

        // Iterar sobre os pedidos encontrados
        for (const pedido of pedidosAguardandoPagamento) {
            // Verificar o status do pagamento no Pagarme usando o ID da transação
            const chargeId = pedido.idTransacao;
            console.log('Charge ID:', chargeId);
            try {
                // Fetch the charge details directly from the Pagarme API
                const response = await axios.get(`https://api.pagar.me/core/v5/charges/${chargeId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${pagarmeKeyProd}:`).toString('base64')}`
                    }
                });
                const charge = response.data;
                //console.log('Charge found:', charge); // Check if charge is defined
                // Verificar se a transação está paga
                if (charge.status === 'pending') {
                    // Atualizar o status do pedido para 'Pago'
                    pedido.statusPed = 'Pago';
                    await pedido.save();

                    await ItensPedido.update({ statusPag: 'Pago' }, { where: { idPed: pedido.id } });
                }
            } catch (error) {
                // Verificar se o erro é de cobrança não encontrada
                if (error.response && error.response.status === 404) {
                    console.error(`Cobrança não encontrada para o pedido ${pedido.id}:`, error);
                } else {
                    throw error; // Rejeitar erro para tratamento superior
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar pagamentos pendentes:', error);
    }
}
  
  // Agendar a tarefa para ser executada a cada 5 segundos
  cron.schedule('0 * * * *', async () => {
    console.log('Verificando pagamentos pendentes...');
    await verificarPagamentosPendentes();
    console.log('Verificação de pagamentos concluída.');
  });
  
  cron.schedule('0 * * * *', async () => {
    console.log('Verificação de pagamentos Carteira...');
    verificarPagamentosPendentesCarteira();
    console.log('Verificação de pagamentos Carteira concluída.');
  })
  
  async function verificarPagamentosPendentesCarteira() {
    try {
    const transacoesPendentes = await Carteira.findAll({ where: { statusPag: 'ESPERANDO PAGAMENTO' } });
    console.log('Transações pendentes:', transacoesPendentes); 
    
    // Iterar sobre as transações pendentes encontradas
    for (const transacao of transacoesPendentes) {
      // Verificar o status do pagamento no Pagarme usando o ID da transação
      const transactionId = transacao.idTransacao;
      console.log('Transaction ID:', transactionId); // Check if transactionId is defined
      try {
        const response = await axios.get(`https://api.pagar.me/core/v5/charges/${transactionId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${pagarmeKeyProd}:`).toString('base64')}`
          }
        });
        //console.log('Transaction found:', response); // Check if transaction is defined
        const charge = response.data;
        // Verificar se a transação está paga
        if (charge.status === 'paid') {
          // Atualizar o status da transação para 'PAGO'
          transacao.statusPag = 'PAGO';
          await transacao.save();
        }
      } catch (error) {
          // Verificar se o erro é de transação não encontrada
          if (error.response && error.response.status === 404) {
            console.error(`Transação não encontrada para a transação ${transacao.id}:`, error);
          } else {
              throw error; // Rejeitar erro para tratamento superior
          }
      }
    }
    } catch(error) {
      console.error('Erro ao verificar pagamentos pendentes:', error);
    }
  }

  app.post('/registrarPagamento', async (req, res) => {
    const { userId, valor, metodoPagamento, status, idTransacao } = req.body;
    console.log("REGISTRANDO NA CARTEIRA", userId, valor, metodoPagamento, status)
    try {
      // Encontre a carteira do usuário pelo userId
      let carteira = await Carteira.findOne({ where: { userId } });
  
      // Se a carteira não existir, crie uma nova
      if (!carteira) {
        //carteira = await Carteira.create({ userId, saldo: 0 }); // Saldo inicial 0
      }
  
      // Crie uma entrada na tabela Carteira para registrar o pagamento
      const pagamento = await Carteira.create({
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
        const apiKey = 'sk_5956e31434bb4c618a346da1cf6c107b'; // Substitua pelo sua chave de API do Pagarme
        
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
            attributes: ['statusPed', 'nomeProd', 'idProduto'], // Inclua apenas a coluna 'statusPed'
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
        acabamento: item.acabamento,
        cor: item.cor,
        enobrecimento: item.enobrecimento,
        formato: item.formato,
        material: item.material,
        linkDownload: item.linkDownload,
        nomeArquivo: item.nomeArquivo,
        imgProd: item.produto.imgProd,
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

app.post('/processarPagamento-pix', (req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  const totalAmount = carrinho.reduce((total, item) => {
    console.log(item.endereco.frete);
    console.log(item.valorUnitario);
    const subtotalComFrete = item.valorUnitario + item.endereco.frete;
    return total + subtotalComFrete * item.quantidade * 100; // Multiplicando pelo número de itens
  }, 0);
  console.log(totalAmount);

  // Define o payload da requisição
  const body = {
    "items": carrinho.map(item => ({
        "id": item.produtoId,
        "amount": item.endereco.tipoEntrega === "Único Endereço" ?
        Math.round((item.subtotal + item.endereco.frete) * 100) :
        item.endereco.tipoEntrega === "Entrega a Retirar na Loja" ?
        item.subtotal * 100 :
        Math.round((item.valorUnitario + item.endereco.frete) * 100),
        "description": item.nomeProd,
        "quantity": item.quantidade,
        "code": item.produtoId
    })),
    "customer": {
        "name": perfilData.nomeCliente,
        "email": perfilData.emailCliente,
        "type": "individual",
        "document": perfilData.cpfCliente,
        "phones": {
            "home_phone": {
                "country_code": "55",
                "number": perfilData.numeroTelefoneCliente,
                "area_code": perfilData.dddCliente,
            }
        }
    },
    "payments": [
        {
            "payment_method": "pix",
            "pix" : {
              "expires_in": "175",
              "additional_information" : [
                {
                  "name" : "PEDIDO IMPRIMEAI",
                  "value" : "1"
                }
              ]
            }
        }
    ]
  };
  const options = {
    method: 'POST',
    uri: 'https://api.pagar.me/core/v5/orders',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: body,
    json: true
  };

  rp(options)
  .then(response => {
    console.log(response.charges);
    res.status(200).send(response.charges);
  })
  .catch(error => {
      // Handle error response
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Request failed with status code', error.response.statusCode);
        console.error('Response body:', error.response.body);
      }
      res.status(500).send("Transação falhada!");
    });
});


// Rota GET para obter informações sobre uma cobrança específica
app.get('/charges/:chargeId', (req, res) => {
  const chargeId = req.params.chargeId;

  // URL da API Pagar.me para obter informações sobre uma cobrança específica
  const apiUrl = `https://api.pagar.me/core/v5/charges/${chargeId}`;

  // Opções para a solicitação GET
  const options = {
      method: 'GET',
      uri: apiUrl,
      headers: {
          'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64')
      },
      json: true
  };

  // Faça a solicitação GET para a API Pagar.me
  rp(options)
      .then(response => {
          // Envie os detalhes da cobrança como resposta
          res.status(200).json(response);
      })
      .catch(error => {
          // Se ocorrer um erro ao fazer a solicitação, envie uma resposta de erro
          console.error('Erro ao obter informações da cobrança:', error);
          res.status(500).send('Erro ao obter informações da cobrança');
      });
});

app.post('/processarPagamento-boleto', (req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  // Define the request payload
  const body = {
    "items": carrinho.map(item => ({
      "id": item.produtoId,
      "amount": item.endereco.tipoEntrega === "Único Endereço" ?
      Math.round((item.subtotal + item.endereco.frete) * 100) :
      item.endereco.tipoEntrega === "Entrega a Retirar na Loja" ?
      item.subtotal * 100 :
      Math.round((item.valorUnitario + item.endereco.frete) * 100),
      "description": item.nomeProd,
      "quantity": item.quantidade,
      "code": item.produtoId
  })),
    "customer": {
      "name": perfilData.nomeCliente,
      "email": perfilData.emailCliente,
      "document_type": "CPF",
      "document": perfilData.cpfCliente,
      "type": "individual",
      "address": {
          "line_1": perfilData.ruaCliente,
          "line_2": perfilData.complementoCliente,
          "zip_code": perfilData.cepCliente,
          "city": perfilData.cidadeCliente,
          "state": perfilData.estadoCliente,
          "country": "BR",
      },
    },
    "payments": [
        {
            "payment_method": "boleto",
            "boleto" : {
              "instructions": "Pagar até o vencimento",
              "document_number": "123",
              "type": "DM"
            }
        }
    ]
  };
  const options = {
    method: 'POST',
    uri: 'https://api.pagar.me/core/v5/orders',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: body,
    json: true
  };

  rp(options)
  .then(response => {
    console.log(response.charges);
    res.status(200).send(response.charges);
  })
  .catch(error => {
      // Handle error response
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Request failed with status code', error.response.statusCode);
        console.error('Response body:', error.response.body);
      }
      res.status(500).send("Transação falhada!");
    });
});

app.post('/processarPagamento-cartao', (req ,res) => {
  const formData = req.body.formData;
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  console.log(formData)
  // Monte o body com os dados do usuário e do carrinho
  const body = {
    "items": carrinho.map(item => ({
      "id": item.produtoId,
        //"amount": Math.max(Math.round(parseFloat(perfilData.totalCompra) * 100), 1),
        "amount": item.endereco.tipoEntrega === "Único Endereço" ?
        Math.round((item.subtotal + item.endereco.frete) * 100) :
        item.endereco.tipoEntrega === "Entrega a Retirar na Loja" ?
        item.subtotal * 100 :
        Math.round((item.valorUnitario + item.endereco.frete) * 100),
        "description": item.nomeProd,
        "quantity": item.quantidade,
        "code": item.produtoId
      })),
      "customer": {
        "name": perfilData.nomeCliente,
        "email": perfilData.emailCliente,
        "code": perfilData.userId,
        "type": "individual",
        "document": perfilData.cpfCliente,
        "document_type": "CPF",
        "gender": "male",
        "address": {
          "street": perfilData.ruaCliente,
          "city": perfilData.cidadeCliente,
          "state": perfilData.estadoCliente,
            "country": "BR",
            "zip_code": perfilData.cepCliente,
            "neighborhood": perfilData.bairroCliente
          },
          "phones": {
            "home_phone": {
              "country_code": "55",
              "number": perfilData.numeroTelefoneCliente,
              "area_code": perfilData.dddCliente,
          },
            "mobile_phone": {
              "country_code": "55",
              "number": perfilData.numeroTelefoneCliente,
              "area_code": perfilData.dddCliente,
            }
          },
            "metadata": {} // Metadados do cliente
        },
        "payments": [
          {
            "payment_method": "credit_card",
            "credit_card": {
              "recurrence": false,
              "installments": 1,
              "statement_descriptor": "IMPRIMEAI",
              "card": {
                "number": formData.numCar,
                "holder_name": formData.nomeTitular,
                "exp_month": formData.mesExp,
                "exp_year": formData.anoExp,
                "cvv": formData.cvvCard,
                "billing_address": {
                  "line_1": perfilData.ruaCliente,
                  "zip_code": perfilData.cepCliente,
                  "city": perfilData.cidadeCliente,
                  "state": perfilData.estadoCliente,
                  "country": "BR"
                }
              }
            }
          }
        ]
      };

      const options = {
        method: 'POST',
        uri: 'https://api.pagar.me/core/v5/orders',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
          'Content-Type': 'application/json'
        },
        body: body,
        json: true
      };
      rp(options)
      .then(response => {
        console.log(response);
        res.status(200).send(response.charges);
      })
      .catch(error => {
        // Handle error response
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Request failed with status code', error.response.statusCode);
          console.error('Response body:', error.response.body);
        }
        res.status(500).send("Transação falhada!");
      });
});

app.post('/processarPagamento-pix-carteira', (req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  // Define the request payload
  const body = {
    "items": [
      {
          "amount": Math.max(Math.round(parseFloat(perfilData.totalCompra) * 100), 1),
          "description": "CARTEIRA",
          "quantity": 1
      }
    ],
    "customer": {
        "name": perfilData.nomeCliente,
        "email": perfilData.emailCliente,
        "type": "individual",
        "document": perfilData.cpfCliente,
        "phones": {
            "home_phone": {
                "country_code": "55",
                "number": perfilData.numeroTelefoneCliente,
                "area_code": perfilData.dddCliente,
            }
        }
    },
    "payments": [
        {
            "payment_method": "pix",
            "pix" : {
              "expires_in": "175",
              "additional_information" : [
                {
                  "name" : "PEDIDO IMPRIMEAI",
                  "value" : "1"
                }
              ]
            }
        }
    ]
  };
  const options = {
    method: 'POST',
    uri: 'https://api.pagar.me/core/v5/orders',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: body,
    json: true
  };

  rp(options)
  .then(response => {
    console.log(response.charges);
    res.status(200).send(response.charges);
  })
  .catch(error => {
      // Handle error response
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Request failed with status code', error.response.statusCode);
        console.error('Response body:', error.response.body);
      }
      res.status(500).send("Transação falhada!");
    });
});

app.post('/processarPagamento-boleto-carteira', (req, res) => {
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  // Define the request payload
  const body = {
    "items": [
      {
          "amount": Math.max(Math.round(parseFloat(perfilData.totalCompra) * 100), 1),
          "description": "CARTEIRA",
          "quantity": 1,
          "code": "123"
      }
    ],
    "customer": {
      "name": perfilData.nomeCliente,
      "email": perfilData.emailCliente,
      "document_type": "CPF",
      "document": perfilData.cpfCliente,
      "type": "individual",
      "address": {
          "line_1": perfilData.ruaCliente,
          "line_2": perfilData.complementoCliente,
          "zip_code": perfilData.cepCliente,
          "city": perfilData.cidadeCliente,
          "state": perfilData.estadoCliente,
          "country": "BR",
      },
    },
    "payments": [
        {
            "payment_method": "boleto",
            "boleto" : {
              "instructions": "Pagar até o vencimento",
              "document_number": "123",
              "type": "DM"
            }
        }
    ]
  };
  const options = {
    method: 'POST',
    uri: 'https://api.pagar.me/core/v5/orders',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: body,
    json: true
  };

  rp(options)
  .then(response => {
    console.log(response.charges);
    res.status(200).send(response.charges);
  })
  .catch(error => {
      // Handle error response
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Request failed with status code', error.response.statusCode);
        console.error('Response body:', error.response.body);
      }
      res.status(500).send("Transação falhada!");
    });
});

app.post('/processarPagamento-cartao-carteira', (req ,res) => {
  const formData = req.body.formData;
  const perfilData = req.body.perfilData;
  const carrinho = req.session.carrinho;
  console.log(formData)
  // Monte o body com os dados do usuário e do carrinho
  const body = {
    "items": [
      {
          "amount": Math.max(Math.round(parseFloat(perfilData.totalCompra) * 100), 1),
          "description": "CARTEIRA",
          "quantity": 1,
          "code": "123"
      }
    ],
      "customer": {
        "name": perfilData.nomeCliente,
        "email": perfilData.emailCliente,
        "code": perfilData.userId,
        "type": "individual",
        "document": perfilData.cpfCliente,
        "document_type": "CPF",
        "gender": "male",
        "address": {
          "street": perfilData.ruaCliente,
          "city": perfilData.cidadeCliente,
          "state": perfilData.estadoCliente,
            "country": "BR",
            "zip_code": perfilData.cepCliente,
            "neighborhood": perfilData.bairroCliente
          },
          "phones": {
            "home_phone": {
              "country_code": "55",
              "number": perfilData.numeroTelefoneCliente,
              "area_code": perfilData.dddCliente,
          },
            "mobile_phone": {
              "country_code": "55",
              "number": perfilData.numeroTelefoneCliente,
              "area_code": perfilData.dddCliente,
            }
          },
            "metadata": {} // Metadados do cliente
        },
        "payments": [
          {
            "payment_method": "credit_card",
            "credit_card": {
              "recurrence": false,
              "installments": 1,
              "statement_descriptor": "IMPRIMEAI",
              "card": {
                "number": formData.numCar,
                "holder_name": formData.nomeTitular,
                "exp_month": formData.mesExp,
                "exp_year": formData.anoExp,
                "cvv": formData.cvvCard,
                "billing_address": {
                  "line_1": perfilData.ruaCliente,
                  "zip_code": perfilData.cepCliente,
                  "city": perfilData.cidadeCliente,
                  "state": perfilData.estadoCliente,
                  "country": "BR"
                }
              }
            }
          }
        ]
      };

      const options = {
        method: 'POST',
        uri: 'https://api.pagar.me/core/v5/orders',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${pagarmeKeyProd}:`).toString('base64'),
          'Content-Type': 'application/json'
        },
        body: body,
        json: true
      };
      rp(options)
      .then(response => {
        console.log(response);
        res.status(200).send(response.charges);
      })
      .catch(error => {
        // Handle error response
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Request failed with status code', error.response.statusCode);
          console.error('Response body:', error.response.body);
        }
        res.status(500).send("Transação falhada!");
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
      await atualizarStatusPedido(pedidoId, 'Aguardando');
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
    await atualizarStatusPedido(idPedido, 'Aguardando');
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