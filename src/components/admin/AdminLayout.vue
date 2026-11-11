<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const adminUsername = ref(
  localStorage.getItem("adminUsername") || "Administrador"
);

const menuAberto = ref(false);

const menu = [
  {
    nome: "Dashboard",
    descricao: "Visão geral",
    rota: "/admin",
    icone: "fa-chart-pie"
  },
  {
    nome: "Produtos",
    descricao: "Cardápio da padaria",
    rota: "/admin/produtos",
    icone: "fa-bread-slice"
  },
  {
    nome: "Encomendas",
    descricao: "Pedidos recebidos",
    rota: "/admin/encomendas",
    icone: "fa-receipt"
  },
  {
    nome: "Usuários",
    descricao: "Contas cadastradas",
    rota: "/admin/usuarios",
    icone: "fa-users"
  }
];

const paginaAtual = computed(() => {
  return menu.find((item) => {
    if (item.rota === "/admin") {
      return route.path === "/admin";
    }

    return route.path === item.rota ||
      route.path.startsWith(`${item.rota}/`);
  }) || menu[0];
});

const dataAtual = computed(() =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date())
);

const navegar = async (rota) => {
  menuAberto.value = false;
  await router.push(rota);
};

const sair = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefresh");
  localStorage.removeItem("adminUsername");

  router.replace("/admin/login");
};
</script>

<template>
  <div class="admin-shell">

    <div
      v-if="menuAberto"
      class="sidebar-overlay"
      @click="menuAberto = false"
    ></div>

    <aside
      class="sidebar"
      :class="{ 'sidebar-aberta': menuAberto }"
    >

      <div class="brand">

        <div class="brand-icon">
          <i class="fa-solid fa-wheat-awn"></i>
        </div>

        <div class="brand-text">
          <strong>Padaria Martins</strong>
          <span>GESTÃO ADMINISTRATIVA</span>
        </div>

        <button
          type="button"
          class="fechar-menu"
          aria-label="Fechar menu"
          @click="menuAberto = false"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

      </div>

      <div class="sidebar-intro">
        <span class="intro-ponto"></span>
        <span>PAINEL DE CONTROLE</span>
      </div>

      <span class="menu-label">MENU PRINCIPAL</span>

      <nav class="nav-menu">

        <RouterLink
          v-for="item in menu"
          :key="item.rota"
          :to="item.rota"
          class="nav-item"
          :class="{
            ativo: paginaAtual.rota === item.rota
          }"
          :aria-current="
            paginaAtual.rota === item.rota ? 'page' : undefined
          "
          @click="menuAberto = false"
        >

          <span class="nav-icone">
            <i :class="`fa-solid ${item.icone}`"></i>
          </span>

          <span class="nav-texto">
            <strong>{{ item.nome }}</strong>
            <small>{{ item.descricao }}</small>
          </span>

          <span
            v-if="paginaAtual.rota === item.rota"
            class="nav-indicador"
          ></span>

          <i
            v-else
            class="fa-solid fa-chevron-right nav-seta"
          ></i>

        </RouterLink>

      </nav>

      <div class="sidebar-detalhe">
        <div class="detalhe-icone">
          <i class="fa-solid fa-heart"></i>
        </div>

        <div>
          <strong>Feito com carinho</strong>
          <span>O pão nosso, todos os dias.</span>
        </div>
      </div>

      <div class="sidebar-bottom">

        <div class="admin-identity">

          <div class="avatar">
            <i class="fa-solid fa-user-shield"></i>
            <span class="avatar-status"></span>
          </div>

          <div class="admin-name">
            <span class="admin-caption">SESSÃO ADMINISTRATIVA</span>
            <strong>{{ adminUsername }}</strong>
            <span class="admin-role">Administrador</span>
          </div>

        </div>

        <button
          class="sair-btn"
          type="button"
          @click="sair"
        >
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Sair do painel</span>
        </button>

      </div>

    </aside>

    <main class="admin-main">

      <header class="topbar">

        <div class="topbar-esquerda">

          <button
            type="button"
            class="abrir-menu"
            aria-label="Abrir menu de navegação"
            :aria-expanded="menuAberto"
            @click="menuAberto = !menuAberto"
          >
            <i class="fa-solid fa-bars"></i>
          </button>

          <div class="breadcrumb">
            <span>Administração</span>
            <i class="fa-solid fa-chevron-right"></i>
            <strong>{{ paginaAtual.nome }}</strong>
          </div>

          <h1>{{ paginaAtual.nome }}</h1>

        </div>

        <div class="topbar-direita">

          <div class="data-topbar">
            <span class="data-icone">
              <i class="fa-regular fa-calendar"></i>
            </span>

            <span>{{ dataAtual }}</span>
          </div>

          <div class="admin-badge">
            <span class="badge-icone">
              <i class="fa-solid fa-shield-halved"></i>
            </span>

            <span class="badge-texto">
              <strong>Administrador</strong>
              <small>Acesso administrativo</small>
            </span>

          </div>

        </div>

      </header>

      <section class="page-content">
        <RouterView />
      </section>

      <footer class="main-footer">
        <span>PADARIA MARTINS</span>
        <span class="footer-ponto">✦</span>
        <span>PAINEL ADMINISTRATIVO</span>
      </footer>

    </main>

  </div>
