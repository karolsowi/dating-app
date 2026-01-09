const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

exports.likeUser = (req, res) => {
    const { fromUserId, toUserId } = req.body;
    const db = readDb();

    // Check if already liked? (Skip for simplicity or add check)

    // Check for mutual like
    const mutualLike = db.matches.find(m =>
        (m.users.includes(fromUserId) && m.users.includes(toUserId))
    );

    if (mutualLike) {
        return res.json({ message: 'Already matched', match: mutualLike });
    }

    // Check if the other user has already liked this user (simulated "likes" table or just check matches logic)
    // For simplicity, we'll store "likes" in a separate array or just check if we can make a match.
    // Let's add a "likes" array to db.json if not present, or just use matches.
    // Actually, to implement Tinder logic, we need to store "likes" separately from "matches".
    if (!db.likes) db.likes = [];

    db.likes.push({ fromUserId, toUserId });

    // Check if toUserId has liked fromUserId
    const isMatch = db.likes.find(l => l.fromUserId === toUserId && l.toUserId === fromUserId);

    if (isMatch) {
        const newMatch = {
            id: Date.now().toString(),
            users: [fromUserId, toUserId],
            timestamp: new Date().toISOString()
        };
        db.matches.push(newMatch);
        writeDb(db);
        return res.json({ message: 'It\'s a match!', match: newMatch });
    }

    writeDb(db);
    res.json({ message: 'Like recorded' });
};

exports.getMatches = (req, res) => {
    const userId = req.params.userId;
    const db = readDb();
    const matches = db.matches.filter(m => m.users.includes(userId));

    // Enrich with user data
    const enrichedMatches = matches.map(m => {
        const otherUserId = m.users.find(id => id !== userId);
        const otherUser = db.users.find(u => u.id === otherUserId);
        return { ...m, otherUser };
    });

    res.json(enrichedMatches);
};
