<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue';
import MenuView from './views/MenuView.vue';
import ProductDetail from './views/ProductDetail.vue';
import ProfileView from './views/ProfileView.vue';
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import CategoryBar from './components/CategoryBar.vue';
import ProductCard from './components/ProductCard.vue';
</script>

<template>
  <header>
    <AppHeader />
  </header>

  <RouterView />
  <BottomNav />
</template>

<style scoped>

</style>
