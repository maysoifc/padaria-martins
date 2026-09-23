<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  produto: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const carregando = ref(false);

const imagens = import.meta.glob(
  "../assets/img/*",
  {
    eager: true,
    query: "?url",
    import: "default"
  }
);

const getImageUrl = (imagem) => {
  if (!imagem) {
    return "";
  }

  const valor = String(imagem).trim();

  if (!valor) {
    return "";
  }

  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://") ||
    valor.startsWith("data:")
  ) {
    return valor;
  }

  const nomeArquivo = valor
    .split("/")
    .pop()
    ?.split("?")[0];

  if (nomeArquivo) {
    const caminhoLocal = Object.keys(imagens).find(
      (arquivo) =>
        arquivo.endsWith(`/${nomeArquivo}`)
    );

    if (caminhoLocal) {
      return imagens[caminhoLocal];
    }
  }

  if (valor.startsWith("/")) {
    return `http://127.0.0.1:8000${valor}`;
  }

  if (
    valor.startsWith("media/") ||
    valor.startsWith("uploads/")
  ) {
    return `http://127.0.0.1:8000/${valor}`;
  }

  return valor;
};

const imagemProduto = () => {
  return getImageUrl(props.produto?.imagem);
};

const comprarNovamente = async () => {
  if (!props.produto || carregando.value) {
    return;
  }

  carregando.value = true;

  try {
    const salvo = localStorage.getItem("carrinho");

    let carrinho = [];

    if (salvo) {
      try {
        const dados = JSON.parse(salvo);

        if (Array.isArray(dados)) {
          carrinho = dados;
        }
      } catch {
        carrinho = [];
      }
    }

    const idProduto =
      props.produto.idProduto ??
      props.produto.id;

    if (!idProduto) {
      console.error(
        "Produto sem identificador:",
        props.produto
      );

      return;
    }

    const itemExistente = carrinho.find((item) => {
      const idItem =
        item.idProduto ??
        item.id;

      return (
        String(idItem) ===
        String(idProduto)
      );
    });

    if (itemExistente) {
      itemExistente.quantidade =
        Number(
          itemExistente.quantidade || 1
        ) + 1;
    } else {
      carrinho.push({
        ...props.produto,
        idProduto,
        quantidade: 1
      });
    }

    localStorage.setItem(
      "carrinho",
      JSON.stringify(carrinho)
    );

    await router.push({
      name: "carrinho"
    });
  } catch (error) {
    console.error(
      "Erro ao comprar novamente:",
      error
    );
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
    <div class="produto-mini">
      <div class="produto-mini-imagem">
        <img
          v-if="imagemProduto()"
          :src="imagemProduto()"
          :alt="produto.nome || 'Produto'"
          @error="
            $event.target.style.display = 'none'
          "
        />

        <div
          v-if="!imagemProduto()"
          class="imagem-placeholder"
        >
          <i
            class="fa-solid fa-cookie-bite"
          ></i>
        </div>
      </div>
    </div>

    <span class="icone-carrinho">
      <i class="fa-solid fa-cart-plus"></i>
    </span>

    <span class="texto-botao">
      <strong>
        {{
          carregando
            ? "Adicionando..."
            : "Comprar novamente"
        }}
      </strong>

      <small>
        Adicionar ao carrinho
      </small>
    </span>

    <i
      class="fa-solid fa-arrow-right seta"
    ></i>
  </button>
</template>

<style scoped>
.comprar-novamente {
  width: 100%;
  min-width: 0;
  min-height: 64px;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 7px 10px 7px 7px;

  border: 1px solid #eadbc9;
  border-radius: 16px;

  background: #fffdf9;
  color: #5e3023;

  font-family: "Imprima", sans-serif;

  cursor: pointer;

  box-sizing: border-box;

  box-shadow:
    0 5px 16px
      rgba(94, 48, 35, 0.06),
    inset 0 0 0 1px
      rgba(255, 255, 255, 0.7);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.comprar-novamente:hover {
  transform: translateY(-2px);

  border-color: #d8c09e;

  background: #fffaf3;

  box-shadow:
    0 9px 22px
      rgba(94, 48, 35, 0.1),
    inset 0 0 0 1px
      rgba(255, 255, 255, 0.8);
}

.comprar-novamente:active {
  transform: translateY(0) scale(0.98);
}

.comprar-novamente:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.produto-mini {
  flex-shrink: 0;
}

.produto-mini-imagem {
  position: relative;

  width: 48px;
  height: 48px;

  overflow: hidden;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #f7eee2,
      #eee1cf
    );

  display: flex;
  align-items: center;
  justify-content: center;
}

.produto-mini-imagem img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.imagem-placeholder {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #b89764;

  font-size: 16px;
}

.icone-carrinho {
  width: 37px;
  height: 37px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: #f5eadc;
  color: #8d6844;

  font-size: 13px;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.comprar-novamente:hover
.icone-carrinho {
  background: #eedcc5;
  color: #5e3023;
}

.texto-botao {
  min-width: 0;
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  gap: 2px;

  text-align: left;
}

.texto-botao strong {
  width: 100%;
  max-width: 100%;

  overflow: hidden;

  color: #5e3023;

  font-family:
    "Imprima",
    Georgia,
    serif;

  font-size: 0.8rem;
  font-weight: 400;

  line-height: 1.1;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.texto-botao small {
  color: #a08e7d;

  font-family:
    "DM Sans",
    Arial,
    sans-serif;

  font-size: 0.52rem;
  font-weight: 600;

  line-height: 1.2;

  white-space: nowrap;
}

.seta {
  flex-shrink: 0;

  margin-left: 2px;

  color: #b89764;

  font-size: 8px;

  transition:
    transform 0.2s ease;
}

.comprar-novamente:hover
.seta {
  transform: translateX(3px);
}

@media (max-width: 540px) {
  .comprar-novamente {
    min-height: 60px;

    gap: 8px;
  }

  .produto-mini-imagem {
    width: 44px;
    height: 44px;

    border-radius: 12px;
  }

  .icone-carrinho {
    width: 35px;
    height: 35px;
  }

  .texto-botao strong {
    font-size: 0.75rem;
  }

  .texto-botao small {
    font-size: 0.49rem;
  }
}

@media (max-width: 350px) {
  .comprar-novamente {
    gap: 6px;

    padding-right: 7px;
  }

  .produto-mini-imagem {
    width: 39px;
    height: 39px;

    border-radius: 10px;
  }

  .icone-carrinho {
    width: 32px;
    height: 32px;

    border-radius: 9px;

    font-size: 11px;
  }

  .texto-botao strong {
    font-size: 0.7rem;
  }

  .texto-botao small {
    font-size: 0.45rem;
  }

  .seta {
    font-size: 7px;
  }
}
</style>
