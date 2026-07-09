<script setup>
import { ref } from 'vue';

const emit = defineEmits(['tab-change']);

const tabs = ['Favoritos', 'Avaliados', 'Selos'];
const activeTab = ref('Favoritos');

const selectTab = (tab) => {
  activeTab.value = tab;
  emit('tab-change', tab);
};

const getIndicatorLeft = (tab) => {
  switch (tab) {
    case 'Favoritos':
      return '0%';
    case 'Avaliados':
      return '33.33%';
    case 'Selos':
      return '66.66%';
    default:
      return '0%';
  }
};
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <div class="tab-indicator-track">
      <div
        class="tab-indicator"
        :style="{ left: getIndicatorLeft(activeTab) }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #c4b9b0;
  cursor: pointer;
  transition: color 0.3s ease;
  text-align: center;
}

.tab-btn.active {
  color: #bba270;
}

.tab-indicator-track {
  position: relative;
  width: 100%;
  height: 3px;
  background-color: #eee;
  border-radius: 2px;
  margin-top: 4px;
}

.tab-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 33.33%;
  height: 100%;
  background-color: #bba270;
  border-radius: 2px;
  transition: left 0.3s ease;
}
</style>
