document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api-graf/produtos');
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

const nome = document.getElementById('nomeParceiro');
let validNome;
const localidade = document.getElementById('localidadeParceiro');
let validLocalidade;
const telefone = document.getElementById('telefoneParceiro');
let validTelefone;
const email = document.getElementById('emailParceiro');
let validEmail;
const mensagem = document.getElementById('mensagemParceiro');
let validMensagem;

nome.addEventListener('keyup', () => {
    if(nome.value.length <= 4) {
        nome.style.borderColor = 'red';
        nome.style.color = 'red';
        validNome = false
    } else {
        nome.style.borderColor = 'green';
        nome.style.color = 'black';
        validNome = true
    }
});

localidade.addEventListener('keyup', () => {
    if(localidade.value.length <= 4) {
        localidade.style.borderColor = 'red';
        localidade.style.color = 'red';
        validLocalidade = false
    } else {
        localidade.style.borderColor = 'green';
        localidade.style.color = 'black';
        validLocalidade = true
    }
});

telefone.addEventListener('input', () => {
    let telefoneValue = telefone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (telefoneValue.length > 11) {
        telefoneValue = telefoneValue.slice(0, 11); // Limite o comprimento a 11 caracteres
    }

    // Verifica se o número tem 8 ou 9 dígitos após o DDD e formata adequadamente
    if (telefoneValue.length <= 10) {
        telefoneValue = telefoneValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'); // Formato (99) 9999-9999
    } else {
        telefoneValue = telefoneValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Formato (99) 99999-9999
    }

    telefone.value = telefoneValue; // Define o valor formatado de volta no campo
});

telefone.addEventListener('keyup', () => {
    const telefoneValue = telefone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    // Verifica se o comprimento está correto para um número de telefone (10 ou 11 dígitos após a remoção dos parênteses)
    if (telefoneValue.length < 10 || telefoneValue.length > 11) {
        telefone.setAttribute('style', 'color: red; border-color: red;');
        validTelefone = false;
    } else {
        telefone.setAttribute('style', 'color: black; border-color: green;');
        validTelefone = true;
    }
});

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

mensagem.addEventListener('keyup', () => {
    if(mensagem.value <= 4) {
        mensagem.style.color = 'red';
        mensagem.style.borderColor = 'red';
        validMensagem = false;
    } else {
        mensagem.style.color = 'black';
        mensagem.style.borderColor = 'green';
        validMensagem = true;
    }
});

document.getElementById('enviarDados').addEventListener('click', () => {
    const nome = document.getElementById('nomeParceiro').value;
    const localidade = document.getElementById('localidadeParceiro').value;
    const telefone = document.getElementById('telefoneParceiro').value;
    const email = document.getElementById('emailParceiro').value;
    const mensagem = document.getElementById('mensagemParceiro').value;
    const checkboxElements = document.querySelectorAll('#checkboxProdutos input[type="checkbox"]:checked');
    const produtosMarcados = Array.from(checkboxElements).map(checkbox => checkbox.id.replace('check', ''));
    const avisoUser = document.getElementById('avisoUser');
    const avisoLocalidade = document.getElementById('avisoLocalidade');
    const avisoTelefone = document.getElementById('avisoTelefone');
    const avisoEmail = document.getElementById('avisoEmail');
    const avisoMensagem = document.getElementById('avisoMensagem');
    const avisoGeral = document.getElementById('avisoGeral');

    const jsonData = {
        produtos: produtosMarcados.reduce((acc, produto) => {
            acc[produto] = true;
            return acc;
        }, {}),
    };

    if(validNome == false) {
        //AVISO
        avisoUser.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else if(validLocalidade == false) {
        //AVISO
        avisoLocalidade.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else if(validTelefone == false) {
        //AVISO
        avisoTelefone.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else if(validEmail == false) {
        //AVISO
        avisoEmail.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else if(validMensagem == false) {
        //AVISO
        avisoMensagem.style.display = 'block';
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else {
        const dadosParceiro = {
            nome: nome,
            localidade: localidade,
            telefone: telefone,
            email: email,
            mensagem: mensagem
        };
        fetch('/solicitar-parceiro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...dadosParceiro, ...jsonData }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => {
            console.log(error)
        });
    }
});