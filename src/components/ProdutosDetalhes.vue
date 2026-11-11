
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
const mostrarModal = ref(false);
const quantidade = ref(1);
const adicionando = ref(false);
const favorito = ref(false);
const atualizandoFavorito = ref(false);
const avaliacoes = ref([]);
const avaliacaoAtual = ref(0);

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const imagens = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

let intervaloAvaliacoes;
let requisicaoProduto = 0;

const precoNumerico = computed(() => {
  const valor = Number(produto.value?.preco);
  return Number.isFinite(valor) ? Math.max(0, valor) : 0;
});

const formatarPreco = (valor) =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const precoFormatado = computed(() => formatarPreco(precoNumerico.value));
const totalFormatado = computed(() =>
  formatarPreco(precoNumerico.value * quantidade.value)
);

const notaMedia = computed(() => {
  const nota = Number(produto.value?.avaliacao || 0);
  return Number.isFinite(nota) ? nota : 0;
});

const avaliacaoExibida = computed(
  () => avaliacoes.value[avaliacaoAtual.value] || null
);

function getImageUrl(imagem) {
  if (!imagem || typeof imagem !== "string") return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagem)) return imagem;

  const nome = imagem.split("/").pop()?.split("?")[0];
  const caminho = Object.keys(imagens).find((arquivo) =>
    arquivo.endsWith(`/${nome}`)
  );

  return caminho
    ? imagens[caminho]
    : imagem.startsWith("/")
      ? imagem
      : "";
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

function carregarAvaliacoes() {
  limparRotacaoAvaliacoes();

  try {
    const historico = JSON.parse(
      localStorage.getItem("historicoCompras") || "[]"
    );

    const idAtual = String(
      produto.value?.idProduto ?? produto.value?.id ?? ""
    );

    avaliacoes.value = Array.isArray(historico)
      ? historico.flatMap((pedido) =>
          (Array.isArray(pedido?.itens) ? pedido.itens : [])
            .filter((item) => {
              const id = String(item.idProduto ?? item.id ?? "");
              return (
                id === idAtual &&
                String(item.comentario || "").trim() &&
                Number(item.nota) > 0
              );
            })
            .map((item) => ({
              comentario: String(item.comentario).trim(),
              nota: Math.min(5, Number(item.nota)),
              nome: item.nome || produto.value?.nome || "Cliente",
            }))
        )
      : [];

    avaliacaoAtual.value = 0;
    iniciarRotacaoAvaliacoes();
  } catch {
    avaliacoes.value = [];
  }
}

async function carregarProduto() {
  const id = route.params.id;
  const requisicaoAtual = ++requisicaoProduto;

  carregando.value = true;
  erro.value = "";
  produto.value = null;
  mostrarModal.value = false;
  quantidade.value = 1;
  favorito.value = false;
  limparRotacaoAvaliacoes();

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/`
    );

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "Produto não encontrado."
          : "Não foi possível carregar o produto."
      );
    }

    const dados = await response.json();
    if (requisicaoAtual !== requisicaoProduto) return;

    produto.value = dados;
    favorito.value = Boolean(dados.favorito);
    carregarAvaliacoes();
  } catch (error) {
    if (requisicaoAtual !== requisicaoProduto) return;
    erro.value = error.message || "Erro ao carregar o produto.";
  } finally {
    if (requisicaoAtual === requisicaoProduto) {
      carregando.value = false;
    }
  }
}

function voltar() {
  if (window.history.length > 1) router.back();
  else router.push("/menu");
}

function abrirModal() {
  if (!produto.value || adicionando.value) return;
  quantidade.value = 1;
  mostrarModal.value = true;
}

function fecharModal() {
  if (!adicionando.value) mostrarModal.value = false;
}

function alterarQuantidade(valor) {
  quantidade.value = Math.min(99, Math.max(1, quantidade.value + valor));
}

async function adicionarAoCarrinho() {
  if (!produto.value || adicionando.value) return false;

  adicionando.value = true;

  try {
    for (let i = 0; i < quantidade.value; i++) {
      cartStore.adicionarItem(produto.value);
    }

    mostrarModal.value = false;
    return true;
  } catch {
    erro.value = "Não foi possível adicionar o produto ao carrinho.";
    return false;
  } finally {
    adicionando.value = false;
  }
}

async function comprarAgora() {
  if (await adicionarAoCarrinho()) {
    router.push("/carrinho");
  }
}

async function alternarFavorito() {
  if (!produto.value || atualizandoFavorito.value) return;

  atualizandoFavorito.value = true;

  const novoStatus = !favorito.value;
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const id = produto.value.idProduto ?? produto.value.id;
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(id)}/favorito/`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ favorito: novoStatus }),
      }
    );

    if (!response.ok) throw new Error("Falha ao atualizar favorito.");

    favorito.value = novoStatus;
    produto.value.favorito = novoStatus;
    window.dispatchEvent(new Event("favoritos-atualizados"));
  } catch {
    erro.value = "Não foi possível atualizar o favorito. Tente novamente.";
  } finally {
    atualizandoFavorito.value = false;
  }
}

