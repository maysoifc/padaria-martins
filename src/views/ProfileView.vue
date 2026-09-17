<script setup>
import { useRouter } from "vue-router";
import InfoCard from "@/components/InfoCard.vue";

const router = useRouter();

const navegarPara = (rota) => {
  router.push(rota);
};

const pedidos = [
  {
    rota: "/novamente",
    icone: "fa-redo",
    titulo: "Comprar novamente",
    descricao: "Produtos já comprados"
  },
  {
    rota: "/pedidos/favoritos",
    icone: "fa-heart",
    titulo: "Favoritos",
    descricao: "Seus produtos favoritos"
  },
  {
    rota: "/pedidos/avaliados",
    icone: "fa-star",
    titulo: "Avaliados",
    descricao: "Produtos avaliados"
  },
  {
    rota: "/pedidos/preparados",
    icone: "fa-utensils",
    titulo: "Preparados",
    descricao: "Acompanhe seus pedidos"
  }
];

const carteira = [
  {
    rota: "/detalhes/carteira/cupons",
    icone: "fa-ticket-alt",
    titulo: "Meus Cupons",
    descricao: "Descontos disponíveis"
  },
  {
    rota: "/detalhes/carteira/selos",
    icone: "fa-certificate",
    titulo: "Meus Selos",
    descricao: "Suas recompensas"
  },
  {
    rota: "/detalhes/carteira/cartoes",
    icone: "fa-credit-card",
    titulo: "Meus Cartões",
    descricao: "Formas de pagamento"
  }
];
</script>

<template>
  <div class="perfil-page">
<div class="decor decor-1"></div>
<div class="decor decor-2"></div>
<div class="decor decor-3"></div>

<main class="perfil-view">

  <header class="perfil-header">

    <div class="header-topo">
      <div class="header-linha"></div>

      <span class="header-label">
        MINHA CONTA
      </span>

      <div class="header-linha"></div>
    </div>

    <h1 class="header-title">
      Meu <em>Perfil</em>
    </h1>

    <p class="header-subtitle">
      Seu espaço para acompanhar pedidos,
      favoritos e benefícios.
    </p>

  </header>

  <section class="perfil-card">

    <div class="perfil-card-topo">
      <span>SEU PERFIL</span>

      <i class="fa-solid fa-sparkles"></i>
    </div>

    <InfoCard />

  </section>

  <div class="actions-container">

    <section class="menu-section">

      <div class="section-heading">
        <div>
          <span class="section-label">
            SEUS PEDIDOS
          </span>

          <h2>
            Pedidos
          </h2>
        </div>

        <span class="section-number">
          01
        </span>
      </div>

      <div class="menu-grid">

        <button
          v-for="item in pedidos"
          :key="item.rota"
          type="button"
          class="menu-card"
          @click="navegarPara(item.rota)"
        >

          <div class="menu-icon">
            <i :class="`fas ${item.icone}`"></i>
          </div>

          <div class="menu-content">
            <strong>{{ item.titulo }}</strong>
            <span>{{ item.descricao }}</span>
          </div>

          <span class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </span>

        </button>

      </div>

    </section>

    <section class="menu-section carteira-section">

      <div class="section-heading">
        <div>
          <span class="section-label">
            BENEFÍCIOS E PAGAMENTOS
          </span>

          <h2>
            Carteira
          </h2>
        </div>

        <span class="section-number">
          02
        </span>
      </div>

      <div class="menu-grid">

        <button
          v-for="item in carteira"
          :key="item.rota"
          type="button"
          class="menu-card"
          @click="navegarPara(item.rota)"
        >

          <div class="menu-icon">
            <i :class="`fas ${item.icone}`"></i>
          </div>

          <div class="menu-content">
            <strong>{{ item.titulo }}</strong>
            <span>{{ item.descricao }}</span>
          </div>

          <span class="card-arrow">
            <i class="fas fa-arrow-right"></i>
          </span>

        </button>

      </div>

    </section>

    <div class="perfil-frase">

      <span class="frase-linha"></span>

      <div class="frase-conteudo">
        <i class="fa-solid fa-heart"></i>

        <span>
          Feito com carinho para você.
        </span>
      </div>

      <span class="frase-linha"></span>

    </div>

    <button
      type="button"
      class="btn-logout"
      @click="navegarPara('/')"
    >
      <span class="logout-icon">
        <i class="fas fa-sign-out-alt"></i>
      </span>

      <span>
        Sair da conta
      </span>

      <i class="fas fa-arrow-right logout-arrow"></i>
    </button>

  </div>

</main>

  </div>
</template>

<style scoped>
.perfil-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 8% 12%,
      rgba(184, 151, 100, 0.1),
      transparent 25%
    ),
    radial-gradient(
      circle at 95% 80%,
      rgba(94, 48, 35, 0.05),
      transparent 28%
    ),
    #fbf8f3;
  color: #5e3023;
}

.perfil-view {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 34px 15px 70px;
  box-sizing: border-box;
}

.decor {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.decor-1 {
  width: 290px;
  height: 290px;
  top: -175px;
  right: -110px;
  border: 1px solid rgba(94, 48, 35, 0.07);
}

.decor-2 {
  width: 190px;
  height: 190px;
  bottom: -100px;
  left: -100px;
  background: rgba(184, 151, 100, 0.07);
}

.decor-3 {
  width: 7px;
  height: 7px;
  top: 27%;
  right: 7%;
  background: #b89764;
  opacity: 0.4;
}

.perfil-header {
  position: relative;
  z-index: 2;
  margin-bottom: 27px;
  text-align: center;
}

.header-topo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-bottom: 8px;
}

.header-linha {
  width: 28px;
  height: 1px;
  background: #ddcfbd;
}

