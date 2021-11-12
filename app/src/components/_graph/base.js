import {create_random} from "../v2/project.utils";

class BaseGraph {
    // constructor
    constructor(svg_config, config) {
        /*
        * ratio 缩放比例
        * ratio_x
        * ratio_y
        * x0 -> x偏移
        * y0 -> y偏移
        * width
        * height
        * padding_x 20
        * padding_y 20
        * */
        // this.config = config;
        // svg 旧版 svg 格式
        this.svg_config = svg_config
        this.config = config
        this.ratio = config.ratio;
        this.title = config.title ? config.title : ''
        this.id = config.id ? config.id : ''
        this.class = config.class ? config.class : ''
        this.random = create_random(4).toUpperCase();
        this.count = 0;
        this.vue = config.vue;
    }

    // Method
    draw() {
    }

    // 绑定事件
    bindEvent(element, event, that, data) {
        event(element, that, data)
    }
}

export default BaseGraph