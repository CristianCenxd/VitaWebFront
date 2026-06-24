import './style.css'
import { router } from './utils/router.js'
import { LoginPage } from './pages/login.js'
import { DashboardPage } from './pages/dashboard.js'
import { PacientesPage } from './pages/pacientes.js'
import { CitasPage } from './pages/citas.js'
import { ConfiguracionPage } from './pages/configuracion.js'
import { ForgotPasswordPage } from './pages/forgot-password.js'

// Registrar rutas
router.register('/', LoginPage)
router.register('/login', LoginPage)
router.register('/forgot-password', ForgotPasswordPage)
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
