<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/productCard.css";

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["favorito-atualizado"]);

const router = useRouter();
const avaliacaoUsuario = ref(null);
const favoritoAtual = ref(Boolean(props.produto.favorito));
const carregandoFavorito = ref(false);

const imagens = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const idProduto = computed(
  () => props.produto.idProduto ?? props.produto.id
);

const imagemUrl = computed(() => {
  const imagem = props.produto.imagem;

  if (!imagem || typeof imagem !== "string") {
    return "";
  }

  if (/^(https?:\/\/|data:|blob:)/i.test(imagem)) {
    return imagem;
  }

  const nomeArquivo = imagem.split("/").pop()?.split("?")[0];

  if (!nomeArquivo) {
    return "";
  }

  const caminho = Object.keys(imagens).find(
    (arquivo) => arquivo.endsWith(`/${nomeArquivo}`)
  );

  return caminho ? imagens[caminho] : imagem;
});

const irParaDetalhes = () => {
  if (!idProduto.value) return;
  router.push(`/produto/${idProduto.value}`);
};

const carregarAvaliacaoUsuario = () => {
  try {
    const salvo = localStorage.getItem("historicoCompras");

    if (!salvo || !idProduto.value) {
      avaliacaoUsuario.value = null;
      return;
    }

    const pedidos = JSON.parse(salvo);

    if (!Array.isArray(pedidos)) {
      avaliacaoUsuario.value = null;
      return;
    }

    let avaliacaoEncontrada = null;

    for (const pedido of pedidos) {
      if (!Array.isArray(pedido.itens)) continue;

      for (const item of pedido.itens) {
        const idItem = item.idProduto ?? item.id;

        if (String(idItem) !== String(idProduto.value)) continue;

        const nota = Number(item.nota);

        if (
          item.avaliado === true &&
          Number.isFinite(nota) &&
          nota > 0
        ) {
          avaliacaoEncontrada = nota;
        }
      }
    }

    avaliacaoUsuario.value = avaliacaoEncontrada;
  } catch (error) {
    console.error("Erro ao carregar avaliação:", error);
    avaliacaoUsuario.value = null;
  }
};

const avaliacao = computed(() => {
  const notaUsuario = Number(avaliacaoUsuario.value);

  if (
    avaliacaoUsuario.value !== null &&
    Number.isFinite(notaUsuario) &&
    notaUsuario > 0
  ) {
    return notaUsuario.toFixed(1);
  }

  const valor =
    props.produto.avaliacao ??
    props.produto.nota ??
    props.produto.rating;

  const numero = Number(valor);

  return Number.isFinite(numero) && numero > 0
    ? numero.toFixed(1)
    : "";
});

const toggleFavorito = async () => {
  if (!idProduto.value || carregandoFavorito.value) return;

  const novoStatus = !favoritoAtual.value;
  carregandoFavorito.value = true;

  try {
    const apiUrl = (
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api"
    ).replace(/\/+$/, "");

    const response = await fetch(
      `${apiUrl}/produtos/${idProduto.value}/favorito/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favorito: novoStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    favoritoAtual.value = novoStatus;

    emit("favorito-atualizado", {
      id: idProduto.value,
      favorito: novoStatus,
    });
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
  } finally {
    carregandoFavorito.value = false;
  }
};

const atualizarAvaliacao = () => {
  carregarAvaliacaoUsuario();
};

watch(
  () => props.produto.favorito,
  (novoValor) => {
    favoritoAtual.value = Boolean(novoValor);
  }
);

watch(idProduto, carregarAvaliacaoUsuario);

onMounted(() => {
  carregarAvaliacaoUsuario();

  window.addEventListener("storage", atualizarAvaliacao);
  window.addEventListener("avaliacao-atualizada", atualizarAvaliacao);
});

onUnmounted(() => {
  window.removeEventListener("storage", atualizarAvaliacao);
  window.removeEventListener("avaliacao-atualizada", atualizarAvaliacao);
});
</script>

<template>
  <article class="produto-card" @click="irParaDetalhes">
    <div class="produto-imagem">
      <img
        v-if="imagemUrl"
        :src="imagemUrl"
        :alt="produto.nome"
        loading="lazy"
      />

      <div v-else class="imagem-placeholder">
        <i class="fa-solid fa-cookie-bite"></i>
      </div>

      <div v-if="avaliacao" class="avaliacao">
        <i class="fa-solid fa-star"></i>
        <span>{{ avaliacao }}</span>
      </div>

      <button
        type="button"
        class="favorito"
        :class="{ ativo: favoritoAtual }"
        :disabled="carregandoFavorito"
        :aria-pressed="favoritoAtual"
        :aria-label="
          favoritoAtual
            ? 'Remover dos favoritos'
            : 'Adicionar aos favoritos'
        "
        @click.stop="toggleFavorito"
      >
        <i
          :class="
            favoritoAtual
              ? 'fa-solid fa-heart'
              : 'fa-regular fa-heart'
          "
        ></i>
      </button>

      <div class="imagem-sombra"></div>

      <span class="ver-produto">
        <i class="fa-solid fa-eye"></i>
        Ver produto
      </span>
    </div>

    <div class="produto-conteudo">
      <div class="produto-topo">
        <span class="produto-categoria">
          <i class="fa-solid fa-wheat-awn"></i>
          Especial da casa
        </span>
      </div>

      <h3>{{ produto.nome }}</h3>

      <div class="produto-rodape">
        <div class="preco-area">
          <span class="preco-label">A partir de</span>

          <strong class="preco">
            R$ {{ Number(produto.preco || 0).toFixed(2).replace(".", ",") }}
          </strong>
        </div>

        <button
          type="button"
          class="botao-detalhes"
          aria-label="Ver detalhes do produto"
          @click.stop="irParaDetalhes"
        >
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </article>
</template>
