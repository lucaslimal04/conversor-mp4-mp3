const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configurar multer para armazenar uploads em /uploads
const upload = multer({ dest: 'uploads/' });

// Serve todos os arquivos estáticos da raiz do projeto
app.use(express.static(__dirname));

// Rota principal (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de conversão
app.post('/convert', upload.single('video'), (req, res) => {
  const videoPath = req.file.path;
  const outputPath = path.join(__dirname, 'uploads', `${req.file.filename}.mp3`);

  ffmpeg(videoPath)
    .toFormat('mp3')
    .on('end', () => {
      res.download(outputPath, 'audio.mp3', (err) => {
        fs.unlinkSync(videoPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error('Erro na conversão:', err);
      res.status(500).send('Erro ao converter o arquivo');
    })
    .save(outputPath);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
