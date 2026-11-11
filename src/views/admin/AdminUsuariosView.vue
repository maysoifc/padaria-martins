<script setup>
import { computed, onMounted, ref } from "vue";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const usuarios = ref([]);
const carregando = ref(true);
const erro = ref("");
const busca = ref("");
const filtroStatus = ref("todos");
const usuarioSelecionado = ref(null);

const obterLista = (dados) => {
  if (Array.isArray(dados)) return dados;
  return dados?.results || dados?.usuarios || [];
};

const nomeUsuario = (usuario) => {
  return (
    usuario.username ||
    usuario.nome ||
    usuario.first_name ||
    usuario.email?.split("@")[0] ||
    "Usuário"
  );
};

const iniciaisUsuario = (usuario) => {
  const nome = nomeUsuario(usuario).trim();

  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
};

const usuarioAtivo = (usuario) => {
  return usuario.is_active !== false && usuario.ativo !== false;
};

const formatarData = (data) => {
  if (!data) return "Não informado";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informado";
  }

  return dataFormatada.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const usuariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

  return usuarios.value.filter((usuario) => {
    const nome = nomeUsuario(usuario).toLocaleLowerCase("pt-BR");
    const email = String(usuario.email || "").toLocaleLowerCase("pt-BR");

    const correspondeBusca =
      nome.includes(termo) || email.includes(termo);

    const correspondeStatus =
      filtroStatus.value === "todos" ||
      (filtroStatus.value === "ativos" && usuarioAtivo(usuario)) ||
      (filtroStatus.value === "inativos" && !usuarioAtivo(usuario));

    return correspondeBusca && correspondeStatus;
  });
});

const totalAtivos = computed(() => {
  return usuarios.value.filter(usuarioAtivo).length;
});

const totalInativos = computed(() => {
  return usuarios.value.filter((usuario) => !usuarioAtivo(usuario)).length;
});

const carregarUsuarios = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    const token = localStorage.getItem("adminToken");

    const resposta = await fetch(`${API_URL}/usuarios/`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    });

    if (!resposta.ok) {
      if (resposta.status === 401 || resposta.status === 403) {
        throw new Error(
          "Você não tem autorização para consultar os usuários. Verifique o acesso administrativo da API."
        );
      }

      if (resposta.status === 404) {
        throw new Error(
          "O endpoint /api/usuarios/ não foi encontrado. Confira a rota de listagem de usuários no Django."
        );
      }

      throw new Error(
        `Não foi possível carregar os usuários. Código ${resposta.status}.`
      );
    }

    const dados = await resposta.json();
    usuarios.value = obterLista(dados);
  } catch (error) {
    erro.value =
      error.message || "Ocorreu um erro ao carregar os usuários.";
  } finally {
    carregando.value = false;
  }
};

const abrirDetalhes = (usuario) => {
  usuarioSelecionado.value = usuario;
};

const fecharDetalhes = () => {
  usuarioSelecionado.value = null;
};

onMounted(carregarUsuarios);
</script>

