<script setup>
import "@/assets/css/bannerCardapio.css";

const irParaProdutos = () => {
  document.getElementById("produtos")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
</script>

<template>
  <header class="banner">
    <div class="banner-conteudo">
      <div class="banner-texto">
        <span class="banner-label">
          UMA PAUSA MERECE UM SABOR ESPECIAL
        </span>

        <h1>
          Tem sempre um
          <span>bom motivo</span>
          para passar aqui.
        </h1>

        <p>
          Descubra nossas opções e encontre aquele sabor
          perfeito para o seu momento.
        </p>

        <button
          type="button"
          class="banner-btn"
          @click="irParaProdutos"
        >
          <span>Ver nosso cardápio</span>
          <i class="fa-solid fa-arrow-down"></i>
        </button>
      </div>

      <div class="banner-detalhe">
        <div class="circulo circulo-grande"></div>
        <div class="circulo circulo-medio"></div>
        <div class="circulo circulo-pequeno"></div>

        <div class="icone-destaque">
          <i class="fa-solid fa-cookie-bite"></i>
        </div>

        <span class="texto-flutuante">
          Feito com carinho
        </span>
      </div>
    </div>
  </header>
</template>
