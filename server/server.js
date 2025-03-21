const express = require('express');
const cors  = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const {startCronJob} = require('./utils/cronJob');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.log('Error while connecting to MongoDB', err);
}
);

const app = express();

// Middlewares  
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());  // ✅ Required for JSON body parsing
app.use(express.urlencoded({ extended: true }));


// startCronJob();

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/stats', statsRoutes);


app.get('/', (req, res) => {
    res.send('student database backend runing successfully');
}
);

// Start Server
const PORT = process.env.PORT || 7070;

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
}
);
