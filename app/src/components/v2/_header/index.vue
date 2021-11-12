<template>
  <div class="project-header">
    <div class="project-header-item" style="cursor: pointer;color: black">
      <a
        :href="homepage"
        class="ui-nav-item"
        style="color: black"
        title="go back project list"
      >
        <a-icon type="left" />
        WDA
      </a>
    </div>
    <div class="project-header-item">
      <input
        class="project-header-input"
        type="text"
        @keypress="rename"
        @keydown="rename"
        @keyup="rename"
        v-model="project.data.name"
      />
      <a-icon style="display: inline; margin-left: -20px" type="edit" />
    </div>
    <div
      class="project-header-item"
      style="position: absolute;right: 0px;top:2px; display: inline-block;"
    >
      <a-button
        type="primary"
        size="small"
        style="display: inline-block;margin-right: 10px;"
        @click="jumpFeedback"
      >
        Contact Us
      </a-button>
      <!-- <a-button size="small" style="display: inline-block;margin-right: 10px;">
        Copy Project
      </a-button> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'project-header-index',
  props: ['project'],
  mounted() {
    this.$request.get("/api/config").then((_config)=>{
      this.homepage = _config.data.homepage;
    })
  },
  data() {
    return {
      homepage: "#",
      is_edit: false,
      timeout_event: null,
    };
  },
  methods: {
    rename() {
      this.is_edit = true;
      if (this.timeout_event) {
        clearTimeout(this.timeout_event);
      }
      this.timeout_event = setTimeout(() => {
        if (this.is_edit) {
          this.is_edit = false;
          const params = {
            id: this.$store.state.project.project_id,
            name: this.project.data.name,
          };
          let res = this.$model.project.updateProject(params);
          res.then((resp) => {
            this.$message.success(`Project renamed ${this.project.data.name}`);
          });
        }
      }, 2000);
    },

    jumpFeedback() {
      let uuid = 'c08a85ea-543a-410f-8fe8-d3f0b613cebf'; // layout 其他
      let feedbackUrl = `https://feedback.shucheng-ai.com/feedback?id=${uuid}`;
      window.open(`${feedbackUrl}&target=${location.href}`);
    },
  },
};
</script>

<style scoped>
@import 'index.css';
</style>
