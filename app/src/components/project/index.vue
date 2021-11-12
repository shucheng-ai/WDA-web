<template>
  <div>
    <projectNav
      :project="project"
      :show="show"
      :projectSession="projectSession"
    />
    <main class="main-container" ref="main">
      <section class="main-top">
        <a-steps :current="1">
          <a-step>
            <!-- <span slot="title">Finished</span> -->
            <template slot="title">
              CAD Upload
            </template>
          </a-step>
          <a-step title="Interactive Calculation" />
          <a-step title="Auto Calculation" />
        </a-steps>
        <a-button-group>
          <a-button type="primary" @click="bingScale">
            <a-icon type="left" />Previous Step</a-button
          >
          <a-button type="primary" @click="addPng">
            Continue<a-icon type="right" />
          </a-button>
        </a-button-group>
      </section>
      <projectCad
        :show="show"
        :project="project"
        :projectSession="projectSession"
      />
      <a-modal
        v-model="direction_show"
        title="Region confirm"
        ok-text="Ok"
        cancel-text="Cancel"
        @ok="confirmDirection"
        @cancel="cancelDirection"
      >
        <a-radio-group :default-value="direction" v-model="direction">
          <a-radio value="vertical">
            Vertical
          </a-radio>
          <a-radio value="horizontal">
            Horizontal
          </a-radio>
        </a-radio-group>
      </a-modal>
    </main>
  </div>
</template>

<script>
import projectNav from './project-nav';
import projectCad from './cad';
import { defaultProject } from './index.data';
import { api_test } from './api.data';
import { getNumFixed } from '../sc-graph/utils';
import * as d3 from 'd3';

export default {
  name: 'project-index',
  components: {
    projectNav,
    projectCad,
  },
  data() {
    return {
      project: defaultProject(),
      projectSession: {
        id: null,
        session_id: null,
      },
      show: {
        loadingText: 'Loading...',
        main_loading: true,
        input_card: false,
        output: 'project', // project cad
      },
      direction_show: false,
      direction: 'vertical',
    };
  },
  created() {
    this.project['new'] = api_test().data;
    console.log(this.project);
    console.log(this.$store);
  },
  methods: {
    addPng() {
      const png_config = {
        width: 50,
        height: 50,
        url: 'http://placehold.it/1749x1510',
        margin: 20,
        class: 'storage-img',
      };
      let img_size = d3.selectAll(`.${png_config.class}`).size();
      let g_size = d3.select('#CAD-STORAGE-G').size();
      console.log('img_size: ', img_size);
      if (img_size === 0 && g_size === 0) {
        d3.select('#BASE-CAD-SVG>g')
          .append('g')
          .attr('id', 'CAD-STORAGE-G')
          .attr('class', 'cad-storage-g');
      }
      let storage = d3
        .select('#CAD-STORAGE-G')
        .append('svg:image')
        .attr('xlink:href', png_config.url)
        .attr('width', png_config.width)
        .attr('height', png_config.height)
        .attr('class', png_config.class)
        .attr(
          'x',
          this.project.svg.width -
            img_size * png_config.width -
            (img_size + 3) * png_config.margin
        )
        .attr('y', png_config.margin * 2);
      storage.call(
        d3
          .drag()
          .on('start', () => {}) // 拖动开始，触发一次
          .on('drag', draged) // 拖动中，触发多次
          .on('end', dragedEnd)
      ); // 拖动结束，触发一次
      let that = this;
      function draged() {
        const { x, y, dx, dy } = d3.event;

        d3.select(this)
          .attr('x', Number(d3.select(this).attr('x')) + dx)
          .attr('y', Number(d3.select(this).attr('y')) + dy);
      }

      function dragedEnd() {
        let imgNode = d3.select(this).node();
        console.log('this: ', this);
        console.log('imgNode: ', imgNode);
        let regionNodes = d3.selectAll('.cad-polygon-region').nodes();
        console.log('regionNodes: ', regionNodes);
        regionNodes.reverse().some((item, index) => {
          console.log(item.getBBox());
          let result = judgeRectIntersect(imgNode.getBBox(), item.getBBox());
          if (result) {
            d3.select(this).remove();
            that.direction_show = true;
            return result;
          }
        });
      }

      function judgeRectIntersect(a, b) {
        var a_min_x = a.x;
        var a_min_y = a.y;
        var a_max_x = a.x + a.width;
        var a_max_y = a.y + a.height;

        var b_min_x = b.x;
        var b_min_y = b.y;
        var b_max_x = b.x + b.width;
        var b_max_y = b.y + b.height;

        return (
          a_min_x <= b_max_x &&
          a_max_x >= b_min_x &&
          a_min_y <= b_max_y &&
          a_max_y >= b_min_y
        );
      }
    },
    bingScale() {
      // let s = d3
      //   .select('#BASE-CAD-G')
      //   .append('g')
      //   .attr('id', 'ass');
      // console.log('s: ', s);
      d3.select('#BASE-CAD-SVG>g').call(
        d3
          .zoom()
          .scaleExtent([0.5, 8])
          .on('zoom', zoomed)
      );
      function zoomed() {
        d3.event.transform.x = getNumFixed(d3.event.transform.x, 0);
        d3.event.transform.y = getNumFixed(d3.event.transform.y, 0);
        // d3.event.transform.k = getNumFixed(d3.event.transform.k, 2);
        d3.select(this).attr('transform', d3.event.transform);
        console.log(d3.event.transform);
        let g_id = 'BASE-CAD-G';
        // let node = d3.zoomTransform(this);
        let transform = d3.zoomTransform(d3.select(`#${g_id}`).node());
        console.log('transform: ', transform);
      }
    },
    confirmDirection() {
      this.direction_show = false;
    },
    cancelDirection() {},
  },
};
</script>

<style scoped lang="less">
.main-container {
  position: relative;
  top: 0;
  left: 0;
  padding-top: 42px;
  background: #f3f3f3;
}
.main-top {
  margin: 10px;
  display: flex;
  justify-content: space-between;
  .ant-steps {
    flex: 0.6;
  }
  .ant-btn-group {
    .ant-btn {
      margin-left: 10px;
    }
  }
}
</style>
