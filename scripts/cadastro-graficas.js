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
