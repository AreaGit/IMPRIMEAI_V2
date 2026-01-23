const avisoGeral = document.getElementById('avisoGeral');
const erroUsuario = document.getElementById('erroUsuario');
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}
document.getElementById('btn_verificar').addEventListener('click', function(event) {
    event.preventDefault();

    const emailCad = getCookie('email');
    const input1 = document.getElementById('input1').value;
    const input2 = document.getElementById('input2').value;
    const input3 = document.getElementById('input3').value;
    const input4 = document.getElementById('input4').value;

    // Combine the input values to form the verification code
    const verificationCode = input1 + input2 + input3 + input4;


    console.log(emailCad, verificationCode)

    fetch('/verificar-codigo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailCad: emailCad, verificationCode: verificationCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Verificação bem-sucedida!') {
            avisoGeral.style.display = 'block';
            setTimeout(() => {
                avisoGeral.style.display = 'none';
                deleteCookie('email'); // Apaga o cookie de e-mail
                window.location.href = "/login"; // Redirecione para a página de login ou onde desejar
            }, 5000);
        } else {
            erroUsuario.style.display = 'block'; // Mostre a mensagem de erro
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

const inputs = document.querySelectorAll('.inputs input');
inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
            inputs[index - 1].focus();
        }
    });
});