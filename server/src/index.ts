import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { taskRoutes } from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server on :${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error('failed to connect to mongodb:', err.message);
    process.exit(1);
  });
