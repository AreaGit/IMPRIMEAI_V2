const carregamento = document.getElementById('carregamento');
const listaProdutos = document.getElementById('lista-produtos');
const listaGraficas = document.getElementById('lista-graficas');
const listaPedidos = document.getElementById('pedidos-list');
const saldo = document.getElementById('container-valor');
const avisoSaque = document.getElementById('avisoSaque');
const erroSaque = document.getElementById('avisoErroSaque');
const avisoValor = document.getElementById('avisoValor');
// Função para obter o valor de um cookie pelo nome
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Exibir o nome do usuário no elemento com id 'nomeAdm'
document.addEventListener('DOMContentLoaded', () => {
    const nomeAdmElement = document.getElementById('nomeAdm');
    const userName = getCookie('username');
    if (userName) {
        nomeAdmElement.textContent = userName;
    } else {
        window.location.href = '/login-adm';
    }
});
document.getElementById('produtos').addEventListener('click', () => {
    const divAddGraficas = document.getElementById('divAddGraficas');
    const containerPedidos = document.getElementById('container-pedidos');
    saldo.style.display = 'none';
    containerPedidos.style.display = 'none'
    divAddGraficas.style.display = 'none';
    carregamento.style.display = 'block';
    listaProdutos.style.display = 'block'
    listaGraficas.style.display = 'none';
    listaPedidos.style.display = 'none'

    fetch('/api/produtos')
        .then(response => response.json())
        .then(async (produtos) => {
            listaProdutos.innerHTML = ''; // Limpa a lista de produtos
            for (const produto of produtos) {
                const produtoDiv = document.createElement('div');
                produtoDiv.classList.add('produto');
                
                const imgProdUrl = await pegarImagemProduto(produto.id);
                
                produtoDiv.innerHTML = `
                    <img src="${imgProdUrl}" alt="${produto.nome}">
                    <h3>${produto.nomeProd}</h3>
                    <a href="/editar-produtos?id=${produto.id}">Editar Produto</a>
                `;
                
                listaProdutos.appendChild(produtoDiv);
            }
            carregamento.style.display = 'none';
        })
        .catch(error => {
            console.error('Erro ao buscar produtos:', error);
        });
});
// Função para pegar a imagem do produto
async function pegarImagemProduto(idProduto) {
    try {
        const imgResponse = await fetch(`/imagens/${idProduto}`);
        if (!imgResponse.ok) {
            throw new Error('Erro ao obter a URL da imagem do produto');
        }
        const imgData = await imgResponse.json();
        return imgData.imgProdUrl;
    } catch (error) {
        console.error('Erro ao carregar a imagem:', error);
        return null;
    }
}
//função ao clicar em gráficas
document.getElementById('graficas').addEventListener('click', () => {
    const carregamento = document.getElementById('carregamento');
    const containerPedidos = document.getElementById('container-pedidos');
    saldo.style.display = 'none';
    containerPedidos.style.display = 'none'
    carregamento.style.display = 'block';
    listaGraficas.style.display = 'block'
    listaPedidos.style.display = 'none';
    listaProdutos.style.display = 'none';
    fetch('/api/graficas')
        .then(response => response.json())
        .then(graficas => {
            const listaGraficas = document.getElementById('lista-graficas');
            const divAddGraficas = document.getElementById('divAddGraficas');
            divAddGraficas.style.display = 'block';
            listaGraficas.innerHTML = '';
            console.log(graficas)
            graficas.forEach(grafica => {
                const graficaDiv = document.createElement('div');
                graficaDiv.classList.add('grafica');
                graficaDiv.innerHTML = `
                    <h3>${grafica.userCad}</h3>
                    <p>ID ${grafica.id}</p>
                    <p>Estado ${grafica.estadoCad}</p>
                    <p>Cidade ${grafica.cidadeCad}</p>
                    <a href="/editar-graficas?id=${grafica.id}">Editar Gráfica</a>
                `;
                listaGraficas.appendChild(graficaDiv);
            });

            carregamento.style.display = 'none';
        })
        .catch(error => {
            console.log('Erro ao buscar gráficas:', error);
            carregamento.style.display = 'none';
        });
});
//função ao clicar em pedidos
document.getElementById('pedidos').addEventListener('click', () => {
    const carregamento = document.getElementById('carregamento');
    const containerPedidos = document.getElementById('container-pedidos');
    const pedidosList = document.getElementById('pedidos-list');
    const totalPedidosFazer = document.getElementById('totalPedidosFazer');
    const totalPedidosAceitos = document.getElementById('totalPedidosAceitos');
    const totalPedidosFinalizados = document.getElementById('totalPedidosFinalizados');
    const totalPedidosEntregues = document.getElementById('totalPedidosEntregues');
    const divAddGraficas = document.getElementById('divAddGraficas');
    saldo.style.display = 'none';
    divAddGraficas.style.display = 'none';
    listaPedidos.style.display = 'block';
    listaGraficas.style.display = 'none';
    listaProdutos.style.display = 'none';
    // Função para buscar e atualizar os contadores de pedidos
    function atualizarContadores() {
        carregamento.style.display = 'block';
        containerPedidos.style.display = 'block';

        fetch('/pedidos-todos')
            .then(response => response.json())
            .then(data => {
                let aguardandoCount = 0;
                let aceitosCount = 0;
                let finalizadosCount = 0;
                let entreguesCount = 0;

                data.pedidos.forEach(pedido => {
                    if (pedido.itenspedidos && pedido.itenspedidos.length > 0) {
                        pedido.itenspedidos.forEach(item => {
                            switch (item.statusPed) {
                                case 'Aguardando':
                                    aguardandoCount++;
                                    break;
                                case 'Pedido Aceito Pela Gráfica':
                                    aceitosCount++;
                                    break;
                                case 'Pedido Enviado pela Gráfica':
                                    finalizadosCount++;
                                    break;
                                case 'Pedido Entregue pela Gráfica':
                                    entreguesCount++;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                });

                totalPedidosFazer.textContent = aguardandoCount;
                totalPedidosAceitos.textContent = aceitosCount;
                totalPedidosFinalizados.textContent = finalizadosCount;
                totalPedidosEntregues.textContent = entreguesCount;

                carregamento.style.display = 'none';
            })
            .catch(error => {
                console.error('Erro ao buscar pedidos:', error);
                carregamento.style.display = 'none';
            });
    }

    // Função para atualizar a lista de pedidos de acordo com o status selecionado
    async function atualizarListaPedidos(status1, status2) {
        const carregamento = document.getElementById('carregamento');
        const pedidosList = document.getElementById('pedidos-list');
        carregamento.style.display = 'block';
    
        try {
            const response = await fetch('/pedidos-todos');
            const data = await response.json();
    
            const pedidosFiltrados = data.pedidos.filter(pedido => {
                if (pedido.itenspedidos && pedido.itenspedidos.length > 0) {
                    return pedido.itenspedidos.some(item => item.statusPed === status1 || (status2 && item.statusPed === status2));
                }
                return false;
            });
    
            pedidosList.innerHTML = '';
            carregamento.style.display = 'none';
    
            for (const pedido of pedidosFiltrados) {
                for (const item of pedido.itenspedidos) {
                    if (item.statusPed === status1 || (status2 && item.statusPed === status2)) {
                        const li = document.createElement('div');
                        li.id = `pedido${item.id}`;
                        li.className = 'cxPedido';
    
                        const dataCriacao = new Date(item.createdAt);
                        const dataFormatada = dataCriacao.toLocaleString('pt-BR');
                        const idProduto = item.idProduto;
                        const imgUrl = await pegarImagemProduto(idProduto);
    
                        li.innerHTML = `
                            <img src="${imgUrl}" alt="${item.nomeProd || 'Produto'}">
                            <h2 class="ped-nome">${item.nomeProd}</h2>
                            <p class="ped-id">ID ${item.id}</p>
                            <p class="ped-valor">R$ ${parseFloat(item.valorProd).toFixed(2)}</p>
                            <p class="ped-quant">${item.quantidade} unidades</p>
                            <p id="dataCriacao">${dataFormatada}</p>
                            <a href="detalhes-pedidoAdm?idPedido=${item.idPed}&idProduto=${item.idProduto}" id="verPed">Detalhes do Pedido</a>
                        `;
                        pedidosList.appendChild(li);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            carregamento.style.display = 'none';
        }
    }

    // Event listeners para cada status
    document.getElementById('pedidosAguardando').addEventListener('click', () => {
        atualizarListaPedidos('Aguardando');
        document.getElementById('pedidosAguardando').style.boxShadow = '-1px 3px 5px #F69896';
        document.getElementById('pedidosAceitos').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosFinalizados').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosEntregues').style.boxShadow = '-1px 3px 5px black';
    });

    document.getElementById('pedidosAceitos').addEventListener('click', () => {
        atualizarListaPedidos('Pedido Aceito Pela Gráfica');
        document.getElementById('pedidosAguardando').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosAceitos').style.boxShadow = '-1px 3px 5px #F69896';
        document.getElementById('pedidosFinalizados').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosEntregues').style.boxShadow = '-1px 3px 5px black';
    });

    document.getElementById('pedidosFinalizados').addEventListener('click', () => {
        atualizarListaPedidos('Pedido Enviado pela Gráfica', 'Finalizado');
        document.getElementById('pedidosAguardando').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosAceitos').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosFinalizados').style.boxShadow = '-1px 3px 5px #F69896';
        document.getElementById('pedidosEntregues').style.boxShadow = '-1px 3px 5px black';
    });

    document.getElementById('pedidosEntregues').addEventListener('click', () => {
        atualizarListaPedidos('Pedido Entregue pela Gráfica');
        document.getElementById('pedidosAguardando').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosAceitos').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosFinalizados').style.boxShadow = '-1px 3px 5px black';
        document.getElementById('pedidosEntregues').style.boxShadow = '-1px 3px 5px #F69896';
    });

    // Atualize os contadores de pedidos ao carregar a página
    atualizarContadores();
});
//função ao clicar em saldo
document.getElementById('saldo').addEventListener('click', async() => {
    const containerValor = document.getElementById('container-valor');
    const containerPedidos = document.getElementById('container-pedidos');
    containerPedidos.style.display = 'none'
    containerValor.style.display = 'block';
    const saldoAdm = document.getElementById('saldoAdm');
    const btnSacar = document.getElementById('btnSacar');
    divAddGraficas.style.display = 'none';
    listaPedidos.style.display = 'none';
    listaGraficas.style.display = 'none';
    listaProdutos.style.display = 'none';

    try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        console.log(data)
        saldoAdm.textContent = data.adminBalance;
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
    }
});
document.getElementById('btnSacar').addEventListener('click', async () => {
    const saldoAdm = document.getElementById('saldoAdm').textContent;
    const amount = parseFloat(saldoAdm);
    if(amount < 3.80) {
        avisoValor.style.display = 'block';
        window.setTimeout(() => {
            window.location.reload();
        }, 5000);
    } else {
        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            console.log('Withdrawal successful:', data);
            avisoSaque.style.display = 'block';
            window.setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            console.error('Erro ao fazer saque:', error);
            erroSaque.style.display = 'block';
            window.setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }
});