const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper to read DB
const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        return { users: [], matches: [], messages: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    writeDb({ users: [], matches: [], messages: [], likes: [] });
} else {
    // Ensure likes array exists for existing DB
    const db = readDb();
    if (!db.likes) {
        db.likes = [];
        writeDb(db);
    }
}

// Basic Route
app.get('/', (req, res) => {
    res.send('Grinding App API is running');
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
