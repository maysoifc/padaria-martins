
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/Carteira.css";

const router = useRouter();
const CHAVE_CARTOES = "cartoesPagamento";

const cartoes = ref([]);
const cartaoAtual = ref(0);
const mostrarFormulario = ref(false);
const erro = ref("");

const formularioInicial = () => ({
  titular: "",
  numero: "",
  validade: "",
  cvv: "",
  bandeira: "Visa"
});

const novoCartao = ref(formularioInicial());

const numeroLimpo = computed(() =>
  novoCartao.value.numero.replace(/\D/g, "").slice(0, 16)
);

const numeroPreview = computed(() =>
  numeroLimpo.value
    ? numeroLimpo.value.replace(/(\d{4})(?=\d)/g, "$1 ")
    : "0000 0000 0000 0000"
);

const titularPreview = computed(() =>
  novoCartao.value.titular.trim().toUpperCase() || "NOME DO TITULAR"
);

const validadePreview = computed(() =>
  novoCartao.value.validade || "00/00"
);

const salvarCartoes = () => {
  localStorage.setItem(CHAVE_CARTOES, JSON.stringify(cartoes.value));
};

const carregarCartoes = () => {
  try {
    cartoes.value = JSON.parse(localStorage.getItem(CHAVE_CARTOES)) || [];
  } catch {
    cartoes.value = [];
  }

  cartaoAtual.value = 0;
};

const formatarNumero = () => {
  novoCartao.value.numero = numeroLimpo.value;
};

const formatarValidade = () => {
  const numeros = novoCartao.value.validade.replace(/\D/g, "").slice(0, 4);
  novoCartao.value.validade =
    numeros.length > 2
      ? `${numeros.slice(0, 2)}/${numeros.slice(2)}`
      : numeros;
};

const formatarCvv = () => {
  novoCartao.value.cvv = novoCartao.value.cvv.replace(/\D/g, "").slice(0, 4);
};

const detectarBandeira = (numero) => {
  if (numero.startsWith("4")) return "Visa";
  if (numero.startsWith("5")) return "Mastercard";
  if (numero.startsWith("6")) return "Elo";
  return novoCartao.value.bandeira;
};

const adicionarCartao = () => {
  erro.value = "";

  const { titular, validade, cvv } = novoCartao.value;
  const numero = numeroLimpo.value;
  const nome = titular.trim();
  const mes = Number(validade.split("/")[0]);

  if (!nome) erro.value = "Digite o nome do titular.";
  else if (numero.length < 8) erro.value = "Digite pelo menos 8 números fictícios.";
  else if (!/^\d{2}\/\d{2}$/.test(validade)) erro.value = "Digite a validade no formato MM/AA.";
  else if (mes < 1 || mes > 12) erro.value = "Digite um mês válido.";
  else if (cvv.replace(/\D/g, "").length < 3) erro.value = "Digite um CVV fictício.";

  if (erro.value) return;

  cartoes.value.push({
    id: Date.now(),
    bandeira: detectarBandeira(numero),
    final: numero.slice(-4),
    titular: nome.toUpperCase(),
    validade,
    principal: cartoes.value.length === 0
  });

  salvarCartoes();
  cartaoAtual.value = cartoes.value.length - 1;
  fecharFormulario();
};

const removerCartao = (id) => {
  const indice = cartoes.value.findIndex((cartao) => cartao.id === id);
  if (indice < 0) return;

  cartoes.value.splice(indice, 1);

  if (cartaoAtual.value > indice) cartaoAtual.value--;
  if (cartaoAtual.value >= cartoes.value.length) {
    cartaoAtual.value = Math.max(0, cartoes.value.length - 1);
  }

  salvarCartoes();
};

const definirPrincipal = (id) => {
  cartoes.value = cartoes.value.map((cartao) => ({
    ...cartao,
    principal: cartao.id === id
  }));

  cartaoAtual.value = cartoes.value.findIndex((cartao) => cartao.id === id);
  salvarCartoes();
};

const alternarPrincipal = (cartao) => {
  cartoes.value = cartoes.value.map((item) => ({
    ...item,
    principal: item.id === cartao.id ? !item.principal : item.principal
  }));

  salvarCartoes();
};

const proximoCartao = () => {
  if (cartoes.value.length) {
    cartaoAtual.value = (cartaoAtual.value + 1) % cartoes.value.length;
  }
};

const cartaoAnterior = () => {
  if (cartoes.value.length) {
    cartaoAtual.value =
      (cartaoAtual.value - 1 + cartoes.value.length) % cartoes.value.length;
  }
};

const fecharFormulario = () => {
  mostrarFormulario.value = false;
  erro.value = "";
  novoCartao.value = formularioInicial();
};

const voltar = () => router.back();

onMounted(carregarCartoes);
</script>

