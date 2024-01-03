require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { connectDB } = require("./db/connection");
const bodyParser = require('body-parser');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Your protected route
app.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected route!' });
});

// Routes
app.use('/api/notes', noteRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
