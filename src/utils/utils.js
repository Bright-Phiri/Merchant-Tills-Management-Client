import Swal from 'sweetalert2'

export function showAlert(icon, title, text) {
  return Swal.fire({
    icon,
    title,
    text,
  })
}

export function getColor(status) {
  if (status === 'active') return 'success'
  else return 'red'
}
