
<script setup>
import { computed, onMounted, ref } from "vue";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const encomendas = ref([]);
const carregando = ref(true);
const erro = ref("");
const busca = ref("");
const filtroStatus = ref("todas");
const encomendaSelecionada = ref(null);
const atualizandoId = ref(null);

const statusDisponiveis = [
  { valor: "pendente", nome: "Pendente" },
  { valor: "preparando", nome: "Em preparação" },
  { valor: "pronto", nome: "Pronto para retirada" },
  { valor: "finalizado", nome: "Finalizado" },
  { valor: "cancelado", nome: "Cancelado" }
];

const obterToken = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Sua sessão administrativa expirou. Entre novamente.");
  }

  return token;
};

const obterLista = (dados) => {
  if (Array.isArray(dados)) return dados;
  return dados?.results || dados?.encomendas || dados?.pedidos || [];
};

const idEncomenda = (item) => item.idCompra ?? item.id;

const nomeCliente = (item) => {
  return item.nome || item.nome_cliente || item.cliente?.nome || "Cliente não identificado";
};

const telefoneCliente = (item) => {
  return item.telefone || item.telefone_cliente || "Não informado";
};

const emailCliente = (item) => {
  return item.email || item.cliente?.email || "Não informado";
};

const statusNormalizado = (item) => {
  const status = String(item.status || "pendente")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  const equivalencias = {
    aguardando: "pendente",
    recebido: "pendente",
    em_preparacao: "preparando",
    em_preparo: "preparando",
    pronto_para_retirada: "pronto",
    concluido: "finalizado",
    concluida: "finalizado",
    entregue: "finalizado",
    cancelada: "cancelado"
  };

  const resultado = equivalencias[status] || status;

  return statusDisponiveis.some((opcao) => opcao.valor === resultado)
    ? resultado
    : "pendente";
};

const nomeStatus = (status) => {
  return statusDisponiveis.find((opcao) => opcao.valor === status)?.nome || "Pendente";
};

const formatarPreco = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

const formatarData = (valor) => {
  if (!valor) return "Não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Não informada";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatarDataHora = (valor) => {
  if (!valor) return "Não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Não informada";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const itensDaEncomenda = (item) => {
  return item.itens || item.produtos || item.items || [];
};

const quantidadeItens = (item) => {
  return itensDaEncomenda(item).reduce((total, produto) => {
    return total + Number(produto.quantidade ?? produto.qtd ?? 1);
  }, 0);
};

const valorTotal = (item) => {
  if (item.total != null) return Number(item.total);
  if (item.valor_total != null) return Number(item.valor_total);

  return itensDaEncomenda(item).reduce((total, produto) => {
    const preco = Number(produto.preco || produto.preco_unitario || 0);
    const quantidade = Number(produto.quantidade ?? produto.qtd ?? 1);

    return total + preco * quantidade;
  }, 0);
};

const dataEncomenda = (item) => {
  return item.criado_em || item.dataCompra || item.data_encomenda || item.data;
};

const formaPagamento = (item) => {
  const forma = item.forma_pagamento || item.formaPagamento || item.pagamento || "Não informado";

  return String(forma).toUpperCase() === "PIX" ? "PIX" : String(forma);
};

const encomendasFiltradas = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

  return encomendas.value.filter((item) => {
    const id = String(idEncomenda(item) ?? "");
    const cliente = nomeCliente(item).toLocaleLowerCase("pt-BR");
    const telefone = telefoneCliente(item).toLocaleLowerCase("pt-BR");
    const email = emailCliente(item).toLocaleLowerCase("pt-BR");

    const correspondeBusca =
      id.toLocaleLowerCase("pt-BR").includes(termo) ||
      cliente.includes(termo) ||
      telefone.includes(termo) ||
      email.includes(termo);

    const correspondeStatus =
      filtroStatus.value === "todas" ||
      statusNormalizado(item) === filtroStatus.value;

    return correspondeBusca && correspondeStatus;
  });
});

