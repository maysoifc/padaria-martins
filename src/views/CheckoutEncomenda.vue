<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const itensCompra = ref([]);
const etapaAtual = ref(1);
const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix',
  horarioRetirada: '',
  dataRetirada: ''
});

const hoje = new Date().toISOString().split('T')[0];
const dataMaxima = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const formatarTelefone = (event) => {
  form.value.telefone = event.target.value.replace(/\D/g, '');
};

onMounted(() => {
  const dados = localStorage.getItem('encomenda');
  if (dados) itensCompra.value = JSON.parse(dados);
});

const subtotal = computed(() => {
  return itensCompra.value.reduce((total, item) => total + (parseFloat(item.preco) * (item.qtd || 1)), 0);
});

const progressoPercent = computed(() => ((etapaAtual.value - 1) / 3) * 100);

const proximaEtapa = () => {
  if (etapaAtual.value === 2) {
    const telRegex = /^\d{10,11}$/;
    if (!form.value.nome || !form.value.telefone || !form.value.horarioRetirada || !form.value.dataRetirada) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (!telRegex.test(form.value.telefone)) {
      alert('Telefone inválido. Digite apenas números (DDD + número, total de 10 ou 11 dígitos).');
      return;
    }
    if (form.value.dataRetirada < hoje || form.value.dataRetirada > dataMaxima) {
      alert('A data deve ser entre hoje e os próximos 30 dias.');
      return;
    }
    const [horas] = form.value.horarioRetirada.split(':').map(Number);
    if (horas < 6 || horas >= 22) {
      alert('Horário de atendimento: 06:00 às 22:00.');
      return;
    }
  }
  if (etapaAtual.value < 4) etapaAtual.value++;
};

const etapaAnterior = () => { if (etapaAtual.value > 1) etapaAtual.value--; };

const finalizarCompra = () => {
  alert('Encomenda realizada com sucesso! 🎉');
  localStorage.removeItem('encomenda');
  router.push('/home');
};
</script>

<template>
  <div class="checkout-container">
    <button @click="$router.back()" class="btn-voltar">← Voltar</button>
    <h1>Finalizar Encomenda</h1>

    <div class="barra-progresso-container">
      <div class="trilha-progresso">
        <div class="linha-progresso-ativa" :style="{ width: progressoPercent + '%' }"></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 1 }"><span class="icone-passo"><i class="fas fa-box"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 2 }"><span class="icone-passo"><i class="fas fa-calendar-alt"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 3 }"><span class="icone-passo"><i class="fas fa-credit-card"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 4 }"><span class="icone-passo"><i class="fas fa-check-circle"></i></span></div>
      </div>
    </div>

    <div class="painel-etapas-conteiner">
      <div v-if="etapaAtual === 1" class="bloco-card animate-fadeIn">
        <h2>1. Confira sua encomenda</h2>
        <div class="itens-lista">
          <div v-for="item in itensCompra" :key="item.idProduto" class="item-card">
            <div class="info-texto">
              <h3>{{ item.nome }}</h3>
              <span class="qtd-preco">{{ item.qtd }}x R$ {{ parseFloat(item.preco).toFixed(2).replace('.', ',') }}</span>
            </div>
          </div>
        </div>
        <div class="navegacao-botoes"><button class="btn-avancar" @click="proximaEtapa">Continuar</button></div>
      </div>

      <div v-if="etapaAtual === 2" class="bloco-card animate-fadeIn">
        <h2>2. Identificação e Retirada</h2>
        <div class="form-grupo">
          <label>Nome para retirada</label>
          <input type="text" v-model="form.nome" />
        </div>
        <div class="form-grupo">
          <label>Telefone (apenas números com DDD)</label>
          <input type="tel" :value="form.telefone" @input="formatarTelefone" placeholder="(xx) xxxx-xxxx" maxlength="11" />
        </div>
        <div class="form-grupo">
          <label>Data da Retirada</label>
          <input type="date" v-model="form.dataRetirada" :min="hoje" :max="dataMaxima" />
        </div>
        <div class="form-grupo">
          <label>Horário (06h às 22h)</label>
          <input type="time" v-model="form.horarioRetirada" min="06:00" max="22:00" />
        </div>
        <div class="navegacao-botoes">
          <button class="btn-voltar-etapa" @click="etapaAnterior">Voltar</button>
          <button class="btn-avancar" @click="proximaEtapa">Continuar</button>
        </div>
      </div>

      <div v-if="etapaAtual === 3" class="bloco-card animate-fadeIn">
        <h2>3. Forma de Pagamento</h2>
        <div class="opcoes-pagamento">
          <label class="opcao-card" :class="{ 'ativo': form.formaPagamento === 'pix' }"><input type="radio" value="pix" v-model="form.formaPagamento" /> Pix</label>
          <label class="opcao-card" :class="{ 'ativo': form.formaPagamento === 'cartao' }"><input type="radio" value="cartao" v-model="form.formaPagamento" /> Cartão</label>
        </div>
        <div class="navegacao-botoes">
          <button class="btn-voltar-etapa" @click="etapaAnterior">Voltar</button>
          <button class="btn-avancar" @click="proximaEtapa">Continuar</button>
        </div>
      </div>

      <div v-if="etapaAtual === 4" class="bloco-card animate-fadeIn">
        <h2>4. Resumo da Encomenda</h2>
        <div class="resumo-etapa-conteudo">
          <div class="bloco-dados-resumo">
            <h3>Dados de Identificação</h3>
            <p><strong>Nome:</strong> {{ form.nome }}</p>
            <p><strong>Telefone:</strong> {{ form.telefone }}</p>
            <p><strong>Pagamento:</strong> <span class="pagamento-badge">{{ form.formaPagamento }}</span></p>
          </div>
          <div class="bloco-retirada">
            <span class="icone-retirada"><i class="fas fa-store"></i></span>
            <div class="texto-retirada">
              <h3>Retirada agendada</h3>
              <p>Data: {{ form.dataRetirada }} às {{ form.horarioRetirada }}</p>
            </div>
          </div>
          <div class="valores-finais">
            <div class="linha-total"><span>Total</span><strong>R$ {{ subtotal.toFixed(2).replace('.', ',') }}</strong></div>
          </div>
        </div>
        <div class="navegacao-botoes">
          <button class="btn-voltar-etapa" @click="etapaAnterior">Voltar</button>
          <button class="btn-confirmar" @click="finalizarCompra">Confirmar Encomenda</button>
        </div>
      </div>
    </div>
  </div>
</template>
