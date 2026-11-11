<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <header class="banner">
    <div class="banner-overlay">
      <RouterLink
        to="/carrinho"
        class="carrinho-icon"
        aria-label="Abrir carrinho"
      >
        <i class="fa-solid fa-cart-shopping"></i>
      </RouterLink>

      <div class="banner-content">
        <div class="banner-logo-container">
          <img
            src="/img/banner/logo-paes.png"
            alt="Logo da Padaria Martins"
            class="banner-logo"
          />
        </div>

        <div class="banner-texts">
          <h1 class="banner-titulo">Padaria Martins</h1>
          <p class="banner-slogan">O pão nosso</p>
        </div>
      </div>
    </div>
  </header>
</template>
