<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFidelidade } from '@/composables/useFidelidade';
import PagamentoCartao from '@/components/PagamentoCartao.vue';

const router = useRouter();

const { adicionarSelo } = useFidelidade();

const itensCompra = ref([]);
const etapaAtual = ref(1);
const cartaoSelecionado = ref(null);

const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix',
  horarioRetirada: '',
  dataRetirada: ''
});

const hoje = new Date().toISOString().split('T')[0];

const dataMaxima = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
).toISOString().split('T')[0];

const formatarTelefone = (event) => {
  form.value.telefone = event.target.value
    .replace(/\D/g, '')
    .slice(0, 11);
};

onMounted(() => {
  const dados = localStorage.getItem('encomenda');

  if (dados) {
    try {
      const parsed = JSON.parse(dados);
      itensCompra.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      itensCompra.value = [];
    }
  }
});

const subtotal = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return total + parseFloat(item.preco || 0) * Number(item.qtd || 1);
  }, 0);
});

const quantidadeItens = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return total + Number(item.qtd || 1);
  }, 0);
});

const progressoPercent = computed(() => {
  return ((etapaAtual.value - 1) / 3) * 100;
});

const pagamentoCartao = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return null;
  }

  return cartaoSelecionado.value;
});

const parcelas = computed(() => {
  if (!pagamentoCartao.value) {
    return 1;
  }

  const quantidade = Number(pagamentoCartao.value.parcelas || 1);

  return quantidade > 0 ? quantidade : 1;
});

const juros = computed(() => {
  if (!pagamentoCartao.value) {
    return 0;
  }

  const valor = Number(pagamentoCartao.value.juros || 0);

  return Number.isFinite(valor) && valor > 0 ? valor : 0;
});

const totalComJuros = computed(() => {
  if (
    form.value.formaPagamento !== 'cartao' ||
    !pagamentoCartao.value
  ) {
    return subtotal.value;
  }

  const total = Number(pagamentoCartao.value.totalComJuros);

  if (Number.isFinite(total) && total > 0) {
    return total;
  }

  return subtotal.value;
});

const valorParcela = computed(() => {
  if (
    form.value.formaPagamento !== 'cartao' ||
    !pagamentoCartao.value
  ) {
    return subtotal.value;
  }

  const valor = Number(pagamentoCartao.value.valorParcela);

  if (Number.isFinite(valor) && valor > 0) {
    return valor;
  }

  return totalComJuros.value / parcelas.value;
});

const temParcelamento = computed(() => {
  return (
    form.value.formaPagamento === 'cartao' &&
    parcelas.value > 1
  );
});

const nomePagamento = computed(() => {
  if (form.value.formaPagamento === 'pix') {
    return 'PIX';
  }

  if (
    form.value.formaPagamento === 'cartao' &&
    cartaoSelecionado.value
  ) {
    const final = cartaoSelecionado.value.final || '';

    if (parcelas.value > 1) {
      return `Cartão •••• ${final} • ${parcelas.value}x de R$ ${valorParcela.value
        .toFixed(2)
        .replace('.', ',')}`;
    }

    return `Cartão •••• ${final}`;
  }

  return 'Cartão';
});

const textoParcelamento = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return '';
  }

  if (parcelas.value <= 1) {
    return `1x de R$ ${valorParcela.value
      .toFixed(2)
      .replace('.', ',')}`;
  }

  return `${parcelas.value}x de R$ ${valorParcela.value
    .toFixed(2)
    .replace('.', ',')}`;
});

const formatarMoeda = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
};

const formatarData = (data) => {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
};

