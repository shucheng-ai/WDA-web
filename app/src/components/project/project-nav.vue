<template>
  <nav>
    <div style="cursor: pointer;color: black">
      <router-link
        to="/projects"
        class="ui-nav-item"
        style="color: black"
        title="go back project list"
      >
        WDA
      </router-link>
    </div>
    <div>
      <input
        class="project-title"
        type="text"
        @keypress="rename"
        @keydown="rename"
        @keyup="rename"
        v-model="project.name"
      />
      <a-icon style="display: inline; margin-left: -20px" type="edit" />
    </div>
    <div style="position: absolute;right: 10px;top:0; display: inline-block;">
      <input
        type="text"
        id="demoInput"
        v-model="project.snapshot_link"
        style="width:10px;opacity: 0;"
      />
      <a-button
        type="primary"
        @click="saveProject"
        size="small"
        style="display: inline-block;margin-right: 10px;"
      >
        Save
      </a-button>
      <a-button
        @click="copyProject"
        size="small"
        style="display: inline-block;margin-right: 10px;"
      >
        Copy Project
      </a-button>
      <a-button type="dashed" size="small" @click="coypSnapshot"
        >copy link</a-button
      >
    </div>
  </nav>
</template>

<script>
// import {
//   renameProjectRequest,
//   saveProjectRequest,
//   createProjectRequest
// } from '../../api/project';

export default {
  name: 'project-nav',
  props: ['project', 'show', 'projectSession'],
  methods: {
    saveProject() {
      // this.show.main_loading = true;
      // let project_id = this.project.id;
      // let res = saveProjectRequest(null, {
      //   project_id: project_id,
      //   session_id: this.projectSession.session_id
      // });
      // res.then(data => {
      //   this.show.main_loading = false;
      //   if (data.status == 1) {
      //     let new_session_id = data.data.new_session_id;
      //     console.info(data.data);
      //     this.projectSession.session_id = new_session_id;
      //     this.project.snapshot_link = `http://${location.host}/project/${project_id}?mode=edit&version=${new_session_id}`;
      //     this.$message.success('save project success.');
      //   } else {
      //     this.$message.error('save project fail.');
      //   }
      // });
    },
    rename() {
      console.log('rename: ');
      this.is_edit = true;
      if (this.timeout_event) {
        clearTimeout(this.timeout_event);
      }
      this.timeout_event = setTimeout(() => {
        if (this.is_edit) {
          this.is_edit = false;
          const params = {
            id: this.$store.state.project.project_id,
            name: this.project.name,
          };
          let res = this.$model.project.updateProject(params);
          res.then((resp) => {
            this.$message.success(`Project renamed ${this.project.name}`);
          });
          // renameProjectRequest(null, {
          //   project_id: this.project.id,
          //   name: this.project.name
          // });
        }
      }, 2000);
    },
    coypSnapshot() {
      // document.execCommand('copy');
      // const input = document.querySelector('#demoInput');
      // input.select();
      // if (document.execCommand('copy')) {
      //   document.execCommand('copy');
      //   this.$notification.success({
      //     message: 'copy snapshot link success',
      //     description: `${this.project.snapshot_link}`
      //   });
      // }
    },
    copyProject() {
      // let father_id = this.project.id;
      // let father_name = this.project.name;
      // let res = createProjectRequest(null, {
      //   project: null,
      //   session: { session_id: 'init' },
      //   father_id: father_id,
      //   father_name: father_name
      // });
      // res.then(data => {
      //   let uri = `/project/${data.data.id}?mode=edit&version=master&`;
      //   window.open(uri);
      // });
    },
  },
  data() {
    return {
      is_edit: false,
      timeout_event: null,
    };
  },
};
</script>

<style scoped lang="less">
nav {
  position: fixed;
  box-sizing: content-box;
  top: 0;
  left: 0;
  width: 100%;
  height: 35px;
  line-height: 35px;
  padding: 3px 5px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  z-index: 99;

  div {
    display: inline-block;
    box-sizing: border-box;
    margin-right: 10px;
    height: 35px;
  }

  .project-title {
    box-sizing: border-box;
    width: 350px;
    height: 35px;
    outline: none;
    border: none;
    padding-left: 10px;
    padding-right: 20px;
    border-radius: 3px;

    &:hover {
      border: solid 1px #e8e8e8;
    }

    &:focus {
      border: solid 2px #662020;
    }
  }
}
</style>
