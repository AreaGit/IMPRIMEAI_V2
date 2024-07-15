document.addEventListener('DOMContentLoaded', () => {
    // Realiza uma solicitação AJAX para obter os produtos da categoria "Comunicação Visual"
    fetch('/api/produtos/adesivos-etiquetas')
      .then((response) => response.json())
      .then((data) => {
        // Obtém a seção de produtos onde os cards de produtos serão inseridos
        const produtosSection = document.getElementById('produtos');
  
        // Loop através dos produtos e gera as divs com a classe 'cxProd'
        data.produtos.forEach((produto) => {
          // Cria uma div para o produto
          const produtoDiv = document.createElement('div');
          produtoDiv.classList.add('cxProd');
          produtoDiv.addEventListener("click", () => {
            window.location.href = `/detalhes-produtos?id=${produto.id}`;
          });
          produtoDiv.style.cursor = 'pointer';
  
          // Define o conteúdo da div do produto
          produtoDiv.innerHTML = `
            <h2>${produto.nomeProd}</h2>
            <img src="${produto.imgProd}" alt="...">
            <p>A partir de <br> R$ ${produto.valorProd.toFixed(2)}</p>
            <a href="detalhes-produtos?id=${produto.id}">Comprar</a>
          `;
  
          // Adiciona a div do produto à seção de produtos
          produtosSection.appendChild(produtoDiv);
        });
      })
      .catch((error) => console.error(error));
});