<script setup>
const promocoes = [
  { id: 1, titulo: 'Promoção de bebidas', dia: 'Todas as  Segundas-feiras', imagem: 'img/bebidas.jpg'},
  { id: 2, titulo: 'Promoção de pães', dia: 'Todas as Quartas-feiras', imagem: '/img/paes.jpg'},
  { id: 3, titulo: 'Promoção de doces', dia: 'Todas as Quintas-feiras', imagem: 'img/doces.jpg'},
  { id: 4, titulo: 'Promoção de salgados', dia: 'Todas os Sábados', imagem: '/img/assados.jpg' }

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
.titulo-sessao{
  color: #5E3023;
  padding: 20px 16px 10px;
  font-family: 'Imprima';
  font-weight: bold;
  text-align: center;
  font-size: 43px;
  margin: 0;
}
.grade-promocoes {
  padding: 20px 16px;
}

.grade-promocoes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}
.promo-card {
  background-color: #f5f5f5;
  border-radius: 40px;
  text-align: center;
  box-shadow: 0 4px 10px;
}

.promo-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 20px 20px 0 0;
}

.promo-info {
  padding: 12px 8px 25px;
}

.promo-info h4 {
  color: #545050;
  font-size: 1.3rem;
  margin-bottom: 8px;
  font-weight: bold;
  margin-top: 0;
  font-family: 'Inter';
}

.dia-promo {
  background-color: #D9CAB3;
  color:#545050;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-block;
  font-weight: bolder;
}

</style>

