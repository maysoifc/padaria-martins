<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/composables/useCart";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const produto = ref(null);
const mostrarModal = ref(false);
const quantidade = ref(1);
const adicionando = ref(false);
const favorito = ref(false);

const avaliacoes = ref([]);
const avaliacaoAtual = ref(0);

let intervaloAvaliacoes = null;

const imagens = import.meta.glob(
  "../assets/img/*",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const fetchProduto = async () => {
  try {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const response = await fetch(
      `${baseUrl}/produtos/${route.params.id}/`
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar o produto."
      );
    }

    produto.value = await response.json();

    favorito.value =
      produto.value.favorito || false;

  } catch (error) {
    console.error(
      "Erro ao carregar detalhes:",
      error
    );
  }
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

  if (caminho) {
    return imagens[caminho];
  }

  console.error(
    "Imagem não encontrada:",
    nomeArquivo
  );

  return "";
};

const voltar = () => {
  router.back();
};

const aumentarQuantidade = () => {
  quantidade.value++;
};

const diminuirQuantidade = () => {
  if (quantidade.value > 1) {
    quantidade.value--;
  }
};

const abrirModal = () => {
  quantidade.value = 1;
  mostrarModal.value = true;
};

const fecharModal = () => {
  if (!adicionando.value) {
    mostrarModal.value = false;
  }
};

const adicionarAoCarrinho = async () => {
  if (
    !produto.value ||
    adicionando.value
  ) {
    return;
  }

  adicionando.value = true;

  try {
    for (
      let i = 0;
      i < quantidade.value;
      i++
    ) {
      cartStore.adicionarItem(
        produto.value
      );
    }

    mostrarModal.value = false;

  } finally {
    adicionando.value = false;
  }
};

const comprarAgora = async () => {
  await adicionarAoCarrinho();

  router.push("/carrinho");
};

const alternarFavorito = async () => {
  if (!produto.value) {
    return;
  }

  const novoStatus = !favorito.value;

  try {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000/api";

    const response = await fetch(
      `${baseUrl}/produtos/${produto.value.idProduto}/favorito/`,
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

    favorito.value = novoStatus;

    produto.value.favorito =
      novoStatus;

  } catch (error) {
    console.error(
      "Erro ao atualizar favorito:",
      error
    );
  }
};

const carregarAvaliacoes = () => {
  try {
    const salvo =
      localStorage.getItem(
        "historicoCompras"
      );

    if (!salvo) {
      avaliacoes.value = [];
      return;
    }

    const historico = JSON.parse(salvo);

    if (!Array.isArray(historico)) {
      avaliacoes.value = [];
      return;
    }

    const idAtual = String(
      produto.value?.idProduto ??
      produto.value?.id ??
      ""
    );

    const lista = [];

    historico.forEach((pedido) => {
      if (!Array.isArray(pedido.itens)) {
        return;
      }

      pedido.itens.forEach((item) => {
        const idItem = String(
          item.idProduto ??
          item.id ??
          ""
        );

        const comentario = String(
          item.comentario || ""
        ).trim();

        const nota = Number(
          item.nota || 0
        );

        if (
          idItem === idAtual &&
          comentario &&
          nota > 0
        ) {
          lista.push({
            comentario,
            nota,
            nome:
              item.nome ||
              produto.value?.nome ||
              "Cliente",
          });
        }
      });
    });

    avaliacoes.value = lista;
    avaliacaoAtual.value = 0;

    iniciarRotacaoAvaliacoes();

  } catch (error) {
    console.error(
      "Erro ao carregar avaliações:",
      error
    );

    avaliacoes.value = [];
  }
};

const iniciarRotacaoAvaliacoes = () => {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
    intervaloAvaliacoes = null;
  }

  if (avaliacoes.value.length <= 1) {
    return;
  }

  intervaloAvaliacoes = setInterval(() => {
    avaliacaoAtual.value =
      (avaliacaoAtual.value + 1) %
      avaliacoes.value.length;
  }, 5000);
};

const avaliacaoExibida = computed(() => {
  return (
    avaliacoes.value[
      avaliacaoAtual.value
    ] || null
  );
});

const selecionarAvaliacao = (index) => {
  avaliacaoAtual.value = index;

  iniciarRotacaoAvaliacoes();
};

onMounted(async () => {
  await fetchProduto();

  if (produto.value) {
    carregarAvaliacoes();
  }
});

onBeforeUnmount(() => {
  if (intervaloAvaliacoes) {
    clearInterval(intervaloAvaliacoes);
  }
});
</script>

