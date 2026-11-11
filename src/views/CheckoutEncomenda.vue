<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFidelidade } from '@/composables/useFidelidade';
import PagamentoCartao from '@/components/PagamentoCartao.vue';
import '@/assets/css/EncomendaCheckout.css';

const router = useRouter();
const { adicionarSelo } = useFidelidade();

const itensCompra = ref([]);
const etapaAtual = ref(1);
const cartaoSelecionado = ref(null);
const processando = ref(false);

const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix',
  horarioRetirada: '',
  dataRetirada: ''
});

const dataLocal = (data = new Date()) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const hoje = dataLocal();
const dataMaxima = (() => {
  const data = new Date();
  data.setDate(data.getDate() + 30);
  return dataLocal(data);
})();

const formatarMoeda = valor =>
  Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const formatarData = data => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

const formatarTelefone = event => {
  form.value.telefone = event.target.value
    .replace(/\D/g, '')
    .slice(0, 11);
};

onMounted(() => {
  try {
    const dados = JSON.parse(localStorage.getItem('encomenda') || '[]');
    itensCompra.value = Array.isArray(dados) ? dados : [];
  } catch {
    itensCompra.value = [];
  }
});

const subtotal = computed(() =>
  itensCompra.value.reduce((total, item) => {
    const preco = Number(item.preco) || 0;
    const quantidade = Math.max(1, Number(item.qtd) || 1);
    return total + preco * quantidade;
  }, 0)
);

const quantidadeItens = computed(() =>
  itensCompra.value.reduce(
    (total, item) => total + Math.max(1, Number(item.qtd) || 1),
    0
  )
);

const progressoPercent = computed(() =>
  ((etapaAtual.value - 1) / 3) * 100
);

const pagamentoCartao = computed(() =>
  form.value.formaPagamento === 'cartao'
    ? cartaoSelecionado.value
    : null
);

const parcelas = computed(() => {
  const quantidade = Number(pagamentoCartao.value?.parcelas || 1);
  return Number.isFinite(quantidade) && quantidade > 0
    ? Math.floor(quantidade)
    : 1;
});

const juros = computed(() => {
  const valor = Number(pagamentoCartao.value?.juros || 0);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
});

const totalComJuros = computed(() => {
  if (!pagamentoCartao.value) return subtotal.value;

  const totalInformado = Number(pagamentoCartao.value.totalComJuros);

  if (Number.isFinite(totalInformado) && totalInformado >= subtotal.value) {
    return totalInformado;
  }

  return subtotal.value + juros.value;
});

const valorParcela = computed(() => {
  if (!pagamentoCartao.value) return subtotal.value;

  const valorInformado = Number(pagamentoCartao.value.valorParcela);

  if (Number.isFinite(valorInformado) && valorInformado > 0) {
    return valorInformado;
  }

  return totalComJuros.value / parcelas.value;
});

const nomePagamento = computed(() => {
  if (form.value.formaPagamento === 'pix') return 'PIX';

  const final = pagamentoCartao.value?.final;

  if (final && parcelas.value > 1) {
    return `Cartão •••• ${final} • ${parcelas.value}x de R$ ${formatarMoeda(valorParcela.value)}`;
  }

  return final ? `Cartão •••• ${final}` : 'Cartão';
});

const textoParcelamento = computed(() =>
  `${parcelas.value}x de R$ ${formatarMoeda(valorParcela.value)}`
);

const validarRetirada = () => {
  const telefone = form.value.telefone;
  const data = form.value.dataRetirada;
  const horario = form.value.horarioRetirada;

  if (
    !form.value.nome.trim() ||
    !telefone ||
    !data ||
    !horario
  ) {
    alert('Por favor, preencha todos os campos.');
    return false;
  }

  if (!/^\d{10,11}$/.test(telefone)) {
    alert('Informe um telefone válido com DDD.');
    return false;
  }

  if (data < hoje || data > dataMaxima) {
    alert('A data deve estar entre hoje e os próximos 30 dias.');
    return false;
  }

  const [horas, minutos] = horario.split(':').map(Number);
  const minutosTotais = horas * 60 + minutos;

  if (
    !Number.isFinite(minutosTotais) ||
    minutosTotais < 360 ||
    minutosTotais > 1320
  ) {
    alert('O horário de retirada deve ser entre 06:00 e 22:00.');
    return false;
  }

  return true;
};

