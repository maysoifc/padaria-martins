<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const adminUsername = ref(
  localStorage.getItem("adminUsername") || "Administrador"
);

const carregando = ref(true);
const erro = ref("");

const resumo = ref({
  produtos: 0,
  categorias: 0,
  encomendas: 0,
  usuarios: 0
});

const grafico = ref([]);
const ultimasEncomendas = ref([]);

const primeiroNome = computed(() => {
  return adminUsername.value.trim().split(/\s+/)[0] || "Administrador";
});

const maiorValorGrafico = computed(() => {
  return Math.max(
    1,
    ...grafico.value.map(item => Number(item.encomendas || 0))
  );
});

const pontosGrafico = computed(() => {
  const largura = 600;
  const altura = 210;
  const margemX = 28;
  const margemY = 20;
  const areaAltura = altura - margemY * 2;
  const areaLargura = largura - margemX * 2;

  if (!grafico.value.length) return "";

  return grafico.value.map((item, index) => {
    const x = margemX + (
      grafico.value.length === 1
        ? areaLargura / 2
        : index * areaLargura / (grafico.value.length - 1)
    );

    const y = altura - margemY -
      (Number(item.encomendas || 0) / maiorValorGrafico.value) * areaAltura;

    return `${x},${y}`;
  }).join(" ");
});

const areaGrafico = computed(() => {
  if (!pontosGrafico.value) return "";

  const pontos = pontosGrafico.value.split(" ");
  const primeiro = pontos[0].split(",");
  const ultimo = pontos[pontos.length - 1].split(",");

  return `${primeiro[0]},190 ${pontosGrafico.value} ${ultimo[0]},190`;
});

const formatarMoeda = valor => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

const formatarData = data => {
  if (!data) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(data));
};

