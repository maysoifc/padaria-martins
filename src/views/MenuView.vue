<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";
import ProductCard from "@/components/ProductCard.vue";
import MenuHeader from "@/components/MenuHeader.vue";

const route = useRoute();
const { produtos, carregarProdutos } = useProducts();

const categoriaSelecionada = ref("Todos os produtos");
const termoBusca = ref("");

const listaFiltrada = computed(() => {
  const lista = Array.isArray(produtos.value) ? produtos.value : [];
  const busca = termoBusca.value.trim().toLocaleLowerCase("pt-BR");

  return lista.filter((produto) => {
    const nome = String(produto.nome || "").toLocaleLowerCase("pt-BR");
    return nome.includes(busca);
  });
});

const atualizarCategoria = async (categoria) => {
  await carregarProdutos(categoria);
};

watch(categoriaSelecionada, (categoria) => {
  atualizarCategoria(categoria);
});

onMounted(async () => {
  const categoriaInicial = route.query.categoria;

  if (typeof categoriaInicial === "string" && categoriaInicial.trim()) {
    categoriaSelecionada.value = categoriaInicial;
  } else {
    await carregarProdutos();
  }
});
</script>

<template>
  <div class="menu-page">
    <MenuHeader />

    <main class="menu-view">
      <section class="search-area">
        <div class="search-box">
          <i
            class="fa-solid fa-magnifying-glass search-icon"
            aria-hidden="true"
          ></i>

          <input
            v-model="termoBusca"
            type="search"
            class="search-input"
            placeholder="Buscar produto..."
            aria-label="Buscar produtos pelo nome"
          />

          <button
            v-if="termoBusca"
            type="button"
            class="clear-search"
            aria-label="Limpar busca"
            @click="termoBusca = ''"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <CategoryBar v-model="categoriaSelecionada" />
      </section>

      <div class="resultado-info">
        <span>
          {{ categoriaSelecionada }}
        </span>

        <span class="quantidade" aria-label="Quantidade de produtos encontrados">
          {{ listaFiltrada.length }}
        </span>
      </div>

      <section
        v-if="listaFiltrada.length"
        class="product-grid"
        aria-label="Produtos disponíveis"
      >
        <ProductCard
          v-for="produto in listaFiltrada"
          :key="produto.idProduto"
          :produto="produto"
        />
      </section>

      <section v-else class="sem-produtos" aria-live="polite">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>

        <h2>Nenhum produto encontrado</h2>

        <p>
          Tente buscar por outro nome ou escolha outra categoria.
        </p>

        <button
          v-if="termoBusca"
          type="button"
          class="limpar-filtros"
          @click="termoBusca = ''"
        >
          Limpar busca
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped src="@/assets/css/MenuView.css"></style>
