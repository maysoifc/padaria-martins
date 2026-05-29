<script setup>
import { ref, onMounted } from "vue";
import InfoCard from "@/components/InfoCard.vue";

const usuario = ref({
  username: "Carregando...",
  email: "Aguardando...",
  foto_perfil: null
});
const fileInput = ref(null);

const carregarPerfil = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://127.0.0.1:8000/api/perfil/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      usuario.value = await response.json();
    } else {
      console.warn("Sem autorização, usando dados padrão");
    }
  } catch (err) {
    console.error("Erro na conexão:", err);
  }
};

const atualizarFoto = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('foto_perfil', file);

  const token = localStorage.getItem("token");
  await fetch("http://127.0.0.1:8000/api/perfil/", {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  carregarPerfil();
};

onMounted(carregarPerfil);
</script>

<template>
  <div class="profile-view">
    <InfoCard>
      <input type="file" ref="fileInput" @change="atualizarFoto" style="display: none" accept="image/*" />

      <div class="avatar-usuario" @click="fileInput.click()" style="cursor: pointer;">
        <img :src="usuario.foto_perfil || '/default-avatar.png'" alt="Foto" />
        <div class="overlay-editar">Editar</div>
      </div>

      <div class="info-usuario">
        <h2>{{ usuario.username }}</h2>
        <p>{{ usuario.email }}</p>
      </div>
    </InfoCard>
  </div>
</template>
