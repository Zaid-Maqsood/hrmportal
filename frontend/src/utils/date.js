const TZ = 'Asia/Karachi';

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-PK', { timeZone: TZ, year: 'numeric', month: 'short', day: 'numeric' });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-PK', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-PK', { timeZone: TZ, year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const isPast = (date) => new Date(date) < new Date();
