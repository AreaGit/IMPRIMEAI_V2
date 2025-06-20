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
const bancoUser = document.getElementById('bancoUser');
let validBancoUser = false;
const contaUser = document.getElementById('contaUser');
let validContaUser = false;
const agenciaUser = document.getElementById('agenciaUser');
let validAgenciaUser = false;
const cnpjUser = document.getElementById('cnpjUser');
let validCnpjUser = false;
const telefoneUser = document.getElementById('telefoneUser');
let validTelefoneUser = false;
const emailUser = document.getElementById('emailUser');
let validEmailUser = false;
const senhaUser = document.getElementById('senhaUser');
let validSenhaUser = false;
const btnCad = document.getElementById('btnCad');
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
const avisoConta = document.getElementById('avisoConta');
const avisoBanco = document.getElementById('avisoBanco');
const avisoAgencia = document.getElementById('avisoAgencia');
let digitoConta
let codBanco
//Formatando campos
nomeUser.addEventListener('keyup', () => {
    if(nomeUser.value.length <= 4) {
        nomeUser.style.color = 'red';
        validNomeUser = false
    }else if(nomeUser.value.length >= 29) {
        nomeUser.style.color = 'red';
        validNomeUser = false
    }
     else {
        nomeUser.style.borderColor = 'green';
        nomeUser.style.color = 'black';
        validNomeUser = true
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
        // Função para normalizar o texto, removendo acentos e convertendo para minúsculas
        // Função para normalizar o texto, removendo acentos e convertendo para minúsculas
        function normalize(text) {
            return text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
        }

        bancoUser.addEventListener('input', () => {
            let bancoNome = normalize(bancoUser.value);

            if (bancoNome.length >= 3) {
                fetch('https://brasilapi.com.br/api/banks/v1')
                    .then(response => response.json())
                    .then(data => {
                        const banco = data.find(b => b.name && normalize(b.name).includes(bancoNome));
                        if (banco) {
                            bancoUser.classList.remove('invalid');
                            bancoUser.classList.add('valid');
                            validBancoUser = true;
                            codBanco = banco.code.toString().padStart(3, '0');
                        } else {
                            bancoUser.classList.remove('valid');
                            bancoUser.classList.add('invalid');
                            validBancoUser = false;
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao buscar dados dos bancos:', error);
                        bancoUser.classList.remove('valid');
                        bancoUser.classList.add('invalid');
                        validBancoUser = false;
                    });
            } else {
                bancoUser.classList.remove('valid');
                bancoUser.classList.add('invalid');
                validBancoUser = false;
            }
        });

contaUser.addEventListener('input', () => {
    let contaValue = contaUser.value.replace(/[^a-zA-Z0-9]/g, ''); // Remove todos os caracteres não alfanuméricos

    // Se a conta estiver sendo apagada, não formatar com hífen
    if (contaValue.length === 0) {
        contaUser.style.color = '';
        contaUser.style.borderColor = '';
        validContaUser = false;
        return;
    }

    if (contaValue.length <= 5) {
        contaUser.style.color = 'red';
        contaUser.style.borderColor = 'red';
        validContaUser = false;
    } else {
        contaUser.style.color = 'black';
        contaUser.style.borderColor = 'green';
        validContaUser = true;
    }

    // Separa a parte numérica e o dígito verificador
    let contaNumerica = contaValue.slice(0, -1);
    let digitoVerificador = contaValue.slice(-1);
    digitoConta = digitoVerificador
    // Formata a conta corrente com traço
    let contaFormatada = `${contaNumerica}-${digitoVerificador}`;
    contaUser.value = contaFormatada; // Define o valor formatado de volta no campo
});

agenciaUser.addEventListener('input', () => {
    let agenciaValue = agenciaUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (agenciaValue.length > 4) {
        agenciaValue = agenciaValue.slice(0, 4); // Limite o comprimento a 4 caracteres
    }

    if(agenciaUser.value.length <= 3) {
        agenciaUser.style.color = 'red';
        agenciaUser.style.borderColor = 'red';
        validAgenciaUser = false;
    } else {
        agenciaUser.style.color = 'black';
        agenciaUser.style.borderColor = 'green';
        validAgenciaUser = true;
    }
    // Formata a agência com ponto
    agenciaValue = agenciaValue.replace(/^(\d{4})$/, '$1');

    agenciaUser.value = agenciaValue; // Define o valor formatado de volta no campo
});
//Formatando campo de CPF do usuário
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
telefoneUser.addEventListener('input', () => {
    let telefoneValue = telefoneUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (telefoneValue.length > 11) {
        telefoneValue = telefoneValue.slice(0, 11); // Limite o comprimento a 11 caracteres
    }

    // Verifica se o número tem 8 ou 9 dígitos após o DDD e formata adequadamente
    if (telefoneValue.length <= 10) {
        telefoneValue = telefoneValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // Formato (99) 9999-9999
    } else {
        telefoneValue = telefoneValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Formato (99) 99999-9999
    }

    telefoneUser.value = telefoneValue; // Define o valor formatado de volta no campo
});

telefoneUser.addEventListener('keyup', () => {
    const telefoneValue = telefoneUser.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    // Verifica se o comprimento está correto para um número de telefone (10 ou 11 dígitos após a remoção dos parênteses)
    if (telefoneValue.length < 10 || telefoneValue.length > 11) {
        telefoneUser.setAttribute('style', 'color: red; border-color: red;');
        validTelefoneUser = false;
    } else {
        telefoneUser.setAttribute('style', 'color: black; border-color: green;');
        validTelefoneUser = true;
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

btnCad.addEventListener('click', async() => {
    const nomeUser = document.getElementById('nomeUser').value;
    const cepUser = document.getElementById('cepUser').value;
    const ruaUser = document.getElementById('ruaUser').value;
    const numResidenciaUser = document.getElementById('numResidenciaUser').value;
    const estadoUser = document.getElementById('estadoUser').value;
    const cidadeUser = document.getElementById('cidadeUser').value;
    const bairroUser = document.getElementById('bairroUser').value;
    const bancoUser = document.getElementById('bancoUser').value;
    const contaUser = document.getElementById('contaUser').value;
    const agenciaUser = document.getElementById('agenciaUser').value;
    const complementoUser = document.getElementById('complementoUser').value;
    const cnpjUser = document.getElementById('cnpjUser').value;
    const telefoneUser = document.getElementById('telefoneUser').value;
    const emailUser = document.getElementById('emailUser').value;
    const senhaUser = document.getElementById('senhaUser').value;        
    const checkboxElements = document.querySelectorAll('#checkboxProdutos input[type="checkbox"]:checked');
    const produtosMarcados = Array.from(checkboxElements).map(checkbox => checkbox.id.replace('check', '').trim());

    const jsonData = {
        produtos: produtosMarcados.reduce((acc, produto) => {
            acc[produto] = true;
            return acc;
        }, {}),
    };

    if(validNomeUser === false) {
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
    } else if(validSenhaUser === false) {
        avisoSenha.style.display = 'block'
        setTimeout(() => {
            avisoSenha.style.display = 'none'
        }, 5000);
    } else if(validTelefoneUser === false) {
        avisoTelefone.style.display = 'block'
        setTimeout(() => {
            avisoTelefone.style.display = 'none'
        }, 5000);
    }else if(validCnpjUser === false) {
        avisoCpf.style.display = 'block'
        setTimeout(() => {
            avisoCpf.style.display = 'none'
        }, 5000);
    }else if(validAgenciaUser === false) {
        avisoAgencia.style.display = 'block'
        setTimeout(() =>  {
            avisoAgencia.style.display = 'none'
        }, 5000);
    }else if(validBancoUser === false) {
        avisoBanco.style.display = 'block'
        setTimeout(() => {
            avisoBanco.style.display = 'none'
        }, 5000);
    }else if(validContaUser === false) {
        avisoConta.style.display = 'block'
        setTimeout(() => {
            avisoConta.style.display = 'none'
        }, 5000)
    }else {
        const graficaData = {
            userCad : nomeUser,
            endereçoCad : ruaUser,
            cepCad : cepUser,
            estadoCad : estadoUser,
            cidadeCad : cidadeUser,
            bairroCad : bairroUser,
            numCad : numResidenciaUser,
            compCad : complementoUser,
            cnpjCad : cnpjUser,
            agenciaCad: agenciaUser,
            bancoCad: bancoUser,
            contaCorrenteCad: contaUser,
            digitoConta: digitoConta,
            codBanco: codBanco,
            telefoneCad : telefoneUser,
            emailCad : emailUser,
            passCad : senhaUser,
        }

        fetch('/cadastro-graficas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...graficaData, ...jsonData }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Gráfica cadastrada com sucesso!') {
                avisoGeral.style.display = 'block'
                setTimeout(() => {
                    avisoGeral.style.display = 'none'
                    window.location.href = "/painel-administrativo"
                }, 5000);
            }else if (data.message === 'Já existe uma Gráfica com este e-mail cadastrado') {
                emailCadastrado.style.display = 'block'
                setTimeout(() => {
                    emailCadastrado.style.display = 'none'
                }, 5000);
            } else {
            // Erro no cadastro
            erroUsuario.style.display = 'block'
            setTimeout(() => {
                erroUsuario.style.display = 'none'
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
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api-graf/produtos');
    const categorias = await response.json();
    const container = document.getElementById('accordionCategorias');

    categorias.forEach(({ categoria, produtos }) => {
      const section = document.createElement('div');
      section.classList.add('categoria-section');

      const header = document.createElement('button');
      header.type = 'button'
      header.className = 'categoria-header';
      header.textContent = categoria;
      header.addEventListener('click', () => {
        content.classList.toggle('show');
      });

      const content = document.createElement('div');
      content.className = 'categoria-content';

      produtos.forEach(produto => {
        const item = document.createElement('div');
        item.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `produto-${produto.id}`;
        checkbox.name = `produto-${produto.id}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = produto.nomeProd;

        item.appendChild(checkbox);
        item.appendChild(label);
        content.appendChild(item);
      });

      section.appendChild(header);
      section.appendChild(content);
      container.appendChild(section);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
});