
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import "../assets/css/meus-pedidos-view.css";

const router = useRouter();
const route = useRoute();

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const imagensLocais = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

// =========================================================
// ESTADOS
// =========================================================

const pedidos = ref([]);
const favoritos = ref([]);
const avaliacoes = ref([]);

const carregando = ref(true);
const carregandoFavoritos = ref(false);

const produtoAvaliando = ref(null);
const notaSelecionada = ref(0);
const comentarioAvaliacao = ref("");
const salvandoAvaliacao = ref(false);

const avaliacaoAtual = ref(0);

let intervaloAvaliacoes = null;

// =========================================================
// ABAS
// =========================================================

const abas = [
  {
    id: "favoritos",
    nome: "Favoritos",
    descricao: "Seus queridinhos",
    icone: "fa-heart",
  },
  {
    id: "avaliados",
    nome: "Avaliados",
    descricao: "Suas avaliações",
    icone: "fa-star",
  },
  {
    id: "preparados",
    nome: "Preparados",
    descricao: "Seus pedidos",
    icone: "fa-utensils",
  },
];

const tipoAtual = computed(() => route.params.tipo);

const abaAtual = computed(
  () => abas.find(({ id }) => id === tipoAtual.value) || abas[2],
);

// =========================================================
// NAVEGAÇÃO
// =========================================================

const voltarParaPerfil = () => router.push("/perfil");

const mudarAba = (id) => router.push(`/pedidos/${id}`);

const irParaMenu = () => router.push("/menu");

const abrirProduto = (produto) => {
  const id = idProduto(produto);

  if (id !== null) {
    router.push(`/produto/${id}`);
  }
};

// =========================================================
// AUTENTICAÇÃO
// =========================================================

const obterToken = () => localStorage.getItem("token");

const obterHeaders = (json = false) => {
  const token = obterToken();

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// =========================================================
// RESPOSTAS DA API
// =========================================================

const lerResposta = async (response) => {
  const texto = await response.text();

  let dados = {};

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { detail: texto };
    }
  }

  if (!response.ok) {
    const detalhes = dados.detalhes
      ? Object.values(dados.detalhes).flat().find(
          (valor) => typeof valor === "string",
        )
      : null;

    const mensagem =
      dados.detail ||
      dados.erro ||
      dados.message ||
      detalhes ||
      "Não foi possível concluir a solicitação.";

    throw new Error(mensagem);
  }

  return dados;
};

const extrairLista = (dados) => {
  if (Array.isArray(dados)) return dados;

  if (Array.isArray(dados?.results)) return dados.results;
  if (Array.isArray(dados?.data)) return dados.data;
  if (Array.isArray(dados?.avaliacoes)) return dados.avaliacoes;
  if (Array.isArray(dados?.compras)) return dados.compras;
  if (Array.isArray(dados?.produtos)) return dados.produtos;

  return [];
};

// =========================================================
// IDENTIFICADORES
// =========================================================

const idProduto = (produto) => {
  if (produto === null || produto === undefined) {
    return null;
  }

  if (
    typeof produto === "number" ||
    typeof produto === "string"
  ) {
    return produto;
  }

  return (
    produto?.idProduto ??
    produto?.produto_id ??
    produto?.produto?.idProduto ??
    produto?.produto?.id ??
    produto?.produto?.pk ??
    produto?.id ??
    produto?.pk ??
    null
  );
};

const idProdutoAvaliacao = (avaliacao) => {
  return idProduto(
    avaliacao?.produto ??
    avaliacao?.produto_id ??
    avaliacao?.idProduto,
  );
};

const idPedido = (pedido, index = 0) =>
  pedido?.idCompra ??
  pedido?.idPedido ??
  pedido?.id ??
  index;

// =========================================================
// IMAGENS
// =========================================================

const getImageUrl = (produto) => {
  const imagem =
    produto?.imagem ||
    produto?.foto ||
    produto?.image ||
    produto?.foto_produto;

  if (!imagem) return "";

  const imagemUrl =
    typeof imagem === "object"
      ? imagem.url || imagem.secure_url || ""
      : imagem;

  if (!imagemUrl) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagemUrl)) {
    return imagemUrl;
  }

  const nomeArquivo = String(imagemUrl).split("/").pop();

  return imagensLocais[`../assets/img/${nomeArquivo}`] || "";
};

// =========================================================
// NORMALIZAÇÃO DOS ITENS
// =========================================================

