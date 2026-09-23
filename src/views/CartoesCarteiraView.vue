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

<style scoped>
* {
  box-sizing: border-box;
}

.carteira-page {
  min-height: 100vh;
  padding: 25px 18px 50px;
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(187, 162, 112, 0.11),
      transparent 28%
    ),
    #f8f6f1;
  color: #30352e;
}

.page-header {
  max-width: 760px;
  margin: 0 auto 28px;
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding-top: 8px;
}

.back-button {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #e4dfd5;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #555950;
  font-size: 1.25rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.back-button:hover {
  transform: translateX(-2px);
  background: white;
}

.eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #b49a68;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.page-header h1 {
  margin: 0;
  color: #30372c;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2rem;
  font-weight: 500;
}

.page-header p {
  margin: 7px 0 0;
  color: #888a83;
  font-size: 0.8rem;
}

.carteira-container {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.wallet-intro {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  margin-bottom: 25px;
  background: white;
  border: 1px solid #ece8df;
  border-radius: 19px;
  box-shadow: 0 10px 30px rgba(45, 47, 40, 0.05);
}

.wallet-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #f5f0e5;
  color: #b49a68;
  font-size: 1.2rem;
}

.wallet-intro strong {
  display: block;
  color: #3d4239;
  font-size: 0.85rem;
}

.wallet-intro p {
  margin: 3px 0 0;
  color: #979890;
  font-size: 0.7rem;
}

.cartoes-carousel {
  position: relative;
  width: 100%;
  padding: 15px 58px 27px;
}

.carousel-window {
  width: 100%;
  overflow: hidden;
  border-radius: 30px;
  padding: 5px 0 15px;
}

