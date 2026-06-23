export const createLayout = (content, currentPage) => {
  const isActive = (page) => currentPage === page ? 'active' : '';

  return `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar backdrop for mobile -->
      <div id="sidebarBackdrop" class="fixed inset-0 bg-black/50 z-40 hidden" onclick="toggleSidebar()"></div>

      <!-- Sidebar Toggle (Mobile) -->
      <button id="sidebarToggleBtn" onclick="toggleSidebar()" class="sidebar-toggle" aria-label="Toggle sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Sidebar -->
      <aside id="sidebar" class="sidebar sidebar-open">
        <!-- Logo Area -->
        <div class="p-6 flex items-center gap-3 border-b border-white/10">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/20">V</div>
          <div>
            <h1 class="font-bold text-base text-white tracking-tight">VitaNutrición</h1>
            <p class="text-xs text-blue-300/70 font-medium">Dashboard Profesional</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-6 space-y-1 px-2">
          <a href="#/dashboard" class="sidebar-item ${isActive('/dashboard')}" data-page="/dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
          <a href="#/pacientes" class="sidebar-item ${isActive('/pacientes')}" data-page="/pacientes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Pacientes</span>
          </a>
          <a href="#/citas" class="sidebar-item ${isActive('/citas')}" data-page="/citas">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 18h.01"></path>
              <path d="M12 18h.01"></path>
              <path d="M16 18h.01"></path>
            </svg>
            <span>Citas</span>
          </a>
        </nav>

        <!-- Bottom Section -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <a href="#/configuracion" class="sidebar-item ${isActive('/configuracion')}" data-page="/configuracion">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Configuración</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main id="mainContent" class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-200" style="margin-left: 280px;">
        <div class="p-8 max-w-7xl mx-auto">
          ${content}
        </div>
      </main>
    </div>

    <script>
      function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('hidden');
      }

      document.querySelectorAll('[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const page = item.getAttribute('data-page');
          window.location.hash = page;
          if (window.innerWidth <= 768) toggleSidebar();
        });
      });
    </script>
  `;
};
