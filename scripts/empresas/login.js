const mostrarSenha = document.getElementById('mostrarSenha');
const ocultarSenha = document.getElementById('ocultarSenha');
const mostrarSenha2 = document.getElementById('mostrarSenha2');
const ocultarSenha2 = document.getElementById('ocultarSenha2');
const senhaUser = document.getElementById('senha');
const senhaUser2 = document.getElementById('senha2');
const btnLoginEmail = document.getElementById('btnLoginEmail');
const btnLoginCnpj = document.getElementById('btnLoginCnpj');

document.addEventListener('DOMContentLoaded', () => {
  btnLoginCnpj.addEventListener('click', () => {
    document.getElementById('loginEmail').style.display = 'none';
    document.getElementById('loginCnpj').style.display = 'block';
  });
  btnLoginEmail.addEventListener('click', () => {
    document.getElementById('loginEmail').style.display = 'block';
    document.getElementById('loginCnpj').style.display = 'none';
  });
})
//Mostrar a senha
mostrarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "text");
});
//Ocultar a senha
ocultarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "password");
});

//Mostrar a senha
mostrarSenha2.addEventListener("click", () => {
  senhaUser2.setAttribute("type", "text");
});
//Ocultar a senha
ocultarSenha2.addEventListener("click", () => {
  senhaUser2.setAttribute("type", "password");
});

const btnCad = document.getElementById('btnCad');
const btnCadCnpj = document.getElementById('btnCadCnpj');

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

btnCadCnpj.addEventListener('click', () => {
  const cnpjUser = document.getElementById('cnpj').value;
  const senhaUser = document.getElementById('senha2').value;
  const avisoSucesso = document.getElementById('avisoSucesso');
  const avisoErro = document.getElementById('avisoErro');
  const userData = {
      cnpjCad : cnpjUser,
      passCad : senhaUser
  };

  fetch('/loginUserCnpj-empresas', {
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