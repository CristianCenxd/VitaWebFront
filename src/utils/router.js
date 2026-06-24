import { createLayout } from '../components/layout.js';

export class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
  }

  register(path, component, requiresLayout = false) {
    this.routes[path] = { component, requiresLayout };
  }

  async navigate(path) {
    const routePath = path.split('?')[0];
    const route = this.routes[routePath];
    if (!route) {
      console.error(`Ruta no encontrada: ${path}`);
      return;
    }

    const { component, requiresLayout } = route;

    // Redirigir a la raíz si no se detecta un usuario registrado y la ruta requiere layout
    if (requiresLayout && (!localStorage.getItem('token') || !localStorage.getItem('nutriologo_actual'))) {
      console.warn('Usuario no autenticado, redirigiendo a la raíz');
      window.location.hash = '/';
      return;
    }

    const app = document.getElementById('app');

    // Obtener el HTML del componente
    let pageHtml = '';
    if (typeof component === 'function') {
      pageHtml = await component();
    }

    if (requiresLayout) {
      const pageContentEl = document.getElementById('pageContent');
      if (pageContentEl) {
        // El layout ya está renderizado. Solo actualizamos el contenido interno y el estado activo del sidebar
        pageContentEl.innerHTML = pageHtml;

        // Actualizar clase activa en el sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
          const itemPage = item.getAttribute('data-page');
          if (itemPage === routePath) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      } else {
        // El layout no está renderizado, lo renderizamos completo
        app.innerHTML = createLayout(pageHtml, routePath);
      }
    } else {
      // Página que no requiere layout (login, registro, etc.), renderizamos directamente en el app
      app.innerHTML = pageHtml;
    }

    this.currentPage = path;
    window.history.pushState({}, '', `#${path}`);
    return pageHtml;
  }

  handlePopState() {
    const path = window.location.hash.slice(1) || '/';
    this.navigate(path);
  }
}

export const router = new Router();
window.addEventListener('popstate', () => router.handlePopState());
