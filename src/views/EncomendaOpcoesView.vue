<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";

const router = useRouter();
const { produtos, carregarProdutos } = useProducts();

const categoriaSelecionada = ref("salgados");
const termoBusca = ref("");
const carrinhoTemp = ref(
  JSON.parse(localStorage.getItem("encomenda") || "[]")
);

onMounted(() => carregarProdutos(categoriaSelecionada.value));

const ajustarQtd = (item, delta) => {
  const index = carrinhoTemp.value.findIndex(
    (i) => i.idProduto === item.idProduto
  );

  if (index > -1) {
    carrinhoTemp.value[index].qtd += delta;

    if (carrinhoTemp.value[index].qtd <= 0) {
      carrinhoTemp.value.splice(index, 1);
    }
  } else if (delta > 0) {
    carrinhoTemp.value.push({
      ...item,
      qtd: 1
    });
  }

  localStorage.setItem(
    "encomenda",
    JSON.stringify(carrinhoTemp.value)
  );
};

const irParaCheckout = () => {
  localStorage.setItem(
    "encomenda",
    JSON.stringify(carrinhoTemp.value)
  );

  router.push({
    name: "CheckoutEncomenda"
  });
};

const getQtdNoCarrinho = (id) => {
  return (
    carrinhoTemp.value.find((i) => i.idProduto === id)?.qtd || 0
  );
};

const getImageUrl = (img) => {
  try {
    return new URL(
      `../assets/img/${img}`,
      import.meta.url
    ).href;
  } catch {
    return "";
  }
};

const produtosFiltrados = computed(() => {
  const busca = termoBusca.value.toLowerCase().trim();

  if (!busca) return produtos.value;

  return produtos.value.filter((produto) =>
    produto.nome.toLowerCase().includes(busca)
  );
});

const totalItens = computed(() => {
  return carrinhoTemp.value.reduce(
    (acc, item) => acc + Number(item.qtd || 0),
    0
  );
});

const valorTotal = computed(() => {
  return carrinhoTemp.value.reduce(
    (acc, item) =>
      acc +
      parseFloat(item.preco || 0) * Number(item.qtd || 0),
    0
  );
});

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");
};
</script>

