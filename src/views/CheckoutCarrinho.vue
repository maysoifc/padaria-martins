<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/composables/useCart';
import { useFidelidade } from '@/composables/useFidelidade';
import PagamentoCartao from '@/components/PagamentoCartao.vue';

const router = useRouter();

const { removerItens } = useCartStore();
const { adicionarSelo } = useFidelidade();

const itensCompra = ref([]);
const etapaAtual = ref(1);
const erro = ref('');
const cartaoSelecionado = ref(null);

const statusFinalizacao = ref('ocioso');
let timerFinalizacao = null;

const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix'
});

const etapas = {
  1: 'Seu pedido',
  2: 'Seus dados',
  3: 'Pagamento',
  4: 'Finalizar'
};

const etapaNome = computed(() => etapas[etapaAtual.value] || '');

const progressoPercent = computed(() => {
  return (etapaAtual.value / 4) * 100;
});

const quantidadeTotal = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return total + Number(item.quantidade || 1);
  }, 0);
});

const subtotal = computed(() => {
  return itensCompra.value.reduce((total, item) => {
    return (
      total +
      Number(item.preco || 0) *
      Number(item.quantidade || 1)
    );
  }, 0);
});

const parcelasCartao = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return 1;
  }

  const cartao = cartaoSelecionado.value;

  const parcelas =
    Number(
      cartao?.parcelas ??
      cartao?.parcelamento ??
      cartao?.numeroParcelas ??
      1
    );

  return Number.isFinite(parcelas) && parcelas > 0
    ? parcelas
    : 1;
});

const valorParcela = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return subtotal.value;
  }

  const valorSalvo = Number(
    cartaoSelecionado.value?.valorParcela
  );

  if (
    Number.isFinite(valorSalvo) &&
    valorSalvo > 0
  ) {
    return valorSalvo;
  }

  return subtotal.value / parcelasCartao.value;
});

const jurosCartao = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return 0;
  }

  const juros = Number(
    cartaoSelecionado.value?.juros || 0
  );

  return Number.isFinite(juros) && juros > 0
    ? juros
    : 0;
});

const totalComJuros = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return subtotal.value;
  }

  const totalSalvo = Number(
    cartaoSelecionado.value?.totalComJuros
  );

  if (
    Number.isFinite(totalSalvo) &&
    totalSalvo > 0
  ) {
    return totalSalvo;
  }

  return subtotal.value + jurosCartao.value;
});

const textoParcelas = computed(() => {
  if (form.value.formaPagamento !== 'cartao') {
    return '';
  }

  return `${parcelasCartao.value}x de R$ ${formatarPreco(valorParcela.value)}`;
});

const cartaoResumo = computed(() => {
  if (
    form.value.formaPagamento !== 'cartao' ||
    !cartaoSelecionado.value
  ) {
    return null;
  }

  return {
    bandeira: cartaoSelecionado.value.bandeira || 'Cartão',
    final: cartaoSelecionado.value.final || '0000',
    titular: cartaoSelecionado.value.titular || '',
    parcelas: parcelasCartao.value,
    valorParcela: valorParcela.value,
    juros: jurosCartao.value,
    totalComJuros: totalComJuros.value
  };
});

const pagamentoFormatado = computed(() => {
  if (form.value.formaPagamento === 'pix') {
    return 'PIX';
  }

  if (form.value.formaPagamento === 'cartao') {
    if (cartaoSelecionado.value?.final) {
      const bandeira = cartaoSelecionado.value.bandeira
        ? `${cartaoSelecionado.value.bandeira} `
        : '';

      return `${bandeira}•••• ${cartaoSelecionado.value.final}`;
    }

    return 'Cartão';
  }

  return 'Não informado';
});

const carregarItensCompra = () => {
  try {
    const dados = localStorage.getItem('itensCheckout');

    if (!dados) {
      itensCompra.value = [];
      return;
    }

    const itens = JSON.parse(dados);

    itensCompra.value = Array.isArray(itens)
      ? itens
      : [];
  } catch {
    itensCompra.value = [];
  }
};

const carregarDadosCliente = () => {
  try {
    const dados = localStorage.getItem('dadosCliente');

    if (!dados) {
      return;
    }

    const cliente = JSON.parse(dados);

    if (cliente?.nome) {
      form.value.nome = cliente.nome;
    }

    if (cliente?.telefone) {
      form.value.telefone = cliente.telefone;
    }
  } catch {
    return;
  }
};

const carregarCartaoPrincipal = () => {
  try {
    const dados = localStorage.getItem('cartoesPagamento');

    if (!dados) {
      cartaoSelecionado.value = null;
      return;
    }

    const cartoes = JSON.parse(dados);

    if (!Array.isArray(cartoes) || !cartoes.length) {
      cartaoSelecionado.value = null;
      return;
    }

    const principal = cartoes.find(
      cartao => cartao.principal === true
    );

    if (principal) {
      cartaoSelecionado.value = principal;
      return;
    }

    cartaoSelecionado.value = null;
  } catch {
    cartaoSelecionado.value = null;
  }
};

const salvarDadosCliente = () => {
  localStorage.setItem(
    'dadosCliente',
    JSON.stringify({
      nome: form.value.nome.trim(),
      telefone: form.value.telefone
    })
  );
};

const getImageUrl = (nomeImagem) => {
  if (!nomeImagem) {
    return '';
  }

  try {
    return new URL(
      `../assets/img/${nomeImagem}`,
      import.meta.url
    ).href;
  } catch {
    return '';
  }
};

const formatarPreco = (valor) => {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
};

const quantidadeItem = (item) => {
  return Number(item.quantidade || 1);
};

const subtotalItem = (item) => {
  return (
    Number(item.preco || 0) *
    Number(item.quantidade || 1)
  );
};

const formatarTelefone = (event) => {
  const valor = event.target.value
    .replace(/\D/g, '')
    .slice(0, 11);

  form.value.telefone = valor;
  salvarDadosCliente();
};

const limparErro = () => {
  erro.value = '';
};

