// Função para carregar e exibir as gráficas na página
async function carregarGraficas() {
    try {
        // Obtém os dados do usuário
        const responseUsuario = await fetch('/perfil/dados');
        if (!responseUsuario.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await responseUsuario.json();

        const nomeCliente = data.userCad;
        const enderecoCad = data.endereçoCad;
        const numCad = data.numCad;
        const compCad = data.compCad;
        const bairroCad = data.bairroCad;
        const cepCad = data.cepCad;
        const cidadeCad = data.cidadeCad;
        const telefoneCad = data.telefoneCad;
        const estadoCad = data.estadoCad;
        const email = data.emailCad;
        const usuario = {
            nomeCliente : nomeCliente,
            rua : enderecoCad,
            numeroRua : numCad,
            complemento : compCad,
            cep : cepCad,
            estado : estadoCad,
            cidade : cidadeCad,
            bairro : bairroCad,
            email : email,
            telefone : telefoneCad
        };

        // Converte os dados do usuário em uma string de consulta
        const queryParams = new URLSearchParams(usuario).toString();

        // Constrói a URL da rota /graficas com os dados do usuário como parâmetros de consulta
        const urlGraficas = `/graficas?${queryParams}`;

        // Faz uma solicitação GET para a rota /graficas
        const responseGraficas = await fetch(urlGraficas);
        if (!responseGraficas.ok) {
            throw new Error('Erro ao buscar as gráficas');
        }

        // Extrai os dados JSON da resposta
        const graficas = await responseGraficas.json();

        // Limpa o conteúdo atual da lista de gráficas
        const listaGraficas = document.getElementById('lista-graficas');
        listaGraficas.innerHTML = '';

        // Itera sobre os dados das gráficas e cria elementos para exibição na página
        graficas.forEach(grafica => {
            const nome = document.createElement('p');
            nome.textContent = grafica.userCad;

            const endereco = document.createElement('p');
            endereco.textContent = grafica.enderecoCad;

            const graficaDiv = document.createElement('div');
            graficaDiv.className = "caixa";
            graficaDiv.appendChild(nome); 
            graficaDiv.appendChild(endereco); 

            listaGraficas.appendChild(graficaDiv); 
        });
    } catch (error) {
        console.error('Erro ao carregar as gráficas:', error);
    }
}

// Chama a função para carregar as gráficas quando a página carrega
document.addEventListener('DOMContentLoaded', carregarGraficas);