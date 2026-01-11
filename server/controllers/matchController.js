exports.likeUser = (req, res) => {
    const { fromUserId, toUserId } = req.body;
    const { readData, writeData, files } = req.app.locals;

    const likes = readData(files.likes);
    const matches = readData(files.matches);

    // check if already liked (to avoid duplication)
    if (likes.some(l => l.fromUserId === fromUserId && l.toUserId === toUserId)) {
        return res.json({ message: 'Already liked' });
    }

    // Check for mutual like (did toUser already like fromUser?)
    const isMatch = likes.find(l => l.fromUserId === toUserId && l.toUserId === fromUserId);

    // Record the like
    likes.push({ fromUserId, toUserId });
    writeData(files.likes, likes);

    if (isMatch) {
        // Create a match
        const newMatch = {
            id: Date.now().toString(),
            users: [fromUserId, toUserId],
            timestamp: new Date().toISOString()
        };
        matches.push(newMatch);
        writeData(files.matches, matches);
        return res.json({ message: 'It\'s a match!', match: newMatch });
    }

    res.json({ message: 'Like recorded' });
};

exports.passUser = (req, res) => {
    const { fromUserId, toUserId } = req.body;
    const { readData, writeData, files } = req.app.locals;

    const passes = readData(files.passes);

    // Check if already passed
    const existingPass = passes.find(p => p.fromUserId === fromUserId && p.toUserId === toUserId);
    if (existingPass) {
        return res.json({ message: 'Already passed' });
    }

    passes.push({ fromUserId, toUserId });
    writeData(files.passes, passes);
    res.json({ message: 'Pass recorded' });
};

exports.getMatches = (req, res) => {
    const userId = req.params.userId;
    const { readData, files } = req.app.locals;

    const matches = readData(files.matches);
    const users = readData(files.users);

    const userMatches = matches.filter(m => m.users.includes(userId));

    // Enrich with user data
    const enrichedMatches = userMatches.map(m => {
        const otherUserId = m.users.find(id => id !== userId);
        const otherUser = users.find(u => u.id === otherUserId);
        return { ...m, otherUser };
    });

    res.json(enrichedMatches);
};
