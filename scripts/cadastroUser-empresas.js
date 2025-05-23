//Abrir e fechar pop-up
const fecharPopup = document.getElementById('fechar-menu');
const abrirTermos = document.getElementById('abrirTermos');
const popup = document.getElementById('popup');

abrirTermos.addEventListener('click', () => {
    popup.style.display = 'block';
});

fecharPopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

//Pegando dados do Usuário
const nomeUser = document.getElementById('nomeUser');
let validNomeUser = false;
const cepUser = document.getElementById('cepUser');
let validCepUser = false;
const ruaUser = document.getElementById('ruaUser');
let validRuaUser = false;
const numResidenciaUser = document.getElementById('numResidenciaUser');
let validNumResidenciaUser = false;
const estadoUser = document.getElementById('estadoUser');
let validEstadoUser = false;
const cidadeUser = document.getElementById('cidadeUser');
let validCidadeUser = false;
const bairroUser = document.getElementById('bairroUser');
let validBairroUser = false
const complementoUser = document.getElementById('complementoUser');
let validComplementoUser = false;
const cnpjUser = document.getElementById('cnpjUser');
let validCnpjUser = false;
const telefoneUser = document.getElementById('telefoneUser');
let validTelefoneUser = false;
const empresaUser = document.getElementById("empresaUser");
let validEmpresaUser = false;
const emailUser = document.getElementById('emailUser');
let validEmailUser = false;
const confirmEmailUser = document.getElementById('confirmEmailUser');
let validConfirmEmailUser = false;
const senhaUser = document.getElementById('senhaUser');
let validSenhaUser = false;
const btnCad = document.getElementById('btnCad');
const btnCad2 = document.getElementById('btnCad2');
const mostrarSenha = document.getElementById('mostrarSenha');
const ocultarSenha = document.getElementById('ocultarSenha');
const avisoUser = document.getElementById('avisoUser');
const avisoCep = document.getElementById('avisoCep');
const avisoEmail = document.getElementById('avisoEmail');
const avisoSenha = document.getElementById('avisoSenha');
const avisoTelefone = document.getElementById('avisoTelefone');
const avisoCpf = document.getElementById('avisoCpf');
const avisoEnderecos = document.getElementById('avisoEnderecos');
const emailCadastrado = document.getElementById('emailCadastrado');
const erroUsuario = document.getElementById('erroUsuario');
const avisoGeral = document.getElementById('avisoGeral');
const avisoConfirmEmail = document.getElementById('emailIncorreto');
const avisoEmpresaUser = document.getElementById('avisoEmpresa');
//Formatando campos
nomeUser.addEventListener('keyup', () => {
    if(nomeUser.value.length <= 4) {
        nomeUser.style.color = 'red';
        validNomeUser = false
    } else {
        nomeUser.style.borderColor = 'green';
        nomeUser.style.color = 'black';
        validNomeUser = true
    }
});

empresaUser.addEventListener('keyup', () => {
    if(empresaUser.value.length <= 1) {
        empresaUser.style.color = 'red';
        validEmpresaUser = false
    } else {
        empresaUser.style.borderColor = 'green';
        empresaUser.style.color = 'black';
        validEmpresaUser = true
    }
});

