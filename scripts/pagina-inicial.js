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

const cx1 = document.getElementById('cx1');
cx1.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=brindes'
});
const cx2 = document.getElementById('cx2');
cx2.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=adesivos'
});

const cx3 = document.getElementById('cx3');
cx3.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=cartoes'
});

const cx4 = document.getElementById('cx4');
cx4.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=papelaria'
});

const cx5 = document.getElementById('cx5');
cx5.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=folders'
});

const cx6 = document.getElementById('cx6');
cx6.addEventListener('click', () => {
    window.location.href = '/categorias?categoria=banners'
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
});

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
document.addEventListener("DOMContentLoaded", () => {
    const gap = 16;
    const carousel = document.getElementById("carousel");
    const content = document.getElementById("content");
    const next = document.getElementById("next");
    const prev = document.getElementById("prev");

    let width = carousel.offsetWidth; // Define width at the top

    // Smooth scroll function
    function smoothScrollTo(element, target, duration) {
        const start = element.scrollLeft;
        const change = target - start;
        let currentTime = 0;
        const increment = 20;

        function animateScroll() {
            currentTime += increment;
            const val = easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if (currentTime < duration) {
                requestAnimationFrame(animateScroll);
            }
        }

        animateScroll();
    }

    // Easing function for smoother animation
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    next.addEventListener("click", () => {
        const target = carousel.scrollLeft + width + gap;
        smoothScrollTo(carousel, target, 600); // Duration of 600ms for smooth scrolling
        prev.style.display = "flex";
    });

    prev.addEventListener("click", () => {
        const target = carousel.scrollLeft - width - gap;
        smoothScrollTo(carousel, target, 600); // Duration of 600ms for smooth scrolling
        next.style.display = "flex";
    });

    window.addEventListener("resize", () => {
        width = carousel.offsetWidth;
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
document.getElementById('quantidadeCarrinho').addEventListener('click', () => {
    window.location.href = '/carrinho'
});
// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', obterQuantidadeCarrinho);

const banners = document.querySelectorAll('.banner');
const prevBtn = document.getElementById('prevBtn1');
const nextBtn = document.getElementById('nextBtn1');
const progressDots = document.querySelectorAll('.progress-dot');
let currentIndex = 0;

function showBanner(index) {
    banners.forEach((banner, i) => {
        banner.classList.toggle('active', i === index);
        progressDots[i].classList.toggle('active', i === index);
    });
}

function nextBanner() {
    currentIndex = (currentIndex < banners.length - 1) ? currentIndex + 1 : 0;
    showBanner(currentIndex);
}

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : banners.length - 1;
    showBanner(currentIndex);
});

nextBtn.addEventListener('click', () => {
    nextBanner();
});

// Troca automática dos banners a cada 5 segundos
setInterval(() => {
    nextBanner();
}, 5000);
document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('.box');
    let currentIndex = 0;

    function animateBox() {
        // Remove the animation class from the previous box
        if (currentIndex > 0) {
            boxes[currentIndex - 1].classList.remove('animate');
        } else if (currentIndex === 0 && boxes.length > 1) {
            boxes[boxes.length - 1].classList.remove('animate');
        }

        // Add the animation class to the current box
        boxes[currentIndex].classList.add('animate');

        // Update the index to the next box
        currentIndex = (currentIndex + 1) % boxes.length;
    }

    // Start the animation loop
    setInterval(animateBox, 3000);
})
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
            // Limita o texto a 40 caracteres
            const limitedUsername = username.length > 20 ? `${username.slice(0, 20)}...` : username;

            // Esconde o convite e mostra o nome do usuário
            conviteCad.style.display = 'none';
            userLog.style.display = 'block';
            nameUserLog.textContent = limitedUsername;
        }
});
document.addEventListener('DOMContentLoaded', () => {
    const toggleMenu = document.getElementById('toggleMenu');
    const categs = document.getElementById('categs');
    const parentCategs = document.querySelectorAll('.parentCateg');

    // Exibir ou ocultar o menu de categorias principais
    toggleMenu.addEventListener('click', (e) => {
        e.preventDefault();
        categs.style.display = categs.style.display === 'block' ? 'none' : 'block';
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

            // Se a subcategoria já estiver visível, fecha-a
            if (subCateg && subCateg.style.display === 'block') {
                subCateg.style.display = 'none';
            } else {
                // Fecha todas as subcategorias antes de abrir a nova
                closeAllSubcategories();

                // Abre a subcategoria clicada
                if (subCateg) {
                    subCateg.style.display = 'block';

                    // Ajusta colunas dinamicamente baseado na altura
                    adjustColumns(subCateg);
                }
            }
        });
    });
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
document.getElementById('banner1').addEventListener('click', () => {
    window.location.href = "/"
});
document.getElementById('banner2').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=22"
});
document.getElementById('banner4').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=11"
});
document.getElementById('banner5').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=2"
});
document.getElementById('banner6').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=50"
});
document.getElementById('banner7').addEventListener('click', () => {
    window.location.href = "https://www.instagram.com/imprimeai.com.br/"
});
document.getElementById('banner8').addEventListener('click', () => {
    window.location.href = "/"
});
document.getElementById('bannerCartaoDeVisita').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=cartoes"
});
document.getElementById('bannerPapelaria').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=papelaria"
});
document.getElementById('bannerTags').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=tags" 
});
document.getElementById('bannerBrindes').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=brindes"
});
document.getElementById('bannerCalendarios').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=calendarios"
});
document.getElementById('bannerCanetas').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=96"
});
document.getElementById('bannerAdesivos').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=adesivos"
});
document.getElementById('bannerQuadroCanvas').addEventListener('click', () => {
    window.location.href = "/detalhes-produtos?id=45"
});
document.getElementById('bannerSacolas').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=sacolas"
});
document.getElementById('bannerFolhetos').addEventListener('click', () => {
    window.location.href = "/categorias?categoria=folders"
});

        // Seletor para categorias e subcategorias
        const openSubsButtons = document.querySelectorAll('.openSubsCategories');

        openSubsButtons.forEach((button) => {
            const subsCategories = button.nextElementSibling;
            const span = button.querySelector('span');

            button.addEventListener('click', () => {
                const isOpen = subsCategories.classList.toggle('show');
                span.textContent = isOpen ? '−' : '+';
            });
        });

        const abrirMenu = document.getElementById('abrirMenu');
        const navbar = document.getElementById('navbar');
        const fecharMenu = document.getElementById('fecharMenu');

        // Evento para abrir o menu
        abrirMenu.addEventListener('click', () => {
            navbar.classList.add('show');
            fecharMenu.style.display = 'block';
            abrirMenu.style.display = 'none';
        });

        // Evento para fechar o menu
        fecharMenu.addEventListener('click', () => {
            navbar.classList.remove('show');
            abrirMenu.style.display = 'block';
            fecharMenu.style.display = 'none';
        });

       // NewsLetter