const normalizarItemCompra = (item) => {
  const produtoAninhado =
    item?.produto && typeof item.produto === "object"
      ? item.produto
      : item?.produto_detalhe && typeof item.produto_detalhe === "object"
        ? item.produto_detalhe
        : item?.produto_info && typeof item.produto_info === "object"
          ? item.produto_info
          : null;

  const produto = produtoAninhado || item || {};

  const id =
    idProduto(produto) ??
    item?.produto_id ??
    (typeof item?.produto === "number" ||
    typeof item?.produto === "string"
      ? item.produto
      : null) ??
    idProduto(item);

  const quantidade = Number(item?.quantidade ?? item?.qtd ?? 1);

  const preco =
    item?.preco_unitario ??
    item?.preco ??
    item?.valor ??
    produto?.preco ??
    0;

  const precoNumerico = Number(preco) || 0;

  const quantidadeNumerica =
    Number.isFinite(quantidade) && quantidade > 0
      ? quantidade
      : 1;

  return {
    ...produto,

    idProduto: id,

    nome:
      produto?.nome ??
      item?.nome_produto ??
      item?.nome ??
      "Produto",

    imagem:
      produto?.imagem ??
      item?.imagem ??
      produto?.foto ??
      item?.foto ??
      null,

    preco: precoNumerico,

    quantidade: quantidadeNumerica,

    subtotal:
      item?.subtotal !== undefined
        ? Number(item.subtotal)
        : precoNumerico * quantidadeNumerica,

    _itemId: item?.id ?? item?.idItemCompra ?? null,
  };
};

const normalizarPedido = (pedido, index) => {
  const itensOriginais = Array.isArray(pedido?.itens)
    ? pedido.itens
    : Array.isArray(pedido?.items)
      ? pedido.items
      : Array.isArray(pedido?.itens_compra)
        ? pedido.itens_compra
        : [];

  return {
    ...pedido,

    idCompra: idPedido(pedido, index),

    data:
      pedido?.criado_em ??
      pedido?.data ??
      pedido?.dataCompra ??
      pedido?.created_at ??
      null,

    _itens: itensOriginais
      .map(normalizarItemCompra)
      .filter((item) => idProduto(item) !== null),
  };
};

// =========================================================
// CARREGAR PEDIDOS
// =========================================================

const carregarPedidos = async () => {
  try {
    if (!obterToken()) {
      pedidos.value = [];
      return;
    }

    const response = await fetch(`${API_URL}/compras/`, {
      method: "GET",
      headers: obterHeaders(),
    });

    const dados = await lerResposta(response);

    pedidos.value = extrairLista(dados).map(normalizarPedido);
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    pedidos.value = [];

    window.alert(
      error.message || "Não foi possível carregar seus pedidos.",
    );
  } finally {
    carregando.value = false;
  }
};

// =========================================================
// CARREGAR AVALIAÇÕES DO USUÁRIO
// =========================================================

const carregarAvaliacoes = async () => {
  try {
    if (!obterToken()) {
      avaliacoes.value = [];
      return;
    }

    const response = await fetch(`${API_URL}/avaliacoes/`, {
      method: "GET",
      headers: obterHeaders(),
    });

    const dados = await lerResposta(response);

    avaliacoes.value = extrairLista(dados).filter(
      (avaliacao) =>
        idProdutoAvaliacao(avaliacao) !== null &&
        avaliacao?.id !== undefined &&
        avaliacao?.id !== null,
    );
  } catch (error) {
    console.error("Erro ao carregar avaliações:", error);
    avaliacoes.value = [];
  }
};

// =========================================================
// FAVORITOS
// =========================================================

const carregarFavoritos = async () => {
  carregandoFavoritos.value = true;

  try {
    if (!obterToken()) {
      favoritos.value = [];
      return;
    }

    const response = await fetch(`${API_URL}/produtos/`, {
      method: "GET",
      headers: obterHeaders(),
    });

    const dados = await lerResposta(response);

    favoritos.value = extrairLista(dados).filter(
      (produto) => produto.favorito === true,
    );
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
    favoritos.value = [];
  } finally {
    carregandoFavoritos.value = false;
  }
};

const removerFavorito = async (produto) => {
  const id = idProduto(produto);

  if (id === null || !obterToken()) return;

  try {
    const response = await fetch(
      `${API_URL}/produtos/${id}/favorito/`,
      {
        method: "PATCH",
        headers: obterHeaders(true),
        body: JSON.stringify({ favorito: false }),
      },
    );

    await lerResposta(response);

    favoritos.value = favoritos.value.filter(
      (item) => String(idProduto(item)) !== String(id),
    );
  } catch (error) {
    console.error("Erro ao remover favorito:", error);

    window.alert(
      error.message || "Não foi possível remover o favorito.",
    );
  }
};

