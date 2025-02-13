const admin = require("firebase-admin");

exports.authenticateFirebaseUser = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided. Access forbidden." });
  }

  try {
    // Log the token for debugging purposes
    // console.log("Received token:", token);

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Log the decoded token for debugging
    // console.log("Decoded token:", decodedToken);

    // Ensure the decoded token contains the UID and log it
    if (!decodedToken.uid) {
      return res.status(401).json({ message: "Invalid token. UID not found." });
    }

    // Attach decoded token (user data) to request
    req.user = decodedToken; // Firebase UID can be accessed via `req.user.uid`
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error.message);
    res.status(401).json({
      message: "Unauthorized. Invalid or expired token.",
      error: error.message,
    });
  }
};
