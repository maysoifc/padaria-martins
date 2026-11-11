<script setup>
import { ref } from "vue";
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

const imagens = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const imagemProduto = () => {
  const imagem = props.produto?.imagem;

  if (!imagem) return "";

  const valor = String(imagem).trim();

  if (!valor) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(valor)) {
    return valor;
  }

  const nomeArquivo = valor.split("/").pop()?.split("?")[0];

  const caminhoLocal = Object.keys(imagens).find((arquivo) =>
    arquivo.endsWith(`/${nomeArquivo}`)
  );

  if (caminhoLocal) return imagens[caminhoLocal];

  if (valor.startsWith("/")) {
    return `http://127.0.0.1:8000${valor}`;
  }

  if (valor.startsWith("media/") || valor.startsWith("uploads/")) {
    return `http://127.0.0.1:8000/${valor}`;
  }

  return valor;
};

const comprarNovamente = async () => {
  if (!props.produto || carregando.value) return;

  const idProduto = props.produto.idProduto ?? props.produto.id;

  if (idProduto == null) {
    console.error("Produto sem identificador:", props.produto);
    return;
  }

  carregando.value = true;

  try {
    let carrinho = [];

    try {
      const dados = JSON.parse(localStorage.getItem("carrinho") || "[]");
      if (Array.isArray(dados)) carrinho = dados;
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

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

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
        v-if="imagemProduto() && !erroImagem"
        :src="imagemProduto()"
        :alt="produto.nome || 'Produto'"
        @error="erroImagem = true"
      />

      <div v-else class="imagem-placeholder">
        <i class="fa-solid fa-cookie-bite"></i>
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
