<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getOverviewStats, getGrowthStats } from '../../../middlewares/services';
import { Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const router       = useRouter();
const loading      = ref(true);
const data         = ref<any>(null);
const growthRange  = ref<'30' | '60' | '90' | 'all'>('30');
const growthRaw    = ref<{ labels: string[]; counts: number[] }>({ labels: [], counts: [] });
const growthLoading = ref(false);

async function fetchGrowth() {
  growthLoading.value = true;
  try { growthRaw.value = await getGrowthStats(growthRange.value); }
  finally { growthLoading.value = false; }
}

onMounted(async () => {
  try {
    [data.value] = await Promise.all([getOverviewStats(), fetchGrowth()]);
  } finally {
    loading.value = false;
  }
});

watch(growthRange, fetchGrowth);

const stats = computed(() => [
  { label: 'Usuarios registrados', icon: 'fas fa-users',          value: data.value?.totalUsers      ?? 0, to: '/management/users'      },
  { label: 'Personajes',           icon: 'fas fa-user-group',     value: data.value?.totalCharacters ?? 0, to: '/management/characters' },
  { label: 'Usuarios activos',     icon: 'fas fa-circle-check',   value: data.value?.activeUsers     ?? 0, to: '/management/users'      },
  { label: 'Sin clan (Walker)',    icon: 'fas fa-person-walking', value: data.value?.walkers         ?? 0, to: '/management/characters' },
]);


function navigate(to: string) {
  router.push(to);
}

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

const hasRolesData = computed(() => (data.value?.totalUsers ?? 0) > 0);

const growthData = computed(() => ({
  labels: growthRaw.value.labels,
  datasets: [{
    label: 'Nuevos usuarios',
    data: growthRaw.value.counts,
    fill: true,
    borderColor: 'rgba(227,210,168,.8)',
    backgroundColor: 'rgba(227,210,168,.08)',
    tension: 0.4,
    pointBackgroundColor: 'rgba(227,210,168,1)',
    pointRadius: 3,
  }],
}));

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 } } },
  },
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,.4)' }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: { ticks: { color: 'rgba(255,255,255,.4)', stepSize: 1 }, grid: { color: 'rgba(255,255,255,.05)' }, beginAtZero: true },
  },
};

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
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        :class="{ 'stat-card--link': stat.to }"
        @click="stat.to && navigate(stat.to)"
      >
        <div class="stat-icon">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <i v-if="stat.to" class="fas fa-arrow-right stat-arrow"></i>
      </div>

      <!-- Clanes activos -->
      <div class="stat-card stat-card--link" @click="navigate('/management/clans')">
        <div class="stat-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ data?.totalClans ?? 0 }}</span>
          <span class="stat-label">Clanes activos</span>
        </div>
        <i class="fas fa-arrow-right stat-arrow"></i>
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
        <div class="chart-card-header">
          <h4 class="chart-title">Crecimiento de usuarios</h4>
          <div class="range-filters">
            <button
              v-for="r in ([['30', '30d'], ['60', '60d'], ['90', '90d'], ['all', 'Todo']] as [string,string][])"
              :key="r[0]"
              class="range-btn"
              :class="{ active: growthRange === r[0] }"
              @click="growthRange = r[0] as any"
            >{{ r[1] }}</button>
          </div>
        </div>
        <div v-if="growthLoading" class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else class="chart-wrap">
          <Line :data="growthData" :options="lineOptions" />
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
  transition: background .15s, border-color .15s;

  &:hover { background: rgba(255, 255, 255, .05); }

  &--link {
    cursor: pointer;

    &:hover {
      border-color: rgba(227, 210, 168, .2);

      .stat-arrow { opacity: .6; transform: translateX(2px); }
    }
  }
}

.stat-arrow {
  margin-left: auto;
  font-size: .65rem;
  color: rgba(227, 210, 168, .35);
  opacity: 0;
  transition: opacity .15s, transform .15s;
  flex-shrink: 0;
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

.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.chart-title {
  margin: 0;
  font-size: .75rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .4);
}

.range-filters {
  display: flex;
  gap: .35rem;
}

.range-btn {
  padding: .2rem .55rem;
  border-radius: 5px;
  font-size: .7rem;
  font-family: 'Cinzel', serif;
  letter-spacing: .04em;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .1);
  color: rgba(255, 255, 255, .4);
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;

  &:hover {
    border-color: rgba(255, 255, 255, .25);
    color: rgba(255, 255, 255, .7);
  }

  &.active {
    background: rgba(227, 210, 168, .1);
    border-color: rgba(227, 210, 168, .4);
    color: rgb(227, 210, 168);
  }
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
