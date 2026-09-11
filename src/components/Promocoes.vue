<script setup>
const promocoes = [
  {
    id: 1,
    titulo: "Promoção de bebidas",
    dia: "Todas as segundas",
    imagem: "/img/bebidas.jpg",
    categoria: "Bebidas",
    destaque: "Comece a semana refrescando"
  },
  {
    id: 2,
    titulo: "Promoção de pães",
    dia: "Todas as quartas",
    imagem: "/img/paes.jpg",
    categoria: "Pães",
    destaque: "Pães fresquinhos para você"
  },
  {
    id: 3,
    titulo: "Promoção de doces",
    dia: "Todas as quintas",
    imagem: "/img/doces.jpg",
    categoria: "Doces",
    destaque: "Um docinho para deixar o dia melhor"
  },
  {
    id: 4,
    titulo: "Promoção de salgados",
    dia: "Todos os sábados",
    imagem: "/img/assados.jpg",
    categoria: "Salgados",
    destaque: "Seu sábado merece um sabor especial"
  }
];
</script>

<template>
  <section class="promocoes-bloco">

    <div class="cabecalho-promocoes">
      <div>
        <span class="mini-titulo">APROVEITE</span>
        <h2 class="titulo-sessao">Promoções da semana</h2>
      </div>

      <span class="seta-titulo">
        <i class="fas fa-tags"></i>
      </span>
    </div>

    <div class="grade-promocoes">

      <RouterLink
        v-for="promo in promocoes"
        :key="promo.id"
        :to="{ path: '/menu', query: { categoria: promo.categoria } }"
        class="promo-card"
      >

        <div class="promo-imagem">

          <img
            :src="promo.imagem"
            :alt="promo.titulo"
            class="promo-img"
          >

          <div class="imagem-overlay"></div>

          <span class="selo-promo">
            <i class="fas fa-percent"></i>
            OFERTA
          </span>

          <span class="dia-promo">
            {{ promo.dia }}
          </span>

        </div>

        <div class="promo-info">

          <span class="categoria-promo">
            {{ promo.categoria }}
          </span>

          <h3>
            {{ promo.titulo }}
          </h3>

          <p>
            {{ promo.destaque }}
          </p>

          <div class="promo-link">
            <span>Ver ofertas</span>
            <i class="fas fa-arrow-right"></i>
          </div>

        </div>

      </RouterLink>

    </div>

  </section>
</template>

<style scoped>
.promocoes-bloco {
  width: 100%;
  padding: 8px 0 28px;
  box-sizing: border-box;
}

.cabecalho-promocoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  margin-bottom: 15px;
}

.mini-titulo {
  display: block;
  margin-bottom: 3px;
  color: #bba270;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.titulo-sessao {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.1;
}

.seta-titulo {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f4ecdf;
  color: #6a3828;
  font-size: 14px;
}

.grade-promocoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

.promo-card {
  display: block;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #eee5da;
  border-radius: 20px;
  text-decoration: none;
  box-shadow: 0 5px 16px rgba(94, 48, 35, 0.07);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(94, 48, 35, 0.13);
}

.promo-card:active {
  transform: scale(0.97);
}

.promo-imagem {
  position: relative;
  width: 100%;
  height: 125px;
  overflow: hidden;
  background: #eee4d7;
}

.promo-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.promo-card:hover .promo-img {
  transform: scale(1.06);
}

.imagem-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(55, 30, 22, 0.05),
    rgba(55, 30, 22, 0.42)
  );
  pointer-events: none;
}

.selo-promo {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 8px;
  background: #5e3023;
  color: #ffffff;
  font-size: 0.57rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.selo-promo i {
  font-size: 8px;
  color: #e1c98f;
}

.dia-promo {
  position: absolute;
  right: 9px;
  bottom: 9px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #5e3023;
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.promo-info {
  padding: 13px 13px 14px;
}

.categoria-promo {
  display: block;
  margin-bottom: 4px;
  color: #bba270;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.promo-info h3 {
  margin: 0;
  color: #5e3023;
  font-family: "Imprima", Georgia, serif;
  font-size: 1.02rem;
  font-weight: 800;
  line-height: 1.15;
}

.promo-info p {
  min-height: 30px;
  margin: 6px 0 11px;
  color: #88776a;
  font-size: 0.7rem;
  line-height: 1.35;
}

.promo-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6a3828;
  font-size: 0.7rem;
  font-weight: 800;
}

.promo-link i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #f4ecdf;
  font-size: 9px;
  transition: transform 0.2s ease;
}

.promo-card:hover .promo-link i {
  transform: translateX(3px);
}

@media (max-width: 380px) {
  .grade-promocoes {
    gap: 10px;
    padding: 0 12px;
  }

  .promo-imagem {
    height: 110px;
  }

  .promo-info {
    padding: 11px;
  }

  .promo-info h3 {
    font-size: 0.93rem;
  }

  .promo-info p {
    font-size: 0.65rem;
  }

  .dia-promo {
    font-size: 0.52rem;
  }
}

@media (max-width: 320px) {
  .grade-promocoes {
    grid-template-columns: 1fr;
  }

  .promo-imagem {
    height: 150px;
  }
}
</style>
