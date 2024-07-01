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
    } else {
        window.location.href = '/login-adm';
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
                    <a href="/editar-produtos?id=${produto.id}">Editar Produto</a>
                `;
                listaProdutos.appendChild(produtoDiv);
                carregamento.style.display = 'none';
            });
        })
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
        });
});
//função ao clicar em gráficas
document.getElementById('graficas').addEventListener('click', () => {
    const carregamento = document.getElementById('carregamento');
    carregamento.style.display = 'block';

    fetch('/api/graficas')
        .then(response => response.json())
        .then(graficas => {
            const listaGraficas = document.getElementById('lista-graficas');
            const divAddGraficas = document.getElementById('divAddGraficas');
            divAddGraficas.style.display = 'block';
            listaGraficas.innerHTML = '';
            console.log(graficas)
            graficas.forEach(grafica => {
                const graficaDiv = document.createElement('div');
                graficaDiv.classList.add('grafica');
                graficaDiv.innerHTML = `
                    <h3>${grafica.userCad}</h3>
                    <p>ID ${grafica.id}</p>
                    <p>Estado ${grafica.estadoCad}</p>
                    <p>Cidade ${grafica.cidadeCad}</p>
                    <a href="/editar-graficas?id=${grafica.id}">Editar Gráfica</a>
                `;
                listaGraficas.appendChild(graficaDiv);
            });

            carregamento.style.display = 'none';
        })
        .catch(error => {
            console.log('Erro ao buscar gráficas:', error);
            carregamento.style.display = 'none';
        });
});
