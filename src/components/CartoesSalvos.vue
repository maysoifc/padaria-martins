<script setup>
defineProps({
  cartoesFormatados: { type: Array, default: () => [] },
  mostrarNovoCartao: Boolean,
  indiceCartao: { type: Number, default: 0 },
  cartaoSelecionado: { type: Object, default: null },
  cartaoAtual: { type: Object, default: null },
  bandeiraCartao: { type: Function, required: true },
  novoCartao: { type: Function, required: true },
  selecionarAnterior: { type: Function, required: true },
  selecionarProximo: { type: Function, required: true },
  selecionarCartaoAtual: { type: Function, required: true },
  selecionarPorIndice: { type: Function, required: true }
});
</script>
<template>
<div
      v-if="cartoesFormatados.length && !mostrarNovoCartao"
      class="cartoes-salvos"
    >
      <div class="cartoes-titulo">
        <div>
          <span>SEUS CARTÕES</span>
          <strong>
            {{ cartoesFormatados.length }}
            {{
              cartoesFormatados.length === 1
                ? "cartão salvo"
                : "cartões salvos"
            }}
          </strong>
        </div>
        <button
          type="button"
          class="btn-novo-cartao"
          @click="novoCartao"
        >
          <i class="fa-solid fa-plus"></i>
          Novo cartão
        </button>
      </div>
      <div class="cartoes-carousel">
        <button
          v-if="cartoesFormatados.length > 1"
          type="button"
          class="seta-carousel esquerda"
          aria-label="Cartão anterior"
          @click="selecionarAnterior"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="carousel-window">
          <div
            class="cartao-salvo"
            :class="{
              selecionado:
                cartaoSelecionado?.id ===
                cartaoAtual?.id
            }"
            @click="selecionarCartaoAtual"
          >
            <div class="cartao-reflexo"></div>
            <div class="cartao-topo">
              <span>
                PADARIA MARTINS
              </span>
              <strong>
                {{ bandeiraCartao(cartaoAtual) }}
              </strong>
            </div>
            <div class="chip-cartao">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="numero-salvo">
              •••• •••• •••• {{ cartaoAtual?.final }}
            </div>
            <div class="cartao-bottom">
              <div>
                <small>TITULAR</small>
                <strong>
                  {{ cartaoAtual?.titular }}
                </strong>
              </div>
              <div>
                <small>VALIDADE</small>
                <strong>
                  {{ cartaoAtual?.validade || "--/--" }}
                </strong>
              </div>
            </div>
            <div
              v-if="cartaoAtual?.principal"
              class="badge-principal"
            >
              <i class="fa-solid fa-star"></i>
              Principal
            </div>
            <div
              v-if="
                cartaoSelecionado?.id ===
                cartaoAtual?.id
              "
              class="badge-selecionado"
            >
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        </div>
        <button
          v-if="cartoesFormatados.length > 1"
          type="button"
          class="seta-carousel direita"
          aria-label="Próximo cartão"
          @click="selecionarProximo"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div
        v-if="cartoesFormatados.length > 1"
        class="indicadores"
      >
        <button
          v-for="(cartao, index) in cartoesFormatados"
          :key="cartao.id"
          type="button"
          :class="{
            ativo: indiceCartao === index
          }"
          :aria-label="`Selecionar cartão ${index + 1}`"
          @click="selecionarPorIndice(index)"
        ></button>
      </div>
      <div class="cartao-selecionado-info">
        <i class="fa-solid fa-circle-check"></i>
        <span>
          {{
            cartaoSelecionado?.id ===
            cartaoAtual?.id
              ? "Cartão selecionado para este pagamento."
              : "Toque no cartão para selecioná-lo."
          }}
        </span>
      </div>
    </div>
</template>
