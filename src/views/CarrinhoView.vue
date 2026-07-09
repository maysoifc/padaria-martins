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


<style scoped>
.carrinho-container {
  max-width: 750px;
  margin: 0 auto;
  padding: 2rem 1.5rem 11rem 1.5rem;
  box-sizing: border-box;
  position: relative;
}

h1 {
  font-size: 2rem;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 2rem;
}

.carrinho-vazio {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.carrinho-vazio p {
  color: #999;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.lista-cards {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.item-card {
  background: white;
  border-radius: 20px;
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  box-sizing: border-box;
}

.item-lado-esquerdo {
  display: flex;
  gap: 1rem;
  align-items: center;
  min-width: 0;
}

.checkbox-item {
  width: 22px;
  height: 22px;
  accent-color: #bba270;
  cursor: pointer;
  flex-shrink: 0;
}

.item-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.info-texto {
  overflow: hidden;
}

.info-texto h3 {
  font-size: 1.1rem;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-texto .preco {
  font-size: 1.05rem;
  font-weight: 700;
  color: #bba270;
  margin: 0;
}

.controle-quantidade {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f7f5f0;
  padding: 0.2rem 0.3rem;
  border-radius: 50px;
  flex-shrink: 0;
}

.btn-controle {
  background: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-controle:hover {
  background: #eae6df;
}

.btn-lixo {
  background: #fff5f5;
  color: #e53e3e;
}

.btn-lixo:hover {
  background: #fed7d7;
}

.numero-quantidade {
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  color: #1a1a1a;
}
.rodape-checkout {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #eaeaea;
  border-radius: 28px 28px 0 0;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  max-width: 750px;
  margin: 0 auto;
  box-sizing: border-box;
}

.rodape-superior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  color: #333;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
  accent-color: #bba270;
  cursor: pointer;
}

.linha-total {
  font-size: 1.2rem;
  color: #1a1a1a;
  display: flex;
  gap: 8px;
}

.linha-total strong {
  color: #bba270;
  font-weight: 700;
}

.btn-finalizar {
  width: 100%;
  background: #bba270;
  color: white;
  padding: 1.1rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  transition: background 0.3s, transform 0.1s;
}

.btn-finalizar:hover {
  background: #a18752;
}

.btn-finalizar:active {
  transform: scale(0.98);
}

.btn-voltar, .btn-voltar-loja {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.btn-voltar {
  position: absolute;
  top: 2rem;
  left: 1.5rem;
}

.btn-voltar:hover, .btn-voltar-loja:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>
