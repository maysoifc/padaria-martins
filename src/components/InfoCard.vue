<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "@/assets/perfil/default-avatar.png";

const API_URL = "http://127.0.0.1:8000";

const usuario = ref({
  username: "Carregando...",
  email: "Aguardando...",
  foto_perfil: null,
});

const fileInput = ref(null);

const handleImageError = (event) => {
  event.target.onerror = null;
  event.target.src = defaultAvatar;
};

const abrirSeletor = () => {
  fileInput.value?.click();
};

const carregarPerfil = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("Token não encontrado.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/perfil/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Erro ao carregar perfil:", response.status);
      return;
    }

    const dados = await response.json();

    console.log("Perfil recebido:", dados);

    usuario.value = {
      username: dados.username,
      email: dados.email,
      foto_perfil: dados.foto_perfil,
    };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
  }
};

const atualizarFoto = async (event) => {
  const arquivo = event.target.files?.[0];

  if (!arquivo) {
    console.warn("Nenhum arquivo selecionado.");
    return;
  }

  console.log("Arquivo selecionado:", arquivo);

  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("foto_perfil", arquivo);

  try {
    const response = await fetch(`${API_URL}/api/perfil/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const dados = await response.json();

    console.log("Resposta upload:", dados);

    if (!response.ok) {
      console.error("Erro no upload:", dados);
      return;
    }

    usuario.value.foto_perfil = dados.foto_perfil
      ? `${dados.foto_perfil}?t=${Date.now()}`
      : null;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
  }
};

onMounted(() => {
  carregarPerfil();
});
</script>

<template>
  <div class="profile-view">
    <div class="perfil-card">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="atualizarFoto"
      />

      <div
        class="avatar-usuario"
        @click="abrirSeletor"
        title="Clique para alterar a foto"
      >
        <img
         v-if="usuario.foto_perfil"
        :src="usuario.foto_perfil"
        alt="Foto de Perfil"
        @error="handleImageError"
      />

      <img
      :src="usuario.foto_perfil || defaultAvatar"
      alt="Foto de Perfil"
      @error="handleImageError"
      />

        <div class="overlay-editar">
          Editar
        </div>
      </div>

      <div class="info-usuario">
        <h2>{{ usuario.username }}</h2>
        <p>{{ usuario.email }}</p>
      </div>
    </div>
  </div>
</template>
