
<script setup>
import { ref, computed, onMounted } from "vue";
import "@/assets/css/admin-compras.css";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const compras = ref([]);
const carregando = ref(false);
const erro = ref("");
const busca = ref("");
const filtroPagamento = ref("todos");
const filtroStatus = ref("todos");
const compraSelecionada = ref(null);
const confirmandoId = ref(null);
const atualizandoId = ref(null);

const statusDisponiveis = [
  { valor: "pendente", texto: "Pendente" },
  { valor: "preparando", texto: "Em preparação" },
  { valor: "pronto", texto: "Pronto" },
  { valor: "finalizado", texto: "Finalizado" },
  { valor: "cancelado", texto: "Cancelado" },
];

const token = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

const normalizarCompra = (compra) => ({
  ...compra,
  id: compra.idCompra ?? compra.id,
  cliente:
    compra.cliente ??
    compra.nome ??
    compra.nome_cliente ??
    "Cliente não informado",
  telefone: compra.telefone ?? "",
  email: compra.email ?? "",
  forma_pagamento:
    compra.forma_pagamento ??
    compra.formaPagamento ??
    "Não informado",
  status: compra.status ?? "pendente",
  pagamento_confirmado: Boolean(compra.pagamento_confirmado),
  criado_em: compra.criado_em ?? compra.data_compra ?? compra.created_at,
  total: Number(compra.total ?? compra.valor_total ?? 0),
  itens: Array.isArray(compra.itens) ? compra.itens : [],
});

const carregarCompras = async () => {
  carregando.value = true;
  erro.value = "";

  try {
    if (!token()) {
      throw new Error("Sua sessão administrativa expirou. Entre novamente.");
    }

    const resposta = await fetch(`${API_URL}/compras/admin/`, {
      method: "GET",
      headers: headers(),
    });

    const dados = await resposta.json().catch(() => []);

    if (!resposta.ok) {
      throw new Error(
        dados.detail ||
        dados.erro ||
        "Não foi possível carregar as compras."
      );
    }

    const lista = Array.isArray(dados)
      ? dados
      : dados.results ?? dados.compras ?? [];

    compras.value = lista.map(normalizarCompra);
  } catch (e) {
    erro.value = e.message || "Erro ao carregar as compras.";
  } finally {
    carregando.value = false;
  }
};

const comprasFiltradas = computed(() => {
  const termo = busca.value.trim().toLowerCase();

  return compras.value.filter((compra) => {
    const correspondeBusca =
      !termo ||
      String(compra.id).toLowerCase().includes(termo) ||
      compra.cliente.toLowerCase().includes(termo) ||
      compra.telefone.toLowerCase().includes(termo) ||
      compra.email.toLowerCase().includes(termo);

    const correspondePagamento =
      filtroPagamento.value === "todos" ||
      (filtroPagamento.value === "confirmado" &&
        compra.pagamento_confirmado) ||
      (filtroPagamento.value === "aguardando" &&
        !compra.pagamento_confirmado);

    const correspondeStatus =
      filtroStatus.value === "todos" ||
      compra.status === filtroStatus.value;

    return (
      correspondeBusca &&
      correspondePagamento &&
      correspondeStatus
    );
  });
});

const totalCompras = computed(() => compras.value.length);

const pagamentosConfirmados = computed(
  () => compras.value.filter((c) => c.pagamento_confirmado).length
);

const pagamentosPendentes = computed(
  () => compras.value.filter((c) => !c.pagamento_confirmado).length
);

const valorConfirmado = computed(() =>
  compras.value
    .filter((c) => c.pagamento_confirmado)
    .reduce((total, compra) => total + compra.total, 0)
);

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);

const formatarData = (data) => {
  if (!data) return "Data não informada";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) return "Data não informada";

  return dataObj.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const nomeStatus = (status) =>
  statusDisponiveis.find((item) => item.valor === status)?.texto ??
  status ??
  "Pendente";

const nomePagamento = (forma) => {
  const valor = String(forma).toLowerCase();

  if (valor.includes("pix")) return "PIX";
  if (valor.includes("cart")) return "Cartão";

  return forma || "Não informado";
};

const nomeProduto = (item) =>
  item.produto_nome ??
  item.nome_produto ??
  item.produto?.nome ??
  item.produto?.nomeProduto ??
  item.nome ??
  "Produto";

const quantidadeItem = (item) =>
  Number(item.quantidade ?? item.qtd ?? 1);

const precoItem = (item) =>
  Number(
    item.preco_unitario ??
    item.preco ??
    item.valor_unitario ??
    item.produto?.preco ??
    0
  );

const subtotalItem = (item) =>
  Number(
    item.subtotal ??
    item.total ??
    precoItem(item) * quantidadeItem(item)
  );

const abrirDetalhes = (compra) => {
  compraSelecionada.value =
    compraSelecionada.value?.id === compra.id ? null : compra;
};