// =========================================================
// MAPA DAS AVALIAÇÕES
// =========================================================

const mapaAvaliacoes = computed(() => {
  const mapa = new Map();

  avaliacoes.value.forEach((avaliacao) => {
    const id = idProdutoAvaliacao(avaliacao);

    if (id !== null) {
      mapa.set(String(id), avaliacao);
    }
  });

  return mapa;
});

// =========================================================
// RELACIONAR COMPRAS E AVALIAÇÕES
// =========================================================

const produtosComprados = computed(() =>
  pedidos.value.flatMap((pedido) =>
    pedido._itens.map((item) => {
      const id = idProduto(item);

      const avaliacao =
        id !== null
          ? mapaAvaliacoes.value.get(String(id))
          : null;

      return {
        ...item,

        _pedidoId: pedido.idCompra,
        _dataCompra: pedido.data,

        avaliado: Boolean(avaliacao),

        nota: Number(avaliacao?.nota || 0),

        comentario: avaliacao?.comentario || "",

        avaliacaoId: avaliacao?.id ?? null,
      };
    }),
  ),
);

// =========================================================
// PRODUTOS ÚNICOS
// =========================================================

const produtosUnicos = computed(() => {
  const mapa = new Map();

  produtosComprados.value.forEach((produto) => {
    const id = idProduto(produto);

    if (id === null) return;

    const chave = String(id);
    const anterior = mapa.get(chave);

    const avaliacao = mapaAvaliacoes.value.get(chave);

    mapa.set(chave, {
      ...(anterior || {}),
      ...produto,

      idProduto: id,

      nome:
        produto.nome ||
        anterior?.nome ||
        "Produto",

      imagem:
        produto.imagem ||
        anterior?.imagem ||
        null,

      avaliado: Boolean(avaliacao),

      nota: Number(avaliacao?.nota || 0),

      comentario: avaliacao?.comentario || "",

      avaliacaoId: avaliacao?.id ?? null,
    });
  });

  return [...mapa.values()];
});

// =========================================================
// MINHAS AVALIAÇÕES
// =========================================================

const produtosAvaliados = computed(() => {
  return avaliacoes.value
    .map((avaliacao) => {
      const id = idProdutoAvaliacao(avaliacao);

      if (id === null) return null;

      const produtoComprado = produtosUnicos.value.find(
        (produto) =>
          String(idProduto(produto)) === String(id),
      );

      const produtoRelacionado =
        avaliacao.produto &&
        typeof avaliacao.produto === "object"
          ? avaliacao.produto
          : {};

      return {
        ...(produtoRelacionado || {}),
        ...(produtoComprado || {}),

        idProduto: id,

        nome:
          produtoComprado?.nome ||
          avaliacao.nome_produto ||
          produtoRelacionado.nome ||
          "Produto avaliado",

        imagem:
          produtoComprado?.imagem ||
          produtoRelacionado.imagem ||
          null,

        preco:
          produtoComprado?.preco ??
          produtoRelacionado.preco ??
          0,

        avaliado: true,

        nota: Number(avaliacao.nota || 0),

        comentario: avaliacao.comentario || "",

        avaliacaoId: avaliacao.id,

        criado_em: avaliacao.criado_em,

        _avaliacaoOriginal: avaliacao,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return new Date(b.criado_em || 0) - new Date(a.criado_em || 0);
    });
});

// =========================================================
// PRODUTOS PENDENTES DE AVALIAÇÃO
// =========================================================

const produtosPendentesAvaliacao = computed(() =>
  produtosUnicos.value.filter(
    (produto) =>
      !mapaAvaliacoes.value.has(String(idProduto(produto))),
  ),
);

// =========================================================
// PEDIDOS FORMATADOS
// =========================================================

const pedidosFormatados = computed(() =>
  pedidos.value.map((pedido, index) => ({
    ...pedido,
    _id: idPedido(pedido, index),
    _itens: Array.isArray(pedido._itens)
      ? pedido._itens
      : [],
  })),
);

// =========================================================
// AVALIAÇÕES COM COMENTÁRIO
// =========================================================

const avaliacoesComComentario = computed(() =>
  produtosAvaliados.value.filter(
    (produto) =>
      typeof produto.comentario === "string" &&
      produto.comentario.trim().length > 0,
  ),
);

// =========================================================
// ROTAÇÃO DOS DEPOIMENTOS
// =========================================================

const pararRotacaoAvaliacoes = () => {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
  }

  intervaloAvaliacoes = null;
};

