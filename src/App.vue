<template>
  <div id="app">
    <MainNavbar />
    <router-view /> <!-- This is where route components will render -->
    <MainFooter />
    <a href="#" class="back-to-top" title="Back to top">⬆</a>
  </div>
</template>

<script>
import MainNavbar from './components/MainNavbar.vue';
import MainFooter from './components/FooterSection.vue'; // ✅ Make sure this name matches the file

export default {
  components: {
    MainNavbar,
    MainFooter
  }
};
</script>

<style>
/* Optional global styles */
</style>
