<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tipoAtual = computed(() => route.params.tipo);

const voltarParaPerfil = () => {
  router.push("/perfil");
};

const abas = [
  {
    id: "favoritos",
    nome: "Favoritos",
    descricao: "Seus queridinhos",
    icone: "fa-heart"
  },
  {
    id: "avaliados",
    nome: "Avaliados",
    descricao: "Suas avaliações",
    icone: "fa-star"
  },
  {
    id: "preparados",
    nome: "Preparados",
    descricao: "Seus pedidos",
    icone: "fa-utensils"
  }
];

const abaAtual = computed(() => {
  return abas.find((aba) => aba.id === tipoAtual.value) || abas[0];
});

const mudarAba = (id) => {
  router.push(`/pedidos/${id}`);
};
</script>

<template>
  <div class="pedidos-page">

    <div class="decor decor-1"></div>
    <div class="decor decor-2"></div>
    <div class="decor decor-3"></div>

    <main class="pedidos-view">

      <header class="topo">

        <button
          type="button"
          class="btn-voltar"
          @click="voltarParaPerfil"
        >
          <span class="voltar-icone">
            <i class="fa-solid fa-arrow-left"></i>
          </span>

          <span>Voltar ao perfil</span>
        </button>

        <div class="topo-titulo">

          <span class="eyebrow">
            MINHA CONTA
          </span>

          <h1>
            Meus <em>pedidos</em>
          </h1>

          <p>
            Tudo o que você escolheu, guardou e avaliou em um só lugar.
          </p>

        </div>

      </header>

      <section class="painel-pedidos">

        <div class="painel-cabecalho">

          <div class="icone-principal">
            <i :class="`fa-solid ${abaAtual.icone}`"></i>
          </div>

          <div class="cabecalho-info">

            <span>
              SUA COLEÇÃO
            </span>

            <h2>
              {{ abaAtual.nome }}
            </h2>

            <p>
              {{ abaAtual.descricao }}
            </p>

          </div>

          <div class="ornamento">
            ✦
          </div>

        </div>

        <div class="abas-container">

          <button
            v-for="aba in abas"
            :key="aba.id"
            type="button"
            class="aba"
            :class="{ ativa: tipoAtual === aba.id }"
            @click="mudarAba(aba.id)"
          >

            <span class="aba-icone">
              <i :class="`fa-solid ${aba.icone}`"></i>
            </span>

            <span class="aba-textos">
              <strong>{{ aba.nome }}</strong>
              <small>{{ aba.descricao }}</small>
            </span>

            <span class="aba-seta">
              <i class="fa-solid fa-arrow-right"></i>
            </span>

          </button>

        </div>

        <div class="conteudo-lista">

          <div class="decoracao-conteudo decoracao-conteudo-1"></div>
          <div class="decoracao-conteudo decoracao-conteudo-2"></div>

          <div class="placeholder-vazio">

            <div class="icone-vazio">
              <div class="icone-circulo">
                <i :class="`fa-solid ${abaAtual.icone}`"></i>
              </div>

              <span class="brilho brilho-1">✦</span>
              <span class="brilho brilho-2">✦</span>
            </div>

            <span class="vazio-label">
              {{ abaAtual.nome.toUpperCase() }}
            </span>

            <h3>
              Ainda não há itens por aqui.
            </h3>

            <p>
              Quando você tiver algo em
              <strong>{{ abaAtual.nome.toLowerCase() }}</strong>,
              ele aparecerá nesta área.
            </p>

            <button
              type="button"
              class="btn-explorar"
              @click="router.push('/menu')"
            >
              <span>Explorar nosso menu</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>

          </div>

        </div>

      </section>

      <div class="rodape-detalhe">
        <span></span>
        <i class="fa-solid fa-heart"></i>
        <span></span>
      </div>

    </main>

  </div>
</template>

<style scoped>
.pedidos-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 90% 8%,
      rgba(184, 151, 100, 0.11),
      transparent 28%
    ),
    #fbf8f3;
  color: #5e3023;
}

.pedidos-view {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 850px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 30px 18px 55px;
  box-sizing: border-box;
}