const proximaEtapa = () => {
  if (etapaAtual.value === 1 && itensCompra.value.length === 0) {
    alert('Sua encomenda está vazia.');
    return;
  }

  if (etapaAtual.value === 2) {
    const telRegex = /^\d{10,11}$/;

    if (
      !form.value.nome.trim() ||
      !form.value.telefone ||
      !form.value.horarioRetirada ||
      !form.value.dataRetirada
    ) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (!telRegex.test(form.value.telefone)) {
      alert(
        'Telefone inválido. Digite apenas números com DDD, totalizando 10 ou 11 dígitos.'
      );
      return;
    }

    if (
      form.value.dataRetirada < hoje ||
      form.value.dataRetirada > dataMaxima
    ) {
      alert('A data deve ser entre hoje e os próximos 30 dias.');
      return;
    }

    const [horas, minutos] = form.value.horarioRetirada
      .split(':')
      .map(Number);

    const horarioEmMinutos = horas * 60 + minutos;

    if (horarioEmMinutos < 360 || horarioEmMinutos > 1320) {
      alert('Horário de atendimento: 06:00 às 22:00.');
      return;
    }
  }

  if (etapaAtual.value === 3) {
    if (
      form.value.formaPagamento === 'cartao' &&
      !cartaoSelecionado.value
    ) {
      alert('Selecione ou cadastre um cartão para continuar.');
      return;
    }
  }

  if (etapaAtual.value < 4) {
    etapaAtual.value++;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const etapaAnterior = () => {
  if (etapaAtual.value > 1) {
    etapaAtual.value--;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const finalizarCompra = () => {
  if (!itensCompra.value.length) {
    alert('Sua encomenda está vazia.');
    return;
  }

  if (!form.value.nome.trim()) {
    alert('Informe seu nome para continuar.');
    etapaAtual.value = 2;
    return;
  }

  if (
    !form.value.telefone ||
    !/^\d{10,11}$/.test(form.value.telefone)
  ) {
    alert('Informe um telefone válido.');
    etapaAtual.value = 2;
    return;
  }

  if (!form.value.dataRetirada || !form.value.horarioRetirada) {
    alert('Informe a data e o horário da retirada.');
    etapaAtual.value = 2;
    return;
  }

  if (
    form.value.formaPagamento === 'cartao' &&
    !cartaoSelecionado.value
  ) {
    alert('Selecione ou cadastre um cartão para continuar.');
    etapaAtual.value = 3;
    return;
  }

  adicionarSelo(subtotal.value);

  const encomendaFinalizada = {
    id: Date.now(),
    data: new Date().toISOString(),

    cliente: {
      nome: form.value.nome.trim(),
      telefone: form.value.telefone
    },

    retirada: {
      data: form.value.dataRetirada,
      horario: form.value.horarioRetirada
    },

    formaPagamento: form.value.formaPagamento,

    pagamentoFormatado: nomePagamento.value,

    cartao:
      form.value.formaPagamento === 'cartao'
        ? cartaoSelecionado.value
        : null,

    parcelas:
      form.value.formaPagamento === 'cartao'
        ? parcelas.value
        : 1,

    valorParcela:
      form.value.formaPagamento === 'cartao'
        ? valorParcela.value
        : subtotal.value,

    juros:
      form.value.formaPagamento === 'cartao'
        ? juros.value
        : 0,

    totalComJuros:
      form.value.formaPagamento === 'cartao'
        ? totalComJuros.value
        : subtotal.value,

    total: totalComJuros.value,

    quantidadeItens: quantidadeItens.value,

    itens: itensCompra.value
  };

  let historico = [];

  try {
    const salvo = localStorage.getItem('historicoEncomendas');

    if (salvo) {
      const dados = JSON.parse(salvo);

      if (Array.isArray(dados)) {
        historico = dados;
      }
    }
  } catch {
    historico = [];
  }

  historico.unshift(encomendaFinalizada);

  localStorage.setItem(
    'historicoEncomendas',
    JSON.stringify(historico)
  );

  localStorage.removeItem('encomenda');

  alert('Encomenda realizada com sucesso! 🎉');

  router.push('/home');
};
</script>
<template>
  <div class="checkout-page">

    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="checkout-container">

      <header class="checkout-header">

        <button @click="$router.back()" class="btn-voltar">
          <span>←</span>
          <span>Voltar</span>
        </button>

        <div class="header-title">
          <span class="eyebrow">SUA EXPERIÊNCIA</span>
          <h1>Finalizar encomenda</h1>
          <p>Estamos quase lá. Só precisamos de alguns detalhes.</p>
        </div>

      </header>

      <section class="progress-card">

        <div class="progress-top">
          <div>
            <span class="progress-caption">
              ETAPA {{ etapaAtual }} DE 4
            </span>

            <strong>
              {{
                etapaAtual === 1
                  ? 'Sua seleção'
                  : etapaAtual === 2
                    ? 'Dados da retirada'
                    : etapaAtual === 3
                      ? 'Pagamento'
                      : 'Confirmação'
              }}
            </strong>
          </div>

          <span class="progress-number">
            {{ Math.round(((etapaAtual - 1) / 3) * 100) }}%
          </span>
        </div>

        <div class="progress-line">
          <div
            class="progress-active"
            :style="{ width: progressoPercent + '%' }"
          ></div>
        </div>

        <div class="steps">

          <div
            class="step"
            :class="{
              active: etapaAtual >= 1,
              current: etapaAtual === 1
            }"
          >
            <div class="step-icon">01</div>
            <span>Encomenda</span>
          </div>

          <div
            class="step"
            :class="{
              active: etapaAtual >= 2,
              current: etapaAtual === 2
            }"
          >
            <div class="step-icon">02</div>
            <span>Retirada</span>
          </div>

          <div
            class="step"
            :class="{
              active: etapaAtual >= 3,
              current: etapaAtual === 3
            }"
          >
            <div class="step-icon">03</div>
            <span>Pagamento</span>
          </div>

          <div
            class="step"
            :class="{
              active: etapaAtual >= 4,
              current: etapaAtual === 4
            }"
          >
            <div class="step-icon">04</div>
            <span>Finalizar</span>
          </div>

        </div>

      </section>

      <section class="checkout-layout">

        <div class="main-card">

          <div
            v-if="etapaAtual === 1"
            class="step-content"
          >

            <div class="section-heading">
              <div>
                <span class="section-number">01</span>
                <h2>Confira sua encomenda</h2>
                <p>Os sabores escolhidos para o seu momento especial.</p>
              </div>

              <div class="items-count">
                {{ quantidadeItens }}
                {{ quantidadeItens === 1 ? 'item' : 'itens' }}
              </div>
            </div>

            <div
              v-if="itensCompra.length"
              class="items-list"
            >

              <div
                v-for="item in itensCompra"
                :key="item.idProduto"
                class="item-card"
              >

                <div class="item-icon">
                  <span>✦</span>
                </div>

                <div class="item-info">
                  <h3>{{ item.nome }}</h3>

                  <span>
                    {{ item.qtd || 1 }} ×
                    R$ {{ parseFloat(item.preco).toFixed(2).replace('.', ',') }}
                  </span>
                </div>

                <strong class="item-total">
                  R$
                  {{
                    (
                      parseFloat(item.preco || 0) *
                      (item.qtd || 1)
                    ).toFixed(2).replace('.', ',')
                  }}
                </strong>

              </div>

            </div>

            <div
              v-else
              class="empty-cart"
            >
              <div class="empty-icon">♡</div>
              <h3>Nenhum item encontrado</h3>
              <p>Adicione produtos à sua encomenda antes de continuar.</p>
            </div>

            <div class="total-box">

              <div>
                <span>Total da encomenda</span>
                <small>Valores calculados conforme sua seleção</small>
              </div>

              <strong>
                R$ {{ formatarMoeda(subtotal) }}
              </strong>

            </div>

            <div class="navigation">
              <button
                class="primary-button"
                @click="proximaEtapa"
              >
                Continuar
                <span>→</span>
              </button>
            </div>

          </div>

          <div
            v-if="etapaAtual === 2"
            class="step-content"
          >

            <div class="section-heading">
              <div>
                <span class="section-number">02</span>
                <h2>Como vamos preparar sua retirada?</h2>
                <p>Informe os dados para deixarmos tudo pronto para você.</p>
              </div>
            </div>

            <div class="form-grid">

              <div class="form-group full">
                <label>Nome para retirada</label>

                <div class="input-wrapper">
                  <span>♙</span>

                  <input
                    type="text"
                    v-model="form.nome"
                    placeholder="Digite seu nome"
                    autocomplete="name"
                  />
                </div>
              </div>

              <div class="form-group full">
                <label>Telefone</label>

                <div class="input-wrapper">
                  <span>⌕</span>

                  <input
                    type="tel"
                    :value="form.telefone"
                    @input="formatarTelefone"
                    placeholder="DDD + número"
                    maxlength="11"
                    autocomplete="tel"
                  />
                </div>

                <small>Somente números, com DDD.</small>
              </div>

              <div class="form-group">
                <label>Data da retirada</label>

                <div class="input-wrapper">
                  <span>◷</span>

                  <input
                    type="date"
                    v-model="form.dataRetirada"
                    :min="hoje"
                    :max="dataMaxima"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Horário</label>

                <div class="input-wrapper">
                  <span>◴</span>

                  <input
                    type="time"
                    v-model="form.horarioRetirada"
                    min="06:00"
                    max="22:00"
                  />
                </div>
              </div>

            </div>

            <div class="info-banner">

              <div class="info-banner-icon">
                ✦
              </div>

              <div>
                <strong>Retirada na loja</strong>

                <p>
                  Funcionamos todos os dias das 06h às 22h.
                  Escolha o melhor horário para você.
                </p>
              </div>

            </div>

            <div class="navigation">

              <button
                class="secondary-button"
                @click="etapaAnterior"
              >
                ← Voltar
              </button>

              <button
                class="primary-button"
                @click="proximaEtapa"
              >
                Continuar
                <span>→</span>
              </button>

            </div>

          </div>

          <div
            v-if="etapaAtual === 3"
            class="step-content"
          >

            <div class="section-heading">
              <div>
                <span class="section-number">03</span>
                <h2>Escolha como pagar</h2>
                <p>Selecione a forma de pagamento que prefere.</p>
              </div>
            </div>

            <div class="payment-options">

              <label
                class="payment-card"
                :class="{
                  selected: form.formaPagamento === 'pix'
                }"
              >

                <input
                  type="radio"
                  value="pix"
                  v-model="form.formaPagamento"
                />

                <div class="payment-icon pix-icon">
                  ◈
                </div>

                <div class="payment-info">
                  <strong>PIX</strong>
                  <span>Prático, rápido e seguro</span>
                </div>

                <div class="radio-check">
                  <span></span>
                </div>

              </label>

              <label
                class="payment-card"
                :class="{
                  selected: form.formaPagamento === 'cartao'
                }"
              >

                <input
                  type="radio"
                  value="cartao"
                  v-model="form.formaPagamento"
                />

                <div class="payment-icon card-icon">
                  ▣
                </div>

                <div class="payment-info">
                  <strong>Cartão</strong>
                  <span>Crédito ou débito</span>
                </div>

                <div class="radio-check">
                  <span></span>
                </div>

              </label>

            </div>

            <PagamentoCartao
              v-if="form.formaPagamento === 'cartao'"
              v-model="cartaoSelecionado"
              :valor="subtotal"
            />

            <div class="secure-message">
              <span>⌾</span>

              <div>
                <strong>Pagamento seguro</strong>
                <p>Seus dados são tratados com segurança.</p>
              </div>
            </div>

            <div class="navigation">

              <button
                class="secondary-button"
                @click="etapaAnterior"
              >
                ← Voltar
              </button>

              <button
                class="primary-button"
                @click="proximaEtapa"
              >
                Revisar pedido
                <span>→</span>
              </button>

            </div>

          </div>

          <div
            v-if="etapaAtual === 4"
            class="step-content"
          >

            <div class="confirmation-heading">

              <div class="success-symbol">
                ✓
              </div>

              <span class="section-number">04</span>

              <h2>Está tudo certo?</h2>

              <p>
                Revise os detalhes antes de confirmar sua encomenda.
              </p>

            </div>

            <div class="summary-list">

              <div class="summary-section">

                <div class="summary-title">
                  <span>01</span>
                  <strong>Identificação</strong>

                  <button @click="etapaAtual = 2">
                    Editar
                  </button>
                </div>

                <div class="summary-content">

                  <div>
                    <span>Nome</span>
                    <strong>{{ form.nome }}</strong>
                  </div>

                  <div>
                    <span>Telefone</span>
                    <strong>{{ form.telefone }}</strong>
                  </div>

                </div>

              </div>

              <div class="summary-section">

                <div class="summary-title">
                  <span>02</span>
                  <strong>Retirada</strong>

                  <button @click="etapaAtual = 2">
                    Editar
                  </button>
                </div>

                <div class="pickup-highlight">

                  <div class="pickup-icon">
                    ◷
                  </div>

                  <div>
                    <span>Data e horário</span>

                    <strong>
                      {{ formatarData(form.dataRetirada) }}
                      às
                      {{ form.horarioRetirada }}
                    </strong>
                  </div>

                </div>

              </div>

              <div class="summary-section">

                <div class="summary-title">
                  <span>03</span>
                  <strong>Pagamento</strong>

                  <button @click="etapaAtual = 3">
                    Editar
                  </button>
                </div>

                <div class="payment-summary">

                  <div class="payment-summary-icon">
                    {{ form.formaPagamento === 'pix' ? '◈' : '▣' }}
                  </div>

                  <div>
                    <span>Forma escolhida</span>
                    <strong>{{ nomePagamento }}</strong>
                  </div>

                </div>

                <div
                  v-if="form.formaPagamento === 'cartao'"
                  class="payment-details"
                >

                  <div class="payment-detail-row">

                    <div>
                      <span>Parcelamento</span>

                      <strong>
                        {{ textoParcelamento }}
                      </strong>
                    </div>

                    <div
                      v-if="juros > 0"
                      class="interest-value"
                    >
                      <span>Juros</span>

                      <strong>
                        + R$ {{ formatarMoeda(juros) }}
                      </strong>
                    </div>

                  </div>

                  <div
                    v-if="juros > 0"
                    class="interest-message"
                  >
                    <span>✦</span>

                    <div>
                      <strong>Parcelamento com juros</strong>

                      <p>
                        O valor dos juros já está incluído no total da encomenda.
                      </p>
                    </div>
                  </div>

                  <div
                    v-else
                    class="interest-message no-interest"
                  >
                    <span>✓</span>

                    <div>
                      <strong>Sem juros</strong>

                      <p>
                        Esta condição de pagamento não possui juros.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <div class="final-total">

              <div>
                <span>Total da encomenda</span>

                <small>
                  {{ quantidadeItens }}
                  {{ quantidadeItens === 1 ? 'item' : 'itens' }}
                  selecionados
                </small>
              </div>

              <strong>
                R$ {{ formatarMoeda(totalComJuros) }}
              </strong>

            </div>

            <div
              v-if="form.formaPagamento === 'cartao' && parcelas > 1"
              class="installment-summary"
            >

              <div class="installment-main">

                <span class="installment-icon">
                  ▣
                </span>

                <div>
                  <span>Valor por mês</span>

                  <strong>
                    {{ parcelas }}x de
                    R$ {{ formatarMoeda(valorParcela) }}
                  </strong>
                </div>

              </div>

              <div
                class="installment-total"
                :class="{ 'has-interest': juros > 0 }"
              >

                <div>
                  <span>
                    {{ juros > 0 ? 'Total com juros' : 'Total' }}
                  </span>

                  <strong>
                    R$ {{ formatarMoeda(totalComJuros) }}
                  </strong>
                </div>

                <div v-if="juros > 0">
                  <span>Juros</span>

                  <strong>
                    + R$ {{ formatarMoeda(juros) }}
                  </strong>
                </div>

              </div>

            </div>

            <div
              v-else-if="form.formaPagamento === 'cartao'"
              class="installment-summary"
            >

              <div class="installment-main">

                <span class="installment-icon">
                  ▣
                </span>

                <div>
                  <span>Pagamento</span>

                  <strong>
                    1x de R$ {{ formatarMoeda(valorParcela) }}
                  </strong>
                </div>
              </div>

              <div class="installment-total">

                <div>
                  <span>Total</span>

                  <strong>
                    R$ {{ formatarMoeda(totalComJuros) }}
                  </strong>
                </div>

                <div>
                  <span>Juros</span>

                  <strong>R$ 0,00</strong>
                </div>

              </div>

            </div>

            <div
              v-else
              class="pix-summary"
            >

              <div class="pix-summary-icon">
                ◈
              </div>

              <div>
                <span>Pagamento via PIX</span>

                <strong>
                  R$ {{ formatarMoeda(subtotal) }}
                </strong>

                <small>
                  Sem juros
                </small>
              </div>

            </div>

            <div class="navigation">

              <button
                class="secondary-button"
                @click="etapaAnterior"
              >
                ← Voltar
              </button>

              <button
                class="confirm-button"
                @click="finalizarCompra"
              >
                <span>Confirmar encomenda</span>
                <span>✓</span>
              </button>

            </div>

          </div>

        </div>

        <aside class="order-aside">

          <div class="aside-card">

            <span class="aside-label">
              SUA ENCOMENDA
            </span>

            <div class="aside-title">
              <h3>
                Um momento<br />
                feito para você.
              </h3>

              <span>✦</span>
            </div>

            <div class="aside-line"></div>

            <div class="aside-items">

              <div
                v-for="item in itensCompra"
                :key="`aside-${item.idProduto}`"
                class="aside-item"
              >

                <span>
                  {{ item.qtd || 1 }}× {{ item.nome }}
                </span>

                <strong>
                  R$
                  {{
                    (
                      parseFloat(item.preco || 0) *
                      (item.qtd || 1)
                    ).toFixed(2).replace('.', ',')
                  }}
                </strong>

              </div>

            </div>

            <div class="aside-total">

              <div>
                <span>Total</span>

                <small
                  v-if="
                    form.formaPagamento === 'cartao' &&
                    parcelas > 1
                  "
                >
                  {{ textoParcelamento }}
                </small>
              </div>

              <strong>
                R$ {{ formatarMoeda(totalComJuros) }}
              </strong>

            </div>

            <div
              v-if="
                form.formaPagamento === 'cartao' &&
                juros > 0
              "
              class="aside-interest"
            >
              <span>Juros do parcelamento</span>

              <strong>
                + R$ {{ formatarMoeda(juros) }}
              </strong>
            </div>

            <div class="aside-note">

              <span>✦</span>

              <p>
                Preparado com carinho especialmente para você.
              </p>

            </div>

          </div>

        </aside>

      </section>

    </main>

  </div>