<template>
  <div class="usuarios-page">
    <header class="page-header">
      <div class="header-copy">
        <span class="eyebrow">GESTÃO ADMINISTRATIVA</span>

        <h1>
          Nossos <em>usuários</em>
        </h1>

        <p>
          Acompanhe as contas cadastradas e gerencie os acessos da sua padaria.
        </p>
      </div>

      <button
        type="button"
        class="btn-atualizar"
        :disabled="carregando"
        @click="carregarUsuarios"
      >
        <i
          class="fa-solid fa-rotate"
          :class="{ girando: carregando }"
        ></i>
        Atualizar lista
      </button>
    </header>

    <section class="resumo-grid">
      <article class="resumo-card">
        <div class="resumo-icone">
          <i class="fa-solid fa-users"></i>
        </div>

        <div class="resumo-texto">
          <span>Total de usuários</span>
          <strong>{{ usuarios.length }}</strong>
          <small>Contas cadastradas</small>
        </div>

        <span class="resumo-detalhe">01</span>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone ativo-icone">
          <i class="fa-solid fa-user-check"></i>
        </div>

        <div class="resumo-texto">
          <span>Contas ativas</span>
          <strong>{{ totalAtivos }}</strong>
          <small>Acessos habilitados</small>
        </div>

        <span class="resumo-detalhe">02</span>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone inativo-icone">
          <i class="fa-solid fa-user-slash"></i>
        </div>

        <div class="resumo-texto">
          <span>Contas inativas</span>
          <strong>{{ totalInativos }}</strong>
          <small>Acessos desabilitados</small>
        </div>

        <span class="resumo-detalhe">03</span>
      </article>
    </section>

    <section class="usuarios-panel">
      <div class="panel-header">
        <div>
          <span class="secao-label">COMUNIDADE</span>
          <h2>Usuários cadastrados</h2>
          <p>Consulte os dados das contas registradas.</p>
        </div>

        <span class="contador">
          {{ usuariosFiltrados.length }}
          {{ usuariosFiltrados.length === 1 ? "usuário" : "usuários" }}
        </span>
      </div>

      <div class="filtros">
        <label class="campo-busca">
          <i class="fa-solid fa-magnifying-glass"></i>

          <input
            v-model="busca"
            type="search"
            placeholder="Buscar por nome ou e-mail..."
          />

          <span class="atalho-busca">BUSCAR</span>
        </label>

        <label class="campo-status">
          <i class="fa-solid fa-filter"></i>

          <select v-model="filtroStatus">
            <option value="todos">Todos os usuários</option>
            <option value="ativos">Somente ativos</option>
            <option value="inativos">Somente inativos</option>
          </select>
        </label>
      </div>

      <div v-if="erro" class="mensagem-erro">
        <span class="erro-icone">
          <i class="fa-solid fa-circle-exclamation"></i>
        </span>

        <div>
          <strong>Não foi possível carregar a lista</strong>
          <p>{{ erro }}</p>

          <button type="button" @click="carregarUsuarios">
            Tentar novamente
          </button>
        </div>
      </div>

      <div v-else-if="carregando" class="estado-vazio">
        <i class="fa-solid fa-spinner girando"></i>
        <h3>Carregando usuários...</h3>
        <p>Estamos buscando as contas cadastradas.</p>
      </div>

      <div
        v-else-if="usuariosFiltrados.length"
        class="tabela-wrapper"
      >
        <table class="usuarios-tabela">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Cadastro</th>
              <th>Status</th>
              <th class="coluna-acao">Detalhes</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.id ?? usuario.idUsuario ?? usuario.email"
            >
              <td>
                <div class="usuario-identidade">
                  <div class="avatar">
                    <img
                      v-if="usuario.foto_perfil"
                      :src="usuario.foto_perfil"
                      :alt="`Foto de ${nomeUsuario(usuario)}`"
                      @error="$event.target.style.display = 'none'"
                    />

                    <span>{{ iniciaisUsuario(usuario) }}</span>
                  </div>

                  <div class="usuario-nome">
                    <strong>{{ nomeUsuario(usuario) }}</strong>
                    <small>
                      {{
                        usuario.is_superuser
                          ? "Administrador"
                          : "Cliente"
                      }}
                    </small>
                  </div>
                </div>
              </td>

              <td>
                <span class="email-texto">
                  {{ usuario.email || "Não informado" }}
                </span>
              </td>

              <td>
                <span class="data-texto">
                  {{ formatarData(usuario.date_joined || usuario.criado_em) }}
                </span>
              </td>

              <td>
                <span
                  class="status"
                  :class="usuarioAtivo(usuario) ? 'status-ativo' : 'status-inativo'"
                >
                  <span class="status-ponto"></span>
                  {{ usuarioAtivo(usuario) ? "Ativo" : "Inativo" }}
                </span>
              </td>

              <td class="coluna-acao">
                <button
                  type="button"
                  class="btn-detalhes"
                  aria-label="Ver detalhes do usuário"
                  title="Ver detalhes"
                  @click="abrirDetalhes(usuario)"
                >
                  <i class="fa-regular fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="estado-vazio">
        <div class="estado-icone">
          <i class="fa-solid fa-users"></i>
        </div>

        <h3>
          {{
            busca || filtroStatus !== "todos"
              ? "Nenhum usuário encontrado"
              : "Ainda não há usuários cadastrados"
          }}
        </h3>

        <p>
          {{
            busca || filtroStatus !== "todos"
              ? "Tente alterar a busca ou selecionar outro filtro."
              : "Quando novas contas forem cadastradas, elas aparecerão aqui."
          }}
        </p>
      </div>

      <footer
        v-if="!carregando && !erro && usuariosFiltrados.length"
        class="panel-footer"
      >
        <span>
          Exibindo {{ usuariosFiltrados.length }}
          de {{ usuarios.length }} usuários
        </span>

        <span class="footer-indicador">
          <i class="fa-solid fa-shield-halved"></i>
          Área administrativa
        </span>
      </footer>
    </section>

    <div
      v-if="usuarioSelecionado"
      class="modal-overlay"
      @click.self="fecharDetalhes"
      @keydown.esc="fecharDetalhes"
    >
      <section
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <button
          type="button"
          class="modal-fechar"
          aria-label="Fechar detalhes"
          @click="fecharDetalhes"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="modal-avatar">
          <img
            v-if="usuarioSelecionado.foto_perfil"
            :src="usuarioSelecionado.foto_perfil"
            :alt="`Foto de ${nomeUsuario(usuarioSelecionado)}`"
            @error="$event.target.style.display = 'none'"
          />

          <span>{{ iniciaisUsuario(usuarioSelecionado) }}</span>
        </div>

        <span class="secao-label">PERFIL DO USUÁRIO</span>

        <h2 id="modal-titulo">
          {{ nomeUsuario(usuarioSelecionado) }}
        </h2>

        <p class="modal-email">
          {{ usuarioSelecionado.email || "E-mail não informado" }}
        </p>

        <div class="modal-dados">
          <div>
            <span>Identificação</span>
            <strong>
              {{
                usuarioSelecionado.id ??
                usuarioSelecionado.idUsuario ??
                "Não informada"
              }}
            </strong>
          </div>

          <div>
            <span>Tipo de conta</span>
            <strong>
              {{
                usuarioSelecionado.is_superuser
                  ? "Administrador"
                  : "Cliente"
              }}
            </strong>
          </div>

          <div>
            <span>Data de cadastro</span>
            <strong>
              {{
                formatarData(
                  usuarioSelecionado.date_joined ||
                  usuarioSelecionado.criado_em
                )
              }}
            </strong>
          </div>

          <div>
            <span>Status da conta</span>
            <strong
              :class="
                usuarioAtivo(usuarioSelecionado)
                  ? 'texto-ativo'
                  : 'texto-inativo'
              "
            >
              {{ usuarioAtivo(usuarioSelecionado) ? "Ativo" : "Inativo" }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="btn-modal-ok"
          @click="fecharDetalhes"
        >
          Fechar detalhes
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.usuarios-page {
  min-width: 0;
  padding: 8px 0 35px;
  color: #493326;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.header-copy {
  min-width: 0;
}

.eyebrow,
.secao-label {
  display: block;
  color: #b18c56;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.17em;
}

.header-copy h1 {
  margin: 9px 0 10px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.header-copy h1 em {
  color: #b89764;
  font-weight: 500;
}

.header-copy p {
  max-width: 560px;
  margin: 0;
  color: #927f6d;
  font-size: 0.86rem;
  line-height: 1.7;
}

.btn-atualizar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 0 15px;
  border: 1px solid #eadbca;
  border-radius: 12px;
  background: #fffdf9;
  color: #79583d;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-atualizar:hover {
  border-color: #c9ab7b;
  background: #faf3e8;
}

.btn-atualizar:disabled {
  cursor: wait;
  opacity: 0.65;
}

.resumo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}

