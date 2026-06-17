<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const produto = ref(null);

const fetchProduto = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/produtos/${route.params.id}/`);
    produto.value = await response.json();
  } catch (error) {
    console.error("Erro ao carregar detalhes:", error);
  }
};

const getImageUrl = (nomeImagem) => {
  try {
    return new URL(`../assets/img/${nomeImagem}`, import.meta.url).href;
  } catch (e) {
    return "";
  }
};

const adicionarAoCarrinho = () => {
  alert(`${produto.value.nome} adicionado ao carrinho!`);
};

onMounted(fetchProduto);
</script>

<template>
  <div v-if="produto" class="detalhes-container">
    <button @click="$router.back()" class="btn-voltar"> Voltar</button>

    <main class="produto-card">
      <div class="img-wrapper">
        <img :src="getImageUrl(produto.imagem)" :alt="produto.nome">
      </div>

      <div class="conteudo">
        <div class="header-meta">
          <h1>{{ produto.nome }}</h1>
          <div class="avaliacao">
            <span v-for="n in 5" :key="n" :class="{ 'ativa': n <= Math.round(produto.avaliacao) }">★</span>
          </div>
        </div>

        <p class="preco">R$ {{ parseFloat(produto.preco).toFixed(2).replace('.', ',') }}</p>

        <div class="detalhes-grid">
          <div class="info-bloco">
            <h3>Base</h3>
            <p>{{ produto.ingredientes_base || 'Ingredientes não informados' }}</p>
          </div>
          <div class="info-bloco">
            <h3>Cobertura</h3>
            <p>{{ produto.ingredientes_creme || 'Sem cobertura' }}</p>
          </div>
        </div>
      </div>
    </main>

    <button class="btn-carrinho" @click="adicionarAoCarrinho">
      Adicionar ao Carrinho
    </button>
  </div>
</template>
