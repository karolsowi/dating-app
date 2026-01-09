const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

exports.sendMessage = (req, res) => {
    const { fromUserId, toUserId, content } = req.body;
    const db = readDb();

    const newMessage = {
        id: Date.now().toString(),
        fromUserId,
        toUserId,
        content,
        timestamp: new Date().toISOString()
    };

    db.messages.push(newMessage);
    writeDb(db);

    res.json(newMessage);
};

exports.getMessages = (req, res) => {
    const { userId, otherUserId } = req.params;
    const db = readDb();

    const messages = db.messages.filter(m =>
        (m.fromUserId === userId && m.toUserId === otherUserId) ||
        (m.fromUserId === otherUserId && m.toUserId === userId)
    );

    // Sort by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(messages);
};
