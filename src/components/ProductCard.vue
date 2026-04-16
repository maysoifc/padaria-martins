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

</style>
