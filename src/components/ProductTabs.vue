<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['tab-change']);

const tabs = [
  {
    nome: 'Favoritos',
    icone: 'fa-heart',
    descricao: 'Seus queridinhos'
  },
  {
    nome: 'Avaliados',
    icone: 'fa-star',
    descricao: 'Suas avaliações'
  },
  {
    nome: 'Selos',
    icone: 'fa-certificate',
    descricao: 'Suas conquistas'
  }
];

const activeTab = ref('Favoritos');

const activeIndex = computed(() => {
  return tabs.findIndex(tab => tab.nome === activeTab.value);
});

const selectTab = (tab) => {
  activeTab.value = tab.nome;
  emit('tab-change', tab.nome);
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

      <div class="tabs-header">

        <button
          v-for="tab in tabs"
          :key="tab.nome"
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === tab.nome }"
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
            left: `${activeIndex * (100 / tabs.length)}%`
          }"
        ></div>
      </div>

    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.tabs-container {
  width: 100%;
  max-width: 760px;
  margin: 26px auto;
  color: #3c2b20;
  font-family: 'DM Sans', sans-serif;
}

.tabs-topo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 15px;
}

.tabs-label {
  display: block;
  margin-bottom: 5px;
  color: #a38353;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.tabs-topo h2 {
  margin: 0;
  color: #493427;
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 600;
}

.tabs-contador {
  display: flex;
  align-items: baseline;
  gap: 5px;
  color: #a39282;
  font-size: 0.7rem;
}

.tabs-contador strong {
  color: #76583d;
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
}

.tabs-wrapper {
  overflow: hidden;
  border: 1px solid rgba(91, 65, 43, 0.08);
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 35px rgba(65, 44, 28, 0.055);
  backdrop-filter: blur(8px);
}

.tabs-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.tab-btn {
  position: relative;
  display: flex;
  min-height: 82px;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 13px 14px;
  border: 0;
  background: transparent;
  color: #a99b8e;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
}

.tab-btn + .tab-btn {
  border-left: 1px solid rgba(91, 65, 43, 0.055);
}

.tab-btn:hover {
  background: rgba(248, 243, 235, 0.7);
}

.tab-btn.active {
  color: #60462f;
  background: #fffdf9;
}

.tab-icon {
  display: grid;
  flex: 0 0 39px;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 13px;
  background: #f5f0e8;
  color: #b49a70;
  transition: 0.3s ease;
}

.tab-btn.active .tab-icon {
  background: #eadfcf;
  color: #81633d;
  box-shadow: 0 5px 14px rgba(130, 98, 56, 0.1);
}

.tab-icon i {
  font-size: 0.85rem;
}

.tab-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.tab-content strong {
  color: #584131;
  font-size: 0.78rem;
  font-weight: 700;
}

.tab-content small {
  overflow: hidden;
  color: #a99b8e;
  font-size: 0.62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-btn.active .tab-content strong {
  color: #60452e;
}

.tab-indicator-track {
  position: relative;
  width: 100%;
  height: 3px;
  background: #eee8df;
}

.tab-indicator {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(
    90deg,
    #a9844e,
    #c6a86f
  );
  box-shadow: 0 0 12px rgba(180, 145, 86, 0.22);
  transition:
    left 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.3s ease;
}

@media (max-width: 600px) {
  .tabs-container {
    margin: 20px auto;
  }

  .tabs-topo {
    padding: 0 3px;
  }

  .tabs-topo h2 {
    font-size: 1.25rem;
  }

  .tabs-contador {
    display: none;
  }

  .tabs-wrapper {
    border-radius: 20px;
  }

  .tabs-header {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tabs-header::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex: 0 0 145px;
    min-height: 76px;
    padding: 12px 10px;
    gap: 8px;
  }

  .tab-btn + .tab-btn {
    border-left: 0;
  }

  .tab-icon {
    flex-basis: 35px;
    width: 35px;
    height: 35px;
    border-radius: 11px;
  }

  .tab-content strong {
    font-size: 0.72rem;
  }

  .tab-content small {
    font-size: 0.58rem;
  }
}

@media (max-width: 390px) {
  .tabs-topo h2 {
    font-size: 1.15rem;
  }

  .tab-btn {
    flex-basis: 130px;
  }

  .tab-content small {
    display: none;
  }
}
</style>
