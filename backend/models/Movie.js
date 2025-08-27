import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  imdbID: { type: String, unique: true },
  title: String,
  year: String,
  genre: [String],
  director: String,
  actors: [String],
  runtime: Number,
  rating: Number,
  poster: String,
  plot: String,
  cachedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', movieSchema);
