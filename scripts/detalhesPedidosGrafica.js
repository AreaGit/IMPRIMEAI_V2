// painel-detalhes-pedido.js
// Versão reorganizada — mantém todas as condições e textos do seu código,
// mas corrige bugs, evita listeners duplicados e renderiza TODOS os itens do pedido.

window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  loading.style.opacity = "0";
  loading.style.transition = "opacity 0.4s ease";

  setTimeout(() => {
    loading.style.display = "none";
  }, 400);
});

// ====================================
// FUNÇÃO PARA ATIVAR/DESATIVAR LOADING
// ====================================
const loading = document.getElementById("loading-screen");

function showLoading() {
  loading.classList.add("active");
}

function hideLoading() {
  loading.classList.remove("active");
}

let tipoEntrega;
let pId;
let novoStatusPedido;
let idPedMult;
let nomeGrafica;
let tipo;
let nomeEmpresa;
let nomeGerente;

// Elementos da UI (assume que existem no HTML)
const btnAceitarPedido = document.getElementById('btnAceitarPedido');
const btnCancelarPedido = document.getElementById('btnCancelarPedido');
const formEntrega = document.getElementById('formEntrega');
const btnConfEnt = document.getElementById('btnConfEnt');
const avisoEntregue = document.getElementById('avisoEntregue');
const carregamento = document.getElementById('carregamento');
const produtoInfo = document.getElementById('produto-info'); // container onde vamos injetar os cards
const detalhesContainer = produtoInfo; // alias

// =======================================
// Carrega info da gráfica/usuario (nome)
// =======================================
async function carregarInfoUsers() {
  try {
    const response = await fetch('/perfilGrafica/dados');
    if (!response.ok) throw new Error('Erro ao buscar os dados do usuário');
    const data = await response.json();
    nomeGrafica = data.userCad;
  } catch (err) {
    console.warn('Erro ao carregar dados da gráfica:', err);
  }
}
carregarInfoUsers();
// ================================
// Util: pega graficaId de cookies
// ================================
function getGraficaIdFromCookies() {
  const raw = document.cookie || '';
  const cookies = raw.split(';').map(c => c.trim());
  for (const c of cookies) {
    const [name, ...rest] = c.split('=');
    const value = rest.join('=');
    if (name === 'graficaId') return value;
  }
  return null;
}

