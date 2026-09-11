<template>
  <section class="historia-container">
<div class="decor decor-1"></div>
<div class="decor decor-2"></div>
<div class="decor decor-3"></div>

<div class="historia-cabecalho">
  <span class="historia-label">
    DESDE 1987
  </span>

  <h2 class="titulo-historia">
    Uma história feita de <em>sabor.</em>
  </h2>

  <p class="subtitulo-historia">
    Tradição, carinho e receitas que atravessam gerações.
  </p>
</div>

<div class="historia-card">

  <div class="foto-area">

    <div class="foto-moldura-externa">

      <div class="moldura-foto">
        <img
          src="/img/historia.jpeg"
          alt="Padaria Martins"
          class="foto-historia"
        >
      </div>

    </div>

    <div class="foto-detalhe">
      <span>PADARIA</span>
      <strong>MARTINS</strong>
    </div>

    <div class="selo-tradicao">

      <div class="selo-icone">
        <i class="fa-solid fa-bread-slice"></i>
      </div>

      <div class="selo-texto">
        <strong>37</strong>
        <span>anos de tradição</span>
      </div>

    </div>

    <span class="estrela estrela-1">✦</span>
    <span class="estrela estrela-2">✦</span>

  </div>

  <div class="texto-historia">

    <span class="pequeno-titulo">
      UMA HISTÓRIA FEITA À MÃO
    </span>

    <h3>
      O cheiro de pão quentinho que virou
      <em>tradição.</em>
    </h3>

    <div class="linha-detalhe">
      <span></span>
      <i class="fa-solid fa-heart"></i>
      <span></span>
    </div>

    <p>
      A Padaria Martins nasceu do sonho de levar o pão artesanal
      à mesa de cada vizinho. Começamos pequenos, com uma receita
      de família, um forno e muita vontade de fazer diferente.
    </p>

    <p>
      Com o passar dos anos, novas receitas chegaram, mas uma coisa
      nunca mudou: o cuidado em preparar cada produto como se fosse
      para a nossa própria família.
    </p>

    <button
      type="button"
      class="historia-btn"
      @click="historiaAberta = true"
    >
      <span>Conheça nossa história</span>

      <span class="btn-icone">
        <i class="fa-solid fa-arrow-right"></i>
      </span>
    </button>

  </div>

</div>

<div class="numeros-historia">

  <div class="numero-item">
    <strong>37</strong>
    <span>anos de história</span>
  </div>

  <div class="numero-divisor"></div>

  <div class="numero-item">
    <strong>20+</strong>
    <span>receitas artesanais</span>
  </div>

  <div class="numero-divisor"></div>

  <div class="numero-item">
    <strong>1</strong>
    <span>família apaixonada</span>
  </div>

</div>

<div class="experiencia-box">

  <div class="experiencia-icone">
    <i class="fa-solid fa-heart"></i>
  </div>

  <div class="experiencia-texto">

    <span>MAIS QUE UMA PADARIA</span>

    <strong>
      Um lugar para criar memórias.
    </strong>

    <p>
      Um lugar para começar o dia, encontrar quem você gosta
      e levar para casa aquele sabor que faz lembrar bons momentos.
    </p>

  </div>

  <div class="experiencia-detalhe">
    ✦
  </div>

</div>

<div class="botoes-historia">

  <a
    href="https://www.google.com/maps/dir/?api=1&destination=IFC+Araquari"
    target="_blank"
    rel="noopener noreferrer"
    class="acao-btn mapa-btn"
  >
    <span class="acao-icone">
      <i class="fa-solid fa-location-dot"></i>
    </span>

    <span class="acao-texto">
      <small>VISITE A GENTE</small>
      Como chegar
    </span>

    <span class="seta-btn">
      <i class="fa-solid fa-arrow-right"></i>
    </span>
  </a>

  <a
    href="https://www.whatsapp.com/"
    target="_blank"
    rel="noopener noreferrer"
    class="acao-btn whatsapp-btn"
  >
    <span class="acao-icone">
      <i class="fa-brands fa-whatsapp"></i>
    </span>

    <span class="acao-texto">
      <small>FALE CONOSCO</small>
      WhatsApp Comercial
    </span>

    <span class="seta-btn">
      <i class="fa-solid fa-arrow-right"></i>
    </span>
  </a>

</div>

