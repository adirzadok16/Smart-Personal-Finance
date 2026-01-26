import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import RedisService from './redis_service';
dotenv.config();

export class JWTHandler {

    /**
     * generateAccessToken
     * @param payload - Object containing sub (user id)
     * 
     * What it does:
     *  - Signs a new JWT access token with a 30m expiration
     * 
     * Returns: string - The generated access token
     */
    static generateAccessToken(payload: { sub: string; }): string {
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '30m' });
        return accessToken;
    }

    /**
     * generateRefreshToken
     * @param payload - Object containing sub (user id)
     * 
     * What it does:
     *  - Signs a new JWT refresh token with a 7d expiration
     * 
     * Returns: string - The generated refresh token
     */
    static generateRefreshToken(payload: { sub: string; }) {
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' });
        return refreshToken;
    }

    /**
     * verifyAccessToken
     * @param token - The JWT access token to verify
     * 
     * What it does:
     *  - Verifies the integrity and expiration of the access token
     *  - Throws specific error if expired
     * 
     * Returns: { sub: string } - The decoded payload
     */
    static verifyAccessToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { sub: string };
            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new Error("Access token expired");
            }
            throw new Error("Invalid access token");
        }
    }

    /**
     * verifyRefreshToken
     * @param token - The JWT refresh token to verify
     * 
     * What it does:
     *  - Verifies the integrity and expiration of the refresh token
     * 
     * Returns: any - The decoded payload
     */
    static verifyRefreshToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new Error("Refresh token expired");
            }
            throw new Error("Invalid refresh token");
        }
    }

    /**
     * refreshToken
     * @param access_token - The expired or valid access token
     * 
     * What it does:
     *  - Decodes user ID from the access token
     *  - Retrieves refresh token from Redis
     *  - Verifies the refresh token
     *  - Generates a new access token
     * 
     * Returns: Promise<string> - The new access token
     */
    static async refreshToken(access_token: string) {
        const decoded = jwt.decode(access_token) as { sub: string } | null;
        const user_id = decoded!.sub;
        const refresh_token = await RedisService.get(`refresh:${user_id}`);
        if (!refresh_token) {
            const new_access_token = this.generateAccessToken({ sub: user_id });
            const new_refresh_token = this.generateRefreshToken({ sub: user_id });
            RedisService.set(`refresh:${user_id}`, new_refresh_token, 7 * 24 * 60 * 60);
            return new_access_token;
        }
        const refresh_token_decoded = this.verifyRefreshToken(refresh_token);
        if (refresh_token_decoded != user_id) {
            throw new Error("Invalid refresh token");
        }
        const new_access_token = this.generateAccessToken({ sub: user_id });
        return new_access_token;
    }
}

export default JWTHandler;


