const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

exports.getUsers = (req, res) => {
    const currentUserId = req.query.currentUserId;
    const db = readDb();
    // Return all users except current one
    // In real app, filter by preferences and already swiped
    const users = db.users.filter(u => u.id !== currentUserId);
    res.json(users);
};

exports.getUser = (req, res) => {
    const db = readDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDb();

    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    db.users[index] = { ...db.users[index], ...updates };
    writeDb(db);

    res.json(db.users[index]);
};
