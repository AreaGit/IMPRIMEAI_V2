document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/empresa/logo', {
      method: 'GET',
      credentials: 'include', // Inclui cookies na requisição
    })
      .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar a logo da empresa.');
      }
      return response.json();
    })
    .then((data) => {
    // Define o caminho da logo na imagem
    const logoElement = document.querySelector('.logoLoja img');
    if (data.logo) {
      logoElement.src = data.logo;
    } else {
      window.location.href = '/empresas/login';
    }
  })
  .catch((error) => {
      console.error('Erro ao carregar a logo:', error);
      window.location.href = '/empresas/login';
      alert('Erro ao carregar a logo da empresa.');
  });
});
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }

  return null; // Retorna null caso o cookie não seja encontrado
}

// Pega o username do cookie
const username = getCookie('userCad');
// Seleciona os elementos
const conviteCad = document.getElementById('conviteCad');
const userLog = document.getElementById('userLog');
const nameUserLog = document.getElementById('nameUserLog');

if (!username) {
  // Mostra o convite para cadastrar e esconde a área logada
  conviteCad.style.display = 'block';
  userLog.style.display = 'none';
} else {
  // Limita o texto a 40 caracteres
  const limitedUsername = username.length > 20 ? `${username.slice(0, 20)}...` : username;

  // Esconde o convite e mostra o nome do usuário
  conviteCad.style.display = 'none';
  userLog.style.display = 'block';
  nameUserLog.textContent = limitedUsername;
}
