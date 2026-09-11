<template>
  <div class="page">
    <div class="noise"></div>

    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

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
          UMA EXPERIÊNCIA PARA SABOREAR
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
            class="primary-button"
            @click="$router.push('/encomenda-opcoes')"
          >
            <span>Montar minha encomenda</span>

            <span class="button-arrow">
              →
            </span>
          </button>

          <span class="action-note">
            <span class="spark">✦</span>
            Escolha cada detalhe do seu pedido
          </span>
        </div>

        <div class="benefits">
          <div class="benefit">
            <div class="benefit-icon">✦</div>

            <div>
              <strong>Artesanal</strong>
              <span>Produção cuidadosa</span>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit-icon">♡</div>

            <div>
              <strong>Especial</strong>
              <span>Feito para você</span>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit-icon">◇</div>

            <div>
              <strong>Seleção</strong>
              <span>Ingredientes escolhidos</span>
            </div>
          </div>
        </div>
      </section>

      <section class="visual">
        <div class="image-shadow"></div>

        <div class="image-frame">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=90"
            alt="Bolo artesanal decorado"
          />

          <div class="image-overlay"></div>

          <div class="image-label">
            <span>FEITO À MÃO</span>
            <div></div>
            <span>COM CARINHO</span>
          </div>
        </div>

        <div class="floating-card">
          <div class="floating-icon">✦</div>

          <div>
            <span>O seu momento</span>
            <strong>começa aqui.</strong>
          </div>
        </div>

        <div class="circle-text">
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
        <div class="scroll-arrow">↓</div>
      </div>

      <div class="footer-right">
        <span>ENCOMENDAS</span>
        <span class="footer-arrow">↗</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;

  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(183, 151, 92, 0.12),
      transparent 25%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(92, 116, 78, 0.12),
      transparent 28%
    ),
    #f7f5ef;

  color: #31392d;
  font-family: 'DM Sans', sans-serif;
}

.noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.025;
  z-index: 10;

  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.8'/%3E%3C/svg%3E");
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.orb-1 {
  width: 430px;
  height: 430px;
  left: -220px;
  top: 100px;
  background: rgba(181, 150, 93, 0.13);
  animation: orbOne 12s ease-in-out infinite alternate;
}

.orb-2 {
  width: 500px;
  height: 500px;
  right: -260px;
  bottom: -180px;
  background: rgba(91, 117, 78, 0.13);
  animation: orbTwo 14s ease-in-out infinite alternate;
}

