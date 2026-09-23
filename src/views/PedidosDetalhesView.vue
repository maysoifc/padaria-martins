<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const pedidos = ref([]);
const favoritos = ref([]);
const carregando = ref(true);
const carregandoFavoritos = ref(false);

const produtoAvaliando = ref(null);
const notaSelecionada = ref(0);
const comentarioAvaliacao = ref("");
const salvandoAvaliacao = ref(false);

const avaliacaoAtual = ref(0);
let intervaloAvaliacoes = null;

const tipoAtual = computed(() => route.params.tipo);

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
  return (
    abas.find((aba) => aba.id === tipoAtual.value) ||
    abas[2]
  );
});

const voltarParaPerfil = () => {
  router.push("/perfil");
};

const mudarAba = (id) => {
  router.push(`/pedidos/${id}`);
};

const getImageUrl = (produto) => {
  if (!produto) {
    return "";
  }

  const imagem =
    produto.imagem ||
    produto.foto ||
    produto.image ||
    produto.foto_produto;

  if (!imagem) {
    return "";
  }

  if (
    typeof imagem === "string" &&
    (
      imagem.startsWith("http://") ||
      imagem.startsWith("https://") ||
      imagem.startsWith("data:")
    )
  ) {
    return imagem;
  }

  try {
    const imagens = import.meta.glob(
      "../assets/img/*",
      {
        eager: true,
        query: "?url",
        import: "default"
      }
    );

    const nomeArquivo = String(imagem)
      .split("/")
      .pop();

    const caminho = `../assets/img/${nomeArquivo}`;

    return imagens[caminho] || "";
  } catch {
    return "";
  }
};

const carregarPedidos = () => {
  carregando.value = true;

  try {
    const salvo =
      localStorage.getItem("historicoCompras");

    if (!salvo) {
      pedidos.value = [];
      return;
    }

    const dados = JSON.parse(salvo);

    pedidos.value = Array.isArray(dados)
      ? dados
      : [];
  } catch (error) {
    console.error(
      "Erro ao carregar histórico:",
      error
    );

    pedidos.value = [];
  } finally {
    carregando.value = false;
  }
};

const carregarFavoritos = async () => {
  carregandoFavoritos.value = true;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      favoritos.value = [];
      return;
    }

    const response = await fetch(
      `${API_URL}/produtos/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      favoritos.value = [];
      return;
    }

    const dados = await response.json();

    const lista = Array.isArray(dados)
      ? dados
      : Array.isArray(dados.results)
        ? dados.results
        : [];

    favoritos.value = lista.filter(
      (produto) => produto.favorito === true
    );
  } catch (error) {
    console.error(
      "Erro ao carregar favoritos:",
      error
    );

    favoritos.value = [];
  } finally {
    carregandoFavoritos.value = false;
  }
};

const removerFavorito = async (produto) => {
  const id =
    produto?.idProduto ??
    produto?.id;

  if (!id) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const response = await fetch(
      `${API_URL}/produtos/${id}/favorito/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          favorito: false
        })
      }
    );

    if (!response.ok) {
      return;
    }

    favoritos.value = favoritos.value.filter(
      (item) => {
        const itemId =
          item.idProduto ??
          item.id;

        return String(itemId) !== String(id);
      }
    );
  } catch (error) {
    console.error(
      "Erro ao remover favorito:",
      error
    );
  }
};

const abrirProduto = (produto) => {
  const id =
    produto?.idProduto ??
    produto?.id;

  if (!id) {
    return;
  }

  router.push(`/produto/${id}`);
};

const produtosComprados = computed(() => {
  const resultado = [];

  pedidos.value.forEach((pedido, pedidoIndex) => {
    const itens = Array.isArray(pedido?.itens)
      ? pedido.itens
      : [];

    itens.forEach((item) => {
      resultado.push({
        ...item,
        pedidoId:
          pedido.id ??
          pedido.idPedido ??
          pedidoIndex,
        dataCompra:
          pedido.data ??
          pedido.dataCompra ??
          pedido.criadoEm ??
          pedido.created_at
      });
    });
  });

  return resultado;
});

const produtosUnicos = computed(() => {
  const mapa = new Map();

  produtosComprados.value.forEach((produto) => {
    const id =
      produto.idProduto ??
      produto.id ??
      produto.nome;

    if (!mapa.has(String(id))) {
      mapa.set(String(id), produto);
    }
  });

  return Array.from(mapa.values());
});

const produtosAvaliados = computed(() => {
  const mapa = new Map();

  produtosComprados.value.forEach((produto) => {
    if (
      !produto.avaliado ||
      Number(produto.nota || 0) <= 0
    ) {
      return;
    }

    const id =
      produto.idProduto ??
      produto.id ??
      produto.nome;

    const chave = String(id);

    if (!mapa.has(chave)) {
      mapa.set(chave, produto);
    }
  });

  return Array.from(mapa.values());
});

const pedidosFormatados = computed(() => {
  return pedidos.value.map(
    (pedido, index) => ({
      ...pedido,
      _id:
        pedido.id ??
        pedido.idPedido ??
        index,
      _itens: Array.isArray(pedido.itens)
        ? pedido.itens
        : []
    })
  );
});

const avaliacoesComComentario = computed(() => {
  return produtosAvaliados.value.filter(
    (produto) => {
      return (
        typeof produto.comentario === "string" &&
        produto.comentario.trim().length > 0
      );
    }
  );
});

