document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditarProduto');
    const btnSalvarProd = document.getElementById('btnSalvarProd');
    const carregamento = document.getElementById('carregamento');
    const avisoGeral = document.getElementById('avisoGeral');
    const erroUsuario = document.getElementById('erroUsuario');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const produtoId = getQueryParam('id');
    console.log('Produto ID:', produtoId);

    if (produtoId) {
        fetch(`/api/produtos/${produtoId}`)
            .then(response => response.json())
            .then(produto => {
                console.log('Produto:', produto);

                form.nomeProd.value = produto.nome || '';
                form.descProd.value = produto.descricao || '';
                form.valorProd.value = produto.valor || '';
                form.categoriaProd.value = produto.categoria || '';
                form.raioProd.value = produto.raio || '';

                if (produto.imagem) {
                    document.getElementById('imagem1').src = produto.imagem;
                }
                if (produto.imagem2) {
                    document.getElementById('imagem2').src = produto.imagem2;
                }
                if (produto.imagem3) {
                    document.getElementById('imagem3').src = produto.imagem3;
                }
                if (produto.imagem4) {
                    document.getElementById('imagem4').src = produto.imagem4;
                }
                if (produto.gabarito) {
                    document.getElementById('downloadGabarito').style.display = 'block';
                    document.getElementById('downloadGabarito').href = produto.gabarito;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar o produto:', error);
            });
    } else {
        console.error('Produto ID não encontrado na URL');
    }

    btnSalvarProd.addEventListener('click', (e) => {
        carregamento.style.display = 'block';
        e.preventDefault();

        const formData = new FormData(form);

        fetch(`/editar-produto/${produtoId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                erroUsuario.style.display = 'block';
                setTimeout(() => {
                    window.location.reload();
                    erroUsuario.style.display = 'none';
                }, 3000);
            } else {
                carregamento.style.display = 'none';
                avisoGeral.style.display = 'block';
                setTimeout(() => {
                    window.location.reload();
                    avisoGeral.style.display = 'none';
                },3000);
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar o produto:', error);
        });
    });
});