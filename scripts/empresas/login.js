const mostrarSenha = document.getElementById('mostrarSenha');
const ocultarSenha = document.getElementById('ocultarSenha');
const mostrarSenha2 = document.getElementById('mostrarSenha2');
const ocultarSenha2 = document.getElementById('ocultarSenha2');
const senhaUser = document.getElementById('senha');
const senhaUser2 = document.getElementById('senha2');
const btnLoginEmail = document.getElementById('btnLoginEmail');
const btnLoginCnpj = document.getElementById('btnLoginCnpj');
const cnpjUser = document.getElementById('cnpj');

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

//Formatando o Cnpj
cnpjUser.addEventListener('input', () => {
  let cnpjValue = cnpjUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
  if (cnpjValue.length > 14) {
      cnpjValue = cnpjValue.slice(0, 14); // Limite o comprimento a 14 caracteres
  }
  // Formata o CNPJ com pontos, barra e traço
  cnpjValue = cnpjValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

  cnpjUser.value = cnpjValue; // Define o valor formatado de volta no campo
});

cnpjUser.addEventListener('keyup', () => {
  const cnpjValue = cnpjUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
  if (cnpjValue.length !== 14) {
      cnpjUser.style.color = 'red';
      cnpjUser.style.borderColor = 'red';
  } else {
      cnpjUser.style.color = 'black';
      cnpjUser.style.borderColor = 'green';
  }
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

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
      let date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + "; path=/" + expires;
}

function getCookie(name) {
  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document.getElementById('btnCnpj').addEventListener('click', () => {
  setCookie("cnpj", 1, 7);
  window.location.href = '/cpq/esqueci-senha';
});