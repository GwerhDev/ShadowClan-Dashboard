import { createRouter, createWebHistory } from 'vue-router';
import OverviewPage from '../pages/OverviewPage.vue';
import OverviewSummary from '../pages/overview/OverviewSummary.vue';
import OverviewStats from '../pages/overview/OverviewStats.vue';
import OverviewActivity from '../pages/overview/OverviewActivity.vue';
import ManagementPage from '../pages/ManagementPage.vue';
import ClanManagement from '../components/admin/ClanManagement/ClanManagement.vue';
import CharacterManagement from '../components/admin/CharacterManagement/CharacterManagement.vue';
import UserManagement from '../components/admin/UserManagement/UserManagement.vue';
import ClanRequestsPage from '../pages/ClanRequestsPage.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: OverviewPage,
      redirect: '/overview',
      children: [
        {
          path: 'overview',
          name: 'Overview',
          component: OverviewSummary,
          meta: { title: 'Overview' },
        },
        {
          path: 'stats',
          name: 'Stats',
          component: OverviewStats,
          meta: { title: 'Estadísticas' },
        },
        {
          path: 'activity',
          name: 'Activity',
          component: OverviewActivity,
          meta: { title: 'Actividad' },
        },
      ],
    },
    {
      path: '/management',
      component: ManagementPage,
      redirect: '/management/clans',
      children: [
        {
          path: 'clans',
          name: 'Clans',
          component: ClanManagement,
          meta: { title: 'Clanes', requiresSuperAdmin: true },
        },
        {
          path: 'characters',
          name: 'Characters',
          component: CharacterManagement,
          meta: { title: 'Personajes', requiresSuperAdmin: true },
        },
        {
          path: 'users',
          name: 'Users',
          component: UserManagement,
          meta: { title: 'Usuarios', requiresSuperAdmin: true },
        },
      ],
    },
    {
      path: '/requests',
      name: 'Requests',
      component: ClanRequestsPage,
      meta: { title: 'Solicitudes' },
    },
  ],
});
