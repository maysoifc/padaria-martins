<script setup>
import { useRouter } from "vue-router";
import InfoCard from "@/components/InfoCard.vue";

const router = useRouter();

const navegarPara = (rota) => router.push(rota);

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
          <span class="header-linha"></span>
          <span class="header-label">MINHA CONTA</span>
          <span class="header-linha"></span>
        </div>

        <h1 class="header-title">Meu <em>Perfil</em></h1>

        <p class="header-subtitle">
          Seu espaço para acompanhar pedidos, favoritos e benefícios.
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
        <section
          v-for="(grupo, indice) in [
            { titulo: 'Pedidos', label: 'SEUS PEDIDOS', itens: pedidos },
            {
              titulo: 'Carteira',
              label: 'BENEFÍCIOS E PAGAMENTOS',
              itens: carteira
            }
          ]"
          :key="grupo.titulo"
          class="menu-section"
          :class="{ 'carteira-section': indice === 1 }"
        >
          <div class="section-heading">
            <div>
              <span class="section-label">{{ grupo.label }}</span>
              <h2>{{ grupo.titulo }}</h2>
            </div>

            <span class="section-number">
              0{{ indice + 1 }}
            </span>
          </div>

          <div class="menu-grid">
            <button
              v-for="item in grupo.itens"
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
            <span>Feito com carinho para você.</span>
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

          <span>Sair da conta</span>

          <i class="fas fa-arrow-right logout-arrow"></i>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/css/PerfilView.css"></style>
