let tipoEntrega;
let pId
let novoStatusPedido
let idPedMult
let nomeGrafica;
let tipo;
let nomeEmpresa;
let nomeGerente;
const btnAceitarPedido = document.getElementById('btnAceitarPedido');
const btnCancelarPedido = document.getElementById('btnCancelarPedido');
const formEntrega = document.getElementById('formEntrega');
const btnConfEnt = document.getElementById('btnConfEnt');
const avisoEntregue = document.getElementById('avisoEntregue');
const carregamento = document.getElementById('carregamento');
async function carregarInfoUsers() {
  try {
      const response = await fetch('/perfilGrafica/dados');
      if (!response.ok) {
          throw new Error('Erro ao buscar os dados do usuário');
      }

      const data = await response.json();
      nomeGrafica = data.userCad;
  } catch (error) {
      console.log("erro ao buscar nome");
  }
}
carregarInfoUsers();
document.addEventListener('DOMContentLoaded', async() => { 
  // Obtém o ID do pedido e do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get('idPedido');
  const idProduto = urlParams.get('idProduto');
  const produtoInfo = document.getElementById('produto-info');

  if (idPedido && idProduto) {
    try {
      // Faz a requisição para o servidor para obter os detalhes do pedido
      const response = await fetch(`/detalhes-pedido/${idPedido}/${idProduto}`);
      const data = await response.json();
      if(data.usuario.nomeGerente) {
        nomeGerente = data.usuario.nomeGerente;
        console.log(nomeGerente)
      }
      if(data.usuario.empresa) {
        nomeEmpresa = data.usuario.empresa;
        console.log(nomeEmpresa)
      }
    const detalhesPedido = data.pedido;
    const detalhesUsuario = data.usuario;
    const statusPedido = detalhesPedido.itenspedidos[0].statusPed;
    tipo = detalhesPedido.itenspedidos[0].tipo;
    idPedMult = detalhesPedido.itenspedidos[0].id;
    if(statusPedido == "Recebido") {
      novoStatusPedido = "Em produção";
    }else if(statusPedido == "Em produção") {
      novoStatusPedido = "Finalizado/Enviado para Transporte";
      btnAceitarPedido.textContent = "Finalizar Pedido"
      btnCancelarPedido.style.display = 'none'
    }else if(statusPedido == "Finalizado/Enviado para Transporte") {
      novoStatusPedido = "Entregue";
      btnAceitarPedido.textContent = "Enviar Pedido"
      btnCancelarPedido.style.display = 'none'
    }else if(statusPedido == "Entregue") {
      btnAceitarPedido.style.display = 'none'
      btnCancelarPedido.style.display = 'none'
      document.getElementById('avisoEntregue').style.display = 'block'
    } 
    // Exibe as variações do produto no console.log do HTML
    if (detalhesPedido.itenspedidos && detalhesPedido.itenspedidos.length > 0) {
      const variacoesProduto = detalhesPedido.itenspedidos[0];
    } else {
      console.log('Variações do Produto não encontradas no pedido.');
    }
    const variacoesProduto = detalhesPedido.itenspedidos[0]
    tipoEntrega = detalhesPedido.enderecos[0].tipoEntrega;
    const detalhesItens = document.createElement('div');
    detalhesItens.id = `detalhesItens${data.pedido.id}`
    detalhesItens.className = 'itensProduto'
    console.log(statusPedido , tipoEntrega)
    if(statusPedido == "Finalizado/Enviado para Transporte") {
      btnAceitarPedido.addEventListener('click', () => {
        formEntrega.style.display = 'block';
      });
    }else if(tipoEntrega === "Múltiplos Enderecos") {
      const btnAceitarPedido = document.getElementById('btnAceitarPedido') 
      btnAceitarPedido.addEventListener('click', async () => {
          try {
            const idPedido = detalhesPedido.itenspedidos[0].id;
            const novoStatus = novoStatusPedido;
            // Envia uma requisição para o servidor para atualizar o status
            const response = await fetch('/atualizar-status-pedido', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
                body: JSON.stringify({
                  pedidoId: idPedido,
                  novoStatus: novoStatus,
                  tipoPed: "Mult",
                }),
              });
                // Verifica se a atualização foi bem-sucedida
              if (!response.ok) {
                 throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
              }
              // Exibe uma mensagem ou realiza outras ações conforme necessário
              const data = await response.json();
              if (data.success) {
                console.log('Pedido aceito com sucesso!');
                setTimeout( () =>{
                  window.location.href = '/graficas/painel';
                },3000);
                // Verifica se o novo status é 'Pedido Aceito Pela Gráfica'
                if (data.novoStatus === 'Pedido Aceito Pela Gráfica') {
                } else {
                  // Adicione código aqui para outras ações quando o status não é 'Pedido Aceito Pela Gráfica'
                }
              } else {
                console.error('Erro ao aceitar pedido:', data.message);
              }
            } catch (error) {
              console.error('Erro ao aceitar pedido:', error);
            }
        });
    }else if (statusPedido === 'Em produção' || 'Finalizado/Enviado para Transporte' && tipoEntrega === 'Entrega a Retirar na Loja') {
      const btnAceitarPedido = document.getElementById('btnAceitarPedido');
      
      btnAceitarPedido.addEventListener('click', async () => {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const idPedido = urlParams.get('idPedido');
          const novoStatus = novoStatusPedido;
    
          // Envia uma requisição para o servidor para atualizar o status
          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pedidoId: idPedido,
              novoStatus: novoStatus,
              tipoPed: "Norm",
            }),
          });
    
          // Verifica se a atualização foi bem-sucedida
          if (!response.ok) {
            throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
          }
    
          // Exibe uma mensagem ou realiza outras ações conforme necessário
          const data = await response.json();
          if (data.success) {
            console.log('Pedido aceito com sucesso!');
            window.location.href = '/graficas/painel';
    
            // Verifica se o novo status é 'Pedido Aceito Pela Gráfica'
            if (data.novoStatus === 'Em produção') {
              // Redireciona o usuário para a nova página
               // Substitua '/pagina-nova' pela rota desejada
            } else {
              // Adicione código aqui para outras ações quando o status não é 'Pedido Aceito Pela Gráfica'
            }
          } else {
            console.error('Erro ao aceitar pedido:', data.message);
          }
    
        } catch (error) {
          console.error('Erro ao aceitar pedido:', error);
        }
        });
    }
    else if(tipoEntrega === 'Entrega a Retirar na Loja') {
      console.log(1)
      const btnAceitarPedido = document.getElementById('btnAceitarPedido') 
      btnAceitarPedido.addEventListener('click', async () => {
      console.log('ATUALIZANDO ENDERECO DE ENTREGA')
      const urlParams = new URLSearchParams(window.location.search);
      const idPedido = urlParams.get('idPedido');
      const idProduto = urlParams.get('idProduto');
      const responseEndereco = await fetch('/atualizar-endereco-entrega', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            pedidoId: idPedido
          })
        });
        try {
          if (!responseEndereco.ok) {
            throw new Error(`Erro ao enviar: ${responseEndereco.statusText}`);
          }else {
            console.log('BOM')
          }
          } catch (error) {
            console.log('RUIM')
            throw new Error(`Erro ao enviar: ${responseEndereco.statusText}`);
          }
          try {
            console.log('ACEITANDO PEDIDO');
            const urlParams = new URLSearchParams(window.location.search);
            const idPedido = urlParams.get('idPedido');
            const novoStatus = 'Em produpção';
            // Envia uma requisição para o servidor para atualizar o status
            const response = await fetch('/atualizar-status-pedido', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
                body: JSON.stringify({
                  pedidoId: idPedido,
                  novoStatus: novoStatus,
                  tipoPed: "Norm",
                }),
              });
                // Verifica se a atualização foi bem-sucedida
              if (!response.ok) {
                 throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
              }
              // Exibe uma mensagem ou realiza outras ações conforme necessário
              const data = await response.json();
              if (data.success) {
                console.log('Pedido aceito com sucesso!');
                setTimeout( () =>{
                  window.location.href = '/graficas/painel';
                },3000);
                // Verifica se o novo status é 'Pedido Aceito Pela Gráfica'
                if (data.novoStatus === 'Em produção') {
                } else {
                  // Adicione código aqui para outras ações quando o status não é 'Pedido Aceito Pela Gráfica'
                }
              } else {
                console.error('Erro ao aceitar pedido:', data.message);
              }
            } catch (error) {
              console.error('Erro ao aceitar pedido:', error);
            }
        });
      }else {
        console.log(2)
        const btnAceitarPedido = document.getElementById('btnAceitarPedido');
      
        btnAceitarPedido.addEventListener('click', async () => {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const idPedido = urlParams.get('idPedido');
            const novoStatus = novoStatusPedido;
      
            // Envia uma requisição para o servidor para atualizar o status
            const response = await fetch('/atualizar-status-pedido', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pedidoId: idPedido,
                novoStatus: novoStatus,
                tipoPed: "Norm",
              }),
            });
      
            // Verifica se a atualização foi bem-sucedida
            if (!response.ok) {
              throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
            }
      
            // Exibe uma mensagem ou realiza outras ações conforme necessário
            const data = await response.json();
            if (data.success) {
              console.log('Pedido aceito com sucesso!');
              window.location.href = '/graficas/painel';
      
              // Verifica se o novo status é 'Pedido Aceito Pela Gráfica'
              if (data.novoStatus === 'Em produção') {
                // Redireciona o usuário para a nova página
                 // Substitua '/pagina-nova' pela rota desejada
              } else {
                // Adicione código aqui para outras ações quando o status não é 'Pedido Aceito Pela Gráfica'
              }
            } else {
              console.error('Erro ao aceitar pedido:', data.message);
            }
      
          } catch (error) {
            console.error('Erro ao aceitar pedido:', error);
          }
          });
        }      
        const imgUrl = await pegarImagemProduto(idProduto);
        detalhesItens.innerHTML = `
            <img src="${imgUrl}"></img>
            <h2>${detalhesPedido.itenspedidos[0].nomeProd}</h2>
            <p class="idPed"><strong>Id do Pedido:</strong> ${detalhesPedido.id}</p>
            <p class="quantPed"><strong>Quantidade:</strong> ${detalhesPedido.itenspedidos[0].quantidade}</p>
            <p class="valorPed"><strong>Valor:</strong> R$${detalhesPedido.itenspedidos[0].valorProd}</p>
            <p class="nomeDest"><strong>Nome do Destinatário:</strong> ${detalhesUsuario.userCad}</p>
            <p class=""><strong>Material:</strong> ${variacoesProduto.material}</p>
            <p class=""><strong>Formato:</strong> ${variacoesProduto.formato}</p>
            <p class=""><strong>Acabamento:</strong> ${variacoesProduto.acabamento}</p>
            <p class=""><strong>Cor:</strong> ${variacoesProduto.cor}</p>
            <p class=""><strong>Enobrecimento:</strong> ${variacoesProduto.enobrecimento}</p>
            <a href="${detalhesPedido.itenspedidos[0].linkDownload !== null ? detalhesPedido.itenspedidos[0].linkDownload : detalhesPedido.itenspedidos[0].arteEmpresas}" target="_blank">Clique Aqui para Baixar a Arte</a>
            `
        produtoInfo.appendChild(detalhesItens);

            const detalhesEntrega = document.createElement('div');
            detalhesEntrega.id = `detalhesEntrega${data.pedido.id}`
            detalhesEntrega.className = 'detalhesEntrega'
            if (detalhesPedido.enderecos && detalhesPedido.enderecos.length > 0) {
                const tipoEntrega = detalhesPedido.enderecos[0].tipoEntrega;
                if (tipoEntrega === 'Entrega a Retirar na Loja') {
                  detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
                    <h2>Dados da Entrega</h2>
                    <p class="vrEnd"><strong>Endereço:</strong>Entrega a Retirar na Loja</p>
                    <p class="endNum"><strong>Número da Residência:</strong>Entrega a Retirar na Loja</p>
                    <p class="endComp"><strong>Complemento:</strong>Entrega a Retirar na Loja</p>
                    <p class="endBairro"><strong>Bairro:</strong>Entrega a Retirar na Loja</p>
                    <p class="endCid"><strong>Cidade:</strong>Entrega a Retirar na Loja</p>
                  `).join('<br>');
                } else if(nomeEmpresa) {
                  detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
                    <h2>Dados da Entrega</h2>
                    <p class="vrEnd"><strong>Endereço:</strong> ${endereco.rua}, ${endereco.cep}, ${endereco.estado}</p>
                    <p class="endNum"><strong>Número da Residência:</strong> ${endereco.numero}</p>
                    <p class="endComp"><strong>Complemento:</strong> ${endereco.complemento}</p>
                    <p class="endBairro"><strong>Bairro:</strong> ${endereco.bairro}</p>
                    <p class="endCid"><strong>Cidade:</strong> ${endereco.cidade}</p>
                    <p class="endPart"><strong>Observações da Entrega:</strong> ${detalhesUsuario.particularidades}</p>
                  `).join('<br>');
                } else {
                  detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
                    <h2>Dados da Entrega</h2>
                    <p class="vrEnd"><strong>Endereço:</strong> ${endereco.rua}, ${endereco.cep}, ${endereco.estado}</p>
                    <p class="endNum"><strong>Número da Residência:</strong> ${endereco.numero}</p>
                    <p class="endComp"><strong>Complemento:</strong> ${endereco.complemento}</p>
                    <p class="endBairro"><strong>Bairro:</strong> ${endereco.bairro}</p>
                    <p class="endCid"><strong>Cidade:</strong> ${endereco.cidade}</p>
                  `).join('<br>');
                }
                if (detalhesPedido.enderecos && detalhesPedido.enderecos.length > 0) {
                  detalhesPedido.enderecos.forEach(endereco => {
                      let enderecoData
                      const protocoloBtn = document.createElement('a');
                      protocoloBtn.id = 'btnGerarProtocolo';
                      protocoloBtn.href = '#';
                      protocoloBtn.textContent = 'Clique Aqui para Baixar o Protocolo de Entrega';
                      detalhesEntrega.appendChild(protocoloBtn);
              
                      protocoloBtn.addEventListener('click', async () => {
                        if(nomeEmpresa) {
                          enderecoData = {
                            id: detalhesPedido.id,
                            nomeGrafica: nomeGrafica,
                            nomeEmpresa: nomeEmpresa,
                            nomeGerente: nomeGerente,
                            cliente: detalhesUsuario.userCad,
                            endereco: detalhesPedido.enderecos[0].rua,
                            cidade: detalhesPedido.enderecos[0].cidade,
                            estado: detalhesPedido.enderecos[0].estado,
                            responsavel: detalhesUsuario.userCad,
                            quantidade: detalhesPedido.itenspedidos[0].quantidade,
                            item: detalhesPedido.itenspedidos[0].nomeProd,
                            observacoes: detalhesUsuario.particularidades
                          }
                        } else {
                        enderecoData = {
                          id: detalhesPedido.id,
                          nomeGrafica: nomeGrafica,
                          nomeEmpresa: nomeEmpresa,
                          nomeGerente: nomeGerente,
                          cliente: detalhesUsuario.userCad,
                          endereco: detalhesPedido.enderecos[0].rua,
                          cidade: detalhesPedido.enderecos[0].cidade,
                          estado: detalhesPedido.enderecos[0].estado,
                          responsavel: detalhesUsuario.userCad,
                          quantidade: detalhesPedido.itenspedidos[0].quantidade,
                          item: detalhesPedido.itenspedidos[0].nomeProd,
                        }
                      }
                        try {
                          // Mudando o método de GET para POST e serializando os dados
                          const response = await fetch('/gerarProtocoloEntrega', {
                            method: 'POST',  // Agora é POST
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(enderecoData),  // Certificando-se de que os dados sejam passados como JSON
                          });
                      
                          // Verificando se a resposta foi bem-sucedida
                          if (response.ok) {
                            const data = await response.json();  // Processa a resposta como JSON
                            console.log('Protocolo gerado com sucesso:', data);
                            window.open(data.protocolo.webViewLink);
                            // Aqui você pode tratar a resposta, como exibir uma mensagem de sucesso ou fazer outra ação
                          } else {
                            console.error('Erro ao gerar o protocolo:', response.statusText);
                          }
                        } catch (err) {
                          console.log('Erro ao tentar enviar a requisição:', err);
                        }
                      });
                  });
              }              
              } else {
                console.error('Endereço não encontrado no pedido.');
              }
            produtoInfo.appendChild(detalhesEntrega);
          
          } catch (error) {
            console.error('Erro ao obter detalhes do pedido:', error);
          }
        }
      });

      async function pegarImagemProduto(idProduto) {
        if(tipo == "Empresas") {
          try {
            const imgResponse = await fetch(`/imagens-empresa/${idProduto}`);
            if (!imgResponse.ok) {
              throw new Error('Erro ao obter a URL da imagem do produto');
            }
            const imgData = await imgResponse.json();
            return imgData.imgProdUrl;
          } catch (error) {
            console.error('Erro ao carregar a imagem:', error);
            return null;
          }
        } else {
        try {
          const imgResponse = await fetch(`/imagens/${idProduto}`);
          if (!imgResponse.ok) {
            throw new Error('Erro ao obter a URL da imagem do produto');
          }
          const imgData = await imgResponse.json();
          return imgData.imgProdUrl;
        } catch (error) {
          console.error('Erro ao carregar a imagem:', error);
          return null;
        }
      }
      }

    // Defina uma variável global para armazenar os cookies
    let cookies;
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('idPedido');

    // Função para obter o ID da gráfica dos cookies
    function getGraficaIdFromCookies() {
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'graficaId') {
          console.log('ID da Gráfica nos Cookies:', value);
          return value;
        }
      }
      console.log('ID da Gráfica não encontrado nos Cookies.');
      return null;
    }

    // Função para obter todos os cookies e atribuí-los à variável global
    function getAllCookies() {
      cookies = document.cookie.split(';');
    }

    // Exemplo de chamada da função para obter todos os cookies
    getAllCookies();

    // Modificação para acessar o valor do cookie 'userId'
    // Obtenha o ID da gráfica dos cookies
    const graficaId = getGraficaIdFromCookies();

    console.log(`Id da gráfica ${graficaId} id do pedido ${idPedido}`);


    btnCancelarPedido.addEventListener('click', async () => {
        // Prompt de confirmação
        const confirmacao = window.confirm('Tem certeza que deseja Cancelar o Pedido?');
        // Verifique se o usuário confirmou
        if (!confirmacao) {
          return; // Se o usuário clicou em "Cancelar", saia da função
        }
      try {
        const idGrafica = graficaId;
        let idPedidoCancl
        if(tipoEntrega === "Múltiplos Enderecos") {
           idPedidoCancl = idPedMult;
        }else {
           idPedidoCancl = urlParams.get('idPedido');
        }

        const response = await fetch(`/cancelar-pedido/${idPedido}/${idGrafica}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idPedido: idPedidoCancl,
            graficaId: graficaId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao cancelar pedido: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          console.log('Pedido cancelado com sucesso!');
          setTimeout(() => {
            window.location.href = '/graficas/painel';
          }, 3000)
          // Redirecione ou faça outras ações necessárias após o cancelamento
        } else {
          console.error('Erro ao cancelar pedido:', data.message);
        }
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
      }
    });

    btnConfEnt.addEventListener('click', async () => {
      carregamento.style.display = 'block';
      const recEnt = document.getElementById('recEnt').value;
      const horEnt = document.getElementById('horEnt').value;
      const fotoEnt = document.getElementById('fotoEnt').files[0];
      const produtoEnt = document.getElementById('produtoEnt').files[0];
      const protocoloEnt = document.getElementById('protocoloEnt').files[0];
      const currentPedidoId = urlParams.get('idPedido');
      const obsEnt = document.getElementById('obsEnt').value;
      const formData = new FormData();
      formData.append('recEnt', recEnt);
      formData.append('horEnt', horEnt);
      formData.append('fotoEnt', fotoEnt);
      formData.append('produtoEnt', produtoEnt);
      formData.append('protocoloEnt', protocoloEnt);
      formData.append('pedidoId', currentPedidoId);
      formData.append('tipo', tipo);
      formData.append('obsEnt', obsEnt);

      try {
          const response = await fetch('/dadosEntrega', {
              method: 'POST',
              body: formData
          });

          if (!response.ok) {
              throw new Error(`Erro ao enviar dados: ${response.statusText}`);
          }

          console.log('Dados enviados com sucesso!');
          // Faça qualquer ação necessária após o envio dos dados
          try {
          const idPedido = currentPedidoId;
          const novoStatus = 'Entregue';

          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pedidoId: idPedido,
              novoStatus: novoStatus,
            }),
          });

          if (!response.ok) {
            throw new Error(`Erro ao enviar pedido: ${response.statusText}`);
          }

          // Redirect to after updating the order status
          window.setTimeout(() => {
            carregamento.style.display = 'none';
            window.location.href = '/graficas/painel';
          },5000)
         

        } catch (error) {
          console.error('Erro ao enviar pedido:', error);
        }
      } catch (error) {
          console.error('Erro ao enviar dados:', error);
      }
  });