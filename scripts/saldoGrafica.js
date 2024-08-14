let amount;
let amountDesc;
const avisoSaque = document.getElementById('avisoSaque');
const erroSaque = document.getElementById('avisoErroSaque');
const avisoValor = document.getElementById('avisoValor');
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

const idGrafica = getCookie("graficaId");

document.addEventListener('DOMContentLoaded', async () => {
    const saldoGrafica = document.getElementById('valorDisp');
    try {
        // Realizar a requisição para obter o saldo da gráfica
        const response = await fetch(`/api/saldo-grafica?graficaId=${idGrafica}`);
        const data = await response.json();
        console.log(data);
        
        // Verificar e exibir o saldo
        if (data.graficaBalance == undefined) {
            saldoGrafica.textContent = "R$ 0.00";
        } else {
            saldoGrafica.textContent = "R$ " + data.graficaBalance;
            amount = data.graficaBalance;
        }
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
    }
});

const btnSacar = document.getElementById('btnSacar');
btnSacar.addEventListener('click', async() => {
    try {
        const response = await fetch(`/api/graficas/${idGrafica}`);
        const data = await response.json();
        const recipient_id = data.recipientId
        if(amount < 3.80) {
            avisoValor.style.display = 'block';
            window.setTimeout(() => {
                window.location.reload();
            }, 5000);
        } else {
        try {
            const response = await fetch('/api/withdraw-grafica', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({amount, recipient_id})
            })

            const data = await response.json();
            console.log(data)

        } catch(error) {
            console.log(error);
        }
    }
    } catch(error) {
        console.log(error)
    }
});

const saldoLiberar = document.getElementById('vrSd');
const divLiberarSaldo = document.getElementById('liberarSaldo');
const divSaldoDisp = document.getElementById('container');

saldoLiberar.addEventListener('click', () => {
    divLiberarSaldo.style.display = 'block'
    divSaldoDisp.style.display = 'none'
});

const fecharSaldo = document.getElementById('fechar-valores');

fecharSaldo.addEventListener('click', () => {
    divLiberarSaldo.style.display = 'none'
    divSaldoDisp.style.display = 'block'
});

document.addEventListener('DOMContentLoaded', async() => {
    const saldoGrafica = document.getElementById('saldoGrafica');
    const totalDesconto = document.getElementById('totalDesconto');
    const valorDescontado = document.getElementById('valorDescontado');
    try {
        // Realizar a requisição para obter o saldo da gráfica
        const response = await fetch(`/api/full-balance-grafica?graficaId=${idGrafica}`);
        const data = await response.json();
        console.log(data);
        
        // Verificar e exibir o saldo
        if (data.total == undefined) {
            saldoGrafica.textContent = "R$ 0.00";
        } else {
            saldoGrafica.textContent = "R$ " + data.total;
            totalDesconto.textContent = "R$ " + data.desconto;
            valorDescontado.textContent = "R$ " + data.valorComDesconto;
            amountDesc = data.valorComDesconto;
        }
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
    }
});

const btnSacarAnt = document.getElementById('btnSacarAnt');
btnSacarAnt.addEventListener('click', async() => {
    try {
        const response = await fetch(`/api/graficas/${idGrafica}`);
        const data = await response.json();
        const recipient_id = data.recipientId
        if(amountDesc < 3.80) {
            avisoValor.style.display = 'block';
            window.setTimeout(() => {
                window.location.reload();
            }, 5000);
        } else {
            try {
                const response = await fetch('/api/full-withdraw-grafica', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({amountDesc, recipient_id})
                })

                const data = await response.json();
                console.log(data)
                avisoSaque.style.display = 'block';
                window.setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } catch(error) {
                console.log(error);
                erroSaque.style.display = 'block';
                window.setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
        }
        } catch(error) {
            console.log(error)
        }
});