// Função para preencher os campos de endereço com base no CEP
async function preencherEndereco(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            ruaUser.value = data.logradouro;
            cidadeUser.value = data.localidade;
            estadoUser.value = data.uf;
            bairroUser.value = data.bairro;

            ruaUser.style.borderColor = 'green';
            validRuaUser = true;
            cidadeUser.style.borderColor = 'green';
            validCidadeUser = true;
            estadoUser.style.borderColor = 'green';
            validEstadoUser = true;
            bairroUser.style.borderColor = 'green';
            validBairroUser = true;
        } else {
            console.error('CEP não encontrado');
        }
    } catch (error) {
        console.error('Ocorreu um erro ao buscar o CEP:', error);
    }
}
//Formatando o campo ce CEP
cepUser.addEventListener('input', () => {
    let cep = cepUser.value.replace(/\D/g, ''); // Remover caracteres não numéricos
    
    // Verificar se o CEP tem o comprimento correto
    if (cep.length === 8) {
        cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2'); // Formatando o CEP com traços
        cepUser.value = cep; // Atualizar o valor do campo de CEP
        // Preencher os outros campos com base no CEP
        preencherEndereco(cep);
        cepUser.style.color = 'black';
        cepUser.style.borderColor = 'green';
        validCepUser = true
    } else if (cep.length < 8) {
        cepUser.style.color = 'red';
        validCepUser = false
    }
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
        validCnpjUser = false;
    } else {
        cnpjUser.style.color = 'black';
        cnpjUser.style.borderColor = 'green';
        validCnpjUser = true;
    }
});
//Formatando campo de Telefone do usuário
telefoneUser.addEventListener('input', () => {
    let telefoneValue = telefoneUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (telefoneValue.length > 11) {
        telefoneValue = telefoneValue.slice(0, 11); // Limite o comprimento a 11 caracteres
    }

    // Formata o telefone com parênteses e traço (por exemplo, (99) 99999-9999)
    telefoneValue = telefoneValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

    telefoneUser.value = telefoneValue; // Define o valor formatado de volta no campo
});

telefoneUser.addEventListener('keyup', () => {
    const telefoneValue = telefoneUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if(telefoneUser.value.length <= 11) {
        telefoneUser.setAttribute('style', 'color: red; border-color: red;')
        validTelefoneUser = false
    } else {
        telefoneUser.setAttribute('style', 'color: black; border-color: green;')
        validTelefoneUser = true
    }
});
//Formatando campo de E-mail do usuário
emailUser.addEventListener('keyup', () => {
    const emailValue = emailUser.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(emailValue)) {
        emailUser.setAttribute('style', 'color: red; border-color: red;');
        validEmailUser = false;
    } else {
        emailUser.setAttribute('style', 'color: black; border-color: green;');
        validEmailUser = true;
    }
});
// Formatando e validando o campo de confirmação de e-mail
confirmEmailUser.addEventListener('keyup', () => {
    const emailValue = emailUser.value;
    const confirmEmailValue = confirmEmailUser.value;

    // Verifica se os e-mails são iguais
    if (emailValue === confirmEmailValue) {
        confirmEmailUser.setAttribute('style', 'color: black; border-color: green;');
        validConfirmEmailUser = true;
    } else {
        confirmEmailUser.setAttribute('style', 'color: red; border-color: red;');
        validConfirmEmailUser = false;
    }
});
//Formatando campo de Senha do usuário
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
//Mostrar a senha
mostrarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "text");
});
//Ocultar a senha
ocultarSenha.addEventListener("click", () => {
    senhaUser.setAttribute("type", "password");
});