const iniciarRotacaoAvaliacoes = () => {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
    intervaloAvaliacoes = null;
  }

  avaliacaoAtual.value = 0;

  if (
    avaliacoesComComentario.value.length <= 1
  ) {
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
  () => {
    iniciarRotacaoAvaliacoes();
  }
);

const selecionarAvaliacao = (index) => {
  avaliacaoAtual.value = index;

  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
  }

  iniciarRotacaoAvaliacoes();
};

const formatarData = (data) => {
  if (!data) {
    return "Data não informada";
  }

  try {
    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return String(data);
    }

    return dataObj.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  } catch {
    return String(data);
  }
};

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace(".", ",");
};

const totalPedido = (pedido) => {
  if (
    pedido?.total !== undefined &&
    pedido?.total !== null
  ) {
    return Number(pedido.total || 0);
  }

  const itens = Array.isArray(pedido?.itens)
    ? pedido.itens
    : [];

  return itens.reduce((total, item) => {
    const preco = Number(
      item.preco ||
      item.valor ||
      item.price ||
      0
    );

    const quantidade = Number(
      item.quantidade ||
      item.qtd ||
      1
    );

    return total + preco * quantidade;
  }, 0);
};

const abrirAvaliacao = (produto) => {
  produtoAvaliando.value = produto;

  notaSelecionada.value = Number(
    produto.nota || 0
  );

  comentarioAvaliacao.value =
    produto.comentario || "";
};

const fecharAvaliacao = () => {
  produtoAvaliando.value = null;
  notaSelecionada.value = 0;
  comentarioAvaliacao.value = "";
  salvandoAvaliacao.value = false;
};

const salvarAvaliacao = async () => {
  if (
    !produtoAvaliando.value ||
    notaSelecionada.value <= 0 ||
    salvandoAvaliacao.value
  ) {
    return;
  }

  salvandoAvaliacao.value = true;

  try {
    const produtoId =
      produtoAvaliando.value.idProduto ??
      produtoAvaliando.value.id;

    const pedidoId =
      produtoAvaliando.value.pedidoId;

    let encontrou = false;

    pedidos.value = pedidos.value.map(
      (pedido, pedidoIndex) => {
        const idPedido =
          pedido.id ??
          pedido.idPedido ??
          pedidoIndex;

        if (
          String(idPedido) !==
          String(pedidoId)
        ) {
          return pedido;
        }

        const itens = Array.isArray(
          pedido.itens
        )
          ? pedido.itens
          : [];

        const novosItens = itens.map((item) => {
          const idItem =
            item.idProduto ??
            item.id;

          if (
            String(idItem) ===
            String(produtoId)
          ) {
            encontrou = true;

            return {
              ...item,
              avaliado: true,
              nota: notaSelecionada.value,
              comentario:
                comentarioAvaliacao.value.trim()
            };
          }

          return item;
        });

        return {
          ...pedido,
          itens: novosItens
        };
      }
    );

    if (!encontrou) {
      const comentario =
        comentarioAvaliacao.value.trim();

      produtosComprados.value;
      console.warn(
        "Produto da avaliação não foi localizado no histórico."
      );

      if (!comentario) {
        return;
      }
    }

    localStorage.setItem(
      "historicoCompras",
      JSON.stringify(pedidos.value)
    );

    fecharAvaliacao();
  } catch (error) {
    console.error(
      "Erro ao salvar avaliação:",
      error
    );
  } finally {
    salvandoAvaliacao.value = false;
  }
};

onMounted(() => {
  carregarPedidos();
  carregarFavoritos();
  iniciarRotacaoAvaliacoes();
});

onBeforeUnmount(() => {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
    intervaloAvaliacoes = null;
  }
});
</script>

