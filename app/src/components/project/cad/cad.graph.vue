<template>
  <div class="output-graph" :style="{ width: width, height: height }">
    <div class="graph-menu" id="graphMenu">
      <section class="left-menu" style="display: inline-block">
        <a-tooltip placement="topLeft" title="Reset" arrowPointAtCenter>
          <a-icon type="reload" class="icon" @click="reset" />
        </a-tooltip>
        <a-tooltip placement="topLeft" title="Zoom Out" arrowPointAtCenter>
          <a-icon
            type="zoom-out"
            class="icon"
            @click="zoomSvg(-1)"
            :class="{ disabled: project.cad.svg.zoom.ratio === ScaleList[0] }"
          />
        </a-tooltip>
        <a-tooltip placement="topLeft" title="Zoom In" arrowPointAtCenter>
          <a-icon
            type="zoom-in"
            class="icon"
            @click="zoomSvg(1)"
            :class="{
              disabled:
                project.cad.svg.zoom.ratio === ScaleList[ScaleList.length - 1],
            }"
          />
        </a-tooltip>
      </section>

      <div style="float: right">
        <a-dropdown placement="bottomRight">
          <p
            class="ant-dropdown-link"
            style="cursor: pointer; color: #fff"
            v-show="project.new.dxf_path[0].navigation.length > 0"
          >
            Navigate Canvas to
            <a-icon type="down" />
          </p>
          <a-menu
            slot="overlay"
            :style="{
              display: 'flex',
              background: 'transparent',
              flexWrap: 'wrap',
              width: width,
              justifyContent: 'flex-end',
            }"
            @click="changeNavCanvas"
          >
            <a-menu-item
              v-for="(navigation, index) in project.new.dxf_path[0].navigation"
              :key="index"
              :value="index"
              :class="{ active: index === project.cad.active_navigation }"
            >
              <a href="javascript:;"
                ><img
                  alt="thumbnail"
                  :src="navigation.image"
                  slot="cover"
                  style="cursor: pointer"
                  class="thumbnail"
                />
                <p class="navigation-name">{{ navigation.room }}</p>
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <div class="opt-box">
      <a-button
        class="opt-button"
        icon="plus"
        :type="optMode === 'obstacle' ? 'primary' : 'default'"
        @click="clickOpt('obstacle')"
        >Obstacle</a-button
      >
      <a-button
        class="opt-button"
        icon="plus"
        :type="optMode === 'path' ? 'primary' : 'default'"
        @click="clickOpt('path')"
        >Path</a-button
      >
      <a-button
        class="opt-button"
        icon="plus"
        :type="optMode === 'region' ? 'primary' : 'default'"
        @click="clickOpt('region')"
        >Region</a-button
      >
    </div>
    <div id="cadSvg"></div>
    <div id="cadPng"></div>
  </div>
</template>

<script>
import { drawCadSvg } from './index.event';
// import svgIcon from 'vue-svg-icon/Icon.vue';
import * as d3 from 'd3';
import { getNumFixed } from '../../../components/sc-graph/utils';

const ScaleList = [0.5, 0.75, 1, 1.5, 2, 3, 5];

