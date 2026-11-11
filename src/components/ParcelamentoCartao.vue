<script setup>
defineProps({
  cartaoSelecionado: { type: Object, default: null },
  mostrarNovoCartao: Boolean,
  cartaoValido: Boolean,
  valorNumerico: { type: Number, default: 0 },
  parcelasSelecionadas: { type: [String, Number], default: "1" },
  opcoesParcelas: { type: Array, default: () => [] },
  parcelaAtual: { type: [Object, Boolean], default: null },
  valorParcelaAtual: { type: Number, default: 0 },
  jurosAtual: { type: Number, default: 0 },
  totalComJurosAtual: { type: Number, default: 0 },
  formatarMoeda: { type: Function, required: true }
});
defineEmits(["update:parcelasSelecionadas"]);
</script>
<template>
<div
      v-if="
        cartaoSelecionado ||
        (mostrarNovoCartao && cartaoValido)
      "
      class="campo campo-parcelas"
    >
      <label for="parcelas-cartao">
        Forma de pagamento
      </label>
      <div class="input-com-icone">
        <i class="fa-solid fa-list-ol"></i>
        <select
          id="parcelas-cartao"
          :value="parcelasSelecionadas"
          @change="$emit('update:parcelasSelecionadas', $event.target.value)"
        >
          <option
            v-for="parcela in opcoesParcelas"
            :key="parcela.valor"
            :value="parcela.valor"
          >
            {{ parcela.texto }}
          </option>
        </select>
      </div>
      <div
        v-if="parcelaAtual"
        class="resumo-parcelamento"
      >
        <div class="resumo-parcelamento-linha">
          <span>
            Valor por mês
          </span>
          <strong>
            {{ formatarMoeda(valorParcelaAtual) }}
          </strong>
        </div>
        <div class="resumo-parcelamento-linha">
          <span>
            Juros
          </span>
          <strong
            :class="{
              'sem-juros':
                jurosAtual === 0
            }"
          >
            {{
              jurosAtual === 0
                ? "Sem juros"
                : formatarMoeda(jurosAtual)
            }}
          </strong>
        </div>
        <div
          class="resumo-parcelamento-linha total"
        >
          <span>
            Total a pagar
          </span>
          <strong>
            {{ formatarMoeda(totalComJurosAtual) }}
          </strong>
        </div>
      </div>
      <small class="regra-parcelamento">
        <template v-if="valorNumerico < 100">
          Compras abaixo de R$ 100 podem ser pagas somente em 1x.
        </template>
        <template v-else-if="valorNumerico < 150">
          Compras de R$ 100 até R$ 149,99 podem ser pagas em até 2x sem juros.
        </template>
        <template v-else-if="valorNumerico <= 150">
          Compras de R$ 150 podem ser pagas em até 3x sem juros.
        </template>
        <template v-else>
          Até 3x sem juros. De 4x a 10x com juros de 2% ao mês.
        </template>
      </small>
    </div>
</template>