.resumo-card {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  padding: 20px;
  border: 1px solid #eee1d2;
  border-radius: 20px;
  background: #fffdf9;
  box-shadow: 0 9px 26px rgba(73, 48, 29, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.resumo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(73, 48, 29, 0.07);
}

.resumo-icone {
  display: grid;
  flex: 0 0 47px;
  width: 47px;
  height: 47px;
  place-items: center;
  border-radius: 15px;
  background: #f4e7d7;
  color: #956d43;
  font-size: 1.05rem;
}

.ativo-icone {
  background: #edf2e8;
  color: #718565;
}

.inativo-icone {
  background: #f8eae5;
  color: #b76a58;
}

.resumo-texto {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.resumo-texto > span {
  color: #8f7b69;
  font-size: 0.73rem;
  line-height: 1.4;
}

.resumo-texto strong {
  color: #4b3022;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.7rem;
  line-height: 1;
}

.resumo-texto small {
  color: #ad9a87;
  font-size: 0.65rem;
}

.resumo-detalhe {
  position: absolute;
  right: 14px;
  bottom: 8px;
  color: rgba(184, 151, 100, 0.14);
  font-family: "Playfair Display", Georgia, serif;
  font-size: 2.3rem;
  font-weight: 700;
}

.usuarios-panel {
  overflow: hidden;
  border: 1px solid #eee1d2;
  border-radius: 23px;
  background: #fffdfb;
  box-shadow: 0 15px 40px rgba(73, 48, 29, 0.045);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 25px 21px;
}

.panel-header h2 {
  margin: 7px 0 5px;
  color: #493124;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.55rem;
  font-weight: 600;
}

.panel-header p {
  margin: 0;
  color: #978575;
  font-size: 0.77rem;
  line-height: 1.6;
}

.contador {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #eadbc8;
  border-radius: 30px;
  background: #faf4eb;
  color: #977449;
  font-size: 0.7rem;
  font-weight: 800;
}

.filtros {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 12px;
  padding: 0 25px 22px;
}

.campo-busca,
.campo-status {
  display: flex;
  min-width: 0;
  height: 45px;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid #e9dfd3;
  border-radius: 12px;
  background: #fff;
  color: #b09a7c;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.campo-busca:focus-within,
.campo-status:focus-within {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.campo-busca > i,
.campo-status > i {
  flex-shrink: 0;
  font-size: 0.8rem;
}

.campo-busca input,
.campo-status select {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #624b38;
  font: inherit;
  font-size: 0.76rem;
}

.campo-busca input::placeholder {
  color: #b1a394;
}

.campo-status select {
  cursor: pointer;
}

.atalho-busca {
  color: #b2a18d;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.tabela-wrapper {
  width: 100%;
  overflow-x: auto;
}

.usuarios-tabela {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.usuarios-tabela thead {
  background: #faf6ef;
}

.usuarios-tabela th {
  padding: 14px 17px;
  color: #9b856c;
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.usuarios-tabela th:first-child,
.usuarios-tabela td:first-child {
  padding-left: 25px;
}

.usuarios-tabela td {
  padding: 17px;
  border-top: 1px solid #f1e9df;
  color: #725a45;
  font-size: 0.76rem;
  vertical-align: middle;
}

.usuarios-tabela tbody tr {
  transition: background 0.2s ease;
}

.usuarios-tabela tbody tr:hover {
  background: #fffcf7;
}

.usuario-identidade {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 175px;
}

.avatar,
.modal-avatar {
  position: relative;
  display: grid;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border: 1px solid #ead9c4;
  border-radius: 50%;
  background: linear-gradient(145deg, #f7e9d6, #ead7bc);
  color: #795538;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.82rem;
  font-weight: 700;
}

.avatar {
  width: 42px;
  height: 42px;
}

.avatar img,
.modal-avatar img {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar span,
.modal-avatar span {
  position: relative;
  z-index: 0;
}

.usuario-nome {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.usuario-nome strong {
  max-width: 190px;
  overflow: hidden;
  color: #523827;
  font-size: 0.78rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usuario-nome small {
  color: #a18b76;
  font-size: 0.66rem;
}

.email-texto,
.data-texto {
  display: inline-block;
  max-width: 220px;
  overflow-wrap: anywhere;
  color: #8c7968;
  line-height: 1.5;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 30px;
  font-size: 0.66rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-ponto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-ativo {
  background: #edf4e9;
  color: #65815a;
}

.status-inativo {
  background: #faece7;
  color: #b76c5a;
}

.coluna-acao {
  text-align: center;
}

.btn-detalhes {
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #eadbca;
  border-radius: 11px;
  background: #fff;
  color: #98734d;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-detalhes:hover {
  border-color: #c6a777;
  background: #f8f0e5;
  color: #5e3023;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 16px 25px;
  border-top: 1px solid #f0e7dc;
  background: #fffdfa;
  color: #9b8875;
  font-size: 0.68rem;
}

.footer-indicador {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.footer-indicador i {
  color: #b89764;
}

.estado-vazio {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 20px;
  text-align: center;
}

.estado-vazio > i {
  margin-bottom: 15px;
  color: #b89764;
  font-size: 1.5rem;
}

.estado-icone {
  display: grid;
  width: 65px;
  height: 65px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 21px;
  background: #f5ecdf;
  color: #b89764;
  font-size: 1.4rem;
}

.estado-vazio h3 {
  margin: 0 0 8px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.35rem;
}

.estado-vazio p {
  max-width: 390px;
  margin: 0;
  color: #978575;
  font-size: 0.79rem;
  line-height: 1.7;
}

.mensagem-erro {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin: 0 25px 22px;
  padding: 17px;
  border: 1px solid #eed2ca;
  border-radius: 14px;
  background: #fff6f3;
  color: #a74e40;
}

.erro-icone {
  display: grid;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 11px;
  background: #f9e5df;
}

.mensagem-erro strong {
  font-size: 0.82rem;
}

.mensagem-erro p {
  margin: 6px 0 10px;
  color: #946d62;
  font-size: 0.76rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.mensagem-erro button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8e493c;
  font-size: 0.74rem;
  font-weight: 800;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.modal-overlay {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;
  background: rgba(42, 29, 20, 0.48);
  backdrop-filter: blur(5px);
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 30px;
  border: 1px solid #eadbca;
  border-radius: 25px;
  background: #fffdf9;
  box-shadow: 0 25px 80px rgba(34, 23, 15, 0.2);
  text-align: center;
  animation: modal-entrada 0.2s ease-out;
}

@keyframes modal-entrada {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-fechar {
  position: absolute;
  top: 15px;
  right: 15px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #eadbca;
  border-radius: 12px;
  background: #fff;
  color: #80654c;
  cursor: pointer;
}

.modal-avatar {
  width: 80px;
  height: 80px;
  margin: 8px auto 18px;
  font-size: 1.35rem;
}

.modal-card h2 {
  margin: 9px 0 5px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.7rem;
  overflow-wrap: anywhere;
}

.modal-email {
  margin: 0 0 22px;
  color: #927f6d;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.modal-dados {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 22px;
  border: 1px solid #efe3d5;
  border-radius: 15px;
  overflow: hidden;
  text-align: left;
}

.modal-dados > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 13px 15px;
  border-bottom: 1px solid #f0e7dc;
}

.modal-dados > div:last-child {
  border-bottom: 0;
}

.modal-dados span {
  color: #9b8875;
  font-size: 0.72rem;
}

.modal-dados strong {
  color: #5a3c29;
  font-size: 0.75rem;
  text-align: right;
  overflow-wrap: anywhere;
}

.texto-ativo {
  color: #65815a !important;
}

.texto-inativo {
  color: #b76c5a !important;
}

.btn-modal-ok {
  width: 100%;
  min-height: 45px;
  border: 0;
  border-radius: 12px;
  background: #5e3023;
  color: #fffaf3;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-modal-ok:hover {
  background: #48251b;
}

.girando {
  animation: girar 0.9s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .resumo-grid {
    grid-template-columns: 1fr;
    gap: 11px;
  }

  .resumo-card {
    padding: 15px;
  }

  .resumo-texto strong {
    font-size: 1.45rem;
  }

  .resumo-detalhe {
    right: 18px;
    bottom: 4px;
  }
}

@media (max-width: 700px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
  }

  .header-copy h1 {
    font-size: 2.4rem;
  }

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px 17px;
    gap: 12px;
  }

  .panel-header h2 {
    font-size: 1.35rem;
  }

  .filtros {
    grid-template-columns: 1fr;
    padding: 0 17px 18px;
  }

  .usuarios-tabela {
    min-width: 760px;
  }

  .usuarios-tabela th:first-child,
  .usuarios-tabela td:first-child {
    padding-left: 17px;
  }

  .usuarios-tabela th,
  .usuarios-tabela td {
    padding-right: 13px;
    padding-left: 13px;
  }

  .panel-footer {
    align-items: flex-start;
    flex-direction: column;
    padding: 15px 17px;
    gap: 9px;
  }

  .mensagem-erro {
    margin-right: 17px;
    margin-left: 17px;
  }
}

@media (max-width: 390px) {
  .atalho-busca {
    display: none;
  }

  .contador {
    align-self: flex-start;
  }

  .modal-card {
    padding: 25px 18px;
  }

  .modal-dados > div {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .modal-dados strong {
    text-align: left;
  }
}
</style>