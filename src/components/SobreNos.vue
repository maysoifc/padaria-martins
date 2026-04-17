<template>
  <section class="historia-container">
  <h2 class="titulo-historia">Nossa História: Tradição e amor em cada fornada</h2>

  <div class="historia-conteudo">
    <div class="moldura-foto">
    <img src="/img/historia.jpeg" alt="Padaria Martins" class="foto-historia">
    </div>

    <div class="texto-historia">
    <p>
    A Padaria Martins nasceu do sonho de levar o pão artesanal à mesa de cada vizinho.
    Com receitas de gerações, honramos o cuidado no preparo e a escolha dos melhores ingredientes.
    Cada fornada é um compromisso com o seu café da manhã.
    </p>
    </div>
  </div>
  <div class="whatsapp-section">
  <a href="https://www.whatsapp.com/" target="_blank" class="whatsapp-btn">
  <i class="fa-brands fa-whatsapp"></i>
        WhatsApp Comercial
  </a>
  </div>
  </section>
</template>
<style scoped>
.historia-container {
  padding: 32px 16px;
}

.titulo-historia {
  color: #5E3023;
  font-family: 'Imprima';
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 4px;
  max-width: 90%;
  margin-top: 0;
  margin-left: 20px;
}

.historia-conteudo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 10px;
}

.moldura-foto {
  width: 100%;
  max-width: 350px;
  background-color: #F5F0E6;
  border-radius: 24px;
  padding: 8px;
  box-shadow: 04px 12px rgba(0, 0, 0, 0.05);
}

.foto-historia {
  width: 100%;
  height: 200px;
  border-radius: 28px;
  object-fit: cover;
  filter: grayscale(30%);
  display: block;
}


.texto-historia{
  width: 100%;
}

.texto-historia p{
  color: #5E3023;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
  text-align: left;
  border-left: 4px solid #B89764;
  padding: 8px 0 8px 16px;
}

.whatsapp-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-bottom: 40px;
}

.whatsapp-btn {
  background-color: #25d366;
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  margin-bottom: 20px;
}

.whatsapp-btn:active{
  transform: scale(0.95);
}
.whatsapp-btn i{
  font-size: 1.5rem;
}
</style>
