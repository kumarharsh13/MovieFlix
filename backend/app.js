// app.js
import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js'; 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ API is up');
});

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

export default app;