const confirmarPagamento = async (compra) => {
  if (compra.pagamento_confirmado || confirmandoId.value) return;

  const autorizado = window.confirm(
    `Confirma que o pagamento da compra #${compra.id} foi realmente recebido e verificado?`
  );

  if (!autorizado) return;

  confirmandoId.value = compra.id;
  erro.value = "";

  try {
    const resposta = await fetch(
      `${API_URL}/compras/admin/${compra.id}/`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          pagamento_confirmado: true,
        }),
      }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.detail ||
        dados.erro ||
        dados.mensagem ||
        "Não foi possível confirmar o pagamento."
      );
    }

    await carregarCompras();

    const compraAtualizada = compras.value.find(
      (item) => String(item.id) === String(compra.id)
    );

    if (!compraAtualizada?.pagamento_confirmado) {
      throw new Error(
        "O servidor não confirmou a atualização. Verifique se a API aceita o campo pagamento_confirmado."
      );
    }

    if (compraSelecionada.value?.id === compra.id) {
      compraSelecionada.value = compraAtualizada;
    }
  } catch (e) {
    erro.value = e.message || "Erro ao confirmar pagamento.";
  } finally {
    confirmandoId.value = null;
  }
};

const atualizarStatus = async (compra, novoStatus) => {
  if (!novoStatus || novoStatus === compra.status) return;

  atualizandoId.value = compra.id;
  erro.value = "";

  try {
    const resposta = await fetch(
      `${API_URL}/compras/admin/${compra.id}/`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status: novoStatus }),
      }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        dados.detail ||
        dados.erro ||
        "Não foi possível atualizar o status."
      );
    }

    await carregarCompras();
  } catch (e) {
    erro.value = e.message || "Erro ao atualizar o status.";
    await carregarCompras();
  } finally {
    atualizandoId.value = null;
  }
};

onMounted(carregarCompras);
</script>

