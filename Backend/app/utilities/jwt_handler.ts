import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import RedisService from './redis_service';
dotenv.config();

export class JWTHandler {

    // ------------------ ACCESS TOKEN ------------------
    /**
     * generateAccessToken
     * @param payload - Object containing `sub` (user id)
     * 
     * What it does:
     *  - Signs a new JWT access token with a 30-minute expiration
     * 
     * Returns: string - The generated access token
     */
    static generateAccessToken(payload: { sub: string }): string {
        console.log(`[JWT] Generating access token for user: ${payload.sub}`);
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '30m' }
        );
        console.log(`[JWT] Access token generated`);
        return accessToken;
    }

    // ------------------ REFRESH TOKEN ------------------
    /**
     * generateRefreshToken
     * @param payload - Object containing `sub` (user id)
     * 
     * What it does:
     *  - Signs a new JWT refresh token with a 7-day expiration
     * 
     * Returns: string - The generated refresh token
     */
    static generateRefreshToken(payload: { sub: string }) {
        console.log(`[JWT] Generating refresh token for user: ${payload.sub}`);
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        );
        console.log(`[JWT] Refresh token generated`);
        return refreshToken;
    }

    // ------------------ VERIFY ACCESS TOKEN ------------------
    /**
     * verifyAccessToken
     * @param token - The JWT access token to verify
     * 
     * What it does:
     *  - Verifies integrity and expiration of the access token
     *  - Throws error if expired or invalid
     * 
     * Returns: { sub: string } - The decoded payload
     */
    static verifyAccessToken(token: string) {
        console.log('[JWT] Verifying access token...');
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { sub: string };
            console.log('[JWT] Access token verified successfully');
            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                console.error('[JWT] Access token expired');
                throw new Error("Access token expired");
            }
            console.error('[JWT] Invalid access token');
            throw new Error("Invalid access token");
        }
    }

    // ------------------ VERIFY REFRESH TOKEN ------------------
    /**
     * verifyRefreshToken
     * @param token - The JWT refresh token to verify
     * 
     * What it does:
     *  - Verifies integrity and expiration of the refresh token
     * 
     * Returns: any - The decoded payload
     */
    static verifyRefreshToken(token: string) {
        console.log('[JWT] Verifying refresh token...');
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
            console.log('[JWT] Refresh token verified successfully');
            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                console.error('[JWT] Refresh token expired');
                throw new Error("Refresh token expired");
            }
            console.error('[JWT] Invalid refresh token');
            throw new Error("Invalid refresh token");
        }
    }

    // ------------------ REFRESH ACCESS TOKEN ------------------
    /**
     * refreshToken
     * @param access_token - The expired or valid access token
     * 
     * What it does:
     *  - Decodes user ID from the access token
     *  - Retrieves refresh token from Redis
     *  - Verifies the refresh token
     *  - Generates a new access token (and refresh token if missing)
     * 
     * Returns: Promise<string> - The new access token
     */
    static async refreshToken(access_token: string) {
        console.log('[JWT] Refreshing access token...');
        const decoded = jwt.decode(access_token) as { sub: string } | null;
        if (!decoded?.sub) throw new Error("Invalid access token payload");

        const user_id = decoded.sub;
        console.log(`[JWT] Decoded user ID: ${user_id}`);

        const refresh_token = await RedisService.get(`refresh:${user_id}`);

        if (!refresh_token) {
            console.log('[JWT] No refresh token found in Redis, generating new tokens...');
            const new_access_token = this.generateAccessToken({ sub: user_id });
            const new_refresh_token = this.generateRefreshToken({ sub: user_id });
            await RedisService.set(`refresh:${user_id}`, new_refresh_token, 7 * 24 * 60 * 60);
            console.log('[JWT] New tokens stored in Redis');
            return new_access_token;
        }

        console.log('[JWT] Refresh token found, verifying...');
        const refresh_token_decoded = this.verifyRefreshToken(refresh_token);

        if ((refresh_token_decoded as any).sub !== user_id) {
            console.error('[JWT] Refresh token does not match user ID');
            throw new Error("Invalid refresh token");
        }

        console.log('[JWT] Refresh token valid, generating new access token...');
        const new_access_token = this.generateAccessToken({ sub: user_id });
        return new_access_token;
    }
}

export default JWTHandler;