.decor {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.decor-1 {
  width: 300px;
  height: 300px;
  top: -170px;
  right: -100px;
  border: 1px solid rgba(94, 48, 35, 0.08);
}

.decor-2 {
  width: 180px;
  height: 180px;
  bottom: -100px;
  left: -80px;
  background: rgba(184, 151, 100, 0.07);
}

.decor-3 {
  width: 8px;
  height: 8px;
  top: 28%;
  right: 8%;
  background: #b89764;
  opacity: 0.35;
}

.topo {
  margin-bottom: 28px;
}

.btn-voltar {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0;
  margin-bottom: 25px;
  border: none;
  background: transparent;
  color: #806e60;
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-voltar:hover {
  color: #5e3023;
}

.voltar-icone {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eadfd1;
  border-radius: 50%;
  background: #fff;
  font-size: 9px;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.btn-voltar:hover .voltar-icone {
  transform: translateX(-3px);
  background: #f5ecdf;
}

.topo-titulo {
  max-width: 620px;
}

.eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #b89764;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.topo-titulo h1 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.7rem, 9vw, 4.4rem);
  line-height: 0.95;
  letter-spacing: -1.5px;
}

.topo-titulo h1 em {
  color: #b89764;
  font-style: italic;
}

.topo-titulo p {
  max-width: 480px;
  margin: 14px 0 0;
  color: #8a7b6f;
  font-size: 0.78rem;
  line-height: 1.65;
}

.painel-pedidos {
  position: relative;
  overflow: hidden;
  border: 1px solid #eee2d4;
  border-radius: 27px;
  background: #fff;
  box-shadow: 0 15px 45px rgba(94, 48, 35, 0.07);
}

.painel-cabecalho {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 22px 19px;
  background:
    linear-gradient(
      135deg,
      #fffdf9 0%,
      #f8f0e5 100%
    );
  border-bottom: 1px solid #f0e5d8;
}

.icone-principal {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f0e2d1;
  color: #8d6844;
  font-size: 17px;
  box-shadow: inset 0 0 0 1px rgba(184, 151, 100, 0.12);
}

.cabecalho-info {
  min-width: 0;
}

.cabecalho-info > span {
  color: #b89764;
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.cabecalho-info h2 {
  margin: 2px 0 1px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.35rem;
  line-height: 1.05;
}

.cabecalho-info p {
  margin: 0;
  color: #9a8b7d;
  font-size: 0.6rem;
}

.ornamento {
  margin-left: auto;
  color: #d2b581;
  font-size: 19px;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 13px;
  background: #fff;
  border-bottom: 1px solid #f1e8dd;
}

.aba {
  position: relative;
  min-width: 0;
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: transparent;
  color: #9b8e82;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border 0.2s ease,
    transform 0.2s ease;
}

.aba:hover {
  background: #fcfaf7;
  border-color: #f0e6d9;
}

.aba.ativa {
  background: #f8f0e5;
  border-color: #ecdfce;
  color: #5e3023;
}

.aba-icone {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f6f3ef;
  color: #b8a99a;
  font-size: 11px;
  transition: 0.2s ease;
}

.aba.ativa .aba-icone {
  background: #fff;
  color: #b89764;
  box-shadow: 0 4px 12px rgba(94, 48, 35, 0.06);
}

.aba-textos {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.aba-textos strong {
  overflow: hidden;
  color: inherit;
  font-size: 0.65rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aba-textos small {
  overflow: hidden;
  color: #a99c90;
  font-size: 0.5rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aba.ativa .aba-textos small {
  color: #a68d6c;
}

.aba-seta {
  display: none;
  margin-left: auto;
  font-size: 7px;
  color: #b89764;
}

.conteudo-lista {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
  background:
    radial-gradient(
      circle at 50% 35%,
      rgba(247, 238, 224, 0.7),
      transparent 43%
    ),
    #fff;
}

.decoracao-conteudo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.decoracao-conteudo-1 {
  width: 240px;
  height: 240px;
  top: -150px;
  right: -110px;
  border: 1px solid rgba(184, 151, 100, 0.12);
}

.decoracao-conteudo-2 {
  width: 160px;
  height: 160px;
  bottom: -110px;
  left: -80px;
  background: rgba(247, 238, 224, 0.55);
}

.placeholder-vazio {
  position: relative;
  z-index: 2;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icone-vazio {
  position: relative;
  width: 85px;
  height: 75px;
  margin-bottom: 11px;
}

.icone-circulo {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eadbc8;
  border-radius: 50%;
  background: #faf3e8;
  color: #b89764;
  font-size: 23px;
  box-shadow:
    0 10px 25px rgba(94, 48, 35, 0.06),
    inset 0 0 0 7px rgba(255, 255, 255, 0.55);
}

.brilho {
  position: absolute;
  color: #d0b27d;
  font-size: 10px;
}

.brilho-1 {
  top: 2px;
  right: 0;
}

.brilho-2 {
  left: 1px;
  bottom: 3px;
  font-size: 7px;
  opacity: 0.7;
}

.vazio-label {
  margin-bottom: 6px;
  color: #b89764;
  font-size: 0.53rem;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.placeholder-vazio h3 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.55rem;
  line-height: 1.1;
}

.placeholder-vazio p {
  max-width: 310px;
  margin: 9px 0 20px;
  color: #978a7e;
  font-size: 0.68rem;
  line-height: 1.65;
}

.placeholder-vazio p strong {
  color: #806b59;
}

.btn-explorar {
  min-height: 43px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 17px;
  border: none;
  border-radius: 13px;
  background: #5e3023;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(94, 48, 35, 0.16);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-explorar:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(94, 48, 35, 0.22);
}

.btn-explorar i {
  font-size: 8px;
}

.rodape-detalhe {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 23px;
}

.rodape-detalhe span {
  width: 45px;
  height: 1px;
  background: #e8ddcf;
}

.rodape-detalhe i {
  color: #c8a873;
  font-size: 8px;
}

@media (min-width: 700px) {
  .pedidos-view {
    padding: 45px 30px 65px;
  }

  .topo {
    margin-bottom: 35px;
  }

  .painel-cabecalho {
    padding: 25px 27px 22px;
  }

  .abas-container {
    padding: 15px;
    gap: 10px;
  }

  .aba {
    min-height: 75px;
    padding: 12px;
  }

  .aba-seta {
    display: block;
  }

  .conteudo-lista {
    min-height: 450px;
  }
}

@media (max-width: 540px) {
  .pedidos-view {
    padding: 25px 14px 45px;
  }

  .btn-voltar {
    margin-bottom: 20px;
  }

  .topo-titulo h1 {
    font-size: 3rem;
  }

  .topo-titulo p {
    font-size: 0.72rem;
  }

  .painel-pedidos {
    border-radius: 22px;
  }

  .painel-cabecalho {
    padding: 18px;
  }

  .icone-principal {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    font-size: 15px;
  }

  .cabecalho-info h2 {
    font-size: 1.2rem;
  }

  .ornamento {
    font-size: 15px;
  }

  .abas-container {
    padding: 9px;
    gap: 5px;
  }

  .aba {
    min-height: 62px;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 7px 4px;
    text-align: center;
  }

  .aba-icone {
    width: 29px;
    height: 29px;
    border-radius: 9px;
    font-size: 9px;
  }

  .aba-textos {
    width: 100%;
    align-items: center;
  }

  .aba-textos strong {
    font-size: 0.54rem;
  }

  .aba-textos small {
    display: none;
  }

  .aba-seta {
    display: none;
  }

  .conteudo-lista {
    min-height: 365px;
    padding: 35px 15px;
  }

  .placeholder-vazio h3 {
    font-size: 1.35rem;
  }

  .placeholder-vazio p {
    font-size: 0.63rem;
  }

  .icone-circulo {
    width: 64px;
    height: 64px;
    font-size: 21px;
  }
}

@media (max-width: 350px) {
  .topo-titulo h1 {
    font-size: 2.65rem;
  }

  .cabecalho-info p {
    display: none;
  }

  .aba-textos strong {
    font-size: 0.5rem;
  }

  .conteudo-lista {
    min-height: 340px;
  }
}
</style>
