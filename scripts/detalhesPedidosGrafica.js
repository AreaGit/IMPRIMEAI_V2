let tipoEntrega;
let idPedidoGlobal;
let nomeGrafica;
let nomeLoja;

const btnAceitarPedido = document.getElementById('btnAceitarPedido');
const btnCancelarPedido = document.getElementById('btnCancelarPedido');
const avisoEntregue = document.getElementById('avisoEntregue');
const produtoInfo = document.getElementById('produto-info');

// ---------------------------
// Função para buscar nome da gráfica
// ---------------------------
async function carregarInfoUsers() {
  try {
    const res = await fetch('/perfilGrafica/dados');
    if (!res.ok) throw new Error('Erro ao buscar os dados da gráfica');
    const data = await res.json();
    nomeGrafica = data.userCad;
  } catch (err) {
    console.error('Erro ao buscar nome da gráfica', err);
  }
}
carregarInfoUsers();

// ---------------------------
// Função para buscar imagem do produto
// ---------------------------
async function pegarImagemProduto(idProduto, tipo) {
  try {
    const url = tipo === "Empresas" ? `/imagens-empresa/${idProduto}` : `/imagens/${idProduto}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao obter a imagem do produto');
    const data = await res.json();
    return data.imgProdUrl || null;
  } catch (err) {
    console.error('Erro ao carregar a imagem:', err);
    return null;
  }
}

// ---------------------------
// Função para renderizar os produtos do pedido
// ---------------------------
async function renderProdutosPedido(produtos, nomeCliente) {
  produtoInfo.innerHTML = ''; // Limpa conteúdo

  for (const item of produtos) {
    const imgUrl = await pegarImagemProduto(item.idProduto, item.tipo);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'itensProduto';

    itemDiv.innerHTML = `
      <img src="${imgUrl}" alt="${item.nomeProd}">
      <h2>${item.nomeProd}</h2>
      <p><strong>Id do Pedido:</strong> ${item.idPed}</p>
      <p><strong>Quantidade:</strong> ${item.quantidade}</p>
      <p><strong>Valor:</strong> R$${item.valorProd}</p>
      <p><strong>Nome do Cliente:</strong> ${nomeCliente}</p>
      <p><strong>Material:</strong> ${item.material || '-'}</p>
      <p><strong>Formato:</strong> ${item.formato || '-'}</p>
      <p><strong>Acabamento:</strong> ${item.acabamento || '-'}</p>
      <p><strong>Cor:</strong> ${item.cor || '-'}</p>
      <p><strong>Enobrecimento:</strong> ${item.enobrecimento || '-'}</p>
      <a href="${item.linkDownload || item.arteEmpresas}" target="_blank">Clique Aqui para Baixar a Arte</a>
    `;

    produtoInfo.appendChild(itemDiv);
  }
}

// ---------------------------
// Função para renderizar endereços do pedido
// ---------------------------
function renderEnderecos(enderecos, nomeCliente) {
  const detalhesEntrega = document.createElement('div');
  detalhesEntrega.className = 'detalhesEntrega';

  enderecos.forEach(endereco => {
    let enderecoHTML = `
      <h2>Dados da Entrega</h2>
      <p><strong>Endereço:</strong> ${endereco.tipoEntrega === 'Entrega a Retirar na Loja' ? 'Retirar na Loja' : `${endereco.rua}, ${endereco.cep}, ${endereco.estado}`}</p>
      <p><strong>Número:</strong> ${endereco.numero || '-'}</p>
      <p><strong>Complemento:</strong> ${endereco.complemento || '-'}</p>
      <p><strong>Bairro:</strong> ${endereco.bairro || '-'}</p>
      <p><strong>Cidade:</strong> ${endereco.cidade || '-'}</p>
      <p><strong>Protocolo Completo:</strong> <a href="/graficas/protocolo-entrega?id=${idPedidoGlobal}" target="_blank">Acesse Aqui</a></p>
    `;
    const divEndereco = document.createElement('div');
    divEndereco.innerHTML = enderecoHTML;

    // Botão gerar protocolo
    const btnProtocolo = document.createElement('a');
    btnProtocolo.href = '#';
    btnProtocolo.textContent = 'Clique Aqui para Baixar o Protocolo de Entrega';
    btnProtocolo.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/gerarProtocoloEntrega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: idPedidoGlobal,
            nomeGrafica,
            cliente: nomeCliente,
            endereco: endereco.rua,
            cidade: endereco.cidade,
            estado: endereco.estado,
            quantidade: enderecos.length,
            item: endereco.idProduto || '',
            observacoes: endereco.observacoes || ''
          }),
        });
        const data = await response.json();
        window.open(data.protocolo.webViewLink);
      } catch (err) {
        console.error('Erro ao gerar protocolo', err);
      }
    });

    divEndereco.appendChild(btnProtocolo);
    detalhesEntrega.appendChild(divEndereco);
  });

  produtoInfo.appendChild(detalhesEntrega);
}

// ---------------------------
// Função principal
// ---------------------------
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  idPedidoGlobal = urlParams.get('idPedido');

  if (!idPedidoGlobal) {
    console.error('ID do pedido não fornecido na URL');
    return;
  }

  try {
    const res = await fetch(`/pedido-detalhes?id=${idPedidoGlobal}`);
    const data = await res.json();

    if (data.message) {
      produtoInfo.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    tipoEntrega = data.enderecos[0]?.tipoEntrega;
    nomeLoja = data.loja;

    await renderProdutosPedido(data.produtos, data.nomeCliente);
    renderEnderecos(data.enderecos, data.nomeCliente);

    // Ajustar botões conforme status do pedido
    const statusAtual = data.produtos[0].statusPed;
    let novoStatus = '';
    if (statusAtual === "Recebido") novoStatus = "Em produção";
    else if (statusAtual === "Em produção") novoStatus = "Finalizado/Enviado para Transporte";
    else if (statusAtual === "Finalizado/Enviado para Transporte") novoStatus = "Entregue";

    if (statusAtual === "Finalizado/Enviado para Transporte") {
      btnAceitarPedido.textContent = "Enviar Pedido";
      btnCancelarPedido.style.display = 'none';
    }
    if (statusAtual === "Entregue") {
      btnAceitarPedido.style.display = 'none';
      btnCancelarPedido.style.display = 'none';
      avisoEntregue.style.display = 'block';
    }

    // ---------------------------
    // Aceitar / avançar status
    // ---------------------------
    btnAceitarPedido.addEventListener('click', async () => {
      try {
        const response = await fetch('/atualizar-status-pedido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: idPedidoGlobal, novoStatus, tipoPed: tipoEntrega === "Múltiplos Enderecos" ? "Mult" : "Norm" }),
        });
        const result = await response.json();
        if (result.success) window.location.href = '/graficas/painel';
      } catch (err) {
        console.error('Erro ao atualizar status', err);
      }
    });

    // ---------------------------
    // Cancelar pedido
    // ---------------------------
    btnCancelarPedido.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja cancelar o pedido?')) return;
      try {
        const graficaId = document.cookie.replace(/(?:(?:^|.*;\s*)graficaId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        const response = await fetch(`/cancelar-pedido/${idPedidoGlobal}/${graficaId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPedido: idPedidoGlobal }),
        });
        const result = await response.json();
        if (result.success) window.location.href = '/graficas/painel';
      } catch (err) {
        console.error('Erro ao cancelar pedido', err);
      }
    });

  } catch (err) {
    console.error('Erro ao carregar detalhes do pedido', err);
    produtoInfo.innerHTML = `<p>Erro ao carregar detalhes do pedido.</p>`;
  }
});
