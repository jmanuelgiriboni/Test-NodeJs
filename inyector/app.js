// app.js

const { readInputFile } = require('./streamReader');
const winston = require('winston');
const net = require('net');

// Configurar el logger con Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

const inputFile = 'input.txt';
const serverAddress = '192.168.1.10';
const serverPort = 12000;
const messagesToSend = 10; // Número de mensajes a enviar en un solo buffer

function prepareMessage(message) {
  const messageLength = Buffer.from(message).length;
  const strLength = messageLength.toString(16).padStart(4, '0');
  const lengthBytes = Buffer.from(strLength, 'hex');
  const messageBytes = Buffer.from(message);
  return Buffer.concat([lengthBytes, messageBytes]);
}

readInputFile(inputFile)
  .then((messages) => {
    // Tomar los primeros 'messagesToSend' mensajes para enviar
    const messagesToProcess = messages.slice(0, messagesToSend);

    // Preparar los mensajes antes de enviarlos al servidor
    const preparedMessages = messagesToProcess.map(prepareMessage);

    // Hacer algo con los mensajes preparados, como imprimirlos
    const timestamp = new Date().toISOString();
    logger.info(`${timestamp} Mensajes preparados: ${preparedMessages.map((msg) => msg.toString('hex')).join(', ')}`);

    // Crear un cliente socket TCP
    const client = new net.Socket();

    // Conectar el cliente al servidor
    client.connect(serverPort, serverAddress, () => {
      logger.info('Conectado al servidor');
      
      // Enviar todos los mensajes preparados en un solo Buffer
      const concatenatedBuffer = Buffer.concat(preparedMessages);
      client.write(concatenatedBuffer);

      // Cerrar la conexión después de enviar el Buffer
      client.end();
    });

    // Escuchar eventos de datos recibidos del servidor
    client.on('data', (data) => {
      logger.info(`Datos recibidos del servidor: ${data}`);
    });

    // Escuchar eventos de cierre de conexión
    client.on('close', () => {
      logger.info('Conexión cerrada con el servidor');
    });

  })
  .catch((error) => {
    logger.error('Error al leer el archivo:', error);
  });
