const ProjectStore = {
  state: {
    // id: -1,
    project_id: -1,
    hash: null,
    data: {},
    showFeedbackModal: false,
  },
  mutations: {
    updateProject(state, data) {
      state.data = data;
    },
    initProject(state, data) {
      state.project_id = data.project_id;
    },
    SET_SHOWFEEDBACKMODAL(state, data) {
      state.showFeedbackModal = data;
    },
  },
};

export default ProjectStore;
