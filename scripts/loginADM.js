const mostrarSenha = document.getElementById('mostrarSenha');
const ocultarSenha = document.getElementById('ocultarSenha');
const senhaUser = document.getElementById('senhaUser')
//Mostrar a senha
mostrarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "text");
});
//Ocultar a senha
ocultarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "password");
});

const btnCad = document.getElementById('btnCad');

//Users permitidos
const usersPermitidos = {
    'Gabriel': {
        id: 1,
        username: 'Gabriel',
        email: 'gabrieladm@imprimeai.com.br',
        senha: 'Z1mb@bue1'
    },
    'Telmo': {
        id: 2,
        username: 'Telmo',
        email: 'telmoadm@imprimeai.com.br',
        senha: 'Z1mb@bue1'
    },
};

btnCad.addEventListener('click', () => {
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;
    const avisoSucesso = document.getElementById('avisoSucesso');
    const avisoErro = document.getElementById('avisoErro');
    
    let userFound = false;
    let userName = '';

    for (const key in usersPermitidos) {
        if (usersPermitidos.hasOwnProperty(key)) {
            const user = usersPermitidos[key];
            if (user.email === emailUser && user.senha === senhaUser) {
                userFound = true;
                userName = user.username;
                break;
            }
        }
    }

    if (userFound) {
        avisoSucesso.style.display = 'block';
        avisoErro.style.display = 'none';

        // Salva o nome do usuário nos cookies
        document.cookie = `usernameAdm=${userName}; path=/;`;

        // Redireciona para a página desejada
        setTimeout(() => {
            window.location.href = '/administradores/painel';
        }, 5000);
    }  else {
        avisoSucesso.style.display = 'none';
        avisoErro.style.display = 'block';
        //atualiza a página
        window.location.reload();
    }
});