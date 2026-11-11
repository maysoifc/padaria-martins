<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const irParaEncomenda = () => {
  router.push("/encomenda-opcoes");
};
</script>

<template>
  <div class="page">
    <div class="noise" aria-hidden="true"></div>
    <div class="orb orb-1" aria-hidden="true"></div>
    <div class="orb orb-2" aria-hidden="true"></div>

    <header class="navbar">
      <div class="logo">
        <span class="logo-symbol">✦</span>

        <div>
          <strong>SABOR</strong>
          <small>CONFEITARIA ARTESANAL</small>
        </div>
      </div>

      <div class="nav-right">
        <span>Feito com carinho</span>
        <span class="nav-dot"></span>
        <span>Desde sempre</span>
      </div>
    </header>

    <main class="hero">
      <section class="hero-copy">
        <div class="eyebrow">
          <span class="line"></span>
          <span>UMA EXPERIÊNCIA PARA SABOREAR</span>
          <span class="line"></span>
        </div>

        <h1>
          Pequenos momentos.
          <em>Grandes sabores.</em>
        </h1>

        <p class="subtitle">
          Porque algumas ocasiões merecem mais do que um doce.
          Merecem uma experiência preparada especialmente para você.
        </p>

        <div class="actions">
          <button
            type="button"
            class="primary-button"
            @click="irParaEncomenda"
          >
            <span>Montar minha encomenda</span>
            <span class="button-arrow" aria-hidden="true">→</span>
          </button>

          <span class="action-note">
            <span class="spark" aria-hidden="true">✦</span>
            Escolha cada detalhe do seu pedido
          </span>
        </div>

        <div class="benefits">
          <div class="benefit">
            <div class="benefit-icon" aria-hidden="true">✦</div>
            <div>
              <strong>Artesanal</strong>
              <span>Produção cuidadosa</span>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit-icon" aria-hidden="true">♡</div>
            <div>
              <strong>Especial</strong>
              <span>Feito para você</span>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit-icon" aria-hidden="true">◇</div>
            <div>
              <strong>Seleção</strong>
              <span>Ingredientes escolhidos</span>
            </div>
          </div>
        </div>
      </section>

      <section class="visual" aria-label="Destaque de confeitaria artesanal">
        <div class="image-shadow" aria-hidden="true"></div>

        <div class="image-frame">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"
            alt="Bolo artesanal decorado"
            fetchpriority="high"
          />

          <div class="image-overlay" aria-hidden="true"></div>

          <div class="image-label">
            <span>FEITO À MÃO</span>
            <span class="image-label-line"></span>
            <span>COM CARINHO</span>
          </div>
        </div>

        <div class="floating-card">
          <div class="floating-icon" aria-hidden="true">✦</div>

          <div>
            <span>O seu momento</span>
            <strong>começa aqui.</strong>
          </div>
        </div>

        <div class="circle-text" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path
                id="circlePath"
                d="M 100,100 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0"
              />
            </defs>

            <text>
              <textPath href="#circlePath">
                SABOR • CARINHO • EXPERIÊNCIA •
              </textPath>
            </text>
          </svg>

          <span>✦</span>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-left">
        <span class="footer-line"></span>
        <span>UMA DOCE EXPERIÊNCIA</span>
      </div>

      <div class="scroll">
        <span>DESCUBRA</span>
        <span class="scroll-arrow" aria-hidden="true">↓</span>
      </div>

      <button
        type="button"
        class="footer-right"
        @click="irParaEncomenda"
      >
        <span>ENCOMENDAS</span>
        <span class="footer-arrow" aria-hidden="true">↗</span>
      </button>
    </footer>
  </div>
</template>

<style scoped src="@/assets/css/EncomendaLanding.css"></style>