<template>
  <div class="encomenda-page">

    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="encomenda-container">

      <header class="page-header">

        <button
          class="btn-voltar"
          @click="$router.back()"
        >
          <span>←</span>
          <span>Voltar</span>
        </button>

        <div class="header-content">
          <span class="eyebrow">ENCOMENDAS</span>

          <h1>
            O que vamos<br />
            <em>preparar?</em>
          </h1>

          <p>
            Escolha seus favoritos e monte sua encomenda
            do seu jeito.
          </p>
        </div>

        <div
          v-if="totalItens > 0"
          class="header-cart"
          @click="irParaCheckout"
        >
          <span class="cart-icon">🛍</span>
          <div>
            <strong>{{ totalItens }}</strong>
            <small>itens</small>
          </div>
        </div>

      </header>

      <section class="search-section">

        <div class="search-box">

          <span class="search-icon">⌕</span>

          <input
            v-model="termoBusca"
            type="text"
            placeholder="O que você está procurando?"
          />

          <button
            v-if="termoBusca"
            class="clear-search"
            @click="termoBusca = ''"
          >
            ×
          </button>

        </div>

      </section>

      <section class="category-section">

        <span class="section-label">
          CATEGORIAS
        </span>

        <CategoryBar
          v-model="categoriaSelecionada"
          @update:modelValue="carregarProdutos"
        />

      </section>

      <section class="products-section">

        <div class="products-heading">

          <div>
            <span class="section-label">
              NOSSO CARDÁPIO
            </span>

            <h2>
              {{
                termoBusca
                  ? "Resultados da busca"
                  : "Escolha seus favoritos"
              }}
            </h2>
          </div>

          <span class="products-count">
            {{ produtosFiltrados.length }}
            {{ produtosFiltrados.length === 1 ? "opção" : "opções" }}
          </span>

        </div>

        <div
          v-if="produtosFiltrados.length"
          class="lista-itens"
        >

          <article
            v-for="item in produtosFiltrados"
            :key="item.idProduto"
            class="item-card"
            :class="{
              'has-item': getQtdNoCarrinho(item.idProduto) > 0
            }"
          >

            <div class="product-image-wrapper">

              <img
                v-if="getImageUrl(item.imagem)"
                :src="getImageUrl(item.imagem)"
                :alt="item.nome"
                class="thumb"
              />

              <div
                v-else
                class="image-placeholder"
              >
                <span>✦</span>
              </div>

              <div
                v-if="getQtdNoCarrinho(item.idProduto) > 0"
                class="selected-badge"
              >
                ✓
              </div>

            </div>

            <div class="info">

              <h3>
                {{ item.nome }}
              </h3>

              <p class="description">
                Uma escolha especial para deixar
                seu momento ainda melhor.
              </p>

              <div class="product-bottom">

                <span class="preco">
                  R$ {{ formatarPreco(item.preco) }}
                </span>

                <div class="mini-selector">

                  <button
                    class="btn-mini minus"
                    :class="{
                      disabled:
                        getQtdNoCarrinho(item.idProduto) === 0
                    }"
                    @click="ajustarQtd(item, -1)"
                  >
                    −
                  </button>

                  <span class="qtd-text">
                    {{ getQtdNoCarrinho(item.idProduto) }}
                  </span>

                  <button
                    class="btn-mini plus"
                    @click="ajustarQtd(item, 1)"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

          </article>

        </div>

        <div
          v-else
          class="empty-state"
        >

          <div class="empty-symbol">
            ⌕
          </div>

          <h3>
            Não encontramos esse item
          </h3>

          <p>
            Tente buscar por outro nome ou escolha
            uma categoria diferente.
          </p>

          <button
            class="empty-button"
            @click="termoBusca = ''"
          >
            Ver todas as opções
          </button>

        </div>

      </section>

      <div
        v-if="carrinhoTemp.length > 0"
        class="floating-checkout"
      >

        <div class="checkout-left">

          <div class="checkout-cart-icon">
            🛍
          </div>

          <div class="checkout-info">

            <span>
              {{ totalItens }}
              {{ totalItens === 1 ? "item selecionado" : "itens selecionados" }}
            </span>

            <strong>
              R$ {{ valorTotal.toFixed(2).replace(".", ",") }}
            </strong>

          </div>

        </div>

        <button
          @click="irParaCheckout"
          class="btn-checkout"
        >
          <span>Continuar</span>
          <strong>→</strong>
        </button>

      </div>

    </main>

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.encomenda-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 5% 5%,
      rgba(187, 162, 112, 0.09),
      transparent 28%
    ),
    radial-gradient(
      circle at 95% 50%,
      rgba(61, 74, 54, 0.07),
      transparent 30%
    ),
    #f8f6f1;
  color: #292c26;
  padding: 0 20px 150px;
  position: relative;
  overflow: hidden;
}

.ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.ambient-one {
  width: 280px;
  height: 280px;
  background: rgba(187, 162, 112, 0.08);
  top: -120px;
  left: -100px;
}

.ambient-two {
  width: 320px;
  height: 320px;
  background: rgba(61, 74, 54, 0.05);
  right: -160px;
  top: 35%;
}

.encomenda-container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding-top: 28px;
}

.page-header {
  position: relative;
  text-align: center;
  padding-top: 48px;
  margin-bottom: 30px;
}

