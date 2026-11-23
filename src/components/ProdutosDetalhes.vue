
<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/composables/useCart";
import "@/assets/css/detalhesProduto.css";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const produto = ref(null);
const carregando = ref(true);
const erro = ref("");
const sucesso = ref("");

const mostrarModal = ref(false);
const quantidade = ref(1);
const adicionando = ref(false);

const favorito = ref(false);
const atualizandoFavorito = ref(false);

const avaliacoes = ref([]);
const avaliacaoAtual = ref(0);
const mediaAvaliacoes = ref(0);
const quantidadeAvaliacoes = ref(0);
const carregandoAvaliacoes = ref(false);

const notaSelecionada = ref(0);
const comentarioNovo = ref("");
const enviandoAvaliacao = ref(false);

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const imagens = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

let intervaloAvaliacoes = null;
let requisicaoProduto = 0;

const idProduto = computed(() => {
  return produto.value?.idProduto ?? produto.value?.id ?? route.params.id;
});

const precoNumerico = computed(() => {
  const precoComDesconto = Number(produto.value?.preco_com_desconto);

  if (
    produto.value?.preco_com_desconto !== null &&
    produto.value?.preco_com_desconto !== undefined &&
    Number.isFinite(precoComDesconto)
  ) {
    return Math.max(0, precoComDesconto);
  }

  const preco = Number(produto.value?.preco);

  return Number.isFinite(preco) ? Math.max(0, preco) : 0;
});

const formatarPreco = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const precoFormatado = computed(() => {
  return formatarPreco(precoNumerico.value);
});

const totalFormatado = computed(() => {
  return formatarPreco(precoNumerico.value * quantidade.value);
});

const notaMedia = computed(() => {
  const nota = Number(mediaAvaliacoes.value || 0);

  return Number.isFinite(nota)
    ? Math.min(5, Math.max(0, nota))
    : 0;
});

const avaliacaoExibida = computed(() => {
  return avaliacoes.value[avaliacaoAtual.value] || null;
});

function obterHeaders(comJson = true) {
  const headers = {};

  if (comJson) {
    headers["Content-Type"] = "application/json";
  }

  const jwt = localStorage.getItem("token");

  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  return headers;
}

function getImageUrl(imagem) {
  if (!imagem || typeof imagem !== "string") {
    return "";
  }

  if (/^(https?:\/\/|data:|blob:)/i.test(imagem)) {
    return imagem;
  }

  const nome = imagem.split("/").pop()?.split("?")[0];

  if (!nome) {
    return "";
  }

  const caminho = Object.keys(imagens).find((arquivo) =>
    arquivo.endsWith(`/${nome}`)
  );

  if (caminho) {
    return imagens[caminho];
  }

  if (imagem.startsWith("/")) {
    return imagem;
  }

  return "";
}

function exigirLogin() {
  if (localStorage.getItem("token")) {
    return true;
  }

  erro.value = "Entre na sua conta para realizar esta ação.";

  router.push({
    path: "/",
    query: {
      redirect: route.fullPath,
    },
  });

  return false;
}

function limparMensagens() {
  erro.value = "";
  sucesso.value = "";
}

function limparRotacaoAvaliacoes() {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
    intervaloAvaliacoes = null;
  }
}

function iniciarRotacaoAvaliacoes() {
  limparRotacaoAvaliacoes();

  if (avaliacoes.value.length > 1) {
    intervaloAvaliacoes = setInterval(() => {
      avaliacaoAtual.value =
        (avaliacaoAtual.value + 1) % avaliacoes.value.length;
    }, 5000);
  }
}

