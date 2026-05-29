<template>
  <div class="info-card">
    <slot />
  </div>
</template>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 25px;
  border: 1px solid #e0d5c8;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}
</style>
