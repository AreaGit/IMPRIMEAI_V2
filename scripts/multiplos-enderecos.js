const fileInput = document.getElementById('uploadPl');
const fileNameDisplay = document.getElementById('file-name');
const avisoGeral = document.getElementById('avisoGeral');
const erroCarrinho = document.getElementById('erroCarrinho');
const erroPl = document.getElementById('erroPl');
const carregamento = document.getElementById('carregamento');
let tipo;

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
        }

    } catch(err) {
        console.log(err);
    }
});

fileInput.addEventListener('change', function() {
    // Verifica se foi selecionado algum arquivo
    if (fileInput.files.length > 0) {
        // Exibe o nome do arquivo selecionado
        fileNameDisplay.textContent = '' + fileInput.files[0].name;
    } else {
        // Limpa o texto se nenhum arquivo foi selecionado
        fileNameDisplay.textContent = '';
    }
});

const form = document.getElementById('formEnviarPlanilha');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        carregamento.style.display = 'block'
        const formData = new FormData();
        formData.append('filePlanilha', fileInput.files[0]);
        console.log(fileInput.files[0].name)
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    const result = await response.text();
                    console.log(result);
                    avisoGeral.style.display = 'block'
                    carregamento.style.display = 'none'
                    setTimeout(() => {
                        avisoGeral.style.display = 'none'
                        if(tipo === "Empresas"){
                            window.location.href = '/pagamento-empresas'
                        } else{
                            window.location.href = '/pagamento'
                        }
                    }, 5000);    
                } else {
                erroCarrinho.style.display = 'block'
                setTimeout(() => {
                    erroCarrinho.style.display = 'none'
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao enviar a planilha.');
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