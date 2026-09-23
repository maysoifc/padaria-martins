<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const grupo = computed(() => route.params.grupo);
const tipoAtual = computed(() => route.params.tipo);

const cupons = ref([]);

const configuracoes = {
  pedidos: {
    titulo: 'Meus Pedidos',
    subtitulo: 'Tudo o que você já viveu com a gente.',
    abas: [
      {
        id: 'favoritos',
        nome: 'Favoritos',
        descricao: 'Seus queridinhos',
        icone: 'fa-heart'
      },
      {
        id: 'avaliados',
        nome: 'Avaliados',
        descricao: 'Suas avaliações',
        icone: 'fa-star'
      },
      {
        id: 'preparados',
        nome: 'Preparados',
        descricao: 'Pedidos realizados',
        icone: 'fa-utensils'
      }
    ]
  },

  carteira: {
    titulo: 'Minha Carteira',
    subtitulo: 'Vantagens especiais para você.',
    abas: [
      {
        id: 'cupons',
        nome: 'Cupons',
        descricao: 'Descontos disponíveis',
        icone: 'fa-ticket'
      },
      {
        id: 'selos',
        nome: 'Selos',
        descricao: 'Sua coleção',
        icone: 'fa-certificate'
      },
      {
        id: 'cartoes',
        nome: 'Cartões',
        descricao: 'Formas de pagamento',
        icone: 'fa-credit-card'
      }
    ]
  }
};

const dadosAtuais = computed(() => {
  return (
    configuracoes[grupo.value] ||
    configuracoes.pedidos
  );
});

const abaAtual = computed(() => {
  return (
    dadosAtuais.value.abas.find(
      aba => aba.id === tipoAtual.value
    ) ||
    dadosAtuais.value.abas[0]
  );
});

const ehCupons = computed(() => {
  return (
    grupo.value === 'carteira' &&
    tipoAtual.value === 'cupons'
  );
});

const carregarCupons = () => {
  try {
    const salvo = localStorage.getItem('cuponsCarteira');

    if (!salvo) {
      cupons.value = [];
      return;
    }

    const dados = JSON.parse(salvo);

    cupons.value = Array.isArray(dados)
      ? dados
      : [];
  } catch (error) {
    console.error('Erro ao carregar cupons:', error);
    cupons.value = [];
  }
};

const formatarData = (data) => {
  if (!data) {
    return '';
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return '';
  }

  return dataObj.toLocaleDateString('pt-BR');
};

const mudarAba = (id) => {
  if (
    grupo.value === 'carteira' &&
    id === 'selos'
  ) {
    router.push('/carteira/selos');
    return;
  }

  router.push(
    `/detalhes/${grupo.value}/${id}`
  );
};

const voltar = () => {
  router.push('/perfil');
};

const irParaSelos = () => {
  router.push('/carteira/selos');
};

onMounted(() => {
  carregarCupons();
});
</script>

