exports.register = (req, res) => {
    const { name, email, password, dob, userGender, partnerGender } = req.body;
    const { readData, writeData, files } = req.app.locals;

    const users = readData(files.users);

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, hash this!
        dob,
        userGender,
        partnerGender
    };

    users.push(newUser);
    writeData(files.users, users);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    const { readData, files } = req.app.locals;

    const users = readData(files.users);

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
};
