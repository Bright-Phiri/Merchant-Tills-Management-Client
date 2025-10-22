import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function showToast(title, icon) {
  Toast.fire({
    icon,
    title,
  })
}

export function showPersistentToast(title, icon = 'info') {
  return Toast.fire({
    icon,
    title,
    timer: 0,
    showConfirmButton: false,
  })
}

export function closeToast() {
  Swal.close()
}

export function showAlert(icon, title, text) {
  return Swal.fire({
    icon,
    title,
    text,
  })
}

export function getColor(status) {
  if (status === 'active') return '#01A1FF'
  else return '#ff6692'
}

export function formatCurrency(amount) {
  if (!amount) return 'MW 0.00'
  return `MW${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const PASSPHRASE = 'My$ecretKey123'

async function deriveKey(salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptPassword(password) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(password),
  )

  const fullBytes = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...fullBytes))
}

export async function decryptPassword(encryptedBase64) {
  const data = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0))
  const salt = data.slice(0, 16)
  const iv = data.slice(16, 28)
  const encrypted = data.slice(28)

  const key = await deriveKey(salt)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)

  return decoder.decode(decrypted)
}