<div class="final-detalhe">
  <span></span>
  <i class="fa-solid fa-bread-slice"></i>
  <span></span>
</div>

<Transition name="modal">

  <div
    v-if="historiaAberta"
    class="modal-overlay"
    @click.self="historiaAberta = false"
  >

    <div class="modal-historia">

      <button
        type="button"
        class="fechar-modal"
        @click="historiaAberta = false"
        aria-label="Fechar"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="modal-imagem">

        <img
          src="/img/historia.jpeg"
          alt="História da Padaria Martins"
        >

        <div class="modal-imagem-overlay"></div>

        <div class="modal-imagem-texto">
          <span>DESDE 1987</span>
          <strong>PADARIA MARTINS</strong>
        </div>

      </div>

      <div class="modal-conteudo">

        <span class="modal-label">
          NOSSA HISTÓRIA
        </span>

        <h3>
          Uma receita que atravessa
          <em>gerações.</em>
        </h3>

        <div class="modal-linha">
          <span></span>
          <i class="fa-solid fa-heart"></i>
          <span></span>
        </div>

        <p>
          Tudo começou em uma pequena cozinha, onde os primeiros
          pães eram preparados ainda de madrugada. A família Martins
          acreditava que um bom pão podia transformar uma manhã comum
          em um momento especial.
        </p>

        <p>
          O tempo passou, a padaria cresceu e novos sabores chegaram.
          Mesmo assim, continuamos usando o mesmo ingrediente que
          nunca pode faltar: carinho.
        </p>

        <div class="frase-final">

          <div class="quote-icone">
            <i class="fa-solid fa-quote-left"></i>
          </div>

          <span>
            “Todo dia é uma nova oportunidade de colocar
            algo gostoso na mesa.”
          </span>

        </div>

        <button
          type="button"
          class="fechar-historia"
          @click="historiaAberta = false"
        >
          Fechar história
        </button>

      </div>

    </div>

  </div>

</Transition>

  </section>
</template>

<script setup>
import { ref } from "vue";

const historiaAberta = ref(false);
</script>

<style scoped>
.historia-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  padding: 65px 16px 75px;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at 8% 15%,
      rgba(184, 151, 100, 0.09),
      transparent 25%
    ),
    radial-gradient(
      circle at 92% 75%,
      rgba(94, 48, 35, 0.05),
      transparent 28%
    ),
    #fbf8f3;
}

.decor {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.decor-1 {
  width: 300px;
  height: 300px;
  top: -180px;
  right: -120px;
  border: 1px solid rgba(94, 48, 35, 0.07);
}

.decor-2 {
  width: 210px;
  height: 210px;
  bottom: -120px;
  left: -110px;
  background: rgba(184, 151, 100, 0.07);
}

.decor-3 {
  width: 7px;
  height: 7px;
  top: 32%;
  right: 8%;
  background: #b89764;
  opacity: 0.35;
}

.historia-cabecalho {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto 30px;
  text-align: center;
}

.historia-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #b89764;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 2.2px;
}

.titulo-historia {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.2rem, 8vw, 3.6rem);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: -1px;
}

.titulo-historia em {
  color: #b89764;
  font-style: italic;
}

.subtitulo-historia {
  max-width: 430px;
  margin: 12px auto 0;
  color: #8d7c6d;
  font-size: 0.78rem;
  line-height: 1.6;
}

.historia-card {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 0 auto;
  padding: 15px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #eee3d5;
  border-radius: 30px;
  box-shadow:
    0 20px 55px rgba(94, 48, 35, 0.08),
    0 3px 10px rgba(94, 48, 35, 0.03);
}

.foto-area {
  position: relative;
}

.foto-moldura-externa {
  padding: 7px;
  border-radius: 25px;
  background:
    linear-gradient(
      135deg,
      #eee0ce,
      #f8f1e7
    );
}

.moldura-foto {
  overflow: hidden;
  border-radius: 19px;
}

.foto-historia {
  width: 100%;
  height: 245px;
  display: block;
  object-fit: cover;
  filter: saturate(0.9) contrast(0.98);
  transition: transform 0.6s ease;
}

.historia-card:hover .foto-historia {
  transform: scale(1.025);
}

.foto-detalhe {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  padding: 8px 11px;
  border-radius: 10px;
  background: rgba(50, 28, 20, 0.72);
  backdrop-filter: blur(8px);
}

