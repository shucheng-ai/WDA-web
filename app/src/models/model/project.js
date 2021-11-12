import Requests from '../../libs/requests';
import BaseModel from './base';
import { create_random } from '../../components/v2/project.utils';

const API = '/api/project';

class ProjectModel extends BaseModel {
  constructor() {
    super();
    this.api = API;
    this.data = null;
  }

  async getProject(id) {
    let api = `${API}?id=${id}`;
    return await Requests.get(api);
  }

  async getProjectCadData(id) {
    let api = `${API}/cad?id=${id}`;
    return await Requests.get(api);
  }

  async getProjectFile(id, path) {
    let api = `${API}/file?id=${id}&path=${path}`;
    return await Requests.get(api);
  }

  async getProjectInfoData(id, type) {
    let api = `${API}/info?id=${id}&type=${type}`;
    return await Requests.get(api);
  }

  async getProjectCadInfo(ids) {
    let api = `${API}/info?type=cad&ids=${ids}`;
    return await Requests.get(api);
  }

  async getProjectStorageInput(id) {
    let api = `${API}/storage_input?id=${id}`;
    return await Requests.get(api);
  }
  async postProjectStorageInput(formdata) {
    let api = `${API}/storage_input`;
    return await Requests.post(api, formdata);
  }
  async deleteProjectStorageInput(formdata) {
    let api = `${API}/storage_input`;
    return await Requests.delete(api, formdata);
  }

  async postProjectHistory(formdata) {
    let api = `${API}/history`;
    return await Requests.post(api, formdata);
  }

  async deleteProjectHistory(formdata) {
    let api = `${API}/history`;
    return await Requests.delete(api, formdata);
  }

  async getProjectHistory(id, session_id) {
    let api = `${API}/history?id=${id}&session_id=${session_id}`;
    return await Requests.get(api);
  }

  async getRoomHistory(id) {
    let api = `${API}/room?id=${id}`;
    return await Requests.get(api);
  }

  async postRoomInfo(formdata) {
    let api = `${API}/room`;
    return await Requests.post(api, formdata, {
      showWait: false,
    });
  }

  async getConnectionItemHistory(id) {
    let api = `${API}/connection_item?id=${id}`;
    return await Requests.get(api);
  }

  async postConnectionItemInfo(formdata) {
    let api = `${API}/connection_item`;
    return await Requests.post(api, formdata, {
      showWait: false,
    });
  }

  async getProjectList(page, limit, order_by, reverse) {
    let api = `${API}/list?page=${page}&limit=${limit}&order_by=${order_by}&reverse=${reverse}`;
    // let api = `${API}/list?page=${page}&order_by=${order_by}&reverse=${reverse}`;
    return await Requests.get(api);
  }

  async createProject(formdata) {
    let api = `${API}`;
    return await Requests.post(api, formdata);
  }

  async deleteProject(formdata) {
    let api = `${API}`;
    return await Requests.delete(api, formdata);
  }

  async updateProject(formdata) {
    let api = `${API}`;
    return await Requests.put(api, formdata, { showWait: false });
  }

  async postSomeInfo(formdata) {
    let api = `${API}/some/info`;
    return await Requests.post(api, formdata, { showWait: false });
  }

  async download3D(id) {
    let api = `${API}/download3D?project_id=${id}&backup=0`;
    return await Requests.get(api);
  }

  async downloadCad(id) {
    let api = `${API}/downloadCad?project_id=${id}`;
    return await Requests.get(api);
  }

  async postFixturesData(formdata) {
    let api = `${API}/fixtures`;
    return await Requests.post(api, formdata, { showWait: false });
  }

  async getFixturesData(id) {
    let random = create_random();
    let api = `${API}/fixtures?id=${id}&random=${random}`;
    return await Requests.get(api, null, { showWait: false });
  }

  async deleteConnectionItem(formdata) {
    let api = `${API}/room_data`;
    return await Requests.delete(api, formdata);
  }
}

const Project = new ProjectModel();

export default Project;
