<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/composables/useCart';

const router = useRouter();
const { itensCarrinho, removerItem, carregarCarrinho } = useCartStore();

const itensSelecionados = ref([]);

onMounted(() => {
  if (typeof carregarCarrinho === 'function') {
    carregarCarrinho();
  }
  const salvos = localStorage.getItem('itensSelecionados');
  if (salvos) {
    try {
      itensSelecionados.value = JSON.parse(salvos);
    } catch (e) {
      itensSelecionados.value = [];
    }
  }
});

const salvarSelecaoStorage = () => {
  localStorage.setItem('itensSelecionados', JSON.stringify(itensSelecionados.value));
};

const marcarTodos = computed({
  get: () => itensCarrinho.value.length > 0 && itensSelecionados.value.length === itensCarrinho.value.length,
  set: (marcar) => {
    itensSelecionados.value = marcar ? itensCarrinho.value.map(item => item.idProduto) : [];
    salvarSelecaoStorage();
  }
});

const estaSelecionado = (idProduto) => itensSelecionados.value.includes(idProduto);

const alternarSelecao = (idProduto) => {
  const index = itensSelecionados.value.indexOf(idProduto);
  if (index > -1) {
    itensSelecionados.value.splice(index, 1);
  } else {
    itensSelecionados.value.push(idProduto);
  }
  salvarSelecaoStorage();
};

const getImageUrl = (nomeImagem) => {
  try { return new URL(`../assets/img/${nomeImagem}`, import.meta.url).href; } catch (e) { return ""; }
};

const diminuirQuantidade = (item) => {
  if (item.quantidade > 1) {
    item.quantidade--;
  } else {
    removerItem(item.idProduto);
    itensSelecionados.value = itensSelecionados.value.filter(id => id !== item.idProduto);
    salvarSelecaoStorage();
  }
};

const aumentarQuantidade = (item) => { item.quantidade++; };

const valorTotal = computed(() => {
  return itensCarrinho.value.reduce((total, item) => {
    return itensSelecionados.value.includes(item.idProduto)
      ? total + (parseFloat(item.preco) * item.quantidade)
      : total;
  }, 0);
});

const irParaFinalizacao = () => {
  if (itensSelecionados.value.length === 0) {
    alert('Selecione pelo menos um produto para continuar.');
    return;
  }
  const compraFinal = itensCarrinho.value.filter(item => itensSelecionados.value.includes(item.idProduto));
  localStorage.setItem('carrinho', JSON.stringify(compraFinal));

  router.push({ name: 'CheckoutCarrinho' });
};
</script>

<template>
  <div class="carrinho-container">
    <button @click="$router.back()" class="btn-voltar">Voltar</button>
    <h1>Meu Carrinho</h1>

    <div v-if="itensCarrinho.length === 0" class="carrinho-vazio">
      <p>Nenhum produto adicionado ao carrinho ainda.</p>
      <button @click="$router.push('/home')" class="btn-voltar-loja">Ver Produtos</button>
    </div>

    <div v-else class="carrinho-conteudo">
      <div class="lista-cards">
        <div v-for="item in itensCarrinho" :key="item.idProduto" class="item-card">
          <div class="item-lado-esquerdo">
            <input type="checkbox" :checked="estaSelecionado(item.idProduto)" @change="alternarSelecao(item.idProduto)" class="checkbox-item" />
            <img :src="getImageUrl(item.imagem)" :alt="item.nome" class="item-img" />
            <div class="info-texto">
              <h3>{{ item.nome }}</h3>
              <p class="preco">R$ {{ parseFloat(item.preco).toFixed(2).replace('.', ',') }}</p>
            </div>
          </div>
          <div class="controle-quantidade">
            <button @click="diminuirQuantidade(item)" class="btn-controle" :class="{ 'btn-lixo': item.quantidade === 1 }">
              <span v-if="item.quantidade > 1">-</span>
              <i v-else class="fas fa-trash-alt"></i>
            </button>
            <span class="numero-quantidade">{{ item.quantidade }}</span>
            <button @click="aumentarQuantidade(item)" class="btn-controle">+</button>
          </div>
        </div>
      </div>
    </div>

    <div class="rodape-checkout">
      <div class="rodape-superior">
        <label class="checkbox-label">
          <input type="checkbox" v-model="marcarTodos" />
          <span>Selecionar todos</span>
        </label>
        <div class="linha-total">
          <span>Total:</span>
          <strong>R$ {{ valorTotal.toFixed(2).replace('.', ',') }}</strong>
        </div>
      </div>
      <button class="btn-finalizar" @click="irParaFinalizacao">Continuar (Finalizar Compra)</button>
    </div>
  </div>
</template>
