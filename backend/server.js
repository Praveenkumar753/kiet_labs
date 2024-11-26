const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/routes');
const Sroutes=require('./routes/sroutes');
const labRoutes=require('./routes/labroutes')
const loginRoutes=require('./routes/loginroutes')
const formResponsesRoutes = require('./routes/response');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(
    'mongodb+srv://pavan:manaclg@cluster0.8ij6z7o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Use routes
app.use('/api', routes);
app.use('/api/student', Sroutes);
app.use('/api/registration',labRoutes)
app.use('/api/auth', loginRoutes);
app.use('/api/formresponses', formResponsesRoutes);
// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