.navbar {
  height: 100px;
  width: 100%;
  padding: 0 6vw;

  display: flex;
  align-items: center;
  justify-content: space-between;

  position: relative;
  z-index: 20;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-symbol {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(154, 121, 64, 0.45);
  border-radius: 50%;

  color: #a08048;
  font-size: 15px;
}

.logo strong {
  display: block;

  color: #35402f;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.28em;
}

.logo small {
  display: block;
  margin-top: 3px;

  color: #97978d;
  font-size: 6px;
  letter-spacing: 0.22em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 14px;

  color: #85867e;
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.nav-dot {
  width: 4px;
  height: 4px;

  background: #ad8a50;
  border-radius: 50%;
}

.hero {
  min-height: calc(100vh - 160px);

  max-width: 1380px;
  margin: 0 auto;

  padding: 30px 6vw 80px;

  display: grid;
  grid-template-columns: 1fr 0.92fr;
  align-items: center;

  gap: 70px;

  position: relative;
  z-index: 5;
}

.hero-copy {
  max-width: 720px;
  padding-bottom: 20px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 27px;

  color: #a08048;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.25em;
}

.line {
  width: 25px;
  height: 1px;
  background: #b99a60;
}

h1 {
  margin: 0;

  color: #30392c;

  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(4.6rem, 7vw, 7.3rem);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.82;
}

h1 em {
  display: block;

  color: #997844;

  font-weight: 500;
  font-style: italic;
}

.subtitle {
  max-width: 510px;

  margin: 34px 0 31px;

  color: #70736a;

  font-size: 14px;
  line-height: 1.85;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.primary-button {
  height: 62px;

  display: flex;
  align-items: center;
  gap: 25px;

  padding: 5px 7px 5px 27px;

  border: 0;
  border-radius: 100px;

  background: #36432f;
  color: #fff;

  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;

  cursor: pointer;

  box-shadow:
    0 18px 35px rgba(52, 67, 47, 0.2),
    0 3px 8px rgba(52, 67, 47, 0.08);

  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    background 0.35s ease;
}

.primary-button:hover {
  transform: translateY(-4px);

  background: #45563c;

  box-shadow:
    0 25px 45px rgba(52, 67, 47, 0.27),
    0 4px 10px rgba(52, 67, 47, 0.08);
}

.button-arrow {
  width: 50px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.11);

  font-size: 21px;

  transition: transform 0.35s ease;
}

.primary-button:hover .button-arrow {
  transform: translateX(4px);
}

.action-note {
  margin-left: 17px;

  display: flex;
  align-items: center;
  gap: 8px;

  color: #96978e;

  font-size: 8px;
  letter-spacing: 0.08em;
}

.spark {
  color: #ad884c;
  font-size: 12px;
}

.benefits {
  display: flex;
  align-items: center;
  gap: 28px;

  margin-top: 54px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.benefit-icon {
  width: 31px;
  height: 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(166, 135, 78, 0.27);
  border-radius: 50%;

  color: #a48148;
  font-size: 12px;
}

.benefit strong {
  display: block;

  color: #4e5549;

  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.benefit span {
  display: block;

  margin-top: 3px;

  color: #999a91;

  font-size: 7px;
}

.visual {
  height: 610px;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
}

.image-frame {
  width: min(390px, 75%);
  height: 550px;

  position: relative;

  overflow: hidden;

  border-radius: 210px 210px 28px 28px;

  transform: rotate(3deg);

  box-shadow:
    0 35px 80px rgba(47, 55, 43, 0.2),
    0 10px 25px rgba(47, 55, 43, 0.08);

  border: 5px solid rgba(255, 255, 255, 0.72);

  animation: imageFloat 7s ease-in-out infinite;
}

.image-frame img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;

  transform: scale(1.04);

  filter:
    saturate(0.88)
    contrast(0.98);
}

.image-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      to bottom,
      rgba(36, 39, 31, 0.02) 40%,
      rgba(35, 42, 30, 0.48) 100%
    );
}

.image-label {
  position: absolute;
  bottom: 27px;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  color: rgba(255, 255, 255, 0.86);

  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.25em;
}

.image-label div {
  width: 20px;
  height: 1px;

  background: rgba(255, 255, 255, 0.65);
}

.image-shadow {
  width: 300px;
  height: 60px;

  position: absolute;
  bottom: 20px;

  background: rgba(52, 61, 47, 0.2);

  filter: blur(30px);

  transform: rotate(-2deg);
}

.floating-card {
  min-width: 190px;

  position: absolute;
  left: 2%;
  bottom: 75px;

  display: flex;
  align-items: center;
  gap: 13px;

  padding: 16px 19px;

  background: rgba(250, 249, 244, 0.86);

  border: 1px solid rgba(255, 255, 255, 0.8);

  border-radius: 4px;

  backdrop-filter: blur(15px);

  box-shadow:
    0 20px 40px rgba(44, 51, 41, 0.12);

  transform: rotate(-4deg);

  z-index: 4;
}

.floating-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #ebe3d2;

  color: #a17d45;

  font-size: 12px;
}

