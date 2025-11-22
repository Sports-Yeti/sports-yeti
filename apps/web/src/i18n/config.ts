import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const en = {
  translation: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      noData: 'No data available',
      error: 'An error occurred',
      success: 'Success!',
    },

    // Navigation
    nav: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      analytics: 'Analytics',
      leagues: 'Leagues',
      players: 'Players',
      trainers: 'Trainers',
      camps: 'Camps',
      referees: 'Referees',
      assignments: 'Referee Assignments',
      settings: 'Settings',
      logout: 'Logout',
    },

    // Auth
    auth: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      welcome: 'Welcome to Sports Yeti Admin',
      loginError: 'Invalid credentials',
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome, {{name}}',
      totalLeagues: 'Total Leagues',
      totalPlayers: 'Total Players',
      totalGames: 'Total Games',
      recentActivity: 'Recent Activity',
    },

    // Leagues
    leagues: {
      title: 'Leagues',
      create: 'Create League',
      edit: 'Edit League',
      name: 'League Name',
      sport: 'Sport',
      location: 'Location',
      startDate: 'Start Date',
      endDate: 'End Date',
      teams: 'Teams',
      applications: 'Team Applications',
      pendingApplications: 'Pending Applications',
      approve: 'Approve',
      reject: 'Reject',
      rejectionReason: 'Rejection Reason',
    },

    // Players
    players: {
      title: 'Players',
      search: 'Search Players',
      name: 'Name',
      email: 'Email',
      sport: 'Sport',
      skillLevel: 'Skill Level',
      position: 'Position',
      gamesPlayed: 'Games Played',
      winRate: 'Win Rate',
      profile: 'Player Profile',
    },

    // Teams
    teams: {
      title: 'Teams',
      name: 'Team Name',
      captain: 'Captain',
      members: 'Members',
      wins: 'Wins',
      losses: 'Losses',
      draws: 'Draws',
      apply: 'Apply to League',
      viewMembers: 'View Members',
    },

    // Calendar
    calendar: {
      title: 'Calendar',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      list: 'List',
      game: 'Game',
      assignment: 'Assignment',
      noEvents: 'No events scheduled',
    },

    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      clearAll: 'Clear all',
      noNotifications: 'No notifications',
    },

    // Settings
    settings: {
      title: 'Settings',
      profile: 'Profile Information',
      uploadAvatar: 'Upload Profile Picture',
      uploadDocuments: 'Upload Documents',
      language: 'Language',
      saveChanges: 'Save Changes',
    },

    // Search
    search: {
      placeholder: 'Search leagues, players, trainers, referees, camps...',
      noResults: 'No results found',
      tip: 'Tip: Use Ctrl+K or Cmd+K to quickly open search',
    },
  },
};

// Spanish translations
const es = {
  translation: {
    // Common
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      filter: 'Filtrar',
      close: 'Cerrar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      loading: 'Cargando...',
      noData: 'No hay datos disponibles',
      error: 'Ocurrió un error',
      success: '¡Éxito!',
    },

    // Navigation
    nav: {
      dashboard: 'Panel',
      calendar: 'Calendario',
      analytics: 'Analíticas',
      leagues: 'Ligas',
      players: 'Jugadores',
      trainers: 'Entrenadores',
      camps: 'Campamentos',
      referees: 'Árbitros',
      assignments: 'Asignaciones de Árbitros',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
    },

    // Auth
    auth: {
      login: 'Iniciar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      welcome: 'Bienvenido a Sports Yeti Admin',
      loginError: 'Credenciales inválidas',
    },

    // Dashboard
    dashboard: {
      title: 'Panel',
      welcome: 'Bienvenido, {{name}}',
      totalLeagues: 'Total de Ligas',
      totalPlayers: 'Total de Jugadores',
      totalGames: 'Total de Juegos',
      recentActivity: 'Actividad Reciente',
    },

    // Leagues
    leagues: {
      title: 'Ligas',
      create: 'Crear Liga',
      edit: 'Editar Liga',
      name: 'Nombre de la Liga',
      sport: 'Deporte',
      location: 'Ubicación',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      teams: 'Equipos',
      applications: 'Solicitudes de Equipos',
      pendingApplications: 'Solicitudes Pendientes',
      approve: 'Aprobar',
      reject: 'Rechazar',
      rejectionReason: 'Razón del Rechazo',
    },

    // Players
    players: {
      title: 'Jugadores',
      search: 'Buscar Jugadores',
      name: 'Nombre',
      email: 'Correo',
      sport: 'Deporte',
      skillLevel: 'Nivel de Habilidad',
      position: 'Posición',
      gamesPlayed: 'Juegos Jugados',
      winRate: 'Tasa de Victoria',
      profile: 'Perfil del Jugador',
    },

    // Teams
    teams: {
      title: 'Equipos',
      name: 'Nombre del Equipo',
      captain: 'Capitán',
      members: 'Miembros',
      wins: 'Victorias',
      losses: 'Derrotas',
      draws: 'Empates',
      apply: 'Solicitar a la Liga',
      viewMembers: 'Ver Miembros',
    },

    // Calendar
    calendar: {
      title: 'Calendario',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista',
      game: 'Juego',
      assignment: 'Asignación',
      noEvents: 'No hay eventos programados',
    },

    // Notifications
    notifications: {
      title: 'Notificaciones',
      markAllRead: 'Marcar todas como leídas',
      clearAll: 'Limpiar todas',
      noNotifications: 'Sin notificaciones',
    },

    // Settings
    settings: {
      title: 'Configuración',
      profile: 'Información del Perfil',
      uploadAvatar: 'Subir Foto de Perfil',
      uploadDocuments: 'Subir Documentos',
      language: 'Idioma',
      saveChanges: 'Guardar Cambios',
    },

    // Search
    search: {
      placeholder: 'Buscar ligas, jugadores, entrenadores, árbitros, campamentos...',
      noResults: 'No se encontraron resultados',
      tip: 'Consejo: Usa Ctrl+K o Cmd+K para abrir rápidamente la búsqueda',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es,
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
