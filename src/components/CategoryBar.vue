<script setup>
import { ref, onMounted } from "vue";
import "@/assets/css/filtroCategorias.css";

defineProps({
  modelValue: {
    type: String,
    default: "Todos os produtos",
  },
});

const emit = defineEmits(["update:modelValue"]);

const categorias = ref([]);
const aberto = ref(false);

const carregarCategorias = async () => {
  try {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const response = await fetch(`${baseUrl}/categorias/`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    categorias.value = await response.json();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
};

const selecionar = (categoria) => {
  emit("update:modelValue", categoria);
  aberto.value = false;
};

const abrirFiltro = () => {
  aberto.value = !aberto.value;
};

onMounted(carregarCategorias);

defineExpose({ abrirFiltro });
</script>

<template>
  <div class="filtro-wrapper">
    <button
      type="button"
      class="btn-filtro"
      :class="{ ativo: modelValue !== 'Todos os produtos' }"
      :aria-expanded="aberto"
      aria-label="Filtrar produtos por categoria"
      @click="abrirFiltro"
    >
      <i class="fa-solid fa-sliders"></i>

      <span v-if="modelValue !== 'Todos os produtos'">
        {{ modelValue }}
      </span>

      <i
        class="fa-solid fa-chevron-down seta"
        :class="{ aberta: aberto }"
      ></i>
    </button>

    <div v-if="aberto" class="filtro-menu">
      <button
        type="button"
        class="opcao-filtro"
        :class="{ selecionada: modelValue === 'Todos os produtos' }"
        @click="selecionar('Todos os produtos')"
      >
        <span>Todos os produtos</span>
        <i
          v-if="modelValue === 'Todos os produtos'"
          class="fa-solid fa-check"
        ></i>
      </button>

      <button
        v-for="categoria in categorias"
        :key="categoria.idCategoria"
        type="button"
        class="opcao-filtro"
        :class="{ selecionada: modelValue === categoria.nome_categoria }"
        @click="selecionar(categoria.nome_categoria)"
      >
        <span>{{ categoria.nome_categoria }}</span>

        <i
          v-if="modelValue === categoria.nome_categoria"
          class="fa-solid fa-check"
        ></i>
      </button>
    </div>
  </div>
</template>