async function carregarAvaliacoes(id, requisicaoAtual) {
  limparRotacaoAvaliacoes();

  avaliacoes.value = [];
  avaliacaoAtual.value = 0;
  mediaAvaliacoes.value = 0;
  quantidadeAvaliacoes.value = 0;

  carregandoAvaliacoes.value = true;

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/avaliacoes/`,
      {
        headers: obterHeaders(false),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar as avaliações.");
    }

    const dados = await response.json();

    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    mediaAvaliacoes.value = Number(dados.media) || 0;
    quantidadeAvaliacoes.value = Number(dados.quantidade) || 0;

    avaliacoes.value = Array.isArray(dados.avaliacoes)
      ? dados.avaliacoes
          .map((item) => ({
            id: item.id,
            comentario: String(item.comentario || "").trim(),
            nota: Math.min(
              5,
              Math.max(0, Number(item.nota) || 0)
            ),
            nome: String(item.nome_usuario || "Cliente"),
            criadoEm: item.criado_em || null,
          }))
          .filter((item) => item.nota > 0 && item.comentario)
      : [];

    iniciarRotacaoAvaliacoes();
  } catch (error) {
    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    console.error("Erro ao carregar avaliações:", error);

    avaliacoes.value = [];
    mediaAvaliacoes.value = 0;
    quantidadeAvaliacoes.value = 0;
  } finally {
    if (requisicaoAtual === requisicaoProduto) {
      carregandoAvaliacoes.value = false;
    }
  }
}

async function carregarProduto() {
  const id = route.params.id;
  const requisicaoAtual = ++requisicaoProduto;

  carregando.value = true;
  erro.value = "";
  sucesso.value = "";

  produto.value = null;
  favorito.value = false;

  mostrarModal.value = false;
  quantidade.value = 1;

  notaSelecionada.value = 0;
  comentarioNovo.value = "";

  avaliacoes.value = [];
  avaliacaoAtual.value = 0;
  mediaAvaliacoes.value = 0;
  quantidadeAvaliacoes.value = 0;

  limparRotacaoAvaliacoes();

  if (!id) {
    erro.value = "Identificador do produto não informado.";
    carregando.value = false;
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/`,
      {
        method: "GET",
        headers: obterHeaders(false),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Produto não encontrado.");
      }

      throw new Error(
        `Não foi possível carregar o produto. HTTP ${response.status}`
      );
    }

    const dados = await response.json();

    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    produto.value = dados;
    favorito.value = Boolean(dados.favorito);

    await carregarAvaliacoes(id, requisicaoAtual);
  } catch (error) {
    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    console.error("Erro ao carregar produto:", error);

    erro.value = error.message || "Erro ao carregar o produto.";
  } finally {
    if (requisicaoAtual === requisicaoProduto) {
      carregando.value = false;
    }
  }
}

function voltar() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/menu");
  }
}

function abrirModal() {
  if (!produto.value || adicionando.value) {
    return;
  }

  limparMensagens();
  quantidade.value = 1;
  mostrarModal.value = true;
}

function fecharModal() {
  if (!adicionando.value) {
    mostrarModal.value = false;
  }
}

function alterarQuantidade(valor) {
  quantidade.value = Math.min(
    99,
    Math.max(1, quantidade.value + valor)
  );
}

async function adicionarAoCarrinho() {
  if (!produto.value || adicionando.value) {
    return false;
  }

  adicionando.value = true;

  try {
    for (let i = 0; i < quantidade.value; i++) {
      cartStore.adicionarItem(produto.value);
    }

    mostrarModal.value = false;

    return true;
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);

    erro.value = "Não foi possível adicionar o produto ao carrinho.";

    return false;
  } finally {
    adicionando.value = false;
  }
}

async function comprarAgora() {
  const adicionado = await adicionarAoCarrinho();

  if (adicionado) {
    router.push("/carrinho");
  }
}

// ============================================
// FAVORITOS
// ============================================