<template>
  <div class="pedidos-page">

    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="pedidos-container">

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

          <span class="eyebrow">
            MINHA CONTA
          </span>

          <h1>
            {{ abaAtual.nome }}
          </h1>

          <p>
            {{ abaAtual.descricao }}
          </p>

        </div>

        <div class="header-decoration">

          <span></span>

          <i
            :class="`fa-solid ${abaAtual.icone}`"
          ></i>

        </div>

      </header>

      <nav class="abas">

        <button
          v-for="aba in abas"
          :key="aba.id"
          type="button"
          class="aba"
          :class="{
            ativa: tipoAtual === aba.id
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

        </button>

      </nav>

      <section class="conteudo">

        <!-- FAVORITOS -->

        <section
          v-if="tipoAtual === 'favoritos'"
          class="favoritos"
        >

          <div class="conteudo-topo">

            <div class="conteudo-identidade">

              <div class="icone-conteudo">
                <i class="fa-solid fa-heart"></i>
              </div>

              <div>
                <span>
                  SEUS QUERIDINHOS
                </span>

                <h2>
                  Favoritos
                </h2>
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
            <i
              class="fa-solid fa-spinner fa-spin"
            ></i>

            <p>
              Carregando seus favoritos...
            </p>
          </div>

          <div
            v-else-if="favoritos.length === 0"
            class="estado-vazio"
          >
            <div class="estado-icone">
              <i class="fa-regular fa-heart"></i>
            </div>

            <h3>
              Nenhum favorito ainda
            </h3>

            <p>
              Salve seus produtos preferidos
              para encontrá-los facilmente.
            </p>

            <button
              type="button"
              class="btn-acao"
              @click="router.push('/menu')"
            >
              <span>
                Explorar cardápio
              </span>

              <i
                class="fa-solid fa-arrow-right"
              ></i>
            </button>
          </div>

          <div
            v-else
            class="lista-produtos"
          >

            <article
              v-for="produto in favoritos"
              :key="
                produto.idProduto ??
                produto.id
              "
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
                  <i
                    class="fa-solid fa-bread-slice"
                  ></i>
                </span>

              </button>

              <div class="produto-info">

                <span class="produto-label">
                  FAVORITO
                </span>

                <h3>
                  {{ produto.nome }}
                </h3>

                <strong class="produto-preco">
                  R$
                  {{ formatarPreco(produto.preco) }}
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
                    <i
                      class="fa-solid fa-heart"
                    ></i>
                  </button>

                </div>

              </div>

            </article>

          </div>

        </section>

        <!-- AVALIADOS -->

        <section
          v-else-if="tipoAtual === 'avaliados'"
          class="avaliados"
        >

          <div class="conteudo-topo">

            <div class="conteudo-identidade">

              <div class="icone-conteudo">
                <i class="fa-solid fa-star"></i>
              </div>

              <div>
                <span>
                  SUAS EXPERIÊNCIAS
                </span>

                <h2>
                  Avaliados
                </h2>
              </div>

            </div>

            <span class="contador">
              {{ produtosAvaliados.length }}
            </span>

          </div>

          <div
            v-if="
              carregando ||
              produtosAvaliados.length === 0
            "
            class="estado-vazio"
          >

            <div class="estado-icone">
              <i class="fa-regular fa-star"></i>
            </div>

            <h3>
              Ainda não há avaliações
            </h3>

            <p>
              Depois de experimentar nossos
              produtos, você poderá deixar
              sua avaliação aqui.
            </p>

            <button
              type="button"
              class="btn-acao"
              @click="router.push('/menu')"
            >
              <span>
                Conhecer o cardápio
              </span>

              <i
                class="fa-solid fa-arrow-right"
              ></i>
            </button>

          </div>

          <div
            v-else
            class="avaliacoes-lista"
          >

            <article
              v-for="produto in produtosAvaliados"
              :key="
                produto.idProduto ??
                produto.id ??
                produto.nome
              "
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

                  <h3>
                    {{ produto.nome }}
                  </h3>

                  <div class="estrelas-pequenas">

                    <i
                      v-for="estrela in 5"
                      :key="estrela"
                      class="fa-solid fa-star"
                      :class="{
                        vazia:
                          estrela >
                          Number(produto.nota || 0)
                      }"
                    ></i>

                  </div>

                </div>

              </div>

              <p
                v-if="
                  produto.comentario &&
                  produto.comentario.trim()
                "
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

                <span>
                  Editar avaliação
                </span>
              </button>

            </article>

          </div>

          <!-- DEPOIMENTOS ROTATIVOS -->

          <div
            v-if="avaliacoesComComentario.length"
            class="depoimentos"
          >

            <div class="depoimentos-titulo">

              <span
                class="depoimentos-linha"
              ></span>

              <div>

                <span
                  class="depoimentos-label"
                >
                  O QUE NOSSOS CLIENTES DIZEM
                </span>

                <h3>
                  Avaliações especiais
                </h3>

              </div>

              <span
                class="depoimentos-linha"
              ></span>

            </div>

            <div class="depoimento-card">

              <Transition
                name="avaliacao-fade"
                mode="out-in"
              >

                <div
                  v-if="
                    avaliacoesComComentario[
                      avaliacaoAtual
                    ]
                  "
                  :key="
                    avaliacoesComComentario[
                      avaliacaoAtual
                    ].idProduto ??
                    avaliacoesComComentario[
                      avaliacaoAtual
                    ].id ??
                    avaliacaoAtual
                  "
                  class="depoimento-conteudo"
                >

                  <div class="depoimento-produto">

                    <div class="depoimento-imagem">

                      <img
                        v-if="
                          getImageUrl(
                            avaliacoesComComentario[
                              avaliacaoAtual
                            ]
                          )
                        "
                        :src="
                          getImageUrl(
                            avaliacoesComComentario[
                              avaliacaoAtual
                            ]
                          )
                        "
                        :alt="
                          avaliacoesComComentario[
                            avaliacaoAtual
                          ].nome
                        "
                      />

                      <i
                        v-else
                        class="fa-solid fa-bread-slice"
                      ></i>

                    </div>

                    <div
                      class="depoimento-produto-info"
                    >

                      <span>
                        AVALIAÇÃO
                      </span>

                      <strong>
                        {{
                          avaliacoesComComentario[
                            avaliacaoAtual
                          ].nome
                        }}
                      </strong>

                      <div
                        class="depoimento-estrelas"
                      >

                        <i
                          v-for="estrela in 5"
                          :key="estrela"
                          class="fa-solid fa-star"
                        ></i>

                      </div>

                    </div>

                  </div>

                  <div class="depoimento-texto">

                    <i
                      class="fa-solid fa-quote-left"
                    ></i>

                    <p>
                      {{
                        avaliacoesComComentario[
                          avaliacaoAtual
                        ].comentario
                      }}
                    </p>

                    <i
                      class="fa-solid fa-quote-right"
                    ></i>

                  </div>

                </div>

              </Transition>

            </div>

            <div
              v-if="
                avaliacoesComComentario.length > 1
              "
              class="depoimentos-indicadores"
            >

              <button
                v-for="(_, index) in avaliacoesComComentario"
                :key="index"
                type="button"
                :class="{
                  ativo:
                    index === avaliacaoAtual
                }"
                :aria-label="
                  `Mostrar avaliação ${index + 1}`
                "
                @click="
                  selecionarAvaliacao(index)
                "
              ></button>

            </div>

          </div>

        </section>

        <!-- PREPARADOS -->

        <section
          v-else-if="tipoAtual === 'preparados'"
          class="preparados"
        >

          <div class="conteudo-topo">

            <div class="conteudo-identidade">

              <div class="icone-conteudo">
                <i
                  class="fa-solid fa-utensils"
                ></i>
              </div>

              <div>
                <span>
                  SEUS PEDIDOS
                </span>

                <h2>
                  Preparados
                </h2>
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
            <i
              class="fa-solid fa-spinner fa-spin"
            ></i>

            <p>
              Carregando seus pedidos...
            </p>
          </div>

          <div
            v-else-if="pedidos.length === 0"
            class="estado-vazio"
          >

            <div class="estado-icone">
              <i
                class="fa-solid fa-utensils"
              ></i>
            </div>

            <h3>
              Nenhum pedido ainda
            </h3>

            <p>
              Seus pedidos realizados aparecerão
              aqui.
            </p>

            <button
              type="button"
              class="btn-acao"
              @click="router.push('/menu')"
            >
              <span>
                Ver cardápio
              </span>

              <i
                class="fa-solid fa-arrow-right"
              ></i>
            </button>

          </div>

          <div
            v-else
            class="preparados-conteudo"
          >

            <div
              v-if="produtosUnicos.length"
              class="produtos-comprados"
            >

              <div class="subtitulo-lista">

                <div>
                  <span>
                    PRODUTOS
                  </span>

                  <h3>
                    O que você já experimentou
                  </h3>
                </div>

              </div>

              <div class="lista-produtos">

                <article
                  v-for="produto in produtosUnicos"
                  :key="
                    produto.idProduto ??
                    produto.id ??
                    produto.nome
                  "
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
                      <i
                        class="fa-solid fa-bread-slice"
                      ></i>
                    </span>

                  </button>

                  <div class="produto-info">

                    <span class="produto-label">
                      JÁ COMPROU
                    </span>

                    <h3>
                      {{ produto.nome }}
                    </h3>

                    <strong
                      class="produto-preco"
                    >
                      R$
                      {{
                        formatarPreco(
                          produto.preco
                        )
                      }}
                    </strong>

                    <button
                      type="button"
                      class="btn-avaliar"
                      @click="
                        abrirAvaliacao(produto)
                      "
                    >
                      <i
                        class="fa-solid fa-star"
                      ></i>

                      <span>
                        {{
                          produto.avaliado
                            ? "Editar avaliação"
                            : "Avaliar produto"
                        }}
                      </span>
                    </button>

                  </div>

                </article>

              </div>

            </div>

            <div class="historico-pedidos">

              <div class="subtitulo-lista">

                <div>
                  <span>
                    HISTÓRICO
                  </span>

                  <h3>
                    Seus pedidos
                  </h3>
                </div>

              </div>

              <article
                v-for="pedido in pedidosFormatados"
                :key="pedido._id"
                class="pedido-historico"
              >

                <div class="pedido-topo">

                  <div>

                    <span class="pedido-label">
                      PEDIDO
                    </span>

                    <strong>
                      #{{
                        pedido.id ??
                        pedido.idPedido ??
                        pedido._id
                      }}
                    </strong>

                  </div>

                  <span class="pedido-data">
                    {{
                      formatarData(
                        pedido.data ??
                        pedido.dataCompra ??
                        pedido.created_at
                      )
                    }}
                  </span>

                </div>

                <div class="pedido-itens">

                  <div
                    v-for="(item, index) in pedido._itens"
                    :key="
                      item.idProduto ??
                      item.id ??
                      index
                    "
                    class="pedido-item"
                  >

                    <span>
                      {{
                        item.quantidade ??
                        item.qtd ??
                        1
                      }}x
                    </span>

                    <strong>
                      {{ item.nome }}
                    </strong>

                    <small>
                      R$
                      {{
                        formatarPreco(
                          Number(
                            item.preco ||
                            item.valor ||
                            0
                          ) *
                          Number(
                            item.quantidade ||
                            item.qtd ||
                            1
                          )
                        )
                      }}
                    </small>

                  </div>

                </div>

                <div class="pedido-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    R$
                    {{
                      formatarPreco(
                        totalPedido(pedido)
                      )
                    }}
                  </strong>

                </div>

              </article>

            </div>

          </div>

        </section>

      </section>

    </main>

    <!-- MODAL DE AVALIAÇÃO -->

    <Transition name="modal">

      <div
        v-if="produtoAvaliando"
        class="modal-overlay"
        @click.self="fecharAvaliacao"
      >

        <div class="modal-avaliacao">

          <button
            type="button"
            class="modal-fechar"
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

          <h2>
            {{ produtoAvaliando.nome }}
          </h2>

          <p class="modal-descricao">
            Como foi sua experiência com
            este produto?
          </p>

          <div class="estrelas-modal">

            <button
              v-for="estrela in 5"
              :key="estrela"
              type="button"
              :class="{
                selecionada:
                  estrela <= notaSelecionada
              }"
              :aria-label="
                `${estrela} estrela${estrela > 1 ? 's' : ''}`
              "
              @click="
                notaSelecionada = estrela
              "
            >
              <i class="fa-solid fa-star"></i>
            </button>

          </div>

          <textarea
            v-model="comentarioAvaliacao"
            class="campo-comentario"
            placeholder="Conte um pouco sobre sua experiência..."
            maxlength="500"
          ></textarea>

          <span class="contador-caracteres">
            {{ comentarioAvaliacao.length }}/500
          </span>

          <button
            type="button"
            class="btn-salvar-avaliacao"
            :disabled="
              notaSelecionada === 0 ||
              salvandoAvaliacao
            "
            @click="salvarAvaliacao"
          >

            <i
              v-if="salvandoAvaliacao"
              class="fa-solid fa-spinner fa-spin"
            ></i>

            <span v-else>
              Salvar avaliação
            </span>

            <i
              v-if="!salvandoAvaliacao"
              class="fa-solid fa-arrow-right"
            ></i>

          </button>

        </div>

      </div>

    </Transition>

  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Imprima&display=swap");

