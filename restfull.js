const express = require('express');
const bodyParser = require('body-parser');
const { parse } = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Validasi untuk memastikan ID adalah angka
const validateId = (req, res, next) => {
    const itemId = parseInt(req.params.id);
  
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'ID harus berupa angka.' });
    }
  
    next();
  };
  
  // Validasi untuk memastikan NAME adalah string
  const validateAdd = (req, res, next) => {
    const itemName = req.body.name;
    const itemClass = req.body.class;
    const itemId = parseInt(req.body.id);
  
    if (typeof itemName !== 'string') {
      return res.status(400).json({ message: 'NAME harus berupa string.' });
    }

    if (typeof itemClass !== 'string') {
        return res.status(400).json({ message: 'CLASS harus berupa string.' });
    }

    if (isNaN(itemId)) {
        return res.status(400).json({ message: 'ID harus berupa angka.' });
    }
  
    next();
  };

  // Validasi untuk memastikan NAME adalah string
  const validateUpdate = (req, res, next) => {
    if (req.body.name){
        const itemName = req.body.name;

        if (typeof itemName !== 'string') {
            return res.status(400).json({ message: 'NAME harus berupa string.' });
        }
    }

    if (req.body.class){
        const itemClass = req.body.class;
       
        if (typeof itemClass !== 'string') {
            return res.status(400).json({ message: 'CLASS harus berupa string.' });
        }
    }

    if (req.body.id){
        const itemId = parseInt(req.body.id);

        if (isNaN(itemId)) {
            return res.status(400).json({ message: 'ID harus berupa angka.' });
        }
    }
  
    next();
  };

// Contoh data sementara
let bsiTrainee = [
  { id: 1, name: 'Aqshol', class: 'B' },
  { id: 2, name: 'Anggas', class: 'B' },
  { id: 3, name: 'Ericko', class: 'B' },
  { id: 4, name: 'Mike', class: 'B' },
];

// GET method untuk mendapatkan semua data
app.get('/api/items', (req, res) => {
  res.json(bsiTrainee);
});

// GET method untuk mendapatkan data berdasarkan ID
app.get('/api/items/:id', validateId, (req, res) => {
  const itemId = parseInt(req.params.id);
  const item = bsiTrainee.find(item => item.id === itemId);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// POST method untuk menambahkan data baru
app.post('/api/items',validateAdd, (req, res) => {
  const newItem = req.body;
  bsiTrainee.push(newItem);
  res.status(201).json(newItem);
});

// PUT method untuk mengupdate data berdasarkan ID
app.put('/api/items/:id',validateId, validateUpdate, (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedItem = req.body;

  bsiTrainee = bsiTrainee.map(item => (item.id === itemId ? updatedItem : item));

  res.json(updatedItem);
});

// PATCH method untuk melakukan perubahan parsial pada data berdasarkan ID
app.patch('/api/items/:id',validateId, validateUpdate, (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedFields = req.body;

  bsiTrainee = bsiTrainee.map(item => (item.id === itemId ? { ...item, ...updatedFields } : item));

  res.json(bsiTrainee.find(item => item.id === itemId));
});

// DELETE method untuk menghapus data berdasarkan ID
app.delete('/api/items/:id', validateId, (req, res) => {
  const itemId = parseInt(req.params.id);
  bsiTrainee = bsiTrainee.filter(item => item.id !== itemId);
  res.json({ message: 'Item deleted successfully' });
});

// GET method untuk mendapatkan semua data
app.get('/api/items-paginate', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    const paginatedItems = bsiTrainee.slice(startIndex, endIndex);
  
    const totalPages = Math.ceil(bsiTrainee.length / limit);
  
    res.json({
      page,
      limit,
      totalItems: bsiTrainee.length,
      totalPages,
      data: paginatedItems,
    });
});

// Menjalankan server pada port tertentu
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});