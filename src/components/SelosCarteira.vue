<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const totalSelos = 10;
const selos = ref(0);

const carregarSelos = () => {
  const salvo = localStorage.getItem("selosCarteira");

  if (salvo !== null) {
    const valor = Number(salvo);

    if (!Number.isNaN(valor)) {
      selos.value = Math.min(
        Math.max(valor, 0),
        totalSelos
      );
    }
  }
};

const verCupons = () => {
  if (selos.value >= totalSelos) {
    selos.value = 0;

    localStorage.setItem(
      "selosCarteira",
      "0"
    );
  }

  router.push("/detalhes/carteira/cupons");
};

const progresso = computed(() => {
  return (selos.value / totalSelos) * 100;
});

const faltam = computed(() => {
  return Math.max(
    totalSelos - selos.value,
    0
  );
});

const premioLiberado = computed(() => {
  return selos.value >= totalSelos;
});

const voltar = () => {
  router.push("/perfil");
};

onMounted(() => {
  carregarSelos();
});
</script>

<template>
  <main class="carteira-selos">

    <div class="decoracao decoracao-1"></div>
    <div class="decoracao decoracao-2"></div>

    <div class="container">

      <button
        type="button"
        class="voltar"
        @click="voltar"
      >
        <span class="icone-voltar">
          <i class="fa-solid fa-arrow-left"></i>
        </span>

        <span>Minha carteira</span>
      </button>

      <header class="cabecalho">

        <span class="eyebrow">
          PROGRAMA DE FIDELIDADE
        </span>

        <div class="titulo-linha">

          <div>
            <h1>
              Meus Selos
            </h1>

            <p>
              Junte 10 selos em compras de R$ 20,00
              ou mais e desbloqueie uma recompensa especial.
            </p>
          </div>

          <div class="icone-titulo">
            <i class="fa-solid fa-certificate"></i>
          </div>

        </div>

      </header>

      <section class="regra-compra">

        <div class="regra-icone">
          <i class="fa-solid fa-circle-info"></i>
        </div>

        <div>
          <strong>
            Regra dos selos
          </strong>

          <p>
            A cada compra de <b>R$ 20,00 ou mais</b>,
            você ganha 1 selo.
          </p>
        </div>

      </section>

      <section class="cartao-selos">

        <div class="cartao-topo">

          <div>

            <span class="cartao-label">
              SUA COLEÇÃO
            </span>

            <h2>
              Cartão de fidelidade
            </h2>

          </div>

          <div class="contador">

            <strong>
              {{ selos }}
            </strong>

            <span>
              / {{ totalSelos }}
            </span>

          </div>

        </div>

        <div class="progresso-area">

          <div class="progresso-info">

            <span>
              Progresso
            </span>

            <strong>
              {{ Math.round(progresso) }}%
            </strong>

          </div>

          <div class="barra">

            <div
              class="barra-preenchida"
              :style="{ width: `${progresso}%` }"
            ></div>

          </div>

        </div>

        <div class="selos-grid">

          <div
            v-for="numero in totalSelos"
            :key="numero"
            class="selo"
            :class="{
              preenchido: numero <= selos,
              ultimo: numero === totalSelos
            }"
          >

            <div class="selo-circulo">

              <i
                v-if="numero <= selos"
                class="fa-solid fa-check"
              ></i>

              <i
                v-else-if="numero === totalSelos"
                class="fa-solid fa-gift"
              ></i>

              <span v-else>
                {{ numero }}
              </span>

            </div>

            <small>
              {{
                numero === totalSelos
                  ? "Prêmio"
                  : `Selo ${numero}`
              }}
            </small>

          </div>

        </div>

        <div
          v-if="premioLiberado"
          class="premio-liberado"
        >

          <div class="premio-icone">
            <i class="fa-solid fa-gift"></i>
          </div>

          <div class="premio-texto">

            <span>
              RECOMPENSA DESBLOQUEADA
            </span>

            <strong>
              Você completou seu cartão!
            </strong>

            <p>
              Seu prêmio está disponível na área de Cupons.
              Ao acessar os cupons, um novo cartão será iniciado.
            </p>

          </div>

          <button
            type="button"
            class="btn-cupons"
            @click="verCupons"
          >
            Ver cupons

            <i class="fa-solid fa-arrow-right"></i>
          </button>

        </div>

        <div
          v-else
          class="mensagem-progresso"
        >

          <div class="mensagem-icone">
            <i class="fa-solid fa-bread-slice"></i>
          </div>

          <div>

            <strong>
              {{
                faltam === 1
                  ? "Falta apenas 1 selo!"
                  : `Faltam ${faltam} selos`
              }}
            </strong>

            <p>
              Cada compra de R$ 20,00 ou mais adiciona
              um novo selo.
            </p>

          </div>

        </div>

      </section>

      <section class="como-funciona">

        <div class="secao-titulo">

          <span>
            COMO FUNCIONA
          </span>

          <h2>
            Simples assim
          </h2>

        </div>

        <div class="passos">

          <article class="passo">

            <span class="passo-numero">
              01
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <h3>
              Faça uma compra
            </h3>

            <p>
              Faça uma compra de R$ 20,00 ou mais
              na Padaria Martins.
            </p>

          </article>

          <article class="passo">

            <span class="passo-numero">
              02
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-certificate"></i>
            </div>

            <h3>
              Ganhe um selo
            </h3>

            <p>
              Cada compra válida adiciona um novo
              selo à sua coleção.
            </p>

          </article>

          <article class="passo">

            <span class="passo-numero">
              03
            </span>

            <div class="passo-icone">
              <i class="fa-solid fa-gift"></i>
            </div>

            <h3>
              Receba sua recompensa
            </h3>

            <p>
              Complete os 10 selos, veja seu cupom
              e comece uma nova coleção.
            </p>

          </article>

        </div>

      </section>

      <footer class="rodape">

        <span></span>

        <div>
          <i class="fa-solid fa-heart"></i>
          Feito com carinho
        </div>

        <span></span>

      </footer>

    </div>

  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.carteira-selos {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 8% 10%,
      rgba(190, 163, 112, 0.12),
      transparent 25%
    ),
    radial-gradient(
      circle at 95% 75%,
      rgba(103, 76, 53, 0.08),
      transparent 25%
    ),
    #f8f4ed;
  color: #38291f;
  font-family: "DM Sans", sans-serif;
}

