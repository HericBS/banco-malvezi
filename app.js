const express = require('express');
const path = require('path');
const routes = require('./routes/routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api', routes);

// Servir arquivos estáticos do front-end (pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para tratar rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Iniciar servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});