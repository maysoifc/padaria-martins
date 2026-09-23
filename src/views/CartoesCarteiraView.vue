```vue
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const CHAVE_CARTOES = "cartoesPagamento";

const cartoes = ref([]);
const mostrarFormulario = ref(false);
const erro = ref("");
const cartaoAtual = ref(0);

const novoCartao = ref({
  titular: "",
  numero: "",
  validade: "",
  cvv: "",
  bandeira: "Visa"
});

const carregarCartoes = () => {
  try {
    const dados = localStorage.getItem(CHAVE_CARTOES);
    cartoes.value = dados ? JSON.parse(dados) : [];
  } catch {
    cartoes.value = [];
  }

  cartaoAtual.value = 0;
};

const salvarCartoes = () => {
  localStorage.setItem(
    CHAVE_CARTOES,
    JSON.stringify(cartoes.value)
  );
};

const numeroFormatado = computed(() => {
  const numero = novoCartao.value.numero
    .replace(/\D/g, "")
    .slice(0, 16);

  return numero.replace(/(\d{4})(?=\d)/g, "$1 ");
});

const numeroPreview = computed(() => {
  return numeroFormatado.value || "0000 0000 0000 0000";
});

const titularPreview = computed(() => {
  return novoCartao.value.titular.trim()
    ? novoCartao.value.titular.toUpperCase()
    : "NOME DO TITULAR";
});

const validadePreview = computed(() => {
  return novoCartao.value.validade || "00/00";
});

const formatarNumero = () => {
  novoCartao.value.numero = novoCartao.value.numero
    .replace(/\D/g, "")
    .slice(0, 16);
};

const formatarValidade = () => {
  let validade = novoCartao.value.validade
    .replace(/\D/g, "")
    .slice(0, 4);

  if (validade.length >= 3) {
    validade =
      validade.slice(0, 2) +
      "/" +
      validade.slice(2);
  }

  novoCartao.value.validade = validade;
};

const formatarCvv = () => {
  novoCartao.value.cvv = novoCartao.value.cvv
    .replace(/\D/g, "")
    .slice(0, 4);
};

const detectarBandeira = (numero) => {
  const limpo = numero.replace(/\D/g, "");

  if (limpo.startsWith("4")) {
    return "Visa";
  }

  if (limpo.startsWith("5")) {
    return "Mastercard";
  }

  if (limpo.startsWith("6")) {
    return "Elo";
  }

  return novoCartao.value.bandeira;
};

const adicionarCartao = () => {
  erro.value = "";

  const numero = novoCartao.value.numero.replace(/\D/g, "");
  const titular = novoCartao.value.titular.trim();
  const validade = novoCartao.value.validade.trim();
  const cvv = novoCartao.value.cvv.replace(/\D/g, "");

  if (!titular) {
    erro.value = "Digite o nome do titular.";
    return;
  }

  if (numero.length < 8) {
    erro.value = "Digite pelo menos 8 números fictícios.";
    return;
  }

  if (!/^\d{2}\/\d{2}$/.test(validade)) {
    erro.value = "Digite a validade no formato MM/AA.";
    return;
  }

  const mes = Number(validade.split("/")[0]);

  if (mes < 1 || mes > 12) {
    erro.value = "Digite um mês válido.";
    return;
  }

  if (cvv.length < 3) {
    erro.value = "Digite um CVV fictício.";
    return;
  }

  const bandeira = detectarBandeira(numero);

  const novo = {
    id: Date.now(),
    bandeira,
    final: numero.slice(-4),
    titular: titular.toUpperCase(),
    validade,
    principal: cartoes.value.length === 0
  };

  cartoes.value.push(novo);

  salvarCartoes();

  cartaoAtual.value = cartoes.value.length - 1;

  novoCartao.value = {
    titular: "",
    numero: "",
    validade: "",
    cvv: "",
    bandeira: "Visa"
  };

  mostrarFormulario.value = false;
};

const removerCartao = (id) => {
  const indiceRemovido = cartoes.value.findIndex(
    (cartao) => cartao.id === id
  );

  cartoes.value = cartoes.value.filter(
    (cartao) => cartao.id !== id
  );

  if (cartaoAtual.value > 0 && indiceRemovido <= cartaoAtual.value) {
    cartaoAtual.value--;
  }

  if (cartaoAtual.value >= cartoes.value.length) {
    cartaoAtual.value = Math.max(
      cartoes.value.length - 1,
      0
    );
  }

  salvarCartoes();
};

const definirPrincipal = (id) => {
  cartoes.value = cartoes.value.map(
    (cartao) => ({
      ...cartao,
      principal: cartao.id === id
    })
  );

  const indice = cartoes.value.findIndex(
    (cartao) => cartao.id === id
  );

  if (indice >= 0) {
    cartaoAtual.value = indice;
  }

  salvarCartoes();
};

const tirarPrincipal = (id) => {
  cartoes.value = cartoes.value.map(
    (cartao) => ({
      ...cartao,
      principal:
        cartao.id === id
          ? false
          : cartao.principal
    })
  );

  salvarCartoes();
};

const alternarPrincipal = (cartao) => {
  if (cartao.principal) {
    tirarPrincipal(cartao.id);
  } else {
    definirPrincipal(cartao.id);
  }
};

const proximoCartao = () => {
  if (!cartoes.value.length) return;

  cartaoAtual.value =
    (cartaoAtual.value + 1) % cartoes.value.length;
};

const cartaoAnterior = () => {
  if (!cartoes.value.length) return;

  cartaoAtual.value =
    (cartaoAtual.value - 1 + cartoes.value.length) %
    cartoes.value.length;
};

const selecionarCartao = (index) => {
  cartaoAtual.value = index;
};

const fecharFormulario = () => {
  mostrarFormulario.value = false;
  erro.value = "";

  novoCartao.value = {
    titular: "",
    numero: "",
    validade: "",
    cvv: "",
    bandeira: "Visa"
  };
};

const voltar = () => {
  router.back();
};

onMounted(carregarCartoes);
</script>

<template>
  <div class="carteira-page">

    <header class="page-header">

      <button
        class="back-button"
        @click="voltar"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div>
        <span class="eyebrow">
          CARTEIRA
        </span>

        <h1>
          Meus cartões
        </h1>

        <p>
          Gerencie seus cartões de pagamento
        </p>
      </div>

    </header>

    <main class="carteira-container">

      <section class="wallet-intro">

        <div class="wallet-icon">
          <i class="fa-solid fa-credit-card"></i>
        </div>

        <div>
          <strong>
            Cartões de pagamento
          </strong>

          <p>
            Use seus cartões cadastrados nas próximas compras.
          </p>
        </div>

      </section>

      <section
        v-if="cartoes.length"
        class="cartoes-carousel"
      >

        <button
          v-if="cartoes.length > 1"
          class="carousel-arrow left"
          aria-label="Cartão anterior"
          @click="cartaoAnterior"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="carousel-window">

          <div
            class="carousel-track"
            :style="{
              transform: `translateX(-${cartaoAtual * 100}%)`
            }"
          >

            <article
              v-for="cartao in cartoes"
              :key="cartao.id"
              class="cartao-slide"
            >

              <div class="cartao-wrapper">

                <div class="cartao">

                  <div class="cartao-top">

                    <span class="cartao-bandeira">
                      {{ cartao.bandeira }}
                    </span>

                    <div class="card-actions">

                      <span
                        v-if="cartao.principal"
                        class="principal-badge"
                      >
                        <i class="fa-solid fa-star"></i>
                        Principal
                      </span>

                      <button
                        class="remove-button"
                        aria-label="Remover cartão"
                        @click.stop="removerCartao(cartao.id)"
                      >
                        <i class="fa-solid fa-xmark"></i>
                      </button>

                    </div>

                  </div>

                  <div class="cartao-chip">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div class="cartao-numero">
                    •••• •••• •••• {{ cartao.final }}
                  </div>

                  <div class="cartao-bottom">

                    <div>
                      <span>
                        TITULAR
                      </span>

                      <strong>
                        {{ cartao.titular }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        VALIDADE
                      </span>

                      <strong>
                        {{ cartao.validade }}
                      </strong>
                    </div>

                  </div>

                </div>

                <button
                  class="principal-button"
                  :class="{ active: cartao.principal }"
                  @click="alternarPrincipal(cartao)"
                >
                  <i
                    :class="
                      cartao.principal
                        ? 'fa-solid fa-star'
                        : 'fa-regular fa-star'
                    "
                  ></i>

                  {{
                    cartao.principal
                      ? "Tirar de principal"
                      : "Usar como principal"
                  }}
                </button>

              </div>

            </article>

          </div>

        </div>

        <button
          v-if="cartoes.length > 1"
          class="carousel-arrow right"
          aria-label="Próximo cartão"
          @click="proximoCartao"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <div
          v-if="cartoes.length > 1"
          class="carousel-dots"
        >

          <button
            v-for="(cartao, index) in cartoes"
            :key="cartao.id"
            class="carousel-dot"
            :class="{ active: cartaoAtual === index }"
            :aria-label="`Ir para o cartão ${index + 1}`"
            @click="selecionarCartao(index)"
          ></button>

        </div>

        <div
          v-if="cartoes.length > 1"
          class="carousel-counter"
        >
          {{ cartaoAtual + 1 }} de {{ cartoes.length }}
        </div>

      </section>

      <section
        v-else
        class="empty-state"
      >

        <div class="empty-icon">
          <i class="fa-regular fa-credit-card"></i>
        </div>

        <h2>
          Nenhum cartão cadastrado
        </h2>

        <p>
          Adicione um cartão fictício para testar
          o fluxo de pagamento da aplicação.
        </p>

      </section>

      <button
        v-if="!mostrarFormulario"
        class="add-card-button"
        @click="mostrarFormulario = true"
      >
        <span>+</span>
        Adicionar cartão
      </button>

      <section
        v-if="mostrarFormulario"
        class="form-card"
      >

        <div class="form-header">

          <div>
            <span class="section-label">
              NOVO CARTÃO
            </span>

            <h2>
              Adicionar cartão
            </h2>
          </div>

          <button
            class="close-button"
            @click="fecharFormulario"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>

        </div>

        <div class="card-preview">

          <div class="preview-top">

            <span>
              {{ novoCartao.bandeira }}
            </span>

            <span>
              SIMULAÇÃO
            </span>

          </div>

          <div class="preview-chip"></div>

          <strong>
            {{ numeroPreview }}
          </strong>

          <div class="preview-bottom">

            <div>
              <small>
                TITULAR
              </small>

              <span>
                {{ titularPreview }}
              </span>
            </div>

            <div>
              <small>
                VALIDADE
              </small>

              <span>
                {{ validadePreview }}
              </span>
            </div>

          </div>

        </div>

        <div class="simulation-note">

          <i class="fa-solid fa-flask"></i>

          <div>
            <strong>
              Cartão fictício
            </strong>

            <p>
              Este cartão é somente para simulação.
              Você pode inventar todos os dados.
            </p>
          </div>

        </div>

        <p
          v-if="erro"
          class="error-message"
        >
          <span>!</span>
          {{ erro }}
        </p>

        <div class="form-grid">

          <div class="field full">

            <label>
              Nome do titular
            </label>

            <input
              v-model="novoCartao.titular"
              type="text"
              maxlength="50"
              placeholder="Ex.: Maria da Silva"
            />

          </div>

          <div class="field full">

            <label>
              Número do cartão
            </label>

            <input
              v-model="novoCartao.numero"
              type="text"
              inputmode="numeric"
              maxlength="16"
              placeholder="1234567890123456"
              @input="formatarNumero"
            />

          </div>

          <div class="field">

            <label>
              Validade
            </label>

            <input
              v-model="novoCartao.validade"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="12/30"
              @input="formatarValidade"
            />

          </div>

          <div class="field">

            <label>
              CVV
            </label>

            <input
              v-model="novoCartao.cvv"
              type="text"
              inputmode="numeric"
              maxlength="4"
              placeholder="123"
              @input="formatarCvv"
            />

          </div>

        </div>

        <div class="field bandeira-field">

          <label>
            Bandeira
          </label>

          <select
            v-model="novoCartao.bandeira"
          >
            <option value="Visa">
              Visa
            </option>

            <option value="Mastercard">
              Mastercard
            </option>

            <option value="Elo">
              Elo
            </option>

            <option value="Hipercard">
              Hipercard
            </option>
          </select>

        </div>

        <div class="security-note">

          <span>
            <i class="fa-solid fa-shield-halved"></i>
          </span>

          <p>
            Para esta simulação, apenas a bandeira,
            os últimos quatro números, titular e
            validade são armazenados.
          </p>

        </div>

        <div class="form-actions">

          <button
            class="cancel-button"
            @click="fecharFormulario"
          >
            Cancelar
          </button>

          <button
            class="save-button"
            @click="adicionarCartao"
          >
            <i class="fa-solid fa-check"></i>
            Salvar cartão
          </button>

        </div>

      </section>

      <div class="security-card">

        <div class="security-icon">
          <i class="fa-solid fa-lock"></i>
        </div>

        <div>

          <strong>
            Ambiente de simulação
          </strong>

          <p>
            Nenhuma cobrança real é realizada.
            Os cartões servem apenas para testar
            o funcionamento da carteira e do checkout.
          </p>

        </div>

      </div>

    </main>

  </div>
</template>
