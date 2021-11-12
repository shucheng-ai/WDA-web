<template>
	<div>
		<section class="main">
			<div class="left-box display">
				<template v-if="!$store.state.cad.data || !$store.state.cad.data.cad_name">
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
								Upload CAD(.dxf .dwg)
							</a-button>
						</a-upload>
					</div>
					<div class="button-item" v-if="$store.state.cad.has_cad_data_ever">
						<a-button icon="reload" v-on:click="reAnalyzeCad">
							Re Analyze CAD
						</a-button>
					</div>
					<div class="button-item">
						<a-button v-on:click="initGreenfield">
							{{ show_greenfield ? 'Cancel Greenfield' : 'Use Greenfield' }}
						</a-button>
						<template v-if="show_greenfield">
							<a-button v-on:click="clearGreenfield" class="margin-left" icon="delete">
								Clear
							</a-button>
							<div class="margin-left">
								<!-- Ratio: -->
								<a-input addon-before="Ratio" v-model="ratio" type="number" class="ratio-input"></a-input>
							</div>
							<a-button v-on:click="generateGreenfield" type="primary" class="margin-left">
								Generate Wall
							</a-button>
						</template>
					</div>
				</template>
				<template v-else>
					<div class="button-item">
						<a-tag color="#f50" style="margin-left: 10px" @click="downloadOriginCad">
							CAD
						</a-tag>
						<p class="cad-name" @click="downloadOriginCad">
							{{ $store.state.cad.data.cad_name }}
						</p>
					</div>
					<div class="button-item" v-if="$store.state.cad.has_cad_data_ever">
						<a-button icon="reload" v-on:click="reAnalyzeCad">
							Re Analyze CAD
						</a-button>
					</div>
				</template>
			</div>
			<div class="right-box display" v-show="has_true_cad_data">
				<div class="button-item">
					<a-popover placement="bottom" v-model="show_model_popover" trigger="click" arrow-point-at-center>
						<template slot="content">
							<a-card :bordered="true" style="width:100%;margin-bottom: 10px;" class="bg-white model-bg">
								<div class="model-list" v-for="(model, index) in modelList" :key="index">
									<div class="model-box">
										<p class="model-name">{{ model.name }}</p>
										<div class="item-list" v-for="(item, index) in model.children" :key="index">
											<img
												:src="getImage(item.model)"
												class="item-img"
												draggable="true"
												@dragstart="drag_model($event, item)"
											/>
											<span class="item-name">{{ item.name }}</span>
											<span class="item-size" v-if="item.depth"
												>{{ item.width }}mm*{{ item.height }}mm*{{ item.depth }}mm</span
											>
											<span class="item-size" v-else>{{ item.width }}mm*{{ item.height }}mm</span>
										</div>
									</div>
								</div>
							</a-card>
						</template>
						<span slot="title">Drag and Drop Model to image</span>
						<a-button style="color: #a6514e; border-color: color: #a6514e;">Add 3D Model</a-button>
					</a-popover>

					<!-- <a-tooltip title="ADD 3D Model" placement="top" trigger="hover">
            <a-button
              @click="add3DModel"
              style="color: #a6514e; border-color: color: #a6514e;"
              >ADD 3D Model</a-button
            >
          </a-tooltip> -->
				</div>
				<div class="button-item">
					<a-dropdown>
						<a-menu slot="overlay" @click="download">
							<a-menu-item key="cad"> <a-icon type="file" />Download DXF </a-menu-item>
							<a-menu-item key="dwg"> <a-icon type="file" />Download DWG </a-menu-item>
							<a-menu-item key="gltf"> <a-icon type="file" />Download GLTF </a-menu-item>
							<a-menu-item key="png"> <a-icon type="file" />Download PNG </a-menu-item>
						</a-menu>
						<a-button> Download <a-icon type="download" /> </a-button>
					</a-dropdown>
				</div>
				<div class="button-item">
					<a-tooltip title="3D Preview" placement="top" trigger="hover">
						<a-button @click="jump3d" style="color: #a6514e; border-color: color: #a6514e;">3D Preview</a-button>
					</a-tooltip>
				</div>
			</div>
		</section>
		<SCFeedBack @init="init" title="CAD Analyze Failed" errorText="Sorry, CAD Analyze Failed."></SCFeedBack>
	</div>
