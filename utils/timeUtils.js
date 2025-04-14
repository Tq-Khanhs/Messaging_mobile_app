export const formatMessageTime = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  
  // Get time components
  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // Same day - just show time
  if (
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear()
  ) {
    return timeString;
  }
  
  // Calculate time differences
  const dayDiff = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  const monthDiff = now.getMonth() - messageDate.getMonth() + 
                   (now.getFullYear() - messageDate.getFullYear()) * 12;
  const yearDiff = now.getFullYear() - messageDate.getFullYear();
  
  // Same week (within 7 days) - show weekday and time
  if (dayDiff < 7) {
    const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const weekday = weekdays[messageDate.getDay()];
    return `${weekday}, ${timeString}`;
  }
  
  // Same year but different week - show day/month and time
  if (yearDiff === 0) {
    const day = messageDate.getDate().toString().padStart(2, '0');
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} ${timeString}`;
  }
  
  // Different year - show full date
  const day = messageDate.getDate().toString().padStart(2, '0');
  const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
  const year = messageDate.getFullYear();
  return `${day}/${month}/${year} ${timeString}`;
};
// Format recording time
export const formatRecordingTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
// You might have other functions here as well