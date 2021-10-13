require('dotenv').config();

const express = require('express');
const router = require('./routes');
const { middleware } = require('./logger');
const cors = require('cors');

const app = express(middleware);

// middlewares
app.use(cors());
app.use(express.json());
app.use(router);


module.exports = app;