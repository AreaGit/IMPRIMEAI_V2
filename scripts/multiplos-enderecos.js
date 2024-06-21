const fileInput = document.getElementById('uploadPl');
const fileNameDisplay = document.getElementById('file-name');
const avisoGeral = document.getElementById('avisoGeral');
const erroCarrinho = document.getElementById('erroCarrinho');
const erroPl = document.getElementById('erroPl');
const carregamento = document.getElementById('carregamento');

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
                        window.location.href = "/upload";
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