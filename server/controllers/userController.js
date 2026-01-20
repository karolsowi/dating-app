const fs = require("fs");
const path = require("path");

exports.getUsers = (req, res) => {
  const currentUserId = req.query.currentUserId;

  if (!currentUserId) {
    return res.status(400).json({ message: "currentUserId is required" });
  }

  try {
    const { readData, files } = req.app.locals;
    console.log("Fetching users for:", currentUserId);

    const users = readData(files.users);
    const likes = readData(files.likes);
    const passes = readData(files.passes);
    console.log(
      `Loaded ${users.length} users, ${likes.length} likes, ${passes.length} passes`,
    );

    // Force currentUserId to string
    const currentUserIdStr = String(currentUserId);

    // Filter out already swiped users (liked or passed)
    // Ensure we compare strings and store strings in the Set
    const likedUserIds = likes
      .filter((l) => String(l.fromUserId) === currentUserIdStr)
      .map((l) => String(l.toUserId));
    const passedUserIds = passes
      .filter((p) => String(p.fromUserId) === currentUserIdStr)
      .map((p) => String(p.toUserId));

    // Create a Set of ignored User IDs (all strings)
    const swipedUserIds = new Set([...likedUserIds, ...passedUserIds]);

    console.log(
      `User ${currentUserIdStr} has swiped on ${swipedUserIds.size} users`,
    );

    const currentUser = users.find((u) => String(u.id) === currentUserIdStr);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Determine preferences - partnerGender is array of ['man', 'woman', 'other']
    const preferences =
      currentUser.partnerGender && Array.isArray(currentUser.partnerGender)
        ? currentUser.partnerGender
        : ["man", "woman", "other"];

    const filteredUsers = users.filter((u) => {
      const uIdStr = String(u.id);

      // Don't show myself
      if (uIdStr === currentUserIdStr) return false;

      // Don't show already swiped
      if (swipedUserIds.has(uIdStr)) return false;

      const userGender = u.userGender || "other";

      // Check if user's gender matches current user's preferences
      if (!preferences.includes(userGender)) return false;

      // Check if current user's gender matches this user's preferences
      const currentUserGender = currentUser.userGender || "other";
      if (!u.partnerGender || !Array.isArray(u.partnerGender)) return false;
      if (!u.partnerGender.includes(currentUserGender)) return false;

      return true;
    });

    console.log(`Returning ${filteredUsers.length} users after filtering`);
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUser = (req, res) => {
  const { readData, files } = req.app.locals;
  const users = readData(files.users);
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Calculate age from dob (expected format: YYYY-MM-DD)
  const age = calculateAge(user.dob);

  // Enrich with photo likes
  const photoLikes = readData(files.photoLikes) || [];
  const currentUserId = req.query.currentUserId; // Pass this from frontend

  const picturesWithStats = (user.pictures || []).map(url => {
    const likesForPhoto = photoLikes.filter(l => l.photoUrl === url);
    return {
      url,
      likes: likesForPhoto.length,
      isLiked: currentUserId ? likesForPhoto.some(l => l.fromUserId === currentUserId) : false
    };
  });

  // Calculate total profile likes
  const likes = readData(files.likes);
  const totalLikes = likes.filter(l => String(l.toUserId) === String(user.id)).length;

  res.json({
    ...user,
    age,
    pictures: user.pictures, // Keep original array
    minifiedPictures: picturesWithStats, // Add enriched one
    totalLikes // Add total likes count
  });
};

// Helper function
function calculateAge(dob) {
  if (!dob) return null;

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { readData, writeData, files } = req.app.locals;
  const users = readData(files.users);

  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  users[index] = { ...users[index], ...updates };
  writeData(files.users, users);

  res.json(users[index]);
};

exports.togglePhotoLike = (req, res) => {
  const { photoUrl, fromUserId } = req.body;
  const { readData, writeData, files } = req.app.locals;

  if (!photoUrl || !fromUserId) {
    return res.status(400).json({ message: 'photoUrl and fromUserId are required' });
  }

  const photoLikes = readData(files.photoLikes) || [];

  // Check if like exists
  const existingIndex = photoLikes.findIndex(l => l.photoUrl === photoUrl && l.fromUserId === fromUserId);

  let isLiked = false;
  if (existingIndex > -1) {
    // Unlike
    photoLikes.splice(existingIndex, 1);
    isLiked = false;
  } else {
    // Like
    photoLikes.push({ photoUrl, fromUserId, timestamp: new Date().toISOString() });
    isLiked = true;
  }

  writeData(files.photoLikes, photoLikes);

  // Calculate new count
  const count = photoLikes.filter(l => l.photoUrl === photoUrl).length;

  res.json({ isLiked, count });
};
