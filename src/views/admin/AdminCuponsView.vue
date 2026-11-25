
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const token = localStorage.getItem("adminToken");

const cupons = ref([]);
const carregando = ref(true);
const erro = ref("");
const busca = ref("");
const filtroStatus = ref("todos");
const atualizandoId = ref(null);
const cupomSelecionado = ref(null);
const mensagem = ref("");
const tipoMensagem = ref("sucesso");

let temporizadorBusca = null;

const resumo = computed(() => ({
  total: cupons.value.length,
  disponiveis: cupons.value.filter(
    (cupom) => cupom.status === "disponivel"
  ).length,
  utilizados: cupons.value.filter(
    (cupom) => cupom.status === "utilizado"
  ).length,
}));

const cuponsFiltrados = computed(() => {
  return cupons.value.filter((cupom) => {
    const correspondeStatus =
      filtroStatus.value === "todos" ||
      cupom.status === filtroStatus.value;

    return correspondeStatus;
  });
});

function mostrarMensagem(texto, tipo = "sucesso") {
  mensagem.value = texto;
  tipoMensagem.value = tipo;

  window.setTimeout(() => {
    mensagem.value = "";
  }, 4000);
}

function formatarData(data) {
  if (!data) return "—";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) return "—";

  return dataObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obterNomeCliente(cupom) {
  return (
    cupom.cliente ||
    cupom.nome_cliente ||
    cupom.email ||
    `Cliente #${cupom.usuario_id || "—"}`
  );
}

function obterTipo(tipo) {
  const tipos = {
    desconto: "Desconto",
    produto_gratis: "Produto grátis",
    frete_gratis: "Frete grátis",
    recompensa: "Recompensa",
  };

  return tipos[tipo] || tipo || "Recompensa";
}

async function tratarNaoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefresh");
    localStorage.removeItem("adminUsername");

    await router.replace("/admin/login");

    return true;
  }

  return false;
}

async function carregarCupons() {
  if (!token) {
    await router.replace("/admin/login");
    return;
  }

  carregando.value = true;
  erro.value = "";

  try {
    const parametros = new URLSearchParams();

    if (busca.value.trim()) {
      parametros.set("busca", busca.value.trim());
    }

    const query = parametros.toString();

    const response = await fetch(
      `${API_URL}/fidelidade/admin/cupons/${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (await tratarNaoAutorizado(response)) return;

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.erro ||
        dados.detail ||
        "Não foi possível carregar os cupons."
      );
    }

    cupons.value = Array.isArray(dados.cupons)
      ? dados.cupons
      : [];
  } catch (error) {
    console.error("Erro ao carregar cupons:", error);
    erro.value =
      error.message || "Ocorreu um erro ao carregar os cupons.";
  } finally {
    carregando.value = false;
  }
}

function pesquisar() {
  window.clearTimeout(temporizadorBusca);

  temporizadorBusca = window.setTimeout(() => {
    carregarCupons();
  }, 350);
}

async function marcarComoUtilizado(cupom) {
  if (!cupom || cupom.status === "utilizado") return;

  cupomSelecionado.value = cupom;
}

async function confirmarUtilizacao() {
  const cupom = cupomSelecionado.value;

  if (!cupom || atualizandoId.value !== null) return;

  atualizandoId.value = cupom.id;

  try {
    const response = await fetch(
      `${API_URL}/fidelidade/admin/cupons/${cupom.id}/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "utilizado",
        }),
      }
    );

    if (await tratarNaoAutorizado(response)) return;

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.erro ||
        dados.detail ||
        "Não foi possível atualizar o cupom."
      );
    }

    mostrarMensagem(
      dados.mensagem || "Cupom marcado como utilizado!"
    );

    cupomSelecionado.value = null;

    await carregarCupons();
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    mostrarMensagem(
      error.message || "Erro ao atualizar o cupom.",
      "erro"
    );
  } finally {
    atualizandoId.value = null;
  }
}

function voltarDashboard() {
  router.push("/admin");
}

watch(busca, pesquisar);

onMounted(() => {
  carregarCupons();
});
</script>

