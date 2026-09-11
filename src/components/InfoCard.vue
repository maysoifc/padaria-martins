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

  if (!arquivo) return;

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
        @click="abrirSeletor"
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
        @click="alternarConta"
        :aria-expanded="contaAberta"
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
                {{
                  usuario.foto_perfil
                    ? "Foto personalizada"
                    : "Foto padrão"
                }}
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
.profile-card {
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #eadfd2;
  border-radius: 24px;
  box-shadow: 0 6px 18px rgba(94, 48, 35, 0.08);
}

.input-foto {
  display: none;
}

.profile-top {
  padding: 26px 18px 22px;
  text-align: center;
  background: linear-gradient(
    145deg,
    #633426,
    #4d281f
  );
  color: #ffffff;
}

.avatar-usuario {
  position: relative;
  width: 108px;
  height: 108px;
  margin: 0 auto 13px;
  padding: 4px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #d0b77f;
  cursor: pointer;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.25);
  -webkit-tap-highlight-color: transparent;
}

.avatar-usuario img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border: 4px solid #5e3023;
  border-radius: 50%;
}

.botao-camera {
  position: absolute;
  right: -2px;
  bottom: 1px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #5e3023;
  border: 3px solid #5e3023;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.avatar-usuario:active {
  transform: scale(0.97);
}

.girando {
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.profile-top h2 {
  margin: 0;
  font-family:
    "Times New Roman",
    Georgia,
    serif;
  font-size: 25px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.email-principal {
  margin: 6px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: #eadfcf;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.email-principal i {
  color: #d0bd97;
}

.conta {
  padding: 0 18px;
}

.conta-header {
  width: 100%;
  min-height: 58px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  background: transparent;
  color: #5e3023;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.seta {
  font-size: 14px;
  color: #806f62;
  transition: transform 0.25s ease;
}

.seta.aberta {
  transform: rotate(180deg);
}

.conta-conteudo {
  overflow: hidden;
}

.info-item {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 13px;
}

.info-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f5eee3;
  color: #6a3828;
  font-size: 15px;
}

.info-item > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-item span {
  color: #9a8b7d;
  font-size: 11px;
}

.info-item strong {
  color: #5e3023;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.linha {
  height: 1px;
  margin-left: 53px;
  background: #eee5da;
}

.conta-enter-active,
.conta-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.25s ease,
    transform 0.25s ease;
}

.conta-enter-from,
.conta-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.conta-enter-to,
.conta-leave-from {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}

.dica {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 13px 18px 18px;
  padding: 13px;
  background: #f5ead8;
  border: 1px solid #e7d5b5;
  border-radius: 15px;
  box-sizing: border-box;
}

.dica > i {
  margin-top: 2px;
  color: #bd9650;
  font-size: 16px;
}

.dica strong {
  display: block;
  margin-bottom: 2px;
  color: #5e3023;
  font-size: 12px;
}

.dica p {
  margin: 0;
  color: #806f62;
  font-size: 11px;
  line-height: 1.4;
}

@media (max-width: 380px) {
  .profile-top {
    padding-top: 22px;
  }

  .avatar-usuario {
    width: 96px;
    height: 96px;
  }

  .profile-top h2 {
    font-size: 23px;
  }

  .conta {
    padding-left: 14px;
    padding-right: 14px;
  }

  .dica {
    margin-left: 14px;
    margin-right: 14px;
  }
}
</style>