<template>
  <div class="geral-page">

    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="geral-container">

      <header class="page-header">

        <button
          type="button"
          class="btn-voltar"
          @click="voltar"
        >
          <span class="voltar-icon">
            <i class="fa-solid fa-arrow-left"></i>
          </span>

          <span>Meu perfil</span>
        </button>

        <div class="header-copy">

          <span class="eyebrow">
            {{
              grupo === 'carteira'
                ? 'MINHA CARTEIRA'
                : 'MINHA CONTA'
            }}
          </span>

          <h1>
            {{ dadosAtuais.titulo }}
          </h1>

          <p>
            {{ dadosAtuais.subtitulo }}
          </p>

        </div>

        <div class="header-decoration">

          <span></span>

          <i
            :class="`fa-solid ${abaAtual.icone}`"
          ></i>

        </div>

      </header>


      <section class="abas-section">

        <div class="section-heading">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              Escolha uma categoria
            </h2>

          </div>

          <div class="contador">

            <strong>
              {{ dadosAtuais.abas.length }}
            </strong>

            <span>
              opções
            </span>

          </div>

        </div>


        <div class="abas-container">

          <button
            v-for="aba in dadosAtuais.abas"
            :key="aba.id"
            type="button"
            class="aba"
            :class="{
              ativa:
                tipoAtual === aba.id
            }"
            @click="mudarAba(aba.id)"
          >

            <span class="aba-icone">

              <i
                :class="`fa-solid ${aba.icone}`"
              ></i>

            </span>

            <span class="aba-texto">

              <strong>
                {{ aba.nome }}
              </strong>

              <small>
                {{ aba.descricao }}
              </small>

            </span>

            <span class="aba-seta">

              <i
                class="fa-solid fa-arrow-right"
              ></i>

            </span>

          </button>

        </div>

      </section>


      <section class="conteudo-card">

        <div class="conteudo-topo">

          <div class="conteudo-identidade">

            <div class="icone-conteudo">

              <i
                :class="`fa-solid ${abaAtual.icone}`"
              ></i>

            </div>

            <div>

              <span>
                SEÇÃO ATUAL
              </span>

              <h2>
                {{ abaAtual.nome }}
              </h2>

            </div>

          </div>


          <span
            v-if="ehCupons"
            class="status-pill ativo"
          >

            <i
              class="fa-solid fa-circle"
            ></i>

            {{ cupons.length }}
            {{
              cupons.length === 1
                ? 'disponível'
                : 'disponíveis'
            }}

          </span>


          <span
            v-else
            class="status-pill"
          >

            <i
              class="fa-solid fa-circle"
            ></i>

            Em breve

          </span>

        </div>


        <!-- ========================= -->
        <!-- CUPONS -->
        <!-- ========================= -->

        <div
          v-if="ehCupons"
          class="cupons-content"
        >

          <div
            v-if="cupons.length > 0"
            class="cupons-intro"
          >

            <div class="cupons-intro-icone">

              <i
                class="fa-solid fa-gift"
              ></i>

            </div>

            <div>

              <span>
                SUAS RECOMPENSAS
              </span>

              <h3>
                Prêmios disponíveis
              </h3>

              <p>
                Essas são as recompensas que você
                desbloqueou através dos seus selos.
              </p>

            </div>

          </div>


          <div
            v-if="cupons.length > 0"
            class="cupons-lista"
          >

            <article
              v-for="cupom in cupons"
              :key="cupom.codigo"
              class="cupom-card"
            >

              <div class="cupom-card-topo">

                <div class="cupom-icone">

                  <i
                    :class="
                      cupom.icone ||
                      'fa-solid fa-ticket'
                    "
                  ></i>

                </div>

                <span class="cupom-status">
                  DISPONÍVEL
                </span>

              </div>


              <div class="cupom-info">

                <span class="cupom-label">
                  RECOMPENSA DOS SELOS
                </span>

                <h3>
                  {{ cupom.titulo }}
                </h3>

                <p>
                  {{ cupom.descricao }}
                </p>

              </div>


              <div class="cupom-codigo">

                <div>

                  <span>
                    CÓDIGO DO CUPOM
                  </span>

                  <strong>
                    {{ cupom.codigo }}
                  </strong>

                </div>

                <i
                  class="fa-solid fa-ticket"
                ></i>

              </div>


              <div
                v-if="cupom.data"
                class="cupom-data"
              >

                <i
                  class="fa-regular fa-calendar"
                ></i>

                Recebido em
                {{ formatarData(cupom.data) }}

              </div>

            </article>

          </div>


          <!-- ========================= -->
          <!-- NENHUM CUPOM -->
          <!-- ========================= -->

          <div
            v-else
            class="cupons-vazio"
          >

            <div class="vazio-ilustracao">

              <div class="vazio-circulo">

                <i
                  class="fa-solid fa-ticket"
                ></i>

              </div>

              <span
                class="vazio-ponto ponto-one"
              ></span>

              <span
                class="vazio-ponto ponto-two"
              ></span>

              <span
                class="vazio-ponto ponto-three"
              ></span>

            </div>


            <span class="vazio-label">
              SEUS CUPONS
            </span>


            <h3>
              Ainda não há recompensas.
            </h3>


            <p>
              Complete sua cartela com 10 selos
              para desbloquear uma recompensa especial.
            </p>


            <button
              type="button"
              class="btn-ir-selos"
              @click="irParaSelos"
            >

              <span>
                Ver meus selos
              </span>

              <i
                class="fa-solid fa-arrow-right"
              ></i>

            </button>

          </div>

        </div>


        <!-- ========================= -->
        <!-- OUTRAS CATEGORIAS -->
        <!-- ========================= -->

        <div
          v-else
          class="placeholder"
        >

          <div class="placeholder-ilustracao">

            <div
              class="placeholder-circulo"
            >

              <i
                :class="`fa-solid ${abaAtual.icone}`"
              ></i>

            </div>

            <span
              class="decor decor-one"
            ></span>

            <span
              class="decor decor-two"
            ></span>

            <span
              class="decor decor-three"
            ></span>

          </div>


          <span class="placeholder-label">

            {{ abaAtual.nome.toUpperCase() }}

          </span>


          <h3>
            Estamos preparando<br />
            algo especial.
          </h3>


          <p>
            Esta área ainda está sendo preparada.
            Em breve você poderá acompanhar tudo por aqui.
          </p>


          <button
            type="button"
            class="btn-voltar-perfil"
            @click="voltar"
          >

            <span>
              Voltar ao meu perfil
            </span>

            <i
              class="fa-solid fa-arrow-right"
            ></i>

          </button>

        </div>

      </section>


      <footer class="page-footer">

        <span class="linha"></span>

        <div>

          <i
            class="fa-solid fa-heart"
          ></i>

          Feito com carinho

        </div>

        <span class="linha"></span>

      </footer>

    </main>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.geral-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 10% 15%,
      rgba(190, 163, 112, 0.09),
      transparent 24%
    ),
    radial-gradient(
      circle at 92% 80%,
      rgba(103, 76, 53, 0.07),
      transparent 25%
    ),
    #f8f4ed;
  color: #38291f;
  font-family: 'DM Sans', sans-serif;
}