.carousel-track {
  display: flex;
  width: 100%;
  transition:
    transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cartao-slide {
  width: 100%;
  min-width: 100%;
  padding: 0 4px;
}

.cartao-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cartao {
  width: 100%;
  min-height: 225px;
  padding: 23px;
  border-radius: 25px;
  color: white;
  background:
    linear-gradient(
      145deg,
      #514338,
      #2f302b
    );
  box-shadow:
    0 24px 45px rgba(40, 37, 31, 0.22),
    0 6px 14px rgba(40, 37, 31, 0.08);
  position: relative;
  overflow: hidden;
  transform: translateY(-2px);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.cartao:hover {
  transform: translateY(-6px);
  box-shadow:
    0 30px 52px rgba(40, 37, 31, 0.25),
    0 8px 18px rgba(40, 37, 31, 0.09);
}

.cartao::before {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  right: -125px;
  top: -110px;
  background: rgba(217, 193, 142, 0.06);
}

.cartao::after {
  content: "";
  position: absolute;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  right: -95px;
  bottom: -105px;
  background: rgba(217, 193, 142, 0.1);
}

.cartao-top {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cartao-bandeira {
  color: #e2c991;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.principal-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border: 1px solid rgba(226, 201, 145, 0.25);
  border-radius: 20px;
  background: rgba(226, 201, 145, 0.1);
  color: #dfc88f;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.principal-badge i {
  font-size: 0.45rem;
}

.remove-button {
  width: 29px;
  height: 29px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.remove-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.cartao-chip {
  width: 40px;
  height: 29px;
  margin-top: 27px;
  border-radius: 7px;
  background:
    linear-gradient(
      135deg,
      #d7bd82,
      #a78c54
    );
  position: relative;
  overflow: hidden;
}

.cartao-chip span {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.cartao-chip span:nth-child(1) {
  width: 1px;
  height: 100%;
  left: 50%;
}

.cartao-chip span:nth-child(2) {
  width: 100%;
  height: 1px;
  top: 50%;
}

.cartao-chip span:nth-child(3) {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  top: 7px;
  left: 12px;
  background: transparent;
}

.cartao-numero {
  position: relative;
  z-index: 2;
  margin-top: 20px;
  font-family: "Courier New", monospace;
  font-size: 0.96rem;
  letter-spacing: 0.12em;
}

.cartao-bottom {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 22px;
}

.cartao-bottom div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cartao-bottom div:first-child {
  flex: 1;
}

.cartao-bottom span {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.cartao-bottom strong {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.principal-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 175px;
  margin: 15px auto 0;
  padding: 8px 15px;
  border: 1px solid #ded8cb;
  border-radius: 20px;
  background: white;
  color: #8e774d;
  font-size: 0.62rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    0.2s ease,
    transform 0.2s ease;
}

.principal-button:hover {
  background: #faf7f0;
  transform: translateY(-1px);
}

.principal-button.active {
  border-color: #d6c69f;
  background: #f8f2e5;
  color: #9d8150;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 10;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ded9cf;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  color: #6b6c64;
  box-shadow: 0 10px 25px rgba(45, 47, 40, 0.13);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    0.2s ease,
    box-shadow 0.2s ease;
}

.carousel-arrow:hover {
  background: white;
  color: #9d8150;
  box-shadow: 0 13px 28px rgba(45, 47, 40, 0.18);
  transform: translateY(-50%) scale(1.06);
}

.carousel-arrow.left {
  left: 3px;
}

.carousel-arrow.right {
  right: 3px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 15px;
}

.carousel-dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #d8d4ca;
  cursor: pointer;
  transition: 0.25s ease;
}

.carousel-dot.active {
  width: 20px;
  border-radius: 10px;
  background: #b49a68;
}

.carousel-counter {
  margin-top: 7px;
  text-align: center;
  color: #9a9b95;
  font-size: 0.58rem;
}

.empty-state {
  padding: 48px 25px;
  text-align: center;
  background: white;
  border: 1px dashed #ddd8ce;
  border-radius: 23px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  background: #f5f0e5;
  color: #b49a68;
  font-size: 1.5rem;
}

.empty-state h2 {
  margin: 0;
  color: #3e433a;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.35rem;
  font-weight: 500;
}

.empty-state p {
  max-width: 340px;
  margin: 8px auto 20px;
  color: #92948d;
  font-size: 0.75rem;
  line-height: 1.5;
}

.add-card-button {
  width: 100%;
  min-height: 47px;
  margin-top: 16px;
  border: 1px dashed #cbbd9f;
  border-radius: 13px;
  background: #fffdf8;
  color: #9d8150;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.add-card-button:hover {
  background: #fdf9ef;
  transform: translateY(-1px);
}

.add-card-button span {
  margin-right: 7px;
  font-size: 1.1rem;
}

.form-card {
  margin-top: 18px;
  padding: 23px;
  background: white;
  border: 1px solid #e8e3da;
  border-radius: 23px;
  box-shadow: 0 14px 40px rgba(45, 47, 40, 0.06);
  animation: formEnter 0.3s ease both;
}

@keyframes formEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 19px;
}

.section-label {
  display: block;
  color: #b49a68;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  margin-bottom: 4px;
}

.form-header h2 {
  margin: 0;
  color: #343930;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.4rem;
  font-weight: 500;
}

.close-button {
  width: 32px;
  height: 32px;
  border: 1px solid #e3ded5;
  border-radius: 50%;
  background: #faf9f6;
  color: #777970;
  font-size: 1.15rem;
  cursor: pointer;
}

.card-preview {
  min-height: 190px;
  padding: 20px;
  margin-bottom: 18px;
  border-radius: 20px;
  background:
    linear-gradient(
      145deg,
      #4c4136,
      #292c27
    );
  color: white;
  box-shadow: 0 15px 30px rgba(45, 42, 35, 0.14);
}

.preview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dfc58e;
  font-size: 0.7rem;
  font-weight: 900;
}

.preview-chip {
  width: 37px;
  height: 27px;
  margin-top: 22px;
  border-radius: 7px;
  background:
    linear-gradient(
      135deg,
      #d7bd82,
      #a78c54
    );
}

.card-preview > strong {
  display: block;
  margin-top: 18px;
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  word-break: break-all;
}

.preview-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 18px;
}

.preview-bottom div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.preview-bottom div:first-child {
  flex: 1;
}

.preview-bottom small {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.46rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.preview-bottom span {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.58rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.simulation-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 17px;
  padding: 12px;
  border-radius: 12px;
  background: #f7f7f4;
}

.simulation-note > i {
  margin-top: 2px;
  color: #b49a68;
}

.simulation-note strong {
  display: block;
  margin-bottom: 3px;
  color: #555950;
  font-size: 0.68rem;
}

.simulation-note p {
  margin: 0;
  color: #888a83;
  font-size: 0.64rem;
  line-height: 1.5;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 17px;
  padding: 11px 13px;
  border-radius: 12px;
  background: #fbefec;
  color: #9b5547;
  font-size: 0.7rem;
}

.error-message span {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e6b7ac;
  color: white;
  font-weight: 900;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  min-width: 0;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: 7px;
  color: #4a4e45;
  font-size: 0.68rem;
  font-weight: 800;
}

.field input,
.field select {
  width: 100%;
  height: 48px;
  padding: 0 13px;
  border: 1px solid #e3dfd7;
  border-radius: 12px;
  outline: none;
  background: #fbfaf7;
  color: #343830;
  font-family: inherit;
  font-size: 0.8rem;
  transition: 0.2s ease;
}

.field input:focus,
.field select:focus {
  border-color: #bba270;
  background: white;
  box-shadow: 0 0 0 4px rgba(187, 162, 112, 0.08);
}

.field input::placeholder {
  color: #b2b3ad;
}

.bandeira-field {
  margin-top: 16px;
}

.security-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 17px;
  padding: 12px;
  border-radius: 12px;
  background: #f7f7f4;
}

.security-note > span {
  color: #75826c;
  font-size: 0.9rem;
}

.security-note p {
  margin: 0;
  color: #888a83;
  font-size: 0.64rem;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button,
.save-button {
  min-height: 47px;
  padding: 0 19px;
  border-radius: 13px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.cancel-button {
  border: 1px solid #dedad2;
  background: white;
  color: #777970;
}

.cancel-button:hover {
  background: #f7f5f0;
}

.save-button {
  border: 0;
  background: #30382d;
  color: white;
}

.save-button:hover {
  transform: translateY(-2px);
}

.security-card {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e8e4dc;
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.7);
}

.security-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #eef3ea;
  color: #697962;
}

.security-card strong {
  display: block;
  color: #555950;
  font-size: 0.7rem;
}

.security-card p {
  margin: 3px 0 0;
  color: #92948d;
  font-size: 0.62rem;
  line-height: 1.45;
}

@media (max-width: 650px) {
  .carteira-page {
    padding: 18px 13px 35px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-header h1 {
    font-size: 1.7rem;
  }

  .page-header p {
    font-size: 0.72rem;
  }

  .cartoes-carousel {
    padding-left: 43px;
    padding-right: 43px;
  }

  .carousel-arrow {
    width: 35px;
    height: 35px;
  }

  .carousel-arrow.left {
    left: 2px;
  }

  .carousel-arrow.right {
    right: 2px;
  }

  .cartao {
    min-height: 200px;
    padding: 19px;
    border-radius: 22px;
  }

  .cartao-chip {
    margin-top: 22px;
  }

  .cartao-numero {
    margin-top: 17px;
    font-size: 0.82rem;
  }

  .cartao-bottom {
    margin-top: 18px;
  }

  .principal-button {
    min-width: 165px;
  }

  .form-card {
    padding: 18px;
  }

  .card-preview {
    min-height: 180px;
  }
}

@media (max-width: 420px) {
  .page-header {
    gap: 11px;
  }

  .back-button {
    width: 38px;
    height: 38px;
  }

  .wallet-intro {
    padding: 15px;
  }

  .cartoes-carousel {
    padding-left: 35px;
    padding-right: 35px;
  }

  .carousel-arrow {
    width: 31px;
    height: 31px;
    font-size: 0.72rem;
  }

  .cartao {
    padding: 17px;
  }

  .cartao-numero {
    font-size: 0.76rem;
    letter-spacing: 0.08em;
  }

  .cartao-bottom strong {
    font-size: 0.58rem;
  }

  .principal-button {
    width: 100%;
    min-width: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
