const btnRetirada = document.getElementById('btnRetirada');
const avisoGeral = document.getElementById('avisoGeral');
const erroEndereco = document.getElementById('erroEndereco');
let downloadLinks = []; // Array para armazenar todos os links de download
let tipo
document.addEventListener('DOMContentLoaded', async() => {
    try {
        const response = await fetch('/api/carrinho');

        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do carrinho');
        }

        const data = await response.json();
        console.log(data);
        if(data[0].tipo) {
            tipo = data[0].tipo;
            console.log(tipo)
            document.getElementById('salvos').style.display = 'block';
            document.getElementById('inicio').href = '/cpq/inicio';
            document.addEventListener('DOMContentLoaded', () => {
                const redirecionarSalvos = document.getElementById('redSalvos');
            
                redirecionarSalvos.addEventListener('click', () => {
                    // Substitua "/enderecos-salvos" pelo caminho correto para a página dos endereços salvos.
                    window.location.href = '/enderecos-salvos';
                });
            });            
        }
        // Itera sobre todos os produtos no carrinho e armazena seus links de download
        data.forEach(produto => {
            if (produto.downloadLink) {
                downloadLinks.push({
                    produtoId: produto.produtoId,
                    downloadLink: produto.downloadLink
                });
            }
        });

        console.log(downloadLinks); // Exibe todos os links de download no console

    } catch(err) {
        console.log(err);
    }
});
btnRetirada.addEventListener("click", async () => {
    if(tipo == 'Empresas') {
        try {
            // Primeiro, obtenha os dados do perfil do usuário
            const response = await fetch('/perfil/dados-empresa');
    
            if (!response.ok) {
                throw new Error('Erro ao buscar os dados do usuário');
            }
    
            const data = await response.json();
    
            const nomeCliente = data.user.userCad;
            const enderecoCad = data.user.endereçoCad;
            const numCad = data.user.numCad;
            const compCad = data.user.compCad;
            const bairroCad = data.user.bairroCad;
            const cepCad = data.user.cepCad;
            const cidadeCad = data.user.cidadeCad;
            const telefoneCad = data.user.telefoneCad;
            const estadoCad = data.user.estadoCad;
            const email = data.user.emailCad;
    
            // Aqui você pode adicionar o downloadLink ao endereçoData
            const enderecoData = {
                nomeCliente: nomeCliente,
                rua: enderecoCad,
                numeroRua: numCad,
                complemento: compCad,
                cep: cepCad,
                estado: estadoCad,
                cidade: cidadeCad,
                bairro: bairroCad,
                email: email,
                telefone: telefoneCad,
                downloadLinks: downloadLinks // Adiciona o downloadLink aqui
            };
    
            // Enviar os dados para salvar no carrinho
            const saveResponse = await fetch('/salvar-endereco-retirada-no-carrinho', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enderecoData), // Envia o objeto completo, incluindo o downloadLink
            });
    
            if (!saveResponse.ok) {
                throw new Error(`Erro ao salvar endereço de retirada: ${saveResponse.statusText}`);
            }
    
            const saveData = await saveResponse.json();
    
            // Verifica se a resposta foi bem-sucedida
            if (saveData.success) {
                avisoGeral.style.display = 'block';
                window.setTimeout(() => {
                    avisoGeral.style.display = 'none';
                    if(tipo === "Empresas"){
                        window.location.href = '/pagamento-empresas'
                    } else{
                        window.location.href = '/pagamento'
                    }
                }, 1000);
            } else {
                erroEndereco.style.display = 'block';
                window.setTimeout(() => {
                    erroEndereco.style.display = 'none';
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            console.error('Erro ao fazer a solicitação:', error);
        }
    } else {
        try {
            // Primeiro, obtenha os dados do perfil do usuário
            const response = await fetch('/perfil/dados');
    
            if (!response.ok) {
                throw new Error('Erro ao buscar os dados do usuário');
            }
    
            const data = await response.json();
    
            const nomeCliente = data.user.userCad;
            const enderecoCad = data.user.endereçoCad;
            const numCad = data.user.numCad;
            const compCad = data.user.compCad;
            const bairroCad = data.user.bairroCad;
            const cepCad = data.user.cepCad;
            const cidadeCad = data.user.cidadeCad;
            const telefoneCad = data.user.telefoneCad;
            const estadoCad = data.user.estadoCad;
            const email = data.user.emailCad;
    
            // Aqui você pode adicionar o downloadLink ao endereçoData
            const enderecoData = {
                nomeCliente: nomeCliente,
                rua: enderecoCad,
                numeroRua: numCad,
                complemento: compCad,
                cep: cepCad,
                estado: estadoCad,
                cidade: cidadeCad,
                bairro: bairroCad,
                email: email,
                telefone: telefoneCad,
                downloadLinks: downloadLinks // Adiciona o downloadLink aqui
            };
    
            // Enviar os dados para salvar no carrinho
            const saveResponse = await fetch('/salvar-endereco-retirada-no-carrinho', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enderecoData), // Envia o objeto completo, incluindo o downloadLink
            });
    
            if (!saveResponse.ok) {
                throw new Error(`Erro ao salvar endereço de retirada: ${saveResponse.statusText}`);
            }
    
            const saveData = await saveResponse.json();
    
            // Verifica se a resposta foi bem-sucedida
            if (saveData.success) {
                avisoGeral.style.display = 'block';
                window.setTimeout(() => {
                    avisoGeral.style.display = 'none';
                    if(tipo === "Empresas"){
                        window.location.href = '/pagamento-empresas'
                    } else{
                        window.location.href = '/pagamento'
                    }
                }, 1000);
            } else {
                erroEndereco.style.display = 'block';
                window.setTimeout(() => {
                    erroEndereco.style.display = 'none';
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            console.error('Erro ao fazer a solicitação:', error);
        }
    }
});

const redMulitplos = document.getElementById('redMultiplos');
const erroMultiplos = document.getElementById('erroMultiplos');
redMulitplos.style.cursor = 'pointer';
redMulitplos.addEventListener('click', async() => {
    try {
        // Faça uma solicitação AJAX para obter os produtos do carrinho
        const response = await fetch('/api/carrinho');
  
        if (!response.ok) {
          throw new Error('Erro ao obter os dados do carrinho');
        }
  
        // Obtenha os dados do carrinho em formato JSON
        const produtos = await response.json();

        if(produtos.length > 1) {
            erroMultiplos.style.display = 'block';
            setTimeout(() => {
                erroMultiplos.style.display = 'none';
                window.location.reload();
            },4000);
        }else {
            window.location.href = '/multiplos-enderecos';
        }
    } catch (error) {
        alert('Não foi possível carregar');
    }
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