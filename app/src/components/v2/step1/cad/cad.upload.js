import JSZip from 'jszip';
import { RequestUPLOAD } from '@/libs/requests';

const UPLOAD_CAD_URL = '/api/project/upload?type=zip&source=cad&';

async function compressCad(file) {
  let zip = new JSZip();
  zip.file('wda.dxf', file);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });
}

async function uploadCad(info) {
  this.loading = true;
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
    var data = new FormData();
    data.append('file', content, 'data.zip');
    RequestUPLOAD(api, data, config).then((resp) => {
      this.loading = false;
      this.disable_upload = false;
      this.upload_finished = true;
      this.disable_decode = false;
      this.filename = resp.data.data.filename;
      this.$message.success('upload success');
    });
  });
}

export { uploadCad };
