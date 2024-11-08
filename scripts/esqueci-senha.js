document.getElementById('btnEnviarEmail').addEventListener('click', () => {
    // Pega o valor do input de email do usuário
    const emailUser = document.getElementById('emailUser').value;

    // Salva o e-mail do usuário nos cookies
    document.cookie = `emailUser=${emailUser}`;

    //Montando objeto
    const dados = {
        email: emailUser
    };

    // Verifica se o cookie foi salvo
    if (document.cookie.includes('emailUser=')) {
        // Cookie foi salvo corretamente
        fetch('/enviar-email-redefinir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Dados enviados com sucesso! ", data);
        })
        .catch(error => {
            console.log("Erro ao enviar dados! ", error);
        })
        setTimeout(() => {
            window.location.href = '/link-enviado'
        }, 2000);
    } else {
        // Cookie não foi salvo
        document.getElementById('avisoErro').style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
});
