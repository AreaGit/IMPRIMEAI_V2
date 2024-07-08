document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formEditarGrafica');
    const btnSalvarGrafica = document.getElementById('btnSalvarGrafica');
    const carregamento = document.getElementById('carregamento');
    const avisoGeral = document.getElementById('avisoGeral');
    const erroUsuario = document.getElementById('erroUsuario');
  
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
  
    const graficaId = getQueryParam('id');
    console.log('Gráfica Id:', graficaId);
  
    if (graficaId) {
      fetch(`/api/graficas/${graficaId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao buscar dados da gráfica');
          }
          return response.json();
        })
        .then(grafica => {
          console.log(grafica);
          const jsonInput = JSON.stringify(grafica.produtos);
          // Remover as chaves e aspas
          const produtosArray = Object.keys(JSON.parse(jsonInput)).map(key => key);
          // Converter array em string separada por vírgulas
          const produtosString = produtosArray.join(', ');
          form.nome.value = grafica.userCad;
          form.email.value = grafica.emailCad;
          form.estado.value = grafica.estadoCad;
          form.cidade.value = grafica.cidadeCad;
          form.endereco.value = grafica.enderecoCad;
          form.cep.value = grafica.cepCad;
          form.cnpj.value = grafica.cnpjCad;
          form.telefone.value = grafica.telefoneCad;
          form.produtos.value = produtosString;
          form.banco.value = grafica.bancoCad;
          form.agencia.value = grafica.agenciaCad;
          form.conta.value = grafica.contaCorrente;
        })
        .catch(error => {
          console.error('Erro:', error);
          erroUsuario.textContent = 'Erro ao carregar dados da gráfica';
          erroUsuario.style.display = 'block';
        });
  
      btnSalvarGrafica.addEventListener('click', (e) => {
        carregamento.style.display = 'block';
        e.preventDefault();
  
        // Validação de formulário (adicione conforme necessário)
        if (!form.nome.value || !form.email.value || !form.estado.value || !form.cidade.value || !form.endereco.value || !form.cep.value || !form.cnpj.value || !form.telefone.value || !form.produtos.value || !form.banco.value || !form.agencia.value || !form.conta.value) {
          erroUsuario.textContent = 'Todos os campos são obrigatórios';
          erroUsuario.style.display = 'block';
          carregamento.style.display = 'none';
          return;
        }
  
        const formData = new FormData(form);
  
        fetch(`/editar-grafica/${graficaId}`, {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            carregamento.style.display = 'none';
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
            console.error('Erro:', error);
        });
      });
    }
  });
  