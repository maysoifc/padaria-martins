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

  if (!email.value.trim() || !senha.value) {
    erro.value = "Informe seu e-mail e sua senha.";
    return;
  }

  if (carregando.value) return;

  carregando.value = true;

  try {
    const response = await fetch(`${baseUrl}/admin/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value.trim(),
        password: senha.value,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      erro.value =
        data.detail ||
        data.non_field_errors?.[0] ||
        "E-mail ou senha inválidos, ou conta sem acesso administrativo.";
      return;
    }

    if (!data.access || data.is_admin !== true) {
      erro.value =
        "O servidor não confirmou suas permissões administrativas.";
      return;
    }

    localStorage.setItem("adminToken", data.access);

    if (data.refresh) {
      localStorage.setItem("adminRefresh", data.refresh);
    } else {
      localStorage.removeItem("adminRefresh");
    }

    localStorage.setItem(
      "adminUsername",
      data.username || "Administrador"
    );

    await router.push("/admin");
  } catch (error) {
    console.error("Erro no login administrativo:", error);
    erro.value =
      "Não foi possível conectar ao servidor. Verifique se a API está funcionando.";
  } finally {
    carregando.value = false;
  }
};

const voltarLoginCliente = () => {
  router.push("/");
};
</script>

<template>
  <main class="admin-login">

    <div class="fundo-decorativo decorativo-1"></div>
    <div class="fundo-decorativo decorativo-2"></div>
    <div class="fundo-decorativo decorativo-3"></div>

    <section class="login-layout">

      <aside class="painel-lateral">

        <div class="marca">
          <div class="marca-icone">
            <i class="fa-solid fa-wheat-awn"></i>
          </div>

          <div class="marca-texto">
            <strong>Padaria Martins</strong>
            <span>TRADIÇÃO EM CADA DETALHE</span>
          </div>
        </div>

        <div class="lateral-conteudo">

          <span class="lateral-etiqueta">
            <span class="ponto"></span>
            ESPAÇO EXCLUSIVO
          </span>

          <h2>
            Cuidar de cada detalhe
            <em>faz toda a diferença.</em>
          </h2>

          <p>
            Gerencie os produtos, acompanhe as encomendas e
            organize sua padaria em um só lugar.
          </p>

          <div class="lateral-ilustracao">
            <div class="anel anel-1"></div>
            <div class="anel anel-2"></div>

            <div class="icone-pao">
              <i class="fa-solid fa-bread-slice"></i>
            </div>

            <span class="estrela estrela-1">✦</span>
            <span class="estrela estrela-2">✧</span>
            <span class="estrela estrela-3">✦</span>
          </div>

        </div>

        <div class="lateral-rodape">
          <i class="fa-solid fa-heart"></i>
          <span>Feito com carinho, todos os dias.</span>
        </div>

      </aside>

      <section class="login-principal">

        <div class="login-topo">
          <span class="topo-etiqueta">ÁREA ADMINISTRATIVA</span>

          <div class="icone-mobile">
            <i class="fa-solid fa-wheat-awn"></i>
          </div>

          <h1>Bem-vindo(a) de volta.</h1>

          <p>
            Entre com suas credenciais para acessar o painel de gestão.
          </p>
        </div>

        <form @submit.prevent="fazerLogin">

          <div class="campo">
            <label for="admin-email">E-mail administrativo</label>

            <div class="input-wrapper">
              <i class="fa-regular fa-envelope"></i>

              <input
                id="admin-email"
                v-model="email"
                type="email"
                autocomplete="username"
                placeholder="Digite seu e-mail"
                required
                :disabled="carregando"
              />
            </div>
          </div>

          <div class="campo">
            <div class="label-linha">
              <label for="admin-senha">Senha</label>
              <span class="campo-seguro">
                <i class="fa-solid fa-lock"></i>
                Acesso protegido
              </span>
            </div>

            <div class="input-wrapper">
              <i class="fa-solid fa-key"></i>

              <input
                id="admin-senha"
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Digite sua senha"
                required
                :disabled="carregando"
              />

              <button
                type="button"
                class="mostrar-senha"
                :aria-label="
                  mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                "
                :aria-pressed="mostrarSenha"
                @click="mostrarSenha = !mostrarSenha"
              >
                <i
                  :class="
                    mostrarSenha
                      ? 'fa-solid fa-eye-slash'
                      : 'fa-solid fa-eye'
                  "
                ></i>
              </button>
            </div>
          </div>

          <div
            v-if="erro"
            class="erro"
            role="alert"
            aria-live="polite"
          >
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ erro }}</span>
          </div>

          <button
            class="entrar-btn"
            type="submit"
            :disabled="carregando"
          >
            <span>
              {{ carregando ? "Verificando acesso..." : "Entrar no painel" }}
            </span>

            <i
              v-if="!carregando"
              class="fa-solid fa-arrow-right"
            ></i>

            <i
              v-else
              class="fa-solid fa-circle-notch carregando-icone"
            ></i>
          </button>

        </form>

        <div class="divisor">
          <span></span>
          <i class="fa-solid fa-star"></i>
          <span></span>
        </div>

        <button
          type="button"
          class="voltar-btn"
          @click="voltarLoginCliente"
        >
          <i class="fa-solid fa-arrow-left"></i>
          Voltar ao login de clientes
        </button>

        <p class="seguranca">
          <i class="fa-solid fa-shield-halved"></i>
          Acesso destinado à equipe administrativa.
        </p>

      </section>

    </section>

    <footer class="rodape-global">
      PADARIA MARTINS <span>·</span> O PÃO NOSSO
    </footer>

  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-login {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 22px 20px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 8% 8%,
      rgba(184, 151, 100, 0.14),
      transparent 29%
    ),
    radial-gradient(
      circle at 92% 88%,
      rgba(94, 48, 35, 0.07),
      transparent 28%
    ),
    #f8f4ed;
  color: #493327;
}

.fundo-decorativo {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(184, 151, 100, 0.16);
  border-radius: 50%;
  pointer-events: none;
}

.decorativo-1 {
  width: 400px;
  height: 400px;
  top: -250px;
  right: -100px;
}

.decorativo-2 {
  width: 280px;
  height: 280px;
  bottom: -180px;
  left: -100px;
}

.decorativo-3 {
  width: 9px;
  height: 9px;
  top: 20%;
  left: 12%;
  background: #b89764;
  border: 0;
  opacity: 0.4;
}

.login-layout {
  display: grid;
  width: min(100%, 1020px);
  min-height: 600px;
  grid-template-columns: 0.92fr 1.08fr;
  overflow: hidden;
  border: 1px solid rgba(105, 76, 52, 0.1);
  border-radius: 28px;
  background: #fff;
  box-shadow:
    0 35px 90px rgba(71, 46, 29, 0.11),
    0 5px 18px rgba(71, 46, 29, 0.035);
  animation: aparecer 0.6s ease both;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.painel-lateral {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 34px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 80% 45%,
      rgba(191, 157, 105, 0.17),
      transparent 34%
    ),
    linear-gradient(150deg, #39271e, #503326 65%, #68452f);
  color: #fff8ed;
}

.painel-lateral::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  opacity: 0.14;
  background-image: radial-gradient(
    rgba(255, 246, 230, 0.5) 0.7px,
    transparent 0.7px
  );
  background-size: 15px 15px;
  mask-image: linear-gradient(135deg, black, transparent 85%);
}

.marca,
.lateral-conteudo,
.lateral-rodape {
  position: relative;
  z-index: 1;
}

.marca {
  display: flex;
  align-items: center;
  gap: 12px;
}

.marca-icone {
  display: grid;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid rgba(231, 207, 169, 0.27);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  color: #e0c18b;
  font-size: 1.2rem;
}

.marca-texto {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.marca-texto strong {
  color: #fff9ef;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.1rem;
}

.marca-texto span {
  color: #d5bb91;
  font-size: 0.48rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.lateral-conteudo {
  margin: 38px 0 25px;
}

.lateral-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(231, 207, 169, 0.17);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.055);
  color: #e0c18b;
  font-size: 0.54rem;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.ponto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dfc28d;
  box-shadow: 0 0 10px rgba(223, 194, 141, 0.6);
}

.lateral-conteudo h2 {
  margin: 20px 0 13px;
  color: #fffaf3;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.45rem);
  font-weight: 500;
  line-height: 1.17;
  letter-spacing: -0.5px;
}

.lateral-conteudo h2 em {
  display: block;
  color: #dfc28d;
  font-weight: 500;
}

.lateral-conteudo > p {
  max-width: 340px;
  margin: 0;
  color: rgba(255, 248, 237, 0.67);
  font-size: 0.82rem;
  line-height: 1.75;
}

.lateral-ilustracao {
  position: relative;
  display: grid;
  width: 100%;
  height: 180px;
  margin-top: 8px;
  place-items: center;
}

.anel {
  position: absolute;
  border: 1px solid rgba(223, 194, 141, 0.2);
  border-radius: 50%;
}

.anel-1 {
  width: 155px;
  height: 155px;
}

.anel-2 {
  width: 118px;
  height: 118px;
  border-style: dashed;
}

.icone-pao {
  position: relative;
  z-index: 1;
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  border: 1px solid rgba(255, 230, 191, 0.27);
  border-radius: 45% 55% 49% 51%;
  background: linear-gradient(145deg, #d8ae75, #95623e);
  color: #fff1d8;
  box-shadow:
    inset 0 0 0 6px rgba(255, 241, 216, 0.08),
    0 18px 35px rgba(0, 0, 0, 0.16);
  transform: rotate(-8deg);
  animation: flutuar 5s ease-in-out infinite;
}

.icone-pao i {
  font-size: 2.7rem;
  transform: rotate(8deg);
}

@keyframes flutuar {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -6px;
  }
}

.estrela {
  position: absolute;
  color: #e5c994;
}

.estrela-1 {
  top: 18px;
  left: 20%;
  font-size: 1rem;
}

.estrela-2 {
  top: 48px;
  right: 18%;
  font-size: 1.5rem;
}

.estrela-3 {
  bottom: 18px;
  left: 28%;
  font-size: 0.7rem;
}

.lateral-rodape {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.13);
  color: rgba(255, 248, 237, 0.63);
  font-size: 0.68rem;
}

.lateral-rodape i {
  color: #dfc28d;
  font-size: 0.7rem;
}

.login-principal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 55px 55px 38px;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(248, 241, 230, 0.75),
      transparent 27%
    ),
    #fff;
}

.login-topo {
  margin-bottom: 30px;
}

.topo-etiqueta {
  display: block;
  margin-bottom: 12px;
  color: #b89764;
  font-size: 0.59rem;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.login-topo h1 {
  margin: 0;
  color: #493126;
  font-family: "Imprima", Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.login-topo > p {
  margin: 11px 0 0;
  color: #938174;
  font-size: 0.82rem;
  line-height: 1.65;
}

.icone-mobile {
  display: none;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.campo {
  min-width: 0;
}

.campo label {
  display: block;
  margin-bottom: 9px;
  color: #5c4435;
  font-size: 0.75rem;
  font-weight: 800;
}

.label-linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.campo-seguro {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #a28e78;
  font-size: 0.59rem;
}

.campo-seguro i {
  color: #b89764;
  font-size: 0.62rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  min-height: 51px;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: 1px solid #e9dfd3;
  border-radius: 13px;
  background: #fdfbf8;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #b89764;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(184, 151, 100, 0.11);
}

.input-wrapper > i {
  flex-shrink: 0;
  color: #b49a78;
  font-size: 0.87rem;
}

.input-wrapper input {
  width: 100%;
  min-width: 0;
  height: 49px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #493126;
  font: inherit;
  font-size: 0.82rem;
}

.input-wrapper input::placeholder {
  color: #b6a89a;
}

.input-wrapper input:disabled {
  opacity: 0.7;
}

.mostrar-senha {
  display: grid;
  width: 33px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #8e7966;
  cursor: pointer;
  transition: 0.2s ease;
}

.mostrar-senha:hover {
  background: #f4ecdf;
  color: #5e3023;
}

.erro {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: -3px 0 0;
  padding: 12px;
  border: 1px solid #f0d4d1;
  border-radius: 12px;
  background: #fff5f4;
  color: #a33d35;
  font-size: 0.75rem;
  line-height: 1.55;
}

.erro i {
  margin-top: 2px;
}

.entrar-btn {
  display: flex;
  min-height: 51px;
  align-items: center;
  justify-content: center;
  gap: 13px;
  margin-top: 2px;
  padding: 0 17px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  background: linear-gradient(110deg, #5e3023, #70432f);
  color: #fffaf3;
  font: inherit;
  font-size: 0.81rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 9px 22px rgba(94, 48, 35, 0.15);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.entrar-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(110deg, #70402d, #815139);
  box-shadow: 0 13px 27px rgba(94, 48, 35, 0.21);
}

.entrar-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}

.entrar-btn i {
  color: #e7c995;
  font-size: 0.77rem;
}

.carregando-icone {
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.divisor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 25px;
}

.divisor span {
  height: 1px;
  flex: 1;
  background: #eee5db;
}

.divisor i {
  color: #c8ad7c;
  font-size: 0.55rem;
}

.voltar-btn {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 11px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  color: #8b796a;
  font: inherit;
  font-size: 0.74rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.voltar-btn:hover {
  border-color: #eee3d6;
  background: #fbf7f1;
  color: #5e3023;
}

.voltar-btn i {
  font-size: 0.69rem;
}

.seguranca {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 15px 0 0;
  color: #ad9c8b;
  font-size: 0.62rem;
  text-align: center;
}

.seguranca i {
  color: #a78a60;
}

.rodape-global {
  margin-top: 22px;
  color: #b3a08b;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-align: center;
}

.rodape-global span {
  margin: 0 7px;
  color: #c3a675;
}

button:focus-visible {
  outline: 3px solid rgba(184, 151, 100, 0.55);
  outline-offset: 3px;
}

@media (max-width: 850px) {
  .login-layout {
    width: min(100%, 540px);
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .painel-lateral {
    display: none;
  }

  .login-principal {
    padding: 42px 40px 30px;
  }

  .icone-mobile {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    margin-bottom: 22px;
    border: 1px solid #eee0cb;
    border-radius: 15px;
    background: #f7efe3;
    color: #b89764;
    font-size: 1.25rem;
  }

  .login-topo h1 {
    font-size: 2.1rem;
  }
}

@media (max-width: 480px) {
  .admin-login {
    justify-content: center;
    padding: 18px 13px 15px;
  }

  .login-layout {
    border-radius: 22px;
  }

  .login-principal {
    padding: 29px 22px 23px;
  }

  .login-topo {
    margin-bottom: 25px;
  }

  .login-topo h1 {
    font-size: 1.85rem;
  }

  .login-topo > p {
    font-size: 0.78rem;
  }

  form {
    gap: 17px;
  }

  .campo label {
    font-size: 0.73rem;
  }

  .campo-seguro {
    font-size: 0.54rem;
  }

  .input-wrapper {
    min-height: 49px;
    padding: 0 12px;
  }

  .input-wrapper input {
    height: 47px;
    font-size: 0.8rem;
  }

  .entrar-btn {
    min-height: 49px;
  }

  .rodape-global {
    margin-top: 17px;
    font-size: 0.52rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
