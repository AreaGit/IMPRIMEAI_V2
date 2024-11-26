const listaDePedidos = document.getElementById('listaDePedidos');

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
  }
  
  // Ler o valor do cookie 'userCad'
  const userId = getCookie('userId');
  console.log(userId);


// Fazer uma solicitação Fetch para obter os pedidos do usuário
fetch(`/pedidos-usuario-empresa/${userId}`)
    .then(response => response.json())
    .then(data => {
        // Ordena os pedidos pelo id, do maior para o menor
        data.pedidos.sort((a, b) => b.id - a.id);

        // Renderiza os pedidos na ordem correta
        data.pedidos.forEach(async pedido => {
            const divPedido = document.createElement('div');
            divPedido.className = 'pedido';

            const idDoProduto = pedido.itenspedidos[0].idProduto;
            
            // Cria a imagem do produto
            const imgProduto = document.createElement('img');
            const srcDaImagem = await pegarImagemDoProduto(idDoProduto);
            if (srcDaImagem) {
                imgProduto.src = srcDaImagem;
            } else {
                imgProduto.alt = 'Imagem não disponível';
            }
            divPedido.appendChild(imgProduto);
            
            // Adiciona as informações do pedido
            divPedido.innerHTML += `
                <h2>${pedido.itenspedidos[0].nomeProd}</h2>
                <div class="pedido-info">
                    <p>ID ${pedido.id}</p>
                    <p>R$ ${pedido.valorPed.toFixed(2)}</p>
                    <p>${pedido.quantPed} unidade${pedido.quantPed > 1 ? 's' : ''}</p>
                </div>
                <a href="detalhesPedidosUser?idPedido=${pedido.id}">Detalhes do pedido</a>
            `;
            listaDePedidos.appendChild(divPedido);
        });
    })
    .catch(error => console.error('Erro ao buscar pedidos:', error));

// Função para obter a URL da imagem do produto
async function pegarImagemDoProduto(idDoProduto) {
    try {
        const imgResponse = await fetch(`/imagens/${idDoProduto}`);
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

document.addEventListener('DOMContentLoaded', () => {
    function getCookie(name) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
      }
  }
      return null;
  }
       
  // Ler o valor do cookie 'userCad'
  const userId = getCookie('userId');
  console.log(userId); 
});