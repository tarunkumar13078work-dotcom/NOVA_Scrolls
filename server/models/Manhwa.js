import mongoose from 'mongoose';

const manhwaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    cover: { type: String, default: '' },
    totalChapters: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['reading', 'completed', 'on-hold', 'dropped', 'planning'],
      default: 'reading',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Manhwa = mongoose.model('Manhwa', manhwaSchema);
export default Manhwa;
