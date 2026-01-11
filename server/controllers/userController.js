const fs = require('fs');
const path = require('path');

exports.getUsers = (req, res) => {
    const currentUserId = req.query.currentUserId;

    try {
        const { readData, files } = req.app.locals;
        console.log('Fetching users for:', currentUserId);

        const users = readData(files.users);
        const likes = readData(files.likes);
        const passes = readData(files.passes);
        console.log(`Loaded ${users.length} users, ${likes.length} likes, ${passes.length} passes`);

        // Helper to normalize gender values
        const normalizeGender = (g) => {
            if (!g) return 'other';
            const str = g.toString().toLowerCase();
            if (['man', 'male'].includes(str)) return 'male';
            if (['woman', 'female'].includes(str)) return 'female';
            return 'other';
        };

        // Filter out already swiped users (liked or passed)
        const likedUserIds = likes.filter(l => l.fromUserId === currentUserId).map(l => l.toUserId);
        const passedUserIds = passes.filter(p => p.fromUserId === currentUserId).map(p => p.toUserId);
        const swipedUserIds = new Set([...likedUserIds, ...passedUserIds]);

        const currentUser = users.find(u => u.id === currentUserId);

        // Determine preferences
        let preferences = ['male', 'female', 'other']; // Default to all if unknown
        if (currentUser) {
            if (currentUser.partnerGender && Array.isArray(currentUser.partnerGender)) {
                // New format: partnerGender is array of ['men', 'women', 'other']
                preferences = currentUser.partnerGender.map(g => {
                    if (g === 'men') return 'male';
                    if (g === 'women') return 'female';
                    return 'other';
                });
            } else if (currentUser.lookingFor) {
                // Legacy format: lookingFor is string 'male'/'female'/'everyone'
                const lf = currentUser.lookingFor.toLowerCase();
                if (lf === 'everyone') {
                    preferences = ['male', 'female', 'other'];
                } else {
                    preferences = [normalizeGender(lf)];
                }
            }
        }

        const filteredUsers = users.filter(u => {
            if (u.id === currentUserId) return false;
            if (swipedUserIds.has(u.id)) return false;

            const userGender = normalizeGender(u.gender || u.userGender);
            return preferences.includes(userGender);
        });

        console.log(`Returning ${filteredUsers.length} users after filtering`);
        res.json(filteredUsers);

    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUser = (req, res) => {
    const { readData, files } = req.app.locals;
    const users = readData(files.users);
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

exports.updateProfile = (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { readData, writeData, files } = req.app.locals;
    const users = readData(files.users);

    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    users[index] = { ...users[index], ...updates };
    writeData(files.users, users);

    res.json(users[index]);
};
