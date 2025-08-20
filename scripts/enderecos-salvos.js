document.addEventListener('DOMContentLoaded', () => {
    const listaEnderecos = document.getElementById('listaEnderecos');
    const btnContinuar = document.getElementById('btnContinuar');
    let idSelecionado = null; // Variável para armazenar o ID da div selecionada
    let downloadLinks = []; // Array para armazenar todos os links de download
    let nome, telefone, email; // Dados do usuário

    document.getElementById('adicionarEndereco').addEventListener('click', () => {
        window.location.href = '/cpq/perfil'
    });

    // Obter dados do carrinho
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('/api/carrinho');

            if (!response.ok) {
                throw new Error('Erro ao buscar os dados do carrinho');
            }

            const data = await response.json();
            // Itera sobre todos os produtos no carrinho e armazena seus links de download
            data.forEach(produto => {
                if (produto.downloadLink) {
                    downloadLinks.push({
                        produtoId: produto.produtoId,
                        downloadLink: produto.downloadLink
                    });
                }
            });

            console.log('Links de download:', downloadLinks);

        } catch (err) {
            console.error('Erro ao buscar carrinho:', err);
        }
    });

    // Função para obter o valor de um cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Verificar se o cookie 'empresa' está presente
    const isEmpresa = getCookie('empresa');
    let userId;

    if (isEmpresa) {
        userId = getCookie('userId');
        carregarEnderecos(userId); // Carregar endereços se for empresa
    } else {
        console.log('Usuário'); // Log para usuários comuns
    }

    // Função para carregar os endereços da tabela EnderecosEmpresas
    async function carregarEnderecos(idUsuario) {
        try {
            const response = await fetch(`/enderecos-empresa/${idUsuario}`);
            if (!response.ok) throw new Error('Erro ao carregar endereços.');

            const enderecos = await response.json();

            listaEnderecos.innerHTML = ''; // Limpar a lista antes de carregar

            if (enderecos.length === 0) {
                listaEnderecos.innerHTML = '<p>Nenhum endereço salvo.</p>';
            } else {
                enderecos.forEach(endereco => {
                    const li = document.createElement('li');
                    li.id = `endereco-${endereco.id}`; // Define um ID único para cada endereço
                    li.className = 'endereco';
                    li.innerHTML = `
                        <p data-rua="${endereco.rua}"><strong>Rua:</strong> ${endereco.rua}</p>
                        <p data-numero="${endereco.numero}"><strong>Número:</strong> ${endereco.numero}</p>
                        <p data-bairro="${endereco.bairro}"><strong>Bairro:</strong> ${endereco.bairro}</p>
                        <p data-cidade="${endereco.cidade}" data-estado="${endereco.estado}">
                            <strong>Cidade:</strong> ${endereco.cidade} - ${endereco.estado}
                        </p>
                        <p data-cep="${endereco.cep}"><strong>CEP:</strong> ${endereco.cep}</p>
                        ${endereco.complemento ? `<p data-complemento="${endereco.complemento}"><strong>Complemento:</strong> ${endereco.complemento}</p>` : ''}
                    `;
                    li.addEventListener('click', () => selecionarDiv(li.id)); // Adiciona evento para clique
                    listaEnderecos.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
        }
    }

    // Função para selecionar ou desmarcar uma div
    function selecionarDiv(id) {
        const div = document.getElementById(id);

        if (idSelecionado === id) {
            // Se o mesmo ID já está selecionado, desmarca
            div.style.border = '';
            div.style.boxShadow = '';
            idSelecionado = null;
        } else {
            // Remove estilo da div previamente selecionada
            if (idSelecionado) {
                const divAnterior = document.getElementById(idSelecionado);
                if (divAnterior) {
                    divAnterior.style.border = '';
                    divAnterior.style.boxShadow = '';
                }
            }

            // Aplica estilo na nova div selecionada
            div.style.border = '2px solid var(--coral)';
            div.style.boxShadow = '0 4px 10px var(--flamingo)';
            idSelecionado = id;
        }
    }

    // Carregar informações do usuário
    async function carregarInfoUsers() {
        try {
            const response = await fetch('/perfil/dados-empresa');
            if (!response.ok) {
                throw new Error('Erro ao buscar os dados do usuário');
            }

            const data = await response.json();
            nome = data.userCad;
            telefone = data.telefoneCad;
            email = data.emailCad;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            window.location.href = '/cpq/inicio';
        }
    }
    carregarInfoUsers();

    // Adicionar evento ao botão "Continuar com Endereço"
    btnContinuar.addEventListener('click', async () => {
        if (!idSelecionado) {
            alert('Por favor, selecione um endereço antes de continuar.');
            return;
        }

        const enderecoSelecionado = document.getElementById(idSelecionado);
        const enderecoData = {
            nomeCliente: nome || '',
            rua: enderecoSelecionado.querySelector('[data-rua]').dataset.rua,
            numeroRua: enderecoSelecionado.querySelector('[data-numero]').dataset.numero,
            complemento: enderecoSelecionado.querySelector('[data-complemento]')?.dataset.complemento || '',
            bairro: enderecoSelecionado.querySelector('[data-bairro]').dataset.bairro,
            cep: enderecoSelecionado.querySelector('[data-cep]').dataset.cep,
            cidade: enderecoSelecionado.querySelector('[data-cidade]').dataset.cidade,
            estado: enderecoSelecionado.querySelector('[data-estado]').dataset.estado,
            email: email || '',
            telefone: telefone || '',
            downloadLinks: downloadLinks, // Assuma que o downloadLinks será gerado em outro lugar
        };

        try {
            const response = await fetch('/salvar-endereco-no-carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enderecoData }),
            });

            if (!response.ok) throw new Error('Erro ao salvar o endereço no carrinho.');

            const result = await response.json();
            console.log('Resposta do servidor:', result);

            alert('Endereço salvo com sucesso!');
            setTimeout(() => {
                window.location.href = '/pagamento-empresas'
            }, 1000);
        } catch (error) {
            console.error('Erro ao enviar o endereço:', error);
            alert('Erro ao salvar o endereço. Tente novamente.');
        }
    });
});