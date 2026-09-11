
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const senha = ref("");
const erro = ref("");
const mostrarSenha = ref(false);
const carregando = ref(false);

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const fazerLogin = async () => {
  erro.value = "";

  if (!email.value || !senha.value) {
    erro.value = "Preencha seu email e sua senha.";
    return;
  }

  carregando.value = true;

  try {
    const response = await fetch(`${baseUrl}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: senha.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(
        "token",
        data.access || data.token
      );

      router.push("/menu");
    } else {
      erro.value =
        data.detail ||
        data.message ||
        "Email ou senha incorretos.";
    }
  } catch (err) {
    console.error("Erro no login:", err);
    erro.value =
      "Não foi possível conectar ao servidor.";
  } finally {
    carregando.value = false;
  }
};

const irParaCadastro = () => {
  router.push("/cadastro");
};
</script>
<template>
  <div class="auth-page">
    <div class="paper-texture"></div>

    <header class="brand-header">
      <div class="brand-mark">PM</div>

      <div class="brand-name">
        <strong>PADARIA</strong>
        <span>MARTINS</span>
      </div>

      <div class="since">
        DESDE<br />
        <strong>1987</strong>
      </div>
    </header>

    <main class="auth-content">
      <section class="editorial">
        <span class="eyebrow">
          <i class="fa-solid fa-sparkles"></i>
          UM LUGAR À MESA
        </span>

        <h1>
          Seu dia<br />
          começa<br />
          <em>com sabor.</em>
        </h1>

        <p>
          Entre para acompanhar seus pedidos,
          descobrir novidades e aproveitar tudo
          o que preparamos para você.
        </p>

        <div class="visual">
          <div class="image-frame">
            <img
              src="/img/historia.jpeg"
              alt="Padaria Martins"
            />

            <span class="image-label">FEITO HOJE</span>
          </div>

          <div class="round-note">
            <span>receita</span>
            <strong>da casa</strong>
            <i class="fa-solid fa-arrow-down"></i>
          </div>

          <div class="visual-caption">
            <span>01</span>

            <p>
              Tradição artesanal<br />
              em cada detalhe.
            </p>
          </div>
        </div>
      </section>

      <section class="account-card">
        <div class="card-heading">
          <div>
            <span class="card-label">BEM-VINDO DE VOLTA</span>

            <h2>Entre na sua conta.</h2>
          </div>

          <div class="card-number">
            01<br />
            <span>/ 02</span>
          </div>
        </div>

        <div class="divider"></div>

        <form
          class="form"
          @submit.prevent="fazerLogin"
        >
          <div class="field">
            <label for="email">
              <span>01</span>
              Seu email
            </label>

            <div class="input-wrapper">
              <i class="fa-regular fa-envelope"></i>

              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field">
            <label for="senha">
              <span>02</span>
              Sua senha
            </label>

            <div class="input-wrapper">
              <i class="fa-solid fa-lock"></i>

              <input
                id="senha"
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Digite sua senha"
                autocomplete="current-password"
              />

              <button
                type="button"
                class="show-password"
                @click="mostrarSenha = !mostrarSenha"
              >
                <i
                  :class="
                    mostrarSenha
                      ? 'fa-regular fa-eye-slash'
                      : 'fa-regular fa-eye'
                  "
                ></i>
              </button>
            </div>
          </div>

          <p
            v-if="erro"
            class="error-message"
          >
            <i class="fa-solid fa-circle-exclamation"></i>
            {{ erro }}
          </p>

          <button
            type="submit"
            class="submit-button"
            :disabled="carregando"
          >
            <span>
              {{ carregando ? "Aguarde..." : "Entrar na minha conta" }}
            </span>

            <i
              :class="
                carregando
                  ? 'fa-solid fa-spinner fa-spin'
                  : 'fa-solid fa-arrow-right'
              "
            ></i>
          </button>
        </form>

        <div class="card-footer">
          <span>Ainda não faz parte?</span>

          <button
            type="button"
            @click="irParaCadastro"
          >
            Criar minha conta
          </button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>PADARIA MARTINS</span>

      <div></div>

      <span>FEITO COM CARINHO</span>
    </footer>
  </div>
</template>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  background: #eee6d9;
}

.auth-page {
  min-height: 100svh;
  overflow-x: hidden;
  padding: 22px 18px 18px;
  position: relative;
  color: #3f281f;
  background:
    radial-gradient(
      circle at 90% 5%,
      rgba(184, 151, 100, 0.15),
      transparent 27%
    ),
    #eee6d9;
  font-family: "DM Sans", sans-serif;
}

.paper-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.2;
  background-image:
    radial-gradient(
      #8f7865 0.55px,
      transparent 0.55px
    );
  background-size: 7px 7px;
}

.brand-header {
  position: relative;
  z-index: 2;
  max-width: 520px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #5e3023;
  border-radius: 50%;
  transform: rotate(-8deg);
  font-family: "Playfair Display", serif;
  font-size: 12px;
  font-weight: 700;
}

.brand-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 0.95;
}

.brand-name strong {
  font-family: "DM Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
}

.brand-name span {
  margin-top: 4px;
  font-family: "Playfair Display", serif;
  font-size: 18px;
  font-style: italic;
}

.since {
  text-align: right;
  font-family: "DM Mono", monospace;
  font-size: 7px;
  line-height: 1.3;
  letter-spacing: 0.12em;
  color: #806c5c;
}

.since strong {
  color: #5e3023;
  font-size: 10px;
}

.auth-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
  margin: 34px auto 0;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8c7157;
  font-family: "DM Mono", monospace;
  font-size: 8px;
  letter-spacing: 0.14em;
}

.eyebrow i {
  color: #b89764;
}

.editorial h1 {
  max-width: 320px;
  margin: 15px 0 12px;
  font-family: "Playfair Display", serif;
  font-size: clamp(43px, 13vw, 60px);
  font-weight: 500;
  line-height: 0.88;
  letter-spacing: -0.055em;
}

.editorial h1 em {
  color: #8b6348;
}

.editorial > p {
  max-width: 310px;
  margin: 0;
  color: #806e61;
  font-size: 12px;
  line-height: 1.65;
}

.visual {
  position: relative;
  height: 220px;
  margin: 25px -18px 0;
}

.image-frame {
  position: absolute;
  top: 0;
  left: 9%;
  width: 68%;
  height: 185px;
  overflow: hidden;
  border-radius: 2px 2px 55px 2px;
  transform: rotate(-3deg);
  box-shadow: 15px 17px 0 rgba(94, 48, 35, 0.09);
}

.image-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(63, 40, 31, 0.03),
    rgba(63, 40, 31, 0.25)
  );
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-label {
  position: absolute;
  z-index: 2;
  right: 12px;
  bottom: 12px;
  padding: 7px 9px;
  background: #f6efe4;
  color: #5e3023;
  font-family: "DM Mono", monospace;
  font-size: 7px;
  letter-spacing: 0.08em;
}

.round-note {
  position: absolute;
  z-index: 3;
  top: 26px;
  right: 3%;
  width: 82px;
  height: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #b89764;
  color: #fff9f0;
  transform: rotate(9deg);
  box-shadow: 0 12px 24px rgba(94, 48, 35, 0.15);
}

.round-note span {
  font-family: "DM Mono", monospace;
  font-size: 7px;
}

.round-note strong {
  font-family: "Playfair Display", serif;
  font-size: 15px;
  font-style: italic;
}

.round-note i {
  margin-top: 4px;
  font-size: 8px;
}

.visual-caption {
  position: absolute;
  left: 3%;
  bottom: 3px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.visual-caption > span {
  color: #b89764;
  font-family: "DM Mono", monospace;
  font-size: 8px;
}

.visual-caption p {
  margin: 0;
  color: #5e3023;
  font-family: "Playfair Display", serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1.15;
}

.account-card {
  position: relative;
  margin-top: 3px;
  padding: 25px 20px 18px;
  border-radius: 4px;
  background: #faf7f1;
  box-shadow:
    0 20px 45px rgba(78, 52, 39, 0.11),
    0 2px 5px rgba(78, 52, 39, 0.05);
}

.account-card::before,
.account-card::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 7px;
  background:
    radial-gradient(
      circle at 6px 7px,
      transparent 5px,
      #faf7f1 5.5px
    )
    0 0 / 12px 12px repeat-x;
}

.account-card::before {
  top: -6px;
  transform: rotate(180deg);
}

.account-card::after {
  bottom: -6px;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.card-label {
  color: #a0856d;
  font-family: "DM Mono", monospace;
  font-size: 7px;
  letter-spacing: 0.16em;
}

.card-heading h2 {
  margin: 7px 0 0;
  color: #4a2d22;
  font-family: "Playfair Display", serif;
  font-size: 25px;
  font-weight: 500;
  line-height: 1.05;
}

.card-number {
  color: #b89764;
  font-family: "DM Mono", monospace;
  font-size: 10px;
  text-align: right;
}

.card-number span {
  color: #b8aaa0;
}

.divider {
  height: 1px;
  margin: 20px 0 18px;
  background: #e5ddd2;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.field label {
  display: flex;
  gap: 8px;
  margin-bottom: 7px;
  color: #806b5d;
  font-family: "DM Mono", monospace;
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field label span {
  color: #b89764;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper > i {
  position: absolute;
  left: 13px;
  z-index: 1;
  color: #a8907c;
  font-size: 12px;
}

.input-wrapper input {
  width: 100%;
  min-height: 51px;
  padding: 0 42px 0 39px;
  border: 1px solid #ded4c8;
  border-radius: 2px;
  outline: none;
  background: #f7f2eb;
  color: #4a2d22;
  font-family: "DM Sans", sans-serif;
  font-size: 13px;
}

.input-wrapper input::placeholder {
  color: #b2a398;
}

.input-wrapper input:focus {
  border-color: #a88a65;
  background: #fffdf9;
  box-shadow: 0 0 0 3px rgba(184, 151, 100, 0.09);
}

.show-password {
  position: absolute;
  right: 8px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: #8f7b6d;
}

.error-message {
  display: flex;
  gap: 7px;
  margin: -3px 0 -4px;
  color: #a24738;
  font-size: 11px;
  line-height: 1.4;
}

.submit-button {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 19px;
  border: 0;
  border-radius: 2px;
  background: #5e3023;
  color: #fffaf3;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(94, 48, 35, 0.15);
}

.submit-button i {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.submit-button:disabled {
  opacity: 0.65;
}

.card-footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed #ddd2c5;
  color: #8f7c6e;
  font-size: 10px;
  text-align: center;
}

.card-footer button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #79503d;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.footer {
  position: relative;
  z-index: 1;
  max-width: 520px;
  margin: 25px auto 0;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a18d7c;
  font-family: "DM Mono", monospace;
  font-size: 6px;
  letter-spacing: 0.12em;
}

.footer div {
  flex: 1;
  height: 1px;
  background: #d1c3b5;
}
</style>