const form = document.getElementById("newsletterForm");
const confirmarBtn = document.getElementById("confirmarBtn");
const mensagem = document.getElementById("mensagem");
let email;

form.addEventListener("submit", function(e){
  e.preventDefault();

  email = document.getElementById("email").value;

  if(email.includes("@") && email.includes(".")) {
    // Esconde o form e mostra o botão vermelho
    form.style.display = "none";
    confirmarBtn.style.display = "inline-block";
    mensagem.style.color = "#333";
    mensagem.textContent = "Confirme seu cadastro clicando no botão acima:";
  } else {
    mensagem.style.color = "red";
    mensagem.textContent = "Por favor, insira um e-mail válido.";
  }
});

confirmarBtn.addEventListener("click", function(){
   fetch('/inscrever-newsletter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if(data.message.includes("Já existe")) {
            confirmarBtn.style.display = "none";
            mensagem.style.color = "red";
            mensagem.textContent = "Email já cadastrado! ❌";
        } else if(data.message.includes("Inscrição bem-sucedida")) {
            confirmarBtn.style.display = "none";
            mensagem.style.color = "green";
            mensagem.textContent = "Obrigado por se cadastrar! 🎉";
        } else {
            confirmarBtn.style.display = "none";
            mensagem.style.color = "red";
            mensagem.textContent = data.message || "Ocorreu um erro, tente novamente.";
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        confirmarBtn.style.display = "none";
        mensagem.style.color = "red";
        mensagem.textContent = "Ocorreu um erro, tente novamente.";
    });
});