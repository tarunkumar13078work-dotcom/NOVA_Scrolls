import NotificationSubscription from '../models/NotificationSubscription.js';
import asyncHandler from '../utils/asyncHandler.js';
import { hasPushConfig, sendPushToUser } from '../services/pushService.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;

export const getPushPublicKey = asyncHandler(async (_req, res) => {
  res.json({ publicKey: publicKey || null });
});

export const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Invalid subscription payload' });
  }

  const subscription = await NotificationSubscription.findOneAndUpdate(
    { userId: req.user._id, endpoint },
    { keys },
    { upsert: true, new: true }
  );

  res.status(201).json({ id: subscription._id, message: 'Subscribed' });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ message: 'Endpoint is required' });
  }

  await NotificationSubscription.findOneAndDelete({ userId: req.user._id, endpoint });
  res.json({ message: 'Unsubscribed' });
});

export const sendTestNotification = asyncHandler(async (req, res) => {
  if (!hasPushConfig()) {
    return res.status(400).json({ message: 'VAPID keys are not configured' });
  }

  const payload = {
    title: 'NOVA Scrolls',
    body: 'Push notifications are now active.',
    url: '/updates',
  };

  await sendPushToUser(req.user._id, payload);

  res.json({ message: 'Test notification dispatched' });
});