function setDisplay(el, show) {
  if (!el) return;
  el.style.display = show ? '' : 'none';
}
// =========================================================
// Faz fetch da imagem do item (mantive sua lógica de rotas)
// =========================================================
async function pegarImagemProdutoPorItem(item) {
  // item pode ter idProduto ou id
  const idProduto = item.idProduto || item.id || item.ProdutosId || item.produtosId;
  try {
    if (tipo === 'Empresas') {
      const resp = await fetch(`/imagens-empresa/${idProduto}`);
      if (!resp.ok) throw new Error('img empresa não encontrada');
      const json = await resp.json();
      return json.imgProdUrl || null;
    } else {
      const resp = await fetch(`/imagens/${idProduto}`);
      if (!resp.ok) throw new Error('img produto não encontrada');
      const json = await resp.json();
      return json.imgProdUrl || null;
    }
  } catch (err) {
    console.warn('Erro ao buscar imagem do produto:', err);
    return null;
  }
}
// =======================================================
// Função para renderizar todos os itens do pedido (cards)
// =======================================================
async function renderTodosItens(detalhesPedido, detalhesUsuario) {
  // limpeza
  produtoInfo.innerHTML = '';

  const itens = Array.isArray(detalhesPedido.itenspedidos) ? detalhesPedido.itenspedidos : [];

  if (itens.length === 0) {
    produtoInfo.innerHTML = `<p>Nenhum item encontrado neste pedido.</p>`;
    return;
  }

  // Para buscar imagens em paralelo
  const imagensPromises = itens.map(it => pegarImagemProdutoPorItem(it));
  const imagens = await Promise.all(imagensPromises);

  itens.forEach((item, idx) => {
    const imgUrl = imagens[idx] || '';
    const card = document.createElement('div');
    card.className = 'produto-card card-pedido'; // reaproveita estilo

    // Mantenho exatamente os campos que você utilizava (nomeProd, quantidade, valorProd, material, etc.)
    const nomeProd = item.nomeProd || item.produtoNome || item.nome || 'Produto';
    const quantidade = item.quantidade || item.qtd || 1;
    const valor = item.valorProd != null ? item.valorProd : (item.valor || '—');
    const material = item.material || item.materialProd || '';
    const formato = item.formato || '';
    const acabamento = item.acabamento || '';
    const cor = item.cor || '';
    const enobrecimento = item.enobrecimento || '';
    const linkDownload = item.linkDownload || item.arteEmpresas || '#';

    card.innerHTML = `
      ${imgUrl ? `<img src="${imgUrl}" alt="${nomeProd}">` : ''}
      <h3 style="margin:0 0 .25rem 0;">${nomeProd}</h3>
      <p class="idPed"><strong>Id do Pedido:</strong> ${detalhesPedido.id}</p>
      <p class="quantPed"><strong>Quantidade:</strong> ${quantidade}</p>
      <p class="valorPed"><strong>Valor:</strong> R$ ${valor}</p>
      <p class="nomeDest"><strong>Nome do Destinatário:</strong> ${detalhesUsuario.userCad || '-'}</p>
      <p><strong>Material:</strong> ${material}</p>
      <p><strong>Formato:</strong> ${formato}</p>
      <p><strong>Acabamento:</strong> ${acabamento}</p>
      <p><strong>Cor:</strong> ${cor}</p>
      <p><strong>Enobrecimento:</strong> ${enobrecimento}</p>
      <p><a href="${linkDownload}" target="_blank">Clique Aqui para Baixar a Arte</a></p>
    `;

    produtoInfo.appendChild(card);
  });
}
// =======================================================================
// Mantém comportamento original de montar detalhes de entrega e protocolo
// =======================================================================
function montarDetalhesEntrega(detalhesPedido, detalhesUsuario) {
  const detalhesEntrega = document.createElement('div');
  detalhesEntrega.className = 'detalhesEntrega';

  if (!detalhesPedido.enderecos || detalhesPedido.enderecos.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Endereço não encontrado no pedido.';
    detalhesEntrega.appendChild(p);
    return detalhesEntrega;
  }

  const tipoEntregaLocal = detalhesPedido.enderecos[0].tipoEntrega;
  // Montagem conforme seus três caminhos (Retirar na loja / empresa / normal)
  if (tipoEntregaLocal === 'Entrega a Retirar na Loja') {
    detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
      <h2>Dados da Entrega</h2>
      <p class="vrEnd"><strong>Endereço:</strong>Entrega a Retirar na Loja</p>
      <p class="endNum"><strong>Número da Residência:</strong>Entrega a Retirar na Loja</p>
      <p class="endComp"><strong>Complemento:</strong>Entrega a Retirar na Loja</p>
      <p class="endBairro"><strong>Bairro:</strong>Entrega a Retirar na Loja</p>
      <p class="endCid"><strong>Cidade:</strong>Entrega a Retirar na Loja</p>
      <p class="protocComp"><strong>Protocolo Completo: </strong> <a href="/graficas/protocolo-entrega?id=${detalhesPedido.id}" target="_blank">Acesse Aqui</a></p>
    `).join('<br>');
  } else if (nomeEmpresa) {
    detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
      <h2>Dados da Entrega</h2>
      <p class="vrEnd"><strong>Endereço:</strong> ${endereco.rua}, ${endereco.cep}, ${endereco.estado}</p>
      <p class="endNum"><strong>Número da Residência:</strong> ${endereco.numero}</p>
      <p class="endComp"><strong>Complemento:</strong> ${endereco.complemento}</p>
      <p class="endBairro"><strong>Bairro:</strong> ${endereco.bairro}</p>
      <p class="endCid"><strong>Cidade:</strong> ${endereco.cidade}</p>
      <p class="endPart"><strong>Observações da Entrega:</strong> ${detalhesUsuario.particularidades || ''}</p>
      <p class="protocComp"><strong>Protocolo Completo: </strong> <a href="/graficas/protocolo-entrega?id=${detalhesPedido.id}" target="_blank">Acesse Aqui</a></p>
    `).join('<br>');
  } else {
    detalhesEntrega.innerHTML = detalhesPedido.enderecos.map(endereco => `
      <h2>Dados da Entrega</h2>
      <p class="vrEnd"><strong>Endereço:</strong> ${endereco.rua}, ${endereco.cep}, ${endereco.estado}</p>
      <p class="endNum"><strong>Número da Residência:</strong> ${endereco.numero}</p>
      <p class="endComp"><strong>Complemento:</strong> ${endereco.complemento}</p>
      <p class="endBairro"><strong>Bairro:</strong> ${endereco.bairro}</p>
      <p class="endCid"><strong>Cidade:</strong> ${endereco.cidade}</p>
      <p class="protocComp"><strong>Protocolo Completo: </strong> <a href="/graficas/protocolo-entrega?id=${detalhesPedido.id}" target="_blank">Acesse Aqui</a></p>
    `).join('<br>');
  }

  // Adiciona botão para gerar protocolo (mantendo seu comportamento)
  detalhesPedido.enderecos.forEach(endereco => {
    const protocoloBtn = document.createElement('a');
    protocoloBtn.id = 'btnGerarProtocolo';
    protocoloBtn.href = '#';
    protocoloBtn.textContent = 'Clique Aqui para Baixar o Protocolo de Entrega';
    protocoloBtn.style.display = 'inline-block';
    protocoloBtn.style.marginTop = '10px';
    detalhesEntrega.appendChild(protocoloBtn);

    protocoloBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Monta enderecoData exatamente como você fazia (mantive os campos)
      let enderecoData;
      if (nomeEmpresa) {
        enderecoData = {
          id: detalhesPedido.id,
          nomeGrafica,
          nomeEmpresa,
          nomeGerente,
          cliente: detalhesUsuario.userCad,
          endereco: detalhesPedido.enderecos[0].rua,
          cidade: detalhesPedido.enderecos[0].cidade,
          estado: detalhesPedido.enderecos[0].estado,
          responsavel: detalhesUsuario.userCad,
          quantidade: detalhesPedido.itenspedidos[0].quantidade,
          item: detalhesPedido.itenspedidos[0].nomeProd,
          observacoes: detalhesUsuario.particularidades
        };
      } else {
        enderecoData = {
          id: detalhesPedido.id,
          nomeGrafica,
          nomeEmpresa,
          nomeGerente,
          cliente: detalhesUsuario.userCad,
          endereco: detalhesPedido.enderecos[0].rua,
          cidade: detalhesPedido.enderecos[0].cidade,
          estado: detalhesPedido.enderecos[0].estado,
          responsavel: detalhesUsuario.userCad,
          quantidade: detalhesPedido.itenspedidos[0].quantidade,
          item: detalhesPedido.itenspedidos[0].nomeProd
        };
      }

      try {
        const response = await fetch('/gerarProtocoloEntrega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enderecoData)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.protocolo && data.protocolo.webViewLink) {
            window.open(data.protocolo.webViewLink);
          } else {
            console.log('Protocolo gerado, mas sem link retornado', data);
          }
        } else {
          console.error('Erro ao gerar o protocolo:', response.statusText);
        }
      } catch (err) {
        console.error('Erro ao tentar enviar a requisição:', err);
      }
    });
  });

  return detalhesEntrega;
}
// ===============================================================
// Função que atualiza os listeners do botão Aceitar sem duplicar
// ===============================================================
function setAceitarListener(callback) {
  if (!btnAceitarPedido) return;
  btnAceitarPedido.onclick = null; // remove handler anterior
  btnAceitarPedido.addEventListener('click', callback);
}
// =======================================================
// Função que atualiza o listener do cancelar sem duplicar
// =======================================================
function setCancelarListener(callback) {
  if (!btnCancelarPedido) return;
  btnCancelarPedido.onclick = null;
  btnCancelarPedido.addEventListener('click', callback);
}
// ===========================================
// MAIN: carrega detalhes do pedido e monta UI
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Pegar params
  const urlParams = new URLSearchParams(window.location.search);
  const idPedidoURL = urlParams.get('idPedido');
  const idProdutoURL = urlParams.get('idProduto'); // ainda usamos essa rota, caso exista

  if (!idPedidoURL) return;

  try {
    // Requisição ao backend (mantive a rota que você usa)
    const endpoint = idProdutoURL
      ? `/detalhes-pedido/${idPedidoURL}/${idProdutoURL}`
      : `/detalhes-pedido/${idPedidoURL}/${idProdutoURL}`; // se backend aceitar só idPedido, manterá compatibilidade

    const resp = await fetch(endpoint);
    if (!resp.ok) throw new Error('Erro ao buscar detalhes do pedido');
    const data = await resp.json();

    const detalhesPedido = data.pedido;
    const detalhesUsuario = data.usuario;

    // Extrai informações iniciais (mantendo seu comportamento)
    tipo = detalhesPedido.itenspedidos[0].tipo;
    idPedMult = detalhesPedido.itenspedidos[0].id; // você usa isso quando tipo "Mult"
    tipoEntrega = (detalhesPedido.enderecos && detalhesPedido.enderecos[0]) ? detalhesPedido.enderecos[0].tipoEntrega : null;

    // guarda nomeEmpresa / nomeGerente (se existirem)
    if (detalhesUsuario) {
      nomeGerente = detalhesUsuario.nomeGerente || nomeGerente;
      nomeEmpresa = detalhesUsuario.empresa || nomeEmpresa;
    }

    // determina status baseando-se no primeiro item (preservei seu comportamento)
    const statusPedido = detalhesPedido.itenspedidos[0].statusPed;
    if (statusPedido === "Recebido") {
      novoStatusPedido = "Em produção";
      btnAceitarPedido.textContent = "Em produção";
    } else if (statusPedido === "Em produção") {
      novoStatusPedido = "Finalizado/Enviado para Transporte";
      if (btnAceitarPedido) btnAceitarPedido.textContent = "Finalizar Pedido";
      if (btnCancelarPedido) btnCancelarPedido.style.display = 'none';
    } else if (statusPedido === "Finalizado/Enviado para Transporte") {
      novoStatusPedido = "Entregue";
      if (btnAceitarPedido) btnAceitarPedido.textContent = "Concluir Pedido";
      if (btnCancelarPedido) btnCancelarPedido.style.display = 'none';
    } else if (statusPedido === "Entregue") {
      if (btnAceitarPedido) btnAceitarPedido.style.display = 'none';
      if (btnCancelarPedido) btnCancelarPedido.style.display = 'none';
      const aviso = document.getElementById('avisoEntregue');
      if (aviso) aviso.style.display = 'block';
    }

    // Se status é 'Finalizado/Enviado para Transporte', abre formEntrega no clique
    if (statusPedido === "Finalizado/Enviado para Transporte") {
      setAceitarListener(() => {
        if (formEntrega) formEntrega.style.display = 'block';
      });
    } else if (tipoEntrega === "Múltiplos Enderecos") {
      // Manter comportamento: quando múltiplos endereços, envia tipoPed "Mult"
      setAceitarListener(async () => {
        try {
          showLoading();
          const idPedidoParaEnviar = detalhesPedido.itenspedidos[0].id; // mantive como estava
          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: idPedidoParaEnviar, novoStatus: novoStatusPedido, tipoPed: "Mult" })
          });
          if (!response.ok) throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
          const respJson = await response.json();
          if (respJson.success) {
            setTimeout(() => { 
              hideLoading();
              window.location.reload();
             }, 2000);
          } else {
            hideLoading();
            console.error('Erro ao aceitar pedido:', respJson.message);
          }
        } catch (err) {
          hideLoading();
          console.error('Erro ao aceitar pedido (Mult):', err);
        }
      });
    } else if ((statusPedido === 'Em produção' || statusPedido === 'Finalizado/Enviado para Transporte') && tipoEntrega === 'Entrega a Retirar na Loja') {
      // caso específico que você tinha
      setAceitarListener(async () => {
        try {
          showLoading();
          const idPedido = idPedidoURL;
          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: idPedido, novoStatus: novoStatusPedido, tipoPed: "Norm" })
          });
          if (!response.ok) throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
          const dataResp = await response.json();
          if (dataResp.success) {
            hideLoading();
            window.location.reload();
          } else {
            hideLoading();
            console.error('Erro ao aceitar pedido:', dataResp.message);
          }
        } catch (err) {
          hideLoading();
          console.error('Erro ao aceitar pedido (Retirar na Loja):', err);
        }
      });
    } else if (tipoEntrega === 'Entrega a Retirar na Loja') {
      // branch com atualizar-endereco-entrega antes de atualizar status
      setAceitarListener(async () => {
        try {
          showLoading();
          // atualizar endereço
          const responseEndereco = await fetch('/atualizar-endereco-entrega', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: idPedidoURL })
          });
          if (!responseEndereco.ok) throw new Error(`Erro ao enviar: ${responseEndereco.statusText}`);
          // em seguida, atualizar status (note que no seu original o novoStatus era "Em produpção" com typo; mantive o valor que você usou na sua branch)
          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: idPedidoURL, novoStatus: 'Em produpção', tipoPed: "Norm" })
          });
          if (!response.ok) throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
          const dataResp = await response.json();
          if (dataResp.success) {
            setTimeout(() => { 
              hideLoading();
              window.location.reload(); 
            }, 3000);
          } else {
            hideLoading();
            console.error('Erro ao aceitar pedido:', dataResp.message);
          }
        } catch (err) {
          hideLoading();
          console.error('Erro no fluxo Retirar na Loja:', err);
        }
      });
    } else {
      // branch padrão (caso nenhum dos anteriores)
      setAceitarListener(async () => {
        try {
          showLoading();
          const idPedido = idPedidoURL;
          const response = await fetch('/atualizar-status-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: idPedido, novoStatus: novoStatusPedido, tipoPed: "Norm" })
          });
          if (!response.ok) throw new Error(`Erro ao aceitar pedido: ${response.statusText}`);
          const dataResp = await response.json();
          if (dataResp.success) {
            hideLoading();
            window.location.reload();
          } else {
            hideLoading();
            console.error('Erro ao aceitar pedido:', dataResp.message);
          }
        } catch (err) {
          hideLoading();
          console.error('Erro ao aceitar pedido (padrão):', err);
        }
      });
    }

    // CANCELAR: mantém seu fluxo e confirmação
    setCancelarListener(async () => {
      const confirmar = window.confirm('Tem certeza que deseja Cancelar o Pedido?');
      if (!confirmar) return;

      try {
        const graficaId = getGraficaIdFromCookies();
        let idPedidoCancl = (tipoEntrega === "Múltiplos Enderecos") ? idPedMult : idPedidoURL;
        const response = await fetch(`/cancelar-pedido/${idPedidoURL}/${graficaId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idPedido: idPedidoCancl, graficaId })
        });
        if (!response.ok) throw new Error(`Erro ao cancelar pedido: ${response.statusText}`);
        const d = await response.json();
        if (d.success) {
          setTimeout(() => { window.location.href = '/graficas/painel'; }, 3000);
        } else {
          console.error('Erro ao cancelar pedido:', d.message);
        }
      } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
      }
    });

    // Renderiza todos os itens (cards)
    await renderTodosItens(detalhesPedido, detalhesUsuario);

    // Monta informações de entrega + protocolo
    const detalhesEntregaEl = montarDetalhesEntrega(detalhesPedido, detalhesUsuario);
    produtoInfo.appendChild(detalhesEntregaEl);

  } catch (err) {
    console.error('Erro ao obter detalhes do pedido:', err);
  }
});

// ==============================
// FORM DE CONFIRMAÇÃO DE ENTREGA
// ==============================
document.getElementById('btnConfEnt').addEventListener('click', async () => {
  const urlParams = new URLSearchParams(window.location.search);
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

    // Faça qualquer ação necessária após o envio dos dados
    try {
      showLoading();
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
        hideLoading();
        window.location.reload();
      },5000)
          
          
      } catch (error) {
        hideLoading();
        console.error('Erro ao enviar pedido:', error);
      }
  } catch (error) {
    hideLoading();
    console.error('Erro ao enviar dados:', error);
  }
});