const validarEtapa = () => {
  limparErro();

  if (etapaAtual.value === 1) {
    if (!itensCompra.value.length) {
      erro.value =
        'Não há produtos selecionados para continuar.';
      return false;
    }
  }

  if (etapaAtual.value === 2) {
    if (!form.value.nome.trim()) {
      erro.value =
        'Informe seu nome para continuar.';
      return false;
    }

    if (
      !form.value.telefone ||
      form.value.telefone.length < 10
    ) {
      erro.value =
        'Informe um telefone válido para continuar.';
      return false;
    }

    salvarDadosCliente();
  }

  if (etapaAtual.value === 3) {
    if (!form.value.formaPagamento) {
      erro.value =
        'Selecione uma forma de pagamento.';
      return false;
    }

    if (
      form.value.formaPagamento === 'cartao' &&
      !cartaoSelecionado.value
    ) {
      erro.value =
        'Selecione um cartão salvo ou cadastre um novo cartão.';
      return false;
    }
  }

  return true;
};

const proximaEtapa = () => {
  if (!validarEtapa()) {
    return;
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
  limparErro();

  if (etapaAtual.value > 1) {
    etapaAtual.value--;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const voltarCarrinho = () => {
  router.push({
    name: 'carrinho'
  });
};

const gerarIdPedido = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

const salvarCompraNoHistorico = () => {
  let historico = [];

  try {
    const salvo = localStorage.getItem('historicoCompras');

    if (salvo) {
      const dados = JSON.parse(salvo);

      if (Array.isArray(dados)) {
        historico = dados;
      }
    }
  } catch {
    historico = [];
  }

  const pedidoId = gerarIdPedido();
  const dataCompra = new Date().toISOString();

  const pedido = {
    idPedido: pedidoId,
    dataCompra,
    cliente: {
      nome: form.value.nome.trim(),
      telefone: form.value.telefone
    },
    formaPagamento: form.value.formaPagamento,
    pagamentoFormatado: pagamentoFormatado.value,

    cartao:
      form.value.formaPagamento === 'cartao'
        ? {
            id: cartaoSelecionado.value?.id || null,
            bandeira:
              cartaoSelecionado.value?.bandeira || '',
            final:
              cartaoSelecionado.value?.final || '',
            parcelas: parcelasCartao.value,
            valorParcela: valorParcela.value,
            juros: jurosCartao.value,
            totalComJuros: totalComJuros.value
          }
        : null,

    total: subtotal.value,
    totalComJuros:
      form.value.formaPagamento === 'cartao'
        ? totalComJuros.value
        : subtotal.value,
    quantidadeTotal: quantidadeTotal.value,
    status: 'preparando',

    itens: itensCompra.value.map(item => ({
      ...item,
      idProduto: item.idProduto,
      quantidade: Number(item.quantidade || 1),
      preco: Number(item.preco || 0),
      avaliado: false,
      nota: null,
      comentario: ''
    }))
  };

  historico.unshift(pedido);

  localStorage.setItem(
    'historicoCompras',
    JSON.stringify(historico)
  );
};

const concluirPedido = () => {
  salvarDadosCliente();
  salvarCompraNoHistorico();
  adicionarSelo(subtotal.value);

  const idsComprados = itensCompra.value.map(
    item => item.idProduto
  );

  removerItens(idsComprados);

  localStorage.removeItem('itensCheckout');
  localStorage.removeItem('itensSelecionados');

  statusFinalizacao.value = 'sucesso';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const finalizarCompra = () => {
  limparErro();

  if (statusFinalizacao.value !== 'ocioso') {
    return;
  }

  if (!form.value.nome.trim()) {
    erro.value =
      'Informe seu nome para continuar.';
    etapaAtual.value = 2;
    return;
  }

  if (
    !form.value.telefone ||
    form.value.telefone.length < 10
  ) {
    erro.value =
      'Informe um telefone válido para continuar.';
    etapaAtual.value = 2;
    return;
  }

  if (!form.value.formaPagamento) {
    erro.value =
      'Selecione uma forma de pagamento.';
    etapaAtual.value = 3;
    return;
  }

  if (
    form.value.formaPagamento === 'cartao' &&
    !cartaoSelecionado.value
  ) {
    erro.value =
      'Selecione um cartão salvo ou cadastre um novo cartão.';
    etapaAtual.value = 3;
    return;
  }

  if (!itensCompra.value.length) {
    erro.value =
      'Não há produtos selecionados para finalizar.';
    etapaAtual.value = 1;
    return;
  }

  statusFinalizacao.value = 'processando';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  timerFinalizacao = setTimeout(() => {
    concluirPedido();
  }, 2200);
};

const voltarInicio = () => {
  router.push({
    name: 'home'
  });
};

watch(
  () => form.value.formaPagamento,
  (novoPagamento) => {
    if (novoPagamento === 'cartao') {
      carregarCartaoPrincipal();
    } else {
      cartaoSelecionado.value = null;
    }

    limparErro();
  }
);

onMounted(() => {
  carregarItensCompra();
  carregarDadosCliente();
});

onBeforeUnmount(() => {
  if (timerFinalizacao) {
    clearTimeout(timerFinalizacao);
  }
});
</script>

<template>
  <div class="checkout-page">
    <div class="decor decor-one"></div>
    <div class="decor decor-two"></div>

    <div
      v-if="statusFinalizacao === 'processando'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card processando-card">
        <div class="processando-icon">
          <div class="spinner"></div>
        </div>

        <span class="finalizacao-label">
          PAGAMENTO
        </span>

        <h1>Processando seu pedido</h1>

        <p>
          Estamos preparando tudo para finalizar sua compra.
        </p>

        <div class="processando-detalhes">
          <div>
            <span>Total</span>
            <strong>
              R$ {{ formatarPreco(
                form.formaPagamento === 'cartao'
                  ? totalComJuros
                  : subtotal
              ) }}
            </strong>
          </div>

          <div>
            <span>Pagamento</span>
            <strong>
              {{ pagamentoFormatado }}
            </strong>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
          >
            <span>Parcelamento</span>
            <strong>
              {{ textoParcelas }}
            </strong>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
          >
            <span>Juros</span>
            <strong>
              {{
                jurosCartao > 0
                  ? `R$ ${formatarPreco(jurosCartao)}`
                  : 'Sem juros'
              }}
            </strong>
          </div>
        </div>

        <div class="processando-barra">
          <div></div>
        </div>

        <small>
          Aguarde só um momento...
        </small>
      </div>
    </div>

    <div
      v-else-if="statusFinalizacao === 'sucesso'"
      class="finalizacao-page"
    >
      <div class="finalizacao-card sucesso-card">
        <div class="sucesso-icon">
          <i class="fa-solid fa-check"></i>
        </div>

        <span class="finalizacao-label">
          PEDIDO FINALIZADO
        </span>

        <h1>Pedido realizado com sucesso!</h1>

        <p>
          Tudo certo! Seu pedido foi registrado e já está sendo
          preparado com carinho.
        </p>

        <div class="sucesso-resumo">
          <div class="sucesso-resumo-item">
            <span>PEDIDO</span>
            <strong>
              {{ quantidadeTotal }}
              {{ quantidadeTotal === 1 ? 'item' : 'itens' }}
            </strong>
          </div>

          <div class="sucesso-resumo-item">
            <span>PAGAMENTO</span>
            <strong>
              {{ pagamentoFormatado }}
            </strong>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
            class="sucesso-resumo-item"
          >
            <span>PARCELAMENTO</span>
            <strong>
              {{ textoParcelas }}
            </strong>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
            class="sucesso-resumo-item"
          >
            <span>JUROS</span>
            <strong>
              {{
                jurosCartao > 0
                  ? `R$ ${formatarPreco(jurosCartao)}`
                  : 'Sem juros'
              }}
            </strong>
          </div>

          <div class="sucesso-resumo-item total">
            <span>TOTAL</span>
            <strong>
              R$
              {{ formatarPreco(
                form.formaPagamento === 'cartao'
                  ? totalComJuros
                  : subtotal
              ) }}
            </strong>
          </div>
        </div>

        <div class="sucesso-mensagem">
          <i class="fa-solid fa-heart"></i>

          <span>
            Obrigado por escolher a Padaria Martins!
          </span>
        </div>

        <button
          type="button"
          class="btn-finalizacao"
          @click="voltarInicio"
        >
          <span>Voltar para o início</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <template v-else>
      <header class="checkout-header">
        <button
          type="button"
          class="btn-voltar"
          aria-label="Voltar para o carrinho"
          @click="voltarCarrinho"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="header-brand">
          <span class="brand-overline">
            <i class="fa-solid fa-sparkles"></i>
            SEU PEDIDO
          </span>

          <h1>Finalizar compra</h1>

          <p>
            Só mais alguns passos para deixar tudo pronto.
          </p>
        </div>

        <div class="seguro-badge">
          <i class="fa-solid fa-lock"></i>
          <span>Seguro</span>
        </div>
      </header>

      <main class="checkout-container">
        <section class="progresso-card">
          <div class="progresso-heading">
            <div>
              <span>PROGRESSO DO PEDIDO</span>
              <strong>{{ etapaNome }}</strong>
            </div>

            <div class="etapa-numero">
              <b>{{ String(etapaAtual).padStart(2, "0") }}</b>
              <small>/ 04</small>
            </div>
          </div>

          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${progressoPercent}%` }"
            ></div>
          </div>

          <div class="passos">
            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 1 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-bag-shopping"></i>
              </div>
              <span>Pedido</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 2 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-user"></i>
              </div>
              <span>Dados</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 3 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-credit-card"></i>
              </div>
              <span>Pagamento</span>
            </div>

            <div
              class="passo"
              :class="{ ativo: etapaAtual >= 4 }"
            >
              <div class="passo-icon">
                <i class="fa-solid fa-check"></i>
              </div>
              <span>Finalizar</span>
            </div>
          </div>
        </section>

        <div
          v-if="erro"
          class="mensagem-erro"
        >
          <div class="erro-icon">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>

          <div class="erro-texto">
            <strong>Ops!</strong>
            <span>{{ erro }}</span>
          </div>

          <button
            type="button"
            aria-label="Fechar mensagem"
            @click="limparErro"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <section
          v-if="etapaAtual === 1"
          class="checkout-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>

            <div>
              <span>ETAPA 01</span>
              <h2>Seu pedido</h2>
            </div>
          </div>

          <div class="heading-description">
            <p>
              Tudo que você escolheu, reunido em um só lugar.
            </p>

            <span class="item-counter">
              {{ quantidadeTotal }}
              {{ quantidadeTotal === 1 ? "item" : "itens" }}
            </span>
          </div>

          <div class="produtos-lista">
            <article
              v-for="item in itensCompra"
              :key="item.idProduto"
              class="produto-checkout"
            >
              <div class="produto-imagem">
                <img
                  v-if="getImageUrl(item.imagem)"
                  :src="getImageUrl(item.imagem)"
                  :alt="item.nome"
                />

                <div
                  v-else
                  class="imagem-placeholder"
                >
                  <i class="fa-solid fa-cookie-bite"></i>
                </div>
              </div>

              <div class="produto-info">
                <span>PRODUTO</span>

                <h3>{{ item.nome }}</h3>

                <p>
                  {{ quantidadeItem(item) }}
                  × R$ {{ formatarPreco(item.preco) }}
                </p>
              </div>

              <strong class="produto-total">
                R$ {{ formatarPreco(subtotalItem(item)) }}
              </strong>
            </article>
          </div>

          <div class="total-card">
            <div>
              <span>RESUMO DO PEDIDO</span>

              <strong>
                {{ quantidadeTotal }}
                {{ quantidadeTotal === 1 ? "item" : "itens" }}
              </strong>
            </div>

            <div class="total-valor">
              <small>Total</small>

              <strong>
                R$ {{ formatarPreco(subtotal) }}
              </strong>
            </div>
          </div>

          <div class="acoes">
            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Continuar</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <section
          v-if="etapaAtual === 2"
          class="checkout-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-user"></i>
            </div>

            <div>
              <span>ETAPA 02</span>
              <h2>Seus dados</h2>
            </div>
          </div>

          <p class="section-description">
            Precisamos dessas informações para identificar seu pedido.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label for="nome">
                Nome completo
              </label>

              <div class="input-box">
                <i class="fa-solid fa-user"></i>

                <input
                  id="nome"
                  v-model="form.nome"
                  type="text"
                  placeholder="Como podemos chamar você?"
                  autocomplete="name"
                  @input="limparErro"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="telefone">
                Telefone
              </label>

              <div class="input-box">
                <i class="fa-solid fa-phone"></i>

                <input
                  id="telefone"
                  type="tel"
                  :value="form.telefone"
                  placeholder="DDD + número"
                  maxlength="11"
                  autocomplete="tel"
                  @input="formatarTelefone"
                  @focus="limparErro"
                />
              </div>

              <small>
                <i class="fa-solid fa-circle-info"></i>
                Exemplo: 48999999999
              </small>
            </div>
          </div>

          <div class="dados-nota">
            <div class="nota-icon">
              <i class="fa-solid fa-heart"></i>
            </div>

            <p>
              Essas informações serão usadas apenas para identificar e
              organizar seu pedido.
            </p>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Continuar</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <section
          v-if="etapaAtual === 3"
          class="checkout-card pagamento-card animate-fade"
        >
          <div class="section-heading">
            <div class="section-icon">
              <i class="fa-solid fa-credit-card"></i>
            </div>

            <div>
              <span>ETAPA 03</span>
              <h2>Pagamento</h2>
            </div>
          </div>

          <p class="section-description">
            Escolha a forma de pagamento que prefere utilizar.
          </p>

          <div class="pagamentos">
            <label
              class="pagamento"
              :class="{
                selecionado: form.formaPagamento === 'pix'
              }"
            >
              <input
                v-model="form.formaPagamento"
                type="radio"
                value="pix"
                @change="limparErro"
              />

              <div class="pagamento-icon pix">
                <i class="fa-brands fa-pix"></i>
              </div>

              <div class="pagamento-texto">
                <strong>PIX</strong>
                <span>Pagamento instantâneo</span>
              </div>

              <div class="check">
                <i
                  v-if="form.formaPagamento === 'pix'"
                  class="fa-solid fa-check"
                ></i>
              </div>
            </label>

            <label
              class="pagamento"
              :class="{
                selecionado: form.formaPagamento === 'cartao'
              }"
            >
              <input
                v-model="form.formaPagamento"
                type="radio"
                value="cartao"
                @change="limparErro"
              />

              <div class="pagamento-icon cartao">
                <i class="fa-solid fa-credit-card"></i>
              </div>

              <div class="pagamento-texto">
                <strong>Cartão</strong>
                <span>Use um cartão salvo ou adicione um novo</span>
              </div>

              <div class="check">
                <i
                  v-if="form.formaPagamento === 'cartao'"
                  class="fa-solid fa-check"
                ></i>
              </div>
            </label>
          </div>

          <div
            v-if="form.formaPagamento === 'cartao'"
            class="area-cartao"
          >
            <div class="cartao-topo">
              <div>
                <span class="cartao-label">
                  CARTÃO PARA O PAGAMENTO
                </span>

                <strong>
                  Seus cartões salvos
                </strong>
              </div>

              <div class="cartao-seguranca">
                <i class="fa-solid fa-lock"></i>
                Seguro
              </div>
            </div>

            <PagamentoCartao
              v-model="cartaoSelecionado"
              :valor="subtotal"
            />
          </div>

          <div class="seguranca">
            <div class="seguranca-icon">
              <i class="fa-solid fa-shield-halved"></i>
            </div>

            <div>
              <strong>Pagamento seguro</strong>

              <span>
                Apenas informações necessárias do cartão são utilizadas.
              </span>
            </div>
          </div>

          <div class="mini-total">
            <span>Total do pedido</span>

            <strong>
              R$ {{ formatarPreco(subtotal) }}
            </strong>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-principal"
              @click="proximaEtapa"
            >
              <span>Ver resumo</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <section
          v-if="etapaAtual === 4"
          class="checkout-card confirmacao-card animate-fade"
        >
          <div class="confirmacao-topo">
            <div class="check-grande">
              <i class="fa-solid fa-check"></i>
            </div>

            <span>ETAPA 04</span>

            <h2>Quase tudo pronto!</h2>

            <p>
              Confira os detalhes antes de confirmar seu pedido.
            </p>
          </div>

          <div class="recibo">
            <div class="recibo-header">
              <div>
                <span>RESUMO DO PEDIDO</span>
                <strong>Seu pedido</strong>
              </div>

              <i class="fa-solid fa-receipt"></i>
            </div>

            <div class="linha-detalhe"></div>

            <div class="cliente-resumo">
              <div class="cliente-item">
                <span>CLIENTE</span>
                <strong>{{ form.nome }}</strong>
              </div>

              <div class="cliente-item">
                <span>TELEFONE</span>
                <strong>{{ form.telefone }}</strong>
              </div>

              <div class="cliente-item">
                <span>PAGAMENTO</span>
                <strong>{{ pagamentoFormatado }}</strong>
              </div>
            </div>

            <div
              v-if="form.formaPagamento === 'cartao' && cartaoResumo"
              class="cartao-resumo"
            >
              <div class="cartao-resumo-header">
                <div class="cartao-mini-icon">
                  <i class="fa-solid fa-credit-card"></i>
                </div>

                <div>
                  <span>CARTÃO ESCOLHIDO</span>
                  <strong>
                    {{ cartaoResumo.bandeira }}
                    •••• {{ cartaoResumo.final }}
                  </strong>
                </div>
              </div>

              <div class="cartao-resumo-info">
                <div>
                  <span>TITULAR</span>
                  <strong>
                    {{ cartaoResumo.titular || 'Cartão cadastrado' }}
                  </strong>
                </div>

                <div>
                  <span>PARCELAMENTO</span>
                  <strong>
                    {{ cartaoResumo.parcelas }}x
                  </strong>
                </div>

                <div>
                  <span>VALOR POR MÊS</span>
                  <strong>
                    R$ {{ formatarPreco(cartaoResumo.valorParcela) }}
                  </strong>
                </div>

                <div>
                  <span>JUROS</span>
                  <strong
                    :class="{
                      'sem-juros': cartaoResumo.juros === 0
                    }"
                  >
                    {{
                      cartaoResumo.juros > 0
                        ? `R$ ${formatarPreco(cartaoResumo.juros)}`
                        : 'Sem juros'
                    }}
                  </strong>
                </div>

                <div>
                  <span>TOTAL COM JUROS</span>
                  <strong>
                    R$
                    {{ formatarPreco(cartaoResumo.totalComJuros) }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="linha-detalhe"></div>

            <div class="resumo-produtos">
              <div
                v-for="item in itensCompra"
                :key="item.idProduto"
                class="resumo-produto"
              >
                <div>
                  <span>{{ quantidadeItem(item) }}×</span>

                  <strong>
                    {{ item.nome }}
                  </strong>
                </div>

                <b>
                  R$ {{ formatarPreco(subtotalItem(item)) }}
                </b>
              </div>
            </div>

            <div class="linha-detalhe"></div>

            <div class="retirada">
              <div class="retirada-icon">
                <i class="fa-solid fa-store"></i>
              </div>

              <div>
                <span>FORMA DE ENTREGA</span>

                <strong>
                  Retirada na loja
                </strong>

                <small>
                  Seu pedido estará disponível para retirada.
                </small>
              </div>
            </div>

            <div class="total-recibo">
              <div>
                <span>TOTAL</span>

                <small>
                  {{ quantidadeTotal }}
                  {{ quantidadeTotal === 1 ? "item" : "itens" }}
                </small>
              </div>

              <strong>
                R$
                {{ formatarPreco(
                  form.formaPagamento === 'cartao'
                    ? totalComJuros
                    : subtotal
                ) }}
              </strong>
            </div>
          </div>

          <div class="acoes dois">
            <button
              type="button"
              class="btn-secundario"
              @click="etapaAnterior"
            >
              <i class="fa-solid fa-arrow-left"></i>
              <span>Voltar</span>
            </button>

            <button
              type="button"
              class="btn-confirmar"
              @click="finalizarCompra"
            >
              <span>Confirmar pedido</span>
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        </section>

        <div class="checkout-footer">
          <i class="fa-solid fa-heart"></i>
          Feito com carinho para você
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Imprima&display=swap");

.checkout-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding-bottom: 50px;
  background:
    radial-gradient(circle at 8% 12%, rgba(184,151,100,.1), transparent 20%),
    radial-gradient(circle at 92% 75%, rgba(94,48,35,.06), transparent 22%),
    linear-gradient(180deg,#fcfaf7 0%,#f7f0e8 100%);
  color: #5e3023;
  font-family: "DM Sans", Arial, sans-serif;
}

.decor {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgba(184,151,100,.16);
  border-radius: 50%;
}

.decor-one {
  width: 260px;
  height: 260px;
  top: 90px;
  left: -170px;
}

.decor-two {
  width: 210px;
  height: 210px;
  right: -140px;
  bottom: 120px;
}

.checkout-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 185px;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 70px;
  box-sizing: border-box;
}

.header-brand {
  text-align: center;
}

.brand-overline {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #b89764;
  font-size: .57rem;
  font-weight: 900;
  letter-spacing: 2.2px;
}

.header-brand h1 {
  margin: 9px 0 7px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2.2rem,7vw,3rem);
  font-weight: 400;
  line-height: 1;
}

.header-brand p {
  margin: 0;
  color: #97867b;
  font-size: .7rem;
}

.btn-voltar,
.seguro-badge {
  position: absolute;
  top: 30px;
}

.btn-voltar {
  left: 22px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(94,48,35,.1);
  border-radius: 15px;
  background: rgba(255,255,255,.9);
  color: #5e3023;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(94,48,35,.06);
  transition: .25s ease;
}

.btn-voltar:hover {
  background: #5e3023;
  color: white;
  transform: translateX(-2px);
}

.seguro-badge {
  right: 22px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 13px;
  border-radius: 15px;
  background: #5e3023;
  color: #e1c98f;
  box-shadow: 0 8px 25px rgba(94,48,35,.12);
  font-size: .58rem;
  font-weight: 800;
}

.checkout-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 730px;
  margin: 0 auto;
  padding: 0 18px;
  box-sizing: border-box;
}

.progresso-card {
  margin-bottom: 15px;
  padding: 19px 21px 17px;
  border: 1px solid rgba(94,48,35,.06);
  border-radius: 24px;
  background: rgba(255,255,255,.94);
  box-shadow: 0 12px 38px rgba(94,48,35,.065);
}

.progresso-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.progresso-heading > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progresso-heading span {
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.progresso-heading strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
}

.etapa-numero {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.etapa-numero b {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.3rem;
}

.etapa-numero small {
  color: #b4a79d;
  font-size: .58rem;
}

.progress-track {
  position: relative;
  height: 4px;
  margin: 0 8px 15px;
  overflow: hidden;
  border-radius: 10px;
  background: #eee6dc;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#5e3023,#b89764);
  transition: width .4s ease;
}

.passos {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.passo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.passo-icon {
  width: 29px;
  height: 29px;
  border: 1px solid #e1d8cf;
  border-radius: 50%;
  background: #fff;
  color: #aaa099;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  transition: .3s ease;
}

.passo span {
  color: #a99d94;
  font-size: .48rem;
  font-weight: 800;
}

.passo.ativo .passo-icon {
  border-color: #5e3023;
  background: #5e3023;
  color: #e1c98f;
  box-shadow: 0 4px 12px rgba(94,48,35,.15);
}

.passo.ativo span {
  color: #5e3023;
}

.mensagem-erro {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 11px 13px;
  border: 1px solid #ebcbc5;
  border-radius: 17px;
  background: #fff7f5;
}

.erro-icon {
  width: 31px;
  height: 31px;
  border-radius: 10px;
  background: #f7dfda;
  color: #a04f47;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.erro-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.mensagem-erro strong {
  color: #8f463f;
  font-size: .62rem;
}

.mensagem-erro span {
  color: #a16d66;
  font-size: .61rem;
}

.mensagem-erro button {
  border: none;
  background: transparent;
  color: #b48a83;
  cursor: pointer;
}

.checkout-card {
  padding: 25px;
  border: 1px solid rgba(94,48,35,.06);
  border-radius: 28px;
  background: rgba(255,255,255,.97);
  box-shadow: 0 18px 50px rgba(94,48,35,.07);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.section-icon {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  background: #f5ecdf;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-heading span {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.section-heading h2 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.55rem;
  font-weight: 400;
}

.section-description {
  margin: 13px 0 22px;
  color: #948379;
  font-size: .7rem;
  line-height: 1.6;
}

.heading-description {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 13px 0 20px;
}

.heading-description p {
  margin: 0;
  color: #948379;
  font-size: .7rem;
}

.item-counter {
  padding: 6px 9px;
  border-radius: 9px;
  background: #f6efe6;
  color: #8f7047;
  font-size: .52rem;
  font-weight: 900;
  white-space: nowrap;
}

.produtos-lista {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.produto-checkout {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #eee6dc;
  border-radius: 18px;
  background: #fcfaf7;
  transition: .25s ease;
}

.produto-checkout:hover {
  border-color: #d9c6a7;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(94,48,35,.05);
}

.produto-imagem {
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 15px;
  background: #eee1cf;
  flex-shrink: 0;
}

.produto-imagem img {
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
  font-size: 18px;
}

.produto-info {
  min-width: 0;
  flex: 1;
}

.produto-info > span {
  display: block;
  margin-bottom: 3px;
  color: #b89764;
  font-size: .44rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.produto-info h3 {
  margin: 0 0 4px;
  overflow: hidden;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .98rem;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.produto-info p {
  margin: 0;
  color: #96877d;
  font-size: .62rem;
}

.produto-total {
  color: #5e3023;
  font-size: .78rem;
  white-space: nowrap;
}

.total-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 15px;
  padding: 17px;
  border-radius: 20px;
  background: #5e3023;
  box-shadow: 0 10px 25px rgba(94,48,35,.12);
}

.total-card > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-card span {
  color: rgba(255,255,255,.52);
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.total-card strong {
  color: white;
  font-size: .73rem;
}

.total-valor {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.total-valor small {
  color: rgba(255,255,255,.52);
  font-size: .52rem;
}

.total-valor strong {
  color: #e1c98f;
  font-size: 1.35rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  color: #5e3023;
  font-size: .67rem;
  font-weight: 800;
}

.input-box {
  position: relative;
}

.input-box > i {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #b89764;
  font-size: 11px;
  transform: translateY(-50%);
}

.input-box input {
  width: 100%;
  height: 51px;
  box-sizing: border-box;
  padding: 0 14px 0 39px;
  border: 1px solid #e3dad0;
  border-radius: 15px;
  outline: none;
  background: #fcfaf7;
  color: #5e3023;
  font-family: inherit;
  font-size: .78rem;
  transition: .2s ease;
}

.input-box input::placeholder {
  color: #b4aaa2;
}

.input-box input:focus {
  border-color: #b89764;
  background: white;
  box-shadow: 0 0 0 4px rgba(184,151,100,.09);
}

.form-group small {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: #a3978f;
  font-size: .53rem;
}

.form-group small i {
  color: #b89764;
}

.dados-nota {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 15px;
  background: #f9f5ef;
}

.nota-icon {
  width: 31px;
  height: 31px;
  border-radius: 10px;
  background: #f0e4d3;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
}

.dados-nota p {
  margin: 0;
  color: #988980;
  font-size: .58rem;
  line-height: 1.5;
}

.pagamento-card {
  overflow: visible;
}

.pagamentos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagamento {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid #e2d9ce;
  border-radius: 18px;
  background: white;
  cursor: pointer;
  transition: .25s ease;
}

.pagamento:hover {
  transform: translateY(-1px);
  border-color: #cdb78f;
}

.pagamento.selecionado {
  border-color: #b89764;
  background: #fdfaf5;
  box-shadow: 0 8px 22px rgba(184,151,100,.1);
}

.pagamento input {
  display: none;
}

.pagamento-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}

.pagamento-icon.pix {
  background: #edf6ef;
  color: #438d5c;
}

.pagamento-icon.cartao {
  background: #f4ecdf;
  color: #8d7040;
}

.pagamento-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pagamento-texto strong {
  color: #5e3023;
  font-size: .76rem;
}

.pagamento-texto span {
  color: #9c8e84;
  font-size: .58rem;
}

.check {
  width: 20px;
  height: 20px;
  margin-left: auto;
  border: 1.5px solid #d6ccc1;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pagamento.selecionado .check {
  border-color: #5e3023;
  background: #5e3023;
}

.check i {
  font-size: 8px;
}

.area-cartao {
  margin-top: 18px;
  padding: 18px 14px 14px;
  border: 1px solid #eadfd2;
  border-radius: 22px;
  background:
    linear-gradient(180deg,#fffdfa 0%,#faf5ee 100%);
  box-shadow:
    0 15px 35px rgba(94,48,35,.055),
    inset 0 1px 0 rgba(255,255,255,.9);
}

.cartao-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 4px 8px;
}

.cartao-topo > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cartao-label {
  color: #b89764;
  font-size: .46rem;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.cartao-topo strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .98rem;
  font-weight: 400;
}

.cartao-seguranca {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 10px;
  background: #f0e8dd;
  color: #806744;
  font-size: .48rem;
  font-weight: 800;
}

.cartao-seguranca i {
  font-size: 8px;
}

.area-cartao :deep(.cartoes-pagamento),
.area-cartao :deep(.pagamento-cartao),
.area-cartao :deep(.cartao-wrapper) {
  margin-top: 0;
}

.seguranca {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 13px;
  border-radius: 15px;
  background: #f8f4ee;
}

.seguranca-icon {
  width: 33px;
  height: 33px;
  border-radius: 10px;
  background: #efe5d7;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seguranca div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.seguranca strong {
  color: #6d5b4f;
  font-size: .62rem;
}

.seguranca span {
  color: #a1958c;
  font-size: .54rem;
}

.mini-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11px;
  padding: 13px 15px;
  border: 1px solid #eee5da;
  border-radius: 14px;
  background: #fcfaf7;
}

.mini-total span {
  color: #8d7d72;
  font-size: .61rem;
}

.mini-total strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 400;
}

.confirmacao-card {
  padding-top: 28px;
}

.confirmacao-topo {
  text-align: center;
}

.check-grande {
  width: 58px;
  height: 58px;
  margin: 0 auto 11px;
  border-radius: 19px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(94,48,35,.14);
  font-size: 20px;
}

.confirmacao-topo > span {
  color: #b89764;
  font-size: .48rem;
  font-weight: 900;
  letter-spacing: 1.7px;
}

.confirmacao-topo h2 {
  margin: 6px 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.65rem;
  font-weight: 400;
}

.confirmacao-topo p {
  margin: 0 0 22px;
  color: #95867c;
  font-size: .66rem;
}

.recibo {
  overflow: hidden;
  border: 1px solid #e9e0d6;
  border-radius: 20px;
  background: #fcfaf7;
}

.recibo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px;
}

.recibo-header div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recibo-header span {
  color: #b89764;
  font-size: .46rem;
  font-weight: 900;
  letter-spacing: 1.3px;
}

.recibo-header strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
}

.recibo-header > i {
  color: #c0a878;
}

.linha-detalhe {
  height: 1px;
  margin: 0 17px;
  background: #e9e0d6;
}

.cliente-resumo {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 12px;
  padding: 15px 17px;
}

.cliente-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cliente-item span {
  color: #aa9d94;
  font-size: .45rem;
  font-weight: 800;
  letter-spacing: .8px;
}

.cliente-item strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo {
  margin: 0 17px 15px;
  padding: 14px;
  border: 1px solid #e4d7c6;
  border-radius: 16px;
  background: linear-gradient(135deg,#f7efe3,#fffaf4);
}

.cartao-resumo-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cartao-mini-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cartao-resumo-header > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cartao-resumo-header span {
  color: #b89764;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.cartao-resumo-header strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo-info {
  display: grid;
  grid-template-columns: 1.2fr .7fr 1fr;
  gap: 10px;
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px solid rgba(94,48,35,.08);
}

.cartao-resumo-info > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cartao-resumo-info span {
  color: #aa9d94;
  font-size: .4rem;
  font-weight: 800;
  letter-spacing: .7px;
}

.cartao-resumo-info strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .57rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cartao-resumo-info strong.sem-juros {
  color: #58724d;
}

.resumo-produtos {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 15px 17px;
}

.resumo-produto {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  color: #77675d;
  font-size: .63rem;
}

.resumo-produto > div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.resumo-produto > div span {
  color: #b89764;
  font-weight: 900;
}

.resumo-produto > div strong {
  overflow: hidden;
  color: #77675d;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resumo-produto b {
  color: #5e3023;
  white-space: nowrap;
}

.retirada {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 14px 17px;
  padding: 12px;
  border-radius: 14px;
  background: #f6efe5;
}

.retirada-icon {
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #eadcc9;
  color: #b89764;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.retirada div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.retirada span {
  color: #b89764;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.retirada strong {
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: .86rem;
  font-weight: 400;
}

.retirada small {
  color: #988a80;
  font-size: .51rem;
}

.total-recibo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 17px;
  background: #5e3023;
}

.total-recibo div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-recibo span {
  color: white;
  font-size: .62rem;
  font-weight: 900;
}

.total-recibo small {
  color: rgba(255,255,255,.48);
  font-size: .5rem;
}

.total-recibo > strong {
  color: #e1c98f;
  font-size: 1.3rem;
}

.acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.acoes.dois {
  justify-content: space-between;
  gap: 10px;
}

.btn-principal,
.btn-secundario,
.btn-confirmar {
  min-height: 48px;
  padding: 0 19px;
  border: none;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  cursor: pointer;
  font-family: inherit;
  font-size: .69rem;
  font-weight: 900;
  transition: .25s ease;
}

.btn-principal {
  min-width: 138px;
  background: #5e3023;
  color: white;
}

.btn-principal i {
  color: #e1c98f;
}

.btn-principal:hover {
  background: #754333;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(94,48,35,.15);
}

.btn-secundario {
  background: #f2ede7;
  color: #6d5c51;
}

.btn-secundario:hover {
  background: #e8dfd5;
}

.btn-confirmar {
  min-width: 165px;
  background: #b89764;
  color: white;
}

.btn-confirmar:hover {
  background: #9f814f;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(159,129,79,.18);
}

.checkout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 25px;
  color: #aa9d94;
  font-size: .52rem;
  letter-spacing: .4px;
}

.checkout-footer i {
  color: #b89764;
  font-size: 8px;
}

.animate-fade {
  animation: fadeIn .35s ease;
}

.finalizacao-page {
  position: relative;
  z-index: 5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 18px;
  box-sizing: border-box;
}

.finalizacao-card {
  width: 100%;
  max-width: 510px;
  padding: 42px 35px;
  border: 1px solid rgba(94,48,35,.07);
  border-radius: 32px;
  background: rgba(255,255,255,.97);
  text-align: center;
  box-shadow: 0 25px 70px rgba(94,48,35,.11);
  animation: finalizacaoEntrada .5s ease;
}

.finalizacao-label {
  display: block;
  margin-top: 16px;
  color: #b89764;
  font-size: .52rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.finalizacao-card h1 {
  margin: 9px 0 10px;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(2rem,6vw,2.6rem);
  font-weight: 400;
  line-height: 1.08;
}

.finalizacao-card > p {
  max-width: 390px;
  margin: 0 auto;
  color: #95867c;
  font-size: .7rem;
  line-height: 1.65;
}

.processando-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 24px;
  background: #f4eadc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dfcfb6;
  border-top-color: #5e3023;
  border-radius: 50%;
  animation: girar .8s linear infinite;
}

.processando-detalhes {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 10px;
  margin-top: 25px;
}

.processando-detalhes > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border-radius: 15px;
  background: #faf6f0;
}

.processando-detalhes span {
  color: #a3968c;
  font-size: .43rem;
  font-weight: 900;
  letter-spacing: .9px;
}

.processando-detalhes strong {
  color: #5e3023;
  font-size: .65rem;
}

.processando-barra {
  height: 4px;
  margin-top: 22px;
  overflow: hidden;
  border-radius: 20px;
  background: #eee5da;
}

.processando-barra div {
  width: 45%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg,#5e3023,#b89764);
  animation: carregar 2.1s ease forwards;
}

.processando-card small {
  display: block;
  margin-top: 13px;
  color: #aaa099;
  font-size: .53rem;
}

.sucesso-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 25px;
  background: #5e3023;
  color: #e1c98f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 14px 32px rgba(94,48,35,.17);
  animation: sucessoPop .6s ease;
}

.sucesso-resumo {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 9px;
  margin-top: 25px;
  text-align: left;
}

.sucesso-resumo-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 15px;
  background: #faf6f0;
}

.sucesso-resumo-item span {
  color: #a3968c;
  font-size: .42rem;
  font-weight: 900;
  letter-spacing: .9px;
}

.sucesso-resumo-item strong {
  overflow: hidden;
  color: #5e3023;
  font-size: .64rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sucesso-resumo-item.total {
  grid-column: 1 / -1;
  background: #5e3023;
}

.sucesso-resumo-item.total span {
  color: rgba(255,255,255,.55);
}

.sucesso-resumo-item.total strong {
  color: #e1c98f;
  font-size: 1.1rem;
}

.sucesso-mensagem {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 18px 0;
  padding: 12px;
  border-radius: 14px;
  background: #f8f2e9;
  color: #8f7960;
  font-size: .58rem;
}

.sucesso-mensagem i {
  color: #b89764;
}

.btn-finalizacao {
  width: 100%;
  min-height: 50px;
  padding: 0 20px;
  border: none;
  border-radius: 15px;
  background: #5e3023;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: .69rem;
  font-weight: 900;
  transition: .25s ease;
}

.btn-finalizacao i {
  color: #e1c98f;
}

.btn-finalizacao:hover {
  background: #754333;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(94,48,35,.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@keyframes carregar {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes finalizacaoEntrada {
  from {
    opacity: 0;
    transform: translateY(18px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes sucessoPop {
  0% {
    opacity: 0;
    transform: scale(.65);
  }

  70% {
    transform: scale(1.08);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width:600px) {
  .checkout-page {
    padding-bottom: 35px;
  }

  .checkout-header {
    min-height: 155px;
    padding: 25px 58px;
  }

  .btn-voltar,
  .seguro-badge {
    top: 20px;
  }

  .btn-voltar {
    left: 16px;
    width: 40px;
    height: 40px;
  }

  .seguro-badge {
    right: 16px;
    height: 40px;
    padding: 0 10px;
  }

  .header-brand h1 {
    font-size: 2rem;
  }

  .header-brand p {
    font-size: .62rem;
  }

  .checkout-container {
    padding: 0 12px;
  }

  .progresso-card {
    padding: 17px 15px 15px;
    border-radius: 20px;
  }

  .checkout-card {
    padding: 18px;
    border-radius: 23px;
  }

  .section-heading {
    gap: 10px;
  }

  .section-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
  }

  .section-heading h2 {
    font-size: 1.35rem;
  }

  .heading-description {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 16px;
  }

  .produto-checkout {
    gap: 9px;
    padding: 8px;
  }

  .produto-imagem {
    width: 55px;
    height: 55px;
    border-radius: 13px;
  }

  .produto-info h3 {
    font-size: .88rem;
  }

  .produto-info p {
    font-size: .57rem;
  }

  .produto-total {
    font-size: .68rem;
  }

  .total-card {
    padding: 14px;
  }

  .total-valor strong {
    font-size: 1.15rem;
  }

  .area-cartao {
    margin-top: 15px;
    padding: 15px 9px 11px;
    border-radius: 19px;
  }

  .cartao-topo {
    align-items: flex-start;
    margin-bottom: 7px;
  }

  .cartao-seguranca {
    padding: 5px 7px;
    font-size: .43rem;
  }

  .cliente-resumo {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cartao-resumo-info {
    grid-template-columns: 1fr 1fr;
  }

  .cartao-resumo-info > div:last-child {
    grid-column: 1 / -1;
  }

  .acoes.dois {
    flex-direction: column-reverse;
  }

  .acoes.dois button {
    width: 100%;
  }

  .btn-principal,
  .btn-secundario,
  .btn-confirmar {
    width: 100%;
  }

  .resumo-produto {
    font-size: .58rem;
  }

  .retirada {
    align-items: flex-start;
  }

  .finalizacao-page {
    padding: 20px 12px;
  }

  .finalizacao-card {
    padding: 32px 20px;
    border-radius: 26px;
  }

  .finalizacao-card h1 {
    font-size: 2rem;
  }

  .processando-detalhes {
    grid-template-columns: 1fr;
  }

  .sucesso-resumo {
    grid-template-columns: 1fr;
  }

  .sucesso-resumo-item.total {
    grid-column: auto;
  }
}

@media (min-width:601px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
