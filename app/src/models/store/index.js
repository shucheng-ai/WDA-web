import Vue from 'vue';
import Vuex from 'vuex';
import ProjectStore from './project';
import ConfigStore from './config';
import CadStore from './cad';
import StorageStore from './storage';
import CanvasStore from './canvas';
import RequestStore from './request';
import AnimationStore from './animation';

Vue.use(Vuex);

const Store = new Vuex.Store({
  modules: {
    project: ProjectStore,
    config: ConfigStore,
    cad: CadStore,
    storage: StorageStore,
    request: RequestStore,
    canvas: CanvasStore,
    animation: AnimationStore,
  },
});

export default Store;