<template>
  <div class="carteira-page">
    <header class="page-header">
      <button class="back-button" aria-label="Voltar" @click="voltar">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div>
        <span class="eyebrow">CARTEIRA</span>
        <h1>Meus cartões</h1>
        <p>Gerencie seus cartões de pagamento</p>
      </div>
    </header>

    <main class="carteira-container">
      <section class="wallet-intro">
        <div class="wallet-icon"><i class="fa-solid fa-credit-card"></i></div>
        <div>
          <strong>Cartões de pagamento</strong>
          <p>Use seus cartões cadastrados nas próximas compras.</p>
        </div>
      </section>

      <section v-if="cartoes.length" class="cartoes-carousel">
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
            :style="{ transform: `translateX(-${cartaoAtual * 100}%)` }"
          >
            <article v-for="cartao in cartoes" :key="cartao.id" class="cartao-slide">
              <div class="cartao-wrapper">
                <div class="cartao">
                  <div class="cartao-top">
                    <span class="cartao-bandeira">{{ cartao.bandeira }}</span>
                    <div class="card-actions">
                      <span v-if="cartao.principal" class="principal-badge">
                        <i class="fa-solid fa-star"></i> Principal
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
                    <span></span><span></span><span></span>
                  </div>

                  <div class="cartao-numero">•••• •••• •••• {{ cartao.final }}</div>

                  <div class="cartao-bottom">
                    <div>
                      <span>TITULAR</span>
                      <strong>{{ cartao.titular }}</strong>
                    </div>
                    <div>
                      <span>VALIDADE</span>
                      <strong>{{ cartao.validade }}</strong>
                    </div>
                  </div>
                </div>

                <button
                  class="principal-button"
                  :class="{ active: cartao.principal }"
                  @click="alternarPrincipal(cartao)"
                >
                  <i :class="cartao.principal ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                  {{ cartao.principal ? "Tirar de principal" : "Usar como principal" }}
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

        <div v-if="cartoes.length > 1" class="carousel-dots">
          <button
            v-for="(cartao, index) in cartoes"
            :key="cartao.id"
            class="carousel-dot"
            :class="{ active: cartaoAtual === index }"
            :aria-label="`Ir para o cartão ${index + 1}`"
            @click="cartaoAtual = index"
          ></button>
        </div>

        <div v-if="cartoes.length > 1" class="carousel-counter">
          {{ cartaoAtual + 1 }} de {{ cartoes.length }}
        </div>
      </section>

      <section v-else class="empty-state">
        <div class="empty-icon"><i class="fa-regular fa-credit-card"></i></div>
        <h2>Nenhum cartão cadastrado</h2>
        <p>Adicione um cartão fictício para testar o fluxo de pagamento da aplicação.</p>
      </section>

      <button
        v-if="!mostrarFormulario"
        class="add-card-button"
        @click="mostrarFormulario = true"
      >
        <span>+</span> Adicionar cartão
      </button>

      <section v-if="mostrarFormulario" class="form-card">
        <div class="form-header">
          <div>
            <span class="section-label">NOVO CARTÃO</span>
            <h2>Adicionar cartão</h2>
          </div>
          <button class="close-button" aria-label="Fechar formulário" @click="fecharFormulario">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="card-preview">
          <div class="preview-top">
            <span>{{ novoCartao.bandeira }}</span>
            <span>SIMULAÇÃO</span>
          </div>
          <div class="preview-chip"></div>
          <strong>{{ numeroPreview }}</strong>
          <div class="preview-bottom">
            <div>
              <small>TITULAR</small>
              <span>{{ titularPreview }}</span>
            </div>
            <div>
              <small>VALIDADE</small>
              <span>{{ validadePreview }}</span>
            </div>
          </div>
        </div>

        <div class="simulation-note">
          <i class="fa-solid fa-flask"></i>
          <div>
            <strong>Cartão fictício</strong>
            <p>Este cartão é somente para simulação. Você pode inventar todos os dados.</p>
          </div>
        </div>

        <p v-if="erro" class="error-message"><span>!</span>{{ erro }}</p>

        <div class="form-grid">
          <div class="field full">
            <label for="titular">Nome do titular</label>
            <input
              id="titular"
              v-model="novoCartao.titular"
              type="text"
              maxlength="50"
              placeholder="Ex.: Maria da Silva"
            />
          </div>

          <div class="field full">
            <label for="numero">Número do cartão</label>
            <input
              id="numero"
              v-model="novoCartao.numero"
              type="text"
              inputmode="numeric"
              maxlength="16"
              placeholder="1234567890123456"
              @input="formatarNumero"
            />
          </div>

          <div class="field">
            <label for="validade">Validade</label>
            <input
              id="validade"
              v-model="novoCartao.validade"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="12/30"
              @input="formatarValidade"
            />
          </div>

          <div class="field">
            <label for="cvv">CVV</label>
            <input
              id="cvv"
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
          <label for="bandeira">Bandeira</label>
          <select id="bandeira" v-model="novoCartao.bandeira">
            <option>Visa</option>
            <option>Mastercard</option>
            <option>Elo</option>
            <option>Hipercard</option>
          </select>
        </div>

        <div class="security-note">
          <span><i class="fa-solid fa-shield-halved"></i></span>
          <p>Somente a bandeira, os últimos quatro números, o titular e a validade são armazenados.</p>
        </div>

        <div class="form-actions">
          <button class="cancel-button" @click="fecharFormulario">Cancelar</button>
          <button class="save-button" @click="adicionarCartao">
            <i class="fa-solid fa-check"></i> Salvar cartão
          </button>
        </div>
      </section>

      <div class="security-card">
        <div class="security-icon"><i class="fa-solid fa-lock"></i></div>
        <div>
          <strong>Ambiente de simulação</strong>
          <p>Nenhuma cobrança real é realizada. Os cartões servem apenas para testar a carteira e o checkout.</p>
        </div>
      </div>
    </main>
  </div>
</template>
