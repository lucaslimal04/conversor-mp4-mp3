const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Habilitar CORS
app.use(cors());

// Configurar multer para armazenar uploads em /uploads
const upload = multer({ dest: 'uploads/' });

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname)));

// Rota de conversão
app.post('/convert', upload.single('video'), (req, res) => {
  const videoPath = req.file.path;
  const outputPath = path.join(__dirname, 'uploads', `${req.file.filename}.mp3`);

  ffmpeg(videoPath)
    .toFormat('mp3')
    .on('end', () => {
      res.download(outputPath, 'audio.mp3', (err) => {
        fs.unlinkSync(videoPath); // Remove o arquivo de vídeo após a conversão
        fs.unlinkSync(outputPath); // Remove o arquivo de áudio após o download
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
