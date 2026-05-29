<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";
import ProductCard from "@/components/ProductCard.vue";
import MenuHeader from "@/components/MenuHeader.vue";

const { produtos, carregarProdutos } = useProducts();
const categoriaSelecionada = ref("Todos os produtos");
const termoBusca = ref("");
const listaFiltrada = computed(() => {
  if (!produtos.value) return [];
  return produtos.value.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.value.toLowerCase())
  );
});

watch(categoriaSelecionada, (novaCat) => {
  carregarProdutos(novaCat);
});

onMounted(() => carregarProdutos());
</script>

<template>
  <MenuHeader />
  <div class="menu-view">
    <div class="search-container">
      <input
        v-model="termoBusca"
        placeholder="Qual item você procura?"
        class="search-input"
      />
    </div>

    <CategoryBar v-model="categoriaSelecionada" />

    <div class="product-grid">
      <ProductCard
        v-for="produto in listaFiltrada"
        :key="produto.idProduto"
        :produto="produto"
      />
    </div>
  </div>
</template>

<style scoped>
.menu-view {
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}
.search-container {
  padding: 10px 15px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 450px;
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid #e0d5c8;
  background-color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #bba270;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 15px;
}
</style>
