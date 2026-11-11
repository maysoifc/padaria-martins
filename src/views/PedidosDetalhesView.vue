<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import "../assets/css/MeusPedidosView.css";

const router = useRouter();
const route = useRoute();
const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

const imagensLocais = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default"
});

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

const abas = [
  { id: "favoritos", nome: "Favoritos", descricao: "Seus queridinhos", icone: "fa-heart" },
  { id: "avaliados", nome: "Avaliados", descricao: "Suas avaliações", icone: "fa-star" },
  { id: "preparados", nome: "Preparados", descricao: "Seus pedidos", icone: "fa-utensils" }
];

const tipoAtual = computed(() => route.params.tipo);
const abaAtual = computed(() => abas.find(({ id }) => id === tipoAtual.value) || abas[2]);

const voltarParaPerfil = () => router.push("/perfil");
const mudarAba = (id) => router.push(`/pedidos/${id}`);
const irParaMenu = () => router.push("/menu");
const idProduto = (produto) => produto?.idProduto ?? produto?.id ?? produto?.nome;
const idPedido = (pedido, index) => pedido?.id ?? pedido?.idPedido ?? index;

const getImageUrl = (produto) => {
  const imagem = produto?.imagem || produto?.foto || produto?.image || produto?.foto_produto;
  if (!imagem) return "";
  if (/^(https?:\/\/|data:)/i.test(imagem)) return imagem;

  const nomeArquivo = String(imagem).split("/").pop();
  return imagensLocais[`../assets/img/${nomeArquivo}`] || "";
};

const carregarPedidos = () => {
  carregando.value = true;

  try {
    const dados = JSON.parse(localStorage.getItem("historicoCompras") || "[]");
    pedidos.value = Array.isArray(dados) ? dados : [];
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
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

    const response = await fetch(`${API_URL}/produtos/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Não foi possível carregar os favoritos.");

    const dados = await response.json();
    const lista = Array.isArray(dados) ? dados : dados.results || [];
    favoritos.value = lista.filter((produto) => produto.favorito === true);
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
    favoritos.value = [];
  } finally {
    carregandoFavoritos.value = false;
  }
};

const removerFavorito = async (produto) => {
  const id = idProduto(produto);
  const token = localStorage.getItem("token");
  if (!id || !token) return;

  try {
    const response = await fetch(`${API_URL}/produtos/${id}/favorito/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ favorito: false })
    });

    if (!response.ok) throw new Error("Não foi possível remover o favorito.");

    favoritos.value = favoritos.value.filter(
      (item) => String(idProduto(item)) !== String(id)
    );
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
  }
};

const abrirProduto = (produto) => {
  const id = idProduto(produto);
  if (id) router.push(`/produto/${id}`);
};

const produtosComprados = computed(() =>
  pedidos.value.flatMap((pedido, index) =>
    (Array.isArray(pedido.itens) ? pedido.itens : []).map((item) => ({
      ...item,
      _pedidoId: idPedido(pedido, index),
      _dataCompra: pedido.data ?? pedido.dataCompra ?? pedido.criadoEm ?? pedido.created_at
    }))
  )
);

const produtosUnicos = computed(() => {
  const mapa = new Map();
  produtosComprados.value.forEach((produto) => mapa.set(String(idProduto(produto)), produto));
  return [...mapa.values()];
});

const produtosAvaliados = computed(() => {
  const mapa = new Map();

  produtosComprados.value.forEach((produto) => {
    if (produto.avaliado && Number(produto.nota) > 0) {
      mapa.set(String(idProduto(produto)), produto);
    }
  });

  return [...mapa.values()];
});

const pedidosFormatados = computed(() =>
  pedidos.value.map((pedido, index) => ({
    ...pedido,
    _id: idPedido(pedido, index),
    _itens: Array.isArray(pedido.itens) ? pedido.itens : []
  }))
);

const avaliacoesComComentario = computed(() =>
  produtosAvaliados.value.filter(
    (produto) => typeof produto.comentario === "string" && produto.comentario.trim()
  )
);

const pararRotacaoAvaliacoes = () => {
  if (intervaloAvaliacoes) clearInterval(intervaloAvaliacoes);
  intervaloAvaliacoes = null;
};

const iniciarRotacaoAvaliacoes = () => {
  pararRotacaoAvaliacoes();
  avaliacaoAtual.value = 0;

  if (avaliacoesComComentario.value.length <= 1) return;

  intervaloAvaliacoes = setInterval(() => {
    avaliacaoAtual.value =
      (avaliacaoAtual.value + 1) % avaliacoesComComentario.value.length;
  }, 5000);
};

watch(() => avaliacoesComComentario.value.length, iniciarRotacaoAvaliacoes);