<template>
  <main class="cupons-page">
    <div class="page-container">

      <!-- CABEÇALHO -->
      <header class="page-header">
        <div class="header-text">
          <button class="back-button" @click="voltarDashboard">
            <i class="fa-solid fa-arrow-left"></i>
            Voltar ao painel
          </button>

          <span class="eyebrow">
            <i class="fa-solid fa-ticket"></i>
            FIDELIDADE
          </span>

          <h1>Cupons dos clientes</h1>

          <p>
            Acompanhe as recompensas geradas e gerencie a utilização
            dos cupons da Padaria Martins.
          </p>
        </div>

        <div class="header-decoration">
          <div class="decoration-circle">
            <i class="fa-solid fa-gift"></i>
          </div>
        </div>
      </header>

      <!-- MENSAGEM -->
      <Transition name="message">
        <div
          v-if="mensagem"
          class="feedback-message"
          :class="tipoMensagem"
        >
          <i
            :class="
              tipoMensagem === 'sucesso'
                ? 'fa-solid fa-circle-check'
                : 'fa-solid fa-circle-exclamation'
            "
          ></i>
          {{ mensagem }}
        </div>
      </Transition>

      <!-- RESUMO -->
      <section class="stats-grid">
        <article class="stat-card">
          <div class="stat-icon total">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <div>
            <span class="stat-label">Total de cupons</span>
            <strong>{{ resumo.total }}</strong>
            <small>Cupons encontrados</small>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon available">
            <i class="fa-solid fa-clock"></i>
          </div>

          <div>
            <span class="stat-label">Disponíveis</span>
            <strong>{{ resumo.disponiveis }}</strong>
            <small>Aguardando utilização</small>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon used">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <div>
            <span class="stat-label">Utilizados</span>
            <strong>{{ resumo.utilizados }}</strong>
            <small>Recompensas utilizadas</small>
          </div>
        </article>
      </section>

      <!-- LISTAGEM -->
      <section class="content-card">

        <div class="section-heading">
          <div>
            <span class="section-eyebrow">GERENCIAMENTO</span>
            <h2>Carteira de cupons</h2>
            <p>Pesquise pelo código e acompanhe cada recompensa.</p>
          </div>

          <button
            class="refresh-button"
            @click="carregarCupons"
            :disabled="carregando"
            title="Atualizar lista"
          >
            <i
              class="fa-solid fa-rotate"
              :class="{ spinning: carregando }"
            ></i>
            Atualizar
          </button>
        </div>

        <!-- BUSCA E FILTROS -->
        <div class="toolbar">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>

            <input
              v-model="busca"
              type="search"
              placeholder="Buscar pelo código do cupom..."
            />

            <button
              v-if="busca"
              class="clear-search"
              @click="busca = ''"
              aria-label="Limpar busca"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="filter-buttons">
            <button
              :class="{ active: filtroStatus === 'todos' }"
              @click="filtroStatus = 'todos'"
            >
              Todos
            </button>

            <button
              :class="{ active: filtroStatus === 'disponivel' }"
              @click="filtroStatus = 'disponivel'"
            >
              Disponíveis
            </button>

            <button
              :class="{ active: filtroStatus === 'utilizado' }"
              @click="filtroStatus = 'utilizado'"
            >
              Utilizados
            </button>
          </div>
        </div>

        <!-- CARREGAMENTO -->
        <div v-if="carregando" class="loading-state">
          <div class="loader"></div>
          <p>Carregando cupons...</p>
        </div>

        <!-- ERRO -->
        <div v-else-if="erro" class="error-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Não foi possível carregar</h3>
          <p>{{ erro }}</p>

          <button @click="carregarCupons">
            Tentar novamente
          </button>
        </div>

        <!-- VAZIO -->
        <div
          v-else-if="cuponsFiltrados.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <h3>Nenhum cupom encontrado</h3>

          <p>
            {{
              busca
                ? "Não encontramos cupons com esse código."
                : "Ainda não existem cupons nesta categoria."
            }}
          </p>
        </div>

        <!-- TABELA DESKTOP -->
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CUPOM</th>
                <th>CLIENTE</th>
                <th>RECOMPENSA</th>
                <th>DATA DE CRIAÇÃO</th>
                <th>STATUS</th>
                <th class="action-column">AÇÃO</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="cupom in cuponsFiltrados"
                :key="cupom.id"
              >
                <td>
                  <div class="coupon-code">
                    <span class="coupon-icon">
                      <i class="fa-solid fa-ticket"></i>
                    </span>

                    <div>
                      <strong>{{ cupom.codigo }}</strong>
                      <small>ID #{{ cupom.id }}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="customer-info">
                    <strong>{{ obterNomeCliente(cupom) }}</strong>
                    <small>{{ cupom.email || "E-mail não informado" }}</small>
                  </div>
                </td>

                <td>
                  <div class="reward-info">
                    <strong>{{ cupom.titulo || "Recompensa" }}</strong>
                    <small>{{ obterTipo(cupom.tipo) }}</small>
                  </div>
                </td>

                <td>
                  <span class="date-text">
                    {{ formatarData(cupom.criado_em) }}
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="cupom.status"
                  >
                    <i
                      :class="
                        cupom.status === 'utilizado'
                          ? 'fa-solid fa-circle-check'
                          : 'fa-solid fa-clock'
                      "
                    ></i>

                    {{
                      cupom.status === "utilizado"
                        ? "Utilizado"
                        : "Disponível"
                    }}
                  </span>

                  <small
                    v-if="cupom.utilizado_em"
                    class="used-date"
                  >
                    {{ formatarData(cupom.utilizado_em) }}
                  </small>
                </td>

                <td class="action-column">
                  <button
                    v-if="cupom.status !== 'utilizado'"
                    class="use-button"
                    @click="marcarComoUtilizado(cupom)"
                    :disabled="atualizandoId === cupom.id"
                  >
                    <i class="fa-solid fa-check"></i>
                    Marcar utilizado
                  </button>

                  <span v-else class="already-used">
                    <i class="fa-solid fa-check-double"></i>
                    Já utilizado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer
          v-if="!carregando && !erro && cuponsFiltrados.length"
          class="table-footer"
        >
          <span>
            Exibindo
            <strong>{{ cuponsFiltrados.length }}</strong>
            de
            <strong>{{ cupons.length }}</strong>
            cupons
          </span>

          <span class="footer-brand">
            <i class="fa-solid fa-wheat-awn"></i>
            Padaria Martins
          </span>
        </footer>
      </section>
    </div>

    <!-- MODAL DE CONFIRMAÇÃO -->
    <Transition name="modal">
      <div
        v-if="cupomSelecionado"
        class="modal-overlay"
        @click.self="cupomSelecionado = null"
      >
        <section
          class="confirmation-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >
          <div class="modal-icon">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <span class="modal-eyebrow">CONFIRMAÇÃO</span>

          <h2 id="confirmation-title">
            Utilizar este cupom?
          </h2>

          <p>
            Você está prestes a marcar o cupom
            <strong>{{ cupomSelecionado.codigo }}</strong>
            como utilizado para
            <strong>{{ obterNomeCliente(cupomSelecionado) }}</strong>.
          </p>

          <div class="modal-warning">
            <i class="fa-solid fa-circle-info"></i>
            Essa alteração também será refletida na carteira do cliente.
          </div>

          <div class="modal-actions">
            <button
              class="cancel-button"
              @click="cupomSelecionado = null"
              :disabled="atualizandoId !== null"
            >
              Cancelar
            </button>

            <button
              class="confirm-button"
              @click="confirmarUtilizacao"
              :disabled="atualizandoId !== null"
            >
              <i
                v-if="atualizandoId === cupomSelecionado.id"
                class="fa-solid fa-spinner spinning"
              ></i>

              <i v-else class="fa-solid fa-check"></i>

              Confirmar utilização
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.cupons-page {
  min-height: 100vh;
  padding: 34px;
  background: #f8f6f2;
  color: #39251e;
}

