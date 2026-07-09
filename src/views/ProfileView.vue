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
