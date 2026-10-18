import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from '../../middlewares/store';
import OverviewPage from '../pages/OverviewPage.vue';
import OverviewSummary from '../pages/overview/OverviewSummary.vue';
import OverviewStats from '../pages/overview/OverviewStats.vue';
import OverviewActivity from '../pages/overview/OverviewActivity.vue';
import ManagementPage from '../pages/ManagementPage.vue';
import ClanManagement from '../components/admin/ClanManagement/ClanManagement.vue';
import CharacterManagement from '../components/admin/CharacterManagement/CharacterManagement.vue';
import UserManagement from '../components/admin/UserManagement/UserManagement.vue';
import ClanRequestsPage from '../pages/ClanRequestsPage.vue';
import ClanDetailPage from '../pages/management/ClanDetailPage.vue';
import PrizeManagement from '../components/admin/PrizeManagement/PrizeManagement.vue';

const router = createRouter({
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
      redirect: '/management/users',
      children: [
        {
          path: 'clans',
          name: 'Clans',
          component: ClanManagement,
          meta: { title: 'Clanes', requiresSuperAdmin: true },
        },
        {
          path: 'clans/:id',
          name: 'ClanDetail',
          component: ClanDetailPage,
          meta: { title: 'Detalle de Clan', requiresSuperAdmin: true },
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
        {
          path: 'prizes',
          name: 'Prizes',
          component: PrizeManagement,
          meta: { title: 'Premios', requiresSuperAdmin: true },
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

// Las rutas con `requiresSuperAdmin` solo las ve un super_admin; el resto vuelve al overview.
// (El backend igual valida los permisos; esto es solo UX.)
router.beforeEach(async (to) => {
  const store = useStore();
  await store.ensureUserData();
  if (store.unauthorized) return true; // App.vue muestra UnauthorizedPage
  const isSuperAdmin = store.currentUser.userData?.role === 'super_admin';
  if (to.matched.some(r => r.meta.requiresSuperAdmin) && !isSuperAdmin) return { path: '/overview' };
  return true;
});

export default router;
