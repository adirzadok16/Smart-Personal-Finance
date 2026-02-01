import { Request, Response, NextFunction } from 'express';
import JWTHandler from './jwt_handler';

/**
 * authMiddleware
 * Middleware for JWT authentication using cookies
 * 
 * What it does:
 *  1. Checks if accessToken exists in cookies
 *  2. Verifies the access token
 *  3. If expired, attempts to refresh using refreshToken
 *  4. Stores user ID in req.user for downstream handlers
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  // 1️⃣ Get the accessToken from cookies
  const token = req.cookies?.accessToken;
  if (!token) {
    console.log('[AUTH MIDDLEWARE] No access token found in cookies');
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    // 2️⃣ Verify the access token
    const decoded = JWTHandler.verifyAccessToken(token);

    if (typeof decoded === 'string' || !decoded.sub) {
      console.log('[AUTH MIDDLEWARE] Invalid token payload');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // 3️⃣ Save user ID to the request object
    (req as any).user = decoded.sub;
    console.log(`[AUTH MIDDLEWARE] Access token valid for user: ${decoded.sub}`);
    next();

  } catch (error: any) {

    // 4️⃣ Handle expired access token
    if (error.message === 'Access token expired') {
      try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          console.log('[AUTH MIDDLEWARE] Access token expired and no refresh token found');
          return res.status(401).json({ message: 'Token expired' });
        }

        // 5️⃣ Refresh the access token
        const newAccessToken = await JWTHandler.refreshToken(refreshToken);

        // 6️⃣ Send new access token as cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,            // not accessible by JS
          secure: false,             // true in production with HTTPS
          sameSite: 'lax',           // cross-site policy
          maxAge: 15 * 60 * 1000,    // 15 minutes
        });

        // 7️⃣ Save user ID from the new token
        const decodedNew = JWTHandler.verifyAccessToken(newAccessToken);
        (req as any).user = decodedNew.sub;
        console.log(`[AUTH MIDDLEWARE] Access token refreshed for user: ${decodedNew.sub}`);
        next();

      } catch {
        console.log('[AUTH MIDDLEWARE] Token expired and refresh failed');
        return res.status(401).json({ message: 'Token expired and could not refresh' });
      }
    } else {
      console.error('[AUTH MIDDLEWARE] Internal server error during authentication', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