btnCad.addEventListener('click', () => {
    const nomeUser = document.getElementById('nomeUser').value;
    const cepUser = document.getElementById('cepUser').value;
    const ruaUser = document.getElementById('ruaUser').value;
    const numResidenciaUser = document.getElementById('numResidenciaUser').value;
    const estadoUser = document.getElementById('estadoUser').value;
    const cidadeUser = document.getElementById('cidadeUser').value;
    const bairroUser = document.getElementById('bairroUser').value;
    const complementoUser = document.getElementById('complementoUser').value;
    const cnpjUser = document.getElementById('cnpjUser').value;
    const telefoneUser = document.getElementById('telefoneUser').value;
    const empresaUser = document.getElementById("empresaUser").value;
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;
    const checkboxElements = document.querySelectorAll('#checkboxProdutos input[type="checkbox"]:checked');
    const produtosMarcados = Array.from(checkboxElements).map(checkbox => checkbox.id.replace('check', ''));

    const jsonData = {
        produtos: produtosMarcados.reduce((acc, produto) => {
            acc[produto] = true;
            return acc;
        }, {}),
    };
    
    if(nomeUser.length <= 4) {
        avisoUser.style.display = 'block'
        setTimeout(() => {
            avisoUser.style.display = 'none'
        }, 5000);
    } else if(cepUser.length <= 8) {
        avisoCep.style.display = 'block'
        setTimeout(() => {
            avisoCep.style.display = 'none'
        }, 5000);
    } else if(validEmailUser === false) {
        avisoEmail.style.display = 'block'
        setTimeout(() => {
            avisoEmail.style.display = 'none'
        }, 5000);
    }else if (validConfirmEmailUser === false) {
        avisoConfirmEmail.style.display = 'block'
        setTimeout(() => {
            avisoConfirmEmail.style.display = 'none'
        }, 5000);
    }
     else if(validSenhaUser === false) {
        avisoSenha.style.display = 'block'
        setTimeout(() => {
            avisoSenha.style.display = 'none'
        }, 5000);
    } else if(validTelefoneUser === false) {
        avisoTelefone.style.display = 'block'
        setTimeout(() => {
            avisoTelefone.style.display = 'none'
        }, 5000);
    }else if(validEmpresaUser === false) {
        avisoEmpresaUser.style.display = 'block'
        setTimeout(() => {
            avisoEmpresaUser.style.display = 'none'
        }, 5000);
    }else if(validCnpjUser === false) {
        avisoCpf.style.display = 'block'
        setTimeout(() => {
            avisoCpf.style.display = 'none'
        }, 5000);
    }/*else if(validRuaUser || validEstadoUser || validCidadeUser || validBairroUser || validNumResidenciaUser == false) {
        avisoEnderecos.style.display = 'block'
        setTimeout(() => {
            avisoEnderecos.style.display = 'none'
        }, 5000);
    }*/else {
        const userData = {
            userCad : nomeUser,
            endereçoCad : ruaUser,
            cepCad : cepUser,
            estadoCad : estadoUser,
            cidadeCad : cidadeUser,
            bairroCad : bairroUser,
            numCad : numResidenciaUser,
            compCad : complementoUser,
            cnpjCad : cnpjUser,
            telefoneCad : telefoneUser,
            empresa : empresaUser,
            emailCad : emailUser,
            passCad : senhaUser
        }
        console.log(userData)
        fetch('/cadastrarUser-empresas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({...userData, ...jsonData})
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Usuário cadastrado com sucesso!') {
                avisoGeral.style.display = 'block'
                // Salva o e-mail nos cookies
                document.cookie = `email=${emailUser}; path=/; max-age=31536000`; 
                setTimeout(() => {
                    avisoGeral.style.display = 'none'
                    window.location.href = "/empresas/login"
                }, 5000);
           }else if (data.message === 'Já existe um usuário com este e-mail cadastrado'){
                emailCadastrado.style.display = 'block'
                setTimeout(() => {
                    emailCadastrado.style.display = 'none'
                }, 5000);
            } else {
                emailCadastrado.style.display = 'block'
                setTimeout(() => {
                    emailCadastrado.style.display = 'none'
                }, 5000);
            }
          })
          .catch(error => {
            erroUsuario.style.display = 'block'
            setTimeout(() => {
                erroUsuario.style.display = 'none'
            }, 5000);
          });
    }
});