</template>

<script>
import Cad from './cad';
import Greenfield from './greenfield';

import SCFeedBack from '../../baseui/sc-feedback';
import { mapState } from 'vuex';
import { create_random } from '../project.utils';
import { Png } from '../../../libs/png';
import { get_id, get_class } from '../../../config/id.config';

import img_convey_line from '../../../assets/images/model/convey_line.png';
import img_platform from '../../../assets/images/model/platform.png';
import img_AGV from '../../../assets/images/model/AGV.png';
import img_forklift from '../../../assets/images/model/forklift.png';
import img_manup_truck from '../../../assets/images/model/manup_truck.png';

export default {
	name: 'top-button',
	components: {
		SCFeedBack,
	},
	props: {
		show_greenfield: {
			type: Boolean,
			require: true,
			default: false,
		},
		has_true_cad_data: {
			type: Boolean,
			require: true,
			default: false,
		},
	},
	computed: {
		...mapState({
			project: (state) => state.project,
		}),
	},
	created() {
		const cad = new Cad();
		this.upload = cad.upload.bind(this);
		this.decode = cad.decode.bind(this);

		const greenfield = new Greenfield();
		this.initGreenfield = greenfield.init.bind(this);
		// this.redrawCanvas = greenfield.redraw.bind(this);
		this.generateGreenfield = greenfield.generate.bind(this);
		this.clearGreenfield = greenfield.clear.bind(this);
		// this.getDistance = greenfield.getDistance.bind(this); // TODO 这种返回值不行
	},
	methods: {
		init() {
			// 通知页面更新数据
			this.$emit('init'); //通过$emit触发父组件
		},
		download(e) {
			console.log('e: ', e);
			// 目前 greenfield下不支持下载 会报错
			if (e.key === 'cad') {
				this.downloadCad();
			} else if (e.key === 'dwg') {
				this.downloadDwg();
			} else if (e.key === 'gltf') {
				this.download3D();
			} else if (e.key === 'png') {
				this.downloadPng();
			}
		},
		downloadPng() {
			// 会下载当前视图内的仓库情况，所有隐藏起来的图层都会显示
			// let config = {
			// 	father: get_id()['svg'],
			// 	png_width: this.$store.state.config.graph_width,
			// 	png_height: this.$store.state.config.graph_height,
			// 	png_class: 'sc-base-png',
			// 	hide_class_list: ['hide-node'],
			// };
			// let svg_png = new Png(config, this);
			// console.log('svg_png: ', svg_png);

			let random = create_random(8);
			window.location.href = `/api/project/downloadPng?project_id=${this.project_id}&random=${random}`;
		},

		downloadOriginCad() {
			let random = create_random(8);
			window.location.href = `/api/project/file?id=${this.project_id}&file=/cad/wda.dxf&random=${random}`;
		},

		downloadDwg() {
			let random = create_random(8);
			window.location.href = `/api/project/downloadDwg?project_id=${this.project_id}&random=${random}`;
		},

		downloadCad() {
			let random = create_random(8);
			window.location.href = `/api/project/downloadCad?project_id=${this.project_id}&random=${random}`;
		},

		download3D() {
			// this.$model.project.download3D(this.project_id);
			let random = create_random(8);
			window.location.href = `/api/project/download3D?project_id=${this.project_id}&random=${random}`;
		},

		jump3d() {
			let random = create_random(8);

			let origin = process.env.NODE_ENV === 'production' ? location.origin : 'http://localhost:8081';
			let url = `${origin}/3d/?project_id=${this.project_id}&app=v2&random=${random}`;
			window.open(url);
		},

		getImage(model) {
			let result = '';
			switch (model) {
				case 'convey_line':
					result = img_convey_line;
					break;
				case 'platform':
					result = img_platform;
					break;
				case 'AGV':
					result = img_AGV;
					break;
				case 'forklift':
					result = img_forklift;
					break;
				case 'manup_truck':
					result = img_manup_truck;
					break;
				case 'operator':
					result = img_operator;
					break;
				default:
					break;
			}
			return result;
		},

		drag_model(event, model) {
			console.log('model: ', model);
			console.log('event: ', event);
			// model.event = event;
			this.$store.commit('SET_TEMP_MODEL', model);
		},

		reAnalyzeCad() {
			this.decode(false);
		},
	},
	data() {
		return {
			name: 'cad',
			loading: false,
			disable_upload: false,
			disable_decode: true,
			upload_finished: false,
			// show_greenfield: false,
			filename: '',
			ratio: 100,
			project_id: this.$route.query.id,
			show_model_popover: false,
			modelList: [
				{
					name: 'Convey Line',
					children: [
						{
							name: 'Convey Line',
							// img: img_convey_line,
							model: 'convey_line',
							type: 22,
							height: 3000,
							width: 1000,
							depth: 800,
							// svg 初始长宽比是1.63
							originDirection: 'upwards',
							lastDirection: 'upwards',
							direction: 'upwards',
							hasDirections: ['upwards', 'leftwards'],
							customizable: true,
						},
					],
				},
				{
					name: 'Workstation',
					children: [
						{
							name: 'Workstation',
							// img: img_platform,
							model: 'platform',
							type: 20,
							height: 700,
							width: 1100,
							depth: 600,
							// svg 初始宽长比是1.63
							originDirection: 'leftwards',
							lastDirection: 'leftwards',
							direction: 'leftwards',
							hasDirections: ['upwards', 'leftwards'],
							customizable: true,
						},
					],
				},
				{
					name: 'Vehicle',
					children: [
						{
							name: 'AGV',
							model: 'AGV',
							// img: img_AGV,
							type: 18,
							height: 1250,
							width: 420,
							depth: 380,
							originDirection: 'downwards',
							lastDirection: 'downwards',
							direction: 'downwards',
							hasDirections: ['downwards', 'rightwards'],
							customizable: false,
						},
						{
							name: 'Forklift',
							model: 'forklift',
							// img: img_forklift,
							type: 17,
							height: 3260,
							width: 1120,
							depth: '',
							originDirection: 'downwards',
							lastDirection: 'downwards',
							direction: 'downwards',
							hasDirections: ['downwards', 'rightwards'],
							customizable: false,
						},
						{
							name: 'ManUp Truck',
							model: 'manup_truck',
							// img: img_manup_truck,
							type: 19,
							height: 2958,
							width: 1120,
							depth: '',
							originDirection: 'downwards',
							lastDirection: 'downwards',
							direction: 'downwards',
							hasDirections: ['downwards', 'rightwards'],
							customizable: false,
						},
					],
				},
			],
		};
	},
};
</script>

<style scoped lang="less">
.main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}
.display {
	display: flex;
	align-items: center;
}
.button-item {
	margin-right: 10px;
	display: flex;
}
.margin-left {
	margin-left: 10px;
}
.ratio-input {
	width: 150px;
}

.model-list {
	margin: 10px 0;
	&:first-child {
		margin-top: 0;
	}
	.model-box {
		.model-name {
			font-size: 16px;
			color: #666;
			line-height: 38px;
			font-weight: 400;
		}
		.item-list {
			margin: 5px 20px;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			height: 38px;
			line-height: 38px;
		}
		.item-img {
			cursor: pointer;
			max-height: 38px;
			max-width: 38px;
			padding: 3px;
			border: 1px dashed #666;
		}
		.item-name {
			font-size: 14px;
			color: #333;
			margin-left: 10px;
		}
		.item-size {
			font-size: 12px;
			color: #999;
			margin-left: 10px;
		}
	}
}

.cad-name {
	font-size: 12px;
	color: #666;
	line-height: 22px;
	cursor: pointer;
	&:hover {
		color: @primary-color;
		text-decoration: underline;
	}
}
</style>
