import { getServiceDatabase } from '../db/database';
import JWTHandler from '../utilities/jwt_handler';
import RedisService from '../utilities/redis_service';
import { User } from './auth_models';
import { User_Table } from './auth_schemas';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

class AuthService {
  // private static db = getServiceDatabase('auth');
  // private static userRepo = this.db.getRepository(User_Table);




  /**
   * login_user
   * @param json - Object containing email and password
   * 
   * What it does:
   *  - Extracts email and password from json
   *  - Validates user existence and password
   *  - Generates access and refresh tokens
   *  - Stores refresh token in Redis
   * 
   * Returns: Promise<{ accessToken, refreshToken }>
   */
  static async login_user(json: any) {

    const { password, email } = json;
    console.log("Starting login for:", email);

    console.log("Getting database connection...");
    const db = getServiceDatabase('auth');

    console.log("Getting user repository...");
    const userRepo = db.getRepository(User_Table);

    console.log("Checking if user exists...");
    const isUserExists = await userRepo.findOneBy({ email: email });
    if (!isUserExists) {
      console.log("Login failed: User does not exist");
      throw new Error("Invalid credentials");
    }

    console.log("Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, isUserExists.password);
    if (!isPasswordValid) {
      console.log("Login failed: Invalid password");
      throw new Error("Invalid credentials");
    }

    console.log("Generating tokens...");
    const accessToken = JWTHandler.generateAccessToken({ sub: isUserExists.id });
    const refreshToken = JWTHandler.generateRefreshToken({ sub: isUserExists.id });

    console.log("Storing refresh token in Redis...");
    await RedisService.set(`refresh:${isUserExists.id}`, refreshToken, 7 * 24 * 60 * 60);
    return { accessToken, refreshToken };
  }


  /**
   * register_user
   * @param json - Object containing user registration details
   * 
   * What it does:
   *  - Hashes the password
   *  - Creates a new user in the database
   *  - Checks for existing user before creation
   * 
   * Returns: Promise<User> - The created user without password
   */
  static async register_user(json: any) {
    
    console.log("Starting registration for:", json.email);
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

    console.log("Getting database connection...");

    const user = new User(
      json.firstName,
      json.lastName,
      json.email,
      json.password,
    )

    console.log("Getting user repository...");
    const db = getServiceDatabase('auth');
    const userRepo = db.getRepository(User_Table);

    console.log("Checking if user exists...");
    const isUserExists = await userRepo.findOneBy({ email: user.email });
    if (isUserExists) {
      console.log("Registration failed: User already exists");
      throw new Error("User already exists");
    }

    console.log("Hashing password...");  
    const hashedPassword = await bcrypt.hash(json.password, saltRounds);

    console.log("Creating new user entity...");
    const new_user = userRepo.create({
      first_name: json.firstName,
      last_name: json.lastName,
      email: json.email,
      password: hashedPassword,
    });


    console.log("Saving user to database...");  
    await userRepo.save(new_user);

    console.log("User registered successfully:", new_user.email);


    const { password, ...safeUser } = new_user;

    return safeUser;
  }

  /**
   * get_curent_user
   * @param accessToken - The JWT access token
   * 
   * What it does:
   *  - Verifies the access token
   *  - If expired, attempts to refresh the token
   *  - Retrieves user details from the database
   * 
   * Returns: Promise<{ user, newAccessToken }>
   */
  // static async get_curent_user(accessToken: string) {
  //   try {
  //     const decoded = JWTHandler.verifyAccessToken(accessToken);

  //     if (typeof decoded === 'string' || !decoded.sub) {
  //       throw new Error('Invalid token payload');
  //     }

  //     const userId = decoded.sub;

  //     const ds = getServiceDatabase('auth');
  //     const userRepo = ds.getRepository(User_Table);

  //     return {
  //       user: await userRepo.findOneBy({ id: userId }),
  //       newAccessToken: null
  //     };

  //   } catch (error: any) {

  //     if (error.message === 'Access token expired') {

  //       const newAccessToken = await JWTHandler.refreshToken(accessToken);

  //       return { // use 401 HTTP response code
  //         user: null,
  //         newAccessToken
  //       };
  //     }

  //     throw error;
  //   }
  // }

}

export default AuthService;