.page-container {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.header-text {
  max-width: 720px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 25px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8c7569;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color .2s;
}

.back-button:hover {
  color: #5e3023;
}

.eyebrow,
.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #a27c49;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 10px 0;
  color: #4a2c21;
  font-family: Georgia, serif;
  font-size: clamp(30px, 4vw, 43px);
  font-weight: 700;
  letter-spacing: -.8px;
}

.page-header p {
  margin: 0;
  color: #927f74;
  font-size: 14px;
  line-height: 1.7;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 145px;
  height: 145px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #eee3d3;
}

.decoration-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  border: 1px solid #d6bd98;
  border-radius: 50%;
  background: #f8f1e6;
  color: #9a7041;
  font-size: 36px;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 22px;
  padding: 15px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.feedback-message.sucesso {
  background: #eaf3e9;
  color: #47754a;
}

.feedback-message.erro {
  background: #f9e9e5;
  color: #a54838;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 25px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 17px;
  min-height: 125px;
  padding: 22px;
  border: 1px solid #eee7dd;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 5px 18px rgba(74, 44, 33, .035);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 49px;
  height: 49px;
  flex-shrink: 0;
  border-radius: 14px;
  font-size: 19px;
}

.stat-icon.total {
  background: #f5eddf;
  color: #9b7442;
}

