import mongoose from 'mongoose';

const readingActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    chaptersRead: { type: Number, default: 0 },
  },
  { timestamps: true }
);

readingActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const ReadingActivity = mongoose.model('ReadingActivity', readingActivitySchema);
export default ReadingActivity;
