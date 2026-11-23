
<script setup>
import { computed, ref, watch } from "vue";
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

const favoritoAtual = ref(Boolean(props.produto.favorito));
const carregandoFavorito = ref(false);
const erroFavorito = ref("");

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const imagens = import.meta.glob("../assets/img/*", {
  eager: true,
  query: "?url",
  import: "default",
});

const idProduto = computed(() => {
  return props.produto.idProduto ?? props.produto.id ?? null;
});

const nomeProduto = computed(() => {
  return props.produto.nome || "Produto";
});

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

  const caminho = Object.keys(imagens).find((arquivo) =>
    arquivo.endsWith(`/${nomeArquivo}`)
  );

  if (caminho) {
    return imagens[caminho];
  }

  if (imagem.startsWith("/")) {
    return imagem;
  }

  return "";
});

const numeroValido = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
};

const precoOriginal = computed(() => {
  return Math.max(0, numeroValido(props.produto.preco) ?? 0);
});

const percentualDesconto = computed(() => {
  const desconto = numeroValido(props.produto.desconto) ?? 0;

  return Math.min(100, Math.max(0, desconto));
});

const possuiDesconto = computed(() => {
  return (
    percentualDesconto.value > 0 &&
    precoOriginal.value > 0
  );
});

const precoAtual = computed(() => {
  const preco = precoOriginal.value;
  const desconto = percentualDesconto.value;

  const resultado = preco * (1 - desconto / 100);

  return Math.round((resultado + Number.EPSILON) * 100) / 100;
});

const formatarPreco = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const avaliacao = computed(() => {
  const valor = numeroValido(props.produto.avaliacao);

  if (valor === null || valor <= 0) {
    return null;
  }

  return Math.min(valor, 5).toFixed(1);
});

const irParaDetalhes = () => {
  if (!idProduto.value) {
    console.error("Produto sem identificador:", props.produto);
    return;
  }

  router.push(`/produto/${idProduto.value}`);
};

const routeAtual = () => {
  return window.location.pathname + window.location.search;
};

