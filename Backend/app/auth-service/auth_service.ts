import { getServiceDatabase } from '../db/database';
import JWTHandler from '../utilities/jwt_handler';
import RedisService from '../utilities/redis_service';
import { loginDto, registerDto, User } from './auth_models';
import { User_Table } from './auth_schemas';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

class AuthService {
 
  /**
   * login_user
   * @param json - Object containing email and password
   * 
   * What it does:
   *  - Extracts email and password from the input
   *  - Validates if the user exists
   *  - Compares passwords
   *  - Generates access and refresh tokens
   *  - Stores the refresh token in Redis
   * 
   * Returns: Promise<{ accessToken, refreshToken }>
   */
  static async login_user(json: loginDto) {
    const { password, email } = json;
    console.log(`[AUTH] Starting login for email: ${email}`);

    console.log("[AUTH] Getting database connection...");
    const db = getServiceDatabase('auth');

    console.log("[AUTH] Getting user repository...");
    const userRepo = db.getRepository(User_Table);

    console.log("[AUTH] Checking if user exists...");
    const isUserExists = await userRepo.findOneBy({ email });
    if (!isUserExists) {
      console.log("[AUTH] Login failed: User does not exist");
      throw new Error("Invalid credentials");
    }

    console.log("[AUTH] Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, isUserExists.password);
    if (!isPasswordValid) {
      console.log("[AUTH] Login failed: Invalid password");
      throw new Error("Invalid credentials");
    }

    console.log("[AUTH] Generating JWT tokens...");
    const accessToken = JWTHandler.generateAccessToken({ sub: isUserExists.id });
    const refreshToken = JWTHandler.generateRefreshToken({ sub: isUserExists.id });

    console.log("[AUTH] Storing refresh token in Redis...");
    await RedisService.set(`refresh:${isUserExists.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days
    console.log(`[AUTH] Login successful for user: ${email}`);
    return { accessToken, refreshToken };
  }

  /**
   * register_user
   * @param json - Object containing user registration details
   * 
   * What it does:
   *  - Checks if a user already exists with the given email
   *  - Hashes the password
   *  - Creates a new user record in the database
   *  - Returns the created user object (without password)
   * 
   * Returns: Promise<User>
   */
  static async register_user(json: registerDto) {
    console.log(`[AUTH] Starting registration for email: ${json.email}`);
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

    console.log("[AUTH] Creating user instance...");
    const user : User = {
      first_name: json.firstName,
      last_name: json.lastName,
      email: json.email,
      password: json.password
    };

    console.log("[AUTH] Getting database connection...");
    const db = getServiceDatabase('auth');

    console.log("[AUTH] Getting user repository...");
    const userRepo = db.getRepository(User_Table);

    console.log("[AUTH] Checking if user already exists...");
    const isUserExists = await userRepo.findOneBy({ email: user.email });
    if (isUserExists) {
      console.log("[AUTH] Registration failed: User already exists");
      throw new Error("User already exists");
    }

    console.log("[AUTH] Hashing password...");
    const hashedPassword = await bcrypt.hash(json.password, saltRounds);

    console.log("[AUTH] Creating new user entity...");
    const new_user = userRepo.create({
      first_name: json.firstName,
      last_name: json.lastName,
      email: json.email,
      password: hashedPassword
    });

    console.log("[AUTH] Saving new user to database...");
    await userRepo.save(new_user);

    console.log(`[AUTH] User registered successfully: ${new_user.email}`);

    // Remove password from returned object
    const { password, ...safeUser } = new_user;
    return safeUser;
  }

  /**
   * get_current_user (commented out)
   * @param accessToken - JWT token
   * 
   * What it does:
   *  - Verifies access token
   *  - If expired, tries to refresh it
   *  - Returns user details from database
   * 
   * Returns: Promise<{ user, newAccessToken }>
   */
  // static async get_current_user(accessToken: string) {
  //   try {
  //     const decoded = JWTHandler.verifyAccessToken(accessToken);
  //     if (typeof decoded === 'string' || !decoded.sub) throw new Error('Invalid token payload');
  //     const userId = decoded.sub;
  //     const ds = getServiceDatabase('auth');
  //     const userRepo = ds.getRepository(User_Table);
  //     return { user: await userRepo.findOneBy({ id: userId }), newAccessToken: null };
  //   } catch (error: any) {
  //     if (error.message === 'Access token expired') {
  //       const newAccessToken = await JWTHandler.refreshToken(accessToken);
  //       return { user: null, newAccessToken };
  //     }
  //     throw error;
  //   }
  // }
}

export default AuthService;
