
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";
import "@/assets/css/EncomendaOpcoes.css";

const router = useRouter();
const { produtos, carregarProdutos } = useProducts();

const categoriaSelecionada = ref("salgados");
const termoBusca = ref("");
const carrinhoTemp = ref([]);

const imagens = import.meta.glob("@/assets/img/*", {
  eager: true,
  import: "default"
});

function carregarCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem("encomenda") || "[]");

    carrinhoTemp.value = Array.isArray(dados)
      ? dados.map(item => ({
          ...item,
          qtd: Math.max(1, Number(item.qtd) || 1)
        }))
      : [];
  } catch {
    carrinhoTemp.value = [];
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem("encomenda", JSON.stringify(carrinhoTemp.value));
  } catch {
    alert("Não foi possível salvar sua encomenda. Tente novamente.");
  }
}

function ajustarQtd(produto, delta) {
  const index = carrinhoTemp.value.findIndex(
    item => String(item.idProduto) === String(produto.idProduto)
  );

  if (index !== -1) {
    const novaQtd = Number(carrinhoTemp.value[index].qtd || 0) + delta;

    if (novaQtd <= 0) {
      carrinhoTemp.value.splice(index, 1);
    } else {
      carrinhoTemp.value[index].qtd = novaQtd;
    }
  } else if (delta > 0) {
    carrinhoTemp.value.push({ ...produto, qtd: 1 });
  }

  salvarCarrinho();
}

function getQtdNoCarrinho(id) {
  return Number(
    carrinhoTemp.value.find(
      item => String(item.idProduto) === String(id)
    )?.qtd || 0
  );
}

function getImageUrl(imagem) {
  if (!imagem) return "";

  if (/^https?:\/\//i.test(imagem)) {
    return imagem;
  }

  const caminho = Object.keys(imagens).find(
    chave => chave.split("/").pop() === imagem
  );

  return caminho ? imagens[caminho] : "";
}

const produtosFiltrados = computed(() => {
  const busca = termoBusca.value.trim().toLocaleLowerCase("pt-BR");

  return (produtos.value || []).filter(produto =>
    String(produto.nome || "").toLocaleLowerCase("pt-BR").includes(busca)
  );
});

const totalItens = computed(() =>
  carrinhoTemp.value.reduce(
    (total, item) => total + Number(item.qtd || 0),
    0
  )
);

const valorTotal = computed(() =>
  carrinhoTemp.value.reduce(
    (total, item) =>
      total + Number(item.preco || 0) * Number(item.qtd || 0),
    0
  )
);

const formatarPreco = valor =>
  Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

function irParaCheckout() {
  if (!carrinhoTemp.value.length) {
    alert("Adicione produtos à sua encomenda antes de continuar.");
    return;
  }

  salvarCarrinho();
  router.push({ name: "CheckoutEncomenda" });
}

watch(categoriaSelecionada, categoria => {
  carregarProdutos(categoria);
});

onMounted(() => {
  carregarCarrinho();
  carregarProdutos(categoriaSelecionada.value);
});
</script>

<template>
  <main class="encomenda-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <div class="encomenda-container">
      <header class="page-header">
        <button type="button" class="btn-voltar" @click="router.back()">
          <i class="fa-solid fa-arrow-left"></i>
          Voltar
        </button>

        <div class="header-content">
          <span class="eyebrow">ENCOMENDAS</span>
          <h1>O que vamos<br /><em>preparar?</em></h1>
          <p>Escolha seus favoritos e monte sua encomenda do seu jeito.</p>
        </div>

        <button
          v-if="totalItens"
          type="button"
          class="header-cart"
          aria-label="Continuar para o checkout"
          @click="irParaCheckout"
        >
          <span class="cart-icon">
            <i class="fa-solid fa-basket-shopping"></i>
          </span>
          <span><strong>{{ totalItens }}</strong> itens</span>
        </button>
      </header>

      <section class="search-section">
        <label class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="termoBusca"
            type="search"
            placeholder="O que você está procurando?"
            aria-label="Buscar produtos"
          />
          <button
            v-if="termoBusca"
            type="button"
            class="clear-search"
            aria-label="Limpar busca"
            @click="termoBusca = ''"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </label>
      </section>

      <section class="category-section">
        <span class="section-label">CATEGORIAS</span>
        <CategoryBar v-model="categoriaSelecionada" />
      </section>

      <section class="products-section">
        <div class="products-heading">
          <div>
            <span class="section-label">NOSSO CARDÁPIO</span>
            <h2>{{ termoBusca ? "Resultados da busca" : "Escolha seus favoritos" }}</h2>
          </div>

          <span class="products-count">
            {{ produtosFiltrados.length }}
            {{ produtosFiltrados.length === 1 ? "opção" : "opções" }}
          </span>
        </div>

        <div v-if="produtosFiltrados.length" class="lista-itens">
          <article
            v-for="item in produtosFiltrados"
            :key="item.idProduto"
            class="item-card"
            :class="{ 'has-item': getQtdNoCarrinho(item.idProduto) > 0 }"
          >
            <div class="product-image-wrapper">
              <img
                v-if="getImageUrl(item.imagem)"
                :src="getImageUrl(item.imagem)"
                :alt="item.nome"
                class="thumb"
                loading="lazy"
              />

              <div v-else class="image-placeholder">
                <i class="fa-solid fa-bread-slice"></i>
              </div>

              <span
                v-if="getQtdNoCarrinho(item.idProduto) > 0"
                class="selected-badge"
                aria-label="Produto adicionado"
              >
                <i class="fa-solid fa-check"></i>
              </span>
            </div>

            <div class="info">
              <h3>{{ item.nome }}</h3>
              <p class="description">
                Uma escolha especial para deixar seu momento ainda melhor.
              </p>

              <div class="product-bottom">
                <span class="preco">R$ {{ formatarPreco(item.preco) }}</span>

                <div class="mini-selector" :aria-label="`Quantidade de ${item.nome}`">
                  <button
                    type="button"
                    class="btn-mini minus"
                    :disabled="getQtdNoCarrinho(item.idProduto) === 0"
                    :aria-label="`Remover uma unidade de ${item.nome}`"
                    @click="ajustarQtd(item, -1)"
                  >
                    −
                  </button>

                  <span class="qtd-text">
                    {{ getQtdNoCarrinho(item.idProduto) }}
                  </span>

                  <button
                    type="button"
                    class="btn-mini plus"
                    :aria-label="`Adicionar uma unidade de ${item.nome}`"
                    @click="ajustarQtd(item, 1)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <span class="empty-symbol">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outro nome ou escolha uma categoria diferente.</p>
          <button type="button" class="empty-button" @click="termoBusca = ''">
            Limpar busca
          </button>
        </div>
      </section>
    </div>

    <aside v-if="totalItens > 0" class="floating-checkout">
      <div class="checkout-left">
        <span class="checkout-cart-icon">
          <i class="fa-solid fa-basket-shopping"></i>
        </span>
        <div class="checkout-info">
          <span>
            {{ totalItens }}
            {{ totalItens === 1 ? "item selecionado" : "itens selecionados" }}
          </span>
          <strong>R$ {{ formatarPreco(valorTotal) }}</strong>
        </div>
      </div>

      <button type="button" class="btn-checkout" @click="irParaCheckout">
        Continuar
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </aside>
  </main>
</template>
