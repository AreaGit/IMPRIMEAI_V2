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
    'Marcelo': {
        id: 3,
        username: 'Marcelo ADM',
        email: 'marcelo.carvalho@cpqbrasil.com.br',
        senha: 'cpqM@rcel0'
    },
    'Vagner': {
        id: 4,
        username: 'Vagner ADM',
        email: 'vagner.chaves@cpqbrasil.com.br',
        senha: 'cpqV@gn3r'
    },
    'Mariana':{
        id: 5,
        username: 'Mariana ADM',
        email: 'mariana.gambini@cpqbrasil.com.br',
        senha: 'cpqM@r1ana'
    },
    'Matheus': {
        id: 6,
        username: 'Matheus',
        email: 'matheus.melchert@cpqbrasil.com.br',
        senha: 'cpqM@th3us'
    }
};

btnCad.addEventListener('click', () => {
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;
    
    let userFound = false;
    let userName = '';

    const userData = {
        email: emailUser,
        senha: senhaUser
    };

    fetch('/login-adm-cpq', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro de rede - ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Login bem-sucedido') {
          document.cookie = `username=${data.name}; path=/;`;
          alert('Redirecionando para o painel...')
          setTimeout(() => {
            window.location.href = '/cpq/painel-administrativo';
          }, 2000);
        } else {
          // Exibir mensagem de erro
          alert('Erro ao fazer login...');
          window.location.reload();
        }
      });
});