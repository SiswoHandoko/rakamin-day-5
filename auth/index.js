const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secretKey = 'bsiJayaJaya';

app.use(bodyParser.json());

// Contoh struktur tabel user (dapat disimpan di database)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, secretKey, (err, user) => {
    console.log(err)
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
};

// Route untuk login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Route untuk logout
app.post('/logout', verifyToken, (req, res) => {
  // Proses logout dapat diimplementasikan sesuai kebutuhan
  res.json({ message: 'Logout successful' });
});

app.get('/data', verifyToken, (req, res) => {
    // Hanya dapat diakses jika token valid
    // Contoh data yang diambil dari pengguna yang telah login
    const userData = {
      id: req.user.id,
      username: req.user.username,
      isLogin: true,
    };
  
    res.json(userData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});