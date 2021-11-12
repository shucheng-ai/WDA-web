import JSZip from 'jszip';
import { RequestUPLOAD } from '@/libs/requests';
import Request from '@/libs/requests';

const UPLOAD_CAD_URL = '/api/project/upload?type=zip&source=cad&';
const CAD_EVENT_URL = '/api/event/cad';

async function compressCad(file) {
  let zip = new JSZip();
  let _filename = file.name.split(".");
  let filetype = _filename[_filename.length-1]
  zip.file(`wda.${filetype}`, file);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });
}

async function uploadCad(info) {
  // this.loading = true;
  this.$store.commit('SET_LOADING', true);
  this.$store.commit('SET_LOADING_TEXT', 'Compress..(1/4 Steps)');

  this.disable_upload = true;
  this.upload_finished = false;
  this.filename = '';
  const project_id = this.$route.query.id;
  let file = info.file;
  let config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  let real_name = info.file.name;
  let api = `${UPLOAD_CAD_URL}filename=${real_name}&project_id=${project_id}&cad_type=dxf&`;

  let compress_res = compressCad(file);
  compress_res.then((content) => {
    this.$store.commit('SET_LOADING_TEXT', 'Uploading..(2/4 Steps)');
    var data = new FormData();
    data.append('file', content, 'data.zip');
    RequestUPLOAD(api, data, config).then((resp) => {
      // this.loading = false;
      this.disable_upload = false;
      this.upload_finished = true;
      this.disable_decode = false;
      this.filename = resp.data.data.filename;
      this.$message.success('upload success');
      decodeCad.call(this);
    });
  });
}

async function decodeCad() {
  // this.loading = true;
  this.$store.commit('SET_LOADING_TEXT', 'Analyzing..(3/4 Steps)');
  this.disable_decode = true;
  const project_id = this.$route.query.id;
  let command = 'encode';
  const formdata = {
    project_id,
    command,
  };
  Request.post(CAD_EVENT_URL, formdata)
    .then(() => {
      // this.loading = false;
      // this.$store.commit('SET_LOADING', false);
      this.$store.commit('SET_LOADING_TEXT', 'Loading..(4/4 Steps)');

      this.disable_decode = false;
      this.$message.success('decode success');
      // 通知页面更新数据
      this.$emit('init'); //通过$emit触发父组件

      // const project_id = this.$route.query.id;
      // let url = `/v2/project/step2?id=${project_id}&step=1`;
      // this.$router.push(url);
    })
    .catch(() => {
      console.log('Analyzing error');
      this.$store.commit('SET_SHOWFEEDBACKMODAL', true);
      this.loading = false;
      this.disable_decode = false;
    });
}

export { uploadCad };
