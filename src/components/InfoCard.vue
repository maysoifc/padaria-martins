<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "@/assets/perfil/default-avatar.png";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const usuario = ref({
  username: "Carregando...",
  email: "Aguardando...",
  foto_perfil: null,
});

const fileInput = ref(null);
const carregandoFoto = ref(false);

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
    const response = await fetch(`${API_URL}/perfil/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const dados = await response.json();

    console.log("Perfil recebido:", dados);

    if (!response.ok) {
      console.error("Erro ao carregar perfil:", dados);
      return;
    }

    usuario.value = {
      username: dados.username || "",
      email: dados.email || "",
      foto_perfil: dados.foto_perfil || null,
    };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
  }
};

const atualizarFoto = async (event) => {
  const arquivo = event.target.files?.[0];

  if (!arquivo) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Token não encontrado.");
    return;
  }

  const formData = new FormData();
  formData.append("foto_perfil", arquivo);

  carregandoFoto.value = true;

  try {
    const response = await fetch(`${API_URL}/perfil/`, {
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

    usuario.value = {
      username: dados.username || usuario.value.username,
      email: dados.email || usuario.value.email,
      foto_perfil: dados.foto_perfil
        ? `${dados.foto_perfil}?t=${Date.now()}`
        : null,
    };
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
  } finally {
    carregandoFoto.value = false;
    event.target.value = "";
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
          :src="usuario.foto_perfil || defaultAvatar"
          alt="Foto de Perfil"
          @error="handleImageError"
        />

        <div class="overlay-editar">
          {{ carregandoFoto ? "Enviando..." : "Editar" }}
        </div>
      </div>

      <div class="info-usuario">
        <h2>{{ usuario.username }}</h2>
        <p>{{ usuario.email }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  justify-content: center;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.perfil-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.avatar-usuario {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar-usuario img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.overlay-editar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-usuario:hover .overlay-editar {
  opacity: 1;
}

.info-usuario {
  text-align: center;
  margin-top: 15px;
  width: 100%;
  word-break: break-word;
}

.info-usuario h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.info-usuario p {
  margin-top: 5px;
  color: #666;
}
</style>
