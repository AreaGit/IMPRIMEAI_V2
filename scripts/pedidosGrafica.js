fetch('/pedidos-cadastrados')
.then(response => response.json())
.then(data => {
    console.log(data);          
})
.catch(error => console.error('Erro ao buscar pedidos:', error));