import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ e: "Token required" });
  }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ e: "Invalid token" });
  }
}
