window.addEventListener('scroll', function() {
    var header = document.getElementById('header');

    if (window.scrollY > 0) {
        header.classList.add('scrolled');
        document.body.style.marginTop = header.offsetHeight + 'px'; // Adiciona margem superior ao corpo da página
    } else {
        header.classList.remove('scrolled');
        document.body.style.marginTop = 0; // Remove a margem superior quando o cabeçalho não está fixo
    }
});

const navbar = document.getElementById('nav-bar')
const menuIcon = document.getElementById('menu-icon')
const fecharMenu = document.getElementById('fechar-menu')

// Função para mostrar o menu e esconder o ícone do menu
menuIcon.addEventListener('click', () => {
    navbar.style.opacity = '1';
    fecharMenu.style.opacity = '1';
    menuIcon.style.opacity = '0';

    // Aguarda um pequeno intervalo antes de alterar o display para garantir que a transição seja aplicada corretamente
    setTimeout(() => {
        navbar.style.display = 'block';
        fecharMenu.style.display = 'block';
        menuIcon.style.display = 'none';
    }, 100); // Aguarda 100ms para garantir que a transição seja aplicada após a mudança de opacidade

    // Adiciona uma transição de 1 segundo ao alterar a opacidade
    setTimeout(() => {
        navbar.style.transition = 'opacity 1s';
        fecharMenu.style.transition = 'opacity 1s';
        menuIcon.style.transition = 'opacity 1s';
    }, 100)
});

// Função para esconder o menu e mostrar o ícone do menu
fecharMenu.addEventListener('click', () => {
    navbar.style.opacity = '0';
    fecharMenu.style.opacity = '0';
    menuIcon.style.opacity = '1';

    // Aguarda um pequeno intervalo antes de alterar o display para garantir que a transição seja aplicada corretamente
    setTimeout(() => {
        navbar.style.display = 'none';
        fecharMenu.style.display = 'none';
        menuIcon.style.display = 'block';
    }, 100); // Aguarda 100ms para garantir que a transição seja aplicada após a mudança de opacidade

    // Adiciona uma transição de 1 segundo ao alterar a opacidade
    setTimeout(() => {
        navbar.style.transition = 'opacity 1s';
        fecharMenu.style.transition = 'opacity 1s';
        menuIcon.style.transition = 'opacity 1s';
    }, 100)
});


//Pesquisa de produtos
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const suggestionsContainer = document.getElementById('sugestoes');
suggestionsContainer.addEventListener('mouseleave', () => {
    suggestionsContainer.style.display = 'none';
});

async function activateButton(event) {
    if (event.key === "Enter") {
        const searchText = searchInput.value; // Obtendo o valor do campo de entrada
        try {
            const response = await fetch('/pesquisar-produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: searchText }) // Passando o valor do campo de entrada
            });

            const data = await response.json();

            // Limpa a div de sugestões antes de adicionar novos resultados
            document.getElementById('sugestoes').innerHTML = '';
            suggestionsContainer.style.display = 'block';
            // Verifica se há produtos na resposta
            if (data.produtos && data.produtos.length > 0) {
                // Itera sobre cada produto e cria um elemento de lista para exibi-lo
                data.produtos.forEach(produto => {
                    const listItem = document.createElement('li');
                    listItem.textContent = produto.nomeProd; // Adiciona o nome do produto à lista
                    listItem.addEventListener('click', () => {
                        window.location.href = `/detalhes-produtos?id=${produto.id}`
                    });
                    // Adiciona o item da lista à div de sugestões
                    document.getElementById('sugestoes').appendChild(listItem);
                });
            } else {
                // Se não houver produtos encontrados, exibe uma mensagem na div de sugestões
                document.getElementById('sugestoes').textContent = 'Nenhum produto encontrado.';
            }
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
        }
    }
}

// Adicionando o evento de tecla ao campo de entrada
document.getElementById('searchInput').addEventListener('keydown', activateButton);

// Adiciona um evento de escuta ao campo de entrada para pesquisar enquanto o usuário digita
searchInput.addEventListener('input', async () => {
    const searchText = searchInput.value.trim(); // Obtendo o valor do campo de entrada

    if (searchText === '') {
        // Se o campo de pesquisa estiver vazio, esconda as sugestões
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch('/pesquisar-produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: searchText }) // Passando o valor do campo de entrada
        });

        const data = await response.json();

        // Limpa a div de sugestões antes de adicionar novos resultados
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'block';

        // Verifica se há produtos na resposta
        if (data.produtos && data.produtos.length > 0) {
            // Itera sobre cada produto e cria um elemento de lista para exibi-lo
            data.produtos.forEach(produto => {
                const listItem = document.createElement('li');
                listItem.textContent = produto.nomeProd; // Adiciona o nome do produto à lista
                listItem.addEventListener('click', () => {
                    window.location.href = `/detalhes-produtos?id=${produto.id}`
                });
                // Adiciona o item da lista à div de sugestões
                suggestionsContainer.appendChild(listItem);
            });
        } else {
            // Se não houver produtos encontrados, exibe uma mensagem na div de sugestões
            suggestionsContainer.textContent = 'Nenhum produto encontrado.';
        }
    } catch (error) {
        console.error('Erro ao pesquisar produtos:', error);
    }
});
