<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/composables/useCart';

const route = useRoute();
const router = useRouter();
const produto = ref(null);
const cartStore = useCartStore();
const mostrarModal = ref(false);
const quantidadeDesejada = ref(1);
const acaoPendente = ref(null);

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

const abrirModal = (acao) => {
  acaoPendente.value = acao;
  quantidadeDesejada.value = 1;
  mostrarModal.value = true;
};

const confirmarAcao = () => {
  if (produto.value && quantidadeDesejada.value > 0) {
    for (let i = 0; i < quantidadeDesejada.value; i++) {
      cartStore.adicionarItem(produto.value);
    }

    if (acaoPendente.value === 'carrinho') {
      alert(`${quantidadeDesejada.value}x ${produto.value.nome} adicionado(s) ao carrinho!`);
    } else if (acaoPendente.value === 'comprar') {
      router.push('/carrinho');
    }
  }
  mostrarModal.value = false;
};

onMounted(fetchProduto);
</script>

<template>
  <div v-if="produto" class="detalhes-container">
    <button @click="$router.back()" class="btn-voltar">Voltar</button>

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

    <div class="rodape-acoes">
      <button class="btn-acao btn-carrinho" @click="abrirModal('carrinho')">
        Adicionar ao Carrinho
      </button>
      <button class="btn-acao btn-comprar" @click="abrirModal('comprar')">
        Comprar Agora
      </button>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-conteudo">
        <h3>Selecione a quantidade</h3>

        <div class="controle-quantidade">
          <button @click="quantidadeDesejada > 1 ? quantidadeDesejada-- : null">-</button>
          <span>{{ quantidadeDesejada }}</span>
          <button @click="quantidadeDesejada++">+</button>
        </div>

        <div class="modal-botoes">
          <button class="btn-modal btn-cancelar" @click="mostrarModal = false">Cancelar</button>
          <button class="btn-modal btn-confirmar" @click="confirmarAcao">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.detalhes-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 5rem 1.5rem;
  position: relative;
  box-sizing: border-box;
}

.produto-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.img-wrapper {
  height: 250px;
  width: 100%;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conteudo { padding: 1.5rem; }

.header-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

h1 { font-size: 1.5rem; margin: 0; color: #1a1a1a; letter-spacing: -0.5px; }

.preco {
  font-size: 1.2rem;
  font-weight: 700;
  color: #bba270;
  margin-bottom: 1.5rem;
}

.detalhes-grid { display: grid; gap: 1rem; }

.info-bloco h3 {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  margin-bottom: 0.2rem;
}

.info-bloco p {
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
}

.avaliacao span {
  color: #ccc;
  font-size: 1rem;
}

.avaliacao span.ativa {
  color: #bba270;
}

.rodape-acoes {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 0.6rem 1rem;
  display: flex;
  gap: 0.6rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
  box-sizing: border-box;
  justify-content: center;
}

.btn-acao {
  flex: 1;
  max-width: 200px;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: transform 0.1s, opacity 0.2s;
}

.btn-acao:active {
  transform: scale(0.96);
}

.btn-carrinho {
  background: #f4eee1;
  color: #bba270;
}

.btn-carrinho:hover {
  opacity: 0.9;
}

.btn-comprar {
  background: #1a1a1a;
  color: #ffffff;
}

.btn-comprar:hover {
  background: #bba270;
}

.btn-voltar {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-voltar:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-conteudo {
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-conteudo h3 {
  margin-top: 0;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.controle-quantidade {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.controle-quantidade button {
  background: #f4eee1;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: #bba270;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.controle-quantidade button:hover {
  background: #e4d7be;
}

.controle-quantidade span {
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 20px;
  color: #1a1a1a;
}

.modal-botoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-modal {
  flex: 1;
  padding: 0.8rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar {
  background: #eee;
  color: #666;
}

.btn-confirmar {
  background: #bba270;
  color: white;
}

.btn-confirmar:hover {
  background: #a18752;
}
</style>
