export function formatDate(
  date: string | Date | number | undefined | null,
  format = 'YYYY-MM-DD',
): string {
  if (date === null || date === undefined) return '-'

  let d: Date

  if (date instanceof Date) {
    d = date
  } else if (typeof date === 'number') {
    d = new Date(date)
  } else if (typeof date === 'string') {
    d = new Date(date)
  } else {
    return '-'
  }

  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(date: string | Date | number | undefined | null): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function formatDateOnly(date: string | Date | number | undefined | null): string {
  return formatDate(date, 'YYYY-MM-DD')
}

export function formatTime(date: string | Date | number | undefined | null): string {
  return formatDate(date, 'HH:mm:ss')
}

export function getRelativeTime(date: string | Date | number | undefined | null): string {
  if (date === null || date === undefined) return '-'

  let d: Date

  if (date instanceof Date) {
    d = date
  } else if (typeof date === 'number') {
    d = new Date(date)
  } else if (typeof date === 'string') {
    d = new Date(date)
  } else {
    return '-'
  }

  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years}年前`
  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}