const proximaEtapa = () => {
  if (etapaAtual.value === 1 && !itensCompra.value.length) {
    alert('Sua encomenda está vazia.');
    return;
  }

  if (etapaAtual.value === 2 && !validarRetirada()) return;

  if (
    etapaAtual.value === 3 &&
    form.value.formaPagamento === 'cartao' &&
    !cartaoSelecionado.value
  ) {
    alert('Selecione ou cadastre um cartão para continuar.');
    return;
  }

  if (etapaAtual.value < 4) {
    etapaAtual.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const etapaAnterior = () => {
  if (etapaAtual.value > 1) {
    etapaAtual.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const editarEtapa = etapa => {
  etapaAtual.value = etapa;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const dadosSegurosCartao = cartao => {
  if (!cartao) return null;

  const camposPermitidos = [
    'id',
    'bandeira',
    'final',
    'titular',
    'parcelas',
    'juros',
    'totalComJuros',
    'valorParcela'
  ];

  return Object.fromEntries(
    camposPermitidos
      .filter(campo => cartao[campo] !== undefined)
      .map(campo => [campo, cartao[campo]])
  );
};

const finalizarCompra = () => {
  if (processando.value) return;

  if (!itensCompra.value.length) {
    alert('Sua encomenda está vazia.');
    etapaAtual.value = 1;
    return;
  }

  if (!validarRetirada()) {
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

  processando.value = true;

  try {
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
      cartao: form.value.formaPagamento === 'cartao'
        ? dadosSegurosCartao(cartaoSelecionado.value)
        : null,
      parcelas: form.value.formaPagamento === 'cartao'
        ? parcelas.value
        : 1,
      valorParcela: valorParcela.value,
      juros: form.value.formaPagamento === 'cartao' ? juros.value : 0,
      totalComJuros: totalComJuros.value,
      total: totalComJuros.value,
      quantidadeItens: quantidadeItens.value,
      itens: itensCompra.value
    };

    let historico = [];

    try {
      const salvo = JSON.parse(
        localStorage.getItem('historicoEncomendas') || '[]'
      );
      if (Array.isArray(salvo)) historico = salvo;
    } catch {
      historico = [];
    }

    historico.unshift(encomendaFinalizada);

    localStorage.setItem(
      'historicoEncomendas',
      JSON.stringify(historico)
    );

    localStorage.removeItem('encomenda');

    try {
      adicionarSelo(subtotal.value);
    } catch (erro) {
      console.error('Não foi possível atualizar a fidelidade:', erro);
    }

    alert('Encomenda realizada com sucesso! 🎉');
    router.push('/home');
  } catch (erro) {
    console.error('Erro ao salvar a encomenda:', erro);
    alert('Não foi possível salvar sua encomenda. Tente novamente.');
  } finally {
    processando.value = false;
  }
};
</script>

<template>
  <div class="checkout-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <main class="checkout-container">
      <header class="checkout-header">
        <button class="btn-voltar" @click="$router.back()">
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
            <span class="progress-caption">ETAPA {{ etapaAtual }} DE 4</span>
            <strong>
              {{ ['Sua seleção', 'Dados da retirada', 'Pagamento', 'Confirmação'][etapaAtual - 1] }}
            </strong>
          </div>
          <span class="progress-number">{{ Math.round(progressoPercent) }}%</span>
        </div>

        <div class="progress-line">
          <div class="progress-active" :style="{ width: progressoPercent + '%' }"></div>
        </div>

        <div class="steps">
          <div v-for="(nome, indice) in ['Encomenda', 'Retirada', 'Pagamento', 'Finalizar']"
            :key="nome"
            class="step"
            :class="{ active: etapaAtual >= indice + 1, current: etapaAtual === indice + 1 }">
            <div class="step-icon">0{{ indice + 1 }}</div>
            <span>{{ nome }}</span>
          </div>
        </div>
      </section>

      <section class="checkout-layout">
        <div class="main-card">
          <div v-if="etapaAtual === 1" class="step-content">
            <div class="section-heading">
              <div>
                <span class="section-number">01</span>
                <h2>Confira sua encomenda</h2>
                <p>Os sabores escolhidos para o seu momento especial.</p>
              </div>
              <div class="items-count">
                {{ quantidadeItens }} {{ quantidadeItens === 1 ? 'item' : 'itens' }}
              </div>
            </div>

            <div v-if="itensCompra.length" class="items-list">
              <div v-for="item in itensCompra" :key="item.idProduto" class="item-card">
                <div class="item-icon">✦</div>
                <div class="item-info">
                  <h3>{{ item.nome }}</h3>
                  <span>{{ item.qtd || 1 }} × R$ {{ formatarMoeda(item.preco) }}</span>
                </div>
                <strong class="item-total">
                  R$ {{ formatarMoeda(Number(item.preco || 0) * Number(item.qtd || 1)) }}
                </strong>
              </div>
            </div>

            <div v-else class="empty-cart">
              <div class="empty-icon">♡</div>
              <h3>Nenhum item encontrado</h3>
              <p>Adicione produtos à sua encomenda antes de continuar.</p>
            </div>

            <div class="total-box">
              <div>
                <span>Total da encomenda</span>
                <small>Valores calculados conforme sua seleção</small>
              </div>
              <strong>R$ {{ formatarMoeda(subtotal) }}</strong>
            </div>

            <div class="navigation">
              <button class="primary-button" @click="proximaEtapa">
                Continuar <span>→</span>
              </button>
            </div>
          </div>

          <div v-if="etapaAtual === 2" class="step-content">
            <div class="section-heading">
              <div>
                <span class="section-number">02</span>
                <h2>Como vamos preparar sua retirada?</h2>
                <p>Informe os dados para deixarmos tudo pronto para você.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group full">
                <label for="nome-retirada">Nome para retirada</label>
                <div class="input-wrapper">
                  <span>♙</span>
                  <input id="nome-retirada" v-model="form.nome" type="text"
                    placeholder="Digite seu nome" autocomplete="name" />
                </div>
              </div>

              <div class="form-group full">
                <label for="telefone-retirada">Telefone</label>
                <div class="input-wrapper">
                  <span>⌕</span>
                  <input id="telefone-retirada" type="tel" :value="form.telefone"
                    @input="formatarTelefone" placeholder="DDD + número"
                    maxlength="11" autocomplete="tel" />
                </div>
                <small>Somente números, com DDD.</small>
              </div>

              <div class="form-group">
                <label for="data-retirada">Data da retirada</label>
                <div class="input-wrapper">
                  <span>◷</span>
                  <input id="data-retirada" v-model="form.dataRetirada"
                    type="date" :min="hoje" :max="dataMaxima" />
                </div>
              </div>

              <div class="form-group">
                <label for="horario-retirada">Horário</label>
                <div class="input-wrapper">
                  <span>◴</span>
                  <input id="horario-retirada" v-model="form.horarioRetirada"
                    type="time" min="06:00" max="22:00" />
                </div>
              </div>
            </div>

            <div class="info-banner">
              <div class="info-banner-icon">✦</div>
              <div>
                <strong>Retirada na loja</strong>
                <p>Funcionamos todos os dias das 06h às 22h. Escolha o melhor horário para você.</p>
              </div>
            </div>

            <div class="navigation">
              <button class="secondary-button" @click="etapaAnterior">← Voltar</button>
              <button class="primary-button" @click="proximaEtapa">
                Continuar <span>→</span>
              </button>
            </div>
          </div>

          <div v-if="etapaAtual === 3" class="step-content">
            <div class="section-heading">
              <div>
                <span class="section-number">03</span>
                <h2>Escolha como pagar</h2>
                <p>Selecione a forma de pagamento que prefere.</p>
              </div>
            </div>

            <div class="payment-options">
              <label class="payment-card" :class="{ selected: form.formaPagamento === 'pix' }">
                <input v-model="form.formaPagamento" type="radio" value="pix" />
                <div class="payment-icon pix-icon">◈</div>
                <div class="payment-info">
                  <strong>PIX</strong>
                  <span>Prático, rápido e seguro</span>
                </div>
                <div class="radio-check"><span></span></div>
              </label>

              <label class="payment-card" :class="{ selected: form.formaPagamento === 'cartao' }">
                <input v-model="form.formaPagamento" type="radio" value="cartao" />
                <div class="payment-icon card-icon">▣</div>
                <div class="payment-info">
                  <strong>Cartão</strong>
                  <span>Crédito ou débito</span>
                </div>
                <div class="radio-check"><span></span></div>
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
              <button class="secondary-button" @click="etapaAnterior">← Voltar</button>
              <button class="primary-button" @click="proximaEtapa">
                Revisar pedido <span>→</span>
              </button>
            </div>
          </div>

          <div v-if="etapaAtual === 4" class="step-content">
            <div class="confirmation-heading">
              <div class="success-symbol">✓</div>
              <span class="section-number">04</span>
              <h2>Está tudo certo?</h2>
              <p>Revise os detalhes antes de confirmar sua encomenda.</p>
            </div>

            <div class="summary-list">
              <div class="summary-section">
                <div class="summary-title">
                  <span>01</span>
                  <strong>Identificação</strong>
                  <button @click="editarEtapa(2)">Editar</button>
                </div>
                <div class="summary-content">
                  <div><span>Nome</span><strong>{{ form.nome }}</strong></div>
                  <div><span>Telefone</span><strong>{{ form.telefone }}</strong></div>
                </div>
              </div>

              <div class="summary-section">
                <div class="summary-title">
                  <span>02</span>
                  <strong>Retirada</strong>
                  <button @click="editarEtapa(2)">Editar</button>
                </div>
                <div class="pickup-highlight">
                  <div class="pickup-icon">◷</div>
                  <div>
                    <span>Data e horário</span>
                    <strong>{{ formatarData(form.dataRetirada) }} às {{ form.horarioRetirada }}</strong>
                  </div>
                </div>
              </div>

              <div class="summary-section">
                <div class="summary-title">
                  <span>03</span>
                  <strong>Pagamento</strong>
                  <button @click="editarEtapa(3)">Editar</button>
                </div>

                <div class="payment-summary">
                  <div class="payment-summary-icon">{{ form.formaPagamento === 'pix' ? '◈' : '▣' }}</div>
                  <div>
                    <span>Forma escolhida</span>
                    <strong>{{ nomePagamento }}</strong>
                  </div>
                </div>

                <div v-if="form.formaPagamento === 'cartao'" class="payment-details">
                  <div class="payment-detail-row">
                    <div>
                      <span>Parcelamento</span>
                      <strong>{{ textoParcelamento }}</strong>
                    </div>
                    <div class="interest-value">
                      <span>Juros</span>
                      <strong>{{ juros > 0 ? '+ R$ ' + formatarMoeda(juros) : 'R$ 0,00' }}</strong>
                    </div>
                  </div>
                  <div class="interest-message" :class="{ 'no-interest': juros <= 0 }">
                    <span>{{ juros > 0 ? '✦' : '✓' }}</span>
                    <div>
                      <strong>{{ juros > 0 ? 'Parcelamento com juros' : 'Sem juros' }}</strong>
                      <p>
                        {{ juros > 0
                          ? 'O valor dos juros está incluído no total da encomenda.'
                          : 'Esta condição de pagamento não possui juros.' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="final-total">
              <div>
                <span>Total da encomenda</span>
                <small>{{ quantidadeItens }} {{ quantidadeItens === 1 ? 'item' : 'itens' }} selecionados</small>
              </div>
              <strong>R$ {{ formatarMoeda(totalComJuros) }}</strong>
            </div>

            <div v-if="form.formaPagamento === 'cartao'" class="installment-summary">
              <div class="installment-main">
                <span class="installment-icon">▣</span>
                <div>
                  <span>{{ parcelas > 1 ? 'Valor por mês' : 'Pagamento' }}</span>
                  <strong>{{ textoParcelamento }}</strong>
                </div>
              </div>
              <div class="installment-total" :class="{ 'has-interest': juros > 0 }">
                <div>
                  <span>{{ juros > 0 ? 'Total com juros' : 'Total' }}</span>
                  <strong>R$ {{ formatarMoeda(totalComJuros) }}</strong>
                </div>
                <div>
                  <span>Juros</span>
                  <strong>{{ juros > 0 ? '+ R$ ' + formatarMoeda(juros) : 'R$ 0,00' }}</strong>
                </div>
              </div>
            </div>

            <div v-else class="pix-summary">
              <div class="pix-summary-icon">◈</div>
              <div>
                <span>Pagamento via PIX</span>
                <strong>R$ {{ formatarMoeda(subtotal) }}</strong>
                <small>Sem juros</small>
              </div>
            </div>

            <div class="navigation">
              <button class="secondary-button" @click="etapaAnterior">← Voltar</button>
              <button class="confirm-button" :disabled="processando" @click="finalizarCompra">
                <span>{{ processando ? 'Processando...' : 'Confirmar encomenda' }}</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </div>

        <aside class="order-aside">
          <div class="aside-card">
            <span class="aside-label">SUA ENCOMENDA</span>
            <div class="aside-title">
              <h3>Um momento<br />feito para você.</h3>
              <span>✦</span>
            </div>
            <div class="aside-line"></div>

            <div class="aside-items">
              <div v-for="item in itensCompra" :key="`aside-${item.idProduto}`" class="aside-item">
                <span>{{ item.qtd || 1 }}× {{ item.nome }}</span>
                <strong>R$ {{ formatarMoeda(Number(item.preco || 0) * Number(item.qtd || 1)) }}</strong>
              </div>
            </div>

            <div class="aside-total">
              <div>
                <span>Total</span>
                <small v-if="form.formaPagamento === 'cartao' && parcelas > 1">{{ textoParcelamento }}</small>
              </div>
              <strong>R$ {{ formatarMoeda(totalComJuros) }}</strong>
            </div>

            <div v-if="form.formaPagamento === 'cartao' && juros > 0" class="aside-interest">
              <span>Juros do parcelamento</span>
              <strong>+ R$ {{ formatarMoeda(juros) }}</strong>
            </div>

            <div class="aside-note">
              <span>✦</span>
              <p>Preparado com carinho especialmente para você.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>
