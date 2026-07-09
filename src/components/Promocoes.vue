<script setup>
const promocoes = [
  { id: 1, titulo: 'Promoção de bebidas', dia: 'Todas as Segundas', imagem: '/img/bebidas.jpg', categoria: 'Bebidas' },
  { id: 2, titulo: 'Promoção de pães', dia: 'Todas as Quartas', imagem: '/img/paes.jpg', categoria: 'Pães' },
  { id: 3, titulo: 'Promoção de doces', dia: 'Todas as Quintas', imagem: '/img/doces.jpg', categoria: 'Doces' },
  { id: 4, titulo: 'Promoção de salgados', dia: 'Todos os Sábados', imagem: '/img/assados.jpg', categoria: 'Salgados' }
];
</script>

<template>
  <section class="promocoes-bloco">
    <h2 class="titulo-sessao">Promoções da semana</h2>

    <div class="grade-promocoes">
      <RouterLink
        v-for="promo in promocoes"
        :key="promo.id"
        :to="{ path: '/menu', query: { categoria: promo.categoria } }"
        class="promo-card"
      >
        <img :src="promo.imagem" :alt="promo.titulo" class="promo-img">
        <div class="promo-info">
          <h4>{{ promo.titulo }}</h4>
          <span class="dia-promo">{{ promo.dia }}</span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
<style scoped>
.promocoes-bloco {
  padding-bottom: 20px;
}
.titulo-sessao {
  color: #5E3023;
  font-family: 'Imprima';
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 20px auto 10px auto;
  text-align: center;
}

.grade-promocoes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  max-width: 100%;
  padding: 0 16px;
  gap: 12px;
  box-sizing: border-box;
  margin: 0 auto;
}

.promo-card {
  background-color: #ffffff;
  border-radius: 20px;
  text-align: center;
  overflow: hidden;
  border: 1px solid #eee;
  transition: transform 0.1s ease;
  text-decoration: none;
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

