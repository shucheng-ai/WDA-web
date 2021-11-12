<template>
  <div class="cad-output">
    <projectCadGraph
      :project="project"
      :projectSession="projectSession"
      :width="width"
      :height="height"
      :show="show"
      ref="projectCadGraph"
    />
  </div>
</template>

<script>
import projectCadGraph from './cad.graph';
import { createDriver } from '../../../components/sc-graph/driver';

import * as d3 from 'd3';

const MARK_LAYER_NAME = 'MARK_LAYER';
export default {
  name: 'project-cad',
  props: ['project', 'projectSession', 'show'],
  components: {
    projectCadGraph,
  },
  created() {
    let width = window.innerWidth - 450 - 30 - 30;
    console.log('width: ', width);
    this.width = `${width}px`;
    this.project.svg.width = width;
    let height = window.innerHeight - 38 - 50 - 10;
    console.log('height: ', height);
    this.height = `${height}px`;
    this.project.svg.height = height;
    this.project.svg.base_svg_id = 'BaseSVG';
  },
  data() {
    return {
      width: 1000,
      height: 1000,
      tempSelector: {},
      cascaderValue: [],
    };
  },
  methods: {
    zoom(i) {
      this.$refs.projectCadGraph.zoomSvg(i);
    },
    changeOrder(index) {
      const func = () => {
        let item = d3.select(
          `.mark-${this.project.cad.svg.temp.bbox.join('-')}`
        );
        console.log(item);
        if (index > 0) {
          item.raise(); // item 到最后面了，就是显示层级的最高级
        } else {
          item.lower(); // item 到最前面了，就是显示层级的最低级
        }
        this.project.cad.svg.edit_mask_modal = false;
      };
      console.log(d3.select('.mark-temp').size());
      if (d3.select('.mark-temp').size() > 0) {
        this.$refs.projectCadGraph.reset();
        setTimeout(() => {
          this.$forceUpdate();
          func();
        }, 200);
      } else {
        func();
      }
    },

    onChangeType(arr) {
      console.log(arr);
      this.cascaderValue = arr;
      // this.project.cad.svg.temp.layer = arr[0]; // layer 暂时为null
      this.project.cad.svg.temp.type = arr[1];
    },
    formatMarkOptions() {
      // let origin = {
      //   MARK_FUNCTION: [
      //     'GUARD_OBSTACLE',
      //     'HINT_DOCK',
      //     'HINT_DOCK_IN',
      //     'HINT_DOCK_OUT'
      //   ],
      //   CAD_ELEMENT: ['CAD_ADD', 'CAD_REMOVE']
      // };
      let origin = this.project.cad.annotation_types;
      let result = [];

      for (var key in origin) {
        result.push({
          value: key,
          label: key,
          children: this.formatChild(origin[key]),
        });
      }
      return result;
    },
    formatChild(arr) {
      let children = [];
      arr.forEach((item) => {
        children.push({
          value: item,
          label: item,
        });
      });
      return children;
    },
    selectLayer(value) {
      this.project.cad.svg.temp.layer = value;
    },
    selectType(value) {
      this.project.cad.svg.temp.type = value;
    },
    cancelMark() {
      this.reset();
    },
    reset(clear = true) {
      if (clear) {
        d3.select(`.temp-${this.project.cad.svg.temp.bbox[0]}`).remove();
      }
      this.cascaderValue = [];
      this.project.cad.svg.temp.type = null;
      this.project.cad.svg.temp.layer = '';
      this.project.cad.svg.temp.bbox = [];
    },
    createMark() {
      console.log('ok');
      this.project.cad.annotations.push(
        Object.assign({}, this.project.cad.svg.temp)
      );
      let that = this;
      let mark_layer = null;
      let mark_index = -1;
      let obj = this.getPathObj();
      let a_index = this.project.cad.active_navigation;
      let bbox = this.project.cad.navigation[a_index].bbox;

      this.project.cad.layers.forEach((item, index) => {
        if (item.name === MARK_LAYER_NAME) {
          mark_layer = item;
          mark_index = index;
          return false;
        }
      });
      if (mark_index > -1) {
        mark_layer.top_view.paths.push(obj);
      } else {
        this.project.cad.layers.push({
          name: MARK_LAYER_NAME,
          isMark: true,
          show: true,
          bbox: bbox,
          top_view: {
            paths: [obj],
          },
        });
      }
      console.log(this.project.cad.svg.temp.bbox);

      // 确认后 将临时的polygon添加到svg中，让它们可以一起移动，当刷新后，此polygon会消失
      d3.select('#BASE-CAD-SVG>g')
        // .select('.cad-layer-mark')
        .append('polygon')
        .attr(
          'points',
          d3
            .select(`.temp-${this.project.cad.svg.temp.bbox[0]}>polygon`)
            .attr('points')
        )
        .attr(
          'class',
          `cad-layer-polygon CAD-LAYER-POLYGON-3-polygon color-mark mark-temp mark-${this.project.cad.svg.temp.bbox.join(
            '-'
          )}`
        )
        .attr('bbox', this.project.cad.svg.temp.bbox)
        .attr('type', this.project.cad.svg.temp.type)
        .attr('layer', this.project.cad.svg.temp.layer)
        .call(function(selection) {
          selection.on('dblclick', () => {
            // d3.select('.color-mark').on('dblclick', function() {
            console.log(selection);
            console.log(selection.attr('bbox').split(','));
            console.log(selection.attr('type'));
            console.log(selection.attr('layer'));
            that.project.cad.svg.temp.bbox = selection.attr('bbox').split(',');
            that.project.cad.svg.temp.type = selection.attr('type');
            that.project.cad.svg.temp.layer = selection.attr('layer');
            that.project.cad.svg.tempSelector = selection;
            that.project.cad.svg.edit_mask_modal = true;

            d3.event.preventDefault();
          });
          selection.on('mouseover', () => {
            if (!localStorage.hasMarkDriven) {
              const className = '.' + selection._groups[0][0].classList[4];
              console.log(selection);
              console.log(selection._groups[0][0].classList[4]);
              const steps = [
                {
                  element: className,
                  popover: {
                    title: 'More Function',
                    description:
                      'You can double click to delete or move front/back.',
                    position: 'right',
                  },
                },
              ];
              setTimeout(() => {
                let d = createDriver(
                  steps,
                  {
                    stageBackground: '#ffffff14',
                  },
                  this
                );
                localStorage.hasMarkDriven = true;
                console.log(d);
              }, 0);
            }
          });
          selection.on('mousemove', () => {
            d3.select('text').remove();
            let polygon = selection.attr('points');
            d3.select('#BASE-CAD-SVG>g')
              .append('text')
              .attr('id', 'text_mark')
              .attr('fill', 'white')
              .attr('text-anchor', 'middle')
              .style('font-size', '14px')
              .style('cursor', 'pointer')
              .attr('dy', 8)
              .text(selection.attr('type'))
              .attr(
                'x',
                (Number(polygon.split(' ')[0].split(',')[0]) +
                  Number(polygon.split(' ')[2].split(',')[0])) /
                  2
              )
              .attr('y', polygon.split(' ')[3].split(',')[1]);
          });
          selection.on('mouseout', () => {
            d3.select('#text_mark').remove();
          });
        });

      this.reset();
      this.project.cad.svg.show_mask_modal = false;
    },
    getPathObj(temp = this.project.cad.svg.temp) {
      return {
        color: 15,
        annotation: Object.assign({}, temp),
        points: [
          [+temp.bbox[0], +temp.bbox[1]],
          [+temp.bbox[0], +temp.bbox[3]],
          [+temp.bbox[2], +temp.bbox[3]],
          [+temp.bbox[2], +temp.bbox[1]],
        ],
      };
    },
    saveMark() {
      // 修改 annotations
      this.project.cad.annotations.forEach((item) => {
        if (item.bbox.join() === this.project.cad.svg.temp.bbox.join()) {
          item.layer = this.project.cad.svg.temp.layer;
          item.type = this.project.cad.svg.temp.type;
        }
      });
      // layer 不用修改，因为坐标没变

      this.project.cad.svg.tempSelector
        .attr('type', this.project.cad.svg.temp.type)
        .attr('layer', this.project.cad.svg.temp.layer);

      this.reset(false);
      this.project.cad.svg.edit_mask_modal = false;
    },
    deleteMark() {
      let that = this;
      this.$confirm({
        title: 'Confirm',
        content: 'Are you sure delete this mark',
        okText: 'Delete',
        cancelText: 'Cancel',
        onOk() {
          console.log('OK');
          // 删除 annotations
          that.project.cad.annotations = that.project.cad.annotations.filter(
            (item) => {
              return item.bbox.join() !== that.project.cad.svg.temp.bbox.join();
            }
          );

          // 删除layer
          let pathObj = that.getPathObj(that.project.cad.svg.temp);
          console.log(pathObj.points.join());
          console.log('==: ');
          that.project.cad.layers.forEach((item) => {
            if (item.name === MARK_LAYER_NAME) {
              let paths = item.top_view.paths;
              item.top_view.paths = paths.filter((path) => {
                console.log(path.points.join());
                return path.points.join() !== pathObj.points.join();
              });
              console.log(item.top_view.paths);
            }
          });

          // 删除图像
          that.project.cad.svg.tempSelector.remove();
          that.reset(false);
          that.project.cad.svg.edit_mask_modal = false;
        },
        onCancel() {
          console.log('Cancel');
          that.reset(false);
          that.project.cad.svg.edit_mask_modal = false;
        },
      });
    },
  },
};
</script>

<style scoped lang="less">
.cad-output {
  padding: 0 10px;
}
</style>
