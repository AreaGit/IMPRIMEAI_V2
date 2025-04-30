async function carregarDadosUsuario() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    if (!userId) return;

    const res = await fetch(`/perfil/dados-adm?id=${userId}`);
    const data = await res.json();
  
    document.getElementById('nome').value = data.userCad || '';
    document.getElementById('rua').value = data.endereçoCad || '';
    document.getElementById('numero').value = data.numCad || '';
    document.getElementById('complemento').value = data.compCad || '';
    document.getElementById('estado').value = data.estadoCad || '';
    document.getElementById('cidade').value = data.cidadeCad || '';
    document.getElementById('bairro').value = data.bairroCad || '';
    document.getElementById('cpf').value = data.cpfCad || '';
    document.getElementById('telefone').value = data.telefoneCad || '';
    document.getElementById('email').value = data.emailCad || '';
    document.getElementById('saldo').value = data.saldoCarteira || '0.00';
    document.getElementById('senha').value = ''; // nunca exibe senha
}  

carregarDadosUsuario();

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        nome: document.getElementById('nome').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        estado: document.getElementById('estado').value,
        cidade: document.getElementById('cidade').value,
        bairro: document.getElementById('bairro').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        saldo: parseFloat(document.getElementById('saldo').value)
    };

    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    
    const res = await fetch(`/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const message = document.getElementById('message');
    const result = await res.json();
    
    if (res.ok) {
        message.style.color = '#015524';
        message.textContent = 'Usuário atualizado com sucesso!';
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    } else {
        message.style.color = '#EF4126';
        message.textContent = result.message || 'Erro ao atualizar usuário.';
        setTimeout(() => {
            window.location.reaload();
        }, 5000);
    }
});