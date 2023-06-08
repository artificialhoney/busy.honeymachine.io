<template>
  <FadeToBlack />
</template>

<script>
import FadeToBlack from './components/FadeToBlack.vue';

export default {
  name: 'App',
  components: {
    FadeToBlack,
  },
};
</script>

<style>
body {
  margin: 0;
  background: black;
}
</style>
