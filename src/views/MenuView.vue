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

  return produtos.value.filter((p) =>
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

  <main class="menu-view">

    <div class="search-area">

      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>

        <input
          v-model="termoBusca"
          type="search"
          placeholder="Buscar produto..."
          class="search-input"
        />

        <button
          v-if="termoBusca"
          type="button"
          class="clear-search"
          @click="termoBusca = ''"
          aria-label="Limpar busca"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <CategoryBar v-model="categoriaSelecionada" />

    </div>

    <div class="resultado-info">
      <span>
        {{ categoriaSelecionada === "Todos os produtos"
          ? "Todos os produtos"
          : categoriaSelecionada }}
      </span>

      <span class="quantidade">
        {{ listaFiltrada.length }}
      </span>
    </div>

    <div v-if="listaFiltrada.length" class="product-grid">
      <ProductCard
        v-for="produto in listaFiltrada"
        :key="produto.idProduto"
        :produto="produto"
      />
    </div>

    <div v-else class="sem-produtos">
      <i class="fa-solid fa-magnifying-glass"></i>

      <h3>Nenhum produto encontrado</h3>

      <p>
        Tente buscar por outro nome ou escolha outra categoria.
      </p>
    </div>

  </main>
</template>
<style scoped>
.menu-view {
  min-height: 100vh;
  padding-bottom: 90px;
  background: #f7f1e7;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 16px 16px 10px;

  background: transparent;
}

.search-box {
  flex: 1;
  height: 48px;

  display: flex;
  align-items: center;

  padding: 0 14px;

  background: #ffffff;

  border: 1px solid #e5dbcf;
  border-radius: 17px;

  box-shadow: 0 3px 10px rgba(94, 48, 35, 0.06);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-box:focus-within {
  border-color: #c5a66a;

  box-shadow:
    0 0 0 3px rgba(197, 166, 106, 0.14);
}

.search-icon {
  flex-shrink: 0;

  margin-right: 11px;

  color: #c09d5f;
  font-size: 18px;
}

.search-input {
  width: 100%;
  height: 100%;

  padding: 0;

  border: none;
  outline: none;

  background: transparent;

  color: #5e3023;

  font-family: inherit;
  font-size: 14px;
}

.search-input::placeholder {
  color: #a99d91;
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.clear-search {
  width: 28px;
  height: 28px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background: #f5eee3;
  color: #5e3023;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;
}

.clear-search:active {
  transform: scale(0.9);
}

.resultado-info {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 11px 20px 14px;

  color: #5e3023;

  font-size: 15px;
  font-weight: 700;
}

.quantidade {
  min-width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 8px;

  border-radius: 20px;

  background: #eee4d3;
  color: #5e3023;

  font-size: 12px;
  font-weight: 700;
}

.product-grid {
  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 18px;

  padding: 0 16px 24px;
}

.sem-produtos {
  min-height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;

  color: #5e3023;
}

.sem-produtos > i {
  margin-bottom: 15px;

  font-size: 38px;

  color: #c5a66a;
}

.sem-produtos h3 {
  margin: 0 0 7px;

  font-size: 17px;
  font-weight: 700;
}

.sem-produtos p {
  max-width: 280px;

  margin: 0;

  color: #8d8176;

  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .menu-view {
    padding-bottom: 88px;
  }

  .search-area {
    padding: 16px 14px 9px;
  }

  .search-box {
    height: 48px;
    border-radius: 16px;
  }

  .search-input {
    font-size: 14px;
  }

  .resultado-info {
    padding: 11px 18px 14px;
  }

  .product-grid {
    gap: 18px;

    padding-left: 14px;
    padding-right: 14px;
  }
}

@media (max-width: 380px) {
  .search-area {
    gap: 7px;

    padding-left: 11px;
    padding-right: 11px;
  }

  .search-box {
    height: 46px;
  }

  .search-icon {
    margin-right: 8px;
    font-size: 16px;
  }

  .search-input {
    font-size: 13px;
  }

  .resultado-info {
    padding-left: 14px;
    padding-right: 14px;
  }

  .product-grid {
    gap: 12px;

    padding-left: 11px;
    padding-right: 11px;
  }
}
</style>