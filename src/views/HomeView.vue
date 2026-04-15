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
</style>
