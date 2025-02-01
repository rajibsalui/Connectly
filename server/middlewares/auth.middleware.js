import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = (req, res, next) => {
    let token = req.cookies.authToken;
     
    // Check Authorization header if cookie is not present
    const authHeader = req.headers.authorization;
    if (!token && authHeader) {
        token = authHeader.replace('Bearer ', '');
    }

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export default authMiddleware;