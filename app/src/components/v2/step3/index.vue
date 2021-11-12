<template>
  <div>
    <a-card
      :bordered="true"
      style="padding: 10px 24px"
      class="bg-white button-box"
    >
      <a-dropdown>
        <a-menu slot="overlay" @click="download">
          <a-menu-item key="cad">
            <a-icon type="file" />Download CAD
          </a-menu-item>
          <a-menu-item key="gltf">
            <a-icon type="file" />Download GLTF
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          Download <a-icon type="download" />
        </a-button>
      </a-dropdown>

      <!-- <a-tooltip title="Download Cad" placement="top" trigger="hover">
        <a-button type="primary" @click="downloadCad">Download CAD</a-button>
      </a-tooltip> -->

      <a-tooltip title="3D Preview" placement="top" trigger="hover">
        <a-button
          @click="jump3d"
          style="color: #a6514e; border-color: color: #a6514e; margin-left: 20px"
          >3D Preview</a-button
        >
      </a-tooltip>
    </a-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { create_random } from '../project.utils';

export default {
  computed: {
    ...mapState({
      project: (state) => state.project,
    }),
  },

  data() {
    return {
      project_id: this.$route.query.id,
    };
  },

  methods: {
    download(e) {
      console.log('e: ', e);
      if (e.key === 'cad') {
        this.downloadCad();
      } else if (e.key === 'gltf') {
        this.download3D();
      }
    },

    downloadCad() {
      let random = create_random(8);
      window.location.href = `/api/project/downloadCad?project_id=${this.project_id}&random=${random}`;
    },

    download3D() {
      // this.$model.project.download3D(this.project_id);
      let random = create_random(8);
      window.location.href = `/api/project/download3D?project_id=${this.project_id}&random=${random}`;
    },

    jump3d() {
      let origin =
        process.env.NODE_ENV === 'production'
          ? location.origin
          : 'http://localhost:8081';
      let url = `${origin}/3d?project_id=${this.project_id}&app=v2`;
      window.open(url);
    },
  },
};
</script>

<style scoped lang="less">
@import './index.less';
</style>
