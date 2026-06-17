<script setup>
import { useRouter } from 'vue-router'; 
const props = defineProps({
  produto: Object
});

const router = useRouter();
const irParaDetalhes = () => {
  router.push(`/produto/${props.produto.idProduto}`);
};

const getImageUrl = (nomeImagem) => {
  try {
    return new URL(`../assets/img/${nomeImagem}`, import.meta.url).href;
  } catch (e) {
    console.error("Imagem não encontrada:", nomeImagem);
    return "";
  }
};

const toggleFavorito = async () => {
  const novoStatus = !props.produto.favorito;
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/produtos/${props.produto.idProduto}/favorito/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorito: novoStatus })
    });
    if (response.ok) {
      props.produto.favorito = novoStatus;
    }
  } catch (error) {
    console.error("Erro ao favoritar", error);
  }
};
</script>

<template>
  <div class="card" @click="irParaDetalhes" style="cursor: pointer;">
    <div class="image-container">
      <div class="rating-badge" v-if="produto.avaliacao">
        <i class="fa-solid fa-star star-icon"></i>
        <span>{{ produto.avaliacao }}</span>
      </div>
      <img :src="getImageUrl(produto.imagem)" :alt="produto.nome">
    </div>

    <h3>{{ produto.nome }}</h3>

    <div class="border-top">
      <p class="preco">R$ {{ produto.preco }}</p>
      <button class="favorite-btn" @click.stop="toggleFavorito">
        <i :class="produto.favorito ? 'fas fa-heart' : 'far fa-heart'"
           :style="{ color: '#bba270' }"></i>
      </button>
    </div>
  </div>
</template>
<style scoped>
.card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  padding-bottom: 20px;
  text-align: center;
  box-shadow: 0.4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.image-container {
  position: relative;
  width: 100%;
  height: 150px;
}

.card img {
  width: 100%;
  height: 130px;
  border-radius: 20px 20px 0 0;
  object-fit: cover;
}
.card:active {
  transform: scale(0.95);
  box-shadow: none;
  opacity: 0.9;
}

h3 {
  color: #6a6059;
  font-size: 1rem;
  font-weight: 600;
  margin: 8px 0 5px 0;
}

.preco {
  color: #bba270;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 12px;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
}

.border-top {
  display: flex;
  justify-content: space-between;
  border-top: 3px solid #bba270;
  width: 90%;
  align-items: center;
}
</style>
