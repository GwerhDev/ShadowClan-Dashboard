<template>
  <div class="placeholder-page">
    <i class="fas fa-clock-rotate-left"></i>
    <h3>Actividad reciente</h3>
    <p>Próximamente</p>
  </div>
</template>

<style scoped lang="scss">
.placeholder-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  height: 100%;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, .2);
  text-align: center;

  i    { font-size: 2.5rem; }
  h3   { margin: 0; font-size: 1.1rem; color: rgba(255, 255, 255, .35); }
  p    { margin: 0; font-size: .85rem; }
}
</style>
