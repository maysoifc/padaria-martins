
<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/comprarNovamente.css";

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const carregando = ref(false);
const erroImagem = ref(false);

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const imagensLocais = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const normalizarImagem = (imagem) => {
  if (!imagem) return "";

  const valor = String(imagem).trim();

  if (!valor || valor === "null" || valor === "undefined") {
    return "";
  }

  // Procura uma imagem local pelo nome do arquivo.
  const nomeArquivo = valor.split("/").pop()?.split("?")[0];

  const caminhoLocal = Object.keys(imagensLocais).find(
    (arquivo) =>
      arquivo.split("/").pop()?.toLowerCase() ===
      nomeArquivo?.toLowerCase()
  );

  if (caminhoLocal) {
    return imagensLocais[caminhoLocal];
  }

  // Imagens externas ou URLs completas.
  if (/^(https?:\/\/|data:|blob:)/i.test(valor)) {
    try {
      const url = new URL(valor);

      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1"
      ) {
        return `${API_ORIGIN}${url.pathname}${url.search}`;
      }

      return valor;
    } catch {
      return "";
    }
  }

  // Caminho absoluto ou relativo da API.
  if (valor.startsWith("/")) {
    return `${API_ORIGIN}${valor}`;
  }

  return `${API_ORIGIN}/${valor.replace(/^\/+/, "")}`;
};

const imagemProduto = computed(() => {
  const imagem =
    props.produto?.imagem_url ||
    props.produto?.foto_url ||
    props.produto?.imagem ||
    props.produto?.foto ||
    props.produto?.image ||
    props.produto?.image_url ||
    props.produto?.foto_produto ||
    "";

  return normalizarImagem(imagem);
});

watch(
  () => [props.produto, imagemProduto.value],
  () => {
    erroImagem.value = false;
  }
);

const comprarNovamente = async () => {
  if (!props.produto || carregando.value) return;

  const idProduto =
    props.produto.idProduto ?? props.produto.id;

  if (idProduto == null) {
    console.error("Produto sem identificador:", props.produto);
    return;
  }

  carregando.value = true;

  try {
    let carrinho = [];

    try {
      const dados = JSON.parse(
        localStorage.getItem("carrinho") || "[]"
      );

      if (Array.isArray(dados)) {
        carrinho = dados;
      }
    } catch {
      carrinho = [];
    }

    const itemExistente = carrinho.find(
      (item) =>
        String(item.idProduto ?? item.id) === String(idProduto)
    );

    if (itemExistente) {
      itemExistente.quantidade =
        Number(itemExistente.quantidade || 1) + 1;
    } else {
      carrinho.push({
        ...props.produto,
        idProduto,
        quantidade: 1,
      });
    }

    localStorage.setItem(
      "carrinho",
      JSON.stringify(carrinho)
    );

    await router.push({ name: "carrinho" });
  } catch (error) {
    console.error("Erro ao comprar novamente:", error);
  } finally {
    carregando.value = false;
  }
};
</script>

<template>
  <button
    type="button"
    class="comprar-novamente"
    :disabled="carregando"
    @click.stop="comprarNovamente"
  >
    <div class="produto-mini-imagem">
      <img
        v-if="imagemProduto && !erroImagem"
        :src="imagemProduto"
        :alt="produto.nome || 'Produto da Padaria Martins'"
        loading="lazy"
        @error="erroImagem = true"
      />

      <div
        v-else
        class="imagem-placeholder-padaria"
        aria-label="Imagem padrão da Padaria Martins"
      >
        <div class="placeholder-detalhe">
          <i class="fa-solid fa-wheat-awn"></i>
        </div>

        <i class="fa-solid fa-bread-slice placeholder-pao"></i>

        <span>PADARIA</span>
        <small>MARTINS</small>
      </div>
    </div>

    <span class="icone-carrinho">
      <i class="fa-solid fa-cart-plus"></i>
    </span>

    <span class="texto-botao">
      <strong>
        {{ carregando ? "Adicionando..." : "Comprar novamente" }}
      </strong>

      <small>Adicionar ao carrinho</small>
    </span>

    <i class="fa-solid fa-arrow-right seta"></i>
  </button>
</template>

<style scoped>
.produto-mini-imagem {
  width: 66px;
  height: 66px;
  min-width: 66px;
  overflow: hidden;
  border-radius: 15px;
  background: #f5eadb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.produto-mini-imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.imagem-placeholder-padaria {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #f7eee2, #e8d3b5);
  color: #5e3023;
}

.placeholder-detalhe {
  position: absolute;
  top: -9px;
  right: -5px;
  font-size: 35px;
  color: #b89764;
  opacity: 0.35;
  transform: rotate(25deg);
}

.placeholder-pao {
  font-size: 25px;
  color: #8c5b32;
  margin-bottom: 3px;
}

.imagem-placeholder-padaria span {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
}

.imagem-placeholder-padaria small {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #a47b49;
}
</style>
