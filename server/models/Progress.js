import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manhwaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manhwa', required: true },
    currentChapter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
