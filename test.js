const autocannon = require('autocannon');

const url = 'https://imprimeai.com.br';

const instance = autocannon({
  url,
  connections: 50,     // -c
  duration: 20,        // -d
  pipelining: 10,      // -p
  headers: {
    'User-Agent': 'Mozilla/5.0' // -H
  }
}, (err, result) => {
  if (err) {
    console.error('Erro ao rodar o teste de carga:', err);
    process.exit(1);
  } else {
    console.log('Teste de carga finalizado.');
    console.log(result);
  }
});

// Para mostrar progresso no terminal
autocannon.track(instance);