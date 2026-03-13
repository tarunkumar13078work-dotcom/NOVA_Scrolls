import mongoose from 'mongoose';

const notificationSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

notificationSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

const NotificationSubscription = mongoose.model('NotificationSubscription', notificationSubscriptionSchema);
export default NotificationSubscription;
