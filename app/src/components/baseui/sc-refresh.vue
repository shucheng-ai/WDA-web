<template>
  <p>jumping ...</p>
</template>

<script>
export default {
  name: 'sc-footer',
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$router.replace(from.fullPath);
    });
  }
};
</script>

<style scoped></style>