<template>
  <div
    v-if="produto"
    class="pagina-detalhes"
  >
    <main class="produto">

      <section class="hero">

        <img
          v-if="getImageUrl(produto.imagem)"
          class="imagem-produto"
          :src="getImageUrl(produto.imagem)"
          :alt="produto.nome"
        />

        <div
          v-else
          class="imagem-produto imagem-placeholder"
        >
          <i
            class="fas fa-cookie-bite"
          ></i>
        </div>

        <div class="hero-overlay"></div>

        <button
          class="botao-voltar"
          type="button"
          @click="voltar"
          aria-label="Voltar"
        >
          <i
            class="fas fa-arrow-left"
          ></i>
        </button>

        <button
          class="botao-favorito"
          type="button"
          @click="alternarFavorito"
          aria-label="Favoritar produto"
        >
          <i
            :class="
              favorito
                ? 'fas fa-heart'
                : 'far fa-heart'
            "
          ></i>
        </button>

        <div class="avaliacao-hero">
          <i class="fas fa-star"></i>

          <span>
            {{
              Number(
                produto.avaliacao || 0
              ).toFixed(1)
            }}
          </span>
        </div>

      </section>

      <section class="conteudo">

        <div class="cabecalho-produto">

          <div>
            <span class="categoria">
              Produto artesanal
            </span>

            <h1>
              {{ produto.nome }}
            </h1>
          </div>

          <div class="preco">
            <small>R$</small>

            {{
              parseFloat(produto.preco)
                .toFixed(2)
                .replace(".", ",")
            }}
          </div>

        </div>

        <div class="divisor"></div>

        <section class="secao">

          <div class="titulo-secao">

            <span
              class="linha-titulo"
            ></span>

            <h2>
              Ingredientes
            </h2>

          </div>

          <div class="ingredientes">

            <article
              class="ingrediente-card"
            >

              <div
                class="ingrediente-icone"
              >
                <i
                  class="fas fa-bread-slice"
                ></i>
              </div>

              <div
                class="ingrediente-texto"
              >

                <span>Base</span>

                <p>
                  {{
                    produto.ingredientes_base ||
                    "Ingredientes não informados"
                  }}
                </p>

              </div>

            </article>

            <article
              class="ingrediente-card"
            >

              <div
                class="ingrediente-icone"
              >
                <i
                  class="fas fa-cookie-bite"
                ></i>
              </div>

              <div
                class="ingrediente-texto"
              >

                <span>
                  Cobertura
                </span>

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

        <section class="mensagem">

          <div
            class="mensagem-icone"
          >
            <i
              class="fas fa-heart"
            ></i>
          </div>

          <div>

            <strong>
              Feito com carinho
            </strong>

            <p>
              Preparado com ingredientes
              selecionados para deixar
              seu momento ainda mais
              especial.
            </p>

          </div>

        </section>

        <section
          v-if="avaliacaoExibida"
          class="avaliacoes-produto"
        >

          <div class="avaliacoes-cabecalho">

            <div class="titulo-secao">

              <span
                class="linha-titulo"
              ></span>

              <h2>
                O que nossos clientes dizem
              </h2>

            </div>

            <i
              class="fas fa-quote-right avaliacao-aspas"
            ></i>

          </div>

          <Transition
            name="avaliacao"
            mode="out-in"
          >

            <article
              :key="avaliacaoAtual"
              class="avaliacao-destaque"
            >

              <div class="avaliacao-estrelas">

                <i
                  v-for="estrela in 5"
                  :key="estrela"
                  class="fas fa-star"
                  :class="{
                    ativa:
                      estrela <=
                      avaliacaoExibida.nota
                  }"
                ></i>

              </div>

              <p
                class="avaliacao-comentario"
              >
                “{{ avaliacaoExibida.comentario }}”
              </p>

              <div
                class="avaliacao-cliente"
              >

                <span
                  class="cliente-icone"
                >
                  <i
                    class="fas fa-user"
                  ></i>
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

          <div
            v-if="avaliacoes.length > 1"
            class="avaliacao-indicadores"
          >

            <button
              v-for="(_, index) in avaliacoes"
              :key="index"
              type="button"
              :class="{
                ativo:
                  index ===
                  avaliacaoAtual
              }"
              :aria-label="
                `Mostrar avaliação ${index + 1}`
              "
              @click="
                selecionarAvaliacao(index)
              "
            ></button>

          </div>

        </section>

      </section>

    </main>

    <footer class="barra-compra">

      <div class="resumo-compra">

        <span>Total</span>

        <strong>
          R$

          {{
            (
              parseFloat(
                produto.preco
              ) * quantidade
            )
              .toFixed(2)
              .replace(".", ",")
          }}
        </strong>

      </div>

      <button
        class="botao-adicionar"
        type="button"
        @click="abrirModal"
      >

        <i
          class="fas fa-shopping-bag"
        ></i>

        <span>
          Adicionar ao carrinho
        </span>

      </button>

    </footer>

    <Transition name="modal">

      <div
        v-if="mostrarModal"
        class="modal-overlay"
        @click.self="fecharModal"
      >

        <div class="modal">

          <button
            class="modal-fechar"
            type="button"
            @click="fecharModal"
          >
            <i
              class="fas fa-times"
            ></i>
          </button>

          <div class="modal-icone">

            <i
              class="fas fa-shopping-bag"
            ></i>

          </div>

          <span class="modal-label">
            ADICIONAR AO PEDIDO
          </span>

          <h2>
            {{ produto.nome }}
          </h2>

          <p class="modal-preco">
            R$

            {{
              parseFloat(produto.preco)
                .toFixed(2)
                .replace(".", ",")
            }}
          </p>

          <div class="quantidade-box">

            <button
              type="button"
              @click="diminuirQuantidade"
              :disabled="quantidade <= 1"
            >
              −
            </button>

            <strong>
              {{ quantidade }}
            </strong>

            <button
              type="button"
              @click="aumentarQuantidade"
            >
              +
            </button>

          </div>

          <div class="modal-total">

            <span>Total</span>

            <strong>
              R$

              {{
                (
                  parseFloat(
                    produto.preco
                  ) * quantidade
                )
                  .toFixed(2)
                  .replace(".", ",")
              }}
            </strong>

          </div>

          <button
            class="modal-adicionar"
            type="button"
            :disabled="adicionando"
            @click="adicionarAoCarrinho"
          >

            <i
              class="fas fa-shopping-cart"
            ></i>

            {{
              adicionando
                ? "Adicionando..."
                : "Adicionar ao carrinho"
            }}

          </button>

          <button
            class="modal-comprar"
            type="button"
            :disabled="adicionando"
            @click="comprarAgora"
          >
            Comprar agora
          </button>

        </div>

      </div>

    </Transition>

  </div>
