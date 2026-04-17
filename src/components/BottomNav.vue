<script>
</script>
<template>
  <nav class="bottom-nav">
     <router-link to="/" class="nav-item">
     <i class="fa-solid fa-house"></i>
        <span>Home</span>
    </router-link>

    <router-link to="/menu" class="nav-item">
        <i class="fa-solid fa-list-check"></i>
        <span>Cardápio</span>
    </router-link>

    <router-link to="/perfil" class="nav-item">
    <i class="fa-solid fa-user"></i>
        <span>Perfil</span>
    </router-link>

    <router-link to="/carrinho" class="nav-item">
    <i class="fa-solid fa-cart-shopping"></i>
        <span>Carrinho</span>
    </router-link>

    <router-link to="/mapa" class="nav-item">
    <i class="fa-solid fa-location-dot"></i>
        <span>Mapa</span>
    </router-link>
  </nav>
</template>
<style>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: #f1f1f1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eee;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: 10px;
}
.nav-item{
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #5E3023;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  width: 20%;
  height: 100%;
}
.nav-item i {
  font-size: 24px;
  margin-bottom: 4px;
  color: #5E3023;
  transition: color 0.3 ease;
}
.router-link-active {
  background-color: #f0f0f0;
  color: #d0bd97;
  font-weight: bold;
}
.router-link-active i{
  color: #d0bd97;
}

</style>
