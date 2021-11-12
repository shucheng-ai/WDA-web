<template>
  <div>
    <ProjectHeader :project="project" />
    <div style="box-sizing: border-box;margin-top:35px;padding: 10px;">
      <!-- <ProjectStep :config="config" v-bind:project.sync="project" /> -->

      <!--            content      -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProjectHeader from './_header';
import ProjectStep from './_step';

export default {
  name: 'test-index',
  components: {
    ProjectHeader,
    // ProjectStep,
  },
  computed: mapState({
    project: (state) => state.project,
    config: (state) => state.config,
  }),
  mounted() {
    const project_id = this.$route.query.id;
    let auth_api = `/api/auth/project?project_id=${project_id}&`
    this.$request.get(auth_api).then((data)=>{
      if(data.data.data.is_auth){
        this.$store.commit('initConfig');

        let project_res = this.$model.project.getProject(project_id);
        project_res.then((data) => {
          this.$store.commit('updateProject', data.data.data);
        });
      }else {
        window.location.replace(data.data.data.errpage);
      }
    })
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
@import 'project.css';
</style>
