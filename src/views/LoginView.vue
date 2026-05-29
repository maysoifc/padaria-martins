<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const senha = ref("");
const erro = ref("");
const mostrarModal = ref(false);
const novoEmail = ref("");
const novaSenha = ref("");

const fazerLogin = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: senha.value }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token || data.access);
      router.push("/menu");
    } else {
      erro.value = "Email ou senha incorretos.";
    }
  } catch (err) {
    erro.value = "Erro ao conectar ao servidor.";
  }
};

const registrarUsuario = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/cadastro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: novoEmail.value,
        password: novaSenha.value,
        username: novoEmail.value
      }),
    });

    if (response.ok) {
      alert("Conta criada com sucesso!");
      mostrarModal.value = false;
      novoEmail.value = "";
      novaSenha.value = "";
    } else {
      alert("Erro ao cadastrar. Verifique os dados.");
    }
  } catch (err) {
    alert("Erro de conexão.");
  }
};
</script>

<template>
  <div class="login-container">
    <div class="left-side"></div>

    <div class="right-side">
      <div class="login-box">
        <div class="icon-circle">
          <i class="fa-solid fa-user" style="color: rgb(255, 255, 255)"></i>
        </div>
        <h1>Login</h1>

        <input v-model="email" type="email" placeholder="Email" class="input-field" />
        <input v-model="senha" type="password" placeholder="Senha" class="input-field" />

        <button @click="fazerLogin" class="btn-login">Logar agora</button>
        <p v-if="erro" class="error-msg">{{ erro }}</p>

        <div class="footer-text">
          <h4 class="welcome-text">Bem-vindo novamente!</h4>
          <p>Ainda sem cadastro? Sem problemas!</p>
          <button @click="mostrarModal = true" class="link-cadastro">Cadastrar agora</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <button @click="mostrarModal = false" class="btn-x">×</button>
        <h3>Criar Nova Conta</h3>

        <input v-model="novoEmail" type="email" placeholder="Seu email" class="input-field" />
        <input v-model="novaSenha" type="password" placeholder="Crie uma senha" class="input-field" />

        <button class="btn-login" @click="registrarUsuario">Finalizar Cadastro</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-circle {
  font-size: 3rem;
}
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.left-side {
  width: 40%;
  background-color: #f5f0e6;
}

.right-side {
  width: 60%;
  background-color: #2e1a14;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 300px;
}

.input-field {
  margin: 10px 0;
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  border: none;
}
.btn-login {
  margin-top: 10px;
  background-color: #00e676;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.1s;
}

.btn-login:active {
  transform: scale(0.98);
}

.footer-text {
  margin-top: 10px;
}

.link-cadastro {
  color: #fff;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.error-msg {
  color: #ff5252;
  margin-top: 10px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #ffffff;
  color: #2e1a14;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 350px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  margin: 0 20px;
}

.modal-content h3 {
  margin-bottom: 10px;
  color: #2e1a14;
}
.btn-x {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  cursor: pointer;
  color: #2e1a14;
  transition: color 0.2s;
}

.btn-x:active {
  transform: scale(0.9);
  background: none;
  color: #ff5252;
}

.footer-text h4 {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 10px;
  line-height: 27px;
  font-style: italic;
}
</style>
