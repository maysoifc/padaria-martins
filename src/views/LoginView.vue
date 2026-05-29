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
