<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProducts } from "@/composables/useProducts";
import ProductCard from "@/components/ProductCard.vue";
import Promocoes from "../components/Promocoes.vue";
import SobreNos from "@/components/SobreNos.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const router = useRouter();

const { produtos, carregarProdutos } = useProducts();

const modules = [Pagination, Autoplay];

const categorias = [
  {
    nome: "Pães",
    icone: "fa-bread-slice",
    categoria: "Pães"
  },
  {
    nome: "Doces",
    icone: "fa-cookie-bite",
    categoria: "Doces"
  },
  {
    nome: "Salgados",
    icone: "fa-pizza-slice",
    categoria: "Salgados"
  },
  {
    nome: "Bebidas",
    icone: "fa-mug-hot",
    categoria: "Bebidas"
  }
];

const irParaCategoria = (categoria) => {
  router.push({
    path: "/menu",
    query: {
      categoria
    }
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

      <div class="hero-fundo">
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

        <div class="hero-bolo">

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

          <span class="titulo-ornamento">
            ✦
          </span>
        </div>
      </div>

      <div class="categorias">

        <button
          v-for="categoria in categorias"
          :key="categoria.nome"
          type="button"
          class="categoria"
          @click="irParaCategoria(categoria.categoria)"
        >

          <span class="categoria-numero">
            0{{ categorias.indexOf(categoria) + 1 }}
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
          <span class="secao-label">
            ESCOLHIDOS PARA VOCÊ
          </span>

          <h2>
            Nossos queridinhos
          </h2>
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

      <div class="carrossel-wrapper">

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

    </section>

    <section class="frase-especial">

      <div class="frase-detalhe detalhe-esquerda">
        ✦
      </div>

      <div class="frase-conteudo">

        <span>
          UMA PAUSA PARA O QUE FAZ BEM
        </span>

        <h2>
          Porque os melhores
          <em>momentos</em> também
          têm sabor.
        </h2>

        <p>
          Escolha seu favorito e deixe o resto com a gente.
        </p>

        <button
          type="button"
          @click="irParaMenu"
        >
          Fazer meu pedido
          <i class="fa-solid fa-arrow-right"></i>
        </button>

      </div>

      <div class="frase-detalhe detalhe-direita">
        ✦
      </div>

    </section>

    <Promocoes />

    <SobreNos />

  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  overflow-x: hidden;
  background: #fbf8f3;
  color: #5e3023;
}

.home main {
  width: 100%;
}

.hero {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 65px 22px 85px;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at 78% 35%,
      rgba(255, 255, 255, 0.85),
      transparent 24%
    ),
    linear-gradient(
      135deg,
      #f7ecde 0%,
      #fbf8f3 53%,
      #eadbc7 100%
    );
}

.hero-fundo {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decor {
  position: absolute;
  display: block;
  border-radius: 50%;
}

.decor-1 {
  width: 330px;
  height: 330px;
  right: -170px;
  top: -110px;
  border: 1px solid rgba(94, 48, 35, 0.1);
}

.decor-2 {
  width: 190px;
  height: 190px;
  right: 80px;
  bottom: -130px;
  background: rgba(184, 151, 100, 0.1);
}

.decor-3 {
  width: 12px;
  height: 12px;
  left: 8%;
  top: 24%;
  background: #b89764;
  opacity: 0.35;
}

.decor-4 {
  width: 7px;
  height: 7px;
  left: 18%;
  bottom: 22%;
  background: #5e3023;
  opacity: 0.2;
}

.hero-conteudo {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 35px;
}

.hero-texto {
  width: 100%;
  max-width: 570px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 17px;
  color: #b89764;
  font-size: 0.59rem;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.hero-tag i {
  font-size: 10px;
}

.hero h1 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(3rem, 11vw, 5.4rem);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -2px;
}

.hero h1 span {
  display: block;
  color: #b89764;
  font-style: italic;
}

.hero p {
  max-width: 470px;
  margin: 23px 0 27px;
  color: #75675c;
  font-size: 0.88rem;
  line-height: 1.7;
}

.hero-acoes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
}

.hero-btn {
  min-height: 49px;
  display: inline-flex;
  align-items: center;
  gap: 13px;
  padding: 0 20px;
  border: none;
  border-radius: 15px;
  background: #5e3023;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(94, 48, 35, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(94, 48, 35, 0.25);
}

.hero-btn i {
  font-size: 9px;
}

.hero-mini-info {
  display: flex;
  align-items: center;
  gap: 9px;
}

.mini-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f1e3d1;
  color: #b89764;
  font-size: 11px;
}

