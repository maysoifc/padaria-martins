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
    <img :src="produto.imagem" :alt="produto.nome_produto">
    <h3>{{ produto.nome_produto }}</h3>
    <div class="border-top">
    <p class="preco">R$ {{ produto.preco }}</p>
     <button class="favorite-btn" @click.stop="toggleFavorito">
  <i :class="produto.favorito ? 'fas fa-heart' : 'far fa-heart'"
     :style="{ color: produto.favorito ? '#bba270' : '#bba270' }">
  </i>
</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color:  #fff;
  border-radius: 30px;
  padding-bottom: 20px;
  text-align: center;
  box-shadow: 0.4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card:active {
  transform: translate(-5px) scale(0.98);
  box-shadow: 0 5px 10px rgb(0, 0, 0, 0.1);
}
.card img {
  width:  100%;
  height: 140px;
  border-radius: 30px 30px 0 0;
  object-fit: cover;
  aspect-ratio:  1/1;
}

h3{
  color: #6a6059;
  font-size: 1.2rem;
  font-weight: bolder;
  text-align: center;
  margin-top: 12px;
  margin-bottom: 5px;
}

.preco {
  color: #bba270;
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: 12px;
}

.favorite-btn{
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  font-size: 1.8rem;
}

.border-top{
  display: flex;
  justify-content: space-between;
  border-top: 3px solid #bba270;
  width: 80%;
}

</style>