async function alternarFavorito() {
  if (!produto.value || atualizandoFavorito.value) {
    return;
  }

  limparMensagens();

  if (!exigirLogin()) {
    return;
  }

  const id = idProduto.value;

  if (!id) {
    erro.value = "Não foi possível identificar este produto.";
    return;
  }

  atualizandoFavorito.value = true;

  const novoStatus = !favorito.value;

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/favorito/`,
      {
        method: "PATCH",
        headers: obterHeaders(),
        body: JSON.stringify({
          favorito: novoStatus,
        }),
      }
    );

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      throw new Error(
        dados.detail ||
        dados.erro ||
        "Não foi possível atualizar o favorito."
      );
    }

    favorito.value = Boolean(dados.favorito);
    produto.value.favorito = favorito.value;

    window.dispatchEvent(new Event("favoritos-atualizados"));

    sucesso.value = favorito.value
      ? "Produto adicionado aos favoritos!"
      : "Produto removido dos favoritos!";
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    erro.value = error.message;
  } finally {
    atualizandoFavorito.value = false;
  }
}

// ============================================
// AVALIAÇÕES
// ============================================

function selecionarNota(nota) {
  notaSelecionada.value = nota;
}

async function enviarAvaliacao() {
  if (enviandoAvaliacao.value || !produto.value) {
    return;
  }

  limparMensagens();

  if (!exigirLogin()) {
    return;
  }

  if (notaSelecionada.value < 1 || notaSelecionada.value > 5) {
    erro.value = "Selecione uma nota de 1 a 5 estrelas.";
    return;
  }

  const comentario = comentarioNovo.value.trim();

  if (!comentario) {
    erro.value = "Escreva um comentário antes de enviar.";
    return;
  }

  if (comentario.length > 1000) {
    erro.value = "O comentário deve ter no máximo 1000 caracteres.";
    return;
  }

  const id = idProduto.value;
  const requisicaoAtual = requisicaoProduto;

  enviandoAvaliacao.value = true;

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/avaliacoes/`,
      {
        method: "POST",
        headers: obterHeaders(),
        body: JSON.stringify({
          nota: notaSelecionada.value,
          comentario,
        }),
      }
    );

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      const detalhe =
        dados.detail ||
        dados.erro ||
        dados.nota ||
        dados.comentario;

      throw new Error(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível enviar sua avaliação."
      );
    }

    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    comentarioNovo.value = "";
    notaSelecionada.value = 0;

    await carregarAvaliacoes(id, requisicaoAtual);

    if (requisicaoAtual === requisicaoProduto) {
      sucesso.value =
        dados.message ||
        dados.mensagem ||
        "Sua avaliação foi registrada com sucesso!";
    }
  } catch (error) {
    if (requisicaoAtual !== requisicaoProduto) {
      return;
    }

    console.error("Erro ao enviar avaliação:", error);
    erro.value = error.message;
  } finally {
    enviandoAvaliacao.value = false;
  }
}

function selecionarAvaliacao(index) {
  if (index < 0 || index >= avaliacoes.value.length) {
    return;
  }

  avaliacaoAtual.value = index;
  iniciarRotacaoAvaliacoes();
}

watch(
  () => route.params.id,
  () => {
    carregarProduto();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  requisicaoProduto++;
  limparRotacaoAvaliacoes();
});
</script>


