<template>
  <nav class="bottom-nav" aria-label="Navegação principal">
    <div class="nav-inner">
      <router-link to="/home" class="nav-item">
        <div class="nav-icon">
          <i class="fa-solid fa-house"></i>
        </div>
        <span>Home</span>
      </router-link>
  <router-link to="/menu" class="nav-item">
    <div class="nav-icon">
      <i class="fa-solid fa-utensils"></i>
    </div>
    <span>Cardápio</span>
  </router-link>

  <router-link to="/perfil" class="nav-item">
    <div class="nav-icon">
      <i class="fa-solid fa-user"></i>
    </div>
    <span>Perfil</span>
  </router-link>

  <router-link to="/carrinho" class="nav-item">
    <div class="nav-icon">
      <i class="fa-solid fa-bag-shopping"></i>
    </div>
    <span>Carrinho</span>
  </router-link>

  <router-link to="/encomenda" class="nav-item">
    <div class="nav-icon">
      <i class="fa-solid fa-calendar-check"></i>
    </div>
    <span>Encomenda</span>
  </router-link>
</div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  width: 100%;

  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));

  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.94) 0%,
      rgba(250, 247, 241, 0.98) 100%
    );

  border-top: 1px solid rgba(94, 48, 35, 0.08);

  box-shadow:
    0 -8px 30px rgba(70, 42, 31, 0.08),
    0 -2px 8px rgba(70, 42, 31, 0.04);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  box-sizing: border-box;
}

.nav-inner {
  width: 100%;
  max-width: 620px;
  min-height: 68px;

  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.nav-item {
  position: relative;

  flex: 1;
  min-width: 0;
  height: 62px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 4px;

  color: #9a8880;
  text-decoration: none;

  border-radius: 20px;

  font-family: "DM Sans", sans-serif;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.01em;

  transition:
    color 0.25s ease,
    transform 0.2s ease,
    background 0.25s ease;
}

.nav-icon {
  width: 42px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  transition:
    background 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.nav-item i {
  font-size: 18px;
  color: #735348;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.nav-item span {
  line-height: 1;
  white-space: nowrap;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.nav-item.router-link-active {
  color: #5e3023;
  font-weight: 700;
  background: rgba(245, 240, 230, 0.72);
}

.nav-item.router-link-active .nav-icon {
  background: #5e3023;

  transform: translateY(-5px);

  box-shadow:
    0 7px 16px rgba(94, 48, 35, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.nav-item.router-link-active i {
  color: #fff;
  transform: scale(1.08);
}

.nav-item.router-link-active span {
  color: #5e3023;
  transform: translateY(-1px);
}

.nav-item.router-link-active::before {
  content: "";

  position: absolute;
  top: 3px;
  left: 50%;

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #c8ad78;

  transform: translateX(-50%);
}

.nav-item.router-link-active::after {
  content: "";

  position: absolute;
  left: 50%;
  bottom: 2px;

  width: 18px;
  height: 3px;

  border-radius: 20px;

  background: #c8ad78;

  transform: translateX(-50%);
}

.nav-item:hover:not(.router-link-active) {
  color: #5e3023;
  background: rgba(250, 247, 241, 0.9);
}

.nav-item:hover:not(.router-link-active) .nav-icon {
  transform: translateY(-2px);
  background: #f5f0e6;
}

.nav-item:hover:not(.router-link-active) i {
  color: #5e3023;
}

.nav-item:active {
  transform: scale(0.94);
}

@media (max-width: 420px) {
  .bottom-nav {
    padding-left: 7px;
    padding-right: 7px;
  }

  .nav-inner {
    min-height: 64px;
  }

  .nav-item {
    height: 58px;
    border-radius: 17px;
    font-size: 0.61rem;
  }

  .nav-icon {
    width: 39px;
    height: 33px;
    border-radius: 12px;
  }

  .nav-item i {
    font-size: 17px;
  }
}

@media (max-width: 360px) {
  .bottom-nav {
    padding-left: 4px;
    padding-right: 4px;
  }

  .nav-item {
    height: 56px;
    gap: 3px;
    font-size: 0.56rem;
  }

  .nav-icon {
    width: 35px;
    height: 30px;
    border-radius: 11px;
  }

  .nav-item i {
    font-size: 16px;
  }

  .nav-item.router-link-active .nav-icon {
    transform: translateY(-4px);
  }

  .nav-item.router-link-active::before {
    top: 2px;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    padding-bottom: 12px;
  }

  .nav-inner {
    min-height: 72px;
    padding: 0 10px;
  }

  .nav-item {
    height: 64px;
    font-size: 0.7rem;
  }

  .nav-icon {
    width: 44px;
    height: 37px;
  }
}
</style>