.stat-icon.available {
  background: #edf2e8;
  color: #6d8755;
}

.stat-icon.used {
  background: #f0e9e5;
  color: #8c6250;
}

.stat-label {
  display: block;
  margin-bottom: 5px;
  color: #927f74;
  font-size: 12px;
  font-weight: 600;
}

.stat-card strong {
  display: block;
  color: #4a2c21;
  font-size: 27px;
  line-height: 1.2;
}

.stat-card small {
  display: block;
  margin-top: 5px;
  color: #a99b91;
  font-size: 11px;
}

.content-card {
  overflow: hidden;
  border: 1px solid #eee7dd;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 6px 25px rgba(74, 44, 33, .035);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 27px 28px 22px;
}

.section-heading h2 {
  margin: 7px 0 5px;
  color: #4a2c21;
  font-family: Georgia, serif;
  font-size: 23px;
}

.section-heading p {
  margin: 0;
  color: #a09288;
  font-size: 12px;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px;
  border: 1px solid #e9dfd2;
  border-radius: 9px;
  background: #fff;
  color: #72523c;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.refresh-button:hover {
  border-color: #b89764;
  background: #fbf8f3;
}

.refresh-button:disabled {
  opacity: .55;
  cursor: wait;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 0 28px 22px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 11px;
  width: min(100%, 390px);
  height: 43px;
  padding: 0 13px;
  border: 1px solid #eae3da;
  border-radius: 10px;
  background: #fcfbf9;
  color: #a18d7e;
}

.search-box:focus-within {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, .1);
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #4a2c21;
  font: inherit;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #b4a69c;
}