<template>
  <div class="pagina-detalhes">

    <!-- CARREGAMENTO -->
    <div
      v-if="carregando"
      class="estado-pagina"
      role="status"
    >
      <span class="carregamento-spinner"></span>
      <p>Preparando os detalhes do produto...</p>
    </div>

    <!-- ERRO -->
    <div
      v-else-if="erro && !produto"
      class="estado-pagina"
    >
      <i class="fas fa-cookie-bite"></i>

      <h2>Ops! Não encontramos o produto</h2>

      <p>{{ erro }}</p>

      <button
        class="botao-tentar"
        type="button"
        @click="carregarProduto"
      >
        Tentar novamente
      </button>

      <button
        class="botao-voltar-estado"
        type="button"
        @click="voltar"
      >
        Voltar
      </button>
    </div>

    <template v-else-if="produto">

      <main class="produto">

        <!-- IMAGEM DO PRODUTO -->
        <section class="hero">

          <img
            v-if="getImageUrl(produto.imagem)"
            class="imagem-produto"
            :src="getImageUrl(produto.imagem)"
            :alt="produto.nome"
            fetchpriority="high"
          />

          <div
            v-else
            class="imagem-produto imagem-placeholder"
          >
            <i class="fas fa-cookie-bite"></i>
          </div>

          <div class="hero-overlay"></div>

          <button
            class="botao-voltar"
            type="button"
            aria-label="Voltar"
            @click="voltar"
          >
            <i class="fas fa-arrow-left"></i>
          </button>

          <!-- FAVORITO -->
          <button
            class="botao-favorito"
            type="button"
            :disabled="atualizandoFavorito"
            :aria-pressed="favorito"
            :aria-label="
              favorito
                ? 'Remover dos favoritos'
                : 'Adicionar aos favoritos'
            "
            @click="alternarFavorito"
          >
            <i
              :class="
                atualizandoFavorito
                  ? 'fas fa-spinner fa-spin'
                  : favorito
                    ? 'fas fa-heart'
                    : 'far fa-heart'
              "
            ></i>
          </button>

          <!-- NOTA REAL -->
          <div class="avaliacao-hero">

            <i class="fas fa-star"></i>

            <span>
              {{ quantidadeAvaliacoes > 0 ? notaMedia.toFixed(1) : "—" }}
            </span>

            <small v-if="quantidadeAvaliacoes > 0">
              ({{ quantidadeAvaliacoes }})
            </small>

          </div>
        </section>

        <!-- CONTEÚDO -->
        <section class="conteudo">

          <!-- MENSAGENS -->
          <div
            v-if="erro"
            class="aviso-erro"
            role="alert"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ erro }}
          </div>

          <div
            v-if="sucesso"
            class="aviso-sucesso"
            role="status"
          >
            <i class="fas fa-check-circle"></i>
            {{ sucesso }}
          </div>

          <!-- CABEÇALHO -->
          <div class="cabecalho-produto">

            <div class="nome-produto">

              <span class="categoria">
                Produto artesanal
              </span>

              <h1>{{ produto.nome }}</h1>

            </div>

            <div class="preco">
              <small>R$</small>
              {{ precoFormatado }}
            </div>

          </div>

          <div class="divisor"></div>

          <!-- INGREDIENTES -->
          <section class="secao">

            <div class="titulo-secao">
              <span class="linha-titulo"></span>
              <h2>Ingredientes</h2>
            </div>

            <div class="ingredientes">

              <article class="ingrediente-card">

                <div class="ingrediente-icone">
                  <i class="fas fa-bread-slice"></i>
                </div>

                <div class="ingrediente-texto">

                  <span>Base</span>

                  <p>
                    {{
                      produto.ingredientes_base ||
                      "Ingredientes não informados"
                    }}
                  </p>

                </div>

              </article>

              <article class="ingrediente-card">

                <div class="ingrediente-icone">
                  <i class="fas fa-cookie-bite"></i>
                </div>

                <div class="ingrediente-texto">

                  <span>Cobertura</span>

                  <p>
                    {{
                      produto.ingredientes_creme ||
                      "Sem cobertura"
                    }}
                  </p>

                </div>

              </article>

            </div>

          </section>

          <!-- MENSAGEM -->
          <section class="mensagem">

            <div class="mensagem-icone">
              <i class="fas fa-heart"></i>
            </div>

            <div>

              <strong>Feito com carinho</strong>

              <p>
                Preparado com ingredientes selecionados para deixar seu
                momento ainda mais especial.
              </p>

            </div>

          </section>

          <!-- AVALIAÇÕES -->
          <section class="avaliacoes-produto">

            <div class="avaliacoes-cabecalho">

              <div class="titulo-secao">
                <span class="linha-titulo"></span>
                <h2>O que nossos clientes dizem</h2>
              </div>

              <i class="fas fa-quote-right avaliacao-aspas"></i>

            </div>

            <!-- RESUMO DA MÉDIA -->
            <div class="resumo-avaliacoes">

              <div class="media-grande">
                {{ quantidadeAvaliacoes > 0 ? notaMedia.toFixed(1) : "—" }}
              </div>

              <div class="media-detalhes">

                <div class="media-estrelas">
                  <i
                    v-for="estrela in 5"
                    :key="estrela"
                    class="fas fa-star"
                    :class="{ ativa: estrela <= Math.round(notaMedia) }"
                  ></i>
                </div>

                <span>
                  {{ quantidadeAvaliacoes }}
                  {{ quantidadeAvaliacoes === 1 ? "avaliação" : "avaliações" }}
                </span>

              </div>

            </div>

            <!-- CARREGANDO -->
            <div
              v-if="carregandoAvaliacoes"
              class="avaliacao-vazia"
            >
              <span class="carregamento-spinner"></span>
              <p>Carregando avaliações...</p>
            </div>

            <!-- COMENTÁRIOS -->
            <template v-else-if="avaliacaoExibida">

              <Transition
                name="avaliacao"
                mode="out-in"
              >

                <article
                  :key="avaliacaoExibida.id"
                  class="avaliacao-destaque"
                >

                  <div class="avaliacao-estrelas">

                    <i
                      v-for="estrela in 5"
                      :key="estrela"
                      class="fas fa-star"
                      :class="{
                        ativa: estrela <= avaliacaoExibida.nota
                      }"
                    ></i>

                  </div>

                  <p class="avaliacao-comentario">
                    “{{ avaliacaoExibida.comentario }}”
                  </p>

                  <div class="avaliacao-cliente">

                    <span class="cliente-icone">
                      <i class="fas fa-user"></i>
                    </span>

                    <div>

                      <strong>
                        {{ avaliacaoExibida.nome }}
                      </strong>

                      <small>
                        Cliente da Padaria Martins
                      </small>

                    </div>

                  </div>

                </article>

              </Transition>

              <!-- INDICADORES -->
              <div
                v-if="avaliacoes.length > 1"
                class="avaliacao-indicadores"
                aria-label="Selecionar avaliação"
              >

                <button
                  v-for="(_, index) in avaliacoes"
                  :key="index"
                  type="button"
                  :class="{ ativo: index === avaliacaoAtual }"
                  :aria-label="`Mostrar avaliação ${index + 1}`"
                  :aria-pressed="index === avaliacaoAtual"
                  @click="selecionarAvaliacao(index)"
                ></button>

              </div>

            </template>

            <!-- SEM COMENTÁRIOS -->
            <div
              v-else-if="quantidadeAvaliacoes > 0"
              class="avaliacao-vazia"
            >

              <i class="far fa-comment-dots"></i>

              <p>
                Este produto já possui
                {{ quantidadeAvaliacoes }}
                {{ quantidadeAvaliacoes === 1 ? "avaliação" : "avaliações" }}.
              </p>

              <small>
                Ainda não há comentários escritos.
              </small>

            </div>

            <!-- SEM AVALIAÇÕES -->
            <div
              v-else
              class="avaliacao-vazia"
            >

              <i class="far fa-star"></i>

              <p>
                Este produto ainda não possui avaliações.
              </p>

              <small>
                Seja um dos primeiros clientes a avaliar!
              </small>

            </div>

            <!-- FORMULÁRIO -->
            <div class="formulario-avaliacao">

              <div class="titulo-secao">
                <span class="linha-titulo"></span>
                <h2>Deixe sua avaliação</h2>
              </div>

              <p class="formulario-descricao">
                Conte como foi sua experiência com este produto.
              </p>

              <!-- ESTRELAS -->
              <div
                class="seletor-estrelas"
                role="group"
                aria-label="Escolha sua nota"
              >

                <button
                  v-for="estrela in 5"
                  :key="estrela"
                  type="button"
                  :class="{
                    selecionada: estrela <= notaSelecionada
                  }"
                  :aria-label="`${estrela} estrelas`"
                  :aria-pressed="estrela === notaSelecionada"
                  :disabled="enviandoAvaliacao"
                  @click="selecionarNota(estrela)"
                >

                  <i class="fas fa-star"></i>

                </button>

              </div>

              <span
                v-if="notaSelecionada"
                class="nota-selecionada"
              >
                {{ notaSelecionada }}
                {{ notaSelecionada === 1 ? "estrela" : "estrelas" }} selecionadas
              </span>

              <!-- COMENTÁRIO -->
              <label
                class="label-comentario"
                for="comentario-produto"
              >
                Seu comentário
              </label>

              <textarea
                id="comentario-produto"
                v-model="comentarioNovo"
                maxlength="1000"
                rows="4"
                placeholder="Conte o que achou deste produto..."
                :disabled="enviandoAvaliacao"
              ></textarea>

              <div class="contador-comentario">
                {{ comentarioNovo.length }}/1000 caracteres
              </div>

              <!-- ENVIAR -->
              <button
                class="botao-enviar-avaliacao"
                type="button"
                :disabled="enviandoAvaliacao"
                @click="enviarAvaliacao"
              >

                <i
                  :class="
                    enviandoAvaliacao
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-paper-plane'
                  "
                ></i>

                {{
                  enviandoAvaliacao
                    ? "Enviando avaliação..."
                    : "Publicar avaliação"
                }}

              </button>

              <small class="aviso-login-avaliacao">
                É necessário estar conectado à sua conta para avaliar.
              </small>

            </div>

          </section>

        </section>

      </main>

      <!-- BARRA DE COMPRA -->
      <footer class="barra-compra">

        <div class="resumo-compra">

          <span>Total</span>

          <strong>
            R$ {{ totalFormatado }}
          </strong>

        </div>

        <button
          class="botao-adicionar"
          type="button"
          @click="abrirModal"
        >

          <i class="fas fa-shopping-bag"></i>
          <span>Adicionar ao carrinho</span>

        </button>

      </footer>

      <!-- MODAL -->
      <Transition name="modal">

        <div
          v-if="mostrarModal"
          class="modal-overlay"
          @click.self="fecharModal"
        >

          <section
            class="modal"
            role="dialog"
            aria-modal="true"
            :aria-label="`Adicionar ${produto.nome} ao pedido`"
          >

            <button
              class="modal-fechar"
              type="button"
              aria-label="Fechar"
              :disabled="adicionando"
              @click="fecharModal"
            >

              <i class="fas fa-times"></i>

            </button>

            <div class="modal-icone">
              <i class="fas fa-shopping-bag"></i>
            </div>

            <span class="modal-label">
              ADICIONAR AO PEDIDO
            </span>

            <h2>{{ produto.nome }}</h2>

            <p class="modal-preco">
              R$ {{ precoFormatado }} por unidade
            </p>

            <!-- QUANTIDADE -->
            <div class="quantidade-box">

              <button
                type="button"
                aria-label="Diminuir quantidade"
                :disabled="quantidade <= 1 || adicionando"
                @click="alterarQuantidade(-1)"
              >
                −
              </button>

              <strong>{{ quantidade }}</strong>

              <button
                type="button"
                aria-label="Aumentar quantidade"
                :disabled="quantidade >= 99 || adicionando"
                @click="alterarQuantidade(1)"
              >
                +
              </button>

            </div>

            <!-- TOTAL -->
            <div class="modal-total">

              <span>Total</span>

              <strong>
                R$ {{ totalFormatado }}
              </strong>

            </div>

            <!-- ADICIONAR -->
            <button
              class="modal-adicionar"
              type="button"
              :disabled="adicionando"
              @click="adicionarAoCarrinho"
            >

              <i class="fas fa-shopping-cart"></i>

              {{
                adicionando
                  ? "Adicionando..."
                  : "Adicionar ao carrinho"
              }}

            </button>

            <!-- COMPRAR AGORA -->
            <button
              class="modal-comprar"
              type="button"
              :disabled="adicionando"
              @click="comprarAgora"
            >
              Comprar agora
            </button>

          </section>

        </div>

      </Transition>

    </template>

  </div>
</template>
