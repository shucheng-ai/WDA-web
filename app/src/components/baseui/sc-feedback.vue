<template>
  <div>
    <a-modal
      v-model="$store.state.project.showFeedbackModal"
      :title="title"
      :footer="null"
      :maskClosable="false"
      class="feedback-modal"
      :width="800"
    >
      <!-- <div class="option-box">
        <div class="option-button" @click="close">
          <div class="option-header">
            <span class="header-text">Option 1: Try again</span>
          </div>
          <div class="circle"></div>
        </div>
        <div class="option-content">
          <p>Quick guidelines to better prepare your CAD file before upload:</p>
          <ul class="ul-box">
            <li class="li-item">Remove unrelevent layers</li>
            <li class="li-item">Walls outlines be connected</li>
            <li class="li-item">Same structural elements put in same layer</li>
            <li class="li-item">
              Use English words "Walls", "Doors", "Columns" etc for special
              layers
            </li>
          </ul>
        </div>
      </div>

      <div class="option-box">
        <div class="option-button" @click="jumpToFeedback()">
          <div class="option-header">
            <span class="header-text"
              >Option 2: Request for Advanced Analyzing</span
            >
          </div>
          <div class="circle"></div>
        </div>
        <div class="option-content">
          <ul class="ul-box">
            <li class="li-item">Up to 2 days of waiting for result</li>
            <li class="li-item">
              CAD will be added to your Libray automatically
            </li>
            <li class="li-item">Check your Library for analyzing status</li>
          </ul>
        </div>
      </div> -->

      <a-card title="Option 1: Try again">
        <!-- <a-button  type="primary" @click.stop="upload">
          Upload Again
        </a-button> -->
        <a-upload
          slot="extra"
          name="file"
          accept=".dxf, .dwg"
          :multiple="true"
          :showUploadList="false"
          :defaultFileList="null"
          :before-upload="beforeUpload"
          :customRequest="upload"
        >
          <a-button :disabled="disable_upload">
            <a-icon type="upload" />
            Upload Again(.dxf .dwg)
          </a-button>
        </a-upload>
        <div class="option-content">
          <p>Quick guidelines to better prepare your CAD file before upload:</p>
          <ul class="ul-box">
            <li class="li-item">Remove unrelevent layers</li>
            <li class="li-item">Walls outlines be connected</li>
            <li class="li-item">Same structural elements put in same layer</li>
            <li class="li-item">
              Use English words "Walls", "Doors", "Columns" etc for special
              layers
            </li>
          </ul>
        </div>
      </a-card>

      <a-card title="Option 2: Request for Advanced Analyzing">
        <a-button slot="extra" type="primary" @click.stop="jumpToFeedback">
          Submit Request
        </a-button>
        <div class="option-content">
          <ul class="ul-box">
            <li class="li-item">Up to 2 days of waiting for result</li>
            <li class="li-item">
              CAD will be added to your Libray automatically
            </li>
            <li class="li-item">Check your Library for analyzing status</li>
          </ul>
        </div>
      </a-card>

      <!-- <p>{{ errorText }}</p>
      <p>
        You can give your own feedback in
        <a-button
          @click="jumpToFeedback()"
          style="border-color: #a6514e; color: #a6514e"
          >Here</a-button
        >
      </p> -->
    </a-modal>
  </div>
</template>

<script>
import Cad from '../v2/step2/cad/index';

export default {
  name: 'sc-feedback',
  props: {
    errorText: {
      type: String,
      default: 'Sorry',
    },
    title: {
      type: String,
      default: 'Error',
    },
  },
  data() {
    return {
      loading: false,
      disable_upload: false,
      disable_decode: true,
      upload_finished: false,
      filename: '',
    };
  },
  created() {
    const cad = new Cad();
    this.upload = cad.upload.bind(this);
    this.decode = cad.decode.bind(this);
  },
  methods: {
    close() {
      console.log(' this.$parent: ', this.$parent);
      this.$store.commit('SET_SHOWFEEDBACKMODAL', false);
    },
    beforeUpload() {
      console.log('beforeUpload: ');
      this.close();
    },
    jumpToFeedback() {
      this.close();
      let feedbackUrl =
        'https://feedback.shucheng-ai.com/feedback?id=7e5cfbe0-8b11-11eb-8e28-931e528dd17c';

      // window.open(`http://feedback.shucheng-ai.com/?id=1&target=${location.href}`)
      window.open(`${feedbackUrl}&target=${location.href}`);
    },
  },
};
</script>

<style scoped lang="less">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999;
}
.ant-card-bordered {
  border: 1px solid #e8e8e8 !important;
}
.ant-card:first-child {
  margin-bottom: 20px;
}

.option-box {
  // border: 1px solid #eee;
  margin-bottom: 30px;
  .option-button {
    cursor: pointer;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 2px solid #eee;
    .header-text {
      font-size: 24px;
      color: #333;
    }
    .circle {
      width: 18px;
      height: 18px;
      border: 2px solid @primary-color;
      border-radius: 100%;
    }
    &:hover {
      .header-text {
        color: @primary-color;
      }
      .circle {
        background: @primary-color;
      }
      border: 2px solid @primary-color;

      text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
      box-shadow: 0 2px 0 rgb(0 0 0 / 5%);
    }
  }
}
.option-content {
  // margin: 10px 20px;
  font-size: 14px;
  color: #666;
}
.ul-box {
  list-style: circle;
  margin-left: 20px;
  .li-item {
    display: list-item;
    line-height: 24px;
  }
}
</style>
