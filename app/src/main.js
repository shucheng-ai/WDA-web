import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import * as d3 from 'd3';

import Request from './libs/requests';
import Router from './router';
import Store from './models/store';
import Model from './models/model';
import Loading from './components/baseui/sc-loading.vue';
// 全局组件的使用

import {
  Button,
  Card,
  Collapse,
  Dropdown,
  Drawer,
  Icon,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Pagination,
  Radio,
  Steps,
  Select,
  Spin,
  Tooltip,
  Upload,
  message,
  notification,
  Form,
  FormModel,
  Popover,
  Tag,
  Checkbox,
} from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';
import './styles/main.less';

Vue.config.productionTip = false;

const ConfigComponents = [
  Button,
  Card,
  Collapse,
  Dropdown,
  Drawer,
  Icon,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Pagination,
  Radio,
  Steps,
  Select,
  Spin,
  Tooltip,
  Upload,
  Form,
  FormModel,
  Popover,
  Tag,
  Checkbox,
];

ConfigComponents.forEach((component) => {
  Vue.use(component);
});

Vue.use(VueRouter);

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
Vue.prototype.$request = Request;
Vue.prototype.$model = Model; // 异步请求封装 vuex commit 只能做同步操作
Vue.prototype.$confirm = Modal.confirm; // 异步请求封装 vuex commit 只能做同步操作
Vue.prototype.$d3 = d3;

Vue.component('Loading', Loading);

let vue = new Vue({
  el: '#app',
  router: Router,
  render: (h) => h(App),
  components: { App },
  store: Store,
});

export default vue;
