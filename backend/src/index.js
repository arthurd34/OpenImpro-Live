const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const playerRoutes = require('./routes/player');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/player', playerRoutes);

app.listen(3000, () => console.log('Backend running on port 3000'));
