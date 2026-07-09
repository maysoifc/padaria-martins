<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import CategoryBar from "@/components/CategoryBar.vue";

const router = useRouter();
const { produtos, carregarProdutos } = useProducts();

const categoriaSelecionada = ref("salgados");
const termoBusca = ref("");
const carrinhoTemp = ref(JSON.parse(localStorage.getItem('encomenda') || '[]'));

onMounted(() => carregarProdutos(categoriaSelecionada.value));

const ajustarQtd = (item, delta) => {
  const index = carrinhoTemp.value.findIndex(i => i.idProduto === item.idProduto);
  if (index > -1) {
    carrinhoTemp.value[index].qtd += delta;
    if (carrinhoTemp.value[index].qtd <= 0) carrinhoTemp.value.splice(index, 1);
  } else if (delta > 0) {
    carrinhoTemp.value.push({ ...item, qtd: 1 });
  }
  localStorage.setItem('encomenda', JSON.stringify(carrinhoTemp.value));
};

const irParaCheckout = () => {
  localStorage.setItem('encomenda', JSON.stringify(carrinhoTemp.value));
  router.push({ name: 'CheckoutEncomenda' });
};

const getQtdNoCarrinho = (id) => carrinhoTemp.value.find(i => i.idProduto === id)?.qtd || 0;
const getImageUrl = (img) => { try { return new URL(`../assets/img/${img}`, import.meta.url).href; } catch(e) { return ""; } };
const totalItens = computed(() => carrinhoTemp.value.reduce((acc, item) => acc + item.qtd, 0));
const valorTotal = computed(() => carrinhoTemp.value.reduce((acc, item) => acc + (parseFloat(item.preco) * item.qtd), 0));
</script>

<template>
  <div class="encomenda-container">
    <button class="btn-voltar" @click="$router.back()">← Voltar</button>
    <h2>O que vamos preparar?</h2>

    <div class="search-container">
      <input v-model="termoBusca" placeholder="Qual item você procura?" class="search-input" />
    </div>

    <CategoryBar v-model="categoriaSelecionada" @update:modelValue="carregarProdutos" />

    <div class="lista-itens">
      <div v-for="item in produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()))"
           :key="item.idProduto" class="item-card">
        <img :src="getImageUrl(item.imagem)" class="thumb" />
        <div class="info">
          <h3>{{ item.nome }}</h3>
          <p class="preco">R$ {{ parseFloat(item.preco).toFixed(2) }}</p>
        </div>
        <div class="mini-selector">
          <button class="btn-mini" @click="ajustarQtd(item, -1)">-</button>
          <span class="qtd-text">{{ getQtdNoCarrinho(item.idProduto) }}</span>
          <button class="btn-mini" @click="ajustarQtd(item, 1)">+</button>
        </div>
      </div>
    </div>

    <div v-if="carrinhoTemp.length > 0" class="floating-checkout">
      <div class="checkout-info">
        <span>{{ totalItens }} itens</span>
        <strong>Total: R$ {{ valorTotal.toFixed(2) }}</strong>
      </div>
      <button @click="irParaCheckout" class="btn-checkout">Finalizar Encomenda</button>
    </div>
  </div>
</template>

<style scoped>
.encomenda-container { padding: 2rem 1.5rem 120px 1.5rem; max-width: 500px; margin: 0 auto; background-color: #fcfbf7; min-height: 100vh; position: relative; }

.search-input { width: 100%; padding: 14px 20px; border-radius: 25px; border: 1px solid #e0d5c8; background: #fff; box-sizing: border-box; margin-bottom: 1rem; }

.lista-itens { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }

.item-card {
  background: white; padding: 12px; border-radius: 20px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 2px solid transparent; transition: 0.3s;
}
.active-card { border-color: #7d9673; background-color: #f9fbf8; }

.thumb { width: 65px; height: 65px; border-radius: 15px; object-fit: cover; flex-shrink: 0; }
.info { flex: 1; min-width: 0; text-align: left; }
.info h3 { margin: 0; font-size: 0.95rem; color: #3d4a36; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preco { color: #7d9673; font-weight: 700; margin: 4px 0 0 0; }

.mini-selector { display: flex; align-items: center; gap: 8px; background: #f5f5f5; padding: 4px; border-radius: 12px; flex-shrink: 0; }
.btn-mini { width: 32px; height: 32px; border-radius: 50%; border: none; background: #3d4a36; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.qtd-text { font-weight: bold; width: 25px; text-align: center; font-size: 0.9rem; }

.floating-checkout {
  position: fixed; bottom: 20px; left: 20px; right: 20px; max-width: 460px; margin: 0 auto;
  background: #3d4a36; color: white; padding: 15px 25px; border-radius: 20px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 999;
}
.checkout-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.info-qtd { font-size: 0.85rem; opacity: 0.9; }
.info-valor { font-size: 1.1rem; }
.btn-checkout { background: #7d9673; color: white; border: none; padding: 12px 20px; border-radius: 15px; cursor: pointer; font-weight: 700; font-size: 0.95rem; }

.btn-voltar {
  background: rgba(0, 0, 0, 0.03);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem ;
  transition: 0.2s;
}

.btn-voltar:hover { background: rgba(0, 0, 0, 0.08); }

</style>