</template>
<style scoped>
* {
  box-sizing: border-box;
}

.checkout-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 10%, rgba(187, 162, 112, 0.08), transparent 28%),
    radial-gradient(circle at 90% 70%, rgba(61, 74, 54, 0.07), transparent 30%),
    #f8f6f1;
  color: #252722;
  padding: 0 20px 60px;
  position: relative;
  overflow: hidden;
}

.ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.ambient-one {
  width: 300px;
  height: 300px;
  background: rgba(187, 162, 112, 0.08);
  top: -150px;
  left: -100px;
}

.ambient-two {
  width: 350px;
  height: 350px;
  background: rgba(61, 74, 54, 0.05);
  right: -180px;
  bottom: 10%;
}

.checkout-container {
  max-width: 1180px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding-top: 34px;
}

.checkout-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
}

.btn-voltar {
  position: absolute;
  left: 0;
  top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(37, 39, 34, 0.09);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  color: #45483f;
  padding: 10px 16px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-voltar:hover {
  transform: translateX(-3px);
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.btn-voltar span:first-child {
  font-size: 1.1rem;
}

.eyebrow {
  display: block;
  color: #b49a68;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  margin-bottom: 9px;
}

.header-title h1 {
  margin: 0;
  color: #30372c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.header-title p {
  color: #7d8078;
  margin: 10px 0 0;
  font-size: 0.95rem;
}

.progress-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 22px 30px 20px;
  margin-bottom: 22px;
  box-shadow: 0 18px 50px rgba(45, 47, 40, 0.07);
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 17px;
}

.progress-top div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.progress-caption {
  font-size: 0.63rem;
  font-weight: 800;
  color: #b49a68;
  letter-spacing: 0.14em;
}

.progress-top strong {
  color: #353a31;
  font-size: 0.85rem;
}

.progress-number {
  font-size: 0.75rem;
  font-weight: 800;
  color: #b49a68;
}

.progress-line {
  height: 4px;
  background: #ece9e1;
  border-radius: 10px;
  position: relative;
  margin: 0 8px 25px;
}

.progress-active {
  height: 100%;
  background: linear-gradient(90deg, #b49a68, #cbb27e);
  border-radius: inherit;
  transition: width 0.5s cubic-bezier(.4, 0, .2, 1);
}

.steps {
  display: flex;
  justify-content: space-between;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  color: #aaa9a3;
  font-size: 0.65rem;
  font-weight: 700;
}

.step-icon {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  border: 1px solid #dedbd3;
  background: #faf9f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  transition: 0.3s ease;
}

.step.active {
  color: #8e7547;
}

.step.active .step-icon {
  border-color: #bba270;
  background: #bba270;
  color: white;
}

.step.current .step-icon {
  box-shadow: 0 0 0 5px rgba(187, 162, 112, 0.13);
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 22px;
  align-items: start;
}

.main-card,
.aside-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 55px rgba(45, 47, 40, 0.07);
}

.main-card {
  border-radius: 28px;
  padding: 34px;
  min-height: 510px;
}

.step-content {
  animation: contentEnter 0.45s ease both;
}

@keyframes contentEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eeeae2;
  margin-bottom: 24px;
}

