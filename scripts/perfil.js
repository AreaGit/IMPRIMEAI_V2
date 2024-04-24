const nomeUser = document.getElementById('nomeUser');
const cpfUser = document.getElementById('cpfUser');
const emailUser = document.getElementById('emailUser');
const ruaUser = document.getElementById('ruaUser');
const numRes = document.getElementById('numRes');
const bairroUser = document.getElementById('bairroUser');
const telefoneUser = document.getElementById('telefoneUser');
const cepUser = document.getElementById('cepUser');
const compUser = document.getElementById('compUser');
const estadoUser = document.getElementById('estadoUser');
const cidadeUser = document.getElementById('cidadeUser');

async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfil/dados');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        nomeUser.innerText = `${data.userCad}`
        cpfUser.placeholder = `${data.cpfCad}`
        emailUser.placeholder = `${data.emailCad}`
        ruaUser.placeholder = `${data.endereçoCad}`
        numRes.placeholder = `${data.numCad}`
        bairroUser.placeholder = `${data.bairroCad}`
        telefoneUser.placeholder = `${data.telefoneCad}`
        cepUser.placeholder = `${data.cepCad}`
        if(data.compCad.length <= 0) {
            compUser.placeholder = `Nenhum`
        } else {
            compUser.placeholder = `${data.compCad}`
        }
        estadoUser.placeholder = `${data.estadoCad}`
        cidadeUser.placeholder = `${data.cidadeCad}`
    } catch (error) {
        console.log("erro")
        window.location.href = '/cadastro'
    }
}

carregarInfoUsers();