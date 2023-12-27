// streamReader.js

const fs = require('fs');
const readline = require('readline');

function readInputFile(filePath) {
  // Crear un stream de lectura para leer el archivo línea por línea
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Array para almacenar los mensajes
  const messages = [];

  // Escuchar eventos de línea para procesar cada mensaje
  rl.on('line', (line) => {
    messages.push(line);
  });

  // Devolver una promesa que se resolverá cuando se complete la lectura del archivo
  return new Promise((resolve) => {
    rl.on('close', () => {
      resolve(messages);
    });
  });
}

module.exports = { readInputFile };