export default {
  name: 'project-output-graph',
  props: ['project', 'projectSession', 'width', 'height', 'show'],
  components: {
    // svgIcon,
  },
  computed: {
    returnError() {
      let flag = true;
      // if (
      //   this.project.cad.navigation === undefined ||
      //   this.project.cad.navigation.length < 1
      // ) {
      //   this.$message.error('cad anlyze failed');
      //   flag = false;
      // }
      return flag;
    },
  },
  methods: {
    reset() {
      if (!this.returnError) {
        return false;
      }
      this.moveToRoom();
    },
    changeNavCanvas(e) {
      this.project.cad.active_navigation = e.key;
      this.moveToRoom();
    },
    zoomSvg(i) {
      if (!this.returnError) {
        return false;
      }

      this.loading();

      let scale = 1;
      let index = this.scale_index + i;
      let errorFlag = false;
      if (index >= ScaleList.length) {
        index = ScaleList.length - 1;
        errorFlag = true;
      }
      if (index < 0) {
        index = 0;
        errorFlag = true;
      }
      if (errorFlag) {
        this.show.main_loading = false;
        return false;
      }
      scale = ScaleList[index];
      this.scale_index = index;

      let menuNode = d3.select('#graphMenu').node();

      let cadNode = d3
        .select('#CAD-LAYOUT-BBOX-RECT-rect')
        .node()
        .getBBox();

      // 求此时svg中点坐标
      console.log('cadNode: ', cadNode);

      // 以svg固定中点为中心进行缩放！
      let midpoint_x = getNumFixed(this.project.svg.width / 2, 2);
      let midpoint_y = getNumFixed(
        (this.project.svg.height + menuNode.offsetHeight) / 2,
        2
      );

      console.log('midpoint_x: ', midpoint_x);
      console.log('midpoint_y: ', midpoint_y);

      // 求左上角按中心缩放后的坐标
      /**
       * 原理
       * 如果是以(x0,y0)为中心进行缩放变换，相当于先把原点平移到(x0,y0)，然后以原点为中心进行变换，最后将原点再移回去。* 对应公式为(x¯,y¯)=((x−x0)∗sx+x0,(y−y0)∗sy+y0)
       */
      let new_scale_x =
        ((cadNode.x - midpoint_x) / this.project.cad.svg.zoom.ratio) * scale +
        midpoint_x;
      let new_scale_y =
        ((cadNode.y - midpoint_y) / this.project.cad.svg.zoom.ratio) * scale +
        midpoint_y;
      console.log('new_scale_x: ', new_scale_x);
      console.log('new_scale_y: ', new_scale_y);

      // 根据放缩后的实际坐标，两者相差即是需要平移的距离

      this.project.cad.svg.zoom.ratio = scale;

      setTimeout(() => {
        drawCadSvg.call(
          this,
          this.project.new,
          this.project.cad.active_navigation,
          'drag',
          {
            x: new_scale_x,
            y: new_scale_y,
          }
        );
      }, 0);
    },
    moveToRoom() {
      if (!this.returnError) {
        return false;
      }
      this.loading();

      this.scale_index = 2;
      this.project.cad.svg.zoom.ratio = 1;
      const g_id = 'BASE-CAD-G';
      let transform = d3.zoomTransform(d3.select(`#${g_id}`).node());
      transform.x = 0;
      transform.y = 0;
      transform.k = 1;
      d3.select(`#${g_id}`).attr('transform', transform);

      setTimeout(() => {
        this.project.cad.layers.forEach((item) => {
          if (item.isMark) {
            item.bbox = this.project.cad.navigation[
              this.project.cad.active_navigation
            ].bbox;
            return false;
          }
        });

        // drawCadSvg.call(
        //   this,
        //   {
        //     navigation: this.project.cad.navigation,
        //     classes: this.project.cad.classes,
        //     layers: this.project.cad.layers,
        //   },
        //   this.project.cad.active_navigation
        // );
        drawCadSvg.call(
          this,
          this.project.new,
          this.project.cad.active_navigation
        );

        // 刷新的时候重置偏移量
        // this.project.cad.svg.remove.x = 0;
        // this.project.cad.svg.remove.y = 0;
      }, 0);
    },
    dragFlagChange(checked) {
      let info = checked
        ? 'You can drag canvas now'
        : 'You can select area and mark function. Dragging canvas is disabled';
      // if (!checked) {
      //   this.$message.info('Double click on the mark can be deleted');
      // }
      this.$message.info(info);

      this.project.cad.svg.canDrag = checked;
    },
    loading() {
      this.show.main_loading = true;
    },
    clickOpt(type) {
      if (this.optMode === type) {
        this.optMode = 'drag';
        this.project.cad.svg.canDrag = true;
      } else {
        this.optMode = type;
        this.project.cad.svg.canDrag = false;
      }
    },
  },
  data() {
    return {
      scale_index: 2,
      optMode: 'drag',
    };
  },
  created() {
    this.ScaleList = ScaleList;
    let that = this;
    setTimeout(() => {
      drawCadSvg.call(
        that,
        that.project.new,
        this.project.cad.active_navigation
      );
    }, 400);
  },
};
</script>

<style scoped lang="less">
.output-graph {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 1000px;
  height: 1000px;
  background: #333333;
  padding: 0;
  overflow: auto;
  border-radius: 8px;

  .graph-menu {
    position: absolute;
    box-sizing: border-box;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
    line-height: 24px;
    background: #111;
    color: #ff4d4f;
    opacity: 0.9;
    padding: 3px 10px;
    z-index: 8;
    border-bottom: solid 1px #ff4d4f;
  }
}

.icon {
  display: inline-block;
  cursor: pointer;
  margin: 0 5px;
  &.disabled {
    color: #999;
  }
}

#svg {
  width: 100%;
  height: 100%;
}

select {
  outline: none;
}
.mouse-desc {
  margin-right: 8px;
  color: #fff;
}
.center-menu {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
/deep/ .ant-switch {
  background-color: #fff;
  &.ant-switch-checked {
    background-color: #993030;
    &::after {
      background-color: #fff;
    }
    .ant-switch-inner {
      color: #fff;
    }
  }
  &::after {
    background-color: #993030;
  }
  .ant-switch-inner {
    color: #993030;
  }
}
.thumbnail {
  // display: inline-block;
  margin-bottom: 10px;
  height: 80px;
  /*width: 220px;*/
}
.navigation-name {
  text-align: center;
}
.active {
  .navigation-name {
    color: #1f77b4;
  }
}
.ant-dropdown-placement-bottomRight {
  left: 0 !important;
}
.svg-icon {
  vertical-align: middle;
  margin: 0 5px;
  width: 24px;
  height: 24px;
  fill: #fff;
  padding: 3px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  background: #222;
  cursor: pointer;
  border-radius: 4px;
}
.function-tip {
  font-size: 12px;
  color: #999;
  margin: 0 10px;
  display: inline-block;
  width: 400px;
}
.opt-box {
  position: absolute;
  left: 20px;
  top: 60px;
  z-index: 9;
  display: flex;
  flex-direction: column;
}

.opt-button {
  margin: 10px 0;
  text-align: inherit;
}
</style>
