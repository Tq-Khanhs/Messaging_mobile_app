export const formatMessageTime = (timestamp) => {
  const now = new Date()
  const messageDate = new Date(timestamp)

  if (
    now.getDate() === messageDate.getDate() &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear()
  ) {
    return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (
    yesterday.getDate() === messageDate.getDate() &&
    yesterday.getMonth() === messageDate.getMonth() &&
    yesterday.getFullYear() === messageDate.getFullYear()
  ) {
    return `Hôm qua, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  if (messageDate >= oneWeekAgo) {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    const dayName = days[messageDate.getDay()]
    return `${dayName}, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  return `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate.getFullYear()}, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}