.container {
  position: relative;
  z-index: 2;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 25px 22px 45px;
}

.decoracao {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
}

.decoracao-1 {
  width: 250px;
  height: 250px;
  top: -130px;
  right: -100px;
  background: rgba(185, 151, 91, 0.1);
}

.decoracao-2 {
  width: 220px;
  height: 220px;
  bottom: -120px;
  left: -120px;
  background: rgba(91, 65, 43, 0.06);
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #72563e;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.voltar:hover {
  transform: translateX(-3px);
  color: #38291f;
}

.icone-voltar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(105, 76, 52, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.cabecalho {
  margin-bottom: 20px;
}

.eyebrow {
  color: #a48452;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.titulo-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.titulo-linha h1 {
  margin: 7px 0 10px;
  color: #3a281d;
  font-family: "Playfair Display", serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.titulo-linha p {
  max-width: 460px;
  margin: 0;
  color: #8b796a;
  font-size: 0.88rem;
  line-height: 1.65;
}

.icone-titulo {
  display: grid;
  flex-shrink: 0;
  width: 78px;
  height: 78px;
  place-items: center;
  border: 1px solid rgba(164, 132, 82, 0.2);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  color: #b08d57;
  font-size: 1.45rem;
}

.regra-compra {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 13px 15px;
  border: 1px solid rgba(164, 132, 82, 0.18);
  border-radius: 17px;
  background: #f5ecdd;
}

.regra-icone {
  display: grid;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  background: #e8d8bd;
  color: #86643c;
}

.regra-compra strong {
  display: block;
  color: #604532;
  font-size: 0.78rem;
}

.regra-compra p {
  margin: 3px 0 0;
  color: #927e6b;
  font-size: 0.68rem;
  line-height: 1.4;
}

.regra-compra b {
  color: #5e3023;
}

.cartao-selos {
  position: relative;
  padding: 25px;
  overflow: hidden;
  border: 1px solid rgba(89, 63, 42, 0.09);
  border-radius: 28px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.92),
      rgba(251, 246, 237, 0.88)
    );
  box-shadow:
    0 20px 55px rgba(63, 43, 28, 0.08);
}

.cartao-selos::before {
  position: absolute;
  width: 180px;
  height: 180px;
  top: -90px;
  right: -60px;
  border-radius: 50%;
  background: rgba(185, 151, 91, 0.08);
  content: "";
}

.cartao-topo {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.cartao-label {
  color: #a48452;
  font-size: 0.61rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.cartao-topo h2 {
  margin: 5px 0 0;
  color: #493326;
  font-family: "Playfair Display", serif;
  font-size: 1.35rem;
}

.contador {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.contador strong {
  color: #5e3023;
  font-family: "Playfair Display", serif;
  font-size: 2.2rem;
}

.contador span {
  color: #aa9680;
  font-size: 0.82rem;
  font-weight: 700;
}

.progresso-area {
  position: relative;
  margin: 23px 0 27px;
}

.progresso-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #9b8876;
  font-size: 0.67rem;
  font-weight: 700;
}

.progresso-info strong {
  color: #806341;
}

.barra {
  height: 7px;
  overflow: hidden;
  border-radius: 20px;
  background: #eee5d8;
}

.barra-preenchida {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    #a38351,
    #c6a76e
  );
  transition: width 0.4s ease;
}

.selos-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 17px 12px;
}

