document.getElementById('btnCadastrarMarca').addEventListener('click', async (event) => {
    event.preventDefault();

    const nomeMarca = document.getElementById('nomeMarca').value;
    const logoMarca = document.getElementById('logoMarca').files[0];

    if (!nomeMarca || !logoMarca) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        const imageData = reader.result; // Dados binários da imagem (base64)

        const data = {
            nomeMarca,
            logo: imageData,
        };

        try {
            const response = await fetch('/cadastrar-marca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Marca cadastrada com sucesso!');
            } else {
                alert('Erro ao cadastrar a marca.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar a marca:', error);
        }
    };

    reader.readAsDataURL(logoMarca); // Lê a imagem como base64
});
