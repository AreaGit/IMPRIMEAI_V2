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
fetch(`/pedidos-usuario/${userId}`)
.then(response => response.json())
    .then(data => {
        console.log(data)
        data.pedidos.forEach(pedidos => {
            const divPedido = document.createElement('div');
            divPedido.className = 'pedido';
             
            // Criar uma imagem para o produto
            const imgProduto = document.createElement('img');
            imgProduto.src = `/imagens/${pedidos.itenspedidos[0].idProduto}`;
            divPedido.appendChild(imgProduto);
            
            divPedido.innerHTML += `
                <h2>${pedidos.itenspedidos[0].nomeProd}</h2>
                <p>ID ${pedidos.id}</p>
                <p>R$ ${pedidos.valorPed.toFixed(2)}</p>
                <p>${pedidos.quantPed} unidade</p>
                <a href="detalhesPedidosUser?idPedido=${pedidos.id}">Detalhes do pedido</a>
            `
            listaDePedidos.appendChild(divPedido);
        })
    })
.catch(error => console.error('Erro ao buscar pedidos:', error));

// Função para obter a URL da imagem do produto
async function pegarImagemDoProduto(idDoProduto) {
    try {
        const response = await fetch(`/imagens/${idDoProduto}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar a imagem');
        }
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        return imgUrl;
    } catch (error) {
        console.error('Erro ao carregar a imagem:', error);
        return null;
    }
}