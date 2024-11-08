const senhaUser = document.getElementById('senhaUser');
const avisoSenha = document.getElementById('avisoErro');
let validSenhaUser;

// Função para obter o valor de um cookie pelo nome
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

senhaUser.addEventListener('keyup', () => {
    const senhaValue = senhaUser.value;
    const minLength = 8;

    if(senhaValue.length < minLength) {
     senhaUser.setAttribute('style', 'color:red; border-color: red;');
     validSenhaUser = false;
    } else {
     senhaUser.setAttribute('style', 'color:black; border-color: green; ');
     validSenhaUser = true;
    }
});

document.getElementById('btnRedefinir').addEventListener('click', () => {
    const senhaUser = document.getElementById('senhaUser').value;
    const emailUser = getCookie('emailUser');

    if(validSenhaUser === false) {
        avisoSenha.style.display = 'block'
        setTimeout(() => {
            avisoSenha.style.display = 'none'
            window.location.reload();
        }, 5000);
    } else {    
        const dados = {
            senha: senhaUser,
            email: emailUser
        };

        // Envia a nova senha e o email ao servidor
        fetch('/redefinir-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao redefinir senha');
            }
            return response.json();
        })
        .then(data => {
            console.log("Senha redefinida com sucesso!", data);
            window.location.href = '/login';
        })
        .catch(error => {
            console.error("Erro ao redefinir senha:", error);
            avisoSenha.style.display = 'block';
            setTimeout(() => {
                avisoSenha.style.display = 'none';
            }, 5000);
        });
    }
});