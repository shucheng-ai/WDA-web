import Vue from 'vue';

const CanvasStore = {
  state: {
    pointsArr: [],
  },
  getters: {
    truePointsArr(state) {
      return state.pointsArr.filter((item) => {
        return !item.fictitious;
      });
    },
  },
  mutations: {
    SET_POINTSARR: (state, pointsArr) => {
      state.pointsArr = pointsArr;
    },
    SET_POINTFORINDEX: (state, data) => {
      let { index, point } = data;
      let arr = state.pointsArr.filter((item) => {
        return !item.fictitious;
      });
      arr[index] = point;
      state.pointsArr = arr;
      // console.log('state.pointsArr: ', state.pointsArr);
      // state.pointsArr.splice(index, 1, point);
      // Vue.set(state.pointsArr, index, point);
    },
  },
};

export default CanvasStore;
