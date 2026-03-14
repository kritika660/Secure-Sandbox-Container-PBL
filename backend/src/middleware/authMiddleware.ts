import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decode;
        next();
    } catch (error) {
        res.send(403).json({ message: "token is not valid" });
    }
}