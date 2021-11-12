<template>
  <a-layout-header
    :style="{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 999,
      width: '100%',
      height: '45px'
    }"
  >
    <div class="logo">
      <img src="../../assets/images/logo.png" width="100px" />
    </div>

    <a-menu
      theme="dark"
      mode="horizontal"
      :defaultSelectedKeys="['2']"
      :style="{ lineHeight: '45px' }"
    >
      <a-menu-item key="home">
        <router-link to="/" class="ui-nav-item">Projcets</router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script>
export default {
  name: 'SC-Nav'
};
</script>

<style scoped>
.logo {
  display: inline-block;
  width: 150px;
  height: 45px;
  float: left;
  color: white;
  font-size: 28px;
  cursor: pointer;
  /* margin: -9px -55px; */
  margin: 0 -55px;
}
</style>
