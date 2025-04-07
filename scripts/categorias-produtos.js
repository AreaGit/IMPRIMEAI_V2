document.addEventListener('DOMContentLoaded', () => {
    const toggleMenu = document.getElementById('toggleMenu');
    const categs = document.getElementById('categs');
    const parentCategs = document.querySelectorAll('.parentCateg');
    const mainContentHeader = document.getElementById('mainContentHeader');

    // Exibir ou ocultar o menu de categorias principais
    toggleMenu.addEventListener('click', (e) => {
        e.preventDefault();
        categs.style.display = categs.style.display === 'block' ? 'none' : 'block';
        mainContentHeader.style.zIndex = categs.style.display === 'none' ? '-1' : '1';
    });

    // Função para fechar todas as subcategorias
    const closeAllSubcategories = () => {
        const subCategs = document.querySelectorAll('.subCategAll');
        subCategs.forEach(sub => sub.style.display = 'none');
    };

    // Função para ajustar colunas dinamicamente se a altura ultrapassar 445px
    const adjustColumns = (subCateg) => {
        const subCategHeight = subCateg.scrollHeight; // Altura real da lista
        const maxHeight = 445;

        // Se a altura ultrapassar o limite, ajustar para colunas
        if (subCategHeight > maxHeight) {
            subCateg.style.height = '470px'
            subCateg.style.columnCount = 2;
            subCateg.style.columnGap = '20px';
            subCateg.style.width = '70%'
            subCateg.style.left = '85%'
            subCateg.style.transform = 'translate(-85%)'
            subCateg.style.textAlign = 'justify'
        }
    };

    // Adicionar evento de clique nas categorias para abrir/fechar
    parentCategs.forEach(parent => {
        parent.addEventListener('click', (e) => {
            e.preventDefault();
            const subCateg = parent.nextElementSibling;

            // Fecha todas as subcategorias antes de abrir a nova
            closeAllSubcategories();

            // Abre ou fecha a subcategoria clicada
            if (subCateg) {
                subCateg.style.display = subCateg.style.display === 'block' ? 'none' : 'block';

                // Ajusta colunas dinamicamente baseado na altura
                if (subCateg.style.display === 'block') {
                    adjustColumns(subCateg);
                }
            }
        });
    });

    async function obterQuantidadeCarrinho() {
        try {
            // Fazer uma requisição para a rota /api/carrinho
            const response = await fetch('/api/carrinho');
            const carrinho = await response.json();
            
            // Calcular a quantidade total de produtos no carrinho
            const quantidadeTotal = carrinho.length;
            
            // Exibir a quantidade total no elemento com id 'quantidadeCarrinho'
            if(quantidadeTotal > 99) {
                document.getElementById('quantidadeCarrinho').textContent = "99+";
            }else {
                document.getElementById('quantidadeCarrinho').textContent = quantidadeTotal;
            }
        } catch (error) {
            console.error('Erro ao obter a quantidade de produtos no carrinho:', error);
        }
    }
    obterQuantidadeCarrinho();
});
document.addEventListener("DOMContentLoaded", function() {
    var menuIcon = document.getElementById('iconMenuMob');
    var navbar = document.getElementById('nav-bar'); // Renomeie para 'navbar' apenas uma vez
    var fecharMenu = document.getElementById('fechar-menu');
    var header = document.getElementById('header');
    var searchInput = document.getElementById('search-input');
    var suggestionsContainer = document.getElementById('suggestions-container');

    // Verifique se todos os elementos existem antes de adicionar os event listeners
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 0) {
                header.classList.add('scrolled');
                document.body.style.marginTop = header.offsetHeight + 'px';
            } else {
                header.classList.remove('scrolled');
                document.body.style.marginTop = 0;
            }
        });
    }

    if (menuIcon && navbar && fecharMenu) {
        menuIcon.addEventListener('click', () => {
            navbar.style.opacity = '1';
            fecharMenu.style.opacity = '1';
            menuIcon.style.opacity = '0';

            setTimeout(() => {
                navbar.style.display = 'block';
                fecharMenu.style.display = 'block';
                menuIcon.style.display = 'none';
            }, 100);

            setTimeout(() => {
                navbar.style.transition = 'opacity 1s';
                fecharMenu.style.transition = 'opacity 1s';
                menuIcon.style.transition = 'opacity 1s';
            }, 100);
        });

        fecharMenu.addEventListener('click', () => {
            navbar.style.opacity = '0';
            fecharMenu.style.opacity = '0';
            menuIcon.style.opacity = '1';

            setTimeout(() => {
                navbar.style.display = 'none';
                fecharMenu.style.display = 'none';
                menuIcon.style.display = 'block';
            }, 100);

            setTimeout(() => {
                navbar.style.transition = 'opacity 1s';
                fecharMenu.style.transition = 'opacity 1s';
                menuIcon.style.transition = 'opacity 1s';
            }, 100);
        });
    }

    async function fetchSuggestions(searchText) {
        try {
            const response = await fetch('/pesquisar-produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: searchText })
            });

            const data = await response.json();
            suggestionsContainer.innerHTML = ''; // Limpa as sugestões anteriores
            suggestionsContainer.style.display = 'block'; // Mostra a lista

            if (data.produtos && data.produtos.length > 0) {
                const list = document.createElement('ul'); // Cria a lista dentro da div
                data.produtos.forEach(produto => {
                    const listItem = document.createElement('li');
                    listItem.textContent = produto.nomeProd;
                    listItem.addEventListener('click', () => {
                        window.location.href = `/detalhes-produtos?id=${produto.id}`;
                    });
                    list.appendChild(listItem);
                });
                suggestionsContainer.appendChild(list); // Adiciona a lista na div
            } else {
                suggestionsContainer.textContent = 'Nenhum produto encontrado.';
            }
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
        }
    }

    // Quando o usuário digitar no campo de pesquisa
    searchInput.addEventListener('input', async () => {
        const searchText = searchInput.value.trim();

        if (searchText === '') {
            suggestionsContainer.style.display = 'none';
            return;
        }

        await fetchSuggestions(searchText); // Busca as sugestões
    }); 
});
        // Função para obter o valor de um parâmetro da URL
        function getParametroUrl(nome) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(nome);
        }

        // Função para definir o título da página com base na categoria
        function definirTituloCategoria() {
            const categoria = getParametroUrl('categoria') || 'Produtos'; // Valor padrão
            const categoriaFormatada = categoria.replace('-', ' '); // Formatação
            document.title = categoriaFormatada[0].toUpperCase() + categoriaFormatada.substring(1); // Altera o title da página
        }

        // Função para carregar produtos com base na categoria
        function carregarProdutos() {
            let categoria = getParametroUrl('categoria') || 'Nenhum'; // Valor padrão
            if(categoria == "folhetos") {
                categoria = "Folhetos"
            }
            // Faz a requisição para obter produtos da categoria selecionada
            fetch(`/api/produtos/${categoria}`)
                .then(response => response.json())
                .then(data => {
                    const produtosSection = document.getElementById('produtos');
                    produtosSection.innerHTML = ''; // Limpa os produtos anteriores

                    // Renderiza os produtos
                    data.produtos.forEach(produto => {
                        const produtoDiv = document.createElement('div');
                        produtoDiv.classList.add('cxProd');
                        produtoDiv.addEventListener("click", () => {
                            window.location.href = `/detalhes-produtos?id=${produto.id}`;
                        })
                        produto.nomeProd = produto.nomeProd.substring(0, 40)
                        produtoDiv.innerHTML = `
                            <h2>${produto.nomeProd}</h2>
                            <img src="${produto.imgProd}" alt="${produto.nomeProd}">
                            <p>A partir de <br> R$ ${produto.valorProd.toFixed(2)}</p>
                            <a href="detalhes-produtos?id=${produto.id}">Comprar</a>
                        `;
                        produtosSection.appendChild(produtoDiv);
                    });
                })
                .catch(error => console.error('Erro ao carregar os produtos:', error));
        }

        // Chama as funções ao carregar a página
        document.addEventListener('DOMContentLoaded', () => {
            definirTituloCategoria(); // Altera o título da página e o H1
            carregarProdutos(); // Carrega os produtos da categoria
        });

        document.addEventListener("DOMContentLoaded", async () => {
            // Função para pegar o cookie pelo nome
            function getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            }
        
            // Pega o username do cookie
            const username = getCookie('username');
            // Seleciona os elementos
            const conviteCad = document.getElementById('conviteCad');
            const userLog = document.getElementById('userLog');
            const nameUserLog = document.getElementById('nameUserLog');
        
                if (username === undefined) {
                    // Mostra o convite para cadastrar e esconde a área logada
                    conviteCad.style.display = 'block';
                    userLog.style.display = 'none';
                } else {
                    // Esconde o convite e mostra o nome do usuário
                    conviteCad.style.display = 'none';
                    userLog.style.display = 'block';
                    nameUserLog.textContent = username;
                }
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            const menuToggle = document.getElementById('menuToggle');
            const menuContainer = document.getElementById('menuContainer');
            const toggleMainMenu = document.getElementById('toggleMainMenu');
            const categoryList = document.getElementById('category-list');
            const parentCategories = document.querySelectorAll('.parent-category');
        
            // Exibir ou ocultar o menu ao clicar no ícone hambúrguer
            menuToggle.addEventListener('click', () => {
                menuContainer.style.display = menuContainer.style.display === 'block' ? 'none' : 'block';
            });
        
            // Exibir ou ocultar o menu de categorias principais
            toggleMainMenu.addEventListener('click', (e) => {
                e.preventDefault();
                categoryList.style.display = categoryList.style.display === 'block' ? 'none' : 'block';
            });
        
            // Função para fechar todas as subcategorias
            const closeAllSubcategories = () => {
                const subCategories = document.querySelectorAll('.subcategory-list');
                subCategories.forEach(sub => sub.style.display = 'none');
            };
        
            // Função para ajustar colunas dinamicamente se a altura ultrapassar 445px
            const adjustColumns = (subCategory) => {
                const subCategoryHeight = subCategory.scrollHeight; // Altura real da lista
                const maxHeight = 445;
                const columnWidth = 300; // Largura de cada coluna
        
                // Se a altura ultrapassar o limite, ajustar para colunas
                if (subCategoryHeight > maxHeight) {
                    const numColumns = Math.ceil(subCategoryHeight / maxHeight);
                    subCategory.style.columnCount = numColumns;
                    subCategory.style.columnGap = '20px';
                    subCategory.style.width = `${numColumns * columnWidth}px`;
                } else {
                    // Reseta para uma coluna se a altura estiver dentro do limite
                    subCategory.style.columnCount = 1;
                    subCategory.style.width = 'auto';
                }
            };
        
            // Adicionar evento de clique nas categorias para abrir/fechar
            parentCategories.forEach(parent => {
                parent.addEventListener('click', (e) => {
                    e.preventDefault();
                    const subCategory = parent.nextElementSibling;
        
                    // Fecha todas as subcategorias antes de abrir a nova
                    closeAllSubcategories();
        
                    // Abre ou fecha a subcategoria clicada
                    if (subCategory) {
                        subCategory.style.display = subCategory.style.display === 'block' ? 'none' : 'block';
        
                        // Ajusta colunas dinamicamente baseado na altura
                        if (subCategory.style.display === 'block') {
                            adjustColumns(subCategory);
                        }
                    }
                });
            });
        });