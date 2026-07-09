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
