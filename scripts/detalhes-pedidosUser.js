// Substitua 'USER_ID' pelo ID do usuário desejado
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

// Obter o ID do pedido da URL
const urlParams = new URLSearchParams(window.location.search);
const idPedido = urlParams.get('idPedido');

const carregamento = document.getElementById('carregamento');

fetch(`/detalhes-pedidoUser/${idPedido}`)
.then((response) => response.json())
.then((data) => {
    console.log(data);
    const enderecoContainer = document.getElementById('endereco-list');
    const itensPedidoContainer = document.getElementById('itens-pedido-list');
    const imagesContainer = document.getElementById('images');
    // Verificar se há endereços disponíveis
    if (data.enderecos && data.enderecos.length > 0) {
        data.enderecos.forEach((endereco) => {
            if(endereco.tipoEntrega == "Entrega a Retirar na Loja") {
                const div = document.createElement('div');
                div.id = 'divEnd';
                div.innerHTML = `
                <p><strong>Retirar em Rua:</strong> ${endereco.rua}</p>
                <p><strong>Retirar em CEP:</strong> ${endereco.cep}</p>
                <p><strong>Retirar em Cidade:</strong> ${endereco.cidade}</p>
                <p><strong>Retirar em Estado:</strong> ${endereco.estado}</p>
                <p><strong>Retirar em Número:</strong> ${endereco.numero}</p>
                <p><strong>Retirar em Complemento:</strong> ${endereco.complemento}</p>
                <p><strong>Retirar em Bairro:</strong> ${endereco.bairro}</p>
                <p><strong>Celular:</strong> ${endereco.celular}</p>
                `;
                enderecoContainer.appendChild(div);
            } else {
            const div = document.createElement('div');
            div.id = 'divEnd';
            div.innerHTML = `
            <p><strong>Rua:</strong> ${endereco.rua}</p>
            <p><strong>CEP:</strong> ${endereco.cep}</p>
            <p><strong>Cidade:</strong> ${endereco.cidade}</p>
            <p><strong>Estado:</strong> ${endereco.estado}</p>
            <p><strong>Número:</strong> ${endereco.numero}</p>
            <p><strong>Complemento:</strong> ${endereco.complemento}</p>
            <p><strong>Bairro:</strong> ${endereco.bairro}</p>
            <p><strong>Celular:</strong> ${endereco.celular}</p>
            `;
            enderecoContainer.appendChild(div);
            }
        });
    } else {
        // Se não houver endereços disponíveis, exibir uma mensagem
        const div = document.createElement('div');
        div.innerHTML = '<p>Nenhum endereço encontrado.</p>';
        enderecoContainer.appendChild(div);
    }
        
        // Exibir detalhes dos itens do pedido
        data.itens.forEach(async (item) => {
            let idProduto = item.idProduto
            console.log(item.tipo)
            let imgUrl
            let div
            if(!item.tipo) {
                imgUrl = await pegarImagemProduto(idProduto);
                div = document.createElement('div');
            } else {
                imgUrl = await pegarImagemDoProdutoEmpresas(idProduto);
                div = document.createElement('div');
            }
            if(item.nomeArquivo == null) {
                item.nomeArquivo = ""
            } else if(item.marca == null) {
                item.marca = ""
            } else if(item.modelo == null) {
                item.modelo = ""
            }
            div.id = `divItem`
                div.innerHTML += `
                <img src="${imgUrl}">
                <p><strong>ID do Produto:</strong> ${item.idProduto == null ? "Não há" : item.idProduto}</p>
                <p><strong>Nome do Produto:</strong> ${item.nomeProd == null ? "Não há" : item.nomeProd}</p>
                <p><strong>Quantidade:</strong> ${item.quantidade == null ? "Não há" : item.quantidade}</p>
                <p><strong>Valor:</strong> ${item.valorProd == null ? "Não há" : item.valorProd}</p>
                <p><strong>Marca:</strong> ${item.marca == null ? "Não há" : item.marca}</p>
                <p><strong>Modelo:</strong> ${item.modelo == null ? "Não há" : item.modelo}</p>
                <p><strong>Acabamento:</strong> ${item.acabamento == null ? "Não há" : item.acabamento}</p>
            <p><strong>Cor:</strong> ${item.cor == null ? "Não há" : item.cor}</p>
            <p><strong>Enobrecimento:</strong> ${item.enobrecimento == null ? "Não há" : item.enobrecimento}</p>
            <p><strong>Formato:</strong> ${item.formato == null ? "Não há" : item.formato}</p>
            <p><strong>Material:</strong> ${item.material == null ? "Não há" : item.material}</p>
            <a href="${!item.linkDownload ? item.arteEmpresas : item.linkDownload}" target="_blank" download"arte"><strong>Arte do Produto:</strong> ${item.nomeArquivo == null ? "Não há" : item.nomeArquivo}</a>
        `;

        if (item.linkDownload === 'Enviar Arte Depois') {
            const label = document.createElement('label');
            label.textContent = 'Escolha um arquivo para o Produto:';
            
            const inputFile = document.createElement('input');
            inputFile.type = 'file';
            inputFile.name = `file_${item.idProduto}`; // Definir um nome único para cada input file
            label.appendChild(inputFile);
            
            const enviarButton = document.createElement('button');
            enviarButton.textContent = 'Enviar';
            enviarButton.addEventListener('click', () => {
                carregamento.style.display = 'block'
                const fileInput = document.querySelector(`[name="file_${item.idProduto}"]`);
                const file = fileInput.files[0];
                
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('idProduto', item.idProduto); // Adicione o idProduto ao FormData
                    formData.append('pedidoId', idPedido)
    
                // Enviar arquivo para o servidor usando fetch
                fetch('/uploadGoogleDrive', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    // Lógica para lidar com a resposta do servidor após o envio do arquivo
                    console.log('Resposta do servidor:', data);
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000)
                    // Você pode adicionar lógica aqui para atualizar a interface do usuário conforme necessário
                })
                    .catch(error => console.error('Erro no envio do arquivo:', error));
                    } else {
                        alert('Por favor, escolha um arquivo antes de clicar em Enviar.');
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000)
                    }
                });
                    div.appendChild(label);
                    div.appendChild(enviarButton);
                }

                itensPedidoContainer.appendChild(div);
            });
      })
      .catch((error) => console.error('Erro ao buscar detalhes do pedido:', error));

      // Function to fetch the image URL for a product
async function pegarImagemProduto(idProduto) {
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
  async function pegarImagemDoProdutoEmpresas(idDoProduto) {
    try {
        const imgResponse = await fetch(`/imagens-empresa/${idDoProduto}`);
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