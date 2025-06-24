<template>
  <header>
    <div class="navbar" :class="{ scrolled: isScrolled }" id="navbar">
      <div class="nav-left">
        <router-link to="/" class="nav-item">
          <img
            src="https://www.dmciholdings.com/storage/app/media/2023/Investment/New/fdmci-powertransparentnew0331.png"
            alt="logo"
          />
        </router-link>
        <span>PALAWAN MAINTENANCE</span>
      </div>

      <div class="hamburger" @click="toggleMenu">&#9776;</div>

      <div class="nav-right" :class="{ active: navActive }">
        <div class="nav-item">
          <router-link to="/" class="nav-item">Home</router-link>
        </div>

        <div class="nav-item dropdown-wrapper">
          <span class="nav-item">NARRA THERMAL 1 ▼</span>
          <div class="dropdown">
            <p><router-link to="/equipment-status" class="nav-item">Equipment Status</router-link></p>
            <p><a href="#">Maintenance Schedule</a></p>
            <p><a href="#">History Records</a></p>
            <p><a href="#">Technical Info</a></p>
            <p><a href="#">DPTPP PMS 2025</a></p>
          </div>
        </div>

        <div class="nav-item">
          <router-link to="/aborlan-bunker1" class="nav-item">Aborlan Bunker 1</router-link>
        </div>
        <div class="nav-item">
          <router-link to="/hs-diesel" class="nav-item">HS DIESEL PP</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "MainNavbar",
  data() {
    return {
      navActive: false,
      isScrolled: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },
    toggleMenu() {
      this.navActive = !this.navActive;
    },
  },
};
</script>

<style scoped>
/* Optional fallback or scoped overrides */
</style>
