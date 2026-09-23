<script setup>
import { ref, onMounted } from "vue";

const cupons = ref([]);

const carregarCupons = () => {
  const salvo = localStorage.getItem("cuponsCarteira");

  if (!salvo) {
    cupons.value = [];
    return;
  }

  try {
    const dados = JSON.parse(salvo);

    cupons.value = Array.isArray(dados)
      ? dados
      : [];
  } catch {
    cupons.value = [];
  }
};

const removerCupom = (id) => {
  cupons.value = cupons.value.filter(
    cupom => cupom.id !== id
  );

  localStorage.setItem(
    "cuponsCarteira",
    JSON.stringify(cupons.value)
  );
};

onMounted(() => {
  carregarCupons();
});
</script>

<template>
  <div class="cupons-container">

    <div
      v-if="cupons.length === 0"
      class="cupons-vazio"
    >
      <div class="vazio-icone">
        <i class="fa-solid fa-ticket"></i>
      </div>

      <span class="vazio-label">
        SEUS CUPONS
      </span>

      <h3>
        Nenhum prêmio disponível
      </h3>

      <p>
        Complete seu cartão de selos para receber
        prêmios especiais aqui.
      </p>
    </div>

    <div
      v-else
      class="lista-cupons"
    >
      <div class="lista-topo">
        <div>
          <span>
            SEUS PRÊMIOS
          </span>

          <h3>
            Cupons disponíveis
          </h3>
        </div>

        <div class="contador-cupons">
          {{ cupons.length }}
        </div>
      </div>

      <article
        v-for="cupom in cupons"
        :key="cupom.id"
        class="cupom"
      >
        <div class="cupom-icone">
          <i
            :class="
              cupom.icone ||
              'fa-solid fa-gift'
            "
          ></i>
        </div>

        <div class="cupom-conteudo">
          <span class="cupom-label">
            PRÊMIO
          </span>

          <h4>
            {{ cupom.titulo }}
          </h4>

          <p>
            {{ cupom.descricao }}
          </p>

          <div class="cupom-codigo">
            <span>
              CÓDIGO
            </span>

            <strong>
              {{ cupom.codigo }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="btn-usar"
          @click="removerCupom(cupom.id)"
        >
          <span>
            Usar
          </span>

          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </article>
    </div>

  </div>
</template>