</template>
<style scoped>
* {
  box-sizing: border-box;
}

.admin-shell {
  --cafe: #5e3023;
  --cafe-escuro: #38251c;
  --dourado: #b89764;
  --dourado-claro: #f5ecdf;
  --fundo: #f8f5ef;
  --texto: #493327;
  --texto-suave: #978677;

  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(184, 151, 100, 0.055),
      transparent 24%
    ),
    var(--fundo);
  color: var(--texto);
}

.sidebar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  width: 272px;
  height: 100vh;
  flex: 0 0 272px;
  flex-direction: column;
  padding: 24px 17px 17px;
  overflow-y: auto;
  border-right: 1px solid #eee5da;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 5px 0 30px rgba(66, 44, 29, 0.025);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 2px 5px 24px;
  border-bottom: 1px solid #f0e8df;
}

.brand-icon {
  display: grid;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #eee0cb;
  border-radius: 15px;
  background: linear-gradient(145deg, #fbf5eb, #f0e2cf);
  color: #a9824e;
  font-size: 1.2rem;
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.4);
}

.brand-text {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.brand-text strong {
  color: #503427;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.03rem;
}

.brand-text span {
  color: #b89764;
  font-size: 0.49rem;
  font-weight: 900;
  letter-spacing: 1.2px;
}

.fechar-menu {
  display: none;
}

.sidebar-intro {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 25px 9px 22px;
  color: #a39484;
  font-size: 0.57rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.intro-ponto {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #b89764;
  box-shadow: 0 0 0 4px #f7f0e5;
}

.menu-label {
  padding: 0 10px;
  color: #b3a699;
  font-size: 0.56rem;
  font-weight: 900;
  letter-spacing: 1.4px;
}

/* Navegação */
.sidebar .nav-menu {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 14px;
}

.sidebar .nav-item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  min-height: 66px;
  flex-shrink: 0;
  padding: 10px 12px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 15px;
  background: transparent;
  color: #89796a;
  text-align: left;
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar .nav-item:hover {
  transform: translateX(2px);
  border-color: #f1e7da;
  background: #fcf8f2;
  color: var(--cafe);
}

.sidebar .nav-item.ativo {
  border-color: #eadbc6;
  background: linear-gradient(110deg, #f6ead8, #fffaf2);
  color: var(--cafe);
  box-shadow: 0 5px 16px rgba(94, 48, 35, 0.06);
}

.sidebar .nav-icone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  min-width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border-radius: 12px;
  background: #f8f5f0;
  color: #a78b67;
  font-size: 1rem;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar .nav-icone i {
  display: block;
  position: static;
  margin: 0;
  line-height: 1;
  font-size: 16px;
}

.sidebar .nav-item.ativo .nav-icone {
  background: var(--cafe);
  color: #f5dfb5;
  box-shadow: 0 5px 12px rgba(94, 48, 35, 0.14);
}

.sidebar .nav-texto {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  gap: 4px;
  margin: 0;
  text-align: left;
}

.sidebar .nav-texto strong {
  display: block;
  margin: 0;
  color: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.25;
}

.sidebar .nav-texto small {
  display: block;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: #a99a8b;
  font-size: 0.64rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar .nav-item.ativo .nav-texto small {
  color: #947b5e;
}

.sidebar .nav-indicador {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  margin-left: auto;
  border-radius: 50%;
  background: #b89764;
  box-shadow: 0 0 0 4px rgba(184, 151, 100, 0.12);
}

.sidebar .nav-seta {
  flex: 0 0 auto;
  margin-left: auto;
  color: #c9b9a6;
  font-size: 0.58rem;
}

/* Cartão de carinho */
.sidebar-detalhe {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 13px 10px;
  border: 1px solid #f0e6d8;
  border-radius: 15px;
  background: linear-gradient(125deg, #fcf7ef, #fffdf9);
}

.detalhe-icone {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 10px;
  background: #f2e5d2;
  color: #b89764;
  font-size: 0.8rem;
}

.sidebar-detalhe > div:last-child {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.sidebar-detalhe strong {
  color: #684a35;
  font-size: 0.65rem;
}

.sidebar-detalhe span {
  color: #a39381;
  font-size: 0.57rem;
}

/* Identificação do administrador */
.sidebar-bottom {
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid #f0e8df;
}

.admin-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 3px 14px;
}

.avatar {
  position: relative;
  display: grid;
  width: 41px;
  height: 41px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #ebdeca;
  border-radius: 14px;
  background: #f6ecdf;
  color: #987548;
  font-size: 1rem;
}

.avatar-status {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #81916e;
}

.admin-name {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.admin-name strong {
  overflow: hidden;
  color: #53392a;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-caption {
  color: #b89764;
  font-size: 0.46rem;
  font-weight: 900;
  letter-spacing: 0.8px;
}

.admin-role {
  color: #a49687;
  font-size: 0.59rem;
}

.sair-btn {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid #eee1d5;
  border-radius: 12px;
  background: #fff;
  color: #86644f;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.sair-btn:hover {
  border-color: #e7c9b8;
  background: #fcf3ee;
  color: #8f493b;
}

/* Conteúdo principal */
.admin-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  min-height: 100px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 35px;
  border-bottom: 1px solid rgba(235, 225, 213, 0.85);
  background: rgba(255, 253, 249, 0.94);
  backdrop-filter: blur(18px);
}

.topbar-esquerda {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #a59687;
  font-size: 0.62rem;
}

.breadcrumb i {
  color: #c6b7a5;
  font-size: 0.53rem;
}

.breadcrumb strong {
  overflow: hidden;
  color: #9c7a50;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar h1 {
  margin: 8px 0 0;
  color: #503427;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.7rem;
  font-weight: 500;
  line-height: 1.1;
}

.topbar-direita {
  display: flex;
  align-items: center;
  gap: 17px;
}

.data-topbar {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #8d7a69;
  font-size: 0.68rem;
  white-space: nowrap;
  text-transform: capitalize;
}

.data-icone {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #eee4d7;
  border-radius: 12px;
  background: #fff;
  color: #b89764;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #eee3d5;
  border-radius: 14px;
  background: #fff;
}

.badge-icone {
  display: grid;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #a9824e;
}

.badge-texto {
  display: grid;
  gap: 4px;
}

.badge-texto strong {
  color: #624632;
  font-size: 0.68rem;
}

.badge-texto small {
  color: #a39485;
  font-size: 0.57rem;
}

.page-content {
  width: 100%;
  flex: 1;
  padding: 30px 35px;
}

.main-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 20px 20px;
  color: #b3a18d;
  font-size: 0.51rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.footer-ponto {
  color: #c4a574;
}

.abrir-menu {
  display: none;
}

.sidebar-overlay {
  display: none;
}

/* Acessibilidade */
button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(184, 151, 100, 0.6);
  outline-offset: 3px;
}

/* Telas médias */
@media (max-width: 1100px) {
  .sidebar {
    width: 240px;
    flex-basis: 240px;
    padding-right: 13px;
    padding-left: 13px;
  }

  .topbar {
    padding-right: 24px;
    padding-left: 24px;
  }

  .page-content {
    padding: 25px 24px;
  }

  .data-topbar {
    display: none;
  }
}

/* Menu móvel */
@media (max-width: 760px) {
  .admin-shell {
    display: block;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 60;
    display: flex;
    width: min(290px, 86vw);
    height: 100dvh;
    flex-direction: column;
    padding: 22px 16px 16px;
    overflow-y: auto;
    border-right: 1px solid #eee1d0;
    background: #fff;
    box-shadow: 15px 0 50px rgba(48, 30, 20, 0.12);
    transform: translateX(-105%);
    visibility: hidden;
    transition:
      transform 0.25s ease,
      visibility 0.25s ease;
  }

  .sidebar.sidebar-aberta {
    transform: translateX(0);
    visibility: visible;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: block;
    background: rgba(42, 28, 20, 0.42);
    backdrop-filter: blur(3px);
  }

  .fechar-menu {
    display: grid;
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    margin-left: auto;
    place-items: center;
    border: 1px solid #eee2d4;
    border-radius: 11px;
    background: #fff;
    color: #795c45;
    cursor: pointer;
  }

  .sidebar-intro {
    margin-top: 24px;
  }

  .sidebar .nav-item {
    min-height: 62px;
  }

  .sidebar-detalhe {
    margin-top: auto;
  }

  .sidebar-bottom {
    display: block;
  }

  .topbar {
    position: sticky;
    min-height: 86px;
    gap: 12px;
    padding: 15px 17px;
  }

  .topbar-esquerda {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    align-items: center;
    column-gap: 10px;
  }

  .abrir-menu {
    display: grid;
    width: 38px;
    height: 38px;
    grid-row: span 2;
    place-items: center;
    border: 1px solid #eee2d4;
    border-radius: 12px;
    background: #fff;
    color: #76523a;
    cursor: pointer;
  }

  .breadcrumb {
    gap: 6px;
    font-size: 0.55rem;
  }

  .topbar h1 {
    margin-top: 4px;
    font-size: 1.28rem;
  }

  .topbar-direita {
    gap: 0;
  }

  .admin-badge {
    padding: 5px;
    border: 0;
    background: transparent;
  }

  .badge-icone {
    width: 37px;
    height: 37px;
  }

  .badge-texto {
    display: none;
  }

  .page-content {
    padding: 22px 16px;
  }

  .main-footer {
    padding-bottom: 16px;
    font-size: 0.46rem;
  }
}

/* Celulares pequenos */
@media (max-width: 390px) {
  .topbar {
    padding-right: 12px;
    padding-left: 12px;
  }

  .topbar-esquerda {
    column-gap: 8px;
  }

  .topbar h1 {
    font-size: 1.15rem;
  }

  .breadcrumb {
    font-size: 0.5rem;
  }

  .page-content {
    padding: 19px 12px;
  }

  .main-footer {
    gap: 6px;
    letter-spacing: 1px;
  }
}

/* Reduz animações para quem prefere movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
