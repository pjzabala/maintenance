<template>
  <div>
    <!-- NAVBAR -->
    <header>
      <div class="navbar" :class="{ scrolled: isScrolled }" id="navbar">
        <div class="nav-left">
          <router-link to="/">
            <img
              src="https://www.dmciholdings.com/storage/app/media/2023/Investment/New/fdmci-powertransparentnew0331.png"
              alt="Logo"
            />
          </router-link>
          <span>PALAWAN MAINTENANCE</span>
        </div>

        <div class="hamburger" @click="toggleMenu">&#9776;</div>

        <div class="nav-right" :class="{ active: menuOpen }">
          <div class="nav-item">
            <router-link to="/" class="nav-item">Home</router-link>
          </div>

          <div class="nav-item dropdown-wrapper">
            <span class="nav-item">NARRA THERMAL 1 ▼</span>
            <div class="dropdown">
              <p><router-link to="/equipment-status">Equipment Status</router-link></p>
              <p><a href="#">Maintenance Schedule</a></p>
              <p><a href="#">History Records</a></p>
              <p><a href="#">Technical Info</a></p>
              <p><a href="#">DPTPP PMS 2025</a></p>
            </div>
          </div>

          <div class="nav-item">
            <router-link to="/aborlan-bunker1" class="nav-item">ABORLAN BUNKER 1</router-link>
          </div>
          <div class="nav-item">
            <router-link to="/hs-diesel" class="nav-item">HS DIESEL PP</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <main>
      <div class="hero-section">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="hero-text">
              <h1>NARRA<span class="highlight">THERMAL 1</span></h1>
            </div>
            <div class="hero-buttons side">
              <router-link to="/equipment-status" class="hero-btn">EQUIPMENT STATUS</router-link>
              <router-link to="" class="hero-btn">MAINTENANCE SCHEDULE</router-link>
              <router-link to="" class="hero-btn">GENERATE WORK ORDER</router-link>
              <router-link to="" class="hero-btn">METRICS</router-link>
              <router-link to="" class="hero-btn">INFORMATION</router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <h3>Palawan Maintenance</h3>
          <p>Narra Thermal 1, Aborlan Bunker 1, HS Diesel PP</p>
          <p>DMCI Power Corporation – Palawan Operations</p>
        </div>

        <div class="footer-center">
          <p><strong>Email:</strong> maintenance@dmcipower.com</p>
          <p><strong>Phone:</strong> +63 (48) 123-4567</p>
          <p><strong>Office Hours:</strong> Mon–Fri, 8:00AM–5:00PM</p>
        </div>

        <div class="footer-right">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/equipment-status">Equipment Status</router-link></li>
            <li><a href="#">Maintenance Schedule</a></li>
            <li><a href="#">History Records</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 Palawan Maintenance. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import "@/assets/style.css";

/* Add any component-scoped styles here if needed */
</style>