.geral-container {
  position: relative;
  z-index: 2;
  width: min(100%, 900px);
  margin: 0 auto;
  padding: 28px 24px 42px;
}

.ambient {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(1px);
}

.ambient-one {
  width: 260px;
  height: 260px;
  top: -130px;
  right: -100px;
  background: rgba(191, 162, 108, 0.13);
}

.ambient-two {
  width: 220px;
  height: 220px;
  bottom: -100px;
  left: -100px;
  background: rgba(108, 77, 51, 0.08);
}

.page-header {
  position: relative;
  margin-bottom: 42px;
}

.btn-voltar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  margin-bottom: 32px;
  border: 0;
  background: transparent;
  color: #72563e;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-voltar:hover {
  color: #38291f;
  transform: translateX(-3px);
}

.voltar-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(105, 76, 52, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  box-shadow:
    0 6px 18px
    rgba(63, 42, 27, 0.06);
}

.header-copy {
  max-width: 650px;
}

.eyebrow,
.section-heading > div > span,
.conteudo-identidade span,
.placeholder-label,
.cupons-intro span,
.cupom-label,
.vazio-label {
  display: block;
  color: #a48452;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.header-copy h1 {
  margin: 8px 0 10px;
  color: #3a281d;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.35rem, 7vw, 4rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.header-copy p {
  max-width: 470px;
  margin: 0;
  color: #8b796a;
  font-size: 0.96rem;
  line-height: 1.65;
}

.header-decoration {
  position: absolute;
  top: 76px;
  right: 5%;
  display: grid;
  width: 94px;
  height: 94px;
  place-items: center;
  border: 1px solid rgba(164, 132, 82, 0.18);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  color: #b08d57;
}

.header-decoration span {
  position: absolute;
  inset: 9px;
  border: 1px dashed rgba(164, 132, 82, 0.25);
  border-radius: 50%;
}

.header-decoration i {
  position: relative;
  z-index: 1;
  font-size: 1.45rem;
}

.abas-section {
  margin-bottom: 26px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 5px 0 0;
  color: #4a3527;
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
}

.contador {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #9a897a;
  font-size: 0.75rem;
}