/*btnCad2.addEventListener('click', () => {
    const nomeUser = document.getElementById('nomeUser').value;
    const cepUser = document.getElementById('cepUser').value;
    const ruaUser = document.getElementById('ruaUser').value;
    const numResidenciaUser = document.getElementById('numResidenciaUser').value;
    const estadoUser = document.getElementById('estadoUser').value;
    const cidadeUser = document.getElementById('cidadeUser').value;
    const bairroUser = document.getElementById('bairroUser').value;
    const complementoUser = document.getElementById('complementoUser').value;
    const cpfUser = document.getElementById('cpfUser').value;
    const telefoneUser = document.getElementById('telefoneUser').value;
    const empresaUser = document.getElementById("empresaUser").value;
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;
    const checkboxElements = document.querySelectorAll('#checkboxProdutos input[type="checkbox"]:checked');
    const produtosMarcados = Array.from(checkboxElements).map(checkbox => checkbox.id.replace('check', ''));

    const jsonData = {
        produtos: produtosMarcados.reduce((acc, produto) => {
            acc[produto] = true;
            return acc;
        }, {}),
    };
    
    if(nomeUser.length <= 4) {
        avisoUser.style.display = 'block'
        setTimeout(() => {
            avisoUser.style.display = 'none'
        }, 5000);
    } else if(cepUser.length <= 8) {
        avisoCep.style.display = 'block'
        setTimeout(() => {
            avisoCep.style.display = 'none'
        }, 5000);
    } else if(validEmailUser === false) {
        avisoEmail.style.display = 'block'
        setTimeout(() => {
            avisoEmail.style.display = 'none'
        }, 5000);
    }else if (validConfirmEmailUser === false) {
        avisoConfirmEmail.style.display = 'block'
        setTimeout(() => {
            avisoConfirmEmail.style.display = 'none'
        }, 5000);
    }
     else if(validSenhaUser === false) {
        avisoSenha.style.display = 'block'
        setTimeout(() => {
            avisoSenha.style.display = 'none'
        }, 5000);
    } else if(validTelefoneUser === false) {
        avisoTelefone.style.display = 'block'
        setTimeout(() => {
            avisoTelefone.style.display = 'none'
        }, 5000);
    }else if(validEmpresaUser === false) {
        avisoEmpresaUser.style.display = 'block'
        setTimeout(() => {
            avisoEmpresaUser.style.display = 'none'
        }, 5000);
    }else if(validCpfUser === false) {
        avisoCpf.style.display = 'block'
        setTimeout(() => {
            avisoCpf.style.display = 'none'
        }, 5000);
    }/*else if(validRuaUser || validEstadoUser || validCidadeUser || validBairroUser || validNumResidenciaUser == false) {
        avisoEnderecos.style.display = 'block'
        setTimeout(() => {
            avisoEnderecos.style.display = 'none'
        }, 5000);
    }*//*else {
        const userData = {
            userCad : nomeUser,
            endereçoCad : ruaUser,
            cepCad : cepUser,
            estadoCad : estadoUser,
            cidadeCad : cidadeUser,
            bairroCad : bairroUser,
            numCad : numResidenciaUser,
            compCad : complementoUser,
            cpfCad : cpfUser,
            telefoneCad : telefoneUser,
            empresa : empresaUser,
            emailCad : emailUser,
            passCad : senhaUser
        }
        console.log(userData)
        fetch('/cadastrarUser-empresas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData, jsonData)
          })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Usuário cadastrado com sucesso!') {
                avisoGeral.style.display = 'block'
                // Salva o e-mail nos cookies
                document.cookie = `email=${emailUser}; path=/; max-age=31536000`; 
                setTimeout(() => {
                    avisoGeral.style.display = 'none'
                    window.location.href = "/empresas/login"
                }, 5000);
           }else if (data.message === 'Já existe um usuário com este e-mail cadastrado'){
                emailCadastrado.style.display = 'block'
                setTimeout(() => {
                    emailCadastrado.style.display = 'none'
                }, 5000);
            } else {
                emailCadastrado.style.display = 'block'
                setTimeout(() => {
                    emailCadastrado.style.display = 'none'
                }, 5000);
            }
          })
          .catch(error => {
            erroUsuario.style.display = 'block'
            setTimeout(() => {
                erroUsuario.style.display = 'none'
            }, 5000);
          });
    }
});*/

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api-empresas/produtos');
        const produtos = await response.json();
        const checkboxContainer = document.getElementById('checkboxProdutos');

        produtos.forEach(produto => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = `check${produto.nomeProd.replace(/\s+/g, ' ')}`;
            checkbox.id = `check ${produto.nomeProd.replace(/\s+/g, ' ')}`;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = produto.nomeProd;

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxContainer.appendChild(document.createElement('br'));
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
});