<template>
  <router-view> </router-view>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
body {
  background: #f3f3f3 !important;
}

::-webkit-scrollbar {
  height: 0;
  width: 0;
}
/* 辅助点样式 */
.has-assist {
  cursor: move !important;
}
/* .newnode {
  pointer-events: painted;
} */
.assist-node-LT {
  cursor: nw-resize !important;
}
.assist-node-T {
  cursor: n-resize !important;
}
.assist-node-RT {
  cursor: ne-resize !important;
}
.assist-node-R {
  cursor: e-resize !important;
}
.assist-node-RB {
  cursor: se-resize !important;
}
.assist-node-B {
  cursor: s-resize !important;
}
.assist-node-LB {
  cursor: sw-resize !important;
}
.assist-node-L {
  cursor: w-resize !important;
}
</style>
