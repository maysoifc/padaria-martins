<script setup>
import { onMounted } from 'vue';
import { useProducts } from '@/composables/useProducts';
import ProductCard from '@/components/ProductCard.vue';

// Importações do Swiper para o carrossel
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import Promocoes from '../components/Promocoes.vue';
import SobreNos from '@/components/SobreNos.vue';

const { produtos, carregarProdutos } = useProducts();
const modules = [Pagination];

onMounted(() => {
  carregarProdutos();
});
</script>

<template>
  <main>
    <h2 class="titulo-sessao">Destaques da Semana</h2>

    <swiper
      :modules="modules"
      :slides-per-view="2.2"
      :space-between="16"
      :pagination="{ clickable: true }"
      class="meu-carrossel"
    >
      <swiper-slide v-for="item in produtos" :key="item.idProduto">
        <ProductCard :produto="item" />
      </swiper-slide>
    </swiper>

    <Promocoes />
    <SobreNos />
  </main>
</template>
<style scoped>

.home-container {
  width: 100vw;
  min-height: 100vh;
}
.titulo-sessao{
  color: #5E3023;
  font-family: 'Imprima';
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 4px;
  max-width: 90%;
  margin-top: 10px;
  margin-left: 20px;
  text-align: center;
}

.meu-carrossel{
  width: 100%;
  padding: 10px 16px 50px;
  box-sizing: border-box;
}
:deep(.swiper-pagination-bullet){
  background-color: #8B5E3C;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active){
  background-color: #3D2B1F;
  width: 10px;
  height: 10px;
}
</style>
