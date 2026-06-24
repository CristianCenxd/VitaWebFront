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
router.register('/dashboard', DashboardPage)
router.register('/pacientes', PacientesPage)
router.register('/citas', CitasPage)
router.register('/configuracion', ConfiguracionPage)

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
}

// Llamar después de cada navegación
const origNavigate = router.navigate.bind(router)
router.navigate = async function(path) {
  const result = await origNavigate(path)
  initSidebar()
  return result
}
