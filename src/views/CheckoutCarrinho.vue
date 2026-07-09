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

<style scoped>
.checkout-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  box-sizing: border-box;
  position: relative;
  min-height: 100vh;
}

h1 {
  font-size: 2rem;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 1.5rem;
}

.barra-progresso-container {
  margin-bottom: 2rem;
  background: white;
  padding: 2.5rem 2rem 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.04);
  display: flex;
  justify-content: center;
}


.trilha-progresso {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  background-color: #f3f3f3;
  height: 6px;
  border-radius: 10px;
  margin: 1.2rem 0;
}

.linha-progresso-ativa {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #bba270;
  border-radius: 10px;
  transition: width 0.4s ease-in-out;
}

.marcador-passo {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: 0;
  overflow: visible;
}

.icone-passo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background-color: #ffffff;
  border: 3px solid #e0e0e0;
  border-radius: 50%;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s ease;
  margin-top: -20px;
}

.texto-passo {
  margin-top: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #999;
  white-space: nowrap;
  transition: color 0.3s ease;
  transform: translateX(-50%);
}

.marcador-passo.passo-ativo .icone-passo {
  background-color: #bba270;
  border-color: #bba270;
  color: white;
  transform: scale(1.1) translateY(-2px);
}

.marcador-passo.passo-ativo .texto-passo {
  color: #bba270;
}

.painel-etapas-conteiner {
  display: flex;
  flex-direction: column;
}

.bloco-card {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

h2 {
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-top: 0;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 0.6rem;
}

.itens-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f7f5f0;
  padding: 10px 12px;
  border-radius: 16px;
}

.item-img {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 10px;
}

.info-texto h3 {
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0 0 2px 0;
}

.info-texto .qtd-preco {
  color: #bba270;
  font-weight: 700;
  font-size: 0.95rem;
}

.form-grupo {
  margin-bottom: 1.2rem;
}

.form-grupo label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}

.form-grupo input {
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #fafafa;
}

.form-grupo input:focus {
  outline: none;
  border-color: #bba270;
  background: white;
}

.opcoes-pagamento {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.opcao-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1.1rem 1.2rem;
  gap: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: #666;
  text-transform: uppercase;
  transition: all 0.2s;
}

.opcao-card input {
  display: none;
}

.opcao-card.ativo {
  border-color: #bba270;
  background: #fdfbf7;
  color: #bba270;
}

.navegacao-botoes {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  margin-top: 1.8rem;
}

@media (min-width: 400px) {
  .navegacao-botoes {
    flex-direction: row;
    justify-content: space-between;
  }
}

.btn-avancar {
  background: #bba270;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

@media (min-width: 400px) {
  .btn-avancar {
    width: auto;
    margin-left: auto;
    padding: 1rem 2rem;
  }
}

.btn-avancar:hover {
  background: #a18752;
}

.btn-voltar-etapa {
  background: #eaeaea;
  color: #333;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

@media (min-width: 400px) {
  .btn-voltar-etapa {
    width: auto;
    padding: 1rem 2rem;
  }
}

.btn-voltar-etapa:hover {
  background: #d4d4d4;
}

.resumo-etapa-conteudo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bloco-dados-resumo {
  background: #fafafa;
  border: 1px solid #eee;
  padding: 1.2rem;
  border-radius: 16px;
}

.bloco-dados-resumo h3 {
  margin-top: 0;
  font-size: 1.05rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
  margin-bottom: 10px;
}

.bloco-dados-resumo p {
  font-size: 0.95rem;
  margin: 4px 0;
  color: #1a1a1a;
  word-break: break-word;
}

.pagamento-badge {
  text-transform: uppercase;
  color: #bba270;
  font-weight: bold;
}

.bloco-retirada {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fdfbf7;
  border: 1px solid #bba270;
  padding: 1.2rem;
  border-radius: 16px;
}

.icone-retirada {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f4eee1;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  color: #bba270;
  flex-shrink: 0;
}

.texto-retirada h3 {
  font-size: 1.1rem;
  color: #1a1a1a;
  margin: 0 0 2px 0;
}

.texto-retirada p {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
}

.valores-finais {
  background: #fcfcfc;
  padding: 1.2rem;
  border-radius: 16px;
  border: 1px solid #eaeaea;
}

.linha-cobranca {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  color: #333;
}

.divisor {
  border: 0;
  border-top: 1px solid #ddd;
  margin: 1.2rem 0;
}

.linha-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.linha-total strong {
  color: #bba270;
}

.btn-confirmar {
  background: #1a1a1a;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  border: none;
  width: 100%;
  transition: background 0.3s, transform 0.2s;
}

@media (min-width: 400px) {
  .btn-confirmar {
    width: auto;
    margin-left: auto;
    padding: 1rem 2rem;
  }
}

.btn-confirmar:hover {
  background: #bba270;
  transform: translateY(-2px);
}

.btn-voltar {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  transition: all 0.3s;
  position: absolute;
  top: 1.5rem;
  left: 1rem;
  font-size: 0.85rem;
}

.btn-voltar:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
