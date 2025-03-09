
import { format, differenceInDays, isToday } from "date-fns";

export const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return format(date, 'HH:mm');
};

export const formatChatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show time
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  // If within last 7 days, show day of week
  const diffDays = differenceInDays(now, date);
  if (diffDays < 7) {
    return format(date, 'EEE');
  }
  
  // Otherwise show date
  return format(date, 'dd/MM/yyyy');
};

export const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};
