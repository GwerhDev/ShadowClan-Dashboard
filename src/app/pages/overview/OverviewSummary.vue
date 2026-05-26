<script setup lang="ts">
import { useStore } from '../../../middlewares/store';
import { Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Filler,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const store = useStore();

const stats = [
  { label: 'Usuarios registrados', icon: 'fas fa-users', value: 0 },
  { label: 'Clanes activos', icon: 'fas fa-shield-alt', value: 0 },
  { label: 'Personajes', icon: 'fas fa-user-group', value: 0 },
  { label: 'Solicitudes', icon: 'fas fa-envelope', value: () => store.pendingRequestsCount },
  { label: 'Usuarios activos', icon: 'fas fa-circle-check', value: 0 },
  { label: 'Sin clan (Walker)', icon: 'fas fa-person-walking', value: 0 },
];

const rolesData = {
  labels: ['Walker', 'Usuario', 'Líder', 'Oficial', 'Admin'],
  datasets: [{
    data: [0, 0, 0, 0, 0],
    backgroundColor: [
      'rgba(150,150,150,.6)',
      'rgba(100,160,255,.6)',
      'rgba(227,210,168,.6)',
      'rgba(129,199,132,.6)',
      'rgba(229,115,115,.6)',
    ],
    borderColor: [
      'rgba(150,150,150,1)',
      'rgba(100,160,255,1)',
      'rgba(227,210,168,1)',
      'rgba(129,199,132,1)',
      'rgba(229,115,115,1)',
    ],
    borderWidth: 1,
  }],
};

const growthData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    label: 'Nuevos usuarios',
    data: [0, 0, 0, 0, 0, 0],
    fill: true,
    borderColor: 'rgba(227,210,168,.8)',
    backgroundColor: 'rgba(227,210,168,.08)',
    tension: 0.4,
    pointBackgroundColor: 'rgba(227,210,168,1)',
    pointRadius: 3,
  }],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 } },
    },
  },
};

const lineOptions = {
  ...chartOptions,
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,.4)' },
      grid: { color: 'rgba(255,255,255,.05)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,.4)' },
      grid: { color: 'rgba(255,255,255,.05)' },
      beginAtZero: true,
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
          <span class="stat-value">{{ typeof stat.value === 'function' ? stat.value() : stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h4 class="chart-title">Distribución de roles</h4>
        <div class="chart-wrap">
          <Doughnut :data="rolesData" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card chart-card--wide">
        <h4 class="chart-title">Crecimiento de usuarios</h4>
        <div class="chart-wrap">
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

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  grid-auto-rows: 90px;
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

  &:hover {
    background: rgba(255, 255, 255, .05);
  }
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

  i {
    font-size: 1.1rem;
    color: rgb(227, 210, 168);
  }
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

.charts-row {
  display: grid;
  grid-template-columns: 260px 1fr;
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
  height: 220px;
  position: relative;
}

@media (max-width: 900px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
