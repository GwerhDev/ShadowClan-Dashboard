<script setup lang="ts">
import { CLIENT_URL } from '../../middlewares/misc/const';
</script>

<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <img src="../../assets/svg/diablo-icon.svg" alt="icon" class="icon" />
      <h1>Acceso Denegado</h1>
      <p class="main-msg">No tienes permisos para acceder al Dashboard.</p>
      <div class="warning-box">
        <i class="fas fa-triangle-exclamation"></i>
        <span>
          Hemos registrado tu IP. Demonios han sido enviados a tu domicilio.
          Espera en casa.
        </span>
      </div>
      <a :href="CLIENT_URL" class="btn-back">
        <i class="fas fa-arrow-left"></i>
        Volver a la aplicación
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unauthorized-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-bg);
}

.unauthorized-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 3rem 2.5rem;
  background: rgba(255, 255, 255, .03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, .08);
  max-width: 480px;
  text-align: center;

  .icon {
    width: 64px;
    height: 64px;
    opacity: .7;
  }

  h1 {
    font-size: 1.6rem;
    color: rgb(227, 210, 168);
    filter: drop-shadow(0 0 6px rgba(255, 0, 0, 0.4));
  }

  .main-msg {
    margin: 0;
    color: rgba(230, 227, 218, .7);
    font-size: .95rem;
  }

  .warning-box {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .85rem 1rem;
    background-color: rgba(123, 41, 23, .2);
    border: 1px solid rgba(123, 41, 23, .5);
    border-radius: 8px;
    text-align: left;
    font-size: .85rem;
    color: rgba(230, 227, 218, .85);
    line-height: 1.5;

    i {
      color: #f87171;
      margin-top: .1rem;
      flex-shrink: 0;
    }
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .5rem 1.25rem;
    border-radius: 6px;
    font-size: .9rem;
    font-weight: 500;
    background-color: var(--color-primary);
    color: var(--color-app-white);
    text-decoration: none;
    transition: opacity .2s;

    &:hover {
      opacity: .85;
    }
  }
}
</style>
