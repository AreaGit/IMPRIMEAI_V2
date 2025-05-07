const userId = 1; // Troque pelo ID do usuário autenticado
    
        async function carregarPedidos() {
          const res = await fetch(`/pedidos/usuario/${userId}`);
          const pedidos = await res.json();
    
          const container = document.getElementById('pedidos');
          container.innerHTML = '';
    
          if (!pedidos.length) {
            container.innerHTML = '<p>Sem pedidos encontrados.</p>';
            return;
          }
    
          pedidos.forEach(pedido => {
            const div = document.createElement('div');
            div.classList.add('pedido');
    
            div.innerHTML = `
              <h2>Pedido #${pedido.id}</h2>
              <p><strong>Data:</strong> ${new Date(pedido.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> ${pedido.statusPed}</p>
              <p><strong>Total:</strong> R$ ${pedido.valorPed.toFixed(2)}</p>
              <p><strong>Forma de Pagamento:</strong> ${pedido.metodPag}</p>
              
              <h3>Itens</h3>
              <ul>
                ${pedido.itenspedidos.map(item => `
                  <li>
                    ${item.nomeProd} - Quantidade: ${item.quantidade}, Valor: R$ ${item.valorProd}
                  </li>
                `).join('')}
              </ul>
    
              <h3>Endereço</h3>
              ${
                pedido.enderecos.length > 0
                  ? pedido.enderecos.map(end => `
                    <p>${end.rua}, ${end.numero} - ${end.bairro} - ${end.cidade}/${end.estado} - CEP: ${end.cep}</p>
                  `).join('')
                  : '<p>Nenhum endereço cadastrado.</p>'
              }
            `;
    
            container.appendChild(div);
          });
        }
    
        carregarPedidos();