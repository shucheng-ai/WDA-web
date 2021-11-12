import axios from 'axios';
import store from '../models/store';
import { message, notification } from 'ant-design-vue';

let timeout = 1000 * 60 * 2; // 60*2秒超时
const requestContinue = 100; // 继发请求间隔时间

const ERROR_MSG = {
  1: 'Server not responding, try again later.\n', // 服务器超时 === 504
};

const getErrorPage = (errorList) => {
  let BASE_DOCS_PAGE = 'http://121.36.245.75:39889/wda/';
  let result = '';
  if (errorList.length > 0) {
    errorList.forEach((error) => {
      result = `#${error.error_type}`;
    });
  }
  return BASE_DOCS_PAGE + result;
};

const getErrorDesc = (msg, errorList) => {
  let result = `${msg}
  `;
  if (errorList.length > 0) {
    result += 'errors: \n';
    errorList.forEach((error) => {
      result += `error_type: ${error.error_type}
      `;
    });
  }
  return result;
};

const baseRequests = async (api, data, method, config) => {
  method = method ? method : 'get';
  // let now = new Date();
  const promise = new Promise(function(resolve, reject) {
    const defaultConfig = {
      showWait: true, // 是否需要显示等待
      headers: {
        'Content-Type': 'application/json', // 通常情况
        // 'Content-Type': 'multipart/form-data', // 上传
      },
    };
    config = { ...defaultConfig, ...config };
    let axios_config = {
      method: method,
      url: api,
      timeout: timeout,
      data: data,
    };
    if (config) {
      axios_config.config = config;
    }

    // 请求拦截器
    axios.interceptors.request.use(
      (config) => {
        if (config.config.showWait) {
          const {
            requestCount,
            prevRequsetEndTime,
            requestEndTimer,
          } = store.state.request;
          const nowTime = +new Date();
          if (nowTime - prevRequsetEndTime < requestContinue) {
            clearTimeout(requestEndTimer);
          } else if (requestCount === 0) {
            store.commit('SET_LOADING', true);
          }
          store.commit('ADD_REQUEST_COUNT');
        }
        return config;
      },
      (err) => {
        if (config.config.showWait) {
          store.commit('SUBTRACT_REQUEST_COUNT');
          const { requestCount } = store.state.request;
          if (requestCount === 0) {
            const timer = setTimeout(() => {
              store.commit('SET_LOADING', false);
            }, requestContinue);
            store.commit('SET_REQUEST_END_TIMER', timer);
          }
        }

        return Promise.resolve(err);
      }
    );

    // 响应拦截器
    axios.interceptors.response.use(
      (data) => {
        if (data.config.config.showWait) {
          store.commit('SUBTRACT_REQUEST_COUNT');
          store.commit('SET_PREV_REQUEST_END_TIME', +new Date());
          const { requestCount } = store.state.request;
          if (requestCount === 0) {
            const timer = setTimeout(() => {
              store.commit('SET_LOADING', false);
            }, requestContinue);
            store.commit('SET_REQUEST_END_TIMER', timer);
          }
        }
        if (data.data.status !== 1) {
          let pageHref = getErrorPage(data.data.errors);
          let desc = getErrorDesc(data.data.msg, data.data.errors);
          notification.error({
            message: 'Server Error',
            duration: 10,
            description: desc,
            btn: (h) => {
              return h(
                'a-button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                  },
                  on: {
                    click: () => window.open(pageHref),
                  },
                },
                'Detail'
              );
            },
            onClose: close,
          });
          return Promise.reject(data);
        }
        return data;
      },
      (err) => {
        console.log('响应拦截到error：', err);
        // 都 error了，data.config可能就不存在了
        // if (data.config.config.showWait) {
        store.commit('SUBTRACT_REQUEST_COUNT');
        const { requestCount } = store.state.request;
        if (requestCount === 0) {
          const timer = setTimeout(() => {
            store.commit('SET_LOADING', false);
          }, requestContinue);
          store.commit('SET_REQUEST_END_TIMER', timer);
        }
        // }
        return Promise.reject(err);
      }
    );

    let service = axios(axios_config);

    service.then(
      (res) => {
        resolve(res);
      },
      (e) => {
        message.error(`${api} request fail.`);
        console.warn(`${api} request fail.`);
        reject({ status: -1, err_msg: ERROR_MSG });
      }
    );
  });
  return promise;
};

const RequestGET = function(api, data, config) {
  return baseRequests(api, data, 'get', config);
};

const RequestPOST = function(api, data, config) {
  return baseRequests(api, data, 'post', config);
};

const RequestPUT = function(api, data, config) {
  return baseRequests(api, data, 'put', config);
};

const RequestDELETE = function(api, data, config) {
  return baseRequests(api, data, 'delete', config);
};

const RequestUPLOAD = (api, data, config) => {
  return baseRequests(api, data, 'post', config);
};

const Request = {
  get: RequestGET,
  post: RequestPOST,
  put: RequestPUT,
  delete: RequestDELETE,
  upload: RequestUPLOAD,
};

export { RequestGET, RequestPOST, RequestPUT, RequestDELETE, RequestUPLOAD };
export default Request;
