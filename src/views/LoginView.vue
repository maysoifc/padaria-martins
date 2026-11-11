<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const senha = ref("");
const erro = ref("");
const mostrarSenha = ref(false);
const carregando = ref(false);

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const fazerLogin = async () => {
  erro.value = "";

  const emailNormalizado = email.value.trim();

  if (!emailNormalizado || !senha.value) {
    erro.value = "Preencha seu email e sua senha.";
    return;
  }

  if (carregando.value) return;

  carregando.value = true;

  try {
    const response = await fetch(`${baseUrl}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailNormalizado,
        password: senha.value,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      erro.value =
        data.detail ||
        data.message ||
        "Email ou senha incorretos.";
      return;
    }

    const token = data.access || data.token;

    if (!token) {
      erro.value = "O servidor não retornou um token de acesso.";
      return;
    }

    localStorage.setItem("token", token);

    await router.push("/menu");
  } catch (error) {
    console.error("Erro no login:", error);
    erro.value = "Não foi possível conectar ao servidor.";
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
    <div class="paper-texture" aria-hidden="true"></div>

    <header class="brand-header">
      <div class="brand-mark">PM</div>

      <div class="brand-name">
        <strong>PADARIA</strong>
        <span>MARTINS</span>
      </div>

      <div class="since">
        DESDE
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

        <form class="form" @submit.prevent="fazerLogin">
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
                required
                :disabled="carregando"
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
                required
                :disabled="carregando"
              />

              <button
                type="button"
                class="show-password"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                :aria-pressed="mostrarSenha"
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

          <p v-if="erro" class="error-message" role="alert">
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

<style scoped src="@/assets/css/LoginView.css"></style>