<template>
  <main class="admin-compras">
    <header class="compras-header">
      <div>
        <span class="compras-eyebrow">PAINEL ADMINISTRATIVO</span>
        <h1>Compras</h1>
        <p>Acompanhe os pedidos realizados pelo carrinho e confirme os pagamentos.</p>
      </div>

      <button
        class="btn-atualizar"
        type="button"
        :disabled="carregando"
        @click="carregarCompras"
      >
        <i class="fa-solid fa-rotate" :class="{ girando: carregando }"></i>
        Atualizar
      </button>
    </header>

    <div v-if="erro" class="compras-erro">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>{{ erro }}</span>
      <button type="button" @click="erro = ''" aria-label="Fechar aviso">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <section class="compras-resumo">
      <article class="resumo-card">
        <div class="resumo-icone icone-cafe">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <div>
          <span>Total de compras</span>
          <strong>{{ totalCompras }}</strong>
          <small>Pedidos registrados</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone icone-verde">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div>
          <span>Pagamentos confirmados</span>
          <strong>{{ pagamentosConfirmados }}</strong>
          <small>Pagamentos verificados</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone icone-laranja">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div>
          <span>Aguardando pagamento</span>
          <strong>{{ pagamentosPendentes }}</strong>
          <small>Precisam de conferência</small>
        </div>
      </article>

      <article class="resumo-card">
        <div class="resumo-icone icone-dourado">
          <i class="fa-solid fa-wallet"></i>
        </div>
        <div>
          <span>Valor confirmado</span>
          <strong>{{ formatarMoeda(valorConfirmado) }}</strong>
          <small>Soma das compras confirmadas</small>
        </div>
      </article>
    </section>

    <section class="compras-conteudo">
      <div class="conteudo-topo">
        <div>
          <h2>Pedidos realizados</h2>
          <p>Consulte os dados e acompanhe cada compra.</p>
        </div>
        <span class="contador-compras">
          {{ comprasFiltradas.length }}
          {{ comprasFiltradas.length === 1 ? "compra" : "compras" }}
        </span>
      </div>

      <div class="compras-filtros">
        <label class="campo-busca">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="busca"
            type="search"
            placeholder="Buscar por cliente, telefone ou pedido..."
          />
        </label>

        <select v-model="filtroPagamento" aria-label="Filtrar pagamento">
          <option value="todos">Todos os pagamentos</option>
          <option value="aguardando">Aguardando confirmação</option>
          <option value="confirmado">Confirmados</option>
        </select>

        <select v-model="filtroStatus" aria-label="Filtrar status">
          <option value="todos">Todos os status</option>
          <option
            v-for="status in statusDisponiveis"
            :key="status.valor"
            :value="status.valor"
          >
            {{ status.texto }}
          </option>
        </select>
      </div>

      <div v-if="carregando && !compras.length" class="compras-vazio">
        <i class="fa-solid fa-spinner girando"></i>
        <p>Carregando compras...</p>
      </div>

      <div
        v-else-if="!comprasFiltradas.length"
        class="compras-vazio"
      >
        <div class="vazio-icone">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h3>Nenhuma compra encontrada</h3>
        <p>
          {{
            compras.length
              ? "Tente alterar os filtros da pesquisa."
              : "As compras realizadas pelo carrinho aparecerão aqui."
          }}
        </p>
      </div>

      <div v-else class="lista-compras">
        <article
          v-for="compra in comprasFiltradas"
          :key="compra.id"
          class="compra-card"
          :class="{ 'compra-expandida': compraSelecionada?.id === compra.id }"
        >
          <div class="compra-principal">
            <div class="compra-identificacao">
              <div class="compra-avatar">
                <i class="fa-solid fa-receipt"></i>
              </div>

              <div class="compra-cliente">
                <strong>{{ compra.cliente }}</strong>
                <span>Pedido #{{ compra.id }}</span>
                <small>{{ formatarData(compra.criado_em) }}</small>
              </div>
            </div>

            <div class="compra-pagamento">
              <span class="campo-titulo">Pagamento</span>
              <strong>{{ nomePagamento(compra.forma_pagamento) }}</strong>
              <span
                class="status-pagamento"
                :class="compra.pagamento_confirmado ? 'pago' : 'aguardando'"
              >
                <i
                  class="fa-solid"
                  :class="compra.pagamento_confirmado
                    ? 'fa-circle-check'
                    : 'fa-clock'"
                ></i>
                {{
                  compra.pagamento_confirmado
                    ? "Confirmado"
                    : "Aguardando confirmação"
                }}
              </span>
            </div>

            <div class="compra-total">
              <span class="campo-titulo">Valor total</span>
              <strong>{{ formatarMoeda(compra.total) }}</strong>
            </div>

            <div class="compra-status">
              <span class="campo-titulo">Status do pedido</span>
              <select
                :value="compra.status"
                :disabled="atualizandoId === compra.id"
                @change="atualizarStatus(compra, $event.target.value)"
              >
                <option
                  v-for="status in statusDisponiveis"
                  :key="status.valor"
                  :value="status.valor"
                >
                  {{ status.texto }}
                </option>
              </select>
            </div>

            <button
              class="btn-detalhes"
              type="button"
              @click="abrirDetalhes(compra)"
            >
              {{ compraSelecionada?.id === compra.id ? "Fechar" : "Detalhes" }}
              <i
                class="fa-solid"
                :class="compraSelecionada?.id === compra.id
                  ? 'fa-chevron-up'
                  : 'fa-chevron-down'"
              ></i>
            </button>
          </div>

          <div
            v-if="compraSelecionada?.id === compra.id"
            class="compra-detalhes"
          >
            <div class="detalhes-coluna">
              <h3>Dados do cliente</h3>
              <p><strong>Nome:</strong> {{ compra.cliente }}</p>
              <p><strong>Telefone:</strong> {{ compra.telefone || "Não informado" }}</p>
              <p><strong>E-mail:</strong> {{ compra.email || "Não informado" }}</p>
              <p><strong>Pedido:</strong> #{{ compra.id }}</p>
            </div>

            <div class="detalhes-coluna detalhes-produtos">
              <h3>Produtos comprados</h3>

              <div
                v-for="(item, index) in compra.itens"
                :key="item.id ?? index"
                class="produto-comprado"
              >
                <div>
                  <strong>{{ nomeProduto(item) }}</strong>
                  <span>{{ quantidadeItem(item) }} unidade(s)</span>
                </div>
                <strong>{{ formatarMoeda(subtotalItem(item)) }}</strong>
              </div>

              <p v-if="!compra.itens.length" class="sem-itens">
                Não há itens detalhados nesta compra.
              </p>

              <div class="detalhes-total">
                <span>Total do pedido</span>
                <strong>{{ formatarMoeda(compra.total) }}</strong>
              </div>
            </div>

            <div class="confirmacao-area">
              <div>
                <h3>Confirmação do pagamento</h3>
                <p v-if="compra.pagamento_confirmado">
                  O pagamento desta compra já foi confirmado.
                </p>
                <p v-else>
                  Confira o recebimento do pagamento antes de confirmar.
                </p>
              </div>

              <span
                v-if="compra.pagamento_confirmado"
                class="pagamento-ja-confirmado"
              >
                <i class="fa-solid fa-circle-check"></i>
                Pagamento confirmado
              </span>

              <button
                v-else
                class="btn-confirmar-pagamento"
                type="button"
                :disabled="confirmandoId === compra.id"
                @click="confirmarPagamento(compra)"
              >
                <i
                  class="fa-solid"
                  :class="confirmandoId === compra.id
                    ? 'fa-spinner girando'
                    : 'fa-check'"
                ></i>
                {{
                  confirmandoId === compra.id
                    ? "Confirmando..."
                    : "Confirmar pagamento"
                }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
