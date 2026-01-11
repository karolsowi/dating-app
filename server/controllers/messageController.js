exports.sendMessage = (req, res) => {
    const { fromUserId, toUserId, content } = req.body;
    const { readData, writeData, files } = req.app.locals;

    const messages = readData(files.messages);

    const newMessage = {
        id: Date.now().toString(),
        fromUserId,
        toUserId,
        content,
        timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    writeData(files.messages, messages);

    res.json(newMessage);
};

exports.getMessages = (req, res) => {
    const { userId, otherUserId } = req.params;
    const { readData, files } = req.app.locals;

    const messages = readData(files.messages);

    const chatMessages = messages.filter(m =>
        (m.fromUserId === userId && m.toUserId === otherUserId) ||
        (m.fromUserId === otherUserId && m.toUserId === userId)
    );

    // Sort by timestamp
    chatMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(chatMessages);
};