const contarStatus = (status) => {
  return encomendas.value.filter(
    (item) => statusNormalizado(item) === status
  ).length;
};

const totalVendas = computed(() => {
  return encomendas.value
    .filter((item) => statusNormalizado(item) !== "cancelado")
    .reduce((total, item) => total + valorTotal(item), 0);
});

const carregarEncomendas = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    const token = obterToken();

    const resposta = await fetch(`${API_URL}/compras/admin/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    if (!resposta.ok) {
      if (resposta.status === 401) {
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      if (resposta.status === 403) {
        throw new Error("Seu usuário não possui permissão de administrador.");
      }

      if (resposta.status === 404) {
        throw new Error("A rota /api/compras/admin/ não foi encontrada. Confira as URLs do Django.");
      }

      throw new Error(`Não foi possível carregar as compras. Código ${resposta.status}.`);
    }

    const dados = await resposta.json();
    encomendas.value = obterLista(dados);
  } catch (error) {
    erro.value = error.message || "Ocorreu um erro ao carregar as encomendas.";
  } finally {
    carregando.value = false;
  }
};

const abrirDetalhes = (item) => {
  encomendaSelecionada.value = item;
};

const fecharDetalhes = () => {
  encomendaSelecionada.value = null;
};

const atualizarStatus = async (item, novoStatus) => {
  const id = idEncomenda(item);

  if (id == null || atualizandoId.value !== null) return;
  if (statusNormalizado(item) === novoStatus) return;

  atualizandoId.value = id;
  erro.value = "";

  try {
    const token = obterToken();

    const resposta = await fetch(`${API_URL}/compras/admin/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      body: JSON.stringify({ status: novoStatus })
    });

    if (!resposta.ok) {
      let mensagem = "Não foi possível atualizar o status da compra.";

      try {
        const dados = await resposta.json();

        if (dados.detail) {
          mensagem = dados.detail;
        } else {
          mensagem = Object.entries(dados)
            .map(([campo, valor]) => {
              return `${campo}: ${Array.isArray(valor) ? valor.join(", ") : String(valor)}`;
            })
            .join(" ");
        }
      } catch {
        mensagem = `Falha ao atualizar. Código ${resposta.status}.`;
      }

      throw new Error(mensagem);
    }

    const dadosAtualizados = resposta.status === 204
      ? {}
      : await resposta.json();

    encomendas.value = encomendas.value.map((encomenda) => {
      return idEncomenda(encomenda) === id
        ? { ...encomenda, ...dadosAtualizados, status: novoStatus }
        : encomenda;
    });

    if (
      encomendaSelecionada.value &&
      idEncomenda(encomendaSelecionada.value) === id
    ) {
      encomendaSelecionada.value = {
        ...encomendaSelecionada.value,
        ...dadosAtualizados,
        status: novoStatus
      };
    }
  } catch (error) {
    erro.value = error.message || "Erro ao atualizar o status.";
    await carregarEncomendas();
  } finally {
    atualizandoId.value = null;
  }
};

onMounted(carregarEncomendas);
</script>

