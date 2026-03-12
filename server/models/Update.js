import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manhwaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manhwa', required: true },
    latestChapter: { type: Number, default: 0 },
    lastChecked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Update = mongoose.model('Update', updateSchema);
export default Update;