.btn-voltar {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(37, 39, 34, 0.08);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  color: #4c5047;
  padding: 10px 16px;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-voltar:hover {
  background: white;
  transform: translateX(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.btn-voltar span:first-child {
  font-size: 1.1rem;
}

.header-content {
  animation: fadeUp 0.55s ease both;
}

.eyebrow,
.section-label {
  display: block;
  color: #b49a68;
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.eyebrow {
  margin-bottom: 10px;
}

.header-content h1 {
  margin: 0;
  color: #30372c;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 0.96;
  font-weight: 500;
  letter-spacing: -0.055em;
}

.header-content h1 em {
  color: #b49a68;
  font-style: italic;
}

.header-content p {
  max-width: 390px;
  margin: 17px auto 0;
  color: #85877f;
  font-size: 0.88rem;
  line-height: 1.6;
}

.header-cart {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px;
  background: white;
  border: 1px solid #e9e5dc;
  border-radius: 15px;
  cursor: pointer;
  transition: 0.25s ease;
}

.header-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
}

.cart-icon {
  width: 31px;
  height: 31px;
  border-radius: 10px;
  background: #f4efe4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.header-cart div {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.header-cart strong {
  color: #3d4a36;
  font-size: 0.8rem;
}

.header-cart small {
  color: #999b94;
  font-size: 0.62rem;
}

.search-section {
  margin-bottom: 24px;
}

.search-box {
  height: 57px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 17px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e7e2d9;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(48, 51, 43, 0.04);
  transition: 0.25s ease;
}

.search-box:focus-within {
  background: white;
  border-color: #bba270;
  box-shadow:
    0 10px 30px rgba(48, 51, 43, 0.06),
    0 0 0 4px rgba(187, 162, 112, 0.08);
}

.search-icon {
  color: #b49a68;
  font-size: 1.3rem;
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #373b33;
  font-size: 0.87rem;
}

.search-box input::placeholder {
  color: #aaa9a2;
}

.clear-search {
  width: 25px;
  height: 25px;
  border: 0;
  border-radius: 50%;
  background: #efede8;
  color: #777970;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.category-section {
  margin-bottom: 30px;
}

.category-section .section-label {
  margin-bottom: 10px;
}

.products-section {
  animation: fadeUp 0.65s 0.08s ease both;
}

.products-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 16px;
}

.products-heading h2 {
  margin: 5px 0 0;
  color: #353a31;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.025em;
}

.products-count {
  padding: 7px 11px;
  border-radius: 30px;
  background: #f1ede4;
  color: #9b8152;
  font-size: 0.65rem;
  font-weight: 800;
  white-space: nowrap;
}

.lista-itens {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 13px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ebe7df;
  border-radius: 21px;
  box-shadow: 0 8px 25px rgba(45, 47, 40, 0.035);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  animation: cardEnter 0.4s ease both;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: #d7c7a7;
  box-shadow: 0 14px 32px rgba(45, 47, 40, 0.07);
}

.item-card.has-item {
  border-color: #bba270;
  background: #fffdf9;
}

.product-image-wrapper {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  position: relative;
}

.thumb,
.image-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 17px;
  object-fit: cover;
}

.thumb {
  display: block;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(
      145deg,
      #f4eee2,
      #eae2d3
    );
  color: #b49a68;
  font-size: 1.4rem;
}

.selected-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #b49a68;
  color: white;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 900;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.info h3 {
  margin: 0;
  color: #34382f;
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.25;
}

.description {
  margin: 5px 0 10px;
  color: #969790;
  font-size: 0.68rem;
  line-height: 1.45;
  max-width: 320px;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.preco {
  color: #a1834f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.mini-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px;
  background: #f3f1ec;
  border-radius: 13px;
}

.btn-mini {
  width: 31px;
  height: 31px;
  border: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 700;
  transition: 0.2s ease;
}

.btn-mini.minus {
  background: white;
  color: #777970;
}

.btn-mini.minus.disabled {
  opacity: 0.35;
}

.btn-mini.plus {
  background: #30382d;
  color: white;
}

.btn-mini:hover {
  transform: scale(1.06);
}

.btn-mini.plus:hover {
  background: #45503f;
}

.qtd-text {
  width: 22px;
  text-align: center;
  color: #454941;
  font-size: 0.75rem;
  font-weight: 800;
}

.empty-state {
  padding: 55px 25px;
  text-align: center;
  background: rgba(255, 255, 255, 0.75);
  border: 1px dashed #ddd8ce;
  border-radius: 23px;
}

.empty-symbol {
  width: 55px;
  height: 55px;
  margin: 0 auto 15px;
  border-radius: 17px;
  background: #f3eee5;
  color: #b49a68;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.empty-state h3 {
  margin: 0;
  color: #44483f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.15rem;
  font-weight: 500;
}

.empty-state p {
  max-width: 320px;
  margin: 8px auto 18px;
  color: #969790;
  font-size: 0.75rem;
  line-height: 1.5;
}

.empty-button {
  border: 0;
  background: #30382d;
  color: white;
  padding: 11px 17px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
}

.floating-checkout {
  position: fixed;
  z-index: 999;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 680px;
  min-height: 72px;
  padding: 10px 12px 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background:
    linear-gradient(
      135deg,
      #30382d,
      #252c23
    );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 21px;
  box-shadow:
    0 18px 45px rgba(35, 41, 32, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.08);
  color: white;
  animation: checkoutEnter 0.4s ease both;
}

.checkout-left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.checkout-cart-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.checkout-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.checkout-info span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.65rem;
}

.checkout-info strong {
  color: #dcc58f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
}

.btn-checkout {
  min-height: 49px;
  border: 0;
  padding: 0 18px;
  border-radius: 14px;
  background: #b49a68;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
  white-space: nowrap;
}

.btn-checkout strong {
  color: #f3e6c7;
  font-size: 1rem;
}

.btn-checkout:hover {
  background: #c1a874;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(180, 154, 104, 0.22);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkoutEnter {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (min-width: 700px) {
  .lista-itens {
    grid-template-columns: 1fr 1fr;
  }

  .item-card {
    align-items: flex-start;
    flex-direction: column;
    padding: 13px;
  }

  .product-image-wrapper {
    width: 100%;
    height: 170px;
  }

  .info {
    width: 100%;
    flex: 1;
  }

  .description {
    max-width: none;
  }

  .product-bottom {
    margin-top: auto;
  }
}

@media (max-width: 600px) {
  .encomenda-page {
    padding: 0 12px 140px;
  }

  .encomenda-container {
    padding-top: 20px;
  }

  .page-header {
    padding-top: 50px;
    margin-bottom: 24px;
  }

  .header-content h1 {
    font-size: 2.65rem;
  }

  .header-content p {
    max-width: 300px;
    font-size: 0.8rem;
  }

  .header-cart {
    top: 0;
    bottom: auto;
    right: 0;
  }

  .btn-voltar {
    left: 0;
    top: 0;
  }

  .search-box {
    height: 53px;
    border-radius: 16px;
  }

  .products-heading h2 {
    font-size: 1.3rem;
  }

  .item-card {
    padding: 11px;
    gap: 12px;
  }

  .product-image-wrapper {
    width: 78px;
    height: 78px;
  }

  .description {
    display: none;
  }

  .info h3 {
    font-size: 0.86rem;
  }

  .preco {
    font-size: 0.92rem;
  }

  .mini-selector {
    gap: 3px;
  }

  .btn-mini {
    width: 29px;
    height: 29px;
  }

  .floating-checkout {
    bottom: 12px;
    width: calc(100% - 24px);
    border-radius: 18px;
  }

  .checkout-cart-icon {
    display: none;
  }

  .btn-checkout {
    padding: 0 15px;
    min-height: 46px;
  }
}

@media (max-width: 390px) {
  .header-content h1 {
    font-size: 2.35rem;
  }

  .header-cart {
    padding: 7px 9px;
  }

  .header-cart small {
    display: none;
  }

  .product-image-wrapper {
    width: 68px;
    height: 68px;
  }

  .item-card {
    gap: 9px;
  }

  .info h3 {
    font-size: 0.8rem;
  }

  .preco {
    font-size: 0.85rem;
  }

  .btn-mini {
    width: 27px;
    height: 27px;
  }

  .qtd-text {
    width: 19px;
  }

  .checkout-info strong {
    font-size: 0.95rem;
  }

  .btn-checkout span {
    display: none;
  }
}
</style>
