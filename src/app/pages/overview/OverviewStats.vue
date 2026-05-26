<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  BarElement, CategoryScale, LinearScale, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const requestsData = {
  labels: ['Pendientes', 'Aceptadas', 'Rechazadas'],
  datasets: [{
    label: 'Solicitudes',
    data: [0, 0, 0],
    backgroundColor: [
      'rgba(234,236,114,.6)',
      'rgba(129,199,132,.6)',
      'rgba(229,115,115,.6)',
    ],
    borderColor: [
      'rgba(234,236,114,1)',
      'rgba(129,199,132,1)',
      'rgba(229,115,115,1)',
    ],
    borderWidth: 1,
    borderRadius: 6,
  }],
};

const charsByClassData = {
  labels: ['Druida', 'Bárbaro', 'C. de Sangre', 'G. Divino', 'C. de Demonios', 'Monje', 'Nigromante', 'Tempest', 'Arcanista'],
  datasets: [{
    label: 'Personajes',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    backgroundColor: 'rgba(227,210,168,.5)',
    borderColor: 'rgba(227,210,168,.9)',
    borderWidth: 1,
    borderRadius: 4,
  }],
};

const statusData = {
  labels: ['Activos', 'Pendientes', 'Inactivos'],
  datasets: [{
    data: [0, 0, 0],
    backgroundColor: [
      'rgba(129,199,132,.6)',
      'rgba(234,236,114,.6)',
      'rgba(229,115,115,.6)',
    ],
    borderColor: [
      'rgba(129,199,132,1)',
      'rgba(234,236,114,1)',
      'rgba(229,115,115,1)',
    ],
    borderWidth: 1,
  }],
};

const charsCreatedData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [{
    label: 'Personajes creados',
    data: [0, 0, 0, 0, 0, 0],
    fill: true,
    borderColor: 'rgba(100,160,255,.8)',
    backgroundColor: 'rgba(100,160,255,.08)',
    tension: 0.4,
    pointBackgroundColor: 'rgba(100,160,255,1)',
    pointRadius: 3,
  }],
};

const base = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 } } },
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
        <div class="chart-wrap">
          <Doughnut :data="statusData" :options="base" />
        </div>
      </div>

      <div class="chart-card">
        <h4 class="chart-title">Solicitudes de ingreso</h4>
        <div class="chart-wrap">
          <Bar :data="requestsData" :options="barOptions" />
        </div>
      </div>

      <div class="chart-card chart-card--full">
        <h4 class="chart-title">Personajes por clase</h4>
        <div class="chart-wrap">
          <Bar :data="charsByClassData" :options="barOptions" />
        </div>
      </div>

      <div class="chart-card chart-card--full">
        <h4 class="chart-title">Personajes creados por mes</h4>
        <div class="chart-wrap">
          <Line :data="charsCreatedData" :options="barOptions" />
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
  grid-template-columns: 260px 1fr;
  gap: 1rem;
}

.chart-card {
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 10px;
  padding: 1.25rem;

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
