let tipoEntrega;
let pId;
let novoStatusPedido;
const carregamento = document.getElementById('carregamento');
const avisoEntregue = document.getElementById('avisoEntregue');
const orderDetails = document.getElementById('order-details');
const orderValue = document.getElementById('order-value');
const productImage = document.getElementById('product-image');
const productName = document.getElementById('product-name');
const productVariations = document.getElementById('product-variations');
const orderAddress = document.getElementById('order-address');

document.addEventListener('DOMContentLoaded', async () => {
    // Show the loading indicator
    carregamento.style.display = 'block';
    
    // Obtém o ID do pedido e do produto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('idPedido');
    const idProduto = urlParams.get('idProduto');
    
    // Faz a requisição para o servidor para obter os detalhes do pedido
    try {
        const response = await fetch(`/detalhes-pedido/${idPedido}/${idProduto}`);
        const data = await response.json();
        
        const dadosUsuario = data.usuario;
        const pedido = data.pedido;
        const itenspedidos = data.pedido.itenspedidos[0];
        const dadosProduto = itenspedidos.produto;
        const endereco = data.pedido.enderecos[0];
        console.log(endereco)
        productImage.style.display = 'block';
        // Process the data and update the DOM
        const productImageData = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(dadosProduto.imgProd.data)))}`;
        productImage.src = productImageData;
        productVariations.innerHTML = `
          <h2>Dados do Produto</h2>
          <p><strong>Produto:</strong> ${itenspedidos.nomeProd}</p>
          <p><strong>Valor do Pedido:</strong> R$${pedido.valorPed}</p>
          <p><strong>Cor:</strong> ${itenspedidos.cor}</p> 
          <p><strong>Formato:</strong> ${itenspedidos.formato}</p>
          <p><strong>Material:</strong> ${itenspedidos.material}</p>
          <p><strong>Acabamento:</strong> ${itenspedidos.acabamento}</p>
          <p><strong>Enobrecimento:</strong> ${itenspedidos.enobrecimento}</p>
          <a href="${itenspedidos.linkDonwload}" target="_blank">Arte do produto</a>
        `;
        if(endereco.tipoEntrega == "Entrega a Retirar na Loja") {
          orderAddress.innerHTML = `
          <h2>Dados da Entrega</h2>
          <p><strong>Endereço: </strong>Entrega a Retirar na Loja</p>
          <p><strong>Bairro: </strong>Entrega a Retirar na Loja</p>
          <p><strong>Cidade: </strong>Entrega a Retirar na Loja</p>
          <p><strong>Estado: </strong>Entrega a Retirar na Loja</p>
          <p><strong>Cep: </strong>Entrega a Retirar na Loja</p>
          `;
        } else {
          orderAddress.innerHTML = `
          <h2>Dados da Entrega</h2>
          <p><strong>Endereço: </strong>${endereco.rua} ${endereco.numero}</p>
          <p><strong>Bairro: </strong>${endereco.bairro}</p>
          <p><strong>Cidade: </strong>${endereco.cidade}</p>
          <p><strong>Estado: </strong>${endereco.estado}</p>
          <p><strong>Cep: </strong>${endereco.cep}</p>
          `;
        }
        // Hide the loading indicator and show the order details
        carregamento.style.display = 'none';
        orderDetails.style.display = 'block';
        
        // If the order is delivered, show the success message
        if (pedido.statusPed === 'Entregue') {
            avisoEntregue.querySelector('.success').classList.add('active');
        }
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        // Handle error case
    }
});