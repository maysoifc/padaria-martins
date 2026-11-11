<script setup>
import "@/assets/css/promocoesSemana.css";

const promocoes = [
  {
    id: 1,
    titulo: "Promoção de bebidas",
    dia: "Todas as segundas",
    imagem: "/img/bebidas.jpg",
    categoria: "Bebidas",
    destaque: "Comece a semana refrescando",
  },
  {
    id: 2,
    titulo: "Promoção de pães",
    dia: "Todas as quartas",
    imagem: "/img/paes.jpg",
    categoria: "Pães",
    destaque: "Pães fresquinhos para você",
  },
  {
    id: 3,
    titulo: "Promoção de doces",
    dia: "Todas as quintas",
    imagem: "/img/doces.jpg",
    categoria: "Doces",
    destaque: "Um docinho para deixar o dia melhor",
  },
  {
    id: 4,
    titulo: "Promoção de salgados",
    dia: "Todos os sábados",
    imagem: "/img/assados.jpg",
    categoria: "Salgados",
    destaque: "Seu sábado merece um sabor especial",
  },
];
</script>

<template>
  <section class="promocoes-bloco">
    <div class="cabecalho-promocoes">
      <div>
        <span class="mini-titulo">APROVEITE</span>
        <h2 class="titulo-sessao">Promoções da semana</h2>
      </div>

      <span class="seta-titulo" aria-hidden="true">
        <i class="fas fa-tags"></i>
      </span>
    </div>

    <div class="grade-promocoes">
      <RouterLink
        v-for="promo in promocoes"
        :key="promo.id"
        :to="{ path: '/menu', query: { categoria: promo.categoria } }"
        class="promo-card"
      >
        <div class="promo-imagem">
          <img
            :src="promo.imagem"
            :alt="promo.titulo"
            class="promo-img"
            loading="lazy"
          />

          <div class="imagem-overlay"></div>

          <span class="selo-promo">
            <i class="fas fa-percent"></i>
            OFERTA
          </span>

          <span class="dia-promo">
            {{ promo.dia }}
          </span>
        </div>

        <div class="promo-info">
          <span class="categoria-promo">
            {{ promo.categoria }}
          </span>

          <h3>{{ promo.titulo }}</h3>

          <p>{{ promo.destaque }}</p>

          <div class="promo-link">
            <span>Ver ofertas</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