* {
  box-sizing: border-box;
}

.pedidos-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 8% 10%,
      rgba(184, 151, 100, 0.12),
      transparent 24%
    ),
    radial-gradient(
      circle at 94% 85%,
      rgba(94, 48, 35, 0.07),
      transparent 25%
    ),
    #f8f4ed;

  color: #38291f;
  font-family: "DM Sans", sans-serif;
}

.pedidos-container {
  position: relative;
  z-index: 2;

  width: min(100%, 900px);

  margin: 0 auto;

  padding: 28px 20px 45px;
}

.ambient {
  position: fixed;

  border-radius: 50%;

  pointer-events: none;
}

.ambient-one {
  width: 260px;
  height: 260px;

  top: -140px;
  right: -110px;

  background: rgba(191, 162, 108, 0.12);
}

.ambient-two {
  width: 230px;
  height: 230px;

  bottom: -120px;
  left: -110px;

  background: rgba(108, 77, 51, 0.07);
}

.pedidos-header {
  position: relative;

  margin-bottom: 30px;
}

.btn-voltar {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 28px;
  padding: 0;

  border: 0;
  background: transparent;

  color: #72563e;

  font-family: "DM Sans", sans-serif;
  font-size: 0.84rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.btn-voltar:hover {
  color: #5e3023;
  transform: translateX(-3px);
}

.voltar-icon {
  width: 36px;
  height: 36px;

  display: grid;
  place-items: center;

  border: 1px solid #e5d9cb;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.7);

  box-shadow:
    0 5px 16px rgba(94, 48, 35, 0.06);
}

.header-copy {
  max-width: 650px;
}

.eyebrow {
  display: block;

  color: #a48452;

  font-size: 0.62rem;
  font-weight: 800;

  letter-spacing: 0.18em;
}

.header-copy h1 {
  margin: 8px 0 7px;

  color: #3a281d;

  font-family: "Imprima", Georgia, serif;

  font-size: clamp(2.2rem, 8vw, 3.7rem);
  font-weight: 400;

  line-height: 1;
}

.header-copy p {
  margin: 0;

  color: #8b796a;

  font-size: 0.88rem;
  line-height: 1.55;
}

.header-decoration {
  position: absolute;

  top: 75px;
  right: 2%;

  width: 76px;
  height: 76px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(184, 151, 100, 0.2);
  border-radius: 50%;

  color: #b89764;

  background: rgba(255, 253, 249, 0.6);
}

.header-decoration span {
  position: absolute;

  inset: 8px;

  border: 1px dashed rgba(184, 151, 100, 0.35);
  border-radius: 50%;
}

.header-decoration i {
  position: relative;
  z-index: 2;

  font-size: 19px;
}

.abas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  gap: 9px;

  margin-bottom: 18px;
}

