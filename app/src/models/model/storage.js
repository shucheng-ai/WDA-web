import Requests from '../../libs/requests';
import BaseModel from './base';
import store from '../store/index';
const API = '/api/storage';

class StorageModel extends BaseModel {
  constructor() {
    super();
    this.api = API;
    this.list = [];
    this.form = [];
  }

  async getList() {
    let api = `${API}?type=list&project_id=${store.state.project.project_id}`;
    return await Requests.get(api);
  }

  async getForm(name, save_type) {
    let api = `${API}?type=storage&name=${name}&project_id=${store.state.project.project_id}&save_type=${save_type}`;
    return await Requests.get(api);
  }

  async SaveStorage(formdata) {
    let api = `${API}/?`;
    return await Requests.post(api, formdata);
  }

  async DeleteStorage(formdata) {
    let api = `${API}/?`;
    return await Requests.delete(api, formdata);
  }

  async getStorageImg(formdata) {
    let api = `${API}/img`;
    return await Requests.post(api, formdata);
  }
}

const Storage = new StorageModel();

export default Storage;
