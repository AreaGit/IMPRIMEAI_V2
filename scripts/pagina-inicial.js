document.addEventListener("DOMContentLoaded", function() {
    var menuIcon = document.getElementById('menu-icon');
    var navbar = document.getElementById('nav-bar'); // Renomeie para 'navbar' apenas uma vez
    var fecharMenu = document.getElementById('fechar-menu');
    var header = document.getElementById('header');
    var searchInput = document.getElementById('searchInput');
    var suggestionsContainer = document.getElementById('sugestoes');

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

    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('mouseleave', () => {
            suggestionsContainer.style.display = 'none';
        });
    }

    if (searchInput) {
        async function activateButton(event) {
            if (event.key === "Enter") {
                const searchText = searchInput.value;
                try {
                    const response = await fetch('/pesquisar-produtos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: searchText })
                    });

                    const data = await response.json();
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'block';

                    if (data.produtos && data.produtos.length > 0) {
                        data.produtos.forEach(produto => {
                            const listItem = document.createElement('li');
                            listItem.textContent = produto.nomeProd;
                            listItem.addEventListener('click', () => {
                                window.location.href = `/detalhes-produtos?id=${produto.id}`;
                            });
                            suggestionsContainer.appendChild(listItem);
                        });
                    } else {
                        suggestionsContainer.textContent = 'Nenhum produto encontrado.';
                    }
                } catch (error) {
                    console.error('Erro ao pesquisar produtos:', error);
                }
            }
        }

        searchInput.addEventListener('keydown', activateButton);

        searchInput.addEventListener('input', async () => {
            const searchText = searchInput.value.trim();

            if (searchText === '') {
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
                    body: JSON.stringify({ query: searchText })
                });

                const data = await response.json();
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'block';

                if (data.produtos && data.produtos.length > 0) {
                    data.produtos.forEach(produto => {
                        const listItem = document.createElement('li');
                        listItem.textContent = produto.nomeProd;
                        listItem.addEventListener('click', () => {
                            window.location.href = `/detalhes-produtos?id=${produto.id}`;
                        });
                        suggestionsContainer.appendChild(listItem);
                    });
                } else {
                    suggestionsContainer.textContent = 'Nenhum produto encontrado.';
                }
            } catch (error) {
                console.error('Erro ao pesquisar produtos:', error);
            }
        });
    }
});

const cx1 = document.getElementById('cx1');
cx1.addEventListener('click', () => {
    window.location.href = '/detalhes-produtos?id=2'
});
const cx2 = document.getElementById('cx2');
cx2.addEventListener('click', () => {
    window.location.href = '/detalhes-produtos?id=3'
});

const cx3 = document.getElementById('cx3');
cx3.addEventListener('click', () => {
    window.location.href = '/detalhes-produtos?id=10'
});

const cx4 = document.getElementById('cx4');
cx4.addEventListener('click', () => {
    window.location.href = '/detalhes-produtos?id=9'
});

const cx5 = document.getElementById('cx5');
cx5.addEventListener('click', () => {
    window.location.href = '/detalhes-produtos?id=5'
});

const cx6 = document.getElementById('cx6');
cx6.addEventListener('click', () => {
    window.location.href = '/cartazes'
});

document.addEventListener("DOMContentLoaded", function() {
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    const newsletter = document.getElementById('newsletter');
    const newsletterShown = getCookie("newsletterShown");

    if (!newsletterShown) {
        newsletter.style.display = 'block';
        setCookie("newsletterShown", "true", 30);
    } else {
        newsletter.style.display = 'none';
    }
});

const fecharPopup = document.getElementById('fechar-popup');
fecharPopup.addEventListener('click', () =>  {
    const newsletter = document.getElementById('newsletter');
    newsletter.style.display = 'none';
})

const subNews = document.getElementById('subNews');
subNews.addEventListener('click',  () => {
    const email = document.getElementById('email').value;
    fetch('/inscrever-newsletter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.text())
    .then(data => {
        const avisoGeral = document.getElementById('avisoGeral');
        avisoGeral.style.display = 'block';
        window.setTimeout(() => {
            newsletter.style.display = 'none';
            window.location.reload();
        },5000)
    })
    .catch(error => console.error('Erro:', error));
});
document.addEventListener('DOMContentLoaded', async () => {
    const carouselSlide = document.getElementById('carouselSlide');

    // Função para carregar os produtos do servidor
    async function loadProducts() {
        try {
            const response = await fetch('/api/produtos');
            const produtos = await response.json();
            produtos.forEach(produto => {
                const produtoElement = document.createElement('div');
                produtoElement.className = 'carousel-item';
                const imgSrc = produto.imgProd; // Placeholder caso não haja imagem
                produtoElement.innerHTML = `
                    <a href="/detalhes-produtos?id=${produto.id}">
                        <img src="${imgSrc}" alt="${produto.nomeProd}">
                        <h2>${produto.nomeProd}</h2>
                    </a>
                `;
                carouselSlide.appendChild(produtoElement);
            });
            initializeCarousel();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Função para converter ArrayBuffer em Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Função para inicializar o carrossel
    function initializeCarousel() {
        const carouselItems = document.querySelectorAll('.carousel-item');
        let counter = 0; // Start at the first item
        const size = carouselItems[0].clientWidth;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';

        // Função para avançar o carrossel
        function moveCarousel() {
            if (counter >= carouselItems.length - 3) { 
                counter = 0; // Volta ao início se estiver no final
            } else {
                counter++;
            }
            carouselSlide.style.transition = "transform 0.5s ease-in-out";
            carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
        }

        // Listeners dos botões
        nextBtn.addEventListener('click', moveCarousel);

        prevBtn.addEventListener('click', () => {
            if (counter <= 0) return; // Adjust boundary to prevent empty space
            carouselSlide.style.transition = "transform 0.5s ease-in-out";
            counter--;
            carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
        });

        // Avanço automático do carrossel a cada 5 segundos
        setInterval(moveCarousel, 5000);
    }

    // Carregar produtos ao iniciar
    loadProducts();
});
async function obterQuantidadeCarrinho() {
    try {
        // Fazer uma requisição para a rota /api/carrinho
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        // Calcular a quantidade total de produtos no carrinho
        const quantidadeTotal = carrinho.reduce((total, produto) => total + produto.quantidade, 0);
        
        // Exibir a quantidade total no elemento com id 'quantidadeCarrinho'
        document.getElementById('quantidadeCarrinho').textContent = quantidadeTotal;
    } catch (error) {
        console.error('Erro ao obter a quantidade de produtos no carrinho:', error);
    }
}
document.getElementById('quantidadeCarrinho').addEventListener('click', () => {
    window.location.href = '/carrinho'
});
// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', obterQuantidadeCarrinho);