const iniciarRotacaoAvaliacoes = () => {
  pararRotacaoAvaliacoes();

  avaliacaoAtual.value = 0;

  if (avaliacoesComComentario.value.length <= 1) {
    return;
  }

  intervaloAvaliacoes = setInterval(() => {
    avaliacaoAtual.value =
      (avaliacaoAtual.value + 1) %
      avaliacoesComComentario.value.length;
  }, 5000);
};

watch(
  () => avaliacoesComComentario.value.length,
  iniciarRotacaoAvaliacoes,
);

const selecionarAvaliacao = (index) => {
  pararRotacaoAvaliacoes();

  avaliacaoAtual.value = index;

  if (avaliacoesComComentario.value.length > 1) {
    intervaloAvaliacoes = setInterval(() => {
      avaliacaoAtual.value =
        (avaliacaoAtual.value + 1) %
        avaliacoesComComentario.value.length;
    }, 5000);
  }
};

// =========================================================
// FORMATAÇÃO
// =========================================================

const formatarData = (data) => {
  if (!data) return "Data não informada";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return String(data);
  }

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatarPreco = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const totalPedido = (pedido) => {
  if (pedido.total !== undefined && pedido.total !== null) {
    return Number(pedido.total) || 0;
  }

  return (
    pedido._itens?.reduce((total, item) => {
      const preco = Number(item.preco || 0);
      const quantidade = Number(item.quantidade || 1);

      return total + preco * quantidade;
    }, 0) || 0
  );
};

// =========================================================
// MODAL DE AVALIAÇÃO
// =========================================================

const abrirAvaliacao = (produto) => {
  const id = idProduto(produto);

  if (id === null) {
    window.alert("Não foi possível identificar este produto.");
    return;
  }

  // Primeiro verifica se já existe avaliação.
  // Uma avaliação existente pode ser editada mesmo que a API
  // de pedidos não tenha retornado esse produto nesta consulta.

  const avaliacao = mapaAvaliacoes.value.get(String(id));

  const produtoComprado = produtosUnicos.value.find(
    (item) => String(idProduto(item)) === String(id),
  );

  // Só exige compra quando ainda não existe avaliação.
  if (!avaliacao && !produtoComprado) {
    window.alert("Você só pode avaliar produtos que já comprou.");
    return;
  }

  produtoAvaliando.value = {
    ...(produto || {}),
    ...(produtoComprado || {}),

    idProduto: id,

    nome:
      produtoComprado?.nome ||
      produto?.nome ||
      avaliacao?.nome_produto ||
      "Produto",

    avaliado: Boolean(avaliacao),

    nota: Number(avaliacao?.nota || 0),

    comentario: avaliacao?.comentario || "",

    avaliacaoId: avaliacao?.id ?? null,
  };

  notaSelecionada.value = Number(avaliacao?.nota || 0);

  comentarioAvaliacao.value = avaliacao?.comentario || "";
};

const fecharAvaliacao = () => {
  if (salvandoAvaliacao.value) return;

  produtoAvaliando.value = null;
  notaSelecionada.value = 0;
  comentarioAvaliacao.value = "";
};

// =========================================================
// SALVAR OU EDITAR AVALIAÇÃO
// =========================================================

