<template>
  <div style="display: flex;box-shadow: 0px -1px 0 0 #e8e8e8 inset;">
    <a-steps
      v-model="current"
      type="navigation"
      size="small"
      :style="{ width: `${config.graph_width}px` }"
      @change="goto"
    >
      <!--        wait, process, finish, error-->
      <a-step status="finish" title="CAD Upload" />
      <a-step status="process" title="Interactive Calculation" />
      <a-step status="wait" title="Auto Calculation" />
    </a-steps>

    <div :style="{ width: `${config.table_width}px` }">
      <a-button-group style="line-height: 44px;float: right">
        <a-button type="primary" @click="goto(-1)">
          <a-icon type="left" />
          Previous Step
        </a-button>
        <a-button type="primary" @click="goto(-2)">
          Continue
        </a-button>
      </a-button-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'project-step-index',
  props: ['config'],
  watch: {
    //监听路由
    $route() {
      const step = this.$route.query.step ? this.$route.query.step : '0';
      this.current = parseInt(step);
    },
  },
  mounted() {
    const step = this.$route.query.step ? this.$route.query.step : '0';
    this.current = parseInt(step);
  },
  methods: {
    goto(current) {
      if (current === -1) {
        current = this.current > 0 ? this.current - 1 : 0;
      } else if (current === -2) {
        current = this.current < 2 ? this.current + 1 : 2;
      }
      this.current = current;
      const project_id = this.$route.query.id;
      let url = `/v2/project/step${current +
        1}?id=${project_id}&step=${current}`;
      this.$router.push(url);
    },
  },
  data() {
    return {
      current: 0,
    };
  },
};
</script>

<style scoped></style>