const carregarDashboard = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const resposta = await fetch(`${API_URL}/admin/dashboard/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (resposta.status === 401 || resposta.status === 403) {
      erro.value = "Sua sessão administrativa expirou ou não tem permissão.";
      return;
    }

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os dados do dashboard.");
    }

    const dados = await resposta.json();

    resumo.value = dados.resumo || resumo.value;
    grafico.value = dados.grafico || [];
    ultimasEncomendas.value = dados.ultimas_encomendas || [];

  } catch (error) {
    erro.value = error.message || "Erro ao conectar com o servidor.";
  } finally {
    carregando.value = false;
  }
};

const indicadores = computed(() => [
  {
    id: "produtos",
    titulo: "Produtos",
    descricao: "Itens cadastrados no catálogo",
    valor: resumo.value.produtos,
    icone: "fa-bread-slice",
    cor: "terracota",
    rota: "/admin/produtos"
  },
  {
    id: "encomendas",
    titulo: "Encomendas",
    descricao: "Pedidos registrados",
    valor: resumo.value.encomendas,
    icone: "fa-receipt",
    cor: "dourado",
    rota: "/admin/encomendas"
  },
  {
    id: "usuarios",
    titulo: "Usuários",
    descricao: "Contas cadastradas",
    valor: resumo.value.usuarios,
    icone: "fa-users",
    cor: "oliva",
    rota: "/admin/usuarios"
  }
]);

const navegar = rota => router.push(rota);

onMounted(carregarDashboard);
</script>

<template>
  <div class="dashboard">

    <section class="hero-admin">
      <div class="hero-textura"></div>
      <div class="hero-circulo hero-circulo-1"></div>
      <div class="hero-circulo hero-circulo-2"></div>

      <div class="hero-conteudo">
        <div class="hero-esquerda">
          <div class="status-admin">
            <span class="status-ponto"></span>
            PAINEL ADMINISTRATIVO
          </div>

          <p class="saudacao">
            Bem-vindo, {{ primeiroNome }}.
          </p>

          <h2>
            A tradição de hoje,
            <em>o sucesso de amanhã.</em>
          </h2>

          <p class="hero-descricao">
            Sua padaria, sua história, sua gestão.
            Tudo começa com cuidado em cada detalhe.
          </p>

          <button
            type="button"
            class="hero-botao"
            @click="navegar('/admin/produtos')"
          >
            Gerenciar cardápio
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <div class="hero-direita" aria-hidden="true">
          <div class="selo-circular selo-externo"></div>
          <div class="selo-circular selo-meio"></div>
          <div class="selo-circular selo-interno"></div>

          <div class="simbolo-padaria">
            <i class="fa-solid fa-bread-slice"></i>
          </div>

          <span class="estrela estrela-1">✦</span>
          <span class="estrela estrela-2">✧</span>

          <div class="etiqueta-artesanal">
            <span class="etiqueta-icone">
              <i class="fa-solid fa-heart"></i>
            </span>
            <span>
              <strong>Padaria Martins</strong>
              <small>Feito com carinho</small>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="secao-visao">
      <div class="secao-cabecalho">
        <div>
          <span class="eyebrow">VISÃO GERAL</span>
          <h2>Seu negócio em um só lugar.</h2>
          <p>Indicadores atualizados diretamente do banco de dados.</p>
        </div>

        <button
          type="button"
          class="btn-atualizar"
          :disabled="carregando"
          @click="carregarDashboard"
        >
          <i
            class="fa-solid fa-rotate"
            :class="{ girando: carregando }"
          ></i>
          Atualizar
        </button>
      </div>

      <div v-if="erro" class="erro-dashboard">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ erro }}</span>
        <button type="button" @click="carregarDashboard">
          Tentar novamente
        </button>
      </div>

      <div class="metricas">
        <button
          v-for="item in indicadores"
          :key="item.id"
          type="button"
          class="metrica"
          :class="`metrica-${item.cor}`"
          @click="navegar(item.rota)"
        >
          <div class="metrica-topo">
            <span class="metrica-icone">
              <i :class="`fa-solid ${item.icone}`"></i>
            </span>
            <span class="metrica-detalhe">TOTAL</span>
          </div>

          <div class="metrica-conteudo">
            <template v-if="carregando">
              <span class="valor-carregando"></span>
            </template>
            <template v-else>
              <strong>{{ item.valor }}</strong>
            </template>

            <h3>{{ item.titulo }}</h3>
            <p>{{ item.descricao }}</p>
          </div>

          <div class="metrica-rodape">
            <span>Acessar área</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </div>
        </button>
      </div>
    </section>

    <section class="painel-grafico">
      <div class="grafico-cabecalho">
        <div>
          <span class="eyebrow">DESEMPENHO</span>
          <h2>Movimento de encomendas</h2>
          <p>Quantidade de compras registradas nos últimos seis meses.</p>
        </div>

        <span class="grafico-legenda">
          <i></i>
          Encomendas
        </span>
      </div>

      <div v-if="carregando" class="grafico-carregando">
        Carregando dados do gráfico...
      </div>

      <div v-else-if="!grafico.length" class="grafico-vazio">
        Ainda não há dados suficientes para exibir o gráfico.
      </div>

      <div v-else class="grafico-area">
        <svg
          class="grafico-svg"
          viewBox="0 0 600 210"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de encomendas dos últimos seis meses"
        >
          <line
            v-for="linha in [20, 62, 104, 146, 190]"
            :key="linha"
            x1="28"
            :y1="linha"
            x2="572"
            :y2="linha"
            class="linha-grade"
          />

          <polygon
            :points="areaGrafico"
            class="grafico-preenchimento"
          />

          <polyline
            :points="pontosGrafico"
            class="grafico-linha"
          />

          <circle
            v-for="(ponto, index) in pontosGrafico.split(' ')"
            :key="index"
            :cx="Number(ponto.split(',')[0])"
            :cy="Number(ponto.split(',')[1])"
            r="5"
            class="grafico-ponto"
          />
        </svg>

        <div class="grafico-meses">
          <span v-for="item in grafico" :key="item.mes">
            {{ item.mes }}
          </span>
        </div>

        <div class="grafico-resumo">
          <div>
            <span>Total no período</span>
            <strong>
              {{ grafico.reduce((total, item) => total + Number(item.encomendas || 0), 0) }}
              encomendas
            </strong>
          </div>

          <div>
            <span>Faturamento no período</span>
            <strong>
              {{ formatarMoeda(grafico.reduce((total, item) => total + Number(item.faturamento || 0), 0)) }}
            </strong>
          </div>
        </div>
      </div>
    </section>

    <section class="ultimas-section">
      <div class="ultimas-cabecalho">
        <div>
          <span class="eyebrow">ACOMPANHAMENTO</span>
          <h2>Últimas encomendas</h2>
          <p>Os cinco pedidos mais recentes registrados.</p>
        </div>

        <button
          type="button"
          class="link-encomendas"
          @click="navegar('/admin/encomendas')"
        >
          Ver todas
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div v-if="carregando" class="estado-lista">
        Carregando encomendas...
      </div>

      <div
        v-else-if="!ultimasEncomendas.length"
        class="estado-lista"
      >
        <i class="fa-regular fa-clipboard"></i>
        <strong>Nenhuma encomenda registrada ainda.</strong>
        <span>Quando uma compra for realizada, ela aparecerá aqui.</span>
      </div>

      <div v-else class="tabela-encomendas">
        <div
          v-for="compra in ultimasEncomendas"
          :key="compra.id"
          class="encomenda-linha"
        >
          <div class="encomenda-icone">
            <i class="fa-solid fa-receipt"></i>
          </div>

          <div class="encomenda-cliente">
            <strong>{{ compra.cliente || "Cliente" }}</strong>
            <small>Pedido #{{ compra.id }} · {{ formatarData(compra.data) }}</small>
          </div>

          <div class="encomenda-pagamento">
            {{ compra.pagamento || "Não informado" }}
          </div>

          <strong class="encomenda-total">
            {{ formatarMoeda(compra.total) }}
          </strong>
        </div>
      </div>
    </section>

    <footer class="dashboard-footer">
      <span></span>
      <div>
        <i class="fa-solid fa-heart"></i>
        PADARIA MARTINS
      </div>
      <span></span>
    </footer>

  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap");

* {
  box-sizing: border-box;
}

.dashboard {
  --cafe: #5e3023;
  --dourado: #b89764;
  --texto: #493327;
  --suave: #978677;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding-bottom: 20px;
  color: var(--texto);
  font-family: "DM Sans", sans-serif;
}

.hero-admin {
  position: relative;
  isolation: isolate;
  min-height: 330px;
  padding: 30px 34px 0;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at 82% 35%, rgba(205,177,126,.18), transparent 27%),
    linear-gradient(118deg, #38251c, #543426 57%, #70482f);
  color: #fffaf3;
  box-shadow: 0 22px 55px rgba(65,39,25,.12);
}

.hero-textura {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: radial-gradient(rgba(255,245,225,.5) .7px, transparent .7px);
  background-size: 15px 15px;
  opacity: .1;
}

.hero-circulo {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(230,204,159,.11);
  border-radius: 50%;
}

.hero-circulo-1 {
  width: 420px;
  height: 420px;
  top: -210px;
  right: 3%;
}

.hero-circulo-2 {
  width: 320px;
  height: 320px;
  top: -160px;
  right: 7%;
}

.hero-conteudo {
  display: flex;
  min-height: 275px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-esquerda {
  position: relative;
  z-index: 2;
  max-width: 690px;
  padding-bottom: 25px;
}

.status-admin {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  border: 1px solid rgba(231,211,177,.2);
  border-radius: 50px;
  background: rgba(255,255,255,.055);
  color: #e4c998;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.status-ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d7c08e;
}

.saudacao {
  margin: 22px 0 10px;
  color: #ddc7a8;
  font-size: .86rem;
}

.hero-esquerda h2 {
  margin: 0;
  color: #fffaf3;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  font-weight: 500;
  line-height: 1.12;
}

.hero-esquerda h2 em {
  display: block;
  color: #dfc28d;
  font-weight: 500;
}

.hero-descricao {
  max-width: 480px;
  margin: 16px 0 22px;
  color: rgba(255,250,243,.7);
  font-size: .84rem;
  line-height: 1.75;
}

.hero-botao {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 18px;
  padding: 0 19px;
  border: 0;
  border-radius: 13px;
  background: #e1c98f;
  color: #442c1e;
  font-size: .76rem;
  font-weight: 800;
  cursor: pointer;
  transition: .25s ease;
}

.hero-botao:hover {
  transform: translateY(-3px);
  background: #f0d6a5;
}

.hero-direita {
  position: relative;
  display: flex;
  width: 280px;
  min-width: 230px;
  height: 250px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.selo-circular {
  position: absolute;
  border: 1px solid rgba(225,201,143,.18);
  border-radius: 50%;
}

.selo-externo {
  width: 245px;
  height: 245px;
}

.selo-meio {
  width: 205px;
  height: 205px;
  border-style: dashed;
}

.selo-interno {
  width: 165px;
  height: 165px;
  border: 8px solid rgba(225,201,143,.15);
  background: linear-gradient(145deg, #d4aa70, #986943);
  box-shadow: 0 20px 40px rgba(25,14,8,.18);
}

.simbolo-padaria {
  position: relative;
  z-index: 2;
  display: grid;
  width: 118px;
  height: 118px;
  place-items: center;
  color: #fff2d9;
  font-size: 3.1rem;
}

.estrela {
  position: absolute;
  color: #e1c98f;
}

.estrela-1 {
  top: 26px;
  left: 17px;
}

.estrela-2 {
  right: 14px;
  bottom: 51px;
  font-size: 1.5rem;
}

.etiqueta-artesanal {
  position: absolute;
  right: -5px;
  bottom: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border-radius: 15px;
  background: rgba(45,28,19,.85);
}

.etiqueta-icone {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: rgba(225,201,143,.16);
  color: #e1c98f;
}

.etiqueta-artesanal > span:last-child {
  display: grid;
  gap: 4px;
}

.etiqueta-artesanal strong {
  font-size: .66rem;
}

.etiqueta-artesanal small {
  color: rgba(255,250,243,.6);
  font-size: .58rem;
}

.secao-visao {
  margin-top: 40px;
}

.secao-cabecalho,
.grafico-cabecalho,
.ultimas-cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 19px;
}

.eyebrow {
  display: block;
  color: #b89764;
  font-size: .62rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.secao-cabecalho h2,
.grafico-cabecalho h2,
.ultimas-cabecalho h2 {
  margin: 8px 0 7px;
  color: #503427;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(1.55rem, 2.6vw, 2.1rem);
  font-weight: 500;
}

.secao-cabecalho p,
.grafico-cabecalho p,
.ultimas-cabecalho p {
  margin: 0;
  color: #988777;
  font-size: .8rem;
}

.btn-atualizar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border: 1px solid #eadfce;
  border-radius: 12px;
  background: #fff;
  color: #805e3e;
  font-size: .7rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-atualizar:disabled {
  opacity: .6;
  cursor: wait;
}

.girando {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.erro-dashboard {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 13px 15px;
  border: 1px solid #e8c7bd;
  border-radius: 13px;
  background: #fff5f1;
  color: #944a3c;
  font-size: .75rem;
}

.erro-dashboard button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #743629;
  font-weight: 800;
  cursor: pointer;
}

.metricas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metrica {
  display: flex;
  min-width: 0;
  min-height: 190px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #eee4d8;
  border-radius: 20px;
  background: rgba(255,255,255,.88);
  color: var(--texto);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(65,43,28,.035);
  transition: .25s ease;
}

.metrica:hover {
  transform: translateY(-4px);
  border-color: #ddc9ad;
  box-shadow: 0 16px 35px rgba(65,43,28,.08);
}

.metrica-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metrica-icone {
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border-radius: 14px;
  font-size: 1rem;
}

.metrica-terracota .metrica-icone {
  background: #f3e5dc;
  color: #8b4c38;
}

.metrica-dourado .metrica-icone {
  background: #f5ecda;
  color: #a9824e;
}

.metrica-oliva .metrica-icone {
  background: #eaf0e5;
  color: #6d805f;
}

.metrica-detalhe {
  color: #c1ad94;
  font-size: .55rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.metrica-conteudo {
  flex: 1;
  padding: 15px 0;
}

.metrica-conteudo > strong {
  display: block;
  color: #53392a;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 2rem;
}

.metrica-conteudo h3 {
  margin: 5px 0;
  color: #53392a;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.15rem;
}

.metrica-conteudo p {
  margin: 0;
  color: #998979;
  font-size: .68rem;
}

.valor-carregando {
  display: block;
  width: 75px;
  height: 31px;
  border-radius: 8px;
  background: #f0e9df;
  animation: pulsar 1s ease infinite alternate;
}

@keyframes pulsar {
  to { opacity: .45; }
}

.metrica-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f1e9df;
  color: #9d8261;
  font-size: .64rem;
  font-weight: 700;
}

.painel-grafico,
.ultimas-section {
  margin-top: 30px;
  padding: 25px;
  border: 1px solid #eee4d8;
  border-radius: 23px;
  background: rgba(255,255,255,.84);
  box-shadow: 0 10px 32px rgba(65,43,28,.035);
}

.grafico-cabecalho {
  align-items: center;
}

.grafico-cabecalho h2,
.ultimas-cabecalho h2 {
  font-size: 1.6rem;
}

.grafico-legenda {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8d7965;
  font-size: .68rem;
}

.grafico-legenda i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #a8794c;
}

.grafico-area {
  padding-top: 14px;
}

.grafico-svg {
  display: block;
  width: 100%;
  height: 220px;
  overflow: visible;
}

.linha-grade {
  stroke: #eee7de;
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.grafico-preenchimento {
  fill: rgba(184,151,100,.15);
}

.grafico-linha {
  fill: none;
  stroke: #a8794c;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.grafico-ponto {
  fill: #fff;
  stroke: #a8794c;
  stroke-width: 3;
}

.grafico-meses {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-top: 8px;
  color: #9a8877;
  text-align: center;
  font-size: .65rem;
}

.grafico-resumo {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 22px;
  padding-top: 17px;
  border-top: 1px solid #f0e8de;
}

.grafico-resumo div {
  display: grid;
  gap: 5px;
}

.grafico-resumo span {
  color: #a18f7d;
  font-size: .63rem;
}

.grafico-resumo strong {
  color: #5e3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.15rem;
}

.grafico-vazio,
.grafico-carregando,
.estado-lista {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 9px;
  color: #9a8877;
  text-align: center;
  font-size: .78rem;
}

.ultimas-section {
  margin-top: 25px;
}

.ultimas-cabecalho {
  align-items: center;
}

.link-encomendas {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #8a6746;
  font-size: .7rem;
  font-weight: 800;
  cursor: pointer;
}

.tabela-encomendas {
  display: flex;
  flex-direction: column;
}

.encomenda-linha {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 0;
  border-top: 1px solid #f0e8de;
}

.encomenda-icone {
  display: grid;
  width: 41px;
  height: 41px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  background: #f6eee2;
  color: #a9824e;
}

.encomenda-cliente {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 5px;
}

.encomenda-cliente strong {
  overflow: hidden;
  color: #53392a;
  font-size: .76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encomenda-cliente small {
  color: #9d8c7b;
  font-size: .62rem;
}

.encomenda-pagamento {
  color: #9a8877;
  font-size: .65rem;
  text-transform: capitalize;
}

.encomenda-total {
  color: #5e3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: .95rem;
  white-space: nowrap;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 27px 0 5px;
  color: #b09c86;
}

.dashboard-footer > span {
  width: 45px;
  height: 1px;
  background: #e7dbcc;
}

.dashboard-footer div {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .53rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.dashboard-footer i {
  color: #b89764;
}

.dashboard button:focus-visible {
  outline: 3px solid rgba(184,151,100,.65);
  outline-offset: 3px;
}

@media (max-width: 900px) {
  .hero-direita {
    transform: scale(.85);
    margin-right: -20px;
  }
}

@media (max-width: 760px) {
  .hero-admin {
    min-height: auto;
    padding: 23px 20px 10px;
    border-radius: 21px;
  }

  .hero-conteudo {
    min-height: 0;
  }

  .hero-esquerda {
    padding-bottom: 18px;
  }

  .hero-direita {
    display: none;
  }

  .hero-esquerda h2 {
    font-size: clamp(1.9rem, 6vw, 2.6rem);
  }

  .metricas {
    grid-template-columns: 1fr;
    gap: 11px;
  }

  .metrica {
    min-height: 0;
  }

  .painel-grafico,
  .ultimas-section {
    padding: 19px 15px;
  }
}

@media (max-width: 480px) {
  .hero-admin {
    padding: 20px 16px 8px;
  }

  .hero-esquerda h2 {
    font-size: 2rem;
  }

  .hero-descricao {
    font-size: .74rem;
  }

  .hero-botao {
    width: 100%;
    justify-content: space-between;
  }

  .secao-cabecalho,
  .grafico-cabecalho,
  .ultimas-cabecalho {
    align-items: flex-start;
  }

  .secao-cabecalho h2,
  .grafico-cabecalho h2,
  .ultimas-cabecalho h2 {
    font-size: 1.4rem;
  }

  .btn-atualizar {
    padding: 9px;
    font-size: 0;
  }

  .btn-atualizar i {
    font-size: .8rem;
  }

  .grafico-svg {
    height: 170px;
  }

  .grafico-resumo {
    gap: 18px;
  }

  .encomenda-linha {
    gap: 9px;
  }

  .encomenda-pagamento {
    display: none;
  }

  .encomenda-total {
    font-size: .82rem;
  }

  .dashboard-footer > span {
    width: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard *,
  .dashboard *::before,
  .dashboard *::after {
    animation: none !important;
    transition-duration: .01ms !important;
  }
}
</style>
