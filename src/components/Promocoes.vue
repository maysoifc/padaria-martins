<script setup>
const promocoes = [
  { id: 4, titulo: 'Promoção de pães', dia: 'Todas as Quartas-feiras', imagem: '/img/paes.jpg'},
  { id: 1, titulo: 'Promoção de bebidas', dia: 'Todas as  Segundas-feiras', imagem: 'img/bebidas.jpg'},
  { id: 3, titulo: 'Promoção de doces', dias: 'Todas as Quintas-feiras', imagem: 'img/doces.jpg'},
  { id: 2, titulo: 'Promoção de salgados', dia: 'Todas as Terças-feiras', imagem: '/img/assados.jpg' },

];
</script>
<template>
  <section class="promocoes-bloco">
  <h2 class="titulo-sessao">Promoções da semana</h2>

  <div class="grade-promocoes">
  <div class="promo-card" v-for="promo in promocoes" :key="promo.id">
  <img :src="promo.imagem" :alt="promo.titulo" class="promo-img">
  <div class="promo-info">
  <h4>{{  promo.titulo }}</h4>
  <span class="dia-promo">{{ promo.dia }}</span>
  </div>
  </div>
  </div>
  </section>
</template>
<style scoped>
</style>

