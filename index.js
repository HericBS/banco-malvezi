const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;


pool.getConnection()
  .then(() => console.log('Conexão com o banco de dados estabelecida!'))
  .catch((err) => console.error('Erro ao conectar ao banco de dados:', err));
// 1) Serve front-end estático (public/)
app.use(express.static(path.join(__dirname, 'public')));

// 2) Habilita CORS para requests externas (se manter front separado)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// 3) Parse JSON
app.use(express.json());

// 4) Logger simples
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const routes = require('./routes/routes');
app.options('/*', cors()); 
app.use('/api', routes);

// 6) SPA fallback (se usar React/Vue ou roteamento client-side)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));