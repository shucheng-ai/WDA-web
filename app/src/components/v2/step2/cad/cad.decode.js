import Request from '@/libs/requests';

const CAD_EVENT_URL = '/api/event/cad';

async function decodeCad(flag = true) {
  this.loading = true;
  this.disable_decode = true;
  const project_id = this.$route.query.id;
  let command = 'encode';
  const formdata = {
    project_id,
    command,
  };
  Request.post(CAD_EVENT_URL, formdata)
    .then(() => {
      this.loading = false;
      this.disable_decode = false;
      this.$message.success('decode success');
      const project_id = this.$route.query.id;
      if (flag) {
        let url = `/v2/project/step2?id=${project_id}&step=1`;
        this.$router.push(url);
      }
    })
    .catch(() => {
      this.loading = false;
      this.disable_decode = false;
    });
}

export { decodeCad };
