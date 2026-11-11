import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbattle',
  jwtSecret: process.env.JWT_SECRET || 'skill_battle_default_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
    apiHost: process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
  }
};

