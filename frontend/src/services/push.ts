import api from './api';

type PushRegistrationResult = {
  subscribed: boolean;
  reason?: 'unsupported' | 'denied' | 'missing-vapid-key';
};

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const registerPushIfAvailable = async (): Promise<PushRegistrationResult> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return { subscribed: false, reason: 'unsupported' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { subscribed: false, reason: 'denied' };
  }

  const { data } = await api.get('/notifications/public-key');
  if (!data?.publicKey) {
    return { subscribed: false, reason: 'missing-vapid-key' };
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    }));

  await api.post('/notifications/subscribe', subscription.toJSON());
  return { subscribed: true };
};
