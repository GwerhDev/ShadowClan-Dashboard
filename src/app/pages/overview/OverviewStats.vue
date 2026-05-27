<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getOverviewStats } from '../../../middlewares/services';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  BarElement, CategoryScale, LinearScale, Tooltip, Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const loading = ref(true);
const data    = ref<any>(null);

onMounted(async () => {
  try {
    data.value = await getOverviewStats();
  } finally {
    loading.value = false;
  }
});

const statusData = computed(() => ({
  labels: ['Activos', 'Pendientes', 'Inactivos'],
  datasets: [{
    data: [
      data.value?.activeUsers   ?? 0,
      data.value?.pendingUsers  ?? 0,
      data.value?.inactiveUsers ?? 0,
    ],
    backgroundColor: ['rgba(129,199,132,.6)', 'rgba(234,236,114,.6)', 'rgba(229,115,115,.6)'],
    borderColor:     ['rgba(129,199,132,1)',   'rgba(234,236,114,1)',   'rgba(229,115,115,1)'],
    borderWidth: 1,
  }],
}));

const requestsData = computed(() => ({
  labels: ['Pendientes', 'Aceptadas', 'Rechazadas'],
  datasets: [{
    label: 'Solicitudes de ingreso',
    data: [
      data.value?.clanRequests?.pending  ?? 0,
      data.value?.clanRequests?.accepted ?? 0,
      data.value?.clanRequests?.rejected ?? 0,
    ],
    backgroundColor: ['rgba(234,236,114,.6)', 'rgba(129,199,132,.6)', 'rgba(229,115,115,.6)'],
    borderColor:     ['rgba(234,236,114,1)',   'rgba(129,199,132,1)',   'rgba(229,115,115,1)'],
    borderWidth: 1,
    borderRadius: 6,
  }],
}));

const charsByClassData = computed(() => {
  const items = data.value?.charactersByClass ?? [];
  return {
    labels: items.map((c: any) => c.label),
    datasets: [{
      label: 'Personajes',
      data:  items.map((c: any) => c.count),
      backgroundColor: 'rgba(227,210,168,.5)',
      borderColor:     'rgba(227,210,168,.9)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };
});

const hasStatusData   = computed(() => (data.value?.totalUsers      ?? 0) > 0);
const hasRequestsData = computed(() => {
  const r = data.value?.clanRequests;
  return r && (r.pending + r.accepted + r.rejected) > 0;
});
const hasClassData    = computed(() =>
  (data.value?.charactersByClass ?? []).some((c: any) => c.count > 0)
);

const base = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 } } },
  },
};

const doughnutOptions = {
  ...base,
  plugins: {
    ...base.plugins,
    legend: { ...base.plugins.legend, position: 'bottom' as const, labels: { ...base.plugins.legend.labels, padding: 12 } },
  },
};

const barOptions = {
  ...base,
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,.4)' }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: { ticks: { color: 'rgba(255,255,255,.4)' }, grid: { color: 'rgba(255,255,255,.05)' }, beginAtZero: true },
  },
};
</script>

<template>
  <div class="stats-page">
    <div class="charts-grid">

      <div class="chart-card">
        <h4 class="chart-title">Estado de usuarios</h4>
        <div v-if="loading" class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else-if="!hasStatusData" class="chart-placeholder">Sin datos</div>
        <div v-else class="chart-wrap">
          <Doughnut :data="statusData" :options="doughnutOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h4 class="chart-title">Solicitudes de ingreso</h4>
        <div v-if="loading" class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else-if="!hasRequestsData" class="chart-placeholder">Sin solicitudes</div>
        <div v-else class="chart-wrap">
          <Bar :data="requestsData" :options="barOptions" />
        </div>
      </div>

      <div class="chart-card chart-card--full">
        <h4 class="chart-title">Personajes por clase</h4>
        <div v-if="loading" class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else-if="!hasClassData" class="chart-placeholder">Sin personajes</div>
        <div v-else class="chart-wrap chart-wrap--tall">
          <Bar :data="charsByClassData" :options="barOptions" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-page {
  padding: 1rem;
  padding-top: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
}

.chart-card {
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 10px;
  padding: 1.25rem;
  min-width: 0;
  overflow: hidden;

  &--full {
    grid-column: 1 / -1;
  }
}

.chart-title {
  margin: 0 0 1rem;
  font-size: .75rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .4);
}

.chart-wrap {
  height: 220px;
  position: relative;

  &--tall { height: 260px; }
}

.chart-placeholder {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, .25);
  font-size: .85rem;

  i { font-size: 1.4rem; }
}

@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;

    .chart-card--full {
      grid-column: 1;
    }
  }
}
</style>
