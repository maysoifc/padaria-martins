<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import ProductCard from "@/components/ProductCard.vue";
import Promocoes from "@/components/Promocoes.vue";
import SobreNos from "@/components/SobreNos.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const router = useRouter();
const { produtos, carregarProdutos } = useProducts();

const modules = [Pagination, Autoplay];

const categorias = [
  { nome: "Pães", icone: "fa-bread-slice" },
  { nome: "Doces", icone: "fa-cookie-bite" },
  { nome: "Salgados", icone: "fa-pizza-slice" },
  { nome: "Bebidas", icone: "fa-mug-hot" }
];

const irParaCategoria = (categoria) => {
  router.push({
    path: "/menu",
    query: { categoria }
  });
};

const irParaMenu = () => {
  router.push("/menu");
};

onMounted(() => {
  carregarProdutos();
});
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-fundo" aria-hidden="true">
        <span class="decor decor-1"></span>
        <span class="decor decor-2"></span>
        <span class="decor decor-3"></span>
        <span class="decor decor-4"></span>
      </div>

      <div class="hero-conteudo">
        <div class="hero-texto">
          <span class="hero-tag">
            <i class="fa-solid fa-sparkles"></i>
            FEITO FRESQUINHO TODOS OS DIAS
          </span>

          <h1>
            Um pedacinho de
            <span>carinho.</span>
          </h1>

          <p>
            Pães, doces e salgados preparados com cuidado,
            como aqueles sabores que fazem qualquer momento
            ficar mais gostoso.
          </p>

          <div class="hero-acoes">
            <button
              type="button"
              class="hero-btn"
              @click="irParaMenu"
            >
              <span>Conheça nosso menu</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>

            <div class="hero-mini-info">
              <span class="mini-icon">
                <i class="fa-solid fa-heart"></i>
              </span>

              <div>
                <strong>Feito com carinho</strong>
                <small>todos os dias</small>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-bolo" aria-hidden="true">
          <div class="halo"></div>

          <div class="bolo-card">
            <div class="bolo-topo">
              <span class="bolo-detalhe"></span>
              <span class="bolo-detalhe"></span>
              <span class="bolo-detalhe"></span>
            </div>

            <div class="bolo-camada bolo-camada-1">
              <span class="creme creme-1"></span>
              <span class="creme creme-2"></span>
              <span class="creme creme-3"></span>
            </div>

            <div class="bolo-camada bolo-camada-2">
              <span class="frutinha frutinha-1"></span>
              <span class="frutinha frutinha-2"></span>
              <span class="frutinha frutinha-3"></span>
            </div>

            <div class="bolo-prato"></div>
          </div>

          <div class="bolo-selo">
            <i class="fa-solid fa-star"></i>
            <span>feito artesanalmente</span>
          </div>
        </div>
      </div>
    </section>

    <section class="atalhos">
      <div class="atalhos-cabecalho">
        <span>PARA CADA MOMENTO</span>

        <div class="titulo-linha">
          <h2>
            O que você está
            <em>procurando?</em>
          </h2>

          <span class="titulo-ornamento" aria-hidden="true">✦</span>
        </div>
      </div>

      <div class="categorias">
        <button
          v-for="(categoria, index) in categorias"
          :key="categoria.nome"
          type="button"
          class="categoria"
          @click="irParaCategoria(categoria.nome)"
        >
          <span class="categoria-numero">
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <span class="categoria-icone">
            <i :class="`fa-solid ${categoria.icone}`"></i>
          </span>

          <span class="categoria-nome">
            {{ categoria.nome }}
          </span>

          <span class="categoria-link">
            explorar
            <i class="fa-solid fa-arrow-right"></i>
          </span>
        </button>
      </div>
    </section>

    <section class="destaques">
      <div class="secao-topo">
        <div>
          <span class="secao-label">ESCOLHIDOS PARA VOCÊ</span>
          <h2>Nossos queridinhos</h2>
        </div>

        <button
          type="button"
          class="ver-todos"
          @click="irParaMenu"
        >
          Ver todos

          <span>
            <i class="fa-solid fa-arrow-right"></i>
          </span>
        </button>
      </div>

      <div v-if="produtos.length" class="carrossel-wrapper">
        <Swiper
          :modules="modules"
          :slides-per-view="1.35"
          :space-between="12"
          :pagination="{ clickable: true }"
          :autoplay="{
            delay: 3500,
            disableOnInteraction: false
          }"
          :breakpoints="{
            360: {
              slidesPerView: 1.55,
              spaceBetween: 13
            },
            480: {
              slidesPerView: 2.15,
              spaceBetween: 14
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 18
            },
            1100: {
              slidesPerView: 4,
              spaceBetween: 20
            }
          }"
          class="meu-carrossel"
        >
          <SwiperSlide
            v-for="item in produtos"
            :key="item.idProduto"
          >
            <ProductCard :produto="item" />
          </SwiperSlide>
        </Swiper>
      </div>

      <p v-else class="sem-produtos">
        Os produtos estão sendo preparados. Volte em instantes!
      </p>
    </section>

    <section class="frase-especial">
      <div
        class="frase-detalhe detalhe-esquerda"
        aria-hidden="true"
      >
        ✦
      </div>

      <div class="frase-conteudo">
        <span>UMA PAUSA PARA O QUE FAZ BEM</span>

        <h2>
          Porque os melhores
          <em>momentos</em> também
          têm sabor.
        </h2>

        <p>
          Escolha seu favorito e deixe o resto com a gente.
        </p>

        <button type="button" @click="irParaMenu">
          Fazer meu pedido
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div
        class="frase-detalhe detalhe-direita"
        aria-hidden="true"
      >
        ✦
      </div>
    </section>

    <Promocoes />
    <SobreNos />
  </div>
</template>

<style scoped src="@/assets/css/HomeView.css"></style>
