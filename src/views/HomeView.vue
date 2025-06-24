<template>
  <div>
    <HeroSection />
    <MissionSection />
    <VisionSection />
  </div>
</template>

<script>
import HeroSection from "@/components/HeroSection.vue";
import MissionSection from "@/components/MissionSection.vue";
import VisionSection from "@/components/VisionSection.vue";

export default {
  components: { HeroSection, MissionSection, VisionSection }
};
</script>
