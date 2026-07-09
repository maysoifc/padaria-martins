<script setup>
import { useRouter } from "vue-router";
import InfoCard from "@/components/InfoCard.vue";

const router = useRouter();

const navegarPara = (rota) => {
  router.push(rota);
};
</script>

<template>
  <div class="perfil-view">
    <h1 class="header-title">Meu Perfil</h1>

    <div class="profile-card">
      <InfoCard />
    </div>

    <div class="actions-container">
      <h3 class="section-title">Pedidos</h3>
      <div class="list-item" @click="navegarPara('/novamente')">
        <i class="fas fa-redo"></i> <span>Comprar novamente</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>
      <div class="list-item" @click="navegarPara('/pedidos/favoritos')">
        <i class="fas fa-heart"></i> <span>Favoritos</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>
      <div class="list-item" @click="navegarPara('/pedidos/avaliados')">
        <i class="fas fa-star"></i> <span>Avaliados</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>
      <div class="list-item" @click="navegarPara('/pedidos/preparados')">
        <i class="fas fa-utensils"></i> <span>Preparados</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>

      <h3 class="section-title">Carteira</h3>
      <div class="list-item" @click="navegarPara('/detalhes/carteira/cupons')">
        <i class="fas fa-ticket-alt"></i> <span>Meus Cupons</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>
      <div class="list-item" @click="navegarPara('/detalhes/carteira/selos')">
        <i class="fas fa-certificate"></i> <span>Meus Selos</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>
      <div class="list-item" @click="navegarPara('/detalhes/carteira/cartoes')">
        <i class="fas fa-credit-card"></i> <span>Meus Cartões</span>
        <i class="fas fa-chevron-right arrow"></i>
      </div>

      <button class="btn-logout" @click="navegarPara('/')">
        <i class="fas fa-sign-out-alt"></i> Sair da conta
      </button>
    </div>
  </div>
</template>

<style scoped>
.perfil-view {
  background-color: #fcfaf7;
  min-height: 100vh;
  padding: 2rem 1.25rem 4rem 1.25rem;
  max-width: 600px;
  margin: 0 auto;
  color: #2d2d2d;
}

.header-title {
  font-size: 1.6rem;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

.profile-card {
  position: relative;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 24px;
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.profile-card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(transparent, #eaddc5, transparent 30%);
  animation: girar 6s linear infinite;
}

.profile-card::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: #ffffff;
  border-radius: 22px;
}

.profile-card > * {
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 0.7rem;
  color: #b3b3b3;
  margin: 32px 0 12px 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 800;
}

.list-item {
  background: white;
  padding: 18px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  cursor: pointer;
  border: 1px solid #f5f5f5;
  transition: all 0.3s ease;
}

.list-item:hover {
  border-color: #c5a97a;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(187, 162, 112, 0.1);
}

.list-item i {
  color: #c5a97a;
  margin-right: 20px;
  width: 24px;
}

.list-item span {
  font-weight: 600;
  color: #444;
}

.list-item .arrow {
  margin-left: auto;
  color: #ddd;
}

.btn-logout {
  width: 100%;
  margin-top: 3rem;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #bf9898;
  font-weight: 600;
  cursor: pointer;
}

@keyframes girar {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
