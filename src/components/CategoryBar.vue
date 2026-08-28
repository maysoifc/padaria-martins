<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const categorias = ref([]);

const fetchCategorias = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const response = await fetch(`${baseUrl}/categorias/`);
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

<style scoped>
.menu-categorias {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 15px;
  width: 100%;
}

.btn-categoria {
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #bba270;
  background: white;
  color: #bba270;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  transition: all 0.2s;
  min-width: 70px;
}

.btn-ativo {
  background: #bba270 !important;
  color: white !important;
}
</style>