.section-number {
  display: block;
  color: #b49a68;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  margin-bottom: 5px;
}

.section-heading h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.65rem;
  font-weight: 500;
  color: #30372c;
  letter-spacing: -0.025em;
}

.section-heading p {
  margin: 7px 0 0;
  color: #85867f;
  font-size: 0.86rem;
}

.items-count {
  white-space: nowrap;
  padding: 8px 12px;
  border-radius: 30px;
  background: #f5f1e8;
  color: #9b8152;
  font-size: 0.7rem;
  font-weight: 800;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eeeae2;
  border-radius: 17px;
  background: #fff;
  transition: 0.25s ease;
}

.item-card:hover {
  border-color: #d8c7a6;
  transform: translateX(3px);
}

.item-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1e8;
  color: #b49a68;
  font-size: 1.2rem;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 5px;
  font-size: 0.92rem;
  color: #33372f;
  font-weight: 750;
}

.item-info span {
  font-size: 0.76rem;
  color: #92938d;
}

.item-total {
  color: #353930;
  font-size: 0.9rem;
  white-space: nowrap;
}

.empty-cart {
  text-align: center;
  padding: 50px 20px;
  border: 1px dashed #ddd8ce;
  border-radius: 20px;
}

.empty-icon {
  font-size: 2rem;
  color: #b49a68;
}

