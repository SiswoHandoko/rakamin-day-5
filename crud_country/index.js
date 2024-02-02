const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Konfigurasi koneksi ke database PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rakamin',
  password: '',
  port: 5432,
});

app.use(bodyParser.json());
// SELECT setval('country_seq', 251, false);
// Fungsi Create (INSERT)
app.post('/countries', async (req, res) => {
  const { iso, name, nicename, iso3, numcode, phonecode } = req.body;
  const query = 'INSERT INTO country(iso, name, nicename, iso3, numcode, phonecode) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
  const values = [iso, name, nicename, iso3, numcode, phonecode];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Fungsi Read (SELECT)
// Fungsi Read (SELECT) dengan Paginasi
app.get('/countries', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const query = 'SELECT * FROM country ORDER BY id OFFSET $1 LIMIT $2';
  
  try {
    const result = await pool.query(query, [offset, limit]);

    // Menghitung total entri tanpa paginasi
    const totalQuery = 'SELECT COUNT(*) FROM country';
    const totalResult = await pool.query(totalQuery);
    const totalEntries = parseInt(totalResult.rows[0].count, 10);

    const totalPages = Math.ceil(totalEntries / limit);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalEntries,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Fungsi Update (UPDATE)
app.put('/countries/:id', async (req, res) => {
  const countryId = req.params.id;
  const { iso, name, nicename, iso3, numcode, phonecode } = req.body;
  const query = 'UPDATE country SET iso=$1, name=$2, nicename=$3, iso3=$4, numcode=$5, phonecode=$6 WHERE id=$7 RETURNING *';
  const values = [iso, name, nicename, iso3, numcode, phonecode, countryId];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Fungsi Patch (Partial Update)
app.patch('/countries/:id', async (req, res) => {
  const countryId = req.params.id;
  const updateFields = req.body;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).send('Bad Request: No fields to update');
  }

  const setClause = Object.keys(updateFields).map((key, index) => `${key}=$${index + 1}`).join(', ');
  const values = Object.values(updateFields);
  values.push(countryId);

  const query = `UPDATE country SET ${setClause} WHERE id=$${values.length} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Fungsi Delete (DELETE)
app.delete('/countries/:id', async (req, res) => {
  const countryId = req.params.id;
  const query = 'DELETE FROM country WHERE id=$1 RETURNING *';

  try {
    const result = await pool.query(query, [countryId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
