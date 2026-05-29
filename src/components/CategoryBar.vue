<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const categorias = ref([]);

const fetchCategorias = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/categorias/');
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    categorias.value = await response.json();
  } catch (error) {
    console.error('Erro na conexão:', error);
  }
};

const selecionar = (cat) => {
  emit('update:modelValue', cat);
};

onMounted(() => {
  fetchCategorias();
});
</script>

<template>
  <div class="menu-categorias">
    <button
      @click="selecionar('')"
      :class="['btn-categoria', { 'btn-ativo': modelValue === '' }]"
    >
      Todos
    </button>

    <button
      v-for="cat in categorias"
      :key="cat.idCategoria"
      type="button"
      @click="selecionar(cat.nome_categoria)"
      :class="['btn-categoria', { 'btn-ativo': modelValue === cat.nome_categoria }]"
    >
      {{ cat.nome_categoria }}
    </button>
  </div>
</template>