const selecionarAvaliacao = (index) => {
  avaliacaoAtual.value = index;
  iniciarRotacaoAvaliacoes();
  avaliacaoAtual.value = index;
};

const formatarData = (data) => {
  if (!data) return "Data não informada";

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return String(data);

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const formatarPreco = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const totalPedido = (pedido) => {
  if (pedido.total !== undefined && pedido.total !== null) {
    return Number(pedido.total) || 0;
  }

  return pedido._itens?.reduce((total, item) => {
    const preco = Number(item.preco ?? item.valor ?? item.price ?? 0);
    const quantidade = Number(item.quantidade ?? item.qtd ?? 1);
    return total + preco * quantidade;
  }, 0) || 0;
};

const abrirAvaliacao = (produto) => {
  produtoAvaliando.value = produto;
  notaSelecionada.value = Number(produto.nota || 0);
  comentarioAvaliacao.value = produto.comentario || "";
};

const fecharAvaliacao = () => {
  produtoAvaliando.value = null;
  notaSelecionada.value = 0;
  comentarioAvaliacao.value = "";
  salvandoAvaliacao.value = false;
};

const salvarAvaliacao = () => {
  const produto = produtoAvaliando.value;
  if (!produto || notaSelecionada.value <= 0 || salvandoAvaliacao.value) return;

  salvandoAvaliacao.value = true;

  try {
    const produtoId = idProduto(produto);
    const pedidoIdAtual = produto._pedidoId;
    let encontrou = false;

    const novosPedidos = pedidos.value.map((pedido, index) => {
      if (String(idPedido(pedido, index)) !== String(pedidoIdAtual)) return pedido;

      const itens = (Array.isArray(pedido.itens) ? pedido.itens : []).map((item) => {
        const corresponde = String(idProduto(item)) === String(produtoId);
        if (!corresponde) return item;

        encontrou = true;
        return {
          ...item,
          avaliado: true,
          nota: notaSelecionada.value,
          comentario: comentarioAvaliacao.value.trim()
        };
      });

      return { ...pedido, itens };
    });

    if (!encontrou) {
      window.alert("Não foi possível localizar esse produto no histórico. Atualize a página e tente novamente.");
      return;
    }

    localStorage.setItem("historicoCompras", JSON.stringify(novosPedidos));
    pedidos.value = novosPedidos;
    fecharAvaliacao();
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    window.alert("Não foi possível salvar a avaliação. Tente novamente.");
  } finally {
    salvandoAvaliacao.value = false;
  }
};

onMounted(() => {
  carregarPedidos();
  carregarFavoritos();
  iniciarRotacaoAvaliacoes();
});

onBeforeUnmount(pararRotacaoAvaliacoes);
</script>

<template>
  <div class="pedidos-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="pedidos-container">
      <header class="pedidos-header">
        <button type="button" class="btn-voltar" @click="voltarParaPerfil">
          <span class="voltar-icon"><i class="fa-solid fa-arrow-left"></i></span>
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

      <nav class="abas">
        <button
          v-for="aba in abas"
          :key="aba.id"
          type="button"
          class="aba"
          :class="{ ativa: tipoAtual === aba.id }"
          @click="mudarAba(aba.id)"
        >
          <span class="aba-icone"><i :class="`fa-solid ${aba.icone}`"></i></span>
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
              <div class="icone-conteudo"><i class="fa-solid fa-heart"></i></div>
              <div><span>SEUS QUERIDINHOS</span><h2>Favoritos</h2></div>
            </div>
            <span class="contador">{{ favoritos.length }}</span>
          </div>

          <div v-if="carregandoFavoritos" class="estado-vazio carregando">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Carregando seus favoritos...</p>
          </div>

          <div v-else-if="!favoritos.length" class="estado-vazio">
            <div class="estado-icone"><i class="fa-regular fa-heart"></i></div>
            <h3>Nenhum favorito ainda</h3>
            <p>Salve seus produtos preferidos para encontrá-los facilmente.</p>
            <button type="button" class="btn-acao" @click="irParaMenu">
              Explorar cardápio <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div v-else class="lista-produtos">
            <article v-for="produto in favoritos" :key="idProduto(produto)" class="produto-card">
              <button type="button" class="produto-imagem" @click="abrirProduto(produto)">
                <img v-if="getImageUrl(produto)" :src="getImageUrl(produto)" :alt="produto.nome" />
                <span v-else><i class="fa-solid fa-bread-slice"></i></span>
              </button>

              <div class="produto-info">
                <span class="produto-label">FAVORITO</span>
                <h3>{{ produto.nome }}</h3>
                <strong class="produto-preco">R$ {{ formatarPreco(produto.preco) }}</strong>
                <div class="produto-acoes">
                  <button type="button" class="btn-ver-produto" @click="abrirProduto(produto)">Ver produto</button>
                  <button type="button" class="btn-remover" title="Remover dos favoritos" @click="removerFavorito(produto)">
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
              <div class="icone-conteudo"><i class="fa-solid fa-star"></i></div>
              <div><span>SUAS EXPERIÊNCIAS</span><h2>Avaliados</h2></div>
            </div>
            <span class="contador">{{ produtosAvaliados.length }}</span>
          </div>

          <div v-if="carregando" class="estado-vazio carregando">
            <i class="fa-solid fa-spinner fa-spin"></i><p>Carregando avaliações...</p>
          </div>

          <div v-else-if="!produtosAvaliados.length" class="estado-vazio">
            <div class="estado-icone"><i class="fa-regular fa-star"></i></div>
            <h3>Ainda não há avaliações</h3>
            <p>Depois de experimentar nossos produtos, você poderá deixar sua avaliação aqui.</p>
            <button type="button" class="btn-acao" @click="irParaMenu">
              Conhecer o cardápio <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div v-else class="avaliacoes-lista">
            <article v-for="produto in produtosAvaliados" :key="`${produto._pedidoId}-${idProduto(produto)}`" class="avaliacao-card">
              <div class="avaliacao-produto">
                <div class="avaliacao-imagem">
                  <img v-if="getImageUrl(produto)" :src="getImageUrl(produto)" :alt="produto.nome" />
                  <i v-else class="fa-solid fa-bread-slice"></i>
                </div>
                <div class="avaliacao-info">
                  <span class="avaliacao-label">AVALIADO</span>
                  <h3>{{ produto.nome }}</h3>
                  <div class="estrelas-pequenas">
                    <i v-for="estrela in 5" :key="estrela" class="fa-solid fa-star" :class="{ vazia: estrela > Number(produto.nota || 0) }"></i>
                  </div>
                </div>
              </div>

              <p v-if="produto.comentario?.trim()" class="comentario">“{{ produto.comentario }}”</p>
              <button type="button" class="btn-editar-avaliacao" @click="abrirAvaliacao(produto)">
                <i class="fa-solid fa-pen"></i> Editar avaliação
              </button>
            </article>
          </div>

          <div v-if="avaliacoesComComentario.length" class="depoimentos">
            <div class="depoimentos-titulo">
              <span class="depoimentos-linha"></span>
              <div><span class="depoimentos-label">O QUE NOSSOS CLIENTES DIZEM</span><h3>Avaliações especiais</h3></div>
              <span class="depoimentos-linha"></span>
            </div>

            <div class="depoimento-card">
              <Transition name="avaliacao-fade" mode="out-in">
                <div v-if="avaliacoesComComentario[avaliacaoAtual]" :key="`${avaliacoesComComentario[avaliacaoAtual]._pedidoId}-${idProduto(avaliacoesComComentario[avaliacaoAtual])}`" class="depoimento-conteudo">
                  <div class="depoimento-produto">
                    <div class="depoimento-imagem">
                      <img v-if="getImageUrl(avaliacoesComComentario[avaliacaoAtual])" :src="getImageUrl(avaliacoesComComentario[avaliacaoAtual])" :alt="avaliacoesComComentario[avaliacaoAtual].nome" />
                      <i v-else class="fa-solid fa-bread-slice"></i>
                    </div>
                    <div class="depoimento-produto-info">
                      <span>AVALIAÇÃO</span>
                      <strong>{{ avaliacoesComComentario[avaliacaoAtual].nome }}</strong>
                      <div class="depoimento-estrelas">
                        <i v-for="estrela in 5" :key="estrela" class="fa-solid fa-star" :class="{ vazia: estrela > Number(avaliacoesComComentario[avaliacaoAtual].nota || 0) }"></i>
                      </div>
                    </div>
                  </div>
                  <div class="depoimento-texto">
                    <i class="fa-solid fa-quote-left"></i>
                    <p>{{ avaliacoesComComentario[avaliacaoAtual].comentario }}</p>
                    <i class="fa-solid fa-quote-right"></i>
                  </div>
                </div>
              </Transition>
            </div>

            <div v-if="avaliacoesComComentario.length > 1" class="depoimentos-indicadores">
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
        </section>

        <!-- PREPARADOS -->
        <section v-else-if="tipoAtual === 'preparados'">
          <div class="conteudo-topo">
            <div class="conteudo-identidade">
              <div class="icone-conteudo"><i class="fa-solid fa-utensils"></i></div>
              <div><span>SEUS PEDIDOS</span><h2>Preparados</h2></div>
            </div>
            <span class="contador">{{ pedidos.length }}</span>
          </div>

          <div v-if="carregando" class="estado-vazio carregando">
            <i class="fa-solid fa-spinner fa-spin"></i><p>Carregando seus pedidos...</p>
          </div>

          <div v-else-if="!pedidos.length" class="estado-vazio">
            <div class="estado-icone"><i class="fa-solid fa-utensils"></i></div>
            <h3>Nenhum pedido ainda</h3>
            <p>Seus pedidos realizados aparecerão aqui.</p>
            <button type="button" class="btn-acao" @click="irParaMenu">
              Ver cardápio <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div v-else class="preparados-conteudo">
            <div v-if="produtosUnicos.length" class="produtos-comprados">
              <div class="subtitulo-lista"><span>PRODUTOS</span><h3>O que você já experimentou</h3></div>
              <div class="lista-produtos">
                <article v-for="produto in produtosUnicos" :key="idProduto(produto)" class="produto-card">
                  <button type="button" class="produto-imagem" @click="abrirProduto(produto)">
                    <img v-if="getImageUrl(produto)" :src="getImageUrl(produto)" :alt="produto.nome" />
                    <span v-else><i class="fa-solid fa-bread-slice"></i></span>
                  </button>
                  <div class="produto-info">
                    <span class="produto-label">JÁ COMPROU</span>
                    <h3>{{ produto.nome }}</h3>
                    <strong class="produto-preco">R$ {{ formatarPreco(produto.preco) }}</strong>
                    <button type="button" class="btn-avaliar" @click="abrirAvaliacao(produto)">
                      <i class="fa-solid fa-star"></i>
                      {{ produto.avaliado ? "Editar avaliação" : "Avaliar produto" }}
                    </button>
                  </div>
                </article>
              </div>
            </div>

            <div class="historico-pedidos">
              <div class="subtitulo-lista"><span>HISTÓRICO</span><h3>Seus pedidos</h3></div>
              <article v-for="pedido in pedidosFormatados" :key="pedido._id" class="pedido-historico">
                <div class="pedido-topo">
                  <div><span class="pedido-label">PEDIDO</span><strong>#{{ pedido.id ?? pedido.idPedido ?? pedido._id }}</strong></div>
                  <span class="pedido-data">{{ formatarData(pedido.data ?? pedido.dataCompra ?? pedido.criadoEm ?? pedido.created_at) }}</span>
                </div>

                <div class="pedido-itens">
                  <div v-for="(item, index) in pedido._itens" :key="item.idProduto ?? item.id ?? index" class="pedido-item">
                    <span>{{ item.quantidade ?? item.qtd ?? 1 }}x</span>
                    <strong>{{ item.nome }}</strong>
                    <small>R$ {{ formatarPreco(Number(item.preco ?? item.valor ?? 0) * Number(item.quantidade ?? item.qtd ?? 1)) }}</small>
                  </div>
                </div>

                <div class="pedido-total"><span>Total</span><strong>R$ {{ formatarPreco(totalPedido(pedido)) }}</strong></div>
              </article>
            </div>
          </div>
        </section>

        <div v-else class="estado-vazio">
          <h3>Área não encontrada</h3>
          <button type="button" class="btn-acao" @click="mudarAba('preparados')">Ver meus pedidos</button>
        </div>
      </section>
    </main>

    <!-- MODAL DE AVALIAÇÃO -->
    <Transition name="modal">
      <div v-if="produtoAvaliando" class="modal-overlay" @click.self="fecharAvaliacao">
        <form class="modal-avaliacao" @submit.prevent="salvarAvaliacao">
          <button type="button" class="modal-fechar" aria-label="Fechar" @click="fecharAvaliacao">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-icone"><i class="fa-solid fa-star"></i></div>
          <span class="modal-label">SUA AVALIAÇÃO</span>
          <h2>{{ produtoAvaliando.nome }}</h2>
          <p class="modal-descricao">Como foi sua experiência com este produto?</p>

          <div class="estrelas-modal">
            <button
              v-for="estrela in 5"
              :key="estrela"
              type="button"
              :class="{ selecionada: estrela <= notaSelecionada }"
              :aria-label="`${estrela} estrela${estrela > 1 ? 's' : ''}`"
              @click="notaSelecionada = estrela"
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
          <span class="contador-caracteres">{{ comentarioAvaliacao.length }}/500</span>

          <button type="submit" class="btn-salvar-avaliacao" :disabled="notaSelecionada === 0 || salvandoAvaliacao">
            <i v-if="salvandoAvaliacao" class="fa-solid fa-spinner fa-spin"></i>
            <template v-else>Salvar avaliação <i class="fa-solid fa-arrow-right"></i></template>
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>
