const senhaUser = document.getElementById('senhaUser')
const btnCad = document.getElementById('btnCad');

//Users permitidos
const usersPermitidos = {
    'Victor': {
        id: 1,
        username: 'Victor Florentino ADM',
        email: 'marketing@cpqbrasil.com.br',
        senha: 'H0ndur@s'
    },
    'Telmo': {
        id: 2,
        username: 'Telmo ADM',
        email: 'telmo@cpqbrasil.com.br',
        senha: 'Z1mb@bue1'
    },
};

btnCad.addEventListener('click', () => {
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;
    
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
        // Salva o nome do usuário nos cookies
        document.cookie = `username=${userName}; path=/;`;

        // Redireciona para a página desejada
        window.location.href = '/cpq/painel-administrativo';
    }  else {
        //atualiza a página
       
    }
});