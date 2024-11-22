document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    const avisoSucess = document.getElementById('avisoSucess');
    const avisoErro = document.getElementById('avisoErro');
    e.preventDefault(); // Previne o envio padrão do formulário

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Obtem o arquivo selecionado

    if (!file) {
        document.getElementById('status').innerText = "Nenhum arquivo selecionado.";
        return;
    }

    // Cria um FormData para enviar o arquivo via AJAX
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Envia a requisição POST para o backend
        const response = await fetch('/cadastrar-produtosexclusivos-planilha', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            avisoSucess.style.display = 'block';
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } else {
            const errorData = await response.json();
            avisoErro.style.display = 'block';
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    } catch (error) {
        console.error('Erro ao enviar planilha:', error);
        avisoErro.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
});