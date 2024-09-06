const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configuração do cliente do WhatsApp
const client = new Client({
  puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  authStrategy: new LocalAuth()
});
// Evento para gerar e exibir o QR code
client.on('qr', (qr) => {
  console.log('QR code recebido, escaneie com o WhatsApp para conectar:');
  qrcode.generate(qr, { small: true });
});

// Evento disparado quando o cliente está pronto/conectado
client.on('ready', () => {
  console.log('Cliente WhatsApp está pronto e conectado!');
});

// Evento disparado quando o cliente é desconectado
client.on('disconnected', (reason) => {
  console.log('Cliente foi desconectado. Motivo:', reason);
  console.log('Tentando reconectar...');

  // Reinicialize o cliente
  client.destroy().then(() => {
      client.initialize();
  });
});

// Função para desconectar o cliente
async function disconnectClient() {
  try {
      if (client.pupPage) {
          await client.logout();
          console.log('Cliente desconectado com sucesso.');
      } else {
          console.log('O cliente não está conectado ou já foi desconectado.');
          console.log('Tentando reconectar...');
          await client.destroy(); // Destrua o cliente atual
          client.initialize();    // Recomeça o processo de conexão, gerando um novo QR code
      }
  } catch (error) {
      console.error('Erro ao desconectar o cliente:', error);
  }
}

async function sendMessage(rawNumber, message) {
  if (!rawNumber || !message) {
      throw new Error('Número ou mensagem não fornecidos.');
  }

  try {
      // Verifique se o cliente está pronto
      if (!client.info) {
        throw new Error('Cliente WhatsApp não está pronto.');
      }
      // Remove todos os caracteres que não sejam dígitos
      const cleanedNumber = rawNumber.replace(/\D/g, '');

      // Adiciona o código do país (Brasil = 55) na frente do número
      const completeNumber = `55${cleanedNumber}`;

      const chatId = `${completeNumber}@c.us`;

      console.log('Enviando mensagem para:', chatId); // Log para verificar o chatId
      await client.sendMessage(chatId, message);

      return { status: 'success', message: 'Mensagem enviada com sucesso.' };
  } catch (error) {
      console.error('Erro ao enviar a mensagem:', error.message);
      throw new Error('Erro ao enviar a mensagem: ' + error.message);
  }
}

// Inicializa o cliente
client.initialize();

// Exporte o cliente e a função de desconexão para uso em outros arquivos
module.exports = {
    client,
    disconnectClient,
    sendMessage
};