const salvarAvaliacao = async () => {
  const produto = produtoAvaliando.value;

  if (
    !produto ||
    notaSelecionada.value < 1 ||
    notaSelecionada.value > 5 ||
    salvandoAvaliacao.value
  ) {
    return;
  }

  if (!obterToken()) {
    window.alert("Entre na sua conta para avaliar um produto.");
    return;
  }

  const produtoId = idProduto(produto);

  if (produtoId === null) {
    window.alert("Não foi possível identificar o produto.");
    return;
  }

  // Se já existe avaliação, é edição.
  // Não bloqueia a edição por ausência do produto na lista local.
  const avaliacaoExistente =
    mapaAvaliacoes.value.get(String(produtoId));

  const avaliacaoId =
    avaliacaoExistente?.id ??
    produto.avaliacaoId ??
    null;

  const editando = Boolean(avaliacaoId);

  // A validação local de compra é aplicada somente na criação.
  if (!editando) {
    const foiComprado = produtosUnicos.value.some(
      (item) =>
        String(idProduto(item)) === String(produtoId),
    );

    if (!foiComprado) {
      window.alert("Você só pode avaliar produtos que já comprou.");
      return;
    }
  }

  salvandoAvaliacao.value = true;

  try {
    const url = editando
      ? `${API_URL}/avaliacoes/${avaliacaoId}/`
      : `${API_URL}/avaliacoes/`;

    const corpo = {
      nota: Number(notaSelecionada.value),
      comentario: comentarioAvaliacao.value.trim(),
    };

    if (!editando) {
      corpo.produto = produtoId;
    }

    const response = await fetch(url, {
      method: editando ? "PATCH" : "POST",
      headers: obterHeaders(true),
      body: JSON.stringify(corpo),
    });

    const dadosSalvos = await lerResposta(response);

    // Atualiza as avaliações e os pedidos para sincronizar
    // as listas e os botões de avaliação.
    await Promise.all([
      carregarAvaliacoes(),
      carregarPedidos(),
    ]);

    fecharAvaliacao();

    window.alert(
      editando
        ? "Sua avaliação foi atualizada com sucesso!"
        : "Sua avaliação foi enviada com sucesso!",
    );

    return dadosSalvos;
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);

    window.alert(
      error.message ||
        "Não foi possível salvar sua avaliação. Tente novamente.",
    );
  } finally {
    salvandoAvaliacao.value = false;
  }
};

// =========================================================
// INICIALIZAÇÃO
// =========================================================

onMounted(async () => {
  carregando.value = true;

  await Promise.all([
    carregarPedidos(),
    carregarAvaliacoes(),
    carregarFavoritos(),
  ]);

  iniciarRotacaoAvaliacoes();
});

onBeforeUnmount(() => {
  pararRotacaoAvaliacoes();
});
</script>