.clear-search {
  border: 0;
  background: transparent;
  color: #a18d7e;
  cursor: pointer;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-buttons button {
  padding: 9px 12px;
  border: 1px solid #eee7dd;
  border-radius: 8px;
  background: #fff;
  color: #917e72;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.filter-buttons button:hover,
.filter-buttons button.active {
  border-color: #5e3023;
  background: #5e3023;
  color: #fff;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead {
  background: #faf8f5;
}

th {
  padding: 14px 17px;
  color: #a18e7e;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

td {
  padding: 17px;
  border-top: 1px solid #f1ece6;
  vertical-align: middle;
}

tbody tr {
  transition: background .2s;
}

tbody tr:hover {
  background: #fdfbf8;
}

.coupon-code,
.customer-info,
.reward-info {
  display: flex;
  align-items: center;
  gap: 11px;
}

.coupon-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f4ecdf;
  color: #a47d49;
}

.coupon-code strong,
.customer-info strong,
.reward-info strong {
  display: block;
  color: #52392e;
  font-size: 12px;
  font-weight: 800;
}

.coupon-code small,
.customer-info small,
.reward-info small {
  display: block;
  margin-top: 5px;
  color: #a99b91;
  font-size: 10px;
}

.customer-info,
.reward-info {
  display: block;
}

.date-text {
  color: #87766b;
  font-size: 11px;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge.disponivel {
  background: #edf3e8;
  color: #62804e;
}

.status-badge.utilizado {
  background: #f1eae6;
  color: #88604e;
}

.used-date {
  display: block;
  margin-top: 5px;
  color: #a99b91;
  font-size: 9px;
}

.action-column {
  white-space: nowrap;
}

.use-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  border: 0;
  border-radius: 8px;
  background: #5e3023;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.use-button:hover {
  background: #794a37;
  transform: translateY(-1px);
}

.use-button:disabled {
  opacity: .5;
  cursor: wait;
}

.already-used {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #729065;
  font-size: 10px;
  font-weight: 800;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 17px 27px;
  border-top: 1px solid #f1ece6;
  color: #a09288;
  font-size: 11px;
}

.table-footer strong {
  color: #624535;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #a27c49;
  font-weight: 700;
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 270px;
  padding: 30px;
  text-align: center;
}

.loading-state p,
.empty-state p,
.error-state p {
  color: #a09288;
  font-size: 13px;
}

.loader {
  width: 35px;
  height: 35px;
  border: 3px solid #eee4d8;
  border-top-color: #9b7442;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  margin-bottom: 13px;
  border-radius: 20px;
  background: #f5eddf;
  color: #a47d49;
  font-size: 24px;
}

.empty-state h3,
.error-state h3 {
  margin: 5px 0;
  color: #54382b;
  font-family: Georgia, serif;
  font-size: 19px;
}

.error-state > i {
  color: #b35b47;
  font-size: 27px;
}

.error-state button {
  margin-top: 10px;
  padding: 10px 17px;
  border: 0;
  border-radius: 8px;
  background: #5e3023;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(39, 26, 20, .55);
  backdrop-filter: blur(4px);
}

.confirmation-modal {
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border: 1px solid #eee4d8;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 20px 70px rgba(0, 0, 0, .18);
  text-align: center;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin: 0 auto 17px;
  border-radius: 17px;
  background: #f5eddf;
  color: #9b7442;
  font-size: 23px;
}

.modal-eyebrow {
  color: #a27c49;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
}

.confirmation-modal h2 {
  margin: 9px 0;
  color: #4a2c21;
  font-family: Georgia, serif;
  font-size: 25px;
}

.confirmation-modal > p {
  color: #8e7b70;
  font-size: 13px;
  line-height: 1.7;
}

.confirmation-modal > p strong {
  color: #5e3023;
}

.modal-warning {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 20px 0;
  padding: 13px;
  border-radius: 10px;
  background: #f8f4ed;
  color: #92734d;
  font-size: 11px;
  line-height: 1.6;
  text-align: left;
}

.modal-warning i {
  margin-top: 2px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
  min-height: 43px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #e9dfd2;
  background: #fff;
  color: #806b5d;
}

.confirm-button {
  border: 0;
  background: #5e3023;
  color: #fff;
}

.confirm-button:disabled,
.cancel-button:disabled {
  opacity: .55;
  cursor: wait;
}

.spinning {
  animation: spin .8s linear infinite;
}

.message-enter-active,
.message-leave-active,
.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s, transform .2s;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RESPONSIVIDADE */
@media (max-width: 1000px) {
  .cupons-page {
    padding: 25px;
  }

  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }
}

@media (max-width: 700px) {
  .cupons-page {
    padding: 20px 14px 35px;
  }

  .page-header {
    margin-bottom: 22px;
  }

  .header-decoration {
    width: 75px;
    height: 75px;
  }

  .decoration-circle {
    width: 52px;
    height: 52px;
    font-size: 21px;
  }

  .page-header h1 {
    font-size: 29px;
  }

  .page-header p {
    font-size: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    min-height: 95px;
    padding: 15px 18px;
  }

  .stat-card strong {
    font-size: 23px;
  }

  .section-heading {
    align-items: flex-start;
    padding: 22px 17px 18px;
  }

  .section-heading h2 {
    font-size: 20px;
  }

  .section-heading p {
    max-width: 230px;
    line-height: 1.6;
  }

  .refresh-button {
    padding: 10px;
    font-size: 0;
  }

  .refresh-button i {
    font-size: 14px;
  }

  .toolbar {
    padding: 0 17px 18px;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-buttons button {
    flex: 1;
    padding: 9px 6px;
    font-size: 10px;
  }

  .table-wrapper {
    overflow: visible;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody {
    padding: 0 12px;
  }

  tbody tr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px 10px;
    margin-bottom: 12px;
    padding: 15px;
    border: 1px solid #eee7dd;
    border-radius: 12px;
    background: #fff;
  }

  td {
    padding: 0;
    border: 0;
  }

  td:first-child {
    grid-column: 1 / -1;
    padding-bottom: 11px;
    border-bottom: 1px solid #f1ece6;
  }

  td:nth-child(2),
  td:nth-child(3) {
    grid-column: 1 / -1;
  }

  td:nth-child(4),
  td:nth-child(5) {
    grid-column: auto;
  }

  td:last-child {
    grid-column: 1 / -1;
    padding-top: 9px;
    border-top: 1px solid #f1ece6;
  }

  td:nth-child(4)::before {
    display: block;
    margin-bottom: 5px;
    color: #a18e7e;
    content: "CRIADO EM";
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  td:nth-child(5)::before {
    display: block;
    margin-bottom: 5px;
    color: #a18e7e;
    content: "STATUS";
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .use-button {
    justify-content: center;
    width: 100%;
    min-height: 38px;
  }

  .table-footer {
    padding: 15px;
    font-size: 10px;
  }

  .footer-brand {
    display: none;
  }

  .confirmation-modal {
    padding: 25px 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
</style>
