const mostrarSenha = document.getElementById('mostrarSenha');
const ocultarSenha = document.getElementById('ocultarSenha');
const senhaUser = document.getElementById('senha');
//Mostrar a senha
mostrarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "text");
});
//Ocultar a senha
ocultarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "password");
});

const btnCad = document.getElementById('btnCad');

btnCad.addEventListener('click', () => {
    const emailUser = document.getElementById('email').value;
    const senhaUser = document.getElementById('senha').value;
    const avisoSucesso = document.getElementById('avisoSucesso');
    const avisoErro = document.getElementById('avisoErro');
    const userData = {
        emailCad : emailUser,
        passCad : senhaUser
    };

    fetch('/loginUser-empresas', {
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
          avisoSucesso.style.display = 'block';
          document.cookie = `username=${data.userCad}; path=/;`;
          setTimeout(() => {
            avisoSucesso.style.display = 'none';
            window.location.href = '/cpq/inicio';
          }, 3000);
        } else {
          // Exibir mensagem de erro
          avisoErro.style.display = 'block';
          setTimeout(() => {
            avisoErro.style.display = 'none';
          }, 3000);
        }
      })
      .catch(error => {
        avisoErro.style.display = 'block';
        setTimeout(() => {
          avisoErro.style.display = 'none';
        }, 3000);
      });   
});