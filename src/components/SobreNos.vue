
<script setup>
import { ref, onBeforeUnmount } from "vue";
import "@/assets/css/Historia.css";

const historiaAberta = ref(false);

function fecharModal(event) {
  if (event.key === "Escape") historiaAberta.value = false;
}

import { onMounted } from "vue";

onMounted(() => window.addEventListener("keydown", fecharModal));
onBeforeUnmount(() => window.removeEventListener("keydown", fecharModal));
</script>

<template>
  <section class="historia-container">
    <div class="decor decor-1"></div>
    <div class="decor decor-2"></div>
    <div class="decor decor-3"></div>

    <header class="historia-cabecalho">
      <span class="historia-label">DESDE 1987</span>
      <h2 class="titulo-historia">Uma história feita de <em>sabor.</em></h2>
      <p class="subtitulo-historia">
        Tradição, carinho e receitas que atravessam gerações.
      </p>
    </header>

    <div class="historia-card">
      <div class="foto-area">
        <div class="foto-moldura-externa">
          <div class="moldura-foto">
            <img
              src="/img/historia.jpeg"
              alt="Padaria Martins"
              class="foto-historia"
            />
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
        <span class="pequeno-titulo">UMA HISTÓRIA FEITA À MÃO</span>
        <h3>O cheiro de pão quentinho que virou <em>tradição.</em></h3>

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
          class="historia-btn"
          type="button"
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
        <strong>Um lugar para criar memórias.</strong>
        <p>
          Um lugar para começar o dia, encontrar quem você gosta
          e levar para casa aquele sabor que faz lembrar bons momentos.
        </p>
      </div>
      <div class="experiencia-detalhe">✦</div>
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
        <section
          class="modal-historia"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-historia"
        >
          <button
            class="fechar-modal"
            type="button"
            aria-label="Fechar"
            @click="historiaAberta = false"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-imagem">
            <img src="/img/historia.jpeg" alt="História da Padaria Martins" />
            <div class="modal-imagem-overlay"></div>
            <div class="modal-imagem-texto">
              <span>DESDE 1987</span>
              <strong>PADARIA MARTINS</strong>
            </div>
          </div>

          <div class="modal-conteudo">
            <span class="modal-label">NOSSA HISTÓRIA</span>
            <h3 id="titulo-modal-historia">
              Uma receita que atravessa <em>gerações.</em>
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
                “Todo dia é uma nova oportunidade de colocar algo gostoso
                na mesa.”
              </span>
            </div>

            <button
              class="fechar-historia"
              type="button"
              @click="historiaAberta = false"
            >
              Fechar história
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </section>
</template>
