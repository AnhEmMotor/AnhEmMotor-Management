<template>
  <SectionContainer :section="section" @back="goOverview" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SectionContainer from "./layout/SectionContainer.vue";
import { guideSections } from "./data/guideSections";

const route = useRoute();
const router = useRouter();

const section = computed(() => {
  return (
    guideSections.find((s) => s.id === route.params.id) ?? guideSections[0]
  );
});

function goOverview() {
  router.push("/factory/manual");
}
</script>

<style scoped lang="scss">
/* section detail page styles */
</style>
