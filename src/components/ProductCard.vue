<script setup>
defineProps({
  produto: Object
});
</script>

<template>
  <div class="card">
  <img src="" alt="Produto"> <h3>{{ produto.nome_produto  }}</h3>
  <p>R$ {{ produto.preco }}</p>
  </div>
</template>

<style scoped>

</style>
