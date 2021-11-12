<template>
  <section>
    <main class="main">
      <div class="button-box">
        <div class="button-item">
          <a-upload
            name="file"
            accept=".dxf, .dwg"
            :multiple="true"
            :showUploadList="false"
            :defaultFileList="null"
            :customRequest="upload"
          >
            <a-button :disabled="disable_upload">
              <a-icon type="upload" />
              upload CAD file(.dxf)
            </a-button>
          </a-upload>

          <a-icon
            slot="indicator"
            spin
            v-show="disable_upload"
            type="loading"
            class="icon-loading"
          />
          <a-icon
            v-show="upload_finished"
            type="check-circle"
            theme="twoTone"
            two-tone-color="#52c41a"
            :style="{ fontSize: '24px', margin: '0 10px' }"
          />
        </div>
        <p class="filename">{{ filename }}</p>
        <div class="button-item">
          <a-button v-on:click="decode" :disabled="disable_decode">
            decode Cad
          </a-button>
          <a-icon
            slot="indicator"
            spin
            v-show="upload_finished && loading"
            type="loading"
            class="icon-loading"
          />
        </div>
      </div>
      <div class="greenfield-box">
        <div class="button-item">
          <a-button v-on:click="initGreenfield">
            Greenfield
          </a-button>
          <template v-if="show_greenfield">
            <a-button
              v-on:click="clearGreenfield"
              class="margin-left"
              icon="close"
            >
              Clear
            </a-button>
            <div class="margin-left">
              Ratio:
              <a-input-number v-model="ratio" />
            </div>
            <a-button
              v-on:click="generateGreenfield"
              type="primary"
              class="margin-left"
            >
              Generate Wall
            </a-button>
          </template>
        </div>
        <!-- <div v-if="show_greenfield" class="canvas-main"> -->
        <div class="canvas-main" v-if="show_greenfield">
          <SCCanvas ref="sc_canvas" class="canvas-box"></SCCanvas>
          <a-steps :current="4" direction="vertical" class="canvas-steps">
            <a-popover slot="progressDot" slot-scope="{ prefixCls }">
              <span :class="`${prefixCls}-icon-dot`" />
            </a-popover>
            <a-step
              v-for="(item, index) in this.$store.getters.truePointsArr"
              :key="index"
            >
              <template slot="title">
                x:
                <a-input-number
                  v-model="item.x"
                  @change="(e) => redrawCanvas(e)"
                />
                y:
                <a-input-number v-model="item.y" @change="redrawCanvas" />
              </template>
              <template slot="description">
                distance:
                <a-input-number
                  :value="getDistance(item, index)"
                  @change="(e) => blurDistance(e, index)"
                />
              </template>
            </a-step>
          </a-steps>
        </div>
      </div>
    </main>
    <div
      style="position: fixed;bottom: 20px;right: 20px;z-index: 999"
      v-show="loading"
    >
      <a-spin>
        <a-icon slot="indicator" type="loading" style="font-size: 36px" spin />
      </a-spin>
    </div>
  </section>
</template>

<script>
import Cad from './cad';
import Greenfield from './greenfield';

import SCCanvas from './greenfield/Canvas.vue';

export default {
  name: 'step1-index',
  components: {
    SCCanvas,
  },
  created() {
    const cad = new Cad();
    this.upload = cad.upload.bind(this);
    this.decode = cad.decode.bind(this);

    const greenfield = new Greenfield();
    this.initGreenfield = greenfield.init.bind(this);
    this.redrawCanvas = greenfield.redraw.bind(this);
    this.generateGreenfield = greenfield.generate.bind(this);
    this.clearGreenfield = greenfield.clear.bind(this);
    // this.getDistance = greenfield.getDistance.bind(this); // TODO 这种返回值不行
  },
  methods: {
    queryPointForDistance(x1, y1, x2, y2, d) {
      let _d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      let x, y;
      x = (d * (x2 - x1)) / _d + x1;
      y = (d * (y2 - y1)) / _d + y1;
      return { x, y };
    },
    blurDistance(e, index) {
      console.log('e: ', e, index);
      let current = this.$store.getters.truePointsArr[index];
      let next = this.$store.getters.truePointsArr[index + 1];
      let obj = this.queryPointForDistance(
        current.x,
        current.y,
        next.x,
        next.y,
        e
      );
      console.log('obj: ', obj);
      this.$store.commit('SET_POINTFORINDEX', { index: index + 1, point: obj });
      this.$forceUpdate();
      this.$refs.sc_canvas.render(this.$store.getters.truePointsArr);
    },
    getDistance(point, index) {
      let result = 0;
      if (this.$refs.sc_canvas === undefined) {
        return 0;
      }
      console.log('point: ', point);
      console.log('index: ', index);
      let arr = this.$store.getters.truePointsArr;
      if (index !== arr.length - 1) {
        result = this.$refs.sc_canvas.getTwoPointDistance(
          point.x,
          point.y,
          arr[index + 1].x,
          arr[index + 1].y,
          2
        );
      } else {
        result = this.$refs.sc_canvas.getTwoPointDistance(
          point.x,
          point.y,
          arr[0].x,
          arr[0].y,
          2
        );
      }
      console.log('result: ', result);
      return result;
    },
  },
  data() {
    return {
      name: 'cad',
      loading: false,
      disable_upload: false,
      disable_decode: true,
      upload_finished: false,
      show_greenfield: false,
      filename: '',
      ratio: 100,
    };
  },
};
</script>

<style scoped lang="less">
@import './index.less';
</style>
