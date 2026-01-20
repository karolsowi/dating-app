const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const PASSES_FILE = path.join(DATA_DIR, 'passes.json');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const PHOTO_LIKES_FILE = path.join(DATA_DIR, 'photo_likes.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper to read specific file
const readData = (filePath, defaultValue = []) => {
    if (!fs.existsSync(filePath)) {
        return defaultValue;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content ? JSON.parse(content) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
};

// Helper to write specific file
const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Export helpers for controllers
app.locals.readData = readData;
app.locals.writeData = writeData;
app.locals.files = {
    users: USERS_FILE,
    likes: LIKES_FILE,
    passes: PASSES_FILE,
    matches: MATCHES_FILE,
    messages: MESSAGES_FILE,
    photoLikes: PHOTO_LIKES_FILE
};

// Migration Logic: Split db.json if separate files don't exist
if (fs.existsSync(DB_FILE) && !fs.existsSync(USERS_FILE)) {
    console.log('Migrating db.json to separate files...');
    try {
        const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

        if (!fs.existsSync(USERS_FILE)) writeData(USERS_FILE, db.users || []);
        if (!fs.existsSync(LIKES_FILE)) writeData(LIKES_FILE, db.likes || []);
        if (!fs.existsSync(PASSES_FILE)) writeData(PASSES_FILE, db.passes || []);
        if (!fs.existsSync(MATCHES_FILE)) writeData(MATCHES_FILE, db.matches || []);
        if (!fs.existsSync(MESSAGES_FILE)) writeData(MESSAGES_FILE, db.messages || []);

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
} else {
    // Initialize empty files if they don't exist
    if (!fs.existsSync(USERS_FILE)) writeData(USERS_FILE, []);
    if (!fs.existsSync(LIKES_FILE)) writeData(LIKES_FILE, []);
    if (!fs.existsSync(PASSES_FILE)) writeData(PASSES_FILE, []);
    if (!fs.existsSync(MATCHES_FILE)) writeData(MATCHES_FILE, []);
    if (!fs.existsSync(MESSAGES_FILE)) writeData(MESSAGES_FILE, []);
    if (!fs.existsSync(PHOTO_LIKES_FILE)) writeData(PHOTO_LIKES_FILE, []);
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
