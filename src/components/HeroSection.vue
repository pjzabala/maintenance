<template>
  <div class="hero-section">
    <div class="hero-overlay">
      <div class="hero-content">
        <div class="hero-text">
          <h1>PALAWAN<br /><span class="highlight">MAINTENANCE</span></h1>
          <p>NARRA THERMAL · ABORLAN BUNKER · HS DIESEL</p>
        </div>
        <div class="hero-buttons side">
          <router-link to="/narra-thermal1" class="hero-btn">NARRA THERMAL 1</router-link>
          <router-link to="/aborlan-bunker1" class="hero-btn">ABORLAN BUNKER 1</router-link>
          <router-link to="/hs-diesel" class="hero-btn">HS DIESEL</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HeroSection",
};
</script>