.empty-cart h3 {
  margin: 10px 0 5px;
  font-size: 1rem;
}

.empty-cart p {
  color: #898a83;
  font-size: 0.82rem;
}

.total-box,
.final-total {
  margin-top: 18px;
  padding: 20px;
  border-radius: 19px;
  background: #30382d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.total-box div,
.final-total div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-box span,
.final-total span {
  font-size: 0.82rem;
  font-weight: 700;
}

.total-box small,
.final-total small {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.67rem;
}

.total-box strong,
.final-total strong {
  color: #d9c18e;
  font-family: Georgia, serif;
  font-size: 1.5rem;
  white-space: nowrap;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  min-width: 0;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #454941;
  font-size: 0.75rem;
  font-weight: 800;
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: #999a94;
  font-size: 0.68rem;
}

.input-wrapper {
  height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e1d9;
  background: #fbfaf7;
  border-radius: 14px;
  padding: 0 14px;
  transition: 0.25s ease;
}

.input-wrapper > span {
  color: #b49a68;
  font-size: 1rem;
}

.input-wrapper:focus-within {
  border-color: #bba270;
  background: white;
  box-shadow: 0 0 0 4px rgba(187, 162, 112, 0.08);
}

.input-wrapper input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #30342e;
  font-size: 0.9rem;
}

