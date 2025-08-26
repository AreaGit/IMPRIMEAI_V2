const btnEnviar = document.getElementById('btnEnviar');
const nomeCliente = document.getElementById('nomeCliente');
const rua = document.getElementById('rua');
const numeroRua = document.getElementById('numeroRua');
const complemento = document.getElementById('complemento');
const cepUser = document.getElementById('cep');
const estado = document.getElementById('estado');
const cidade = document.getElementById('cidade');
const bairro = document.getElementById('bairro');
const email = document.getElementById('email');
const telefone = document.getElementById('telefone');
const avisoGeral = document.getElementById('avisoGeral');
const erroEndereco = document.getElementById('erroEndereco');
let downloadLinks = []; // Array para armazenar todos os links de download
let tipo;

document.addEventListener('DOMContentLoaded', async() => {
    try {
        const response = await fetch('/api/carrinho');

        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do carrinho');
        }

        const data = await response.json();
        console.log(data);
        if(data[0].tipo) {
            tipo = data[0].tipo;
            console.log(tipo)
        }
        // Itera sobre todos os produtos no carrinho e armazena seus links de download
        data.forEach(produto => {
            if (produto.downloadLink) {
                downloadLinks.push({
                    produtoId: produto.produtoId,
                    downloadLink: produto.downloadLink
                });
            }
        });

        console.log(downloadLinks); // Exibe todos os links de download no console

    } catch(err) {
        console.log(err);
    }
});
nomeCliente.addEventListener("keyup", () => {
    if(nomeCliente.value.length <= 4) {
        nomeCliente.style.borderColor = "red";
        nomeCliente.style.color = "red";
    } else {
        nomeCliente.style.borderColor = "green";
        nomeCliente.style.color = "black";
    }
});

rua.addEventListener("keyup", () => {
    if(rua.value.length <= 4) {
        rua.style.borderColor = "red";
        rua.style.color = "red";
    } else {
        rua.style.borderColor = "green";
        rua.style.color = "black";
    }
});

numeroRua.addEventListener("keyup", () => {
    if(numeroRua.value.length <= 0) {
        numeroRua.style.borderColor = "red";
        numeroRua.style.color = "red";
    } else {
        numeroRua.style.borderColor = "green";
        numeroRua.style.color = "black";
    }
});

async function preencherEndereco(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            console.log(data)
            cidade.value = data.localidade;
            estado.value = data.uf;
            bairro.value = data.bairro;
            rua.value = data.logradouro;

            rua.style.borderColor = 'green';
            valdRua = true;
            cidade.style.borderColor = 'green';
            validCidade = true;
            estado.style.borderColor = 'green';
            validEstado = true;
            bairro.style.borderColor = 'green';
            validBairro = true;
        } else {
            console.error('CEP não encontrado');
        }
    } catch (error) {
        console.error('Ocorreu um erro ao buscar o CEP:', error);
    }
}
//Formatando o campo ce CEP
cep.addEventListener('input', () => {
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

//Formatando campo de E-mail do usuário
email.addEventListener('keyup', () => {
    const emailValue = email.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(emailValue)) {
        email.setAttribute('style', 'color: red; border-color: red;');
        validEmail = false;
    } else {
        email.setAttribute('style', 'color: black; border-color: green;');
        validEmail = true;
    }
});

//Formatando campo de Telefone do usuário
telefone.addEventListener('input', () => {
    let telefoneValue = telefone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (telefoneValue.length > 11) {
        telefoneValue = telefoneValue.slice(0, 11); // Limite o comprimento a 11 caracteres
    }

    // Formata o telefone com parênteses e traço (por exemplo, (99) 99999-9999)
    telefoneValue = telefoneValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

    telefone.value = telefoneValue; // Define o valor formatado de volta no campo
});

telefone.addEventListener('keyup', () => {
    const telefoneValue = telefone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if(telefone.value.length <= 11) {
        telefone.setAttribute('style', 'color: red; border-color: red;')
        validTelefone = false
    } else {
        telefone.setAttribute('style', 'color: black; border-color: green;')
        validTelefone = true
    }
});

btnEnviar.addEventListener("click", () => {
    const nomeCliente = document.getElementById('nomeCliente').value;
    const rua = document.getElementById('rua').value;
    const numeroRua = document.getElementById('numeroRua').value;
    const complemento = document.getElementById('complemento').value;
    const cep = document.getElementById('cep').value;
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    
    const enderecoData = {
        nomeCliente : nomeCliente,
        rua : rua,
        numeroRua : numeroRua,
        complemento : complemento,
        cep : cep,
        estado : estado,
        cidade : cidade,
        bairro : bairro,
        email : email,
        telefone : telefone,
        downloadLinks : downloadLinks,
    };
    fetch('/salvar-endereco-no-carrinho', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
    },
        body: JSON.stringify({ enderecoData })
    })
    .then((response) => response.json())
    .then((data) => {
    if (data.success) {
        avisoGeral.style.display = 'block';
        window.setTimeout(() => {
            avisoGeral.style.display = 'none';
            if(tipo === "Empresas"){
                window.location.href = '/pagamento-empresas'
            } else{
                window.location.href = '/pagamento'
            }
        },5000);
    } else {
        erroEndereco.style.display = 'block';
        window.setTimeout(() => {
            erroEndereco.style.display = 'none';
            window.location.reload();
        },2000);
    }
        })
    .catch((error) => {
        console.error('Erro ao fazer a solicitação:', error);
        erroEndereco.style.display = 'block';
        window.setTimeout(() => {
            erroEndereco.style.display = 'none';
            window.location.reload();
        },5000);
    });
});