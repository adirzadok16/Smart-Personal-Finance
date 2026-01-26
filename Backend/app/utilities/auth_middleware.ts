import { Request, Response, NextFunction } from 'express';
import JWTHandler from './jwt_handler';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = JWTHandler.verifyAccessToken(token);

    if (typeof decoded === 'string' || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    (req as any).user = decoded.sub;
    next();

  } catch (error: any) {
    if (error.message === 'Access token expired') {
      try {
        const newAccessToken = await JWTHandler.refreshToken(token);
        return res.status(401).json({ message: 'Token expired', accessToken: newAccessToken });
      } catch {
        return res.status(401).json({ message: 'Token expired and could not refresh' });
      }
    }

    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