.input-wrapper input::placeholder {
  color: #b3b3ad;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  padding: 16px;
  background: #f8f4eb;
  border: 1px solid #eee3cf;
  border-radius: 17px;
}

.info-banner-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #fff;
  color: #b49a68;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-banner strong {
  color: #5a4b31;
  font-size: 0.78rem;
}

.info-banner p {
  color: #8b806d;
  margin: 3px 0 0;
  font-size: 0.7rem;
  line-height: 1.5;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  border: 1px solid #e5e1d9;
  border-radius: 18px;
  cursor: pointer;
  transition: 0.25s ease;
  background: #fff;
}

.payment-card:hover {
  border-color: #cbb586;
  transform: translateY(-1px);
}

.payment-card.selected {
  border-color: #bba270;
  background: #fbf8f1;
  box-shadow: 0 8px 25px rgba(187, 162, 112, 0.1);
}

.payment-card input {
  display: none;
}

.payment-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.pix-icon {
  background: #eef4e9;
  color: #61775a;
}

.card-icon {
  background: #f4eee2;
  color: #a38651;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.payment-info strong {
  color: #34382f;
  font-size: 0.9rem;
}

.payment-info span {
  color: #969791;
  font-size: 0.72rem;
}

.radio-check {
  width: 21px;
  height: 21px;
  border: 1px solid #d5d1c8;
  border-radius: 50%;
  padding: 4px;
}

.radio-check span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  transition: 0.2s ease;
}

.payment-card.selected .radio-check {
  border-color: #bba270;
}

.payment-card.selected .radio-check span {
  background: #bba270;
}

.secure-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 13px 15px;
  border-radius: 14px;
  background: #f7f7f4;
}

.secure-message > span {
  color: #75826c;
  font-size: 1rem;
}

