<script setup>
defineProps({
  mostrarNovoCartao: Boolean,
  cartoesFormatados: { type: Array, default: () => [] },
  dados: { type: Object, required: true },
  bandeira: { type: String, default: "" },
  numeroExibicao: { type: String, default: "" },
  numeroFormatado: { type: String, default: "" },
  nomeCartao: { type: String, default: "" },
  validadeCartao: { type: String, default: "" },
  mostrarNumero: Boolean,
  mostrarCvv: Boolean,
  erroNumero: { type: String, default: "" },
  erroNome: { type: String, default: "" },
  erroValidade: { type: String, default: "" },
  erroCvv: { type: String, default: "" },
  formatarNumero: { type: Function, required: true },
  formatarNome: { type: Function, required: true },
  formatarValidade: { type: Function, required: true },
  formatarCvv: { type: Function, required: true },
  limparValidacao: { type: Function, required: true },
  alternarNumero: { type: Function, required: true },
  alternarCvv: { type: Function, required: true },
  voltarParaCartoes: { type: Function, required: true }
});
</script>
<template>
<div
      v-if="mostrarNovoCartao"
      class="novo-cartao-area"
    >
      <div class="novo-cartao-topo">
        <div>
          <span>NOVO CARTÃO</span>
          <strong>Cadastrar cartão</strong>
        </div>
        <button
          v-if="cartoesFormatados.length"
          type="button"
          @click="voltarParaCartoes"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Cartões salvos
        </button>
      </div>
      <div class="cartao-visual">
        <div class="cartao-brilho"></div>
        <div class="cartao-visual-topo">
          <span>
            PADARIA MARTINS
          </span>
          <strong>
            {{ bandeira }}
          </strong>
        </div>
        <div class="chip">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="numero-visual">
          {{
            numeroExibicao ||
            "•••• •••• •••• ••••"
          }}
        </div>
        <div class="cartao-visual-bottom">
          <div>
            <small>TITULAR</small>
            <strong>
              {{ nomeCartao }}
            </strong>
          </div>
          <div>
            <small>VALIDADE</small>
            <strong>
              {{ validadeCartao }}
            </strong>
          </div>
        </div>
      </div>
      <div class="formulario-cartao">
        <div class="campo campo-numero">
          <label for="numero-cartao">
            Número do cartão
          </label>
          <div class="input-com-icone">
            <i class="fa-regular fa-credit-card"></i>
            <input
              id="numero-cartao"
              type="text"
              inputmode="numeric"
              autocomplete="cc-number"
              placeholder="0000 0000 0000 0000"
              :value="numeroFormatado"
              maxlength="19"
              @input="formatarNumero"
              @focus="limparValidacao"
            />
            <button
              type="button"
              class="botao-olho"
              @click="alternarNumero"
            >
              <i
                :class="
                  mostrarNumero
                    ? 'fa-solid fa-eye-slash'
                    : 'fa-solid fa-eye'
                "
              ></i>
            </button>
          </div>
          <small
            v-if="erroNumero"
            class="erro"
          >
            {{ erroNumero }}
          </small>
        </div>
        <div class="campo">
          <label for="nome-cartao">
            Nome do titular
          </label>
          <div class="input-com-icone">
            <i class="fa-regular fa-user"></i>
            <input
              id="nome-cartao"
              type="text"
              autocomplete="cc-name"
              placeholder="Nome como está no cartão"
              :value="dados.nome"
              maxlength="60"
              @input="formatarNome"
              @focus="limparValidacao"
            />
          </div>
          <small
            v-if="erroNome"
            class="erro"
          >
            {{ erroNome }}
          </small>
        </div>
        <div class="campos-duplos">
          <div class="campo">
            <label for="validade-cartao">
              Validade
            </label>
            <div class="input-com-icone">
              <i class="fa-regular fa-calendar"></i>
              <input
                id="validade-cartao"
                type="text"
                inputmode="numeric"
                autocomplete="cc-exp"
                placeholder="MM/AA"
                :value="dados.validade"
                maxlength="5"
                @input="formatarValidade"
                @focus="limparValidacao"
              />
            </div>
            <small
              v-if="erroValidade"
              class="erro"
            >
              {{ erroValidade }}
            </small>
          </div>
          <div class="campo">
            <label for="cvv-cartao">
              CVV
            </label>
            <div class="input-com-icone">
              <i class="fa-solid fa-lock"></i>
              <input
                id="cvv-cartao"
                :type="
                  mostrarCvv
                    ? 'text'
                    : 'password'
                "
                inputmode="numeric"
                autocomplete="cc-csc"
                placeholder="123"
                maxlength="4"
                :value="dados.cvv"
                @input="formatarCvv"
                @focus="limparValidacao"
              />
              <button
                type="button"
                class="botao-olho"
                @click="alternarCvv"
              >
                <i
                  :class="
                    mostrarCvv
                      ? 'fa-solid fa-eye-slash'
                      : 'fa-solid fa-eye'
                  "
                ></i>
              </button>
            </div>
            <small
              v-if="erroCvv"
              class="erro"
            >
              {{ erroCvv }}
            </small>
          </div>
        </div>
      </div>
    </div>
</template>
