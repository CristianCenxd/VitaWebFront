import './style.css'
import { router } from './utils/router.js'
import { LoginPage } from './pages/login.js'
import { DashboardPage } from './pages/dashboard.js'
import { PacientesPage } from './pages/pacientes.js'
import { CitasPage } from './pages/citas.js'
import { ConfiguracionPage } from './pages/configuracion.js'
import { ForgotPasswordPage } from './pages/forgot-password.js'
import { ResetPasswordPage } from './pages/resetPassword.js'

// Registrar rutas
router.register('/', LoginPage)
router.register('/login', LoginPage)
router.register('/forgot-password', ForgotPasswordPage)
router.register('/reset-password', ResetPasswordPage)
router.register('/dashboard', DashboardPage, true)
router.register('/pacientes', PacientesPage, true)
router.register('/citas', CitasPage, true)
router.register('/configuracion', ConfiguracionPage, true)

// Inicializar aplicación
function init() {
  const path = window.location.hash.slice(1) || '/'
  router.navigate(path)
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Manejar cambios de URL
window.addEventListener('hashchange', () => {
  const path = window.location.hash.slice(1) || '/'
  router.navigate(path)
})

// Inicializar sidebar (event delegation, no depende de <script> en innerHTML)
let sidebarInitialized = false
function initSidebar() {
  const app = document.getElementById('app')
  if (!app || sidebarInitialized) return
  sidebarInitialized = true

  app.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('#sidebarToggleBtn')
    const backdrop = e.target.closest('#sidebarBackdrop')
    const dataPage = e.target.closest('[data-page]')

    if (toggleBtn || backdrop) {
      const sidebar = document.getElementById('sidebar')
      const backdropEl = document.getElementById('sidebarBackdrop')
      if (sidebar) sidebar.classList.toggle('open')
      if (backdropEl) backdropEl.classList.toggle('hidden')
    }

    if (dataPage) {
      e.preventDefault()
      const page = dataPage.getAttribute('data-page')
      window.location.hash = page
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar')
        const backdropEl = document.getElementById('sidebarBackdrop')
        if (sidebar) sidebar.classList.remove('open')
        if (backdropEl) backdropEl.classList.add('hidden')
      }
    }
  })

  // Soporte de gestos táctiles (Swipe) para dispositivos móviles
  let touchStartX = 0
  let touchStartY = 0
  let touchEndX = 0
  let touchEndY = 0

  app.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }, { passive: true })

  app.addEventListener('touchmove', (e) => {
    touchEndX = e.touches[0].clientX
    touchEndY = e.touches[0].clientY
  }, { passive: true })

  app.addEventListener('touchend', () => {
    const diffX = touchEndX - touchStartX
    const diffY = touchEndY - touchStartY

    // Solo actuar si el deslizamiento es más horizontal que vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const sidebar = document.getElementById('sidebar')
      const backdropEl = document.getElementById('sidebarBackdrop')
      if (!sidebar) return

      const isSidebarOpen = sidebar.classList.contains('open')

      if (!isSidebarOpen) {
        // Deslizar de izquierda a derecha desde el borde izquierdo (< 60px) para abrir
        if (diffX > 75 && touchStartX < 60) {
          sidebar.classList.add('open')
          if (backdropEl) backdropEl.classList.remove('hidden')
        }
      } else {
        // Deslizar de derecha a izquierda para cerrar
        if (diffX < -75) {
          sidebar.classList.remove('open')
          if (backdropEl) backdropEl.classList.add('hidden')
        }
      }
    }
    // Reiniciar
    touchStartX = 0
    touchStartY = 0
    touchEndX = 0
    touchEndY = 0
  }, { passive: true })
}

// Llamar después de cada navegación
const origNavigate = router.navigate.bind(router)
router.navigate = async function(path) {
  const result = await origNavigate(path)
  initSidebar()
  return result
}
