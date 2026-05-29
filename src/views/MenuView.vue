<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";
import ProductCard from "@/components/ProductCard.vue";
import MenuHeader from "@/components/MenuHeader.vue";

const { produtos, carregarProdutos } = useProducts();
const categoriaSelecionada = ref("Todos os produtos");
const termoBusca = ref("");

// 1. Filtro local para o texto de busca
const listaFiltrada = computed(() => {
  if (!produtos.value) return [];
  return produtos.value.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.value.toLowerCase())
  );
});

// 2. Watch para recarregar do banco SEMPRE que a categoria mudar
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

