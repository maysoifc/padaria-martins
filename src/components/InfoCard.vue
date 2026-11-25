
<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "@/assets/perfil/default-avatar.png";
import "@/assets/css/profileCard.css";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const usuario = ref({
  username: "Carregando...",
  email: "Aguardando...",
  foto_perfil: null,
});

const contaAberta = ref(false);
const fileInput = ref(null);
const carregandoFoto = ref(false);
const erroFoto = ref("");

const tokenUsuario = () => localStorage.getItem("token");

const obterHeaders = () => ({
  Authorization: `Bearer ${tokenUsuario()}`,
});

const normalizarFoto = (foto) => {
  if (!foto || typeof foto !== "string") return null;

  const url = foto.trim();

  if (!url || url === "None" || url === "null") return null;

  // URL absoluta do Cloudinary ou outro servidor
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Caminho relativo
  return `${API_URL}/${url.replace(/^\/+/, "")}`;
};

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
  const token = tokenUsuario();

  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/perfil/`, {
      method: "GET",
      headers: obterHeaders(),
      cache: "no-store",
    });

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro ao carregar perfil:", dados);
      return;
    }

    usuario.value = {
      username: dados.username || "",
      email: dados.email || "",
      foto_perfil: normalizarFoto(dados.foto_perfil),
    };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
  }
};

const atualizarFoto = async (event) => {
  const arquivo = event.target.files?.[0];

  if (!arquivo || carregandoFoto.value) return;

  const token = tokenUsuario();

  if (!token) {
    erroFoto.value = "Faça login novamente para alterar sua foto.";
    event.target.value = "";
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    erroFoto.value = "Selecione um arquivo de imagem válido.";
    event.target.value = "";
    return;
  }

  const tamanhoMaximo = 5 * 1024 * 1024;

  if (arquivo.size > tamanhoMaximo) {
    erroFoto.value = "A imagem deve ter no máximo 5 MB.";
    event.target.value = "";
    return;
  }

  erroFoto.value = "";
  carregandoFoto.value = true;

  const formData = new FormData();
  formData.append("foto_perfil", arquivo);

  try {
    const response = await fetch(`${API_URL}/perfil/`, {
      method: "PATCH",
      headers: obterHeaders(),
      body: formData,
    });

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro no upload:", dados);

      const mensagem =
        dados.foto_perfil?.[0] ||
        dados.detail ||
        dados.erro ||
        "Não foi possível atualizar sua foto.";

      erroFoto.value = mensagem;
      return;
    }

    const novaFoto = normalizarFoto(dados.foto_perfil);

    if (!novaFoto) {
      console.error("A API não retornou uma URL de foto válida:", dados);
      erroFoto.value =
        "A foto foi enviada, mas o servidor não retornou o endereço da imagem.";
      return;
    }

    usuario.value = {
      username: dados.username || usuario.value.username,
      email: dados.email || usuario.value.email,
      foto_perfil: `${novaFoto}${novaFoto.includes("?") ? "&" : "?"}t=${Date.now()}`,
    };

    erroFoto.value = "";
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    erroFoto.value = "Erro de conexão ao atualizar a foto.";
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

      <p v-if="erroFoto" class="erro-foto" role="alert">
        {{ erroFoto }}
      </p>

      <p v-if="carregandoFoto" class="status-foto">
        Atualizando sua foto...
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

<style scoped>
.erro-foto {
  margin-top: 10px;
  color: #a34d3d;
  font-size: 0.75rem;
  text-align: center;
}

.status-foto {
  margin-top: 8px;
  color: #987348;
  font-size: 0.75rem;
  text-align: center;
}

.girando {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
