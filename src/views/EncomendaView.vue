<template>
  <div class="intro-container">
    <div class="light-blob"></div>

    <div class="content">
      <h1>Momentos que pedem um sabor especial.</h1>
      <p>Prepare sua encomenda com carinho e receba o frescor que você merece.</p>

      <button @click="$router.push('/encomenda-opcoes')" class="btn-pulse">
        Preparar Encomenda
      </button>
    </div>
  </div>
</template>

<style scoped>
.intro-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fcfbf7;
  overflow: hidden;
  position: relative;
}

.light-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(125, 150, 115, 0.2) 0%, transparent 70%);
  filter: blur(80px);
  animation: moveBlob 8s infinite alternate;
}

@keyframes moveBlob {
  from { transform: translate(-20%, -20%); }
  to { transform: translate(20%, 20%); }
}

.content {
  text-align: center;
  z-index: 1;
  padding: 0 2rem;
}

h1 { font-size: 2.5rem; color: #3d4a36; margin-bottom: 1rem; line-height: 1.2; }

.btn-pulse {
  padding: 1.2rem 2.5rem;
  background: #3d4a36;
  color: white;
  border-radius: 50px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(61, 74, 54, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(61, 74, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(61, 74, 54, 0); }
}
</style>
