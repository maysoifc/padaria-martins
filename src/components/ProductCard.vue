<script setup>
defineProps({
  produto: Object
});
</script>

<template>
  <div class="card">
    <img :src="produto.imagem" :alt="produto.nome_produto">
    <h3>{{ produto.nome_produto }}</h3>
    <p class="preco">R$ {{ produto.preco }}</p>
  </div>
</template>

<style scoped>
.card {
  background-color:  #fff;
  border-radius: 15px;
  padding: 12px;
  text-align: center;
  box-shadow: 0.4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  aspect-ratio:  1/1;
}

h3{
  color: #3d2b1f;
  font-size: 0.9rem;
  margin: 8.px 0 4px;
}

.preco {
  color: #8B5E3C;
  font-weight: bold;
}
</style>
