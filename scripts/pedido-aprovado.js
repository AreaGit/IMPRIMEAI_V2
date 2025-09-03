const colors = ['#F37160','#F69896','#28a745','#FFD700','#00BFFF'];

// Criar confete
function createConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  confetti.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.animationDuration = (2 + Math.random()*3) + 's';
  const size = 5 + Math.random()*10;
  confetti.style.width = confetti.style.height = size + 'px';
  document.body.appendChild(confetti);
  confetti.addEventListener('animationend', () => confetti.remove());
}

// Muitos confetes no início
for(let i=0;i<70;i++) createConfetti();
setInterval(() => createConfetti(), 300);

// ====================
// Buscar detalhes do pedido
// ====================
async function carregarPedido() {
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get("idPed");

  if (!idPedido) {
    document.getElementById("order-info").innerHTML = "<p>Pedido não encontrado.</p>";
    return;
  }

  try {
    const response = await fetch(`/detalhes-pedidoAprovadoUser/${idPedido}`);
    const data = await response.json();

    if (data.error) {
      document.getElementById("order-info").innerHTML = `<p>${data.error}</p>`;
      return;
    }

    // Preencher informações do pedido
    const infoDiv = document.getElementById("order-info");
    infoDiv.innerHTML = `
      <div><span class="label">Número do Pedido:</span> #${data.pedido.id}</div>
      <div><span class="label">Data:</span> ${new Date(data.pedido.data).toLocaleString("pt-BR")}</div>
      <div><span class="label">Pagamento:</span> ${data.pedido.metodo || "Não informado"}</div>
      <div><span class="label">Status:</span> ${data.pedido.status}</div>
    `;

    // Renderizar produtos
    const detailsDiv = document.getElementById("order-details");
    detailsDiv.innerHTML = "";
    let total = 0;

    data.itens.forEach(item => {
      const preco = parseFloat(item.valorProd) * item.quantidade;
      total += preco;

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-info">
          <span class="name">${item.nomeProd}</span>
          <span class="qty">${item.quantidade}x</span>
        </div>
        <div class="product-price">R$ ${preco.toFixed(2)}</div>
      `;
      detailsDiv.appendChild(card);
    });

    // Total
    document.getElementById("order-summary").textContent = `Total: R$ ${total.toFixed(2)}`;

  } catch (error) {
    console.error("Erro ao carregar pedido:", error);
    document.getElementById("order-info").innerHTML = "<p>Erro ao carregar pedido.</p>";
  }
}

carregarPedido();