.selo {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
}

.selo-circulo {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px dashed #d5c3aa;
  border-radius: 50%;
  background: #faf6ef;
  color: #c0ad95;
  font-size: 0.75rem;
  transition: 0.3s ease;
}

.selo small {
  color: #a79481;
  font-size: 0.57rem;
  font-weight: 600;
}

.selo.preenchido .selo-circulo {
  border: 1px solid #b99a65;
  background:
    radial-gradient(
      circle,
      #d4bd91,
      #b89764
    );
  color: #fffdf8;
  box-shadow:
    0 7px 16px rgba(137, 102, 56, 0.2);
}

.selo.preenchido small {
  color: #806341;
}

.selo.ultimo .selo-circulo {
  border-style: solid;
  color: #a48659;
}

.selo.ultimo.preenchido .selo-circulo {
  color: #fff;
}

.mensagem-progresso {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 28px;
  padding: 14px;
  border: 1px solid rgba(164, 132, 82, 0.12);
  border-radius: 17px;
  background: rgba(246, 239, 228, 0.7);
}

.mensagem-icone {
  display: grid;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 12px;
  background: #eadfcf;
  color: #8b693d;
  font-size: 0.82rem;
}

.mensagem-progresso strong {
  color: #604532;
  font-size: 0.78rem;
}

.mensagem-progresso p {
  margin: 3px 0 0;
  color: #9a8877;
  font-size: 0.66rem;
  line-height: 1.45;
}

.premio-liberado {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 28px;
  padding: 15px;
  border: 1px solid rgba(164, 132, 82, 0.2);
  border-radius: 18px;
  background: #f5ecdd;
}

.premio-icone {
  display: grid;
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  place-items: center;
  border-radius: 14px;
  background: #b89764;
  color: white;
}

.premio-texto {
  min-width: 0;
  flex: 1;
}

.premio-texto span {
  color: #9a7948;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.premio-texto strong {
  display: block;
  margin-top: 3px;
  color: #563c2c;
  font-size: 0.8rem;
}

.premio-texto p {
  margin: 3px 0 0;
  color: #927e6b;
  font-size: 0.63rem;
  line-height: 1.45;
}

.btn-cupons {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 10px 13px;
  border: 0;
  border-radius: 12px;
  background: #5e3023;
  color: white;
  font-family: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-cupons:hover {
  background: #422218;
  transform: translateX(2px);
}

.btn-cupons i {
  font-size: 0.55rem;
}

.como-funciona {
  margin-top: 38px;
}

.secao-titulo span {
  color: #a48452;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.secao-titulo h2 {
  margin: 5px 0 17px;
  color: #493326;
  font-family: "Playfair Display", serif;
  font-size: 1.5rem;
}

.passos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.passo {
  position: relative;
  padding: 18px;
  border: 1px solid rgba(89, 63, 42, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.62);
}

.passo-numero {
  color: #c2aa86;
  font-size: 0.6rem;
  font-weight: 800;
}

.passo-icone {
  display: grid;
  width: 39px;
  height: 39px;
  margin: 13px 0;
  place-items: center;
  border-radius: 12px;
  background: #f1e9dd;
  color: #987648;
}

.passo h3 {
  margin: 0 0 6px;
  color: #563c2c;
  font-family: "Playfair Display", serif;
  font-size: 0.93rem;
}

.passo p {
  margin: 0;
  color: #998778;
  font-size: 0.65rem;
  line-height: 1.55;
}

.rodape {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 32px;
  color: #b19d87;
  font-size: 0.62rem;
}

.rodape span {
  width: 50px;
  height: 1px;
  background: rgba(139, 113, 83, 0.18);
}

.rodape div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rodape i {
  color: #b49361;
  font-size: 0.52rem;
}

@media (max-width: 600px) {
  .container {
    padding: 20px 15px 35px;
  }

  .titulo-linha h1 {
    font-size: 2.5rem;
  }

  .icone-titulo {
    width: 62px;
    height: 62px;
    font-size: 1.15rem;
  }

  .cartao-selos {
    padding: 20px 16px;
    border-radius: 23px;
  }

  .selos-grid {
    gap: 15px 6px;
  }

  .selo-circulo {
    width: 51px;
    height: 51px;
  }

  .selo small {
    font-size: 0.51rem;
  }

  .passos {
    grid-template-columns: 1fr;
  }

  .passo {
    padding: 15px;
  }

  .premio-liberado {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .btn-cupons {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 380px) {
  .titulo-linha {
    align-items: flex-start;
  }

  .icone-titulo {
    width: 54px;
    height: 54px;
  }

  .cartao-topo h2 {
    font-size: 1.15rem;
  }

  .contador strong {
    font-size: 1.8rem;
  }

  .selo-circulo {
    width: 46px;
    height: 46px;
  }
}
</style>
