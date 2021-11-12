const RequestStore = {
  state: {
    requestCount: 0,
    prevRequsetEndTime: 0,
    requestEndTimer: null,
    loading: false,
    loadingText: 'Loading..',
  },
  getters: {
    requestCount(state) {
      return state.requestCount;
    },
    prevRequsetEndTime(state) {
      return state.prevRequsetEndTime;
    },
    requestEndTimer(state) {
      return state.requestEndTimer;
    },
    loading(state) {
      return state.loading;
    },
  },
  mutations: {
    SET_LOADING: (state, loading) => {
      state.loading = loading;
    },
    SET_LOADING_TEXT: (state, loadingText) => {
      state.loadingText = loadingText;
    },
    ADD_REQUEST_COUNT: (state) => {
      state.requestCount = state.requestCount + 1;
    },
    SUBTRACT_REQUEST_COUNT: (state) => {
      state.requestCount = state.requestCount - 1;
      if (state.requestCount < 0) state.requestCount = 0;
    },
    SET_REQUEST_END_TIMER: (state, requestEndTimer) => {
      state.requestEndTimer = requestEndTimer;
    },
    SET_PREV_REQUEST_END_TIME: (state, prevRequsetEndTime) => {
      state.prevRequsetEndTime = prevRequsetEndTime;
    },
  },
};

export default RequestStore;