<template>
  <div class="encomendas-page">
    <header class="page-header">
      <div>
        <span class="eyebrow">GESTÃO ADMINISTRATIVA</span>
        <h1>Nossas <em>encomendas</em></h1>
        <p>Acompanhe os pedidos recebidos e organize as retiradas dos clientes.</p>
      </div>

      <button
        type="button"
        class="btn-atualizar"
        :disabled="carregando"
        @click="carregarEncomendas"
      >
        <i class="fa-solid fa-rotate" :class="{ girando: carregando }"></i>
        Atualizar lista
      </button>
    </header>

    <section class="resumo-grid">
      <article class="resumo-card">
        <div class="resumo-icone">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <div class="resumo-texto">
          <span>Total de encomendas</span>
          <strong>{{ encomendas.length }}</strong>
          <small>Pedidos registrados</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone preparando-icone">
          <i class="fa-solid fa-kitchen-set"></i>
        </div>
        <div class="resumo-texto">
          <span>Em preparação</span>
          <strong>{{ contarStatus("preparando") }}</strong>
          <small>Pedidos em andamento</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone pronto-icone">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <div class="resumo-texto">
          <span>Prontos para retirada</span>
          <strong>{{ contarStatus("pronto") }}</strong>
          <small>Aguardando os clientes</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone valor-icone">
          <i class="fa-solid fa-coins"></i>
        </div>
        <div class="resumo-texto">
          <span>Valor dos pedidos</span>
          <strong>{{ formatarPreco(totalVendas) }}</strong>
          <small>Sem contar os cancelados</small>
        </div>
      </article>
    </section>

    <section class="encomendas-panel">
      <div class="panel-header">
        <div>
          <span class="secao-label">CENTRAL DE PEDIDOS</span>
          <h2>Encomendas recebidas</h2>
          <p>Consulte os pedidos e atualize o andamento de cada encomenda.</p>
        </div>

        <span class="contador">
          {{ encomendasFiltradas.length }}
          {{ encomendasFiltradas.length === 1 ? "pedido" : "pedidos" }}
        </span>
      </div>

      <div class="filtros">
        <label class="campo-busca">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="busca"
            type="search"
            placeholder="Buscar cliente ou número do pedido..."
          />
        </label>

        <label class="campo-status">
          <i class="fa-solid fa-filter"></i>
          <select v-model="filtroStatus">
            <option value="todas">Todas as encomendas</option>
            <option value="pendente">Pendentes</option>
            <option value="preparando">Em preparação</option>
            <option value="pronto">Prontas para retirada</option>
            <option value="finalizado">Finalizadas</option>
            <option value="cancelado">Canceladas</option>
          </select>
        </label>
      </div>

      <div v-if="erro" class="mensagem-erro">
        <i class="fa-solid fa-circle-exclamation"></i>
        <div>
          <strong>Não foi possível concluir a operação</strong>
          <p>{{ erro }}</p>
          <button type="button" @click="carregarEncomendas">
            Tentar novamente
          </button>
        </div>
      </div>

      <div v-if="carregando" class="estado-vazio">
        <i class="fa-solid fa-spinner girando"></i>
        <h3>Carregando encomendas...</h3>
        <p>Estamos buscando os pedidos registrados no servidor.</p>
      </div>

      <div
        v-else-if="!erro && encomendasFiltradas.length"
        class="tabela-wrapper"
      >
        <table class="encomendas-tabela">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Total</th>
              <th>Status</th>
              <th>Detalhes</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in encomendasFiltradas"
              :key="idEncomenda(item)"
            >
              <td>
                <div class="pedido-id">
                  <span class="pedido-icone">
                    <i class="fa-solid fa-receipt"></i>
                  </span>
                  <div>
                    <strong>#{{ idEncomenda(item) }}</strong>
                    <small>{{ formatarData(dataEncomenda(item)) }}</small>
                  </div>
                </div>
              </td>

              <td>
                <div class="cliente-info">
                  <strong>{{ nomeCliente(item) }}</strong>
                  <small>{{ telefoneCliente(item) }}</small>
                </div>
              </td>

              <td>
                <div class="retirada-info">
                  <strong>{{ formatarData(dataEncomenda(item)) }}</strong>
                  <small>{{ formatarDataHora(dataEncomenda(item)) }}</small>
                </div>
              </td>

              <td>
                <strong class="preco-pedido">
                  {{ formatarPreco(valorTotal(item)) }}
                </strong>
              </td>

              <td>
                <select
                  :value="statusNormalizado(item)"
                  :disabled="atualizandoId !== null"
                  :class="`status-select status-${statusNormalizado(item)}`"
                  :aria-label="`Status do pedido ${idEncomenda(item)}`"
                  @change="atualizarStatus(item, $event.target.value)"
                >
                  <option
                    v-for="status in statusDisponiveis"
                    :key="status.valor"
                    :value="status.valor"
                  >
                    {{ status.nome }}
                  </option>
                </select>
              </td>

              <td>
                <button
                  type="button"
                  class="btn-detalhes"
                  :aria-label="`Ver pedido ${idEncomenda(item)}`"
                  @click="abrirDetalhes(item)"
                >
                  <i class="fa-regular fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!erro" class="estado-vazio">
        <div class="estado-icone">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h3>
          {{
            busca || filtroStatus !== "todas"
              ? "Nenhum pedido encontrado"
              : "Nenhuma encomenda por enquanto"
          }}
        </h3>
        <p>
          {{
            busca || filtroStatus !== "todas"
              ? "Altere os filtros para consultar outros pedidos."
              : "Quando os pedidos forem registrados, eles aparecerão aqui."
          }}
        </p>
      </div>

      <footer
        v-if="!carregando && !erro && encomendasFiltradas.length"
        class="panel-footer"
      >
        <span>
          Exibindo {{ encomendasFiltradas.length }} de {{ encomendas.length }} encomendas
        </span>
        <span class="footer-indicador">
          <i class="fa-solid fa-heart"></i>
          Preparado com carinho
        </span>
      </footer>
    </section>

    <div
      v-if="encomendaSelecionada"
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

        <span class="secao-label">DETALHES DO PEDIDO</span>
        <h2 id="modal-titulo">
          Encomenda #{{ idEncomenda(encomendaSelecionada) }}
        </h2>
        <p class="modal-subtitulo">
          Registrada em {{ formatarDataHora(dataEncomenda(encomendaSelecionada)) }}
        </p>

        <div class="modal-status">
          <span
            class="status"
            :class="`status-${statusNormalizado(encomendaSelecionada)}`"
          >
            <span class="status-ponto"></span>
            {{ nomeStatus(statusNormalizado(encomendaSelecionada)) }}
          </span>
        </div>

        <div class="detalhes-bloco">
          <h3><i class="fa-solid fa-user"></i> Dados do cliente</h3>

          <div class="detalhe-linha">
            <span>Nome</span>
            <strong>{{ nomeCliente(encomendaSelecionada) }}</strong>
          </div>
          <div class="detalhe-linha">
            <span>Telefone</span>
            <strong>{{ telefoneCliente(encomendaSelecionada) }}</strong>
          </div>
          <div class="detalhe-linha">
            <span>E-mail</span>
            <strong>{{ emailCliente(encomendaSelecionada) }}</strong>
          </div>
        </div>

        <div class="detalhes-bloco">
          <h3><i class="fa-solid fa-bag-shopping"></i> Itens da encomenda</h3>

          <div v-if="itensDaEncomenda(encomendaSelecionada).length" class="itens-pedido">
            <div
              v-for="(produto, index) in itensDaEncomenda(encomendaSelecionada)"
              :key="produto.idProduto ?? produto.id ?? index"
              class="item-pedido"
            >
              <div>
                <strong>{{ produto.nome || produto.produto_nome || "Produto" }}</strong>
                <small>{{ produto.quantidade ?? produto.qtd ?? 1 }} unidade(s)</small>
              </div>
              <strong>
                {{
                  formatarPreco(
                    produto.subtotal ??
                    (Number(produto.preco ?? produto.preco_unitario ?? 0) *
                    Number(produto.quantidade ?? produto.qtd ?? 1))
                  )
                }}
              </strong>
            </div>
          </div>

          <p v-else class="sem-itens">
            Os itens desta compra não foram retornados pela API.
          </p>

          <div class="detalhe-linha pagamento-linha">
            <span>Pagamento</span>
            <strong>{{ formaPagamento(encomendaSelecionada) }}</strong>
          </div>

          <div class="total-modal">
            <span>Total do pedido</span>
            <strong>{{ formatarPreco(valorTotal(encomendaSelecionada)) }}</strong>
          </div>
        </div>

        <div class="modal-acoes">
          <label class="campo-status-modal">
            <span>Atualizar status</span>
            <select
              :value="statusNormalizado(encomendaSelecionada)"
              :disabled="atualizandoId !== null"
              @change="atualizarStatus(encomendaSelecionada, $event.target.value)"
            >
              <option
                v-for="status in statusDisponiveis"
                :key="status.valor"
                :value="status.valor"
              >
                {{ status.nome }}
              </option>
            </select>
          </label>

          <button type="button" class="btn-modal-fechar" @click="fecharDetalhes">
            Fechar
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.encomendas-page {
  min-width: 0;
  padding: 8px 0 35px;
  color: #493326;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 27px;
}

