document.addEventListener('DOMContentLoaded', () => {
    const nomeProd = document.getElementById('nomeProd');
    const descProd = document.getElementById('descProd');
    const valorProd = document.getElementById('valorProd');
    const imgProd = document.getElementById('imgProd');
    const imgProd2 = document.getElementById('imgProd2');
    const imgProd3 = document.getElementById('imgProd3');
    const imgProd4 = document.getElementById('imgProd4');
    const gabaritoProd = document.getElementById('gabaritoProd');
    const categoriaProd = document.getElementById('categoriaProd');
    const raioProd = document.getElementById('raioProd');
    const materialInput = document.getElementById('material');
    const formatoInput = document.getElementById('formato');
    const enobrecimentoInput = document.getElementById('enobrecimento');
    const corInput = document.getElementById('cor');
    const acabamentoInput = document.getElementById('acabamento');
    const quantidadesInput = document.getElementById('quantidades')
    const btnCadProd = document.getElementById('btnCadProd');

    btnCadProd.addEventListener('click', cadastrarProduto);

    function cadastrarProduto(event) {
        event.preventDefault();

        const produto = {
            nomeProd: nomeProd.value,
            descProd: descProd.value,
            valorProd: parseFloat(valorProd.value),
            categoriaProd: categoriaProd.value,
            raioProd: parseInt(raioProd.value),
            imgProd: imgProd.value,
            imgProd2: imgProd2.value,
            imgProd3: imgProd3.value,
            imgProd4: imgProd4.value,
            gabaritoProd: gabaritoProd.files[0],
            // Coleta os valores dos campos de entrada
            material: materialInput.value,
            formato: formatoInput.value,
            enobrecimento: enobrecimentoInput.value,
            cor: corInput.value,
            acabamento: acabamentoInput.value,
            quantidades: quantidadesInput.value,
        };

        // Converte os valores em arrays
        produto.material = produto.material.split(',').map(item => item.trim());
        produto.formato = produto.formato.split(',').map(item => item.trim());
        produto.enobrecimento = produto.enobrecimento.split(',').map(item => item.trim());
        produto.cor = produto.cor.split(',').map(item => item.trim());
        produto.acabamento = produto.acabamento.split(',').map(item => item.trim());
        produto.quantidades = produto.quantidades.split(',').map(item => item.trim());

        const formData = new FormData();
        for (const key in produto) {
            if (Array.isArray(produto[key])) {
                // Converte arrays para strings JSON
                formData.append(key, JSON.stringify(produto[key]));
            } else {
                formData.append(key, produto[key]);
            }
        }

        fetch('/cadastrar-produto', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Limpar os campos do formulário, se necessário
            nomeProd.value = '';
            descProd.value = '';
            valorProd.value = '';
            imgProd.value = '';
            imgProd2.value = '';
            imgProd3.value = '';
            imgProd4.value = '';
            gabaritoProd.value = '';
            categoriaProd.value = '';
            raioProd.value = '';
            materialInput.value = '';
            formatoInput.value = '';
            enobrecimentoInput.value = '';
            corInput.value = '';
            acabamentoInput.value = '';
            quantidadesInput.value = '';
        })
        .catch(error => console.error(error));
    }
});