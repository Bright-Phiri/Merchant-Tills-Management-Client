import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export function showToast(title, icon = 'success') {
  Toast.fire({
    icon,
    title,
  })
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
