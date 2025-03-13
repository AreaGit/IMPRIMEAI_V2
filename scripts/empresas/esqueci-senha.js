document.addEventListener("DOMContentLoaded", function () {
    function mostrarAviso(mensagem, tipo) {
        const aviso = document.getElementById("aviso");
        aviso.textContent = mensagem;
        aviso.className = "aviso " + tipo;
        aviso.style.display = "block";
        setTimeout(() => { aviso.style.display = "none"; }, 3000);
    }
    let emailDaSessao
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


    function updateUI() {
        let etapa = getCookie("etapa") || "0"; // Padrão etapa = 0 se não existir

        document.querySelector(".enviarCodigo").style.display = "none";
        document.querySelector(".inserirCodigo").style.display = "none";
        document.querySelector(".trocarSenha").style.display = "none";

        if (etapa === "0") {
            document.querySelector(".enviarCodigo").style.display = "block";
        } else if (etapa === "1") {
            document.querySelector(".inserirCodigo").style.display = "block";
        } else if (etapa === "2") {
            document.querySelector(".trocarSenha").style.display = "block";
        }
    }

    document.querySelector(".enviarCodigo button").addEventListener("click", function () {
        let email = document.querySelector("#email").value.trim();

        if (email === "") {
            alert("Por favor, insira um e-mail válido.");
            return;
        }

        fetch("/enviar-codigo-cpq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAviso("Código enviado para o e-mail!", "sucesso");
                setCookie("etapa", "1", 7); // Atualiza para etapa 1
                emailDaSessao = email
                updateUI(); // Atualiza a interface
            } else {
                mostrarAviso("Por favor, insira um e-mail válido.", "erro");
            }
        })
        .catch(error => {
            console.error("Erro ao enviar o código:", error);
            mostrarAviso("Por favor, insira um e-mail válido.", "erro");
        });
    });

    document.querySelector(".inserirCodigo button").addEventListener("click", function () {
        let codigo = document.querySelector("#codigo").value.trim();
        let email = emailDaSessao;

        if (codigo === "") {
            alert("Por favor, insira o código de verificação.");
            return;
        }

        fetch("/verificar-codigo-cpq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ codigo, email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAviso("Código verificado com sucesso!", "sucesso");
                setCookie("etapa", "2", 7); // Atualiza para etapa 2
                updateUI(); // Atualiza a interface
            } else {
                mostrarAviso("Código de verificação incorreto.", "erro");
            }
        })
        .catch(error => {
            console.error("Erro ao verificar o código:", error);
            mostrarAviso("Código de verificação incorreto.", "erro");
        });
    });

    document.querySelector(".trocarSenha button").addEventListener("click", function () {
        let senha1 = document.querySelector("#novaSenha").value.trim();
        let senha2 = document.querySelector("#repetirSenha").value.trim();
        let email = emailDaSessao;

        if (senha1 === "" || senha2 === "") {
            alert("Os campos de senha não podem estar vazios.");
            return;
        }

        if (senha1 !== senha2) {
            alert("As senhas não coincidem. Tente novamente.");
            return;
        }

        fetch("/trocar-senha-cpq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, senha: senha1 }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAviso("Senha alterada com sucesso!", "sucesso");
                deleteCookie("etapa");
                deleteCookie("email")
                window.location.href = "/cpq/login";
            } else {
                mostrarAviso("Erro ao trocar a senha. Tente novamente.", "erro");
            }
        })
        .catch(error => {
            console.error("Erro ao trocar a senha:", error);
            mostrarAviso("Ocorreu um erro. Tente novamente mais tarde.", "erro");
        });
    });

    updateUI(); // Configura a interface ao carregar
});
