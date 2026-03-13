import webpush from 'web-push';
import NotificationSubscription from '../models/NotificationSubscription.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@nova-scrolls.local';

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export const hasPushConfig = () => Boolean(publicKey && privateKey);

export const sendPushToUser = async (userId, payload) => {
  if (!hasPushConfig()) return { sent: 0 };

  const subscriptions = await NotificationSubscription.find({ userId });
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (_error) {
        await NotificationSubscription.deleteOne({ _id: subscription._id });
      }
    })
  );

  return { sent };
};

export default {
  hasPushConfig,
  sendPushToUser,
};
