
<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/MeuPixView.css";

const router = useRouter();

const codigoPix =
  "DEMONSTRACAO-PIX-NAO-VALIDO-PARA-PAGAMENTO-PADARIA-MARTINS";

const copiado = ref(false);

const valorDemonstracao = ref("25,00");

const valorFormatado = computed(
  () => `R$ ${valorDemonstracao.value}`
);

const copiarCodigo = async () => {
  try {
    await navigator.clipboard.writeText(codigoPix);
    copiado.value = true;

    setTimeout(() => {
      copiado.value = false;
    }, 2500);
  } catch (error) {
    console.error("Não foi possível copiar:", error);
    alert("Não foi possível copiar o código neste navegador.");
  }
};

const voltar = () => {
  router.push("/perfil");
};
</script>

<template>
  <main class="pix-page">
    <div class="pix-background-decoration decoration-one"></div>
    <div class="pix-background-decoration decoration-two"></div>

    <div class="pix-container">
      <button class="pix-back-button" @click="voltar">
        <i class="fa-solid fa-arrow-left"></i>
        Voltar para minha conta
      </button>

      <header class="pix-header">
        <div class="pix-eyebrow">
          <span></span>
          CARTEIRA DIGITAL
          <span></span>
        </div>

        <div class="pix-title-icon">
          <i class="fa-brands fa-pix"></i>
        </div>

        <h1>Meu <em>PIX</em></h1>

        <p>
          Uma demonstração da experiência de pagamento
          da Padaria Martins.
        </p>
      </header>

      <section class="pix-demo-alert">
        <i class="fa-solid fa-circle-info"></i>

        <div>
          <strong>Ambiente de demonstração</strong>
          <p>
            Este QR Code e o código abaixo são ilustrativos.
            Não representam uma cobrança PIX real e não
            movimentam dinheiro.
          </p>
        </div>
      </section>

      <section class="pix-card">
        <div class="pix-card-top">
          <div>
            <span class="pix-label">PAGAMENTO ILUSTRATIVO</span>
            <h2>Escaneie o QR Code</h2>
          </div>

          <div class="pix-brand-icon">
            <i class="fa-brands fa-pix"></i>
          </div>
        </div>

        <div class="pix-qr-area">
          <div class="pix-qr-frame">
            <!-- QR Code decorativo, não escaneável -->
            <svg
              class="pix-qr-illustration"
              viewBox="0 0 210 210"
              role="img"
              aria-label="Ilustração decorativa de QR Code, não válida para pagamento"
            >
              <rect width="210" height="210" fill="#fff" />

              <g fill="#5e3023">
                <path d="M10 10h60v60H10z M20 20v40h40V20z M30 30h20v20H30z" />
                <path d="M140 10h60v60h-60z M150 20v40h40V20z M160 30h20v20h-20z" />
                <path d="M10 140h60v60H10z M20 150v40h40v-40z M30 160h20v20H30z" />

                <path d="M85 10h10v10H85z M105 10h10v20h-10z M80 35h15v10H80z M105 40h10v10h-10z M125 35h10v20h-10z" />
                <path d="M80 65h10v15H80z M100 65h20v10h-20z M130 65h10v15h-10z M145 85h15v10h-15z" />
                <path d="M80 90h15v15H80z M105 85h10v20h-10z M125 100h20v10h-20z M155 105h10v10h-10z" />
                <path d="M10 85h10v20H10z M30 85h15v10H30z M50 90h15v15H50z" />
                <path d="M15 115h10v10H15z M35 115h20v10H35z M65 115h10v10H65z" />
                <path d="M85 120h10v20H85z M105 120h20v10h-20z M135 125h10v15h-10z" />
                <path d="M80 150h10v10H80z M100 145h15v15h-15z M125 150h10v20h-10z M145 145h10v10h-10z" />
                <path d="M85 175h20v10H85z M115 175h10v20h-10z M140 175h15v10h-15z M165 150h10v20h-10z" />
                <path d="M180 90h20v10h-20z M175 110h15v15h-15z M190 130h10v10h-10z" />
                <path d="M65 175h10v20H65z M30 180h15v10H30z M55 145h10v15H55z" />
              </g>
            </svg>

            <div class="pix-qr-watermark">
              <i class="fa-brands fa-pix"></i>
            </div>
          </div>

          <span class="pix-qr-caption">
            QR CODE ILUSTRATIVO
          </span>
        </div>

        <div class="pix-divider">
          <span></span>
          OU COPIE O CÓDIGO
          <span></span>
        </div>

        <div class="pix-code-box">
          <span>{{ codigoPix }}</span>
        </div>

        <button
          class="pix-copy-button"
          type="button"
          @click="copiarCodigo"
        >
          <i
            :class="
              copiado
                ? 'fa-solid fa-check'
                : 'fa-regular fa-copy'
            "
          ></i>

          {{ copiado ? "Código copiado!" : "Copiar código demonstrativo" }}
        </button>

        <div class="pix-payment-info">
          <div>
            <span>Beneficiário</span>
            <strong>Padaria Martins</strong>
          </div>

          <div>
            <span>Valor ilustrativo</span>
            <strong>{{ valorFormatado }}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong class="pix-status">
              <i class="fa-solid fa-circle"></i>
              Demonstração
            </strong>
          </div>
        </div>
      </section>

      <section class="pix-value-card">
        <div class="pix-value-heading">
          <i class="fa-solid fa-receipt"></i>
          <span>Valor de demonstração</span>
        </div>

        <label for="valorPix">Altere o valor ilustrativo</label>

        <div class="pix-value-input">
          <span>R$</span>
          <input
            id="valorPix"
            v-model="valorDemonstracao"
            type="text"
            inputmode="decimal"
            placeholder="25,00"
          />
        </div>

        <small>
          Alterar este valor não gera uma cobrança.
        </small>
      </section>

      <footer class="pix-footer">
        <i class="fa-solid fa-heart"></i>
        Feito com carinho para você.
        <strong>PADARIA MARTINS</strong>
      </footer>
    </div>
  </main>
</template>
