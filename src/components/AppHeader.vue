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

<style scoped>
.banner {
  position: relative;
  width: 100%;
  min-height: 220px;
  background-image: url("/img/banner/banner.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(35, 18, 12, 0.72),
    rgba(35, 18, 12, 0.42),
    rgba(35, 18, 12, 0.58)
  );
}

.banner-overlay {
  position: relative;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 70px 30px 30px;
  box-sizing: border-box;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  animation: aparecer 0.7s ease;
}

.banner-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-logo {
  width: 88px;
  height: 88px;
  object-fit: contain;
  filter: drop-shadow(0 4px 7px rgba(0, 0, 0, 0.45));
}

.banner-texts {
  color: #fff;
  font-family: "Times New Roman", serif;
}

.banner-titulo {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: 0.5px;
  text-shadow: 2px 3px 5px rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}

.banner-slogan {
  margin: 8px 0 0;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 400;
  font-style: italic;
  opacity: 0.95;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.5);
}

.carrinho-icon {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 10;

  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;
  background: rgba(46, 26, 20, 0.7);

  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  font-size: 1.25rem;
  text-decoration: none;

  backdrop-filter: blur(5px);

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.carrinho-icon:hover {
  background: rgba(0, 230, 118, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.carrinho-icon:active {
  transform: scale(0.94);
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .banner {
    min-height: 190px;
  }

  .banner-overlay {
    min-height: 190px;
    padding: 25px 55px 25px 20px;
  }

  .banner-content {
    gap: 12px;
  }

  .banner-logo {
    width: 68px;
    height: 68px;
  }

  .banner-titulo {
    white-space: normal;
    font-size: 1.8rem;
  }

  .banner-slogan {
    font-size: 1.15rem;
    margin-top: 5px;
  }

  .carrinho-icon {
    top: 12px;
    right: 12px;
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }
}

@media (max-width: 360px) {
  .banner {
    min-height: 170px;
  }

  .banner-overlay {
    min-height: 170px;
    padding-left: 15px;
    padding-right: 50px;
  }

  .banner-logo {
    width: 58px;
    height: 58px;
  }

  .banner-titulo {
    font-size: 1.55rem;
  }

  .banner-slogan {
    font-size: 1rem;
  }
}
</style>