</template>

<style scoped>
.pagina-detalhes {
  min-height: 100vh;
  padding-bottom: 105px;
  background: #f8f5f0;
}

.produto {
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
  background: #ffffff;
}

.hero {
  position: relative;
  height: 330px;
  overflow: hidden;
  background: #eee5d8;
}

.imagem-produto {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.imagem-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b89764;
  font-size: 2.5rem;
  background:
    linear-gradient(
      135deg,
      #f7eee2,
      #eee1cf
    );
}

.hero-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      to bottom,
      rgba(40, 25, 20, 0.28),
      transparent 35%,
      rgba(40, 25, 20, 0.18)
    );

  pointer-events: none;
}

.botao-voltar,
.botao-favorito {
  position: absolute;
  top: 18px;

  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background:
    rgba(255, 255, 255, 0.94);

  color: #5e3023;

  cursor: pointer;

  box-shadow:
    0 5px 15px
      rgba(0, 0, 0, 0.14);

  backdrop-filter: blur(8px);

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.botao-voltar {
  left: 18px;
}

.botao-favorito {
  right: 18px;
}

.botao-voltar:hover,
.botao-favorito:hover {
  transform: translateY(-2px);
  background: #ffffff;
}

.botao-favorito .fas {
  color: #a86d62;
  animation: coracao 0.2s ease;
}

@keyframes coracao {
  0% {
    transform: scale(0.7);
  }

  100% {
    transform: scale(1);
  }
}

.avaliacao-hero {
  position: absolute;
  left: 18px;
  bottom: 18px;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 12px;

  border-radius: 12px;

  background:
    rgba(255, 255, 255, 0.95);

  color: #5e3023;

  font-size: 13px;
  font-weight: 700;

  box-shadow:
    0 5px 15px
      rgba(0, 0, 0, 0.12);
}

.avaliacao-hero i {
  color: #bba270;
}

.conteudo {
  padding: 26px 22px 25px;
}

.cabecalho-produto {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.categoria {
  display: block;
  margin-bottom: 7px;

  color: #bba270;

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.cabecalho-produto h1 {
  margin: 0;

  color: #5e3023;

  font-family:
    "Times New Roman",
    Georgia,
    serif;

  font-size: 29px;
  line-height: 1.08;
}

.preco {
  flex-shrink: 0;

  color: #bba270;

  font-size: 23px;
  font-weight: 800;

  white-space: nowrap;
}

.preco small {
  font-size: 12px;
  font-weight: 700;
}

.divisor {
  height: 1px;
  margin: 22px 0;

  background: #eee5da;
}

.secao {
  margin-top: 5px;
}

.titulo-secao {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 13px;
}

.linha-titulo {
  width: 4px;
  height: 18px;

  flex-shrink: 0;

  border-radius: 10px;

  background: #bba270;
}

.titulo-secao h2 {
  margin: 0;

  color: #5e3023;

  font-size: 15px;
  font-weight: 700;
}

.ingredientes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ingrediente-card {
  min-width: 0;

  padding: 13px;

  display: flex;
  align-items: flex-start;
  gap: 10px;

  background: #faf7f2;

  border: 1px solid #eee5da;
  border-radius: 15px;

  box-sizing: border-box;
}

.ingrediente-icone {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #f0e5d2;

  color: #6a3828;

  font-size: 13px;
}

.ingrediente-texto {
  min-width: 0;
}

.ingrediente-texto span {
  display: block;

  margin-bottom: 4px;

  color: #9a8b7d;

  font-size: 9px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.ingrediente-texto p {
  margin: 0;

  color: #5e3023;

  font-size: 12px;
  line-height: 1.35;

  overflow-wrap: anywhere;
}

.mensagem {
  margin-top: 20px;

  display: flex;
  align-items: flex-start;
  gap: 11px;

  padding: 14px;

  border-radius: 15px;

  background: #f8f0e3;
  border: 1px solid #eadbc4;
}

.mensagem-icone {
  width: 32px;
  height: 32px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #ffffff;

  color: #bba270;

  font-size: 12px;
}

.mensagem strong {
  display: block;

  margin-bottom: 3px;

  color: #5e3023;

  font-size: 12px;
}

.mensagem p {
  margin: 0;

  color: #806f62;

  font-size: 11px;
  line-height: 1.45;
}

.avaliacoes-produto {
  margin-top: 22px;
  padding: 18px 16px 16px;

  border: 1px solid #eadfd2;
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      #fffdf9,
      #f8f0e3
    );

  overflow: hidden;
}

.avaliacoes-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 14px;
}

.avaliacoes-cabecalho .titulo-secao {
  margin: 0;
}

.avaliacoes-cabecalho h2 {
  font-size: 14px;
}

.avaliacao-aspas {
  color: #d6c09b;
  font-size: 20px;
}

.avaliacao-destaque {
  min-height: 135px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 16px;

  border-radius: 15px;

  background: #ffffff;

  box-shadow:
    0 5px 18px
      rgba(94, 48, 35, 0.06);

  box-sizing: border-box;
}

.avaliacao-estrelas {
  display: flex;
  gap: 3px;

  margin-bottom: 9px;
}

.avaliacao-estrelas i {
  color: #e3d6c4;
  font-size: 10px;
}

.avaliacao-estrelas i.ativa {
  color: #bba270;
}

.avaliacao-comentario {
  margin: 0;

  color: #5e3023;

  font-family:
    "Imprima",
    Georgia,
    serif;

  font-size: 14px;
  line-height: 1.45;
}

.avaliacao-cliente {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-top: 13px;
}

.cliente-icone {
  width: 29px;
  height: 29px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #f2e7d8;
  color: #8d6844;

  font-size: 10px;
}

.avaliacao-cliente div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.avaliacao-cliente strong {
  color: #5e3023;

  font-size: 11px;
  font-weight: 700;
}

.avaliacao-cliente small {
  color: #a08e7d;

  font-size: 8px;
}

.avaliacao-indicadores {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  margin-top: 12px;
}

.avaliacao-indicadores button {
  width: 5px;
  height: 5px;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: #d9cbbb;

  cursor: pointer;

  transition:
    width 0.2s ease,
    background 0.2s ease;
}

.avaliacao-indicadores button.ativo {
  width: 15px;

  border-radius: 10px;

  background: #bba270;
}

.avaliacao-enter-active,
.avaliacao-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.avaliacao-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.avaliacao-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.barra-compra {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  padding:
    12px
    max(
      18px,
      calc((100vw - 650px) / 2)
    );

  background:
    rgba(255, 255, 255, 0.96);

  border-top: 1px solid #eadfd2;

  box-shadow:
    0 -5px 20px
      rgba(94, 48, 35, 0.08);

  backdrop-filter: blur(12px);

  box-sizing: border-box;
}

.resumo-compra {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resumo-compra span {
  color: #9a8b7d;

  font-size: 10px;
  font-weight: 600;
}

.resumo-compra strong {
  color: #5e3023;

  font-size: 18px;
}

.botao-adicionar {
  flex: 1;

  max-width: 360px;

  min-height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: none;
  border-radius: 14px;

  background: #5e3023;
  color: #ffffff;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 5px 14px
      rgba(94, 48, 35, 0.2);

  transition:
    transform 0.15s ease,
    background 0.2s ease;
}

.botao-adicionar:hover {
  background: #4d281f;
}

.botao-adicionar:active {
  transform: scale(0.97);
}

.modal-overlay {
  position: fixed;
  inset: 0;

  z-index: 1000;

  display: flex;
  align-items: flex-end;
  justify-content: center;

  padding: 0;

  background:
    rgba(43, 27, 22, 0.48);

  backdrop-filter: blur(5px);
}

.modal {
  position: relative;

  width: 100%;
  max-width: 480px;

  padding: 28px 22px 25px;

  background: #ffffff;

  border-radius: 26px 26px 0 0;

  text-align: center;

  box-shadow:
    0 -10px 40px
      rgba(0, 0, 0, 0.15);

  box-sizing: border-box;
}

.modal-fechar {
  position: absolute;

  top: 15px;
  right: 15px;

  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background: #f5eee3;
  color: #6a3828;

  cursor: pointer;
}

.modal-icone {
  width: 48px;
  height: 48px;

  margin: 0 auto 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: #f5eee3;
  color: #6a3828;

  font-size: 17px;
}

.modal-label {
  color: #bba270;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.4px;
}

.modal h2 {
  margin: 6px 35px 3px;

  color: #5e3023;

  font-family:
    "Times New Roman",
    Georgia,
    serif;

  font-size: 22px;
}

.modal-preco {
  margin: 0;

  color: #9a8b7d;

  font-size: 13px;
}

.quantidade-box {
  margin: 20px auto;

  width: fit-content;

  display: flex;
  align-items: center;

  gap: 18px;

  padding: 5px;

  border: 1px solid #eadfd2;
  border-radius: 50px;

  background: #faf7f2;
}

.quantidade-box button {
  width: 38px;
  height: 38px;

  border: none;
  border-radius: 50%;

  background: #ffffff;

  color: #5e3023;

  font-size: 20px;
  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 2px 6px
      rgba(0, 0, 0, 0.07);
}

.quantidade-box button:disabled {
  opacity: 0.35;
  cursor: default;
}

.quantidade-box strong {
  min-width: 22px;

  color: #5e3023;

  font-size: 19px;
}

.modal-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 12px;

  padding: 13px 15px;

  border-radius: 12px;

  background: #faf7f2;
}

.modal-total span {
  color: #806f62;

  font-size: 12px;
}

.modal-total strong {
  color: #5e3023;

  font-size: 17px;
}

.modal-adicionar,
.modal-comprar {
  width: 100%;

  min-height: 46px;

  border: none;
  border-radius: 13px;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
}

.modal-adicionar {
  background: #5e3023;
  color: #ffffff;
}

.modal-comprar {
  margin-top: 8px;

  background: #f5eee3;
  color: #6a3828;
}

.modal-adicionar:disabled,
.modal-comprar:disabled {
  opacity: 0.6;
  cursor: default;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition:
    transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(100%);
}

@media (min-width: 651px) {
  .pagina-detalhes {
    padding: 35px 20px 120px;
  }

  .produto {
    border-radius: 28px;
    overflow: hidden;

    box-shadow:
      0 15px 45px
        rgba(94, 48, 35, 0.1);
  }

  .hero {
    height: 390px;
  }

  .conteudo {
    padding: 32px;
  }

  .barra-compra {
    padding-left:
      calc((100vw - 650px) / 2);

    padding-right:
      calc((100vw - 650px) / 2);
  }

  .modal-overlay {
    align-items: center;
    padding: 20px;
  }

  .modal {
    border-radius: 26px;

    box-shadow:
      0 20px 60px
        rgba(0, 0, 0, 0.2);
  }
}

@media (max-width: 480px) {
  .hero {
    height: 285px;
  }

  .conteudo {
    padding: 22px 16px;
  }

  .cabecalho-produto h1 {
    font-size: 25px;
  }

  .preco {
    font-size: 20px;
  }

  .ingredientes {
    grid-template-columns: 1fr;
  }

  .avaliacoes-produto {
    margin-top: 18px;
    padding: 16px 13px 14px;
  }

  .avaliacao-destaque {
    min-height: 125px;
    padding: 14px;
  }

  .avaliacao-comentario {
    font-size: 13px;
  }

  .barra-compra {
    gap: 12px;
    padding: 10px 14px;
  }

  .resumo-compra strong {
    font-size: 16px;
  }

  .botao-adicionar {
    min-height: 46px;
    font-size: 12px;
  }
}
</style>
