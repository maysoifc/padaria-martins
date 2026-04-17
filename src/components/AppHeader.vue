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
  height:  220px;
  background-image: url('/img/banner/banner.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}
.banner-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.banner-logo {
 width: 80px;
 height: 80px;
 object-fit: contain;
 filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.banner-texts {
  color: #FFFFFF;
  font-family: 'Times New Roman', serif;
}

.banner-titulo {
  font-size: 2.2rem;
  margin: 0;
  font-weight: 600;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-slogan {
  font-size: 1.5rem;
  margin-top: 5px;
  font-weight: 400;
  font-style: italic;
  opacity: 0.9;
}

@media (max-width: 360px) {
  .banner-titulo {
    font-size: 1.8rem;
  }

  .banner-logo {
    width: 65px;
  }
}
</style>
