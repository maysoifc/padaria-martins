<script setup>
import { computed, onMounted, ref } from "vue";

const emit = defineEmits(["resgatado"]);

const premios = [
  { id: 1, tipo: "produto", icone: "fa-solid fa-cake-candles", titulo: "Torta grátis", descricao: "Ganhe uma torta por nossa conta." },
  { id: 2, tipo: "desconto", icone: "fa-solid fa-ticket", titulo: "R$ 10 em descontos", descricao: "Use seu desconto em uma próxima compra." },
  { id: 3, tipo: "desconto", icone: "fa-solid fa-ticket", titulo: "R$ 25 em descontos", descricao: "Use seu desconto em uma próxima compra." },
  { id: 4, tipo: "desconto", icone: "fa-solid fa-ticket", titulo: "R$ 50 em descontos", descricao: "Use seu desconto em uma próxima compra." },
  { id: 5, tipo: "produto", icone: "fa-solid fa-bread-slice", titulo: "Pão grátis", descricao: "Ganhe um pão na sua próxima compra." },
  { id: 6, tipo: "produto", icone: "fa-solid fa-mug-hot", titulo: "Café grátis", descricao: "Ganhe um café por nossa conta." },
  { id: 7, tipo: "produto", icone: "fa-solid fa-cookie-bite", titulo: "Doce grátis", descricao: "Escolha um doce participante." }
];

const premio = ref(null);
const codigoCupom = ref("");
const resgatado = ref(false);
const erro = ref("");

const gerarCodigo = (id) => {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MARTINS-${id}-${aleatorio}`;
};

const salvarPremioAtual = () => {
  if (!premio.value) return;
  localStorage.setItem("premioSeloAtual", JSON.stringify(premio.value));
};

const carregarPremio = () => {
  try {
    const salvo = localStorage.getItem("premioSeloAtual");

    if (salvo) {
      const premioSalvo = JSON.parse(salvo);
      const valido = premios.some((item) => item.id === premioSalvo?.id);

      if (valido) {
        premio.value = premioSalvo;
        codigoCupom.value = premioSalvo.codigo || gerarCodigo(premioSalvo.id);
        resgatado.value = Boolean(premioSalvo.resgatado);
        if (!premioSalvo.codigo) {
          premio.value = { ...premioSalvo, codigo: codigoCupom.value };
          salvarPremioAtual();
        }
        return;
      }
    }

    premio.value = premios[Math.floor(Math.random() * premios.length)];
    codigoCupom.value = gerarCodigo(premio.value.id);
    premio.value = { ...premio.value, codigo: codigoCupom.value, resgatado: false };
    salvarPremioAtual();
  } catch {
    localStorage.removeItem("premioSeloAtual");
    premio.value = premios[Math.floor(Math.random() * premios.length)];
    codigoCupom.value = gerarCodigo(premio.value.id);
    premio.value = { ...premio.value, codigo: codigoCupom.value, resgatado: false };
    salvarPremioAtual();
  }
};

const tituloBotao = computed(() => {
  return resgatado.value ? "Prêmio resgatado" : "Resgatar meu prêmio";
});

const copiarCodigo = async () => {
  if (!codigoCupom.value || typeof navigator === "undefined" || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(codigoCupom.value);
  } catch {
    erro.value = "Não foi possível copiar o código automaticamente.";
  }
};

const resgatar = () => {
  if (!premio.value || resgatado.value) return;

  erro.value = "";

  try {
    const registro = {
      ...premio.value,
      codigo: codigoCupom.value,
      data: new Date().toISOString(),
      resgatado: true
    };

    localStorage.setItem("ultimoPremioSelo", JSON.stringify(registro));
    localStorage.setItem("premioSeloAtual", JSON.stringify(registro));
    premio.value = registro;
    resgatado.value = true;
    emit("resgatado", registro);
  } catch {
    erro.value = "Não foi possível salvar o resgate. Verifique o armazenamento do navegador e tente novamente.";
  }
};

onMounted(carregarPremio);
</script>

<template>
  <section class="resgate-premio">
    <div class="resgate-premio__cabecalho">
      <span class="resgate-premio__icone-cabecalho">
        <i class="fa-solid fa-gift" aria-hidden="true"></i>
      </span>
      <div>
        <p class="resgate-premio__sobretitulo">Programa de fidelidade</p>
        <h2>Seu prêmio especial</h2>
        <p class="resgate-premio__introducao">Uma recompensa da Padaria Martins para você.</p>
      </div>
    </div>

    <div v-if="premio" class="resgate-premio__cartao">
      <div class="resgate-premio__icone-premio">
        <i :class="premio.icone" aria-hidden="true"></i>
      </div>
      <span class="resgate-premio__etiqueta">
        {{ premio.tipo === "desconto" ? "Prêmio em desconto" : "Prêmio em produto" }}
      </span>
      <h3>{{ premio.titulo }}</h3>
      <p class="resgate-premio__descricao">{{ premio.descricao }}</p>

      <div class="resgate-premio__cupom">
        <span>Código do prêmio</span>
        <strong>{{ codigoCupom }}</strong>
        <button
          v-if="codigoCupom"
          type="button"
          class="resgate-premio__copiar"
          @click="copiarCodigo"
        >
          <i class="fa-regular fa-copy" aria-hidden="true"></i>
          Copiar código
        </button>
      </div>

      <p v-if="resgatado" class="resgate-premio__sucesso" role="status">
        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
        Prêmio resgatado! Guarde o código para utilizá-lo.
      </p>
      <p v-if="erro" class="resgate-premio__erro" role="alert">{{ erro }}</p>

      <button
        class="resgate-premio__botao"
        type="button"
        :disabled="resgatado"
        @click="resgatar"
      >
        <i :class="resgatado ? 'fa-solid fa-check' : 'fa-solid fa-gift'" aria-hidden="true"></i>
        {{ tituloBotao }}
      </button>
    </div>

    <div v-else class="resgate-premio__carregando" role="status">
      Preparando seu prêmio...
    </div>
  </section>
</template>

<style src="@/assets/css/resgate-premio.css"></style>
