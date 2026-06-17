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

<style scoped>
.detalhes-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.produto-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.img-wrapper {
  height: 300px;
  width: 100%;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conteudo { padding: 2rem; }

.header-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

h1 { font-size: 1.8rem; margin: 0; color: #1a1a1a; letter-spacing: -0.5px; }

.preco {
  font-size: 1.4rem;
  font-weight: 700;
  color: #bba270;
  margin-bottom: 2rem;
}

.detalhes-grid { display: grid; gap: 1.5rem; }

.info-bloco h3 {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  margin-bottom: 0.4rem;
}

.btn-carrinho {
  width: 100%;
  margin-top: 2rem;
  background: #1a1a1a;
  color: white;
  padding: 1.2rem;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background 0.3s;
}

.btn-carrinho:hover {
  background: #bba270;
  transform: translateY(-2px);
}

.btn-voltar {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-voltar:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
