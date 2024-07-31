let amount;

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
            amount = data.adminBalance;
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

    } catch(error) {
        console.log(error)
    }
});