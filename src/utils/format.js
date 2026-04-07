export function formatDuration(seconds = 0) {
  const s = Number(seconds) || 0
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = Math.floor(s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function formatDateTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch (err) {
    return iso
  }
}
