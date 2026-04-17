<script setup>
</script>
<template>
  <header class="banner">
  <div class="banner-overlay">
    <div class="banner-content">
      <div class="banner-logo">
      <img src="/img/banner/logo-paes.png" alt="Logo" class="banner-logo">
      </div>

      <div class="banner-texts">
      <h1 class="banner-titulo">Padaria Martins</h1>
      <p class="banner-slogan">O pão nosso</p>
      </div>
    </div>
  </div>
  </header>
</template>
<style scoped>
.banner {
  width: 100%;
  height:  250px;
  background-image: url('/img/banner/banner.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 91.9%;
  height: 84%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 15px;
  max-width: 600px;
  width: 100%;
  justify-content: flex-start;
}

.banner-logo {
  flex-shrink: 0;
  margin-top: 0;
  margin-right: 10px;
  margin-left: 10px;
  height: 80px;
  margin-bottom: 20px;
}

.banner-texts {
  color: #FFFFFF;
  font-family: 'Times New Roman';
}

.banner-titulo {
  font-size: 3rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.1;
}

.banner-slogan {
  font-size: 1.5rem;
  margin-top: 12px;
  font-weight: bolder;
}
</style>