.contador strong {
  color: #76593f;
  font-size: 1rem;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.aba {
  position: relative;
  display: flex;
  min-height: 92px;
  align-items: center;
  gap: 12px;
  padding: 15px;
  overflow: hidden;
  border: 1px solid rgba(89, 63, 42, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.68);
  color: #8f7b6a;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  box-shadow:
    0 8px 25px
    rgba(65, 45, 29, 0.035);
  transition: 0.3s ease;
}

.aba:hover {
  transform: translateY(-3px);
  border-color: rgba(164, 132, 82, 0.25);
  box-shadow:
    0 14px 30px
    rgba(65, 45, 29, 0.08);
}

.aba.ativa {
  border-color: rgba(164, 132, 82, 0.28);
  background: #fffdf9;
  color: #4b3526;
  box-shadow:
    0 14px 32px
    rgba(65, 45, 29, 0.09);
}

.aba.ativa::before {
  position: absolute;
  width: 55px;
  height: 55px;
  right: -18px;
  bottom: -20px;
  border-radius: 50%;
  background: rgba(186, 151, 92, 0.1);
  content: '';
}

.aba-icone {
  display: grid;
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 14px;
  background: #f4eee5;
  color: #a38454;
  transition: 0.3s ease;
}

.aba.ativa .aba-icone {
  background: #eadfcf;
  color: #765636;
}

.aba-icone i {
  font-size: 0.95rem;
}

.aba-texto {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.aba-texto strong {
  color: #4a3527;
  font-size: 0.84rem;
}

.aba-texto small {
  overflow: hidden;
  color: #9d8c7c;
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aba-seta {
  display: grid;
  margin-left: auto;
  place-items: center;
  color: #c0aa8b;
  font-size: 0.7rem;
  transition: 0.3s ease;
}

.aba:hover .aba-seta {
  transform: translateX(3px);
}

.conteudo-card {
  overflow: hidden;
  border: 1px solid rgba(89, 63, 42, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow:
    0 20px 55px
    rgba(63, 43, 28, 0.07);
  backdrop-filter: blur(10px);
}

.conteudo-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(89, 63, 42, 0.07);
}

.conteudo-identidade {
  display: flex;
  align-items: center;
  gap: 13px;
}

.icone-conteudo {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 15px;
  background: #f4eee5;
  color: #987648;
}

.conteudo-identidade h2 {
  margin: 3px 0 0;
  color: #463125;
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 50px;
  background: #f8f3ea;
  color: #a18b70;
  font-size: 0.65rem;
  font-weight: 700;
}

.status-pill.ativo {
  background: #f1eadf;
  color: #80633e;
}

.status-pill i {
  font-size: 0.35rem;
  color: #c0a06c;
}

.cupons-content {
  padding: 28px 24px 30px;
}

.cupons-intro {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
}

.cupons-intro-icone {
  display: grid;
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  place-items: center;
  border-radius: 16px;
  background: #f4eee5;
  color: #a38454;
  font-size: 1.15rem;
}

.cupons-intro h3 {
  margin: 5px 0 4px;
  color: #463125;
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
}

.cupons-intro p {
  margin: 0;
  color: #968475;
  font-size: 0.78rem;
  line-height: 1.5;
}

.cupons-lista {
  display: grid;
  gap: 14px;
}

.cupom-card {
  position: relative;
  padding: 18px;
  overflow: hidden;
  border: 1px solid rgba(164, 132, 82, 0.16);
  border-radius: 22px;
  background:
    linear-gradient(
      135deg,
      #fffdf9 0%,
      #faf4e9 100%
    );
  box-shadow:
    0 10px 28px
    rgba(65, 45, 29, 0.06);
}

.cupom-card::before {
  position: absolute;
  width: 100px;
  height: 100px;
  top: -55px;
  right: -35px;
  border-radius: 50%;
  background: rgba(190, 157, 98, 0.1);
  content: '';
}

.cupom-card-topo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cupom-icone {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 14px;
  background: #efe2ce;
  color: #795a39;
  font-size: 1rem;
}

.cupom-status {
  padding: 6px 9px;
  border-radius: 50px;
  background: #f1eadf;
  color: #8b704e;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.cupom-info {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}

.cupom-label {
  font-size: 0.56rem;
}

.cupom-info h3 {
  margin: 5px 0 5px;
  color: #463125;
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
}

.cupom-info p {
  margin: 0;
  color: #8f7c6b;
  font-size: 0.78rem;
  line-height: 1.55;
}

.cupom-codigo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 18px;
  padding: 12px 14px;
  border: 1px dashed rgba(125, 94, 58, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
}

.cupom-codigo div {
  min-width: 0;
}

.cupom-codigo span {
  display: block;
  margin-bottom: 4px;
  color: #aa9479;
  font-size: 0.53rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.cupom-codigo strong {
  display: block;
  overflow: hidden;
  color: #65482f;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cupom-codigo > i {
  color: #b49361;
  font-size: 1rem;
}

.cupom-data {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 11px;
  color: #a18d79;
  font-size: 0.62rem;
}

.cupom-data i {
  font-size: 0.58rem;
}

.cupons-vazio {
  position: relative;
  display: flex;
  min-height: 390px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 35px 20px;
  overflow: hidden;
  text-align: center;
}

.cupons-vazio::before {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: rgba(194, 165, 112, 0.055);
  content: '';
  transform: translate(-50%, -50%);
}

.vazio-ilustracao {
  position: relative;
  width: 105px;
  height: 105px;
  margin-bottom: 20px;
}

.vazio-circulo {
  position: absolute;
  inset: 11px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(169, 137, 87, 0.18);
  border-radius: 50%;
  background: #fbf7f0;
  color: #b29362;
  box-shadow:
    0 15px 30px
    rgba(85, 59, 37, 0.07);
}

.vazio-circulo i {
  font-size: 1.65rem;
}

.vazio-ponto {
  position: absolute;
  border-radius: 50%;
  background: #d9c29b;
}

.ponto-one {
  width: 7px;
  height: 7px;
  top: 6px;
  right: 18px;
}

.ponto-two {
  width: 10px;
  height: 10px;
  bottom: 8px;
  left: 3px;
  opacity: 0.55;
}

.ponto-three {
  width: 5px;
  height: 5px;
  top: 30px;
  left: 0;
  opacity: 0.65;
}

.cupons-vazio h3 {
  position: relative;
  margin: 8px 0 12px;
  color: #432f22;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.45rem, 5vw, 1.9rem);
  line-height: 1.2;
}

.cupons-vazio p {
  position: relative;
  max-width: 350px;
  margin: 0 0 23px;
  color: #958374;
  font-size: 0.82rem;
  line-height: 1.65;
}

.btn-ir-selos {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  border: 1px solid rgba(108, 78, 50, 0.1);
  border-radius: 50px;
  background: #4b3527;
  color: #fffaf3;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 10px 25px
    rgba(75, 53, 39, 0.18);
  transition: 0.25s ease;
}

.btn-ir-selos:hover {
  transform: translateY(-2px);
  background: #39281e;
}

.btn-ir-selos i {
  font-size: 0.68rem;
}

.placeholder {
  position: relative;
  display: flex;
  min-height: 410px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 48px 24px;
  overflow: hidden;
  text-align: center;
}

.placeholder::before {
  position: absolute;
  width: 320px;
  height: 320px;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: rgba(194, 165, 112, 0.055);
  content: '';
  transform: translate(-50%, -50%);
}

.placeholder-ilustracao {
  position: relative;
  width: 110px;
  height: 110px;
  margin-bottom: 24px;
}

.placeholder-circulo {
  position: absolute;
  inset: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(169, 137, 87, 0.18);
  border-radius: 50%;
  background: #fbf7f0;
  color: #b29362;
  box-shadow:
    0 15px 30px
    rgba(85, 59, 37, 0.07);
}

.placeholder-circulo i {
  font-size: 1.7rem;
}

.decor {
  position: absolute;
  border-radius: 50%;
  background: #d9c29b;
}

.decor-one {
  width: 7px;
  height: 7px;
  top: 7px;
  right: 20px;
}

.decor-two {
  width: 11px;
  height: 11px;
  bottom: 10px;
  left: 4px;
  opacity: 0.55;
}

.decor-three {
  width: 5px;
  height: 5px;
  top: 32px;
  left: 0;
  opacity: 0.65;
}

.placeholder h3 {
  position: relative;
  margin: 8px 0 12px;
  color: #432f22;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.55rem, 5vw, 2rem);
  line-height: 1.2;
}

.placeholder p {
  position: relative;
  max-width: 390px;
  margin: 0 0 25px;
  color: #958374;
  font-size: 0.86rem;
  line-height: 1.65;
}

.btn-voltar-perfil {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  border: 1px solid rgba(108, 78, 50, 0.1);
  border-radius: 50px;
  background: #4b3527;
  color: #fffaf3;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 10px 25px
    rgba(75, 53, 39, 0.18);
  transition: 0.25s ease;
}

.btn-voltar-perfil:hover {
  transform: translateY(-2px);
  background: #39281e;
}

.btn-voltar-perfil i {
  font-size: 0.68rem;
}

.page-footer {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
  margin-top: 32px;
  color: #b19d87;
  font-size: 0.68rem;
}

.page-footer .linha {
  width: 55px;
  height: 1px;
  background: rgba(139, 113, 83, 0.18);
}

.page-footer div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.page-footer i {
  color: #b49361;
  font-size: 0.58rem;
}

@media (max-width: 700px) {
  .geral-container {
    padding: 22px 16px 34px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .btn-voltar {
    margin-bottom: 25px;
  }

  .header-copy h1 {
    font-size: 2.45rem;
    max-width: 250px;
  }

  .header-copy p {
    max-width: 300px;
    font-size: 0.85rem;
  }

  .header-decoration {
    top: 72px;
    right: -3px;
    width: 70px;
    height: 70px;
  }

  .header-decoration i {
    font-size: 1.1rem;
  }

  .header-decoration span {
    inset: 7px;
  }

  .section-heading {
    align-items: center;
  }

  .section-heading h2 {
    font-size: 1.25rem;
  }

  .abas-container {
    display: flex;
    gap: 9px;
    overflow-x: auto;
    padding: 3px 2px 9px;
    scrollbar-width: none;
  }

  .abas-container::-webkit-scrollbar {
    display: none;
  }

  .aba {
    flex: 0 0 170px;
    min-height: 86px;
    padding: 13px;
    border-radius: 18px;
  }

  .aba-icone {
    flex-basis: 39px;
    width: 39px;
    height: 39px;
  }

  .aba-texto strong {
    font-size: 0.78rem;
  }

  .aba-texto small {
    font-size: 0.62rem;
  }

  .aba-seta {
    display: none;
  }

  .conteudo-topo {
    padding: 18px;
  }

  .icone-conteudo {
    width: 42px;
    height: 42px;
  }

  .conteudo-identidade h2 {
    font-size: 1.05rem;
  }

  .status-pill {
    padding: 6px 8px;
    font-size: 0.58rem;
  }

  .cupons-content {
    padding: 22px 18px 24px;
  }

  .cupons-intro {
    align-items: flex-start;
  }

  .cupons-intro h3 {
    font-size: 1.2rem;
  }

  .cupons-intro p {
    font-size: 0.72rem;
  }

  .cupom-card {
    padding: 16px;
    border-radius: 19px;
  }

  .cupom-info h3 {
    font-size: 1.3rem;
  }

  .cupom-info p {
    font-size: 0.74rem;
  }

  .placeholder {
    min-height: 390px;
    padding: 40px 20px;
  }

  .placeholder h3 {
    font-size: 1.55rem;
  }

  .placeholder p {
    max-width: 300px;
    font-size: 0.8rem;
  }
}

@media (max-width: 390px) {
  .header-decoration {
    display: none;
  }

  .header-copy h1 {
    font-size: 2.2rem;
  }

  .contador {
    display: none;
  }

  .aba {
    flex-basis: 155px;
  }

  .conteudo-topo {
    align-items: flex-start;
  }

  .status-pill {
    display: none;
  }

  .cupons-intro-icone {
    flex-basis: 43px;
    width: 43px;
    height: 43px;
  }

  .cupons-intro h3 {
    font-size: 1.08rem;
  }

  .cupom-codigo strong {
    font-size: 0.64rem;
  }
}
</style>
