import Requests from '../../libs/requests';
import BaseModel from './base';

const API = '/api/project/cad?';

const EVENT_API = '/api/event';

class CadModel extends BaseModel {
  constructor() {
    super();
    this.api = API;
    this.data = null;
  }

  // this.$model.cad.getCadDecodeDxf('666');
  async getCadDecodeDxf(id) {
    // 获取已有dxf数据
    let api = `${API}id=${id}`;
    return await Requests.get(api);
  }

  // this.$model.cad.decodeCadDxf({id: '999'});
  async decodeCadDxf(formdata) {
    // 计算新dxf数据
    let api = `${EVENT_API}/decode_dxf`;
    return await Requests.post(api, formdata);
  }

  async calculateProjectPlan(formdata) {
    // 拖拽storage img后计算排列货架API接口
    let api = `${EVENT_API}/project/plan`;
    return await Requests.post(api, formdata);
  }

  async generateGreenfield(formdata) {
    // greenfield api
    let api = `${EVENT_API}/greenfield`;
    return await Requests.post(api, formdata);
  }
}

const Cad = new CadModel();

export default Cad;
