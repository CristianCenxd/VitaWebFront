// Sistema de rutas simple

export class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
  }

  register(path, component) {
    this.routes[path] = component;
  }

  async navigate(path) {
    const routePath = path.split('?')[0];
    const component = this.routes[routePath];
    if (!component) {
      console.error(`Ruta no encontrada: ${path}`);
      return;
    }

    const app = document.getElementById('app');

    // Renderizar el componente
    if (typeof component === 'function') {
      const html = await component();
      app.innerHTML = html;
      this.currentPage = path;
      window.history.pushState({}, '', `#${path}`);
      return html;
    }
  }

  handlePopState() {
    const path = window.location.hash.slice(1) || '/';
    this.navigate(path);
  }
}

export const router = new Router();
window.addEventListener('popstate', () => router.handlePopState());
