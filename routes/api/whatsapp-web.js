const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let isReady = false;

// Evento para gerar e exibir o QR code
client.on('qr', (qr) => {
  console.log('QR code recebido, escaneie com o WhatsApp para conectar:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado e pronto');
  isReady = true;
});

client.on('disconnected', () => {
  console.log('❌ WhatsApp desconectado');
  isReady = false;
});

client.initialize();

/**
 * Envia mensagem de texto
 */
async function sendMessage(rawNumber, message) {
  if (!isReady) {
    throw new Error('WhatsApp ainda não está pronto');
  }

  let number = rawNumber.replace(/\D/g, '');
  if (!number.startsWith('55')) number = '55' + number;

  const chatId = `${number}@c.us`;

  const exists = await client.isRegisteredUser(chatId);
  if (!exists) {
    throw new Error('Número não registrado no WhatsApp');
  }

  // força o carregamento do chat (evita bug markedUnread)
  await client.getChatById(chatId);

  await client.sendMessage(chatId, message, {
    sendSeen: false
  });

  return { success: true };
}

module.exports = {
  sendMessage,
  isReady: () => isReady
};