.floating-card span {
  display: block;

  color: #97988f;

  font-size: 7px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.floating-card strong {
  display: block;

  margin-top: 3px;

  color: #3c4637;

  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 600;
  font-style: italic;
}

.circle-text {
  width: 125px;
  height: 125px;

  position: absolute;
  top: 28px;
  right: 2px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #a3834b;

  animation: rotateCircle 20s linear infinite;
}

.circle-text svg {
  width: 100%;
  height: 100%;
}

.circle-text text {
  fill: #9f8049;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
}

.circle-text > span {
  position: absolute;

  font-size: 18px;

  animation: rotateCircleReverse 20s linear infinite;
}

.footer {
  height: 60px;

  padding: 0 6vw;

  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  z-index: 20;

  color: #989990;

  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.2em;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-line {
  width: 22px;
  height: 1px;

  background: #b1945c;
}

.scroll {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scroll-arrow {
  width: 23px;
  height: 23px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(151, 132, 92, 0.3);
  border-radius: 50%;

  font-size: 12px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-arrow {
  color: #a17f47;
  font-size: 12px;
}

@keyframes imageFloat {
  0%,
  100% {
    transform: rotate(3deg) translateY(0);
  }

  50% {
    transform: rotate(3deg) translateY(-10px);
  }
}

@keyframes orbOne {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(90px, 50px);
  }
}

@keyframes orbTwo {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(-70px, -60px);
  }
}

@keyframes rotateCircle {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes rotateCircleReverse {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(-360deg);
  }
}

@media (max-width: 1050px) {
  .hero {
    gap: 30px;
  }

  h1 {
    font-size: clamp(4rem, 7vw, 6rem);
  }

  .visual {
    height: 560px;
  }

  .image-frame {
    height: 510px;
  }

  .floating-card {
    left: -3%;
  }
}

@media (max-width: 850px) {
  .navbar {
    height: 80px;
  }

  .nav-right {
    display: none;
  }

  .hero {
    min-height: auto;

    grid-template-columns: 1fr;

    padding-top: 35px;
    padding-bottom: 100px;

    text-align: center;
  }

  .hero-copy {
    margin: 0 auto;
  }

  .eyebrow {
    justify-content: center;
  }

  h1 {
    font-size: clamp(4rem, 12vw, 6rem);
  }

  .subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .actions {
    align-items: center;
  }

  .benefits {
    justify-content: center;
  }

  .visual {
    height: 520px;
  }

  .image-frame {
    width: 300px;
    height: 450px;
  }

  .floating-card {
    left: 12%;
    bottom: 35px;
  }

  .circle-text {
    right: 12%;
  }

  .footer {
    display: none;
  }
}

@media (max-width: 550px) {
  .navbar {
    padding: 0 24px;
  }

  .logo strong {
    font-size: 13px;
  }

  .hero {
    padding: 25px 22px 70px;
  }

  .eyebrow {
    font-size: 7px;
    letter-spacing: 0.18em;
  }

  h1 {
    font-size: 3.9rem;
    line-height: 0.84;
  }

  .subtitle {
    margin-top: 27px;

    font-size: 13px;
    line-height: 1.75;
  }

  .primary-button {
    width: 100%;
    max-width: 330px;

    justify-content: space-between;
  }

  .benefits {
    width: 100%;

    gap: 10px;
    justify-content: space-between;
  }

  .benefit {
    flex-direction: column;
    gap: 6px;

    text-align: center;
  }

  .benefit strong {
    font-size: 8px;
  }

  .benefit span {
    font-size: 6px;
  }

  .visual {
    height: 420px;
  }

  .image-frame {
    width: 245px;
    height: 370px;
  }

  .floating-card {
    left: 1%;
    bottom: 25px;

    min-width: 165px;

    padding: 12px 14px;
  }

  .floating-card strong {
    font-size: 17px;
  }

  .circle-text {
    width: 90px;
    height: 90px;

    top: 15px;
    right: 0;
  }

  .circle-text text {
    font-size: 11px;
  }

  .circle-text > span {
    font-size: 13px;
  }

  .action-note {
    font-size: 7px;
  }
}

@media (max-height: 750px) and (min-width: 851px) {
  .navbar {
    height: 75px;
  }

  .hero {
    min-height: calc(100vh - 115px);
    padding-top: 10px;
    padding-bottom: 45px;
  }

  .visual {
    height: 480px;
  }

  .image-frame {
    height: 440px;
  }

  .benefits {
    margin-top: 35px;
  }
}
</style>
