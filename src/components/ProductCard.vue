<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from "vue";

import { useRouter } from "vue-router";

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const avaliacaoUsuario = ref(null);

const imagens = import.meta.glob(
  "../assets/img/*",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const irParaDetalhes = () => {
  const id =
    props.produto.idProduto ??
    props.produto.id;

  if (!id) {
    return;
  }

  router.push(`/produto/${id}`);
};

const getImageUrl = (imagem) => {
  if (!imagem) {
    return "";
  }

  if (
    imagem.startsWith("http://") ||
    imagem.startsWith("https://") ||
    imagem.startsWith("data:")
  ) {
    return imagem;
  }

  const nomeArquivo = imagem
    .split("/")
    .pop()
    ?.split("?")[0];

  if (!nomeArquivo) {
    return "";
  }

  const caminho = Object.keys(imagens).find(
    (arquivo) =>
      arquivo.endsWith(`/${nomeArquivo}`)
  );

  return caminho
    ? imagens[caminho]
    : imagem;
};

const carregarAvaliacaoUsuario = () => {
  try {
    const salvo =
      localStorage.getItem(
        "historicoCompras"
      );

    if (!salvo) {
      avaliacaoUsuario.value = null;
      return;
    }

    const pedidos = JSON.parse(salvo);

    if (!Array.isArray(pedidos)) {
      avaliacaoUsuario.value = null;
      return;
    }

    const idProduto =
      props.produto.idProduto ??
      props.produto.id;

    if (!idProduto) {
      avaliacaoUsuario.value = null;
      return;
    }

    let avaliacaoEncontrada = null;

    for (const pedido of pedidos) {
      if (!Array.isArray(pedido.itens)) {
        continue;
      }

      for (const item of pedido.itens) {
        const idItem =
          item.idProduto ??
          item.id;

        if (
          String(idItem) !==
          String(idProduto)
        ) {
          continue;
        }

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

    avaliacaoUsuario.value =
      avaliacaoEncontrada;
  } catch (error) {
    console.error(
      "Erro ao carregar avaliação:",
      error
    );

    avaliacaoUsuario.value = null;
  }
};

const avaliacao = computed(() => {
  if (
    avaliacaoUsuario.value !== null &&
    Number.isFinite(
      Number(avaliacaoUsuario.value)
    ) &&
    Number(avaliacaoUsuario.value) > 0
  ) {
    return Number(
      avaliacaoUsuario.value
    ).toFixed(1);
  }

  const valor =
    props.produto.avaliacao ??
    props.produto.nota ??
    props.produto.rating;

  const numero = Number(valor);

  if (
    Number.isFinite(numero) &&
    numero > 0
  ) {
    return numero.toFixed(1);
  }

  return "";
});

const toggleFavorito = async () => {
  const id =
    props.produto.idProduto ??
    props.produto.id;

  if (!id) {
    return;
  }

  const novoStatus =
    !props.produto.favorito;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/produtos/${id}/favorito/`,
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
      throw new Error(
        `Erro HTTP: ${response.status}`
      );
    }

    props.produto.favorito =
      novoStatus;
  } catch (error) {
    console.error(
      "Erro ao favoritar:",
      error
    );
  }
};

const atualizarAvaliacao = () => {
  carregarAvaliacaoUsuario();
};

onMounted(() => {
  carregarAvaliacaoUsuario();

  window.addEventListener(
    "storage",
    atualizarAvaliacao
  );

  window.addEventListener(
    "avaliacao-atualizada",
    atualizarAvaliacao
  );
});

onUnmounted(() => {
  window.removeEventListener(
    "storage",
    atualizarAvaliacao
  );

  window.removeEventListener(
    "avaliacao-atualizada",
    atualizarAvaliacao
  );
});
</script>

<template>
  <article
    class="produto-card"
    @click="irParaDetalhes"
  >

    <div class="produto-imagem">

      <img
        v-if="getImageUrl(produto.imagem)"
        :src="getImageUrl(produto.imagem)"
        :alt="produto.nome"
        loading="lazy"
      />

      <div
        v-else
        class="imagem-placeholder"
      >
        <i
          class="fa-solid fa-cookie-bite"
        ></i>
      </div>

      <div
        v-if="avaliacao"
        class="avaliacao"
      >
        <i
          class="fa-solid fa-star"
        ></i>

        <span>
          {{ avaliacao }}
        </span>
      </div>

      <button
        type="button"
        class="favorito"
        :class="{
          ativo: produto.favorito
        }"
        :aria-label="
          produto.favorito
            ? 'Remover dos favoritos'
            : 'Adicionar aos favoritos'
        "
        @click.stop="toggleFavorito"
      >

        <i
          :class="
            produto.favorito
              ? 'fa-solid fa-heart'
              : 'fa-regular fa-heart'
          "
        ></i>

      </button>

      <div class="imagem-sombra"></div>

      <span class="ver-produto">

        <i
          class="fa-solid fa-eye"
        ></i>

        Ver produto

      </span>

    </div>

    <div class="produto-conteudo">

      <div class="produto-topo">

        <span class="produto-categoria">

          <i
            class="fa-solid fa-wheat-awn"
          ></i>

          Especial da casa

        </span>

      </div>

      <h3>
        {{ produto.nome }}
      </h3>

      <div class="produto-rodape">

        <div class="preco-area">

          <span class="preco-label">
            A partir de
          </span>

          <strong class="preco">
            R$
            {{
              Number(produto.preco || 0)
                .toFixed(2)
                .replace(".", ",")
            }}
          </strong>

        </div>

        <button
          type="button"
          class="botao-detalhes"
          aria-label="Ver detalhes do produto"
          @click.stop="irParaDetalhes"
        >

          <i
            class="fa-solid fa-arrow-right"
          ></i>

        </button>

      </div>

    </div>

  </article>
</template>

<style scoped>
.produto-card {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;

  background: #ffffff;

  border: 1px solid
    rgba(94, 48, 35, 0.07);

  border-radius: 24px;

  box-shadow:
    0 5px 15px
      rgba(94, 48, 35, 0.05),
    0 15px 35px
      rgba(94, 48, 35, 0.07);

  cursor: pointer;

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;

  box-sizing: border-box;
}

.produto-card:hover {
  transform: translateY(-7px);

  border-color:
    rgba(184, 151, 100, 0.28);

  box-shadow:
    0 10px 20px
      rgba(94, 48, 35, 0.08),
    0 22px 45px
      rgba(94, 48, 35, 0.12);
}

.produto-card:active {
  transform:
    translateY(-2px)
    scale(0.985);
}

.produto-imagem {
  position: relative;

  width: 100%;
  height: 185px;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      #f7eee2,
      #eee1cf
    );
}

.produto-imagem img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  transition:
    transform 0.5s ease,
    filter 0.4s ease;
}

.produto-card:hover
.produto-imagem img {
  transform: scale(1.07);

  filter: brightness(0.96);
}

.imagem-placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #b89764;

  font-size: 2rem;
}

.imagem-sombra {
  position: absolute;

  inset: auto 0 0;

  height: 70px;

  background:
    linear-gradient(
      to top,
      rgba(45, 25, 18, 0.35),
      transparent
    );

  pointer-events: none;
}

.avaliacao {
  position: absolute;

  top: 12px;
  left: 12px;

  z-index: 3;

  display: flex;
  align-items: center;

  gap: 5px;

  min-height: 30px;

  padding: 0 10px;

  border: 1px solid
    rgba(255, 255, 255, 0.65);

  border-radius: 20px;

  background:
    rgba(255, 255, 255, 0.92);

  color: #5e3023;

  font-size: 0.72rem;
  font-weight: 800;

  box-shadow:
    0 5px 15px
      rgba(0, 0, 0, 0.1);

  backdrop-filter: blur(8px);
}

.avaliacao i {
  color: #b89764;
  font-size: 0.7rem;
}

.favorito {
  position: absolute;

  top: 11px;
  right: 11px;

  z-index: 4;

  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid
    rgba(255, 255, 255, 0.7);

  border-radius: 50%;

  background:
    rgba(255, 255, 255, 0.9);

  color: #b89764;

  font-size: 1rem;

  cursor: pointer;

  box-shadow:
    0 5px 15px
      rgba(0, 0, 0, 0.1);

  backdrop-filter: blur(8px);

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.favorito:hover {
  transform: scale(1.1);

  background: #ffffff;
}

.favorito:active {
  transform: scale(0.9);
}

.favorito.ativo {
  background: #fff7f5;
  color: #9d4b39;
}

.ver-produto {
  position: absolute;

  right: 12px;
  bottom: 12px;

  z-index: 3;

  display: flex;
  align-items: center;

  gap: 6px;

  padding: 7px 10px;

  border-radius: 10px;

  background:
    rgba(94, 48, 35, 0.88);

  color: #ffffff;

  font-size: 0.6rem;
  font-weight: 700;

  opacity: 0;

  transform:
    translateY(7px);

  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  backdrop-filter: blur(5px);
}

.produto-card:hover
.ver-produto {
  opacity: 1;

  transform:
    translateY(0);
}

.ver-produto i {
  color: #e1c98f;
  font-size: 0.6rem;
}

.produto-conteudo {
  padding: 15px 16px 16px;
}

.produto-topo {
  min-height: 18px;

  margin-bottom: 5px;
}

.produto-categoria {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  color: #b89764;

  font-size: 0.56rem;
  font-weight: 800;

  letter-spacing: 0.7px;

  text-transform: uppercase;
}

.produto-categoria i {
  font-size: 0.55rem;
}

.produto-conteudo h3 {
  margin: 3px 0 14px;

  overflow: hidden;

  color: #5e3023;

  font-family:
    "Imprima",
    Georgia,
    serif;

  font-size: 1.2rem;
  font-weight: 800;

  line-height: 1.15;

  text-align: left;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.produto-rodape {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 10px;

  padding-top: 12px;

  border-top:
    1px solid
    rgba(184, 151, 100, 0.2);
}

.preco-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  gap: 1px;
}

.preco-label {
  color: #9b8d82;

  font-size: 0.55rem;
  font-weight: 600;
}

.preco {
  color: #6a3828;

  font-size: 1.25rem;
  font-weight: 900;

  line-height: 1;
}

.botao-detalhes {
  width: 39px;
  height: 39px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 13px;

  background: #5e3023;
  color: #e1c98f;

  font-size: 0.8rem;

  cursor: pointer;

  box-shadow:
    0 6px 14px
      rgba(94, 48, 35, 0.16);

  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.botao-detalhes:hover {
  transform: translateX(3px);

  background: #6f3b2b;
}

.botao-detalhes:active {
  transform: scale(0.9);
}

@media (max-width: 700px) {
  .produto-imagem {
    height: 165px;
  }

  .produto-conteudo {
    padding: 14px;
  }

  .produto-conteudo h3 {
    font-size: 1.05rem;
  }

  .preco {
    font-size: 1.15rem;
  }

  .ver-produto {
    display: none;
  }
}

@media (max-width: 480px) {
  .produto-card {
    border-radius: 20px;
  }

  .produto-imagem {
    height: 145px;
  }

  .produto-conteudo {
    padding: 12px;
  }

  .produto-categoria {
    font-size: 0.5rem;
  }

  .produto-conteudo h3 {
    margin-bottom: 11px;

    font-size: 0.98rem;
  }

  .preco-label {
    font-size: 0.5rem;
  }

  .preco {
    font-size: 1.08rem;
  }

  .botao-detalhes {
    width: 35px;
    height: 35px;

    border-radius: 11px;
  }

  .favorito {
    width: 34px;
    height: 34px;

    font-size: 0.9rem;
  }

  .avaliacao {
    min-height: 27px;

    padding: 0 8px;

    font-size: 0.65rem;
  }

  .imagem-placeholder {
    font-size: 1.7rem;
  }
}
</style>
