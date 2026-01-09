const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

exports.register = (req, res) => {
    const { email, password, name } = req.body;
    const db = readDb();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, hash this!
        name,
        profilePic: '',
        bio: '',
        age: 18,
        gender: '',
        lookingFor: ''
    };

    db.users.push(newUser);
    writeDb(db);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    const db = readDb();

    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
};
