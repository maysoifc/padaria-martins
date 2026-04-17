<script setup>
const props = defineProps({
  produto: Object
});

 const toggleFavorito = async() => {
    const novoStatus = !props.produto.favorito;

    try {
      const response = await fetch(`http://localhost:3000/produtos/${props.produto.idProduto}/favorito`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: novoStatus })
      });

      if (response.ok) {
        props.produto.favorito = novoStatus;
      }
    }catch (error) {
      console.error("Erro ao favoritar", error);
      alert("Não foi possível favoritar o produto.");
    }
  };
</script>
<template>
  <div class="card">
    <div class="image-container">
      <div class="rating-badge" v-if="produto.avaliacao">
        <i class="fa-solid fa-star star-icon"></i>
        <span>{{ produto.avaliacao }}</span>
      </div>
      <img :src="produto.imagem" :alt="produto.nome_produto">
    </div>

    <h3>{{ produto.nome_produto }}</h3>

    <div class="border-top">
      <p class="preco">R$ {{ produto.preco }}</p>
      <button class="favorite-btn" @click.stop="toggleFavorito">
        <i :class="produto.favorito ? 'fas fa-heart' : 'far fa-heart'"
           :style="{ color: '#bba270' }">
        </i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  background-color:  #ffffff;
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

.card:active {
  transform: scale(0.98);
  box-shadow: 0 5px 10px rgb(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  width: 100%;
  height: 150px;
}
.card img {
  width:  100%;
  height: 130px;
  border-radius: 20px 20px 0 0;
  object-fit: cover;
}

.rating-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: #fff;
  padding: 4px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 2;
}
.star-icon {
  color: #ffd700;
}

.card-content {
  padding: 12px;
  text-align: left;
}
h3{
  color: #6a6059;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 5px;
  overflow: hidden;
  margin-top: 0;

}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.preco {
  color: #bba270;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 12px;
}

.favorite-btn{
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 8px;
  font-size: 1.8rem;
  cursor: pointer;
  border: none;
}

.favorite-btn i {
  font-size: 1.4rem;
  color: #bba270;
}

.border-top{
  display: flex;
  justify-content: space-between;
  border-top: 3px solid #bba270;
  width: 90%;
  align-items: center;
}


</style>