.secure-message strong {
  display: block;
  font-size: 0.72rem;
  color: #555950;
}

.secure-message p {
  margin: 2px 0 0;
  color: #999b94;
  font-size: 0.65rem;
}

.payment-details {
  margin-top: 14px;
  padding: 15px;
  border: 1px solid #ebe6dc;
  border-radius: 16px;
  background: #fbfaf7;
}

.payment-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.payment-detail-row > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.payment-detail-row span {
  color: #9a9b95;
  font-size: 0.63rem;
}

.payment-detail-row strong {
  color: #3d4139;
  font-size: 0.78rem;
}

.interest-value {
  text-align: right;
}

.interest-value strong {
  color: #a66e51;
}

.interest-message {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 13px;
  padding: 11px 12px;
  border-radius: 12px;
  background: #f7eee8;
}

.interest-message > span {
  color: #a66e51;
  font-size: 0.8rem;
  line-height: 1.2;
}

.interest-message strong {
  display: block;
  color: #80533d;
  font-size: 0.67rem;
}

.interest-message p {
  margin: 3px 0 0;
  color: #9a8175;
  font-size: 0.62rem;
  line-height: 1.45;
}

.interest-message.no-interest {
  background: #eef3ea;
}

.interest-message.no-interest > span {
  color: #61775a;
}

.interest-message.no-interest strong {
  color: #566950;
}

.interest-message.no-interest p {
  color: #7d8878;
}

.installment-summary {
  margin-top: 14px;
  padding: 16px;
  border-radius: 17px;
  border: 1px solid #e8e1d4;
  background: #faf7f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.installment-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.installment-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f0eadc;
  color: #a38651;
  font-size: 1rem;
}

.installment-main > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.installment-main span:not(.installment-icon) {
  color: #999a94;
  font-size: 0.63rem;
}

.installment-main strong {
  color: #3c4038;
  font-size: 0.82rem;
}

.installment-total {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  text-align: right;
}

.installment-total > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.installment-total span {
  color: #999a94;
  font-size: 0.61rem;
}

.installment-total strong {
  color: #3f433b;
  font-size: 0.76rem;
}

.installment-total.has-interest strong {
  color: #a66e51;
}

.pix-summary {
  margin-top: 14px;
  padding: 16px;
  border-radius: 17px;
  background: #f1f5ed;
  border: 1px solid #e0e8db;
  display: flex;
  align-items: center;
  gap: 13px;
}

.pix-summary-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: white;
  color: #61775a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}

.pix-summary > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pix-summary span {
  color: #7e8978;
  font-size: 0.64rem;
}

.pix-summary strong {
  color: #43503f;
  font-size: 0.9rem;
}

.pix-summary small {
  color: #81907b;
  font-size: 0.61rem;
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #eeeae2;
}

.primary-button,
.secondary-button,
.confirm-button {
  min-height: 50px;
  border-radius: 14px;
  padding: 0 22px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.primary-button {
  margin-left: auto;
  border: 0;
  background: #30382d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-width: 165px;
}

.primary-button span {
  color: #d5bc88;
  font-size: 1.1rem;
}

.primary-button:hover {
  background: #3e4939;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(48, 56, 45, 0.15);
}

.secondary-button {
  border: 1px solid #dedbd3;
  background: white;
  color: #666860;
}

.secondary-button:hover {
  background: #f7f5f0;
}

.confirm-button {
  margin-left: auto;
  border: 0;
  background: #b49a68;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-width: 210px;
}

.confirm-button span:last-child {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-button:hover {
  background: #9f844f;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(180, 154, 104, 0.25);
}

.confirmation-heading {
  text-align: center;
  padding-bottom: 25px;
  border-bottom: 1px solid #eeeae2;
  margin-bottom: 22px;
}

.success-symbol {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #eef3ea;
  color: #62755b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
}

.confirmation-heading .section-number {
  margin-bottom: 4px;
}

.confirmation-heading h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
  font-weight: 500;
  color: #30372c;
}

.confirmation-heading p {
  margin: 6px 0 0;
  color: #8b8d86;
  font-size: 0.8rem;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-section {
  padding: 17px;
  border: 1px solid #e9e5dd;
  border-radius: 17px;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 13px;
}

.summary-title > span {
  color: #b49a68;
  font-size: 0.62rem;
  font-weight: 900;
}

.summary-title strong {
  color: #44483f;
  font-size: 0.76rem;
}

.summary-title button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #b49a68;
  font-size: 0.67rem;
  font-weight: 800;
  cursor: pointer;
}

.summary-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding-left: 22px;
}

.summary-content div,
.pickup-highlight > div:last-child,
.payment-summary > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-content span,
.pickup-highlight span,
.payment-summary span {
  color: #9a9b95;
  font-size: 0.62rem;
}

.summary-content strong,
.pickup-highlight strong,
.payment-summary strong {
  color: #3b3f37;
  font-size: 0.76rem;
}

.pickup-highlight,
.payment-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 22px;
}

.pickup-icon,
.payment-summary-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f5f0e5;
  color: #b49a68;
}

