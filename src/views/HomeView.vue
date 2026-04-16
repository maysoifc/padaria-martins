<script setup>
import { onMounted } from 'vue';
import { useProducts } from '@/composables/useProducts';
import ProductCard from '@/components/ProductCard.vue';

// Importações do Swiper para o carrossel
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const { produtos, carregarProdutos } = useProducts();
const modules = [Pagination];

onMounted(() => {
  carregarProdutos();
});
</script>

<template>
  <main>
    <h2>Destaques da Semana</h2>

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
  </main>
</template>
<style scoped>
main{
  background-color: #F5E9DA;
  min-height: 100vh;
}

h2{
  color: #5E3023;
  padding: 20px 16px 10px;
  font-family: 'Imprima';
  font-weight: bold;
  text-align: center;
  font-size: 43px;
  margin-bottom: 0;
}

.meu-carrossel{
  padding: 10px 16px 50px;
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