function selecionarAvaliacao(index) {
  avaliacaoAtual.value = index;
  iniciarRotacaoAvaliacoes();
}

watch(() => route.params.id, carregarProduto, { immediate: true });

onBeforeUnmount(() => {
  requisicaoProduto++;
  limparRotacaoAvaliacoes();
});
</script>

<template>
  <div class="pagina-detalhes">
    <div v-if="carregando" class="estado-pagina" role="status">
      <span class="carregamento-spinner"></span>
      <p>Preparando os detalhes do produto...</p>
    </div>

    <div v-else-if="erro && !produto" class="estado-pagina">
      <i class="fas fa-cookie-bite"></i>
      <h2>Ops! Não encontramos o produto</h2>
      <p>{{ erro }}</p>
      <button class="botao-tentar" type="button" @click="carregarProduto">
        Tentar novamente
      </button>
      <button class="botao-voltar-estado" type="button" @click="voltar">
        Voltar
      </button>
    </div>

    <template v-else-if="produto">
      <main class="produto">
        <section class="hero">
          <img
            v-if="getImageUrl(produto.imagem)"
            class="imagem-produto"
            :src="getImageUrl(produto.imagem)"
            :alt="produto.nome"
            fetchpriority="high"
          />

          <div v-else class="imagem-produto imagem-placeholder">
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

          <button
            class="botao-favorito"
            type="button"
            :disabled="atualizandoFavorito"
            :aria-pressed="favorito"
            :aria-label="favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
            @click="alternarFavorito"
          >
            <i :class="favorito ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>

          <div class="avaliacao-hero">
            <i class="fas fa-star"></i>
            <span>{{ notaMedia.toFixed(1) }}</span>
          </div>
        </section>

        <section class="conteudo">
          <p v-if="erro" class="aviso-erro" role="alert">{{ erro }}</p>

          <div class="cabecalho-produto">
            <div class="nome-produto">
              <span class="categoria">Produto artesanal</span>
              <h1>{{ produto.nome }}</h1>
            </div>
            <div class="preco"><small>R$</small> {{ precoFormatado }}</div>
          </div>

          <div class="divisor"></div>

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
                  <p>{{ produto.ingredientes_base || "Ingredientes não informados" }}</p>
                </div>
              </article>

              <article class="ingrediente-card">
                <div class="ingrediente-icone">
                  <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="ingrediente-texto">
                  <span>Cobertura</span>
                  <p>{{ produto.ingredientes_creme || "Sem cobertura" }}</p>
                </div>
              </article>
            </div>
          </section>

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

          <section v-if="avaliacaoExibida" class="avaliacoes-produto">
            <div class="avaliacoes-cabecalho">
              <div class="titulo-secao">
                <span class="linha-titulo"></span>
                <h2>O que nossos clientes dizem</h2>
              </div>
              <i class="fas fa-quote-right avaliacao-aspas"></i>
            </div>

            <Transition name="avaliacao" mode="out-in">
              <article :key="avaliacaoAtual" class="avaliacao-destaque">
                <div class="avaliacao-estrelas">
                  <i
                    v-for="estrela in 5"
                    :key="estrela"
                    class="fas fa-star"
                    :class="{ ativa: estrela <= avaliacaoExibida.nota }"
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
                    <strong>{{ avaliacaoExibida.nome }}</strong>
                    <small>Cliente da Padaria Martins</small>
                  </div>
                </div>
              </article>
            </Transition>

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
          </section>
        </section>
      </main>

      <footer class="barra-compra">
        <div class="resumo-compra">
          <span>Total</span>
          <strong>R$ {{ totalFormatado }}</strong>
        </div>

        <button class="botao-adicionar" type="button" @click="abrirModal">
          <i class="fas fa-shopping-bag"></i>
          <span>Adicionar ao carrinho</span>
        </button>
      </footer>

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

            <span class="modal-label">ADICIONAR AO PEDIDO</span>
            <h2>{{ produto.nome }}</h2>
            <p class="modal-preco">R$ {{ precoFormatado }} por unidade</p>

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

            <div class="modal-total">
              <span>Total</span>
              <strong>R$ {{ totalFormatado }}</strong>
            </div>

            <button
              class="modal-adicionar"
              type="button"
              :disabled="adicionando"
              @click="adicionarAoCarrinho"
            >
              <i class="fas fa-shopping-cart"></i>
              {{ adicionando ? "Adicionando..." : "Adicionar ao carrinho" }}
            </button>

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