.foto-detalhe span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.42rem;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.foto-detalhe strong {
  margin-top: 2px;
  color: #fff;
  font-family: Georgia, serif;
  font-size: 0.72rem;
  letter-spacing: 1px;
}

.selo-tradicao {
  position: absolute;
  right: 15px;
  bottom: 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px 9px 9px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(45, 25, 18, 0.18);
  backdrop-filter: blur(10px);
}

.selo-icone {
  width: 33px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1e6d5;
  color: #6a3828;
  font-size: 12px;
}

.selo-texto {
  display: flex;
  flex-direction: column;
}

.selo-texto strong {
  color: #5e3023;
  font-family: Georgia, serif;
  font-size: 17px;
  line-height: 1;
}

.selo-texto span {
  margin-top: 3px;
  color: #8b796b;
  font-size: 0.47rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.estrela {
  position: absolute;
  color: #d0b27d;
  font-size: 9px;
}

.estrela-1 {
  top: 17px;
  right: 18px;
}

.estrela-2 {
  left: 17px;
  bottom: 17px;
  font-size: 7px;
  opacity: 0.8;
}

.texto-historia {
  padding: 24px 6px 7px;
}

.pequeno-titulo {
  display: block;
  margin-bottom: 8px;
  color: #b89764;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.texto-historia h3 {
  max-width: 540px;
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.7rem;
  line-height: 1.1;
}

.texto-historia h3 em {
  color: #b89764;
  font-style: italic;
}

.linha-detalhe,
.modal-linha {
  display: flex;
  align-items: center;
  gap: 8px;
}

.linha-detalhe {
  margin: 15px 0 16px;
}

.linha-detalhe span,
.modal-linha span {
  width: 28px;
  height: 1px;
  background: #e5d8c8;
}

.linha-detalhe i,
.modal-linha i {
  color: #b89764;
  font-size: 7px;
}

.texto-historia p {
  max-width: 600px;
  margin: 0 0 11px;
  color: #75675c;
  font-size: 0.82rem;
  line-height: 1.7;
}

.historia-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  padding: 0;
  border: none;
  background: transparent;
  color: #6a3828;
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-icone {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f1e6d5;
  color: #6a3828;
  font-size: 8px;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.historia-btn:hover .btn-icone {
  transform: translateX(4px);
  background: #ead9c1;
}

.numeros-historia {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 16px auto 0;
  padding: 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  background:
    linear-gradient(
      135deg,
      #5e3023,
      #6b392a
    );
  border-radius: 20px;
  box-shadow: 0 10px 27px rgba(94, 48, 35, 0.14);
}

.numero-item {
  flex: 1;
  text-align: center;
}

.numero-item strong {
  display: block;
  color: #e1c98f;
  font-family: Georgia, serif;
  font-size: 1.3rem;
  line-height: 1;
}

.numero-item span {
  display: block;
  margin-top: 5px;
  color: #f7eee3;
  font-size: 0.54rem;
  line-height: 1.2;
}

.numero-divisor {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
}

.experiencia-box {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 16px auto 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid #eadcca;
  border-radius: 19px;
  background:
    linear-gradient(
      135deg,
      #f8f0e4,
      #fcf8f2
    );
}

.experiencia-icone {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff;
  color: #b89764;
  font-size: 13px;
  box-shadow: 0 5px 15px rgba(94, 48, 35, 0.05);
}

.experiencia-texto {
  min-width: 0;
}

.experiencia-texto > span {
  display: block;
  margin-bottom: 2px;
  color: #b89764;
  font-size: 0.47rem;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.experiencia-texto strong {
  display: block;
  color: #5e3023;
  font-family: Georgia, serif;
  font-size: 0.9rem;
}

.experiencia-texto p {
  margin: 4px 0 0;
  color: #806f62;
  font-size: 0.64rem;
  line-height: 1.5;
}

.experiencia-detalhe {
  margin-left: auto;
  color: #d0b27d;
  font-size: 14px;
}

.botoes-historia {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 16px auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.acao-btn {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 16px;
  color: #fff;
  text-decoration: none;
  box-shadow: 0 7px 20px rgba(45, 25, 18, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.acao-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(45, 25, 18, 0.18);
}

.mapa-btn {
  background: linear-gradient(135deg, #627fa3, #537194);
}

.whatsapp-btn {
  background: linear-gradient(135deg, #318c59, #277b4c);
}

.acao-icone {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
}

.acao-texto {
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 0.64rem;
  font-weight: 800;
}

.acao-texto small {
  margin-bottom: 3px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.45rem;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.seta-btn {
  margin-left: auto;
  font-size: 7px;
  opacity: 0.75;
}

.final-detalhe {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.final-detalhe span {
  width: 42px;
  height: 1px;
  background: #e4d8ca;
}

.final-detalhe i {
  color: #c5a66e;
  font-size: 8px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(40, 25, 20, 0.6);
  backdrop-filter: blur(7px);
}

.modal-historia {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.22);
}

.fechar-modal {
  position: absolute;
  z-index: 5;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #5e3023;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.13);
}

.modal-imagem {
  position: relative;
  height: 205px;
  overflow: hidden;
}

.modal-imagem img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.modal-imagem-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to top,
      rgba(45, 24, 18, 0.72),
      transparent 65%
    );
}

.modal-imagem-texto {
  position: absolute;
  left: 22px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
}

.modal-imagem-texto span {
  margin-bottom: 3px;
  color: #e1c98f;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.modal-imagem-texto strong {
  color: #fff;
  font-family: Georgia, serif;
  font-size: 0.95rem;
  letter-spacing: 1.4px;
}

.modal-conteudo {
  padding: 25px 23px 28px;
}

.modal-label {
  color: #b89764;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.modal-conteudo h3 {
  max-width: 450px;
  margin: 7px 0 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.85rem;
  line-height: 1.08;
}

.modal-conteudo h3 em {
  color: #b89764;
  font-style: italic;
}

.modal-linha {
  margin: 15px 0 17px;
}

.modal-conteudo p {
  margin: 0 0 13px;
  color: #75675c;
  font-size: 0.78rem;
  line-height: 1.7;
}

.frase-final {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin: 21px 0;
  padding: 15px;
  border: 1px solid #eadcca;
  border-radius: 16px;
  background: #f8f0e4;
}

.quote-icone {
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fff;
  color: #b89764;
  font-size: 10px;
}

.frase-final span {
  color: #6a3828;
  font-family: Georgia, serif;
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.55;
}

.fechar-historia {
  width: 100%;
  height: 45px;
  border: none;
  border-radius: 13px;
  background: #5e3023;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.fechar-historia:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(94, 48, 35, 0.18);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-historia,
.modal-leave-active .modal-historia {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-historia,
.modal-leave-to .modal-historia {
  transform: translateY(100%);
}

@media (min-width: 700px) {
  .historia-container {
    padding: 80px 24px 95px;
  }

  .historia-cabecalho {
    margin-bottom: 38px;
  }

  .historia-card {
    display: grid;
    grid-template-columns: 0.95fr 1.05fr;
    gap: 28px;
    padding: 20px;
  }

  .foto-historia {
    height: 370px;
  }

  .texto-historia {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 18px 14px;
  }

  .texto-historia h3 {
    font-size: 2rem;
  }

  .texto-historia p {
    font-size: 0.82rem;
  }

  .modal-overlay {
    align-items: center;
    padding: 20px;
  }

  .modal-historia {
    border-radius: 28px;
  }
}

@media (max-width: 540px) {
  .experiencia-detalhe {
    display: none;
  }
}

@media (max-width: 420px) {
  .historia-container {
    padding: 50px 13px 65px;
  }

  .titulo-historia {
    font-size: 2rem;
  }

  .foto-historia {
    height: 215px;
  }

  .botoes-historia {
    grid-template-columns: 1fr;
  }

  .numeros-historia {
    padding: 16px 7px;
  }

  .numero-item strong {
    font-size: 1.15rem;
  }

  .numero-item span {
    font-size: 0.5rem;
  }

  .experiencia-box {
    padding: 14px;
  }

  .modal-imagem {
    height: 185px;
  }

  .modal-conteudo {
    padding: 22px 18px 25px;
  }
}

@media (max-width: 320px) {
  .historia-container {
    padding-left: 10px;
    padding-right: 10px;
  }

  .historia-card {
    padding: 12px;
  }

  .foto-historia {
    height: 190px;
  }

  .titulo-historia {
    font-size: 1.8rem;
  }

  .numero-item strong {
    font-size: 1.05rem;
  }

  .numero-item span {
    font-size: 0.47rem;
  }
}
</style>
