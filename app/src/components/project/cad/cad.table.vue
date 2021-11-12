<template>
  <div class="cad-box" :style="{ height: height }">
    <a-card
      :bordered="true"
      style="width:100%; margin-bottom: 10px"
      class="bg-white"
    >
      <a-button type="primary" @click="applyAnnotationCad">
        Apply Annotations
      </a-button>
    </a-card>
    <div class="cad-table">
      <table style="width: 100%">
        <thead class="ant-table-thead">
          <tr>
            <th class="middle" style="min-width: 82px;">
              <img
                :src="icon.see"
                class="middle"
                style="width: 20px;
              cursor:pointer"
                v-if="show_all"
                @click="showAll"
              />
              <img
                :src="icon.hide"
                class="middle"
                style="width: 20px;cursor:pointer;opacity: 0.3;"
                v-else
                @click="showAll"
              />
              <a-icon
                type="retweet"
                class="select-invert"
                @click="showInvert"
              />
            </th>
            <th
              class="ant-table-column-has-actions ant-table-column-has-sorters"
              :key="index"
              v-for="(key, index) in tableColumns"
            >
              <div class="ant-table-column-sorters">
                {{ key }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="ant-table-tbody">
          <tr
            class="ant-table-row ant-table-row-level-0"
            :key="index"
            v-for="(item, index) in project.cad.layers"
          >
            <td style="cursor: pointer" @click="showItem(item)" class="middle">
              <img
                :src="icon.see"
                class="middle"
                style="width: 20px"
                v-if="item.show"
              />
              <img
                :src="icon.hide"
                class="middle"
                style="width: 20px; opacity: .3;"
                v-else
              />
            </td>
            <td>
              {{ item.name }}
            </td>
            <td>
              <div class="select">
                <select name="class" v-model="item.class">
                  <option
                    v-for="(structure, index) in project.cad.classes"
                    :value="structure"
                    :key="index"
                  >
                    {{ structure }}
                  </option>
                </select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import svgSee from '../../../assets/svg/eye.svg';
import svgHide from '../../../assets/svg/hide.svg';
import { annotationCad, annotationsCad } from '../../../api/cad';
import { showTimeoutMsg } from '../index.event';
import { defaultRooms } from '../index.data';

export default {
  name: 'cad-table',
  props: ['project', 'projectSession', 'height', 'show'],
  methods: {
    reset() {
      // this.loading();
      // this.project.cad.svg.zoom.ratio = 1;

      this.$emit('zoom');
    },
    showItem(item) {
      item.show = !item.show;
      this.reset();
    },
    showAll() {
      this.show_all = !this.show_all;
      this.project.cad.layers.map(item => {
        item.show = this.show_all;
        return item;
      });
      this.reset();
    },
    // 反选
    showInvert() {
      this.project.cad.layers.map(item => {
        item.show = !item.show;
        return item;
      });
      this.reset();
    },
    loading() {
      this.show.main_loading = this.project.png_mode;
    },
    applyAnnotationCad() {
      console.log('applyAnnotationCad');
      console.log(this.project.cad.layers);
      this.show.main_loading = true;

      const param = {
        cad: this.project.cad,
        project_id: this.project.id,
        session_id: this.projectSession.session_id,
        api_version: this.project.api.version
      };

      this.project.cad.rooms = [];
      this.project.input.params.rooms = [];
      this.project.thumbnail_list = [];

      annotationsCad(param).then(
        resp => {
          console.log(resp);
          if (resp.status === 1) {
            let cadObj = {
              id: this.project.cad.id,
              filename: this.project.cad.name,
              md5name: this.project.cad.hashname,
              namelist: this.project.cad.namelist,
              is_upload: this.project.cad.is_upload,
              annotation_types: this.project.cad.annotation_types
            };
            let annotation_formdata = {
              cad: cadObj,
              project_id: this.project.id,
              session_id: this.projectSession.session_id,
              api_version: this.project.api.version
            };
            const cadResult = annotationCad(annotation_formdata);
            cadResult.then(
              data => {
                if (data.status === 1) {
                  this.show.input_card = true;
                  this.project.cad.upload_message =
                    'Annotation applied successful';
                  this.$message.success('CAD Annotation success.');
                  this.project.cad.choose_id = '0';
                  this.project.cad.rooms = [];
                  this.project.thumbnail_list = data.data.thumbnail_list;

                  let room_data = defaultRooms(
                    this.project.thumbnail_list.length
                  );
                  this.project.input.params.rooms = room_data.rooms;

                  for (let i = 0; i < this.project.thumbnail_list.length; i++) {
                    this.project.cad.rooms.push(i);
                  }
                  this.show.main_loading = false;
                } else {
                  this.$message.error('CAD Annotation fail!');
                  this.project.cad.upload_message = 'CAD Annotation fail!';
                  this.show.main_loading = false;
                }
              },
              res => {
                showTimeoutMsg.call(
                  this,
                  'CAD Annotation fail!(timeout)',
                  res.err_msg[2]
                );
              }
            );
          } else {
            this.show.main_loading = false;
            this.$message.error('CAD Annotation fail!');
          }
        },
        res => {
          showTimeoutMsg.call(
            this,
            'CAD Annotation fail!(reload timeout)',
            res.err_msg[2]
          );
        }
      );
    }
  },
  data() {
    return {
      tableColumns: ['Layers', 'Class'],
      show_all: true,
      icon: {
        see: svgSee,
        hide: svgHide
      }
    };
  }
};
</script>

<style scoped lang="less">
.cad-box {
  display: inline-block;
  box-sizing: border-box;
  width: 460px;
  vertical-align: top;
  overflow-y: auto;
  scrollbar-width: 10px;
  border-radius: 15px;
  margin-left: 10px;
}

.cad-table {
  display: inline-block;
  box-sizing: border-box;
  width: 440px;
  vertical-align: top;
  // margin-left: 10px;
  overflow-y: auto;
  scrollbar-width: 10px;
  border-radius: 15px;
  background: white;
}

.select {
  position: relative;
  box-sizing: border-box;
  border: 1px solid #d9d9d9;
  border-radius: 15px;
  background: #fff;
  height: 32px;
  width: 100px;
  padding: 0 5px;

  select {
    width: 100%;
    height: 100%;
    background: none;
    border: 0;
    outline: none;
  }
}

.middle {
  vertical-align: middle;
}

.select-invert {
  font-size: 20px;
  vertical-align: middle;
  margin-left: 10px;
  cursor: pointer;
}
</style>
