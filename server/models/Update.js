import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manhwaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manhwa', required: true },
    source: {
      type: String,
      enum: ['asura', 'reaper', 'flame'],
      default: 'asura',
    },
    sourceUrl: { type: String, default: '' },
    sourceSlug: { type: String, default: '' },
    latestChapter: { type: Number, default: 0 },
    lastChecked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Update = mongoose.model('Update', updateSchema);
export default Update;
