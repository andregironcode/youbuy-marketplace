import { format } from "date-fns";

export const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return format(date, 'HH:mm');
};

export const formatChatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'HH:mm');
  }
  
  // If within last 7 days, show day of week
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return format(date, 'EEE');
  }
  
  // Otherwise show date
  return format(date, 'dd/MM/yyyy');
};
