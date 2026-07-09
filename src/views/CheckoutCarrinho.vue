<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const itensCompra = ref([]);
const etapaAtual = ref(1);
const form = ref({
  nome: '',
  telefone: '',
  formaPagamento: 'pix'
});

const formatarTelefone = (event) => {
  form.value.telefone = event.target.value.replace(/\D/g, '');
};

onMounted(() => {
  const dados = localStorage.getItem('carrinho');
  if (dados) itensCompra.value = JSON.parse(dados);
});

const subtotal = computed(() => {
  return itensCompra.value.reduce((total, item) => total + (parseFloat(item.preco) * (item.qtd || item.quantidade || 1)), 0);
});

const progressoPercent = computed(() => ((etapaAtual.value - 1) / 3) * 100);

const proximaEtapa = () => {
  if (etapaAtual.value === 2) {
    const telRegex = /^\d{10,11}$/;
    if (!form.value.nome || !form.value.telefone) {
      alert('Por favor, preencha nome e telefone.');
      return;
    }
    if (!telRegex.test(form.value.telefone)) {
      alert('Telefone inválido. Digite apenas números (DDD + número).');
      return;
    }
  }
  if (etapaAtual.value < 4) etapaAtual.value++;
};

const etapaAnterior = () => { if (etapaAtual.value > 1) etapaAtual.value--; };

const finalizarCompra = () => {
  alert('Compra realizada com sucesso! 🎉');
  localStorage.removeItem('carrinho');
  router.push('/home');
};

const getImageUrl = (img) => { try { return new URL(`../assets/img/${img}`, import.meta.url).href; } catch(e) { return ""; } };
</script>

<template>
  <div class="checkout-container">
    <button @click="$router.back()" class="btn-voltar">← Voltar</button>
    <h1>Finalizar Compra</h1>

    <div class="bloco-card barra-progresso-container">
      <div class="trilha-progresso">
        <div class="linha-progresso-ativa" :style="{ width: progressoPercent + '%' }"></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 1 }"><span class="icone-passo"><i class="fas fa-box"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 2 }"><span class="icone-passo"><i class="fas fa-user"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 3 }"><span class="icone-passo"><i class="fas fa-credit-card"></i></span></div>
        <div class="marcador-passo" :class="{ 'passo-ativo': etapaAtual >= 4 }"><span class="icone-passo"><i class="fas fa-check-circle"></i></span></div>
      </div>
    </div>

    <div class="painel-etapas-conteiner">
      <div v-if="etapaAtual === 1" class="bloco-card animate-fadeIn">
        <h2>1. Confira seu pedido</h2>
        <div class="itens-lista">
          <div v-for="item in itensCompra" :key="item.idProduto" class="item-card">
            <img :src="getImageUrl(item.imagem)" class="item-img" />
            <div class="info-texto">
              <h3>{{ item.nome }}</h3>
              <span class="qtd-preco">{{ item.qtd || item.quantidade }}x R$ {{ parseFloat(item.preco).toFixed(2).replace('.', ',') }}</span>
            </div>
          </div>
        </div>
        <div class="navegacao-botoes"><button class="btn-avancar" @click="proximaEtapa">Continuar</button></div>
      </div>

      <div v-if="etapaAtual === 2" class="bloco-card animate-fadeIn">
        <h2>2. Seus dados</h2>
        <div class="form-grupo"><label>Nome</label><input type="text" v-model="form.nome" /></div>
        <div class="form-grupo"><label>Telefone</label><input type="tel" :value="form.telefone" @input="formatarTelefone" placeholder="(xx)xxxxx-xxxx" maxlength="11" /></div>
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
          <button class="btn-avancar" @click="proximaEtapa">Resumo</button>
        </div>
      </div>

      <div v-if="etapaAtual === 4" class="bloco-card animate-fadeIn">
        <h2>4. Resumo da Compra</h2>
        <div class="resumo-etapa-conteudo">
          <div class="bloco-dados-resumo">
            <h3>Dados do Cliente</h3>
            <p><strong>Nome:</strong> {{ form.nome }}</p>
            <p><strong>Pagamento:</strong> <span class="pagamento-badge">{{ form.formaPagamento }}</span></p>
          </div>
          <div class="bloco-retirada">
            <span class="icone-retirada"><i class="fas fa-store"></i></span>
            <div class="texto-retirada">
              <h3>Retirada Imediata</h3>
              <p>Dirija-se à nossa loja para retirar seu pedido.</p>
            </div>
          </div>
          <div class="valores-finais">
            <div class="linha-total"><span>Total</span><strong>R$ {{ subtotal.toFixed(2).replace('.', ',') }}</strong></div>
          </div>
        </div>
        <div class="navegacao-botoes">
          <button class="btn-voltar-etapa" @click="etapaAnterior">Voltar</button>
          <button class="btn-confirmar" @click="finalizarCompra">Confirmar Compra</button>
        </div>
      </div>
    </div>
  </div>
</template>
