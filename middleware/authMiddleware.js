import { jwtDecrypt } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWE_SECRET);

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Authorization header missing"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authorization must be Bearer token"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtDecrypt(token, SECRET_KEY);

    if (payload.purpose !== "AUTH") {
      return res.status(403).json({
        success: false,
        error: "Invalid token type"
      });
    }

    
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role 
    };

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Token expired or invalid"
    });
  }
}
