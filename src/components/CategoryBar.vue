<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "Todos os produtos",
  },
});

const emit = defineEmits(["update:modelValue"]);

const categorias = ref([]);
const aberto = ref(false);

const fetchCategorias = async () => {
  try {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const response = await fetch(`${baseUrl}/categorias/`);

    if (!response.ok) {
      throw new Error("Erro ao buscar categorias");
    }

    categorias.value = await response.json();
  } catch (error) {
    console.error("Erro na conexão:", error);
  }
};

const selecionar = (categoria) => {
  emit("update:modelValue", categoria);
  aberto.value = false;
};

const abrirFiltro = () => {
  aberto.value = !aberto.value;
};

onMounted(fetchCategorias);

defineExpose({
  abrirFiltro,
});
</script>

<template>
  <div class="filtro-wrapper">
    <button
      type="button"
      class="btn-filtro"
      :class="{ ativo: modelValue !== 'Todos os produtos' }"
      @click="abrirFiltro"
      aria-label="Filtrar produtos"
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
        v-for="cat in categorias"
        :key="cat.idCategoria"
        type="button"
        class="opcao-filtro"
        :class="{ selecionada: modelValue === cat.nome_categoria }"
        @click="selecionar(cat.nome_categoria)"
      >
        <span>{{ cat.nome_categoria }}</span>

        <i
          v-if="modelValue === cat.nome_categoria"
          class="fa-solid fa-check"
        ></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filtro-wrapper {
  position: relative;
}

.btn-filtro {
  height: 48px;
  min-width: 48px;
  padding: 0 14px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: 1px solid #e1d6c8;
  border-radius: 16px;

  background: #fff;
  color: #5e3023;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  box-shadow: 0 3px 10px rgba(94, 48, 35, 0.07);

  transition: 0.2s ease;
}

.btn-filtro:active {
  transform: scale(0.94);
}

.btn-filtro.ativo {
  background: #5e3023;
  border-color: #5e3023;
  color: #fff;
}

.btn-filtro > i:first-child {
  font-size: 17px;
}

.seta {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.seta.aberta {
  transform: rotate(180deg);
}

.filtro-menu {
  position: absolute;
  z-index: 100;

  top: calc(100% + 8px);
  right: 0;

  width: 230px;
  max-height: 300px;

  overflow-y: auto;

  padding: 7px;

  background: #fff;

  border: 1px solid #eadfd2;
  border-radius: 18px;

  box-shadow:
    0 12px 30px rgba(94, 48, 35, 0.15),
    0 3px 8px rgba(94, 48, 35, 0.06);

  animation: abrirFiltro 0.18s ease;
}

.opcao-filtro {
  width: 100%;
  min-height: 44px;

  padding: 10px 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border: none;
  border-radius: 12px;

  background: transparent;
  color: #5e3023;

  font-size: 14px;
  font-weight: 500;

  text-align: left;
  cursor: pointer;

  -webkit-tap-highlight-color: transparent;
}

.opcao-filtro:active {
  background: #f5f0e6;
}

.opcao-filtro.selecionada {
  background: #f5f0e6;
  color: #5e3023;
  font-weight: 700;
}

.opcao-filtro i {
  font-size: 13px;
  color: #bba270;
}

@keyframes abrirFiltro {
  from {
    opacity: 0;
    transform: translateY(-5px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