.payment-summary-icon {
  background: #eef3ea;
  color: #65765e;
}

.final-total {
  margin-top: 18px;
}

.order-aside {
  position: sticky;
  top: 20px;
}

.aside-card {
  border-radius: 26px;
  padding: 26px;
  background:
    linear-gradient(145deg, #31392e, #252c23);
  color: white;
  box-shadow: 0 22px 55px rgba(36, 43, 34, 0.16);
  overflow: hidden;
  position: relative;
}

.aside-card::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(190, 165, 112, 0.08);
  right: -80px;
  top: -70px;
}

.aside-label {
  position: relative;
  color: #c7ae7a;
  font-size: 0.61rem;
  letter-spacing: 0.18em;
  font-weight: 900;
}

.aside-title {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 17px;
}

.aside-title h3 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.55rem;
  line-height: 1.15;
  font-weight: 500;
  letter-spacing: -0.03em;
}

.aside-title > span {
  color: #c7ae7a;
  font-size: 1.2rem;
}

.aside-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 25px 0 17px;
}

.aside-items {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.aside-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: rgba(255, 255, 255, 0.67);
  font-size: 0.72rem;
}

.aside-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aside-item strong {
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  font-size: 0.7rem;
}

.aside-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
  padding-top: 20px;
}

.aside-total > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.aside-total span {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.73rem;
}

.aside-total small {
  color: rgba(255, 255, 255, 0.43);
  font-size: 0.61rem;
}

.aside-total strong {
  color: #d9c18e;
  font-family: Georgia, serif;
  font-size: 1.45rem;
}

.aside-interest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 11px;
  padding: 9px 11px;
  border-radius: 10px;
  background: rgba(166, 110, 81, 0.13);
}

.aside-interest span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.62rem;
}

.aside-interest strong {
  color: #d5a08a;
  font-size: 0.65rem;
}

.aside-note {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-top: 22px;
  padding: 13px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.05);
}

.aside-note span {
  color: #c7ae7a;
}

.aside-note p {
  margin: 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.65rem;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-aside {
    position: static;
    order: -1;
  }

  .aside-card {
    padding: 22px;
  }

  .aside-title h3 {
    font-size: 1.3rem;
  }

  .aside-items {
    display: none;
  }

  .aside-total {
    margin-top: 18px;
    padding-top: 0;
    border-top: 0;
  }

  .aside-note {
    display: none;
  }
}

@media (max-width: 650px) {
  .checkout-page {
    padding: 0 12px 35px;
  }

  .checkout-container {
    padding-top: 20px;
  }

  .checkout-header {
    padding-top: 55px;
    margin-bottom: 20px;
  }

  .btn-voltar {
    top: 0;
    left: 0;
  }

  .header-title h1 {
    font-size: 2rem;
  }

  .header-title p {
    font-size: 0.82rem;
  }

  .progress-card {
    padding: 18px 15px;
    border-radius: 20px;
  }

  .progress-line {
    margin-bottom: 20px;
  }

  .step span {
    font-size: 0.55rem;
  }

  .step-icon {
    width: 27px;
    height: 27px;
    font-size: 0.52rem;
  }

  .main-card {
    padding: 22px 16px;
    border-radius: 22px;
  }

  .section-heading {
    margin-bottom: 19px;
    padding-bottom: 19px;
  }

  .section-heading h2 {
    font-size: 1.35rem;
  }

  .section-heading p {
    font-size: 0.76rem;
    line-height: 1.5;
  }

  .items-count {
    font-size: 0.6rem;
    padding: 6px 9px;
  }

  .item-card {
    padding: 12px;
  }

  .item-icon {
    width: 42px;
    height: 42px;
  }

  .item-info h3 {
    font-size: 0.82rem;
  }

  .item-total {
    font-size: 0.78rem;
  }

  .total-box,
  .final-total {
    padding: 17px;
  }

  .total-box strong,
  .final-total strong {
    font-size: 1.25rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-group.full {
    grid-column: auto;
  }

  .input-wrapper {
    height: 50px;
  }

  .payment-detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .interest-value {
    text-align: left;
  }

  .installment-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .installment-total {
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
    padding-top: 12px;
    border-top: 1px solid #e7dfd0;
  }

  .pix-summary {
    align-items: flex-start;
  }

  .navigation {
    flex-direction: column-reverse;
  }

  .primary-button,
  .secondary-button,
  .confirm-button {
    width: 100%;
    margin-left: 0;
  }

  .summary-content {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .confirmation-heading h2 {
    font-size: 1.45rem;
  }

  .aside-interest {
    padding: 9px;
  }
}

@media (max-width: 380px) {
  .step span {
    display: none;
  }

  .progress-card {
    padding-bottom: 16px;
  }

  .main-card {
    padding: 19px 13px;
  }

  .aside-card {
    padding: 19px;
  }

  .payment-card {
    padding: 14px;
    gap: 10px;
  }

  .payment-icon {
    width: 42px;
    height: 42px;
  }

  .installment-summary {
    padding: 13px;
  }

  .installment-total {
    gap: 12px;
  }
}
</style>
