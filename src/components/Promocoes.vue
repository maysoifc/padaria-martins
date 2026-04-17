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
.promocoes-bloco {
  padding-bottom: 20px;
}
.titulo-sessao{
  color: #5E3023;
  padding: 24px 16px 12px;
  font-family: 'Imprima';
  font-weight: 700;
  text-align: center;
  font-size: 40px;
  margin: 0;
}
.grade-promocoes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 16px;
  gap: 12px;
}

.promo-card {
  background-color: #ffffff;
  border-radius: 20px;
  text-align: center;
  overflow: hidden;
  border: 1px solid #eee;
  transition: transform 0.1s ease;
}

.promo-card:active {
  transform: scale(0.96);
  background-color: #f5f5f5;
}

.img-weapper {
  width: 100%;
  height: 90px;
}
.promo-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 20px 20px 0 0;
}

.promo-info {
  padding: 10px;
}

.promo-info h4 {
  color: #545050;
  font-size: 1rem;
  margin:0 0 6px 0;
  font-weight: 600;
  font-family: 'Inter';
}

.dia-promo {
  background-color: #D9CAB3;
  color:#545050;
  padding: 2px 8px;
  border-radius: 15px;
  font-size: 0.7rem;
  display: inline-block;
  font-weight: 700;
  text-transform: uppercase;
}
@media (max-width: 320px){
  .grade-promocoes {
    grid-template-columns: 1fr;
  }
}
</style>

