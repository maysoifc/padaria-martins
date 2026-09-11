<script setup>
const irParaProdutos = () => {
  document
    .getElementById("produtos")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
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

<style scoped>
.banner {
  position: relative;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 88% 20%,
      rgba(217, 202, 179, 0.4),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #f7eee2 0%,
      #fbf8f3 58%,
      #eee1cf 100%
    );
}

.banner::before {
  content: "";
  position: absolute;
  width: 230px;
  height: 230px;
  right: -120px;
  bottom: -145px;
  border-radius: 50%;
  background: rgba(94, 48, 35, 0.06);
}

.banner::after {
  content: "";
  position: absolute;
  width: 120px;
  height: 120px;
  right: 30px;
  top: -70px;
  border: 1px solid rgba(94, 48, 35, 0.1);
  border-radius: 50%;
}

.banner-conteudo {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1100px;
  min-height: 340px;
  margin: 0 auto;
  padding: 45px 22px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.banner-texto {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 570px;
}

.banner-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  color: #b89764;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.banner-label::before {
  content: "";
  width: 22px;
  height: 2px;
  border-radius: 5px;
  background: #b89764;
}

.banner h1 {
  max-width: 600px;
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.25rem, 8vw, 4rem);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: -1px;
}

.banner h1 span {
  display: block;
  color: #b89764;
}

.banner p {
  max-width: 480px;
  margin: 16px 0 21px;
  color: #75675c;
  font-size: 0.82rem;
  line-height: 1.6;
}

.banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 17px;
  border: none;
  border-radius: 13px;
  background: #5e3023;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(94, 48, 35, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.banner-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 11px 23px rgba(94, 48, 35, 0.24);
}

.banner-btn:active {
  transform: scale(0.97);
}

.banner-btn i {
  font-size: 9px;
}

.banner-detalhe {
  position: absolute;
  right: 7%;
  top: 50%;
  width: 270px;
  height: 270px;
  transform: translateY(-50%);
  pointer-events: none;
}

.circulo {
  position: absolute;
  border-radius: 50%;
}

.circulo-grande {
  inset: 10px;
  border: 1px solid rgba(94, 48, 35, 0.12);
}

.circulo-medio {
  inset: 43px;
  border: 1px dashed rgba(184, 151, 100, 0.3);
}

.circulo-pequeno {
  inset: 78px;
  background: rgba(184, 151, 100, 0.12);
}

.icone-destaque {
  position: absolute;
  inset: 50%;
  width: 82px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #5e3023;
  color: #e1c98f;
  font-size: 30px;
  box-shadow:
    0 12px 30px rgba(94, 48, 35, 0.18),
    0 0 0 10px rgba(255, 255, 255, 0.5);
}

.texto-flutuante {
  position: absolute;
  right: 2px;
  bottom: 30px;
  padding: 8px 11px;
  border: 1px solid rgba(94, 48, 35, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.82);
  color: #6a3828;
  font-size: 0.58rem;
  font-weight: 800;
  box-shadow: 0 5px 15px rgba(94, 48, 35, 0.08);
  backdrop-filter: blur(8px);
}

@media (max-width: 700px) {
  .banner-conteudo {
    min-height: 380px;
    padding: 42px 20px 48px;
  }

  .banner-texto {
    max-width: 75%;
  }

  .banner h1 {
    font-size: clamp(2.15rem, 9vw, 3.2rem);
  }

  .banner p {
    font-size: 0.78rem;
  }

  .banner-detalhe {
    right: -85px;
    width: 245px;
    height: 245px;
    opacity: 0.8;
  }

  .texto-flutuante {
    right: 45px;
  }
}

@media (max-width: 480px) {
  .banner-conteudo {
    min-height: 365px;
    padding: 38px 18px 45px;
  }

  .banner-texto {
    max-width: 86%;
  }

  .banner-label {
    font-size: 0.52rem;
    letter-spacing: 1.2px;
  }

  .banner h1 {
    font-size: 2.35rem;
  }

  .banner p {
    max-width: 290px;
    margin-top: 14px;
    font-size: 0.75rem;
  }

  .banner-btn {
    min-height: 42px;
    padding: 0 14px;
    font-size: 0.66rem;
  }

  .banner-detalhe {
    right: -115px;
    top: 55%;
    width: 230px;
    height: 230px;
    opacity: 0.65;
  }

  .icone-destaque {
    width: 70px;
    height: 70px;
    font-size: 25px;
  }

  .texto-flutuante {
    display: none;
  }
}

@media (max-width: 340px) {
  .banner-conteudo {
    min-height: 345px;
    padding-left: 15px;
  }

  .banner-texto {
    max-width: 92%;
  }

  .banner h1 {
    font-size: 2.1rem;
  }

  .banner p {
    max-width: 250px;
  }

  .banner-detalhe {
    right: -135px;
    opacity: 0.5;
  }
}
</style>
