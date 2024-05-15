let tipoEntrega;
let pId
let novoStatusPedido
const btnAceitarPedido = document.getElementById('btnAceitarPedido');
const btnCancelarPedido = document.getElementById('btnCancelarPedido')
document.addEventListener('DOMContentLoaded', async() => { 
  // Obtém o ID do pedido e do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get('idPedido');
  const idProduto = urlParams.get('idProduto');
  const produtoInfo = document.getElementById('produto-info');

  // Verifica se o ID do pedido e do produto estão presentes na URL
  if (idPedido && idProduto) {
    // Faz a requisição para o servidor para obter os detalhes do pedido
    fetch(`/detalhes-pedido/${idPedido}/${idProduto}`)
    .then(response => response.json())
    .then(data => {
    const detalhesPedido = data.pedido;
    const detalhesUsuario = data.usuario;
    const statusPedido = detalhesPedido.itenspedidos[0].statusPed;
    console.log(statusPedido)
    if(statusPedido == "Aguardando") {
      novoStatusPedido = "Pedido Aceito Pela Gráfica";
    }else if(statusPedido == "Pedido Aceito Pela Gráfica") {
      novoStatusPedido = "Finalizado";
      btnAceitarPedido.textContent = "Finalizar Pedido"
      btnCancelarPedido.style.display = 'none'
    }else if(statusPedido == "Finalizado") {
      novoStatusPedido = "Pedido Enviado pela Gráfica";
      btnAceitarPedido.textContent = "Enviar Pedido"
      btnCancelarPedido.style.display = 'none'
    }else if(statusPedido == "Pedido Enviado pela Gráfica") {
      novoStatusPedido = "Pedido Entregue pela Gráfica";
      btnAceitarPedido.textContent = "Pedido Entregue"
      btnCancelarPedido.style.display = 'none'
    }else if(statusPedido == "Pedido Entregue pela Gráfica") {
      btnAceitarPedido.style.display = 'none'
      btnCancelarPedido.style.display = 'none'
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

    if(tipoEntrega === 'Entrega a Retirar na Loja') {
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
            const novoStatus = 'Pedido Aceito Pela Gráfica';
            // Envia uma requisição para o servidor para atualizar o status
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
                // Verifica se a atualização foi bem-sucedida
                if (!response.ok) {
                  throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
                }
                // Exibe uma mensagem ou realiza outras ações conforme necessário
                const data = await response.json();
                  if (data.success) {
                    console.log('Pedido aceito com sucesso!');
                    setTimeout( () =>{
                      window.location.href = '/pedidos';
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
              window.location.href = '/pedidos';
      
              // Verifica se o novo status é 'Pedido Aceito Pela Gráfica'
              if (data.novoStatus === 'Pedido Aceito Pela Gráfica') {
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

        detalhesItens.innerHTML = `
            <img src="/imagens/${idProduto}"></img>
            <h2>${detalhesPedido.itenspedidos[0].nomeProd}</h2>
            <p class="idPed"><strong>Id do Pedido:</strong> ${detalhesPedido.id}</p>
            <p class="quantPed"><strong>Quantidade:</strong> ${detalhesPedido.itenspedidos[0].quantidade}</p>
            <p class="valorPed"><strong>Valor:</strong> R$${detalhesPedido.valorPed.toFixed(2)}</p>
            <p class="nomeDest"><strong>Nome do Destinatário:</strong> ${detalhesUsuario.userCad}</p>
            <p class=""><strong>Material:</strong> ${variacoesProduto.material}</p>
            <p class=""><strong>Formato:</strong> ${variacoesProduto.formato}</p>
            <p class=""><strong>Acabamento:</strong> ${variacoesProduto.acabamento}</p>
            <p class=""><strong>Cor:</strong> ${variacoesProduto.cor}</p>
            <p class=""><strong>Enobrecimento:</strong> ${variacoesProduto.enobrecimento}</p>
            <a href="${detalhesPedido.itenspedidos[0].linkDownload}" target="_blank">Clique Aqui para Baixar</a>
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
              } else {
                console.error('Endereço não encontrado no pedido.');
              }
            produtoInfo.appendChild(detalhesEntrega);
          });
        }
    });

    // Defina uma variável global para armazenar os cookies
    let cookies;
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('idPedido');

    // Função para obter o ID da gráfica dos cookies
    function getGraficaIdFromCookies() {
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
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

        const response = await fetch(`/cancelar-pedido/${idPedido}/${idGrafica}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idPedido: pId,
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
            window.location.href = '/pedidos'
          }, 3000)
          // Redirecione ou faça outras ações necessárias após o cancelamento
        } else {
          console.error('Erro ao cancelar pedido:', data.message);
        }
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
      }
    });