<script setup>
import { computed, ref } from "vue";
import "@/assets/css/tabsMinhaConta.css";

const emit = defineEmits(["tab-change"]);

const tabs = [
  {
    nome: "Favoritos",
    icone: "fa-heart",
    descricao: "Seus queridinhos",
  },
  {
    nome: "Avaliados",
    icone: "fa-star",
    descricao: "Suas avaliações",
  },
  {
    nome: "Selos",
    icone: "fa-certificate",
    descricao: "Suas conquistas",
  },
];

const activeTab = ref("Favoritos");

const activeIndex = computed(() =>
  tabs.findIndex((tab) => tab.nome === activeTab.value)
);

const selectTab = (tab) => {
  if (activeTab.value === tab.nome) return;

  activeTab.value = tab.nome;
  emit("tab-change", tab.nome);
};
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-topo">
      <div>
        <span class="tabs-label">MINHA CONTA</span>
        <h2>Explore suas opções</h2>
      </div>

      <div class="tabs-contador">
        <strong>0</strong>
        <span>itens</span>
      </div>
    </div>

    <div class="tabs-wrapper">
      <div class="tabs-header" role="tablist" aria-label="Opções da minha conta">
        <button
          v-for="tab in tabs"
          :key="tab.nome"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab.nome }"
          :aria-selected="activeTab === tab.nome"
          @click="selectTab(tab)"
        >
          <span class="tab-icon">
            <i :class="`fa-solid ${tab.icone}`"></i>
          </span>

          <span class="tab-content">
            <strong>{{ tab.nome }}</strong>
            <small>{{ tab.descricao }}</small>
          </span>
        </button>
      </div>

      <div class="tab-indicator-track">
        <div
          class="tab-indicator"
          :style="{
            width: `${100 / tabs.length}%`,
            left: `${activeIndex * (100 / tabs.length)}%`,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>
