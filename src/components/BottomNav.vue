<script setup>
import { RouterLink } from "vue-router";
import "@/assets/css/bottomNav.css";

const links = [
  { to: "/home", icone: "fa-house", texto: "Home" },
  { to: "/menu", icone: "fa-utensils", texto: "Cardápio" },
  { to: "/perfil", icone: "fa-user", texto: "Perfil" },
  { to: "/carrinho", icone: "fa-bag-shopping", texto: "Carrinho" },
  { to: "/encomenda", icone: "fa-calendar-check", texto: "Encomenda" },
];
</script>

<template>
  <nav class="bottom-nav" aria-label="Navegação principal">
    <div class="nav-inner">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-item"
      >
        <div class="nav-icon">
          <i :class="['fa-solid', link.icone]"></i>
        </div>

        <span>{{ link.texto }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