.eyebrow,
.secao-label {
  display: block;
  color: #b18c56;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.17em;
}

.header-copy {
  min-width: 0;
}

.page-header h1 {
  margin: 9px 0 10px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.page-header h1 em {
  color: #b89764;
  font-weight: 500;
}

.page-header p {
  max-width: 550px;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 25px;
}

.resumo-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 17px 14px;
  border: 1px solid #eee1d2;
  border-radius: 19px;
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
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 14px;
  background: #f4e7d7;
  color: #956d43;
}

.preparando-icone {
  background: #f8efdd;
  color: #a7834e;
}

.pronto-icone {
  background: #edf2e8;
  color: #718565;
}

.valor-icone {
  background: #f2e8df;
  color: #936b4b;
}

.resumo-texto {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.resumo-texto span {
  color: #8f7b69;
  font-size: 0.68rem;
  line-height: 1.4;
}

.resumo-texto strong {
  color: #4b3022;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(1.1rem, 1.8vw, 1.55rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.resumo-texto small {
  color: #ad9a87;
  font-size: 0.61rem;
}

.encomendas-panel {
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
  grid-template-columns: minmax(0, 1fr) 235px;
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
  transition: 0.2s ease;
}

.campo-busca:focus-within,
.campo-status:focus-within {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
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

.tabela-wrapper {
  width: 100%;
  overflow-x: auto;
}

.encomendas-tabela {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.encomendas-tabela thead {
  background: #faf6ef;
}

.encomendas-tabela th {
  padding: 14px 15px;
  color: #9b856c;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.encomendas-tabela th:first-child,
.encomendas-tabela td:first-child {
  padding-left: 25px;
}

.encomendas-tabela td {
  padding: 16px 15px;
  border-top: 1px solid #f1e9df;
  color: #725a45;
  font-size: 0.74rem;
  vertical-align: middle;
}

.encomendas-tabela tbody tr {
  transition: background 0.2s ease;
}

.encomendas-tabela tbody tr:hover {
  background: #fffcf7;
}

.pedido-id {
  display: flex;
  min-width: 110px;
  align-items: center;
  gap: 9px;
}

.pedido-icone {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #f5ecdf;
  color: #a48452;
}

.pedido-id > div,
.cliente-info,
.retirada-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.pedido-id strong,
.cliente-info strong,
.retirada-info strong {
  color: #523827;
  font-size: 0.74rem;
  font-weight: 800;
}

.pedido-id small,
.cliente-info small,
.retirada-info small {
  color: #a18b76;
  font-size: 0.64rem;
  line-height: 1.5;
}

.cliente-info {
  min-width: 125px;
}

.cliente-info strong {
  max-width: 175px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retirada-info {
  min-width: 115px;
}

.preco-pedido {
  color: #69412c;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1rem;
  white-space: nowrap;
}

.status-select {
  max-width: 175px;
  min-height: 33px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 30px;
  outline: none;
  font: inherit;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
}

.status-select:disabled {
  cursor: wait;
  opacity: 0.65;
}

.status-pendente {
  border-color: #f0dfb9;
  background: #fbf2df;
  color: #9a783e;
}

.status-preparando {
  border-color: #ecd9b4;
  background: #f8efdd;
  color: #9a7139;
}

.status-pronto {
  border-color: #d6e5d1;
  background: #edf4e9;
  color: #64805a;
}

.status-finalizado {
  border-color: #d7e5e0;
  background: #edf5f2;
  color: #557b6c;
}

.status-cancelado {
  border-color: #eed4ce;
  background: #fbefec;
  color: #b46a5a;
}

.btn-detalhes {
  display: inline-grid;
  width: 35px;
  height: 35px;
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

.mensagem-erro > i {
  margin-top: 3px;
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
  max-width: 520px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 28px;
  border: 1px solid #eadbca;
  border-radius: 24px;
  background: #fffdf9;
  box-shadow: 0 25px 80px rgba(34, 23, 15, 0.2);
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

.modal-card > .secao-label {
  padding-right: 45px;
}

.modal-card h2 {
  margin: 10px 0 6px;
  color: #4a3023;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.7rem;
  overflow-wrap: anywhere;
}

.modal-subtitulo {
  margin: 0;
  color: #927f6d;
  font-size: 0.75rem;
  line-height: 1.6;
}

.modal-status {
  margin: 16px 0 20px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 30px;
  font-size: 0.66rem;
  font-weight: 800;
}

.status-ponto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.detalhes-bloco {
  margin-top: 16px;
  padding: 17px;
  border: 1px solid #efe3d5;
  border-radius: 15px;
  background: #fff;
}

.detalhes-bloco h3 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 13px;
  color: #634630;
  font-size: 0.81rem;
}

.detalhes-bloco h3 i {
  color: #b18c56;
}

.detalhe-linha {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 9px 0;
  border-bottom: 1px solid #f2e9df;
}

.detalhe-linha:last-child {
  border-bottom: 0;
}

.detalhe-linha span {
  color: #9b8875;
  font-size: 0.72rem;
}

.detalhe-linha strong {
  color: #624733;
  font-size: 0.74rem;
  text-align: right;
  overflow-wrap: anywhere;
}

.itens-pedido {
  display: flex;
  flex-direction: column;
}

.item-pedido {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px solid #f2e9df;
}

.item-pedido > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.item-pedido strong {
  color: #624733;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.item-pedido small {
  color: #9b8875;
  font-size: 0.67rem;
}

.item-pedido > strong {
  flex-shrink: 0;
  text-align: right;
}

.sem-itens {
  margin: 0;
  color: #9b8875;
  font-size: 0.75rem;
  line-height: 1.6;
}

.pagamento-linha {
  margin-top: 8px;
}

.total-modal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid #eadbca;
}

.total-modal span {
  color: #8f7964;
  font-size: 0.77rem;
}

.total-modal strong {
  color: #6b402c;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 1.35rem;
  white-space: nowrap;
}

.modal-acoes {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 20px;
}

.campo-status-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo-status-modal span {
  color: #76583e;
  font-size: 0.74rem;
  font-weight: 800;
}

.campo-status-modal select {
  width: 100%;
  min-height: 43px;
  padding: 0 12px;
  border: 1px solid #e6d7c5;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: #634630;
  font: inherit;
  font-size: 0.77rem;
}

.campo-status-modal select:focus {
  border-color: #b89764;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.1);
}

.btn-modal-fechar {
  width: 100%;
  min-height: 43px;
  border: 0;
  border-radius: 11px;
  background: #5e3023;
  color: #fffaf3;
  font-size: 0.77rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-modal-fechar:hover {
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

@media (max-width: 1100px) {
  .resumo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
  }

  .page-header h1 {
    font-size: 2.4rem;
  }

  .resumo-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .resumo-card {
    padding: 14px;
  }

  .resumo-texto strong {
    font-size: 1.4rem;
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

  .encomendas-tabela {
    min-width: 850px;
  }

  .encomendas-tabela th:first-child,
  .encomendas-tabela td:first-child {
    padding-left: 17px;
  }

  .encomendas-tabela th,
  .encomendas-tabela td {
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

  .modal-card {
    padding: 23px 18px;
  }
}

@media (max-width: 390px) {
  .modal-card h2 {
    font-size: 1.45rem;
  }

  .detalhe-linha {
    flex-direction: column;
    gap: 5px;
  }

  .detalhe-linha strong {
    text-align: left;
  }
}
</style>
