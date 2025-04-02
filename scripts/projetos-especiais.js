document.addEventListener("DOMContentLoaded", function () {
    const telefoneUser = document.getElementById('celular');
    let validTelefoneUser = false;

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
            validTelefoneUser = false
        } else {
            validTelefoneUser = true
        }
    });

    document.querySelector("button[type='submit']").addEventListener("click", function (event) {
        event.preventDefault(); // Impede o envio padrão

        const formData = new FormData();
        formData.append("nome", document.getElementById("nome").value);
        formData.append("celular", document.getElementById("celular").value);
        formData.append("quantidade", document.getElementById("quantidade").value);
        formData.append("largura", document.getElementById("largura").value);
        formData.append("altura", document.getElementById("altura").value);
        formData.append("impressao", document.getElementById("impressao").value);
        formData.append("material", document.getElementById("material").value);
        formData.append("acabamento", document.getElementById("acabamento").value);
        formData.append("cobertura", document.getElementById("cobertura").value);
        formData.append("observacoes", document.getElementById("observacoes").value);

        const anexo = document.getElementById("anexo").files[0];
        if (anexo) {
            formData.append("anexo", anexo);
        }

        fetch("/solicitar-orcamento", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert("Pedido enviado com sucesso!");
            console.log(data);
        })
        .catch(error => {
            alert("Erro ao enviar o pedido.");
            console.error(error);
        });
    });
});