<template>
  <div class="pedidos-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="pedidos-container">
      <!-- CABEÇALHO -->
      <header class="pedidos-header">
        <button
          type="button"
          class="btn-voltar"
          @click="voltarParaPerfil"
        >
          <span class="voltar-icon">
            <i class="fa-solid fa-arrow-left"></i>
          </span>
          <span>Meu perfil</span>
        </button>

        <div class="header-copy">
          <span class="eyebrow">MINHA CONTA</span>
          <h1>{{ abaAtual.nome }}</h1>
          <p>{{ abaAtual.descricao }}</p>
        </div>

        <div class="header-decoration">
          <span></span>
          <i :class="`fa-solid ${abaAtual.icone}`"></i>
        </div>
      </header>

      <!-- ABAS -->
      <nav class="abas">
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

          <span class="aba-texto">
            <strong>{{ aba.nome }}</strong>
            <small>{{ aba.descricao }}</small>
          </span>
        </button>
      </nav>

      <section class="conteudo">

        <!-- FAVORITOS -->
        <section v-if="tipoAtual === 'favoritos'">
          <div class="conteudo-topo">
            <div class="conteudo-identidade">
              <div class="icone-conteudo">
                <i class="fa-solid fa-heart"></i>
              </div>

              <div>
                <span>SEUS QUERIDINHOS</span>
                <h2>Favoritos</h2>
              </div>
            </div>

            <span class="contador">
              {{ favoritos.length }}
            </span>
          </div>

          <div
            v-if="carregandoFavoritos"
            class="estado-vazio carregando"
          >
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando seus favoritos...</p>
          </div>

          <div
            v-else-if="!favoritos.length"
            class="estado-vazio"
          >
            <div class="estado-icone">
              <i class="fa-regular fa-heart"></i>
            </div>

            <h3>Nenhum favorito ainda</h3>

            <p>
              Salve seus produtos preferidos para encontrá-los facilmente.
            </p>

            <button
              type="button"
              class="btn-acao"
              @click="irParaMenu"
            >
              Explorar cardápio
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div v-else class="lista-produtos">
            <article
              v-for="produto in favoritos"
              :key="idProduto(produto)"
              class="produto-card"
            >
              <button
                type="button"
                class="produto-imagem"
                @click="abrirProduto(produto)"
              >
                <img
                  v-if="getImageUrl(produto)"
                  :src="getImageUrl(produto)"
                  :alt="produto.nome"
                />

                <span v-else>
                  <i class="fa-solid fa-bread-slice"></i>
                </span>
              </button>

              <div class="produto-info">
                <span class="produto-label">FAVORITO</span>

                <h3>{{ produto.nome }}</h3>

                <strong class="produto-preco">
                  R$ {{ formatarPreco(produto.preco) }}
                </strong>

                <div class="produto-acoes">
                  <button
                    type="button"
                    class="btn-ver-produto"
                    @click="abrirProduto(produto)"
                  >
                    Ver produto
                  </button>

                  <button
                    type="button"
                    class="btn-remover"
                    title="Remover dos favoritos"
                    @click="removerFavorito(produto)"
                  >
                    <i class="fa-solid fa-heart"></i>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- AVALIADOS -->
        <section v-else-if="tipoAtual === 'avaliados'">
          <div class="conteudo-topo">
            <div class="conteudo-identidade">
              <div class="icone-conteudo">
                <i class="fa-solid fa-star"></i>
              </div>

              <div>
                <span>SUAS EXPERIÊNCIAS</span>
                <h2>Avaliados</h2>
              </div>
            </div>

            <span class="contador">
              {{ produtosAvaliados.length }}
            </span>
          </div>

          <div
            v-if="carregando"
            class="estado-vazio carregando"
          >
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando suas avaliações...</p>
          </div>

          <template v-else>

            <!-- PRODUTOS QUE PODEM SER AVALIADOS -->

            <div
              v-if="produtosPendentesAvaliacao.length"
              class="produtos-comprados"
            >
              <div class="subtitulo-lista">
                <span>SUA OPINIÃO IMPORTA</span>

                <h3>Produtos para avaliar</h3>

                <p>
                  Você já experimentou estes produtos.
                  Que tal contar como foi?
                </p>
              </div>

              <div class="lista-produtos">
                <article
                  v-for="produto in produtosPendentesAvaliacao"
                  :key="idProduto(produto)"
                  class="produto-card"
                >
                  <button
                    type="button"
                    class="produto-imagem"
                    @click="abrirProduto(produto)"
                  >
                    <img
                      v-if="getImageUrl(produto)"
                      :src="getImageUrl(produto)"
                      :alt="produto.nome"
                    />

                    <span v-else>
                      <i class="fa-solid fa-bread-slice"></i>
                    </span>
                  </button>

                  <div class="produto-info">
                    <span class="produto-label">
                      JÁ COMPROU
                    </span>

                    <h3>{{ produto.nome }}</h3>

                    <strong class="produto-preco">
                      R$ {{ formatarPreco(produto.preco) }}
                    </strong>

                    <button
                      type="button"
                      class="btn-avaliar"
                      @click="abrirAvaliacao(produto)"
                    >
                      <i class="fa-solid fa-star"></i>
                      Avaliar produto
                    </button>
                  </div>
                </article>
              </div>
            </div>

            <!-- MINHAS AVALIAÇÕES -->

            <div class="minhas-avaliacoes">
              <div class="subtitulo-lista">
                <span>SUAS EXPERIÊNCIAS</span>
                <h3>Minhas avaliações</h3>
              </div>

              <div
                v-if="produtosAvaliados.length"
                class="avaliacoes-lista"
              >
                <article
                  v-for="produto in produtosAvaliados"
                  :key="produto.avaliacaoId"
                  class="avaliacao-card"
                >
                  <div class="avaliacao-produto">
                    <div class="avaliacao-imagem">
                      <img
                        v-if="getImageUrl(produto)"
                        :src="getImageUrl(produto)"
                        :alt="produto.nome"
                      />

                      <i
                        v-else
                        class="fa-solid fa-bread-slice"
                      ></i>
                    </div>

                    <div class="avaliacao-info">
                      <span class="avaliacao-label">
                        AVALIADO
                      </span>

                      <h3>{{ produto.nome }}</h3>

                      <div class="estrelas-pequenas">
                        <i
                          v-for="estrela in 5"
                          :key="estrela"
                          class="fa-solid fa-star"
                          :class="{
                            vazia: estrela > Number(produto.nota || 0)
                          }"
                        ></i>
                      </div>
                    </div>
                  </div>

                  <p
                    v-if="produto.comentario?.trim()"
                    class="comentario"
                  >
                    “{{ produto.comentario }}”
                  </p>

                  <button
                    type="button"
                    class="btn-editar-avaliacao"
                    @click="abrirAvaliacao(produto)"
                  >
                    <i class="fa-solid fa-pen"></i>
                    Editar avaliação
                  </button>
                </article>
              </div>

              <div
                v-else-if="!produtosPendentesAvaliacao.length"
                class="estado-vazio"
              >
                <div class="estado-icone">
                  <i class="fa-regular fa-star"></i>
                </div>

                <h3>Ainda não há avaliações</h3>

                <p>
                  Quando você comprar e avaliar algum produto,
                  suas avaliações aparecerão aqui.
                </p>

                <button
                  type="button"
                  class="btn-acao"
                  @click="irParaMenu"
                >
                  Conhecer o cardápio
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- DEPOIMENTOS -->

            <div
              v-if="avaliacoesComComentario.length"
              class="depoimentos"
            >
              <div class="depoimentos-titulo">
                <span class="depoimentos-linha"></span>

                <div>
                  <span class="depoimentos-label">
                    O QUE NOSSOS CLIENTES DIZEM
                  </span>

                  <h3>Avaliações especiais</h3>
                </div>

                <span class="depoimentos-linha"></span>
              </div>

              <div class="depoimento-card">
                <Transition
                  name="avaliacao-fade"
                  mode="out-in"
                >
                  <div
                    v-if="avaliacoesComComentario[avaliacaoAtual]"
                    :key="avaliacoesComComentario[avaliacaoAtual].avaliacaoId"
                    class="depoimento-conteudo"
                  >
                    <div class="depoimento-produto">
                      <div class="depoimento-imagem">
                        <img
                          v-if="getImageUrl(avaliacoesComComentario[avaliacaoAtual])"
                          :src="getImageUrl(avaliacoesComComentario[avaliacaoAtual])"
                          :alt="avaliacoesComComentario[avaliacaoAtual].nome"
                        />

                        <i
                          v-else
                          class="fa-solid fa-bread-slice"
                        ></i>
                      </div>

                      <div class="depoimento-produto-info">
                        <span>AVALIAÇÃO</span>

                        <strong>
                          {{ avaliacoesComComentario[avaliacaoAtual].nome }}
                        </strong>

                        <div class="depoimento-estrelas">
                          <i
                            v-for="estrela in 5"
                            :key="estrela"
                            class="fa-solid fa-star"
                            :class="{
                              vazia:
                                estrela >
                                Number(avaliacoesComComentario[avaliacaoAtual].nota || 0)
                            }"
                          ></i>
                        </div>
                      </div>
                    </div>

                    <div class="depoimento-texto">
                      <i class="fa-solid fa-quote-left"></i>

                      <p>
                        {{ avaliacoesComComentario[avaliacaoAtual].comentario }}
                      </p>

                      <i class="fa-solid fa-quote-right"></i>
                    </div>
                  </div>
                </Transition>
              </div>

              <div
                v-if="avaliacoesComComentario.length > 1"
                class="depoimentos-indicadores"
              >
                <button
                  v-for="(_, index) in avaliacoesComComentario"
                  :key="index"
                  type="button"
                  :class="{ ativo: index === avaliacaoAtual }"
                  :aria-label="`Mostrar avaliação ${index + 1}`"
                  @click="selecionarAvaliacao(index)"
                ></button>
              </div>
            </div>
          </template>
        </section>

        <!-- PREPARADOS -->
        <section v-else-if="tipoAtual === 'preparados'">
          <div class="conteudo-topo">
            <div class="conteudo-identidade">
              <div class="icone-conteudo">
                <i class="fa-solid fa-utensils"></i>
              </div>

              <div>
                <span>SEUS PEDIDOS</span>
                <h2>Preparados</h2>
              </div>
            </div>

            <span class="contador">
              {{ pedidos.length }}
            </span>
          </div>

          <div
            v-if="carregando"
            class="estado-vazio carregando"
          >
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando seus pedidos...</p>
          </div>

          <div
            v-else-if="!pedidos.length"
            class="estado-vazio"
          >
            <div class="estado-icone">
              <i class="fa-solid fa-utensils"></i>
            </div>

            <h3>Nenhum pedido ainda</h3>

            <p>
              Seus pedidos realizados aparecerão aqui.
            </p>

            <button
              type="button"
              class="btn-acao"
              @click="irParaMenu"
            >
              Ver cardápio
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div v-else class="preparados-conteudo">

            <!-- PRODUTOS COMPRADOS -->

            <div
              v-if="produtosUnicos.length"
              class="produtos-comprados"
            >
              <div class="subtitulo-lista">
                <span>PRODUTOS</span>
                <h3>O que você já experimentou</h3>
              </div>

              <div class="lista-produtos">
                <article
                  v-for="produto in produtosUnicos"
                  :key="idProduto(produto)"
                  class="produto-card"
                >
                  <button
                    type="button"
                    class="produto-imagem"
                    @click="abrirProduto(produto)"
                  >
                    <img
                      v-if="getImageUrl(produto)"
                      :src="getImageUrl(produto)"
                      :alt="produto.nome"
                    />

                    <span v-else>
                      <i class="fa-solid fa-bread-slice"></i>
                    </span>
                  </button>

                  <div class="produto-info">
                    <span class="produto-label">
                      JÁ COMPROU
                    </span>

                    <h3>{{ produto.nome }}</h3>

                    <strong class="produto-preco">
                      R$ {{ formatarPreco(produto.preco) }}
                    </strong>

                    <button
                      type="button"
                      class="btn-avaliar"
                      @click="abrirAvaliacao(produto)"
                    >
                      <i class="fa-solid fa-star"></i>

                      {{
                        produto.avaliado
                          ? "Editar avaliação"
                          : "Avaliar produto"
                      }}
                    </button>
                  </div>
                </article>
              </div>
            </div>

            <!-- HISTÓRICO DE PEDIDOS -->

            <div class="historico-pedidos">
              <div class="subtitulo-lista">
                <span>HISTÓRICO</span>
                <h3>Seus pedidos</h3>
              </div>

              <article
                v-for="pedido in pedidosFormatados"
                :key="pedido._id"
                class="pedido-historico"
              >
                <div class="pedido-topo">
                  <div>
                    <span class="pedido-label">PEDIDO</span>

                    <strong>
                      #{{ pedido.idCompra }}
                    </strong>
                  </div>

                  <span class="pedido-data">
                    {{ formatarData(pedido.data) }}
                  </span>
                </div>

                <div class="pedido-itens">
                  <div
                    v-for="(item, index) in pedido._itens"
                    :key="item._itemId ?? item.idProduto ?? index"
                    class="pedido-item"
                  >
                    <span>
                      {{ item.quantidade }}x
                    </span>

                    <strong>
                      {{ item.nome }}
                    </strong>

                    <small>
                      R$
                      {{
                        formatarPreco(
                          Number(item.preco || 0) *
                          Number(item.quantidade || 1)
                        )
                      }}
                    </small>
                  </div>
                </div>

                <div class="pedido-total">
                  <span>Total</span>

                  <strong>
                    R$ {{ formatarPreco(totalPedido(pedido)) }}
                  </strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ABA INVÁLIDA -->
        <div v-else class="estado-vazio">
          <h3>Área não encontrada</h3>

          <button
            type="button"
            class="btn-acao"
            @click="mudarAba('preparados')"
          >
            Ver meus pedidos
          </button>
        </div>
      </section>
    </main>

    <!-- MODAL DE AVALIAÇÃO -->
    <Transition name="modal">
      <div
        v-if="produtoAvaliando"
        class="modal-overlay"
        @click.self="fecharAvaliacao"
      >
        <form
          class="modal-avaliacao"
          @submit.prevent="salvarAvaliacao"
        >
          <button
            type="button"
            class="modal-fechar"
            aria-label="Fechar"
            @click="fecharAvaliacao"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-icone">
            <i class="fa-solid fa-star"></i>
          </div>

          <span class="modal-label">
            SUA AVALIAÇÃO
          </span>

          <h2>{{ produtoAvaliando.nome }}</h2>

          <p class="modal-descricao">
            Como foi sua experiência com este produto?
          </p>

          <!-- ESTRELAS -->
          <div class="estrelas-modal">
            <button
              v-for="estrela in 5"
              :key="estrela"
              type="button"
              :class="{
                selecionada: estrela <= notaSelecionada
              }"
              :aria-label="`${estrela} estrela${estrela > 1 ? 's' : ''}`"
              @click="notaSelecionada = estrela"
            >
              <i class="fa-solid fa-star"></i>
            </button>
          </div>

          <!-- COMENTÁRIO -->
          <textarea
            v-model="comentarioAvaliacao"
            class="campo-comentario"
            placeholder="Conte um pouco sobre sua experiência..."
            maxlength="500"
          ></textarea>

          <span class="contador-caracteres">
            {{ comentarioAvaliacao.length }}/500
          </span>

          <!-- SALVAR -->
          <button
            type="submit"
            class="btn-salvar-avaliacao"
            :disabled="notaSelecionada === 0 || salvandoAvaliacao"
          >
            <i
              v-if="salvandoAvaliacao"
              class="fa-solid fa-spinner fa-spin"
            ></i>

            <template v-else>
              Salvar avaliação
              <i class="fa-solid fa-arrow-right"></i>
            </template>
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>