.hero-mini-info div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-mini-info strong {
  color: #6a3828;
  font-size: 0.63rem;
}

.hero-mini-info small {
  color: #95877b;
  font-size: 0.55rem;
}

.hero-bolo {
  position: relative;
  width: 380px;
  height: 350px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.halo {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background:
    radial-gradient(
      circle,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(245, 228, 205, 0.75) 47%,
      rgba(184, 151, 100, 0.08) 72%,
      transparent 73%
    );
}

.bolo-card {
  position: relative;
  width: 210px;
  height: 210px;
  margin-top: 25px;
  filter: drop-shadow(0 18px 20px rgba(94, 48, 35, 0.16));
}

.bolo-camada {
  position: absolute;
  left: 18px;
  right: 18px;
  border-radius: 48% 48% 16px 16px;
}

.bolo-camada-1 {
  top: 53px;
  height: 90px;
  background:
    linear-gradient(
      90deg,
      #d19b65 0%,
      #e7bd88 45%,
      #c88e5d 100%
    );
  border-bottom: 7px solid #f2d3a6;
}

.bolo-camada-2 {
  top: 108px;
  height: 67px;
  background:
    linear-gradient(
      90deg,
      #a96c45 0%,
      #c48756 45%,
      #9b603f 100%
    );
  border-radius: 15px 15px 25px 25px;
}

.bolo-topo {
  position: absolute;
  z-index: 3;
  top: 25px;
  left: 17px;
  width: 176px;
  height: 65px;
  border-radius: 50%;
  background:
    radial-gradient(
      ellipse at 50% 40%,
      #fff3dc 0%,
      #f5d8ad 58%,
      #d5a16d 100%
    );
  box-shadow:
    inset 0 -8px 0 rgba(176, 117, 73, 0.16),
    0 5px 0 rgba(137, 79, 49, 0.12);
}

.bolo-detalhe {
  position: absolute;
  width: 23px;
  height: 14px;
  border-radius: 50%;
  background: #fff8e9;
}

.bolo-detalhe:nth-child(1) {
  left: 32px;
  top: 28px;
}

.bolo-detalhe:nth-child(2) {
  left: 78px;
  top: 17px;
}

.bolo-detalhe:nth-child(3) {
  right: 29px;
  top: 29px;
}

.creme {
  position: absolute;
  width: 37px;
  height: 18px;
  border-radius: 50%;
  background: #fff0d4;
}

.creme-1 {
  left: 17px;
  bottom: -7px;
}

.creme-2 {
  left: 83px;
  bottom: -6px;
}

.creme-3 {
  right: 15px;
  bottom: -7px;
}

.frutinha {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8e3f32;
  box-shadow: inset -2px -2px 0 rgba(60, 20, 15, 0.18);
}

.frutinha-1 {
  left: 38px;
  top: 20px;
}

.frutinha-2 {
  left: 92px;
  top: 10px;
}

.frutinha-3 {
  right: 34px;
  top: 23px;
}

.bolo-prato {
  position: absolute;
  z-index: -1;
  left: 0;
  right: 0;
  bottom: 15px;
  height: 24px;
  border-radius: 50%;
  background: #fffaf2;
  box-shadow:
    0 6px 0 #ded0bd,
    0 12px 16px rgba(94, 48, 35, 0.12);
}

.bolo-selo {
  position: absolute;
  right: 3px;
  bottom: 36px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border: 1px solid rgba(94, 48, 35, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
  color: #6a3828;
  font-size: 0.56rem;
  font-weight: 800;
  box-shadow: 0 7px 20px rgba(94, 48, 35, 0.1);
  backdrop-filter: blur(8px);
  transform: rotate(-3deg);
}

.bolo-selo i {
  color: #b89764;
}

.atalhos {
  position: relative;
  z-index: 5;
  max-width: 1100px;
  margin: -30px auto 0;
  padding: 0 18px;
  box-sizing: border-box;
}

.atalhos-cabecalho {
  margin-bottom: 16px;
}

.atalhos-cabecalho > span {
  color: #b89764;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.titulo-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.atalhos h2 {
  margin: 5px 0 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.55rem;
  line-height: 1.1;
}

.atalhos h2 em {
  color: #b89764;
  font-style: italic;
}

.titulo-ornamento {
  margin-right: 8px;
  color: #d2b581;
  font-size: 18px;
}

.categorias {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.categoria {
  position: relative;
  min-height: 132px;
  overflow: hidden;
  padding: 13px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid #eee1d0;
  border-radius: 18px;
  background: #fff;
  color: #5e3023;
  cursor: pointer;
  box-shadow: 0 7px 20px rgba(94, 48, 35, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.categoria::after {
  content: "";
  position: absolute;
  width: 65px;
  height: 65px;
  right: -25px;
  bottom: -30px;
  border-radius: 50%;
  background: #f4eadc;
}

.categoria:hover {
  transform: translateY(-4px);
  box-shadow: 0 13px 28px rgba(94, 48, 35, 0.1);
}

.categoria:active {
  transform: scale(0.97);
}

.categoria-numero {
  color: #c7b59c;
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.categoria-icone {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #6a3828;
  font-size: 13px;
}

.categoria-nome {
  margin-top: 8px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 0.95rem;
  font-weight: 700;
}

.categoria-link {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #a4865c;
  font-size: 0.54rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.categoria-link i {
  font-size: 7px;
}

.destaques {
  margin-top: 52px;
  padding: 45px 0 42px;
  background: #fff;
}

.secao-topo {
  max-width: 1100px;
  margin: 0 auto 18px;
  padding: 0 18px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 15px;
}

.secao-label {
  display: block;
  margin-bottom: 5px;
  color: #b89764;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.secao-topo h2 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.85rem;
  line-height: 1.05;
}

.ver-todos {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  border: none;
  background: transparent;
  color: #6a3828;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
}

.ver-todos span {
  width: 23px;
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3e8d9;
}

.ver-todos i {
  font-size: 8px;
}

.carrossel-wrapper {
  width: 100%;
  overflow: hidden;
}

.meu-carrossel {
  width: 100%;
  padding: 5px 18px 38px;
  box-sizing: border-box;
  overflow: visible;
}

:deep(.swiper-slide) {
  height: auto;
  display: flex;
}

:deep(.swiper-slide > *) {
  width: 100%;
}

:deep(.swiper-pagination) {
  bottom: 3px !important;
}

:deep(.swiper-pagination-bullet) {
  width: 6px;
  height: 6px;
  margin: 0 4px !important;
  background: #b89764;
  opacity: 0.3;
  transition:
    width 0.2s ease,
    opacity 0.2s ease;
}

:deep(.swiper-pagination-bullet-active) {
  width: 20px;
  border-radius: 10px;
  background: #5e3023;
  opacity: 1;
}

.frase-especial {
  position: relative;
  min-height: 340px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px 22px;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(255, 255, 255, 0.07),
      transparent 45%
    ),
    #5e3023;
}

.frase-especial::before {
  content: "";
  position: absolute;
  width: 330px;
  height: 330px;
  left: -190px;
  top: -120px;
  border: 1px solid rgba(225, 201, 143, 0.18);
  border-radius: 50%;
}

.frase-especial::after {
  content: "";
  position: absolute;
  width: 270px;
  height: 270px;
  right: -150px;
  bottom: -160px;
  border: 1px solid rgba(225, 201, 143, 0.15);
  border-radius: 50%;
}

.frase-conteudo {
  position: relative;
  z-index: 2;
  max-width: 620px;
  text-align: center;
}

.frase-conteudo > span {
  color: #e1c98f;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.frase-conteudo h2 {
  margin: 10px 0 13px;
  color: #fff;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.2rem, 8vw, 3.5rem);
  line-height: 0.98;
}

.frase-conteudo h2 em {
  color: #e1c98f;
  font-style: italic;
}

.frase-conteudo p {
  margin: 0 0 22px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.76rem;
}

.frase-conteudo button {
  min-height: 45px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border: none;
  border-radius: 13px;
  background: #e1c98f;
  color: #5e3023;
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.frase-conteudo button:hover {
  transform: translateY(-3px);
}

.frase-conteudo button i {
  font-size: 8px;
}

.frase-detalhe {
  position: absolute;
  color: rgba(225, 201, 143, 0.32);
  font-size: 32px;
}

.detalhe-esquerda {
  left: 12%;
  top: 30%;
}

.detalhe-direita {
  right: 12%;
  bottom: 25%;
}

@media (min-width: 700px) {
  .hero {
    min-height: 590px;
    padding-left: max(40px, calc((100vw - 1100px) / 2));
    padding-right: max(40px, calc((100vw - 1100px) / 2));
  }

  .hero-bolo {
    width: 430px;
    height: 390px;
  }

  .bolo-card {
    transform: scale(1.12);
  }

  .bolo-selo {
    right: 0;
  }

  .atalhos {
    margin-top: -38px;
  }

  .categoria {
    min-height: 145px;
    padding: 15px;
  }

  .categoria-nome {
    font-size: 1rem;
  }

  .destaques {
    margin-top: 65px;
    padding-top: 60px;
  }

  .meu-carrossel {
    max-width: 1100px;
    margin: 0 auto;
  }

  .frase-especial {
    min-height: 390px;
  }
}

@media (max-width: 760px) {
  .hero-bolo {
    position: absolute;
    width: 230px;
    height: 220px;
    right: -28px;
    bottom: 5px;
    opacity: 0.88;
    transform: scale(0.82);
    transform-origin: bottom right;
  }

  .hero-texto {
    position: relative;
    z-index: 3;
  }

  .hero p {
    max-width: 350px;
  }

  .hero-mini-info {
    display: none;
  }
}

@media (max-width: 500px) {
  .hero {
    min-height: 530px;
    padding: 48px 20px 100px;
  }

  .hero h1 {
    font-size: 3.35rem;
  }

  .hero p {
    max-width: 320px;
    font-size: 0.83rem;
  }

  .hero-bolo {
    right: -38px;
    bottom: -5px;
    transform: scale(0.72);
  }

  .hero-btn {
    min-height: 47px;
  }

  .atalhos {
    margin-top: -23px;
    padding: 0 14px;
  }

  .atalhos h2 {
    font-size: 1.35rem;
  }

  .titulo-ornamento {
    display: none;
  }

  .categorias {
    gap: 8px;
  }

  .categoria {
    min-height: 116px;
    padding: 10px;
    border-radius: 15px;
  }

  .categoria-icone {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .categoria-nome {
    font-size: 0.82rem;
  }

  .categoria-link {
    font-size: 0.48rem;
  }

  .destaques {
    margin-top: 42px;
    padding-top: 38px;
  }

  .secao-topo {
    padding: 0 16px;
  }

  .secao-topo h2 {
    font-size: 1.58rem;
  }

  .ver-todos {
    font-size: 0.58rem;
  }

  .frase-especial {
    min-height: 330px;
    padding: 50px 20px;
  }

  .frase-conteudo h2 {
    font-size: 2.45rem;
  }

  .frase-detalhe {
    opacity: 0.5;
  }

  .detalhe-esquerda {
    left: 7%;
  }

  .detalhe-direita {
    right: 7%;
  }
}

@media (max-width: 360px) {
  .hero {
    min-height: 510px;
  }

  .hero h1 {
    font-size: 2.9rem;
  }

  .hero p {
    font-size: 0.78rem;
  }

  .hero-bolo {
    right: -48px;
    transform: scale(0.62);
  }

  .categoria {
    min-height: 105px;
  }

  .categoria-nome {
    font-size: 0.74rem;
  }

  .categoria-link {
    font-size: 0.43rem;
  }
}
</style>
