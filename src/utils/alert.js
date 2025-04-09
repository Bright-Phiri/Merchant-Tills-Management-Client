import Swal from 'sweetalert2'

export function showAlert(icon, title, text) {
  return Swal.fire({
    icon,
    title,
    text,
  })
}
