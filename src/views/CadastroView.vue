
<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import "@/assets/css/Cadastro.css";

const router = useRouter();

const nome = ref("");
const email = ref("");
const senha = ref("");
const erro = ref("");
const mostrarSenha = ref(false);
const carregando = ref(false);

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const forcaSenha = computed(() => {
  if (!senha.value) return 0;

  return [
    senha.value.length >= 6,
    /[A-Z]/.test(senha.value),
    /[0-9]/.test(senha.value),
    /[^A-Za-z0-9]/.test(senha.value),
  ].filter(Boolean).length;
});

const textoForcaSenha = computed(() => {
  if (forcaSenha.value <= 1) return "FRACA";
  if (forcaSenha.value === 2) return "MÉDIA";
  if (forcaSenha.value === 3) return "BOA";
  return "FORTE";
});

async function registrarUsuario() {
  erro.value = "";

  if (!nome.value.trim() || !email.value.trim() || !senha.value) {
    erro.value = "Preencha todos os campos.";
    return;
  }

  if (senha.value.length < 6) {
    erro.value = "A senha precisa ter pelo menos 6 caracteres.";
    return;
  }

  carregando.value = true;

  try {
    const response = await fetch(`${baseUrl}/cadastro/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: nome.value.trim(),
        email: email.value.trim(),
        password: senha.value,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      erro.value =
        Object.values(data)
          .flat()
          .filter((item) => typeof item === "string")
          .join(" ") || "Não foi possível criar sua conta.";
      return;
    }

    router.push({
      path: "/login",
      query: { cadastro: "sucesso" },
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    erro.value = "Não foi possível conectar ao servidor.";
  } finally {
    carregando.value = false;
  }
}

function irParaLogin() {
  router.push("/");
}
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
        DESDE
        <strong>1987</strong>
      </div>
    </header>

    <main class="auth-content">
      <section class="editorial">
        <span class="eyebrow">
          <i class="fa-solid fa-heart"></i>
          FAÇA PARTE DA NOSSA HISTÓRIA
        </span>

        <h1>
          Uma conta<br />
          para chamar<br />
          de <em>sua.</em>
        </h1>

        <p>
          Crie seu espaço na Padaria Martins e deixe
          seus próximos pedidos ainda mais simples.
        </p>

        <div class="visual">
          <div class="image-frame">
            <img src="/img/historia.jpeg" alt="Padaria Martins" />
            <span class="image-label">DESDE 1987</span>
          </div>

          <div class="round-note">
            <span>feito</span>
            <strong>à mão</strong>
            <i class="fa-solid fa-heart"></i>
          </div>

          <div class="visual-caption">
            <span>02</span>
            <p>Um lugar especial<br />começa com você.</p>
          </div>
        </div>
      </section>

      <section class="account-card">
        <div class="card-heading">
          <div>
            <span class="card-label">NOVA CONTA</span>
            <h2>Vamos começar.</h2>
          </div>

          <div class="card-number">
            02<br />
            <span>/ 02</span>
          </div>
        </div>

        <div class="divider"></div>

        <form class="form" @submit.prevent="registrarUsuario">
          <div class="field">
            <label for="nome"><span>01</span> Seu nome</label>

            <div class="input-wrapper">
              <i class="fa-regular fa-user"></i>
              <input
                id="nome"
                v-model="nome"
                type="text"
                placeholder="Como podemos chamar você?"
                autocomplete="name"
                required
              />
            </div>
          </div>

          <div class="field">
            <label for="email"><span>02</span> Seu email</label>

            <div class="input-wrapper">
              <i class="fa-regular fa-envelope"></i>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="field">
            <label for="senha"><span>03</span> Crie sua senha</label>

            <div class="input-wrapper">
              <i class="fa-solid fa-lock"></i>
              <input
                id="senha"
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Escolha uma senha"
                autocomplete="new-password"
                required
              />

              <button
                type="button"
                class="show-password"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                @click="mostrarSenha = !mostrarSenha"
              >
                <i
                  :class="mostrarSenha
                    ? 'fa-regular fa-eye-slash'
                    : 'fa-regular fa-eye'"
                ></i>
              </button>
            </div>
          </div>

          <div v-if="senha" class="password-strength">
            <div class="strength-top">
              <span>FORÇA DA SENHA</span>
              <strong>{{ textoForcaSenha }}</strong>
            </div>

            <div class="strength-bars">
              <span
                v-for="n in 4"
                :key="n"
                :class="{ active: n <= forcaSenha }"
              ></span>
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
              {{ carregando ? "Criando..." : "Criar minha conta" }}
            </span>

            <i
              :class="carregando
                ? 'fa-solid fa-spinner fa-spin'
                : 'fa-solid fa-arrow-right'"
            ></i>
          </button>
        </form>

        <div class="card-footer">
          <span>Já possui uma conta?</span>
          <button type="button" @click="irParaLogin">
            Voltar para o login
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