.header-label {
  color: #b89764;
  font-size: 0.53rem;
  font-weight: 800;
  letter-spacing: 2px;
}

.header-title {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.7rem, 10vw, 4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -1.3px;
}

.header-title em {
  color: #b89764;
  font-style: italic;
}

.header-subtitle {
  max-width: 390px;
  margin: 11px auto 0;
  color: #8d7c6d;
  font-size: 0.73rem;
  line-height: 1.6;
}

.perfil-card {
  position: relative;
  z-index: 2;
  overflow: hidden;
  padding: 13px;
  border: 1px solid #eee2d4;
  border-radius: 25px;
  background: #fff;
  box-shadow:
    0 15px 40px rgba(94, 48, 35, 0.07),
    0 3px 10px rgba(94, 48, 35, 0.03);
}

.perfil-card-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 8px 11px;
}

.perfil-card-topo span {
  color: #b89764;
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.perfil-card-topo i {
  color: #d1b27c;
  font-size: 9px;
}

.actions-container {
  position: relative;
  z-index: 2;
  margin-top: 31px;
}

.menu-section {
  margin-bottom: 29px;
}

.carteira-section {
  margin-bottom: 24px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 0 5px 12px;
}

.section-label {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.section-heading h2 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.35rem;
  line-height: 1;
}

.section-number {
  color: #d1c2b1;
  font-family: Georgia, serif;
  font-size: 0.72rem;
  font-style: italic;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.menu-card {
  position: relative;
  min-width: 0;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid #eee4d8;
  border-radius: 20px;
  background: #fff;
  color: #5e3023;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 6px 18px rgba(94, 48, 35, 0.045);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.menu-card:hover {
  transform: translateY(-4px);
  border-color: #e4d4c0;
  background: #fffdfa;
  box-shadow: 0 13px 28px rgba(94, 48, 35, 0.09);
}

.menu-card:active {
  transform: scale(0.97);
}

.menu-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px solid #eee2d2;
  border-radius: 12px;
  background:
    linear-gradient(
      135deg,
      #f8f0e5,
      #f3e8d9
    );
  color: #8b6340;
  font-size: 14px;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.menu-card:hover .menu-icon {
  transform: translateY(-2px);
  background: #f0e2d1;
}

.menu-content {
  min-width: 0;
  padding-right: 18px;
}

.menu-card strong {
  display: block;
  overflow: hidden;
  color: #5e3023;
  font-size: 0.73rem;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card span:not(.card-arrow) {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: #9b8b7d;
  font-size: 0.57rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-arrow {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #faf6f0;
  color: #b89764;
  font-size: 7px;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.menu-card:hover .card-arrow {
  transform: translateX(3px);
  background: #f2e7d8;
}

.perfil-frase {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 27px 0 19px;
}

.frase-linha {
  width: 35px;
  height: 1px;
  background: #e4d9cc;
}

.frase-conteudo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b19b82;
  font-family: Georgia, serif;
  font-size: 0.6rem;
  font-style: italic;
}

.frase-conteudo i {
  color: #c2a36b;
  font-size: 7px;
}

.btn-logout {
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  box-sizing: border-box;
  border: 1px solid #eaded6;
  border-radius: 17px;
  background: rgba(255, 250, 248, 0.9);
  color: #a87970;
  font-size: 0.68rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.btn-logout:hover {
  transform: translateY(-2px);
  border-color: #e2cfc9;
  background: #fff8f6;
}

.logout-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8eeee;
  color: #a87970;
  font-size: 11px;
}

.logout-arrow {
  margin-left: auto;
  color: #d2bbb4;
  font-size: 7px;
}

@media (min-width: 700px) {
  .perfil-view {
    padding: 50px 24px 85px;
  }

  .perfil-header {
    margin-bottom: 35px;
  }

  .perfil-card {
    padding: 17px;
    border-radius: 29px;
  }

  .actions-container {
    margin-top: 37px;
  }

  .menu-grid {
    gap: 13px;
  }

  .menu-card {
    min-height: 145px;
    padding: 18px;
    border-radius: 22px;
  }

  .menu-icon {
    width: 43px;
    height: 43px;
    margin-bottom: 14px;
  }

  .menu-card strong {
    font-size: 0.78rem;
  }

  .menu-card span:not(.card-arrow) {
    font-size: 0.61rem;
  }

  .card-arrow {
    top: 17px;
    right: 17px;
  }
}

@media (max-width: 420px) {
  .perfil-view {
    padding: 28px 12px 65px;
  }

  .header-title {
    font-size: 2.75rem;
  }

  .header-subtitle {
    font-size: 0.69rem;
  }

  .perfil-card {
    border-radius: 22px;
  }

  .menu-grid {
    gap: 8px;
  }

  .menu-card {
    min-height: 124px;
    padding: 13px;
    border-radius: 18px;
  }

  .menu-icon {
    width: 37px;
    height: 37px;
    margin-bottom: 10px;
    border-radius: 11px;
    font-size: 12px;
  }

  .menu-card strong {
    font-size: 0.65rem;
  }

  .menu-card span:not(.card-arrow) {
    font-size: 0.51rem;
  }

  .card-arrow {
    top: 12px;
    right: 12px;
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 340px) {
  .perfil-view {
    padding-left: 9px;
    padding-right: 9px;
  }

  .header-title {
    font-size: 2.45rem;
  }

  .menu-card {
    min-height: 116px;
    padding: 11px;
  }

  .menu-card strong {
    font-size: 0.61rem;
  }

  .menu-card span:not(.card-arrow) {
    font-size: 0.48rem;
  }

  .menu-icon {
    width: 35px;
    height: 35px;
    margin-bottom: 8px;
  }
}
</style>
