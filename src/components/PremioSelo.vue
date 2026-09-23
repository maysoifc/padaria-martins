<script setup>
import { computed, ref } from "vue";

const emit = defineEmits(["resgatado"]);

const premios = [
  {
    id: 1,
    tipo: "produto",
    icone: "fa-solid fa-cake-candles",
    titulo: "Torta grátis",
    descricao: "Ganhe uma torta por nossa conta."
  },
  {
    id: 2,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 10 em descontos",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 3,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 25 em descontos",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 4,
    tipo: "desconto",
    icone: "fa-solid fa-ticket",
    titulo: "R$ 50 em descontos",
    descricao: "Use seu desconto em uma próxima compra."
  },
  {
    id: 5,
    tipo: "produto",
    icone: "fa-solid fa-bread-slice",
    titulo: "Pão grátis",
    descricao: "Ganhe um pão na sua próxima compra."
  },
  {
    id: 6,
    tipo: "produto",
    icone: "fa-solid fa-mug-hot",
    titulo: "Café grátis",
    descricao: "Ganhe um café por nossa conta."
  },
  {
    id: 7,
    tipo: "produto",
    icone: "fa-solid fa-cookie-bite",
    titulo: "Doce grátis",
    descricao: "Escolha um doce participante."
  }
];

const premio = ref(null);
const resgatando = ref(false);
const resgatado = ref(false);

const gerarPremio = () => {
  const indice = Math.floor(
    Math.random() * premios.length
  );

  premio.value = premios[indice];

  localStorage.setItem(
    "premioSeloAtual",
    JSON.stringify(premio.value)
  );
};

const carregarPremio = () => {
  const salvo = localStorage.getItem("premioSeloAtual");

  if (salvo) {
    try {
      premio.value = JSON.parse(salvo);
      return;
    } catch {
      localStorage.removeItem("premioSeloAtual");
    }
  }

  gerarPremio();
};

carregarPremio();

const codigoCupom = computed(() => {
  if (!premio.value) {
    return "";
  }

  return `MARTINS-${premio.value.id}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
});

const resgatar = () => {
  if (resgatando.value || resgatado.value) {
    return;
  }

  resgatando.value = true;

  setTimeout(() => {
    resgatado.value = true;
    resgatando.value = false;

    localStorage.setItem(
      "ultimoPremioSelo",
      JSON.stringify({
        ...premio.value,
        codigo: codigoCupom.value,
        data: new Date().toISOString()
      })
    );

    emit("resgatado", premio.value);
  }, 600);
};
</script>
