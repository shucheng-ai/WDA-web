// import {
//   getProjectRequest,
//   createProjectRequest,
//   deleteProjectRequest,
//   getProjectCADRequest,
// } from '../../api/project';

// import { makerandom } from '../../lib/utils';

function getProjects() {
  // 获取project 列表
  gotoPage.call(this, 1);
}

function gotoProject(item) {
  let uri = `/v2/project/step2?id=${item.id}&step=1`;
  this.$router.push(uri);
}

function gotoPage(pageNumber) {
  let [_sort, _limit, _reverse] = [
    this.config.project_sort,
    this.config.project_limit,
    this.config.project_reverse,
  ];
  const projects = this.$model.project.getProjectList(
    pageNumber,
    _limit,
    _sort,
    _reverse
  );
  projects.then((data) => {
    this.page = data.data.data.pageinfo.page;
    this.total = data.data.data.pageinfo.total;
    this.list = data.data.data.list;

    let ids = [];
    this.list.forEach((item) => {
      ids.push(item.id);
    });
    let _ids = JSON.stringify(ids);
    const cad = this.$model.project.getProjectCadInfo(_ids);
    cad.then((resp) => {
      let cadList = resp.data.data;
      this.list.forEach((item, index) => {
        cadList.forEach((cadItem) => {
          if (cadItem.project_id * 1 === item.id * 1) {
            this.list[index]['cad'] = cadItem.cad;
          }
        });
      });
    });
  });
}

function refreshUpdate() {
  this.sort = 'update_date';
  gotoPage.call(this, this.page);
}

function refreshID() {
  this.sort = 'id';
  gotoPage.call(this, this.page);
}

function createProject() {
  this.show.main_loading = true;
  let res = this.$model.project.createProject({
    // master: null,
  });
  res.then((data) => {
    this.show.main_loading = false;
    let uri = `/v2/project/step2?id=${data.data.data.id}&step=1`;
    this.$router.push(uri);
  });
}

function copyProject(item) {
  this.show.main_loading = true;
  console.log(item);
  let res = this.$model.project.createProject({
    master: item.id,
  });
  res.then((data) => {
    this.getProjects();

    setTimeout(() => {
      this.$message.success(
        `Copy Success. Project copied as '${data.data.data.name}' .`
      );
      this.$refs.tbody.children[0].className += ' focus';
    }, 1000);

    setTimeout(() => {
      this.$refs.tbody.children[0].className -= ' focus';
    }, 5000);
  });
}

function deleteProject(item) {
  this.show.delete_modal = true;
  this.tempProject = item;
}

function deleteModal() {
  this.show.main_loading = true;
  // let res = deleteProjectRequest(`?project_id=${this.tempProject.id}`);
  let res = this.$model.project.deleteProject({
    id: this.tempProject.id,
  });
  res.then(() => {
    this.$message.success(`Delete '${this.tempProject.name}' Success.`);
    this.show.main_loading = false;
    this.show.delete_modal = false;
    this.getProjects();

    // const projects = getProjectRequest(
    //   `?page=1&sort=update_date&desc=1&random=${makerandom()}`
    // );
    // projects
    //   .then((data) => {
    //     // this.projects.list = data.data.projects;
    //     this.projects.page = data.data.page;
    //     this.projects.total = data.data.total_count;
    //     let projectIdList = [];
    //     data.data.projects.forEach((item) => {
    //       projectIdList.push(item.id);
    //     });
    //     this.$message.success(`Delete '${this.projectName}' Success.`);
    //     if (projectIdList.length > 0) {
    //       const projectsCad = getProjectCADRequest(
    //         `?project_id_list=[${projectIdList}]`
    //       );
    //       projectsCad
    //         .then((res) => {
    //           let list = res.data;
    //           data.data.projects.forEach((item) => {
    //             let cadObj = list.find((e) => {
    //               return item.id == e.project_id;
    //             });
    //             Object.assign(item, { cadInfo: cadObj });
    //           });
    //         })
    //         .finally(() => {
    //           this.projects.list = data.data.projects;
    //           this.tempProject = {
    //             id: '',
    //             name: '',
    //           };
    //           this.projectName = '';
    //         });
    //     } else {
    //       this.projects.list = data.data.projects;
    //     }
    //   })
    //   .finally(() => {
    //     this.show.main_loading = false;
    //   });
  });
}

function cancelModal() {
  this.tempProject = {
    id: '',
    name: '',
  };
  this.projectName = '';
  this.show.delete_modal = false;
}

function init() {
  this.getProjects = getProjects.bind(this);
  this.gotoProject = gotoProject.bind(this);
  this.gotoPage = gotoPage.bind(this);
  this.refreshUpdate = refreshUpdate.bind(this);
  this.refreshID = refreshID.bind(this);
  this.createProject = createProject.bind(this);
  this.copyProject = copyProject.bind(this);
  this.deleteProject = deleteProject.bind(this);
  this.deleteModal = deleteModal.bind(this);
  this.cancelModal = cancelModal.bind(this);
}

export { init };
