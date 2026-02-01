import { Router } from 'express';
import type { Request, Response } from 'express';
import AuthService from './auth_service';


const authRoutes = Router();

/**
 * POST /register
 * Logic for user registration.
 */
authRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('AUTH SERVICE HIT:', req.method, req.url);
    const user = await AuthService.register_user(req.body);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (err: any) {
    console.error('Register error:', err);
    if (err.message === 'User already exists') {
      res.status(409).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /login
 * Logic for user login and token generation.
 */
authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login_user(req.body);
    res
      .cookie("accessToken",
        result.accessToken,{
        httpOnly: true,
        secure: false, 
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, 
      })
      .status(200)
      .json({
        message: 'Login successful',
      });
  } catch (err: any) {
    console.error('Login error:', err);
    if (err.message === 'Invalid credentials') {
      res.status(401).json({ message: 'Login failed: Invalid credentials' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /health
 * Simple health check for the Auth Service.
 */
authRoutes.get('/health', (req, res) => {
  res.status(200).json({ status: 'Auth Service is up' });
});


export default authRoutes;