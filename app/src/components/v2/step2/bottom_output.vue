<template>
  <div
    style="
        position: fixed;width: 100%;left:0;bottom: 0;height: 35px;
        background: white;overflow:scroll;z-index: 888;
        border-top: 1px solid #e8e8e8;
        padding: 5px 20px;"
  >
    <!--            底部输出-->
    <a-button type="link" @click="showDrawer('bottom')" icon="up" size="small">
      Detail
    </a-button>

    <span
      style="display: inline-block;margin: 0 20px"
      v-for="item in outputInfo"
      :key="item.id"
    >
      {{ item.name }}: {{ item.value }}
    </span>

    <a-button
      type="link"
      @click="showDrawer('right')"
      icon="left"
      size="small"
      style="float: right"
    >
    </a-button>

    <a-drawer
      title="Output Detail"
      :placement="placement"
      :visible="show"
      @close="show = false"
      :mask="false"
    >
      <section :class="placement + '-card-box card-box'">
        <div :class="placement + '-div'">
          <a-card hoverable :class="placement + ' storage-view-box'">
            <a-card-meta title="Info" style="margin-bottom: 20px">
            </a-card-meta>
            <a-card-meta
              :title="item.name"
              class="info-item"
              v-for="item in outputInfo"
              :key="item.id"
            >
              <template slot="description">
                {{ item.value }}
              </template>
            </a-card-meta>
          </a-card>
          <!-- <a-card
            hoverable
            :class="placement + ' storage-view-box'"
            v-if="item.type === 'img'"
          >
            <a-card-meta :title="item.title"></a-card-meta>
            <div class="ant-card-cover">
              <img
                slot="cover1"
                :alt="item.title"
                class="storage-view-img"
                :src="front_view"
              />
            </div>
          </a-card> -->
        </div>
      </section>
    </a-drawer>
  </div>
</template>

<script>
import side_view from '../../../assets/images/side_view.png';
import front_view from '../../../assets/images/front_view.png';

export default {
  name: 'bottom_output',
  props: {
    outputInfo: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    importantInfo() {
      let result = [];
      let infoList = this.outputInfo.filter((item) => {
        return item.type === 'info';
      });
      if (infoList.length > 0) {
        result = infoList[0].list;
      }
      return result;
    },
  },
  data() {
    return {
      placement: 'bottom', // bottom/right
      show: false,
      side_view,
      front_view,
    };
  },
  methods: {
    showDrawer(placement) {
      this.placement = placement;
      this.show = true;
    },
  },
};
</script>

<style scoped lang="less">
/deep/ .storage-view-box {
  border: 1px solid #e8e8e8;
  .ant-card-cover {
    display: flex;
    justify-content: center;
  }
  .ant-card-meta-title {
    text-align: center;
  }
  .ant-card-meta-description {
    text-align: center;
  }
  .info-item {
    .ant-card-meta-detail {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
    }
    .ant-card-meta-title {
      line-height: 32px;
    }
    .ant-card-meta-description {
      line-height: 32px;
    }
    .ant-card-meta-detail > div:not(:last-child) {
      margin-bottom: 0px;
    }
  }
}
/deep/ .right {
  margin-bottom: 20px;
}

/deep/ .bottom-card-box {
  display: flex;
  .bottom-div {
    margin-right: 40px;
  }
  .ant-card-body {
    min-width: 200px;
  }
}
.storage-view-img {
  height: auto;
  width: auto;
  max-height: 256px;
}
</style>
