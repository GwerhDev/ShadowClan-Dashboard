<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from '../../../middlewares/store';
import { getOverviewStats } from '../../../middlewares/services';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const store = useStore();
const loading = ref(true);
const data = ref<any>(null);

onMounted(async () => {
  try {
    data.value = await getOverviewStats();
  } finally {
    loading.value = false;
  }
});

const stats = computed(() => [
  { label: 'Usuarios registrados', icon: 'fas fa-users',           value: data.value?.totalUsers      ?? 0 },
  { label: 'Clanes activos',       icon: 'fas fa-shield-alt',      value: data.value?.totalClans      ?? 0 },
  { label: 'Personajes',           icon: 'fas fa-user-group',      value: data.value?.totalCharacters ?? 0 },
  { label: 'Solicitudes',          icon: 'fas fa-envelope',        value: store.pendingRequestsTotal        },
  { label: 'Usuarios activos',     icon: 'fas fa-circle-check',    value: data.value?.activeUsers     ?? 0 },
  { label: 'Sin clan (Walker)',    icon: 'fas fa-person-walking',  value: data.value?.walkers         ?? 0 },
]);

const rolesData = computed(() => {
  const r = data.value?.roleDistribution ?? {};
  return {
    labels: ['Walker', 'Usuario', 'Admin', 'Super Admin'],
    datasets: [{
      data: [r.walker ?? 0, r.user ?? 0, r.admin ?? 0, r.super_admin ?? 0],
      backgroundColor: [
        'rgba(150,150,150,.6)',
        'rgba(100,160,255,.6)',
        'rgba(229,115,115,.6)',
        'rgba(227,210,168,.6)',
      ],
      borderColor: [
        'rgba(150,150,150,1)',
        'rgba(100,160,255,1)',
        'rgba(229,115,115,1)',
        'rgba(227,210,168,1)',
      ],
      borderWidth: 1,
    }],
  };
});

const hasRolesData = computed(() =>
  (data.value?.totalUsers ?? 0) > 0
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 }, padding: 12 },
    },
  },
};
</script>

<template>
  <div class="summary-page">

    <div class="stat-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h4 class="chart-title">Distribución de roles</h4>
        <div v-if="loading" class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else-if="!hasRolesData" class="chart-placeholder">Sin datos</div>
        <div v-else class="chart-wrap">
          <Doughnut :data="rolesData" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card chart-card--wide">
        <h4 class="chart-title">Crecimiento de usuarios</h4>
        <div class="chart-placeholder chart-placeholder--muted">
          <i class="fas fa-clock"></i>
          <span>Disponible cuando los usuarios tengan fecha de registro</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.summary-page {
  padding: 1rem;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Stat grid ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 10px;
  transition: background .15s;

  &:hover { background: rgba(255, 255, 255, .05); }
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(227, 210, 168, .08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i { font-size: 1.1rem; color: rgb(227, 210, 168); }
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: .15rem;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-app-white);
  line-height: 1;
}

.stat-label {
  font-size: .68rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .35);
}

/* ── Charts ── */
.charts-row {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  align-items: start;
  min-width: 0;
}

.chart-card {
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 10px;
  padding: 1.25rem;
  min-width: 0;
  overflow: hidden;
}

.chart-title {
  margin: 0 0 1rem;
  font-size: .75rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .4);
}

.chart-wrap {
  height: 240px;
  position: relative;
}

.chart-placeholder {
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  color: rgba(255, 255, 255, .25);
  font-size: .85rem;

  i { font-size: 1.4rem; }

  &--muted span {
    font-size: .78rem;
    text-align: center;
    max-width: 220px;
    line-height: 1.5;
  }
}

@media (max-width: 900px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