const toggleFavorito = async () => {
  if (!idProduto.value || carregandoFavorito.value) {
    return;
  }

  erroFavorito.value = "";

  const token = localStorage.getItem("token");

  if (!token) {
    router.push({
      path: "/",
      query: {
        redirect: routeAtual(),
      },
    });

    return;
  }

  carregandoFavorito.value = true;

  const novoStatus = !favoritoAtual.value;

  try {
    const response = await fetch(
      `${API_URL}/produtos/${encodeURIComponent(idProduto.value)}/favorito/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          favorito: novoStatus,
        }),
      }
    );

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Sua sessão expirou. Entre novamente para atualizar seus favoritos."
        );
      }

      throw new Error(
        dados.detail ||
        dados.erro ||
        `Não foi possível atualizar o favorito. HTTP ${response.status}`
      );
    }

    favoritoAtual.value = Boolean(dados.favorito);

    emit("favorito-atualizado", {
      id: idProduto.value,
      favorito: favoritoAtual.value,
    });

    window.dispatchEvent(new Event("favoritos-atualizados"));
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    erroFavorito.value = error.message;
  } finally {
    carregandoFavorito.value = false;
  }
};

watch(
  () => props.produto.favorito,
  (novoValor) => {
    favoritoAtual.value = Boolean(novoValor);
  }
);

watch(idProduto, () => {
  favoritoAtual.value = Boolean(props.produto.favorito);
  erroFavorito.value = "";
});
</script>

<template>
  <article class="produto-card">
    <div class="produto-card__imagem-container" @click="irParaDetalhes">
      <img
        v-if="imagemUrl"
        :src="imagemUrl"
        :alt="nomeProduto"
        class="produto-card__imagem"
        loading="lazy"
      />

      <div v-else class="produto-card__imagem-placeholder">
        <i class="fa-solid fa-bread-slice"></i>
        <span>Imagem indisponível</span>
      </div>

      <span
        v-if="possuiDesconto"
        class="produto-card__desconto"
      >
        -{{ Number(percentualDesconto) }}%
      </span>
    </div>

    <button
      type="button"
      class="produto-card__favorito"
      :class="{ ativo: favoritoAtual }"
      :disabled="carregandoFavorito"
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

    <div class="produto-card__conteudo">
      <h3
        class="produto-card__nome"
        @click="irParaDetalhes"
      >
        {{ nomeProduto }}
      </h3>

      <div
        v-if="avaliacao"
        class="produto-card__avaliacao"
      >
        <i class="fa-solid fa-star"></i>
        <span>{{ avaliacao }}</span>
      </div>

      <div class="produto-card__precos">
        <span
          v-if="possuiDesconto"
          class="produto-card__preco-original"
        >
          R$ {{ formatarPreco(precoOriginal) }}
        </span>

        <strong class="produto-card__preco-atual">
          R$ {{ formatarPreco(precoAtual) }}
        </strong>
      </div>

      <p
        v-if="erroFavorito"
        class="produto-card__erro"
        role="alert"
      >
        {{ erroFavorito }}
      </p>

      <button
        type="button"
        class="produto-card__botao"
        @click="irParaDetalhes"
      >
        Ver produto
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  </article>
</template>
<style scoped>

/* =========================================
   CARD DO PRODUTO
========================================= */

.produto-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;

  background: #fff;
  border: 1px solid rgba(94, 48, 35, 0.08);
  border-radius: 20px;

  box-shadow: 0 5px 18px rgba(94, 48, 35, 0.07);

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.produto-card:hover {
  transform: translateY(-4px);
  border-color: rgba(184, 151, 100, 0.4);
  box-shadow: 0 12px 28px rgba(94, 48, 35, 0.12);
}

.produto-card:active {
  transform: scale(0.985);
}

/* =========================================
   IMAGEM
========================================= */

.produto-card__imagem-container {
  position: relative;
  width: 100%;
  height: 175px;
  overflow: hidden;
  background: linear-gradient(135deg, #f7eee2, #eee1cf);
  cursor: pointer;
}

.produto-card__imagem {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;

  transition: transform 0.4s ease;
}

.produto-card:hover .produto-card__imagem {
  transform: scale(1.05);
}

.produto-card__imagem-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;

  width: 100%;
  height: 100%;

  color: #b89764;
  font-size: 1.8rem;
}

.produto-card__imagem-placeholder span {
  font-size: 0.7rem;
  font-weight: 600;
}

/* =========================================
   DESCONTO
========================================= */

.produto-card__desconto {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 6px 10px;

  border-radius: 20px;
  background: #9d4b39;
  color: #fff;

  font-size: 0.7rem;
  font-weight: 800;

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}

/* =========================================
   FAVORITOS
========================================= */

.produto-card__favorito {
  position: absolute;
  top: 11px;
  right: 11px;
  z-index: 4;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 37px;
  height: 37px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.94);
  color: #8c7566;

  font-size: 0.95rem;
  cursor: pointer;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);

  transition:
    transform 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.produto-card__favorito:hover:not(:disabled) {
  transform: scale(1.1);
}

.produto-card__favorito.ativo {
  color: #a7473e;
  background: #fff5f3;
}

.produto-card__favorito:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* =========================================
   CONTEÚDO
========================================= */

.produto-card__conteudo {
  display: flex;
  flex-direction: column;
  flex: 1;

  padding: 13px 14px 14px;
  min-width: 0;
  box-sizing: border-box;
}

/* =========================================
   NOME
========================================= */

.produto-card__nome {
  margin: 0 0 8px;

  overflow: hidden;

  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.25;

  text-overflow: ellipsis;
  white-space: nowrap;

  cursor: pointer;
}

/* =========================================
   AVALIAÇÃO
========================================= */

.produto-card__avaliacao {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-bottom: 9px;

  color: #8b6b3f;
  font-size: 0.76rem;
  font-weight: 700;
}

.produto-card__avaliacao i {
  color: #c49a4e;
  font-size: 0.72rem;
}

/* =========================================
   PREÇOS
========================================= */

.produto-card__precos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  margin-top: auto;
  margin-bottom: 12px;
}

.produto-card__preco-original {
  color: #a69a91;
  font-size: 0.72rem;
  font-weight: 500;
  text-decoration: line-through;
}

.produto-card__preco-atual {
  color: #5e3023;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.1;
}

/* =========================================
   ERRO DE FAVORITO
========================================= */

.produto-card__erro {
  margin: 0 0 10px;
  padding: 8px 9px;

  border-radius: 8px;
  background: #fff1ef;
  color: #a33d32;

  font-size: 0.7rem;
  line-height: 1.4;
}

/* =========================================
   BOTÃO VER PRODUTO
========================================= */

.produto-card__botao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: 100%;
  min-height: 37px;
  padding: 8px 12px;

  border: none;
  border-radius: 11px;

  background: #5e3023;
  color: #fff;

  font-size: 0.75rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.produto-card__botao i {
  color: #e1c98f;
  font-size: 0.7rem;
  transition: transform 0.2s ease;
}

.produto-card__botao:hover {
  background: #754331;
}

.produto-card__botao:hover i {
  transform: translateX(3px);
}

.produto-card__botao:active {
  transform: scale(0.97);
}

/* =========================================
   RESPONSIVIDADE
========================================= */

@media (max-width: 700px) {
  .produto-card__imagem-container {
    height: 155px;
  }

  .produto-card__conteudo {
    padding: 12px;
  }

  .produto-card__nome {
    font-size: 1rem;
  }

  .produto-card__preco-atual {
    font-size: 1.12rem;
  }
}

@media (max-width: 480px) {
  .produto-card {
    border-radius: 16px;
  }

  .produto-card__imagem-container {
    height: 135px;
  }

  .produto-card__conteudo {
    padding: 10px;
  }

  .produto-card__nome {
    font-size: 0.92rem;
    margin-bottom: 7px;
  }

  .produto-card__avaliacao {
    font-size: 0.7rem;
    margin-bottom: 7px;
  }

  .produto-card__preco-atual {
    font-size: 1.05rem;
  }

  .produto-card__preco-original {
    font-size: 0.67rem;
  }

  .produto-card__favorito {
    width: 33px;
    height: 33px;
    font-size: 0.85rem;
  }

  .produto-card__desconto {
    top: 9px;
    left: 9px;
    padding: 5px 8px;
    font-size: 0.65rem;
  }

  .produto-card__botao {
    min-height: 34px;
    font-size: 0.7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .produto-card,
  .produto-card *,
  .produto-card *::before,
  .produto-card *::after {
    transition: none !important;
  }
}

</style>
