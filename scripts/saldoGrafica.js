document.addEventListener('DOMContentLoaded', async() => {
    const saldoGrafica = document.getElementById('valorDisp');
    try {
        const response = await fetch('/api/saldo-grafica');
        const data = await response.json();
        console.log(data)
        if(data.adminBalance == undefined) {
            saldoGrafica.textContent = "R$ 0.00"
        } else {
            saldoGrafica.textContent = "R$ " + data.adminBalance;
        }
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
    }
});

const btnSacar = document.getElementById('btnSacar');
btnSacar.addEventListener('click', async() => {
    
});