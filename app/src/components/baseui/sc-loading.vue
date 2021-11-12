<template>
  <div>
    <a-spin
      :tip="loadingText"
      :spinning="spinning"
      :delay="delayTime"
      class="loading"
      size="large"
    >
    </a-spin>
  </div>
</template>

<script>
export default {
  name: 'sc-loading',
  props: {
    spinning: {
      type: Boolean,
      default: true,
    },
    loadingText: {
      type: String,
      default: 'Loading..',
    },
    delayTime: {
      // 延迟显示 loading 效果。当 spinning 状态在 delay 时间内结束，则不显示 loading 状态
      type: Number,
      default: 10,
    },
  },
};
</script>

<style scoped lang="less">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999;
}
</style>
