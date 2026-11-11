<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "@/assets/perfil/default-avatar.png";
import "@/assets/css/profileCard.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const usuario = ref({
  username: "Carregando...",
  email: "Aguardando...",
  foto_perfil: null,
});

const contaAberta = ref(false);
const fileInput = ref(null);
const carregandoFoto = ref(false);

const handleImageError = (event) => {
  event.target.onerror = null;
  event.target.src = defaultAvatar;
};

const abrirSeletor = () => {
  if (!carregandoFoto.value) {
    fileInput.value?.click();
  }
};

const alternarConta = () => {
  contaAberta.value = !contaAberta.value;
};

const carregarPerfil = async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/perfil/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dados = await response.json();

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

  if (!arquivo || carregandoFoto.value) return;

  const token = localStorage.getItem("token");

  if (!token) return;

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

    if (!response.ok) {
      console.error("Erro no upload:", dados);
      return;
    }

    usuario.value = {
      username: dados.username || usuario.value.username,
      email: dados.email || usuario.value.email,
      foto_perfil: dados.foto_perfil
        ? `${dados.foto_perfil}${dados.foto_perfil.includes("?") ? "&" : "?"}t=${Date.now()}`
        : null,
    };
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
  } finally {
    carregandoFoto.value = false;
    event.target.value = "";
  }
};

onMounted(carregarPerfil);
</script>

<template>
  <section class="profile-card">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="input-foto"
      @change="atualizarFoto"
    />

    <div class="profile-top">
      <div
        class="avatar-usuario"
        role="button"
        tabindex="0"
        aria-label="Alterar foto de perfil"
        @click="abrirSeletor"
        @keydown.enter.prevent="abrirSeletor"
        @keydown.space.prevent="abrirSeletor"
      >
        <img
          :src="usuario.foto_perfil || defaultAvatar"
          alt="Foto de perfil"
          @error="handleImageError"
        />

        <div class="botao-camera">
          <i
            v-if="!carregandoFoto"
            class="fas fa-camera"
          ></i>

          <i
            v-else
            class="fas fa-spinner girando"
          ></i>
        </div>
      </div>

      <h2>{{ usuario.username }}</h2>

      <p class="email-principal">
        <i class="fas fa-envelope"></i>
        {{ usuario.email }}
      </p>
    </div>

    <div class="conta">
      <button
        class="conta-header"
        type="button"
        :aria-expanded="contaAberta"
        @click="alternarConta"
      >
        <span>Minha conta</span>

        <i
          class="fas fa-chevron-down seta"
          :class="{ aberta: contaAberta }"
        ></i>
      </button>

      <Transition name="conta">
        <div
          v-if="contaAberta"
          class="conta-conteudo"
        >
          <div class="info-item">
            <div class="info-icon">
              <i class="fas fa-user"></i>
            </div>

            <div>
              <span>Nome de usuário</span>
              <strong>{{ usuario.username }}</strong>
            </div>
          </div>

          <div class="linha"></div>

          <div class="info-item">
            <div class="info-icon">
              <i class="fas fa-envelope"></i>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{{ usuario.email }}</strong>
            </div>
          </div>

          <div class="linha"></div>

          <div class="info-item">
            <div class="info-icon">
              <i class="fas fa-image"></i>
            </div>

            <div>
              <span>Foto de perfil</span>

              <strong>
                {{ usuario.foto_perfil ? "Foto personalizada" : "Foto padrão" }}
              </strong>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="dica">
      <i class="fas fa-info-circle"></i>

      <div>
        <strong>Alterar foto</strong>

        <p>
          Toque na câmera da sua foto para escolher uma nova imagem.
        </p>
      </div>
    </div>
  </section>
</template>
