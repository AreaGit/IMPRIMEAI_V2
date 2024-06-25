const carregamento = document.getElementById('carregamento');
// Função para obter o valor de um cookie pelo nome
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Exibir o nome do usuário no elemento com id 'nomeAdm'
document.addEventListener('DOMContentLoaded', () => {
    const nomeAdmElement = document.getElementById('nomeAdm');
    const userName = getCookie('username');
    if (userName) {
        nomeAdmElement.textContent = userName;
    }
});
//função ao clicar em produtos
document.getElementById('produtos').addEventListener('click', () => {
    carregamento.style.display = 'block';
    fetch('/api/produtos')
        .then(response => response.json())
        .then(produtos => {
            const listaProdutos = document.getElementById('lista-produtos');
            listaProdutos.innerHTML = ''; // Limpa a lista de produtos
            produtos.forEach(produto => {
                const produtoDiv = document.createElement('div');
                produtoDiv.classList.add('produto');
                produtoDiv.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <h3>${produto.nome}</h3>
                    <a href="#">Editar Produto</a>
                `;
                listaProdutos.appendChild(produtoDiv);
                carregamento.style.display = 'none';
            });
        })
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
        });
});