.aba {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 9px;

  border: 1px solid #eadfd3;
  border-radius: 16px;

  background: rgba(255, 253, 249, 0.75);

  color: #72563e;

  font-family: "DM Sans", sans-serif;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.aba:hover {
  transform: translateY(-2px);

  border-color: #d9c5a9;

  box-shadow:
    0 8px 20px rgba(94, 48, 35, 0.06);
}

.aba.ativa {
  border-color: #d2b88e;

  background: #fffaf3;

  color: #5e3023;

  box-shadow:
    0 7px 20px rgba(94, 48, 35, 0.08);
}

.aba-icone {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 11px;

  background: #f3e8db;

  color: #a17b4d;

  font-size: 12px;
}

.aba.ativa .aba-icone {
  background: #ead9c2;
  color: #5e3023;
}

.aba-texto {
  min-width: 0;

  display: flex;
  flex-direction: column;

  align-items: flex-start;

  text-align: left;
}

.aba-texto strong {
  overflow: hidden;

  max-width: 100%;

  font-family: "Imprima", Georgia, serif;

  font-size: 0.77rem;
  font-weight: 400;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.aba-texto small {
  margin-top: 2px;

  overflow: hidden;

  max-width: 100%;

  color: #a08e7d;

  font-size: 0.48rem;
  font-weight: 600;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.conteudo {
  padding: 20px 16px 25px;

  border: 1px solid #e8ddd0;
  border-radius: 24px;

  background: rgba(255, 253, 249, 0.88);

  box-shadow:
    0 12px 35px rgba(94, 48, 35, 0.06);
}

.conteudo-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 22px;
}

.conteudo-identidade {
  display: flex;
  align-items: center;
  gap: 11px;

  min-width: 0;
}

.icone-conteudo {
  width: 43px;
  height: 43px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 14px;

  background: #f3e7d9;

  color: #a47d4d;

  font-size: 15px;
}

.conteudo-identidade span {
  display: block;

  color: #a48452;

  font-size: 0.53rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.conteudo-identidade h2 {
  margin: 3px 0 0;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 1.25rem;
  font-weight: 400;
}

.contador {
  min-width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  padding: 0 9px;

  border-radius: 10px;

  background: #f4eadf;

  color: #8a6849;

  font-size: 0.65rem;
  font-weight: 700;
}

.lista-produtos {
  display: grid;

  gap: 12px;
}

.produto-card {
  display: flex;
  align-items: stretch;

  min-width: 0;

  padding: 10px;

  border: 1px solid #eee3d8;
  border-radius: 17px;

  background: #fffdf9;

  box-shadow:
    0 5px 18px rgba(94, 48, 35, 0.045);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.produto-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 9px 23px rgba(94, 48, 35, 0.08);
}

.produto-imagem {
  width: 82px;
  height: 82px;

  flex-shrink: 0;

  padding: 0;

  overflow: hidden;

  border: 0;
  border-radius: 13px;

  background: #f3e7da;

  cursor: pointer;
}

.produto-imagem img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.produto-imagem span {
  width: 100%;
  height: 100%;

  display: grid;
  place-items: center;

  color: #b89764;

  font-size: 20px;
}

.produto-info {
  min-width: 0;
  flex: 1;

  display: flex;
  flex-direction: column;

  padding: 2px 3px 2px 12px;
}

.produto-label {
  color: #b89764;

  font-size: 0.48rem;
  font-weight: 800;

  letter-spacing: 0.13em;
}

.produto-info h3 {
  overflow: hidden;

  margin: 3px 0 4px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 0.95rem;
  font-weight: 400;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.produto-preco {
  color: #7b5a40;

  font-family: "DM Sans", sans-serif;

  font-size: 0.72rem;
  font-weight: 700;
}

.produto-acoes {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-top: auto;
}

.btn-ver-produto {
  min-width: 0;

  flex: 1;

  padding: 7px 9px;

  border: 0;
  border-radius: 9px;

  background: #f4eadf;

  color: #725238;

  font-size: 0.58rem;
  font-weight: 700;

  cursor: pointer;
}

.btn-remover {
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border: 1px solid #eadbc9;
  border-radius: 9px;

  background: #fffaf5;

  color: #a77d6b;

  cursor: pointer;
}

.btn-remover:hover {
  color: #8f5144;
}

.estado-vazio {
  padding: 32px 18px;

  text-align: center;
}

.estado-vazio.carregando {
  min-height: 160px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 10px;

  color: #a48452;
}

.estado-vazio.carregando i {
  font-size: 20px;
}

.estado-icone {
  width: 60px;
  height: 60px;

  display: grid;
  place-items: center;

  margin: 0 auto 14px;

  border-radius: 19px;

  background: #f3e8dc;

  color: #b89764;

  font-size: 22px;
}

.estado-vazio h3 {
  margin: 0 0 7px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 1.15rem;
  font-weight: 400;
}

.estado-vazio p {
  max-width: 340px;

  margin: 0 auto;

  color: #9a8776;

  font-size: 0.72rem;
  line-height: 1.55;
}

.btn-acao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  margin-top: 17px;
  padding: 10px 14px;

  border: 0;
  border-radius: 11px;

  background: #5e3023;

  color: #fffaf4;

  font-size: 0.65rem;
  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 7px 17px rgba(94, 48, 35, 0.14);
}

/* AVALIAÇÕES */

.avaliacoes-lista {
  display: grid;
  gap: 12px;
}

.avaliacao-card {
  padding: 13px;

  border: 1px solid #eee3d8;
  border-radius: 17px;

  background: #fffdf9;
}

.avaliacao-produto {
  display: flex;
  align-items: center;

  gap: 11px;
}

.avaliacao-imagem {
  width: 62px;
  height: 62px;

  flex-shrink: 0;

  overflow: hidden;

  display: grid;
  place-items: center;

  border-radius: 14px;

  background: #f3e7da;

  color: #b89764;
}

.avaliacao-imagem img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.avaliacao-info {
  min-width: 0;
}

.avaliacao-label {
  color: #b89764;

  font-size: 0.48rem;
  font-weight: 800;

  letter-spacing: 0.12em;
}

.avaliacao-info h3 {
  overflow: hidden;

  margin: 3px 0 5px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 0.95rem;
  font-weight: 400;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.estrelas-pequenas {
  display: flex;
  gap: 3px;

  color: #b89764;

  font-size: 9px;
}

.estrelas-pequenas .vazia {
  color: #ded3c5;
}

.comentario {
  margin: 14px 3px 12px;
  padding: 11px 12px;

  border-radius: 11px;

  background: #faf4ed;

  color: #766456;

  font-size: 0.7rem;
  font-style: italic;
  line-height: 1.6;
}

.btn-editar-avaliacao {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 7px 10px;

  border: 1px solid #e8dccc;
  border-radius: 9px;

  background: #fffaf5;

  color: #8a6849;

  font-size: 0.57rem;
  font-weight: 700;

  cursor: pointer;
}

/* DEPOIMENTOS */

.depoimentos {
  width: 100%;

  margin-top: 32px;
  padding-top: 26px;
}

.depoimentos-titulo {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-bottom: 17px;
}

.depoimentos-linha {
  flex: 1;

  height: 1px;

  background: #e8dccd;
}

.depoimentos-titulo > div {
  flex-shrink: 0;

  text-align: center;
}

.depoimentos-label {
  display: block;

  margin-bottom: 3px;

  color: #b89764;

  font-size: 0.48rem;
  font-weight: 800;

  letter-spacing: 0.13em;
}

.depoimentos-titulo h3 {
  margin: 0;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 1.05rem;
  font-weight: 400;
}

.depoimento-card {
  position: relative;

  min-height: 205px;

  padding: 18px;

  overflow: hidden;

  border: 1px solid #eadfd2;
  border-radius: 21px;

  background:
    linear-gradient(
      145deg,
      #fffdf9 0%,
      #fbf5ed 100%
    );

  box-shadow:
    0 9px 25px rgba(94, 48, 35, 0.07);
}

.depoimento-conteudo {
  width: 100%;
}

.depoimento-produto {
  display: flex;
  align-items: center;

  gap: 11px;
}

.depoimento-imagem {
  width: 53px;
  height: 53px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  overflow: hidden;

  border-radius: 14px;

  background: #f1e5d8;

  color: #b89764;
}

.depoimento-imagem img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.depoimento-produto-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.depoimento-produto-info span {
  color: #b89764;

  font-size: 0.48rem;
  font-weight: 800;

  letter-spacing: 0.12em;
}

.depoimento-produto-info strong {
  max-width: 220px;

  overflow: hidden;

  margin-top: 2px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 0.92rem;
  font-weight: 400;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.depoimento-estrelas {
  display: flex;
  gap: 3px;

  margin-top: 5px;

  color: #b89764;

  font-size: 8px;
}

.depoimento-texto {
  display: flex;
  align-items: flex-start;

  gap: 7px;

  margin-top: 21px;
  padding: 0 4px;
}

.depoimento-texto > i {
  flex-shrink: 0;

  color: #d7c19e;

  font-size: 9px;
}

.depoimento-texto > i:last-child {
  align-self: flex-end;
}

.depoimento-texto p {
  flex: 1;

  margin: 0;

  color: #6f5b4d;

  font-size: 0.72rem;
  font-weight: 500;

  line-height: 1.7;

  text-align: center;
}

.depoimentos-indicadores {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin-top: 13px;
}

.depoimentos-indicadores button {
  width: 6px;
  height: 6px;

  padding: 0;

  border: 0;
  border-radius: 50%;

  background: #ddcfbf;

  cursor: pointer;

  transition:
    width 0.25s ease,
    background 0.25s ease;
}

.depoimentos-indicadores button.ativo {
  width: 18px;

  border-radius: 10px;

  background: #b89764;
}

/* TRANSIÇÃO */

.avaliacao-fade-enter-active,
.avaliacao-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.avaliacao-fade-enter-from {
  opacity: 0;

  transform: translateY(8px);
}

.avaliacao-fade-leave-to {
  opacity: 0;

  transform: translateY(-8px);
}

/* PREPARADOS */

.preparados-conteudo {
  display: grid;
  gap: 28px;
}

.subtitulo-lista {
  margin-bottom: 13px;
}

.subtitulo-lista span {
  color: #a48452;

  font-size: 0.5rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.subtitulo-lista h3 {
  margin: 3px 0 0;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 1.05rem;
  font-weight: 400;
}

.btn-avaliar {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin-top: auto;
  padding: 7px 8px;

  border: 1px solid #e5d6c4;
  border-radius: 9px;

  background: #fffaf4;

  color: #8a6849;

  font-size: 0.55rem;
  font-weight: 700;

  cursor: pointer;
}

.btn-avaliar i {
  color: #b89764;
}

.historico-pedidos {
  padding-top: 4px;
}

.pedido-historico {
  margin-bottom: 11px;
  padding: 14px;

  border: 1px solid #eee3d8;
  border-radius: 16px;

  background: #fffdf9;
}

.pedido-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding-bottom: 11px;

  border-bottom: 1px solid #eee4da;
}

.pedido-label {
  display: block;

  color: #b89764;

  font-size: 0.46rem;
  font-weight: 800;

  letter-spacing: 0.12em;
}

.pedido-topo strong {
  display: block;

  margin-top: 2px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 0.82rem;
  font-weight: 400;
}

.pedido-data {
  color: #9a8776;

  font-size: 0.56rem;
}

.pedido-itens {
  padding: 10px 0;
}

.pedido-item {
  display: grid;

  grid-template-columns: 25px 1fr auto;

  gap: 6px;

  padding: 5px 0;

  font-size: 0.62rem;
}

.pedido-item > span {
  color: #b89764;
  font-weight: 700;
}

.pedido-item strong {
  overflow: hidden;

  color: #6d5748;

  font-weight: 500;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.pedido-item small {
  color: #8b715e;

  font-weight: 700;
}

.pedido-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 10px;

  border-top: 1px solid #eee4da;

  color: #8b796a;

  font-size: 0.6rem;
}

.pedido-total strong {
  color: #5e3023;

  font-size: 0.75rem;
}

/* MODAL */

.modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 18px;

  background: rgba(50, 32, 22, 0.42);

  backdrop-filter: blur(5px);
}

.modal-avaliacao {
  position: relative;

  width: min(100%, 390px);

  padding: 27px 21px 21px;

  border: 1px solid #eadfd2;
  border-radius: 23px;

  background: #fffdf9;

  box-shadow:
    0 20px 55px rgba(50, 32, 22, 0.2);

  text-align: center;
}

.modal-fechar {
  position: absolute;

  top: 12px;
  right: 12px;

  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 50%;

  background: #f5eadf;

  color: #806653;

  cursor: pointer;
}

.modal-icone {
  width: 49px;
  height: 49px;

  display: grid;
  place-items: center;

  margin: 0 auto 11px;

  border-radius: 15px;

  background: #f1e4d4;

  color: #b89764;

  font-size: 17px;
}

.modal-label {
  color: #b89764;

  font-size: 0.5rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.modal-avaliacao h2 {
  margin: 5px 0 5px;

  color: #5e3023;

  font-family: "Imprima", Georgia, serif;

  font-size: 1.35rem;
  font-weight: 400;
}

.modal-descricao {
  margin: 0;

  color: #968475;

  font-size: 0.68rem;
}

.estrelas-modal {
  display: flex;
  justify-content: center;

  gap: 8px;

  margin: 19px 0;
}

.estrelas-modal button {
  padding: 3px;

  border: 0;
  background: transparent;

  color: #ddd1c1;

  font-size: 20px;

  cursor: pointer;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.estrelas-modal button.selecionada {
  color: #b89764;

  transform: scale(1.08);
}

.campo-comentario {
  width: 100%;
  min-height: 105px;

  resize: vertical;

  padding: 12px;

  border: 1px solid #e5d9cd;
  border-radius: 13px;

  outline: none;

  background: #fffaf5;

  color: #5e3023;

  font-family: "DM Sans", sans-serif;

  font-size: 0.7rem;
  line-height: 1.5;
}

.campo-comentario:focus {
  border-color: #cdb38d;
}

.contador-caracteres {
  display: block;

  margin-top: 4px;

  color: #ae9b89;

  font-size: 0.48rem;

  text-align: right;
}

.btn-salvar-avaliacao {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  margin-top: 13px;
  padding: 11px;

  border: 0;
  border-radius: 11px;

  background: #5e3023;

  color: #fffaf4;

  font-size: 0.65rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.btn-salvar-avaliacao:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-salvar-avaliacao:disabled {
  opacity: 0.45;

  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-avaliacao,
.modal-leave-to .modal-avaliacao {
  transform: translateY(12px) scale(0.97);
}

/* TABLET / DESKTOP */

@media (min-width: 600px) {
  .pedidos-container {
    padding: 38px 28px 55px;
  }

  .abas {
    gap: 12px;
  }

  .aba {
    padding: 11px;
  }

  .aba-icone {
    width: 40px;
    height: 40px;
  }

  .aba-texto strong {
    font-size: 0.85rem;
  }

  .aba-texto small {
    font-size: 0.54rem;
  }

  .conteudo {
    padding: 25px 23px 30px;
  }

  .lista-produtos {
    grid-template-columns: repeat(2, 1fr);
  }

  .depoimento-card {
    min-height: 190px;
  }
}

@media (max-width: 370px) {
  .pedidos-container {
    padding: 22px 13px 35px;
  }

  .header-decoration {
    width: 62px;
    height: 62px;

    top: 67px;
  }

  .header-decoration i {
    font-size: 15px;
  }

  .abas {
    gap: 6px;
  }

  .aba {
    gap: 5px;

    padding: 7px;
    border-radius: 13px;
  }

  .aba-icone {
    width: 30px;
    height: 30px;

    border-radius: 9px;

    font-size: 10px;
  }

  .aba-texto strong {
    font-size: 0.69rem;
  }

  .aba-texto small {
    display: none;
  }

  .conteudo {
    padding: 16px 11px 21px;

    border-radius: 20px;
  }

  .produto-imagem {
    width: 70px;
    height: 70px;
  }

  .produto-info {
    padding-left: 9px;
  }

  .produto-info h3 {
    font-size: 0.85rem;
  }

  .depoimentos {
    margin-top: 26px;
    padding-top: 21px;
  }

  .depoimentos-titulo {
    gap: 7px;
  }

  .depoimentos-label {
    font-size: 0.43rem;
  }

  .depoimentos-titulo h3 {
    font-size: 0.95rem;
  }

  .depoimento-card {
    min-height: 190px;

    padding: 15px;

    border-radius: 18px;
  }

  .depoimento-imagem {
    width: 47px;
    height: 47px;
  }

  .depoimento-produto-info strong {
    max-width: 180px;

    font-size: 0.84rem;
  }

  .depoimento-texto {
    margin-top: 18px;
  }

  .depoimento-texto p {
    font-size: 0.68rem;
  }
}
</style>
