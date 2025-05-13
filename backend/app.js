const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper para ler/escrever no "banco de dados"
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Rotas
const router = express.Router();

// CRUD para reservas
router.get('/reservas', (req, res) => {
  const db = readDB();
  res.json(db.reservas);
});

router.get('/reservas/:id', (req, res) => {
  const db = readDB();
  const reserva = db.reservas.find(r => r.id === req.params.id);
  reserva ? res.json(reserva) : res.status(404).send('Reserva não encontrada');
});

router.post('/reservas', (req, res) => {
  const db = readDB();
  const novaReserva = {
    id: Date.now().toString(),
    ...req.body,
    status: 'confirmada',
    dataCriacao: new Date().toISOString()
  };
  db.reservas.push(novaReserva);
  writeDB(db);
  res.status(201).json(novaReserva);
});

router.put('/reservas/:id', (req, res) => {
  const db = readDB();
  const index = db.reservas.findIndex(r => r.id === req.params.id);
  
  if (index === -1) return res.status(404).send('Reserva não encontrada');
  
  db.reservas[index] = { ...db.reservas[index], ...req.body };
  writeDB(db);
  res.json(db.reservas[index]);
});

router.delete('/reservas/:id', (req, res) => {
  const db = readDB();
  db.reservas = db.reservas.filter(r => r.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

app.use('/api', router);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  
  // Cria o arquivo DB se não existir
  if (!fs.existsSync(DB_PATH)) {
    writeDB({ reservas: [] });
  }
});