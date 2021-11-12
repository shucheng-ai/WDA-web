<template>
	<div class="project-content">
		<Loading :spinning="$store.state.request.loading" :loadingText="$store.state.request.loadingText"></Loading>

		<topButton
			@init="init(true)"
			ref="topButton"
			:show_greenfield.sync="show_greenfield"
			:has_true_cad_data="has_true_cad_data"
		></topButton>
		<!-- 左侧SVG主体 -->
		<div
			class="project-content-graph"
			:style="{
				width: `${config.graph_width}px`,
				height: `${config.graph_height}px`,
			}"
		>
			<!-- 菜单栏 -->

			<div class="graph-menu" id="graphMenu" v-show="has_true_cad_data && !show_greenfield">
				<section class="left-menu" style="display: inline-block">
					<a-tooltip placement="topLeft" title="Reset" arrowPointAtCenter>
						<a-icon type="reload" class="icon" @click.stop="reset" />
					</a-tooltip>

					<a-tooltip placement="topLeft" title="Hide" arrowPointAtCenter v-if="isHideWallNode">
						<a-icon type="eye-invisible" class="icon" @click.stop="hideWallNode(false)" />
					</a-tooltip>

					<a-tooltip placement="topLeft" title="Show" arrowPointAtCenter v-if="!isHideWallNode">
						<a-icon type="eye" class="icon" @click.stop="hideWallNode(true)" />
					</a-tooltip>

					<a-tooltip placement="topLeft" title="Delete Path" arrowPointAtCenter>
						<a-icon type="delete" class="icon" @click.stop="deleteConnectionItem" />
					</a-tooltip>

					<span class="cad-radio">{{ toDecimal(origin_ratio / ratio) }}x</span>
				</section>

				<div style="float: right">
					<a-dropdown placement="bottomRight" overlayClassName="nav-dropdown" :trigger="['click', 'hover']">
						<p class="ant-dropdown-link" style="cursor: pointer; color: #ccc">
							<!-- Navigate Canvas to -->
							{{ getActiveRoomName }}
							<a-icon type="down" />
						</p>
						<!-- :style="{
                display: 'flex',
                background: 'transparent',
                flexWrap: 'wrap',
                width: `${config.graph_width}px`,
                justifyContent: 'flex-end',
              }" -->
						<a-menu slot="overlay" @click="changeNavCanvas">
							<a-menu-item
								v-for="(nav, index) in navigations"
								:key="index"
								:value="index"
								:class="{ active: index === svg.active }"
							>
								<a href="javascript:;">
									<!-- <img
                    alt="thumbnail"
                    :src="nav.image"
                    slot="cover"
                    style="cursor: pointer"
                    class="thumbnail-img"
                  /> -->
									<p class="navigation-name">{{ nav.room }}</p>
								</a>
							</a-menu-item>
						</a-menu>
					</a-dropdown>
				</div>
			</div>

			<!-- 画图 & 工具栏 -->

			<div
				v-show="has_true_cad_data && !show_greenfield"
				id="svg"
				@drop="drop($event)"
				@dragover="dragover($event)"
				style="position: relative"
				:style="{
					width: `${config.graph_width}px`,
					height: `${config.graph_height}px`,
				}"
			>
				<div class="project-graph-buttons click-through">
					<div
						class="project-graph-buttons-item click-normal"
						:key="'operation' + index"
						v-for="(operation, index) in config.graph_operations"
					>
						<a-select
							v-model="operation.name"
							style="text-align: left;"
							:class="$store.getters.getGraphTypeById(svg.mode.split('-')[1]) === operation.id ? 'select-active' : ''"
							@select="changeSVGMode"
							option-label-prop="label"
							v-if="Array.isArray(operation.data)"
						>
							<a-select-option
								:value="item.id"
								class="select-graph-operations"
								v-for="item in operation.data"
								:key="item.id"
								:label="item.id"
							>
								{{ item.name }}
								<a-icon
									v-show="item.show"
									type="eye"
									class="icon"
									:style="{
										color: color_config()[item.id],
									}"
									@click.stop="hideSomeNewNode(item.id, 'item', false)"
									:aria-label="item.id"
								/>
								<a-icon
									v-show="!item.show"
									type="eye-invisible"
									class="icon"
									@click.stop="hideSomeNewNode(item.id, 'item', true)"
								/>
							</a-select-option>
						</a-select>
						<a-button
							v-else
							style="width: 100%;text-align: left;"
							:type="$store.getters.getGraphTypeById(svg.mode.split('-')[1]) === operation.id ? 'primary' : 'default'"
							@click.stop="changeSVGMode(operation.data.id)"
							icon="plus"
						>
							{{ operation.data.name }}
						</a-button>
						<a-icon
							type="eye"
							v-show="operation.show"
							class="icon"
							@click.stop="hideSomeNewNode(operation.id, 'group', false)"
						/>
						<a-icon
							v-show="!operation.show"
							type="eye-invisible"
							class="icon"
							@click.stop="hideSomeNewNode(operation.id, 'group', true)"
						/>
					</div>

					<div class="shape-box click-normal">
						<div
							v-for="(item, index) in shapeList"
							:key="item.id + index"
							class="shape-item"
							:class="[
								{ active: item.id === svg.shape },
								{
									disabled:
										(!$store.getters.getSomeGraphAttr(svg.mode.split('-')[1], 'allow_shapes').includes(item.id) &&
											svg.mode !== 'normal') ||
										(svg.mode === 'normal' && (item.id === 'region' || item.id === 'polygon')),
								},
							]"
							@click="chageShape(item.id)"
						>
							<img :src="item.img" class="shape-img" />
						</div>
					</div>
				</div>
			</div>

			<SCCanvas ref="sc_canvas" class="canvas-box" v-if="show_greenfield"></SCCanvas>

			<div v-if="!has_true_cad_data && !show_greenfield" class="empty-box">
				<p class="empty-tip">Please upload cad file or use greenfield mode</p>
			</div>
		</div>

		<!-- 右侧storage table -->
		<div class="project-content-table" :style="{ width: `${config.table_width}px` }">
			<div style="background: white;padding-bottom: 10px" v-show="has_true_cad_data && !show_greenfield">
				<table style="width: 100%">
					<thead class="ant-table-thead">
						<tr>
							<th>
								<a-checkbox
									v-show="storages.length > 0"
									:checked="checkAllStorage"
									:indeterminate="indeterminate"
									@change="onChangeAllStorage"
								>
								</a-checkbox>
							</th>
							<th style="width: 130px"></th>
							<th
								class="ant-table-column-has-actions
                                        ant-table-column-has-sorters"
								:key="'col' + index"
								v-for="(item, index) in cols"
								style="text-align: left"
							>
								<div class="ant-table-column-sorters">{{ item }}</div>
							</th>
						</tr>
					</thead>
					<tbody class="ant-table-tbody">
						<tr
							class="ant-table-row ant-table-row-level-0"
							v-for="(storage_item, index) in storages"
							:key="storage_item.id"
						>
							<td>
								<a-checkbox
									:checked="storage_item.checked"
									@change="(e) => onChangeStorageItem(e, storage_item, 'right')"
								>
								</a-checkbox>
							</td>
							<td>
								<img
									:src="getImage(storage_item.info.base_rack)"
									class="storage-img"
									draggable="true"
									@dragstart="dragStorage($event, storage_item, index)"
								/>
								<!-- <a-icon
                  class="icon"
                  @click.stop="addStorageToSvg(storage_item, index)"
                  type="left-square"
                  :style="
                    select_index === index
                      ? { color: '#40a9ff' }
                      : { color: '#999' }
                  "
                /> -->
								<a-icon
									type="eye"
									class="icon"
									v-if="storage_item.info.quantity > 0"
									@click.stop="showStorageModal(storage_item, index)"
								/>
								<a-icon
									type="edit"
									class="icon"
									v-if="storage_item.info.quantity === 0"
									@click.stop="showStorageModal(storage_item, index)"
								/>
								<a-icon type="delete" class="icon" @click.stop="deleteStorageItem(storage_item, index)" />
							</td>
							<!-- <td>{{ storage_item.info.name }}</td>-->
							<td>
								<a-input v-model="storage_item.info.name"></a-input>
							</td>
							<td>{{ storage_item.info.quantity }}</td>
							<!-- <td>
                <a-input-number
                  v-model="storage_item.info.quantity"
                  v-show="storage_item.info.full !== true"
                >
                </a-input-number>
                <a-button
                  type="primary"
                  icon="check"
                  title="Click for details"
                  v-show="storage_item.info.full === true"
                  @click.stop="changeFullFlag(storage_item)"
                >
                  FULL
                </a-button>
              </td> -->
						</tr>
					</tbody>
				</table>

				<a-dropdown style="margin: 10px">
					<a-menu slot="overlay" @click="choose">
						<a-menu-item :key="item.id" :type="item.save_type" v-for="item in storage_types">
							{{ item.name }}
						</a-menu-item>
					</a-menu>
					<a-button type="link" icon="plus" size="large" />
				</a-dropdown>

				<a-button v-show="storages.length > 0" type="link" icon="delete" size="large" @click="deleteSomeStorage" />

				<a-modal
					v-model="visible"
					title="Storage Configuration"
					:bodyStyle="{
						maxHeight: '400px',
						paddingTop: '0',
						overflowY: 'scroll',
					}"
					:width="800"
					@ok="addStorage"
					@cancel="cancelStorage"
				>
					<div v-show="editAble" class="opt-button-box">
						<a-button type="primary" @click.stop="resetStorageTemplate" :disabled="!editAble">
							Reload Profile Values
						</a-button>
						<a-button type="default" class="default-button" @click.stop="editTemplate" :disabled="!editAble">
							Manage Profiles
						</a-button>
						<!-- <a-button
              type="danger"
              :disabled="!editAble"
              @click.stop="deleteTemplate"
            >
              Delete
            </a-button> -->
						<!-- <a-button
              type="default"
              :disabled="!editAble"
              @click.stop="previewImg"
            >
              Preview
            </a-button> -->
					</div>

					<div class="main-storage-box">
						<section class="list-storage-box">
							<div
								class="item-storage-box"
								v-for="(item, index) in storage_form"
								:key="'storage_form' + index"
								style="margin: 10px"
							>
								<div class="storage-input-item">
									<a-input v-model="item.name" class="input-name" :disabled="!editAble">
										<a-tooltip slot="suffix" :title="item.description">
											<a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
										</a-tooltip>
									</a-input>
								</div>
								<template>
									<div class="storage-input-item" v-if="item.value_type === 'str' && item.input_type === 'input'">
										<a-input v-model="item.value" :disabled="!editAble" />
									</div>
									<div class="storage-input-item" v-if="item.value_type === 'int' && item.input_type === 'input'">
										<a-input-number
											v-model="item.value"
											:disabled="!editAble"
											:class="{
												error: item.value > item.range[1] || item.value < item.range[0],
											}"
											@change="
												(e) =>
													changeNum(e, {
														max: item.range[1],
														min: item.range[0],
													})
											"
										/>
										<span class="error-tip" v-show="item.value > item.range[1] || item.value < item.range[0]"
											>Range is {{ item.range[0] }} to {{ item.range[1] }}</span
										>
										<!-- <input
                  class="ant-input-number-input-wrap ant-input-number-input ant-input-number"
                  type="number"
                  :max="item.range[1]"
                  :min="item.range[0]"
                  v-model="item.value"
                /> -->
									</div>
									<div class="storage-input-item" v-if="item.input_type === 'select'">
										<a-select
											:default-value="item.value"
											v-model="item.value"
											placeholder="input search text"
											@change="handleSelectChange"
											:disabled="!editAble"
										>
											<a-select-option
												:value="choice"
												v-for="(choice, choice_index) in item.choices"
												:key="'choices' + choice_index"
												:disabled="!editAble"
											>
												{{ choice }}
											</a-select-option>
										</a-select>

										<!-- <a-radio-group :default-value="item.value" button-style="solid">
                  <a-radio-button
                    :value="choice"
                    v-for="(choice, choice_index) in item.choices"
                    :key="choice_index"
                    :disabled="!editAble"
                  >
                    {{ choice }}
                  </a-radio-button>
                </a-radio-group> -->
									</div>
								</template>
							</div>
						</section>

						<section class="bottom-card-box card-box">
							<a-button type="default" class="repreview-button" :disabled="!editAble" @click.stop="previewImg(false)">
								<a-icon type="sync" />Refresh Preview
							</a-button>
							<div v-for="(item, index) in thumbnail_info" :key="index" class="bottom-div">
								<a-card hoverable class="bottom storage-view-box">
									<a-card-meta :title="item.title"></a-card-meta>
									<div class="ant-card-cover">
										<img slot="cover1" :alt="item.title" class="storage-view-img" :src="item.url" />
									</div>
								</a-card>
							</div>
						</section>
					</div>
				</a-modal>

				<a-modal
					v-model="show_region_confirm"
					title="Region Confirm"
					:bodyStyle="{
						maxHeight: '400px',
						overflowY: 'scroll',
					}"
					@ok="calculateStorageRegion(null, null, null, null, 1)"
					@cancel="calculateStorageRegion(null, null, null, null, 2)"
				>
					<p>Region Info</p>
					<div v-for="(item, index) in region_info" :key="'region_info' + index" style="margin: 10px">
						<div class="storage-input-item">
							<a-input v-model="item.name" class="input-name" :disabled="true">
								<a-tooltip slot="suffix" :title="item.description">
									<a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
								</a-tooltip>
							</a-input>
						</div>
						<template>
							<div class="storage-input-item" v-if="item.value_type === 'str' && item.input_type === 'input'">
								<a-input v-model="item.value" />
							</div>
							<div class="storage-input-item" v-if="item.value_type === 'int' && item.input_type === 'input'">
								<a-input-number
									v-model="item.value"
									:class="{
										error: item.value > item.range[1] || item.value < item.range[0],
									}"
									@change="(e) => changeNum(e, { max: item.range[1], min: item.range[0] })"
								/>
								<span class="error-tip" v-show="item.value > item.range[1] || item.value < item.range[0]"
									>Range is {{ item.range[0] }} to {{ item.range[1] }}</span
								>
								<!-- <input
                  class="ant-input-number-input-wrap ant-input-number-input ant-input-number"
                  type="number"
                  :max="item.range[1]"
                  :min="item.range[0]"
                  v-model="item.value"
                /> -->
							</div>
							<div class="storage-input-item" v-if="item.input_type === 'select'">
								<a-select
									:default-value="item.value"
									v-model="item.value"
									placeholder="input search text"
									@change="handleSelectChange"
								>
									<a-select-option
										:value="choice"
										v-for="(choice, choice_index) in item.choices"
										:key="'choices' + choice_index"
									>
										{{ choice }}
									</a-select-option>
								</a-select>
							</div>
						</template>
					</div>
					<!-- <p>Algorithm Info</p> -->
					<p>Max Quantity</p>
					<div v-for="(item, index) in algorithm_info" :key="'algorithm_info' + index" style="margin: 10px">
						<div class="storage-input-item">
							<a-input v-model="item.name" class="input-name" :disabled="true">
								<a-tooltip slot="suffix" :title="item.description">
									<a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
								</a-tooltip>
							</a-input>
						</div>
						<template>
							<div class="storage-input-item" v-if="item.value_type === 'str' && item.input_type === 'input'">
								<a-input v-model="item.value" />
							</div>
							<div class="storage-input-item" v-if="item.value_type === 'int' && item.input_type === 'input'">
								<a-input-number
									v-model="item.value"
									:class="{
										error: item.value > item.range[1] || item.value < item.range[0],
									}"
									@change="(e) => changeNum(e, { max: item.range[1], min: item.range[0] })"
								/>
								<span class="error-tip" v-show="item.value > item.range[1] || item.value < item.range[0]"
									>Range is {{ item.range[0] }} to {{ item.range[1] }}</span
								>
								<!-- <input
                  class="ant-input-number-input-wrap ant-input-number-input ant-input-number"
                  type="number"
                  :max="item.range[1]"
                  :min="item.range[0]"
                  v-model="item.value"
                /> -->
							</div>
							<div class="storage-input-item" v-if="item.input_type === 'select'">
								<a-select
									:default-value="item.value"
									v-model="item.value"
									placeholder="input search text"
									@change="handleSelectChange"
								>
									<a-select-option :value="choice" v-for="(choice, choice_index) in item.choices" :key="choice_index">
										{{ choice }}
									</a-select-option>
								</a-select>
							</div>
						</template>
						<p v-if="item.name === 'quantity'" style="margin: 10px 0 10px -10px">Algorithm Info</p>
					</div>
				</a-modal>
			</div>

			<div v-if="show_greenfield">
				<a-steps :current="$store.getters.truePointsArr.length + 1" direction="vertical" class="canvas-steps">
					<a-popover slot="progressDot" slot-scope="{ prefixCls }">
						<span :class="`${prefixCls}-icon-dot`" />
					</a-popover>
					<a-step v-for="(item, index) in this.$store.getters.truePointsArr" :key="index">
						<template slot="title">
							<div class="canvas-points">
								<span>x:</span>
								<a-input-number v-model="item.x" @change="(e) => redrawCanvas(e)" />
								<span>y:</span>
								<a-input-number v-model="item.y" @change="redrawCanvas" />
							</div>
						</template>
						<template slot="description">
							<div class="canvas-points">
								<span>distance:</span>
								<a-input-number :value="getDistance(item, index)" @change="(e) => blurDistance(e, index)" />
							</div>
						</template>
					</a-step>
				</a-steps>
			</div>
		</div>

		<!-- 编辑storage 模板的drawer -->
		<a-drawer
			title="Manager Profiles"
			:width="820"
			:visible="templateVisible"
			:body-style="{
				paddingTop: '0px',
				paddingBottom: '120px',
				overflowY: 'scroll',
				height: 'calc(100% - 55px)',
			}"
			@close="onCloseTemplate"
		>
			<div class="opt-button-box">
				<a-button
					type="primary"
					@click.stop="savePostTemplate(0)"
					v-show="temp_storage_info.base_rack !== temp_storage_info.id"
				>
					Save
				</a-button>
				<a-button type="default" class="default-button" @click.stop="saveTemplate">
					Save as New
				</a-button>
				<a-button type="default" class="default-button" @click.stop="deleteTemplate">
					Delete Profile
				</a-button>
			</div>
			<table style="width: 100%">
				<thead class="ant-table-thead">
					<tr>
						<th
							class="ant-table-column-has-actions
                                        ant-table-column-has-sorters"
							v-for="(item, index) in templateCols"
							:key="'templateCols' + index"
							style="text-align: left"
						>
							<div class="ant-table-column-sorters">{{ item }}</div>
						</th>
					</tr>
				</thead>
				<tbody class="ant-table-tbody">
					<tr
						class="ant-table-row ant-table-row-level-0"
						v-for="(storage_item, index) in storage_form"
						:key="'storage_item' + index"
					>
						<td><a-input v-model="storage_item.name"></a-input></td>
						<td><a-input v-model="storage_item.description"></a-input></td>
						<td>
							<a-input v-model="storage_item.value" v-if="storage_item.value_type === 'str'"></a-input>
							<a-input-number
								v-model="storage_item.value"
								v-else-if="storage_item.value_type === 'int'"
								:class="{
									error: storage_item.value > storage_item.range[1] || storage_item.value < storage_item.range[0],
								}"
							></a-input-number>
						</td>
						<td>
							<template v-if="storage_item.range && storage_item.range.length > 0">
								<a-input-group compact class="flex">
									<a-input-number disabled v-model="storage_item.range[0]"></a-input-number>
									<a-input-number disabled v-model="storage_item.range[1]"></a-input-number>
								</a-input-group>
							</template>
						</td>
						<td>
							<template v-if="storage_item.choices && storage_item.choices.length > 0">
								<a-input-group compact class="flex" @change="changeChoices">
									<a-input
										:value="choice"
										v-for="(choice, c_index) in storage_item.choices"
										:key="'s_choice' + c_index"
										:data-storage="index"
										:data-index="c_index"
										:class="getClassName(index, c_index)"
									></a-input>
								</a-input-group>
								<div class="icon-box">
									<a-icon type="plus" class="icon" @click.stop="addChoiceItem(storage_item, index)" />
									<a-icon
										type="minus"
										class="icon"
										style="
                      color: #993030
                    "
										@click.stop="removeChoiceItem(storage_item, index)"
									/>
								</div>
							</template>
							<a-icon v-else type="plus" class="icon" @click.stop="addChoiceItem(storage_item, index)" />
						</td>
					</tr>
				</tbody>
			</table>
			<div class="storage-button-box">
				<a-button @click.stop="onCloseTemplate">
					Cancel
				</a-button>
				<a-button
					type="primary"
					@click.stop="savePostTemplate(0)"
					v-show="temp_storage_info.base_rack !== temp_storage_info.id"
				>
					Save
				</a-button>
				<a-button type="primary" @click.stop="saveTemplate">
					Save as new
				</a-button>
			</div>
		</a-drawer>

		<a-modal title="Edit Storage" :visible="show_edit_storage" :footer="null" @cancel="cancelEditStorage(true)">
			<div class="info-box">
				<!-- XXX INFO -->
				<div class="model-button" v-if="edit_storage_region_info && edit_storage_region_info.bbox">
					<span class="label">Polygon Size (L * W)(mm)</span>
					<div>
						<a-input-group compact>
							<a-input
								style=" width: 70px; text-align: center"
								@change="changePlanLength"
								:value="getLength(edit_storage_region_info.bbox)"
								placeholder="Length"
							/>
							<a-input
								style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
								placeholder="*"
								disabled
							/>
							<a-input
								@change="changePlanWidth"
								:value="getWidth(edit_storage_region_info.bbox)"
								style=" width: 70px; text-align: center;  border-left: 0"
								placeholder="Width"
							/>
						</a-input-group>
					</div>
				</div>
				<div
					class="model-button"
					v-if="edit_storage_region_info && edit_storage_region_info.bbox && edit_storage_region_info.bbox.length === 2"
				>
					<span class="label">Polygon Coordinate(X Y X Y)</span>
					<div>
						<a-input-group compact>
							<a-input
								class="item-bbox-input"
								@change="(e) => changePlanBbox(e, 0, 0)"
								:value="edit_storage_region_info.bbox[0][0]"
								placeholder="X1"
							/>
							<a-input
								class="item-bbox-input"
								@change="(e) => changePlanBbox(e, 0, 1)"
								:value="edit_storage_region_info.bbox[0][1]"
								placeholder="Y1"
							/>
							<a-input
								@change="(e) => changePlanBbox(e, 1, 0)"
								:value="edit_storage_region_info.bbox[1][0]"
								class="item-bbox-input"
								placeholder="X2"
							/>
							<a-input
								@change="(e) => changePlanBbox(e, 1, 1)"
								:value="edit_storage_region_info.bbox[1][1]"
								class="item-bbox-input"
								placeholder="Y2"
							/>
						</a-input-group>
					</div>
				</div>
				<!-- <a-checkbox
          @change="onChangeDeleteRegionTogether"
          :checked="deleteRegionTogether"
        >
          Whether or not delete region together
        </a-checkbox> -->
			</div>
			<div class="button-box">
				<a-button type="primary" @click.stop="rePaint">
					ReCalculate
				</a-button>
				<a-button type="danger" @click.stop="deletePaintedStorage(true)">
					Delete
				</a-button>
			</div>
		</a-modal>

		<a-modal title="Save as to a new name" :visible="show_sava_name" @ok="savePostTemplate(1)" @cancel="cancelSaveName">
			<div class="save-name">
				<span>Save the template as to a new name</span>
				<a-input v-model="templateName"></a-input>
			</div>
			<div>
				<a-radio-group v-model="saveFlag">
					<a-radio :value="0">
						Save to project
					</a-radio>
					<a-radio :value="1">
						Save to global
					</a-radio>
				</a-radio-group>
			</div>
		</a-modal>

		<a-modal title="Edit Polygon" :visible="show_edit_path" :footer="null" @cancel="cancelEditPath">
			<div class="model-button">
				<span class="label">Polygon Size (L * W)(mm)</span>
				<div>
					<a-input-group compact>
						<a-input
							style=" width: 70px; text-align: center"
							@change="changeItemLength"
							:value="getLength(temp_path_info.bbox)"
							placeholder="Length"
						/>
						<a-input
							style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
							placeholder="*"
							disabled
						/>
						<a-input
							@change="changeItemWidth"
							:value="getWidth(temp_path_info.bbox)"
							style=" width: 70px; text-align: center;  border-left: 0"
							placeholder="Width"
						/>
					</a-input-group>
				</div>
			</div>
			<div class="model-button" v-if="temp_path_info.bbox && temp_path_info.bbox.length === 2">
				<span class="label">Polygon Coordinate(X Y X Y)</span>
				<div>
					<a-input-group compact>
						<a-input
							class="item-bbox-input"
							@change="(e) => changeItemBbox(e, 0, 0)"
							:value="temp_path_info.bbox[0][0]"
							placeholder="X1"
						/>
						<a-input
							class="item-bbox-input"
							@change="(e) => changeItemBbox(e, 0, 1)"
							:value="temp_path_info.bbox[0][1]"
							placeholder="Y1"
						/>
						<a-input
							@change="(e) => changeItemBbox(e, 1, 0)"
							:value="temp_path_info.bbox[1][0]"
							class="item-bbox-input"
							placeholder="X2"
						/>
						<a-input
							@change="(e) => changeItemBbox(e, 1, 1)"
							:value="temp_path_info.bbox[1][1]"
							class="item-bbox-input"
							placeholder="Y2"
						/>
					</a-input-group>
				</div>
			</div>
			<div
				class="model-button"
				v-if="temp_path_info.info && temp_path_info.info.direction && temp_path_info.hasDirection"
			>
				<span class="label">Choose polygon Direction</span>
				<!-- <a-select
          v-model="temp_path_info.direction"
          style="width: 120px"
          @change="changeDirection($event)"
        >
          <a-select-option
            v-for="item in ['horizontal', 'vertical']"
            :key="item"
            :value="item"
          >
            {{ item }}
          </a-select-option>
        </a-select> -->
				<a-radio-group v-model="temp_path_info.info.direction" @change="changeDirection($event)">
					<a-radio v-for="item in ['horizontal', 'vertical']" :key="item" :value="item">
						{{ item }}
					</a-radio>
				</a-radio-group>
			</div>

			<div class="model-button">
				<span class="label">Copy This Polygon</span>
				<a-button class="custom-button" type="primary" style="width: 120px" @click.stop="copyPath">
					Copy
				</a-button>
			</div>

			<div class="model-button">
				<span class="label">Delete This Polygon</span>
				<a-button type="danger" style="width: 120px" @click.stop="deletePath">
					Delete
				</a-button>
			</div>
		</a-modal>

		<!-- 编辑3d模型 -->
		<a-modal
			title="Edit Model"
			:visible="$store.state.animation.show_edit_model"
			:footer="null"
			@cancel="cancelEditModel"
		>
			<div class="model-button" v-if="$store.state.animation.temp_model.customizable">
				<span class="label">Model Size (W * L * H)(mm)</span>
				<div>
					<a-input-group compact>
						<a-input
							style=" width: 70px; text-align: center"
							@change="changeModelSize"
							v-model="$store.state.animation.temp_model.width"
							placeholder="Width"
						/>
						<a-input
							style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
							placeholder="*"
							disabled
						/>
						<a-input
							@change="changeModelSize"
							v-model="$store.state.animation.temp_model.height"
							style=" width: 70px; text-align: center;  border-left: 0"
							placeholder="Length"
						/>
						<a-input
							style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
							placeholder="*"
							disabled
						/>
						<a-input
							@change="changeModelSize"
							v-model="$store.state.animation.temp_model.depth"
							style="width: 70px; text-align: center; border-left: 0"
							placeholder="Height"
						/>
					</a-input-group>
				</div>
			</div>
			<div class="model-button">
				<span class="label">Choose Model Direction</span>
				<a-select
					default-value="lucy"
					v-model="$store.state.animation.temp_model.direction"
					style="width: 120px"
					@change="changeModelDirection($event)"
				>
					<a-select-option v-for="item in $store.state.animation.direction_list" :key="item" :value="item">
						{{ item }}
					</a-select-option>
				</a-select>
			</div>
			<div class="model-button">
				<span class="label">Copy This Model</span>
				<a-button class="custom-button" type="primary" style="width: 120px" @click.stop="copyModel">
					Copy
				</a-button>
			</div>
			<div class="model-button">
				<span class="label">Delete This Model</span>
				<a-button class="main-button" type="danger" style="width: 120px" @click.stop="deleteModel">
					Delete
				</a-button>
			</div>
		</a-modal>

		<!-- 底部信息输出 -->
		<bottomOutput :outputInfo="outputInfo"></bottomOutput>
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { SvgGraph, BboxGraph, TopViewGraph, StorageImgGraph, ModelGraph } from '../../_graph/graph';
import { Marker } from '../../_graph/marker';
import { color_config } from '../../../config/color.config';
import SCCanvas from './greenfield/Canvas.vue';

import { svgContextmenuEvent, svgClickEvent, svgZoomEvent } from '../../_graph/graph.event';
import {
	calculate_bbox_from_navigation,
	calculate_ratio_from_bbox,
	calculate_scale_from_bbox,
	calculate_translate_xy,
	format_bbox,
	re_format_bbox,
	format_points,
	re_format_points,
	re_format_polygon_bbox,
	pointsToBbox,
	bboxToPoints,
	toDecimal,
	regionToPolygon,
	polygonToRegion,
	sortRegionOrPolygon,
	allToPolygon,
	clean,
	getBboxArea,
	judge_bbox_direction,
	format_direction,
	reformat_direction,
	judge_rect_intersect,
	BBoxtoPoints,
	debounce,
	d3XToCadX,
	d3YToCadY,
	sort_points,
	format_polygon_bbox,
	format_polygon_points,
} from '../project.utils';
import bottomOutput from './bottom_output';
import topButton from './top_button';
import { get_class, get_id } from '../../../config/id.config';

import { NewNodeGraph } from '../../_graph/item';
import { PolygonGraph } from '../../_graph/polygon';

import Adsorb from '../../_graph/adsorb';

import { PathGraph } from '../../_graph/path';
import { LineGraph } from '../../_graph/line';
import { yTrans } from '../../sc-graph/utils';
import { addAssistPoints } from '../../_graph/item.event';
import { ToolsGraph } from '../../_graph/tools';

import img_apr from '../../../assets/images/apr.png';
import img_shelf from '../../../assets/images/shelf.png';
import img_stack from '../../../assets/images/stack.png';
import img_move from '../../../assets/images/draw/move.png';
import img_line from '../../../assets/images/draw/line.png';
import img_region from '../../../assets/images/draw/region.png';
import img_polygon from '../../../assets/images/draw/polygon.png';

export default {
	name: 'setp2-index',
	computed: {
		getWalls() {
			let result = this.saveWalls[this.navigations[this.svg.active].room];
			return result ? result : [];
		},
		getActiveRoomName() {
			let result = '';
			if (this.navigations && this.navigations.length > 0 && this.navigations[this.svg.active].room) {
				result = this.navigations[this.svg.active].room;
			}
			return result;
		},
		edit_storage_region_info() {
			let result = {};
			if (this.edit_storage_info.region_id) {
				result = this.regions.filter((item) => {
					return item.region_id * 1 === this.edit_storage_info.region_id * 1;
				})[0];
			}
			return result;
		},
		...mapState({
			config: (state) => state.config,
			cad: (state) => state.cad,
			project: (state) => state.project,
		}),
	},
	watch: {
		top_views: {
			handler(newValue, oldValue) {
				setTimeout(() => {
					newValue.forEach((ele) => {
						ele['draw_points'] = [];
						ele['points'].forEach((item) => {
							let points = [];
							points = [
								toDecimal(item[0] / this.ratio),
								toDecimal(yTrans(item[1] / this.ratio, this.config.graph_height)),
							];
							ele['draw_points'].push(points);
						});
					});
				}, 200);
			},
			deep: true,
		},
		'svg.mode': {
			handler(newValue, oldValue) {
				let type_id = this.$store.getters.getGraphTypeById(oldValue.split('-')[1]);
				let new_type_id = this.$store.getters.getGraphTypeById(newValue.split('-')[1]);

				if (newValue === 'normal') {
					this.svg.shape = 'normal';
				} else {
					let shape = this.$store.getters.getSomeGraphAttr(newValue.split('-')[1], 'default_shape');
					let allow_shapes = this.$store.getters.getSomeGraphAttr(newValue.split('-')[1], 'allow_shapes');
					this.svg.shape = shape;
					console.log('allow_shapes: ', allow_shapes);
				}
				console.log('shape: ', this.svg.shape);

				if (type_id === this.$store.getters.getObstaclesType && newValue === 'normal') {
					this.$store.commit('SET_GRAPH_OPERATIONS_TYPE_NAME', {
						type: this.$store.getters.getObstaclesType,
						name: 'origin_name',
					});
				} else if (new_type_id !== this.$store.getters.getObstaclesType) {
					this.$store.commit('SET_GRAPH_OPERATIONS_TYPE_NAME', {
						type: this.$store.getters.getObstaclesType,
						name: 'origin_name',
					});
				}

				if (type_id === this.$store.getters.getConnectionItemType && newValue === 'normal') {
					this.$store.commit('SET_GRAPH_OPERATIONS_TYPE_NAME', {
						type: this.$store.getters.getConnectionItemType,
						name: 'origin_name',
					});
				} else if (new_type_id !== this.$store.getters.getConnectionItemType) {
					this.$store.commit('SET_GRAPH_OPERATIONS_TYPE_NAME', {
						type: this.$store.getters.getConnectionItemType,
						name: 'origin_name',
					});
				}
			},
		},
		'svg.shape': {
			handler(newValue, oldValue) {
				if (newValue === 'normal') {
					this.$d3.selectAll(`.${get_class()['newnode']}`).classed(get_class()['click_through'], false);

					this.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['click_through'], false);
				} else if (['line', 'polygon'].includes(newValue)) {
					this.$d3.selectAll(`.${get_class()['newnode']}`).classed(get_class()['click_through'], true);

					this.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['click_through'], true);
				}
			},
		},
		'svg.active': {
			handler(newValue, oldValue) {
				this.navigations.forEach((nav, index) => {
					if (index === newValue * 1) {
						console.log('nav.room: ', nav.room);
						this.$d3.selectAll(`.${nav.room}`).classed(get_class()['click_through'], false);
					} else {
						this.$d3.selectAll(`.${nav.room}`).classed(get_class()['click_through'], true);
					}
				});
			},
		},
		// 'edit_storage_info.region_id': {
		//   handler(newValue, oldValue) {

		//   },
		// },
		ratio: {
			handler(newValue, oldValue) {
				this.$store.commit('SET_RATIO', newValue);
			},
		},
	},
	components: {
		bottomOutput,
		topButton,
		SCCanvas,
	},
	created() {
		this.color_config = color_config;
		this.toDecimal = toDecimal;
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapMutations(['SET_TEMP_MODEL', 'UPDATE_MODEL_COUNT', 'SET_SHOW_EDIT_MODEL', 'UPDATE_FIXTURES_BY_TEMP']),

		// 初始化
		init(reset = false) {
			if (reset) {
				// 初始化全部的 data数据
				Object.assign(this.$data, this.$options.data());
				console.log('初始化data');
			}
			const project_id = this.$route.query.id;
			this.$store.commit('initConfig');
			this.$store.commit('initProject', {
				project_id,
			});
			this.getProjectInfoData();
			this.getCadInfoData();
			this.getProjectStorageInput();
			this.getStorageTypeList();
			this.getFixturesData();

			// get data
			let room_res = this.$model.project.getRoomHistory(project_id);
			let connection_res = this.$model.project.getConnectionItemHistory(project_id);
			let cad_res = this.$model.cad.getCadDecodeDxf(project_id);
			let history_res = this.$model.project.getProjectHistory(project_id);

			Promise.all([room_res, connection_res, cad_res, history_res]).then((results) => {
				console.log(results);

				this.getRoomHistory(results[0]);
				this.getConnectionItemHistory(results[1]);
				this.handleDecodeDxfData(results[2]);
				this.handleHistoryPlan(results[3]);

				let DecodeErrorFlag = false;
				if (this.has_true_cad_data) {
					// 解析异常判断
					try {
						// room里是空的
						if (results[0].data.data.length === 0) {
							DecodeErrorFlag = true;
							console.log('DecodeError room为空');
						}
						// 另一种解析异常，没有出现导航图片 或者 top_view中points 为[]
						results[2].data.data.data.navigation.forEach((nav) => {
							if (nav.image === '') {
								DecodeErrorFlag = true;
								console.log('DecodeError nav图片为空');
							}
						});
					} catch (error) {
						// 在取值时候就报错里
						DecodeErrorFlag = true;
						console.log('DecodeError 取值为空');
					}
				}

				if (DecodeErrorFlag) {
					this.$message.error('Analyze Cad Error');
					// this.has_true_cad_data = false;
					this.$store.commit('SET_SHOWFEEDBACKMODAL', true);
				}

				this.reset();

				this.$store.commit('SET_LOADING_TEXT', 'Loading..');
			});
		},

		handleMenuClick(list, e) {
			changeSVGMode(list[e.key]);
		},

		handleDecodeDxfData(resp) {
			// 画图数据 decode_dxf_data
			let decode_dxf_data = resp.data.data.data;
			this.navigations = decode_dxf_data.navigation;
			this.top_views = decode_dxf_data.top_view;
			// 生成region
			// let navigation_bbox = re_format_bbox(
			//   this.navigations[this.svg.active].bbox
			// );
			// let ratios = calculate_ratio_from_bbox(
			//   navigation_bbox,
			//   this.$store.state.config
			// );
			// let ratio = ratios[0];
			// this.ratio = ratio;
			// this.origin_ratio = ratio;

			this.$store.commit('SET_TOP_VIEW_BBOX', decode_dxf_data.top_view_bbox);

			// TODO 初始数据临时判断
			if (
				decode_dxf_data.top_view.length === 6 &&
				decode_dxf_data.top_view_bbox[1][0] === 75000 &&
				decode_dxf_data.top_view_bbox[1][1] === 40000
			) {
				this.has_true_cad_data = false;
				// 此时遗留错误CAD 这里需要把CAD 信息清空
				this.$store.commit('SET_CAD_DATA', {});
			} else {
				this.has_true_cad_data = true;
			}

			if (decode_dxf_data.top_view.length === 0) {
				// 解析异常
				this.$message.error('Analyze Cad Error');
			}

			console.log('this.has_true_cad_data: ', this.has_true_cad_data);
		},

		handleHistoryPlan(resp) {
			// 读取history plans
			console.log('读取history plans ratio: ', this.ratio);
			let listData = resp.data.data;
			listData.forEach((plan) => {
				// 不能在这生成，因为ratio变了后，这些点都需要更新

				//TODO 需要服务端将plan相关的货架信息返回

				let storage_info = this.findSomeInList(this.storages, plan.data.storage_group_id, 'group_id', 'info');
				let name = storage_info && storage_info.name ? storage_info.name : '';

				this.regions.push({
					bbox: plan.data.data.bbox,
					draw_points: [],
					points: [],
					region_id: Number(plan.id),
					room_id: plan.data.room_id,
					region_info: plan.data.region_info,
					algorithm_info: plan.data.algorithm_info,
					element_id: get_id(this.$store.getters.getRegionType.toUpperCase(), plan.id)['newnode_mode_id'],
					top_views: plan.data.data.top_view,
					plan_info: plan.data.data.plan_info,
					info: {
						quantity: this.findSomeInList(plan.data.data.plan_info, 'total_local_quantity'),
						name: name,
						storage_id: plan.id,
						storage_group_id: plan.data.storage_group_id,
					},
				});
				this.regions_count = Number(plan.id);
			});

			// 这里统计整合storage_group_id组的数量的和
			// TODO 修改格式后没有改
			let list = JSON.parse(JSON.stringify(listData));
			let result = list.reduce((obj, ele) => {
				let find = obj.find((i) => i.data.storage_group_id === ele.data.storage_group_id);
				let _d = {
					...ele,
				};
				console.log('ele: ', ele);
				console.log('find: ', find);
				// find
				//   ? ((find.data.data.plan_info.total_local_quantity +=
				//       ele.data.data.plan_info.total_local_quantity),
				//     (find.data.data.plan_info.storage_space +=
				//       ele.data.data.plan_info.storage_space))
				//   : obj.push(_d);
				find
					? (find.data.data.plan_info = this.handlePlanInfo(find.data.data.plan_info.concat(ele.data.data.plan_info)))
					: obj.push(_d);
				return obj;
			}, []);

			console.log('result: ', result);
			result.forEach((rs) => {
				this.storages.forEach((storage) => {
					if (storage.group_id === rs.data.storage_group_id) {
						storage.info.quantity = this.findSomeInList(rs.data.data.plan_info, 'total_local_quantity');
					}
				});
			});
		},

		handlePlanInfo(plan_info) {
			let id_set = new Set();
			let result = [];
			plan_info.forEach((plan) => {
				if (id_set.has(plan.id)) {
					result.forEach((item) => {
						if (item.id === plan.id) {
							if (typeof item.value === 'number') {
								item.value += plan.value;
							}
						}
					});
				} else {
					result.push(plan);
					id_set.add(plan.id);
				}
			});
			return result;
		},

		handleRoomObstaclesHistory(room, room_id) {
			let list = this.$store.getters.graphOperationsListByGroupId(this.$store.getters.getObstaclesType);
			list.forEach((item) => {
				let name = `${item.id}s`;
				// this[`${name}_count`] += room[name].length;
				if (room[name] && room[name].length > 0) {
					room[name].forEach((element, index) => {
						this[`${name}_count`] += 1;

						let type = name.toUpperCase().substr(0, name.length - 1); // guards => GUARD
						let type_id_name = name.substr(0, name.length - 1);
						// console.log('name##: ', name);
						let obj = {
							room_id,
							bbox: sortRegionOrPolygon(element),
							// 判断是region 还是 polygon shape
							// bbox: element,
							element_id: get_id(type, this[`${name}_count`])['newnode_mode_id'],
							points: null,
						};
						obj[`${type_id_name}_id`] = this[`${name}_count`];
						this[name].push(obj);
					});
				}
			});
		},

		getRoomHistory(resp) {
			let listData = resp.data.data;
			console.log('listData: ', listData);
			listData.forEach((room, index) => {
				// 处理walls
				// if (index === 2 || index === 3) {
				this.walls = this.walls.concat(room.data.walls);
				this.saveWalls[room.id] = room.data.walls;
				this.handleRoomObstaclesHistory(room.data, room.id);
				// }
			});
			this.walls_count = this.walls.length;

			// 先合并再画
			// let total = listData.reduce(
			//   (rooms, item) => {
			//     rooms.data.evitables = rooms.data.evitables.concat(
			//       item.data.evitables
			//     );
			//     rooms.data.guards = rooms.data.guards.concat(item.data.guards);
			//     rooms.data.isolates = rooms.data.isolates.concat(item.data.isolates);
			//     rooms.data.obstacles = rooms.data.obstacles.concat(
			//       item.data.obstacles
			//     );
			//     if (item.data.walls) {
			//       rooms.data.walls = rooms.data.walls.concat(item.data.walls);
			//     }

			//     return rooms;
			//   },
			//   {
			//     data: {
			//       evitables: [],
			//       guards: [],
			//       isolates: [],
			//       obstacles: [],
			//       walls: [],
			//     },
			//     id: 'room-total',
			//   }
			// );
			// console.log('total: ', total);
			// this.handleRoomObstaclesHistory(total.data);
		},

		getConnectionItemHistory(resp) {
			// 读取history paths
			let data = resp.data.data;
			let path_list = [];
			let block_list = [];
			path_list = data.moving_paths ? data.moving_paths : [];
			block_list = data.blocks ? data.blocks : [];
			path_list.forEach((element, index) => {
				this.paths.push({
					bbox: element.box,
					info: {
						_direction: element.direction,
						direction: reformat_direction(element.direction),
					},
					path_id: index + 1,
					element_id: get_id('PATH', index + 1)['newnode_mode_id'],
					points: null,
				});
			});
			// 读取history blocks
			block_list.forEach((element, index) => {
				this.blocks.push({
					bbox: element.box,
					info: {
						_direction: element.direction,
						direction: reformat_direction(element.direction),
					},
					block_id: index + 1,
					element_id: get_id('BLOCK', index + 1)['newnode_mode_id'],
					points: null,
				});
			});
			this.paths_count = path_list.length;
			this.blocks_count = block_list.length;
			if (this.paths_count === 0) {
				this.paths = [];
			}
			if (this.blocks_count === 0) {
				this.blocks = [];
			}
		},

		clickMain(e) {
			console.log('clickMain: ', this.svg.mode);

			if (this.svg.mode === 'model') {
				this.svg.mode = 'normal';
			} else if (this.svg.mode === 'normal') {
				// 在移动模式下判断
				let scale = parseFloat(this.$d3.select(`#${get_id()['g']}`).attr('transform_scale'));
				let transform_x = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_x'));
				let transform_y = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_y'));
				// 要注意缩放时
				// 坐标转换 event事件是鼠标松手时候的坐标
				// TODO 现在scale都为1了
				let [x, y] = [toDecimal(e.layerX - transform_x / scale), toDecimal(e.layerY - transform_y / scale)];
				let _x = d3XToCadX(x, this);
				let _y = d3YToCadY(y, this);
				let _room_index = null;
				this.navigations.some((nav, index) => {
					if (_x >= nav.bbox[0][0] && _x <= nav.bbox[1][0] && _y >= nav.bbox[0][1] && _y <= nav.bbox[1][1]) {
						_room_index = index;
						console.log('此时在 ', nav.room);
						return true;
					}
				});
				console.log('_room_index: ', _room_index);
				if (_room_index !== null && Number(this.svg.active) !== Number(_room_index)) {
					// 存在 且和当前不一样 才切换
					this.changeNavCanvas({ key: _room_index });
				}
			}

			let classList = Array.from(e.target.classList);
			if (!classList.includes(get_class()['storage_region_active'])) {
				// 取消高亮该货架类型已经排好的货架
				this.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['storage_region_active'], false);

				// 取消右边货架选中
				this.checkAllStorage = true; // 先取反
				this.onChangeAllStorage();

				// 更新output信息
				// this.updateOutputInfo('room');
				this.getRoomOutputInfo();

				this.$forceUpdate();
			}
		},

		getRoomOutputInfo() {
			let param = {
				type: 'room',
				data: {
					// 当前room参数
					bbox: this.navigations[this.svg.active].bbox,
					obstacles: this.formatPolygon(this.obstacles),
					guards: this.formatPolygon(this.guards),
					isolates: this.formatPolygon(this.isolates),
					evitables: this.formatPolygon(this.evitables),
					// walls: this.saveWalls[this.navigations[this.svg.active].room],
					walls: this.getWalls,
					height: 6000,
					info: '暂无',
				},
			};
			let InfoRes = this.$model.project.postSomeInfo(param);
			InfoRes.then((resp) => {
				console.log('resp: ', resp);
				this.outputInfo = resp.data.data;
			});
		},
		// ----------SVG---------- START

		cancelEditModel() {
			if (this.has_change_model_size_flag) {
				this.SET_TEMP_MODEL({
					update: true,
					id: this.$store.state.animation.temp_model.id,
				});

				this.$d3
					.select(`#${this.$store.state.animation.temp_model.id}>svg`)
					.attr('height', toDecimal(this.$store.state.animation.temp_model.height / this.ratio, 0))
					.attr('width', toDecimal(this.$store.state.animation.temp_model.width / this.ratio, 0));

				// 更新数据
				this.$store.dispatch('update_model', this.$store.state.animation.temp_model.id);
			}
			this.SET_SHOW_EDIT_MODEL(false);
			this.has_change_model_size_flag = false;
		},

		changeModelDirection(value, model = this.$store.state.animation.temp_model) {
			this.$store.dispatch('changeDirection', {
				direction: value,
				model,
			});
		},

		changeModelSize: debounce(function(e) {
			console.log('e: ', e);
			this.has_change_model_size_flag = true;

			// this.SET_TEMP_MODEL({
			//   update: true,
			//   id: this.$store.state.animation.temp_model.id,
			// });
			this.UPDATE_FIXTURES_BY_TEMP();

			this.$d3
				.select(`#${this.$store.state.animation.temp_model.id}>svg`)
				.attr('height', toDecimal(this.$store.state.animation.temp_model.height / this.ratio, 0))
				.attr('width', toDecimal(this.$store.state.animation.temp_model.width / this.ratio, 0));

			// 更新数据放在关闭窗口后
		}, 400),

		// 复制3d模型
		copyModel() {
			let points = BBoxtoPoints(this.$store.state.animation.temp_model.points, this.ratio);
			console.log('copyModel points: ', points);

			const DEVIATION = 20;
			let transform_x = this.$d3.select(`#${get_id()['g']}`).attr('transform_x');
			let transform_y = this.$d3.select(`#${get_id()['g']}`).attr('transform_y');
			let transform_scale = this.$d3.select(`#${get_id()['g']}`).attr('transform_scale');

			let origin_x = Math.min(points[0][0], points[1][0]) + DEVIATION;
			let origin_y = Math.min(points[0][1], points[1][1]) + DEVIATION;

			let x = origin_x + 10 + transform_scale * transform_x;
			let y = origin_y + 50 + 42 + transform_scale * transform_y;

			let event = {
				x,
				y,
			};
			this.dropModel(event);
		},

		// 删除3d模型
		deleteModel() {
			let mode_info = this.$store.state.animation.temp_model;
			let that = this;
			this.$confirm({
				title: `Are you sure delete this ${mode_info.model}?`,
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk() {
					console.log('OK');
					// 删除
					that.$store.commit('DELETE_FIXTURE', mode_info.id);
					that.$d3.select(`#${mode_info.id}`).remove();
					that.$d3.select(`#${get_id()['assist_g']}`).remove();

					that.cancelEditModel();
					that.$store.dispatch('post_model_info');
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		},

		hideSomeNewNode(id, type, flag) {
			clean();
			let group_type = '';
			if (type === 'group') {
				group_type = id;
			} else {
				group_type = this.$store.getters.getGraphTypeById(id);
			}
			// 如果是Region 则控制货架外的region框框显影
			if (id === this.$store.getters.getRegionType) {
				console.log('id: ', id);
				this.$d3.selectAll(`.${get_class()['storage_region']}`).classed('hide-node', !flag);
			}

			this.$store.commit('SET_GRAPH_OPERATIONS_TYPE_SHOW', {
				id,
				type,
				group_type,
				flag,
			});
		},

		// 切换隐藏newnode开关
		hideWallNode(flag) {
			this.isHideWallNode = flag;

			// this.$d3.select(`#${get_id()['path_g']}`).classed('hide-node', flag);
			// 改成切换wall 和 cad_top_view
			this.$d3.select(`#${get_id('WALL')['polygon_item']}`).classed('hide-node', flag);
			this.$d3.select(`#${get_id()['g_topview']}`).classed('hide-node', !flag);
		},
		// 清除所有ConnectionItem
		deleteConnectionItem() {
			let res = this.$model.project.deleteConnectionItem({
				project_id: this.project.project_id,
			});
			res.then((resp) => {
				console.log('resp: ', resp);
				let connection_res = this.$model.project.getConnectionItemHistory(this.project.project_id);
				connection_res.then((cresp) => {
					this.getConnectionItemHistory(cresp);
					this.reset('redraw');
				});
			});
		},
		// 刷新SVG
		reset(type = 'new') {
			// new 初始化  change 更改nav  redraw 重绘
			console.log('reset start ===== ', new Date().getTime());

			// 重绘前保存上次位置信息
			let midpoint = {};
			if (type === 'redraw') {
				let node = this.$d3
					.select(`#${get_id()['g']}`)
					.node()
					.getBBox();
				midpoint = node;

				midpoint.scale = this.$d3.select(`#${get_id()['g']}`).attr('transform_scale');
				midpoint.transform_x = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_x'));
				midpoint.transform_y = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_y'));
				midpoint.width = node.width * this.$d3.select(`#${get_id()['g']}`).attr('transform_scale');
				midpoint.height = node.height * this.$d3.select(`#${get_id()['g']}`).attr('transform_scale');

				this.$d3.select(`#${get_id()['svg']}`).remove(); // 清空
			}

			// 0, 计算总bbox navitate-bbox
			let bbox = calculate_bbox_from_navigation(this.navigations);
			console.log('#0 bbox: ', bbox);
			let navigation_bbox = re_format_bbox(this.navigations[this.svg.active].bbox);
			this.navigation_bbox = navigation_bbox;

			let ratio = null;
			if (type === 'redraw') {
				ratio = this.ratio;
			} else {
				// 1, 计算实际缩放比例
				let ratios = calculate_ratio_from_bbox(navigation_bbox, this.$store.state.config);
				ratio = ratios[0];
				this.ratio = ratio;
				this.origin_ratio = ratio;
			}

			// 2. 绘制底层svg
			let config = {
				vue: this,
				width: this.config.graph_width,
				height: this.config.graph_height,
			};
			const graph = new SvgGraph(config);
			this.graph = graph;
			let [svg, g, path_g] = graph.draw();
			this.svg.svg = svg;
			this.svg.g = g;
			this.svg.path_g = path_g;
			// graph.translate(20, -20, 1);

			// 2.5 绘制defs标签内的标记物
			let marker = new Marker({
				father: svg,
				data: [
					{
						id: get_id('DOWN', 'PATH')['arrow'],
						class: get_class('vertical')['arrow'],
						direction: 'down',
						type: 'path',
					},
					{
						id: get_id('RIGHT', 'PATH')['arrow'],
						class: get_class('horizontal')['arrow'],
						direction: 'right',
						type: 'path',
					},
					{
						id: get_id('DOWN', 'BLOCK')['arrow'],
						class: get_class('vertical')['arrow'],
						direction: 'down',
						type: 'block',
					},
					{
						id: get_id('RIGHT', 'BLOCK')['arrow'],
						class: get_class('horizontal')['arrow'],
						direction: 'right',
						type: 'block',
					},
				],
			});
			marker.drawArrow();

			// 需要有一个背景来支持选中操作，不然无法选择操作元素
			// 3, 绘制 bbox bg 整体仓库黑色背景块
			let bbox_config = {
				svg: this.svg.g,
				data: bbox,
				ratio: this.ratio,
				config: this.config,
			};
			let rect = new BboxGraph(bbox_config);
			rect.draw().lower(); //插到头部

			// 绘制top view
			let topview_config = {
				svg: this.svg.g,
				ratio: this.ratio,
				config: this.config,
				data: this.top_views,
			};
			let topview = new TopViewGraph(topview_config);
			topview.draw();

			let g_node = g.node().getBBox();

			if (type === 'redraw') {
				// 平移到重绘前的位置

				// 原理： 坐标 ⟨x,y⟩ 被变换到 ⟨xk + tx,yk + ty⟩
				// transform.x - 在x-轴上的平移量 tx
				// transform.y - 在y-轴上的平移量 ty
				// transform.k - 缩放因子 k
				// 所以 坐标 ⟨x,y⟩ => transform(tx, ty , s)     ===    ⟨x1,y1⟩ => transform(tx1, ty1 , 1)
				// 所以 xk + tx = x1 + tx1
				let x = midpoint.scale * midpoint.x + midpoint.transform_x - g_node.x;
				let y = midpoint.scale * midpoint.y + midpoint.transform_y - g_node.y;

				this.graph.translate(x, y, 1);
			} else {
				// 平移居中
				let translate = calculate_translate_xy(navigation_bbox, this.config, this.ratio);
				this.graph.translate(translate[0], translate[1], 1);
			}

			// 绘制active navigator rect 选中仓间的框框
			let active_bbox_config = {
				svg: this.svg.g,
				data: navigation_bbox,
				ratio: this.ratio,
				config: this.config,
				id: get_id()['active_bbox'],
				class: get_class()['active_bbox'],
			};
			let active_rect = new BboxGraph(active_bbox_config);
			active_rect.draw();

			// 绘制regions和已有方案的plan（top view）
			this.regions.forEach((element) => {
				if (element.top_views) {
					// 更新point 和 draw_points
					element.points = bboxToPoints(element.bbox, this.ratio, this.config.graph_height);

					let draw_points = [];
					element.top_views.forEach((ele, index) => {
						draw_points[index] = [];
						ele['points'].forEach((item) => {
							let points = [];
							points = [
								toDecimal(item[0] / this.ratio),
								toDecimal(yTrans(item[1] / this.ratio, this.config.graph_height)),
							];
							draw_points[index].push(points);
						});
					});
					element.draw_points = draw_points;

					topview_config.data = element.top_views;
					// topview_config.title = `REGIONS-${element.region_id}`;
					topview_config.title = get_id('REGIONS', element.region_id)['g_type_id'];
					topview_config.classes = get_class(element.info.storage_group_id)['storage_sgroup_sgid'];
					let tv = new TopViewGraph(topview_config);
					tv.draw();

					// 绘制active region rect 点击
					let active_bbox_config = {
						svg: this.svg.g,
						data: element.bbox.flat(1),
						ratio: this.ratio,
						config: this.config,
						id: get_id(element.info.storage_id, element.info.storage_group_id, element.region_id)[
							'storage_bbox_sid_sgid_rid'
						],
						class: `${get_class(element.info.storage_id)['storage_region_sid']} ${get_class()['storage_region']} ${
							get_class(element.info.storage_group_id)['storage_sgroup_sgid']
						} ${element.room_id}`,
					};
					let active_rect = new BboxGraph(active_bbox_config);
					let active_rect_node = active_rect.draw();
					let that = this;

					// active_rect_node 绑定事件
					let bindData = {
						storage_id: element.info.storage_id,
						storage_group_id: element.info.storage_group_id,
						region_id: element.region_id,
						storage_info: element.info,
						quantity: element.info.quantity,
						plan_info: element.plan_info,
					};
					this.bindEventToActiveRect(active_rect, active_rect_node, bindData);
				} else {
					// 更新point
					this.redrawNode(element, this.$store.getters.getRegionType, type);
				}
			});

			// 普通新节点绘制
			let redrawList = this.$store.getters.graphOperationsListByGroupId([
				this.$store.getters.getObstaclesType,
				this.$store.getters.getConnectionItemType,
			]);

			redrawList.forEach((item) => {
				let name = item.id;
				this[`${name}s`].forEach((element) => {
					this.redrawNode(element, name, type);
				});
			});

			// 绘制特殊节点 wall
			this.redrawWall();

			// 绘制特殊节点 line
			this.redrawLine();

			// this.updateOutputInfo('room');
			this.getRoomOutputInfo();

			this.hideWallNode(this.isHideWallNode);

			// 排序
			this.$d3.select(`#${get_id()['path_g']}`).raise();
			this.$d3.selectAll(`.${get_class()['storage_region']}`).raise();
			this.$d3.select(`#${get_id()['active_bbox']}`).raise();

			if (type === 'redraw' || type === 'change') {
				// 保持原有的隐藏状态
				this.config.graph_operations.forEach((graph) => {
					if (!graph.show) {
						this.hideSomeNewNode(graph.id, 'group', false);
					} else if (Array.isArray(graph.data)) {
						graph.data.forEach((item) => {
							if (!item.show) {
								this.hideSomeNewNode(item.id, 'item', false);
							}
						});
					}
				});
			} else {
				this.$store.commit('SET_GRAPH_OPERATIONS_ALL_SHOW', {
					flag: true,
				});

				// TODO 默认隐藏 connectionitem
				// this.hideSomeNewNode(
				//   this.$store.getters.getConnectionItemType,
				//   'group',
				//   false
				// );
				// 默认隐藏block
				this.hideSomeNewNode('block', 'item', false);
				// 默认隐藏 guard 和 evitable
				this.hideSomeNewNode('guard', 'item', false);
				this.hideSomeNewNode('evitable', 'item', false);
			}

			// 画model
			let model_svg = g.append('g').attr('id', get_id()['model']);
			let fixtures = this.$store.state.animation.fixtures;
			fixtures.forEach((fixture) => {
				let points = BBoxtoPoints(fixture.points, this.ratio);
				console.log('#fixtures points: ', points);
				let config = {
					svg: model_svg,
					name: fixture.model,
					x: Math.min(points[0][0], points[1][0]),
					y: Math.min(points[0][1], points[1][1]),
					vue: this,
					id: fixture.id.split('-')[1],
					width: fixture.width,
					height: fixture.height,
					points: fixture.points,
					customizable: fixture.customizable,
					direction: fixture.direction,
					type: 'redraw',
					ratio: this.ratio,
				};
				let model = new ModelGraph(config);
				model.draw();

				// 旋转中心为svg 内部元素坐标系中心点坐标 即viewBox的1/2
				let _rotate = fixture.hasDirections.includes(fixture.direction) ? 0 : 180;
				let viewBox = this.$d3
					.select(`#${fixture.id}>svg`)
					.attr('viewBox')
					.split(' ');
				this.$d3
					.select(`#${fixture.id}>svg>g`)
					.attr('transform', `rotate(${_rotate} ${viewBox[2] / 2}, ${viewBox[3] / 2})`);
			});

			// 设置点击穿透
			this.navigations.forEach((nav, index) => {
				if (index === this.svg.active * 1) {
					console.log('nav.room: ', nav.room);
					this.$d3.selectAll(`.${nav.room}`).classed(get_class()['click_through'], false);
				} else {
					this.$d3.selectAll(`.${nav.room}`).classed(get_class()['click_through'], true);
				}
			});

			this.$store.commit('UPDATE_IS_ZOOMING', false);

			// 统计当前svg 元素个数
			let p_s = this.$d3.selectAll('path').size();
			let po_s = this.$d3.selectAll('polygon').size();
			console.log('path_s: ', p_s);
			console.log('polygon_s: ', po_s);

			console.log('reset end ===== ', new Date().getTime());
		},

		redrawWall() {
			if (this.walls.length > 0) {
				let node = new PathGraph({
					vue: this,
					father_id: get_id()['path_g'],
					// father_id: get_id(this.$store.getters.getObstaclesType.toUpperCase())[
					//   'newnode_group_g'
					// ],
					data: this.walls,
					saveWalls: this.saveWalls,
					mode: 'wall',
					id: get_id('WALL')['polygon_item'],
				});
				node.draw();
			}
		},
		redrawLine() {
			if (this.lines.length > 0) {
				let line_node = new LineGraph({
					vue: this,
					father_id: get_id()['path_g'],
				});
				this.lines.forEach((item) => {
					// 更新数据
					line_node.redraw(item);
				});
			}
		},
		redrawNode(element, mode, type) {
			// 需要判断是region类型的还是polygon类型的
			let is_polygon_flag = false;
			if (element.bbox.length > 2) {
				is_polygon_flag = true;
			}

			if (element.points === null || type !== 'new') {
				// 新添或者更新
				element.points = [];
				element.bbox.forEach((point) => {
					element.points.push([
						toDecimal(point[0] / this.ratio),
						toDecimal(yTrans(point[1] / this.ratio, this.config.graph_height)),
					]);
				});
				// 数据需要处理
			}
			if (!is_polygon_flag) {
				// 需要排序

				element.points = [
					[Math.min(element.points[0][0], element.points[1][0]), Math.min(element.points[0][1], element.points[1][1])],
					[Math.max(element.points[0][0], element.points[1][0]), Math.max(element.points[0][1], element.points[1][1])],
				];
				this.new_node.id = element.element_id;

				let node = new NewNodeGraph({
					vue: this,
					type: 'add',
					x: element.points[0][0],
					y: element.points[0][1],
					data: element,
				});
				node.draw(mode, element[`${mode}_id`]);
				node.drag({
					x: element.points[1][0],
					y: element.points[1][1],
				});
				node.end('add');
			} else {
				let polygon_node = new PolygonGraph({
					vue: this,
					type: 'add',
					element_id: element.element_id,
					data_id: element[`${mode}_id`],
					mode: mode,
					points: element.points,
					bbox: element.bbox,
				});

				polygon_node.add();
				polygon_node.bindSomeEvent();
			}
		},
		// 更改nav
		changeNavCanvas(e) {
			this.svg.active = e.key;

			this.reset('change');
		},
		// 改变画图类型
		changeSVGMode(mode) {
			console.log('changeSVGMode: ', mode);

			let _mode = `new-${mode}`;
			this.svg.mode = _mode;

			clean();
		},
		// update obstacles信息
		updateObstaclesInfo() {
			let params = {
				project_id: this.project.project_id,
				room_id: this.navigations[this.svg.active].room,
				room: {
					// 当前room参数
					// TODO 要筛选当前仓间的room_info 返回
					bbox: this.navigations[this.svg.active].bbox,
					obstacles: this.formatPolygon(this.obstacles),
					guards: this.formatPolygon(this.guards),
					isolates: this.formatPolygon(this.isolates),
					evitables: this.formatPolygon(this.evitables),
					// walls: this.saveWalls[this.navigations[this.svg.active].room],
					walls: this.getWalls,
					height: 6000,
					info: '暂无',
				},
			};
			let res = this.$model.project.postRoomInfo(params);
			return res;
		},
		// update MovingPath信息
		updateMovingPathInfo() {
			let params = {
				project_id: this.project.project_id,
				connection_item: {
					moving_paths: this.formatPath(this.paths),
					blocks: this.formatPath(this.blocks),
				},
			};
			let res = this.$model.project.postConnectionItemInfo(params);
			return res;
		},

		// 保存画图的节点
		addNewNode() {
			let data = {
				bbox: this.new_node.data.bbox,
				info: {
					direction: this.new_node.data.direction,
					_direction: this.new_node.data._direction,
				},
				room_id: this.navigations[this.svg.active].room,
				element_id: this.new_node.id,
				points: this.new_node.points,
			};
			console.log('addNewNode data: ', data);
			data[`${this.new_node.type}_id`] = this.new_node.data.id;
			this[`${this.new_node.type}s`].push(data);

			// 发请求保存数据
			let type_id = this.$store.getters.getGraphTypeById(this.new_node.type);

			if (type_id === this.$store.getters.getObstaclesType) {
				// "obstacles"
				this.updateObstaclesInfo();
			} else if (type_id === this.$store.getters.getConnectionItemType) {
				// "moving_paths"
				this.updateMovingPathInfo();
			}
		},
		// 保存region节点数据
		addRegion() {
			let [x1, y1, x2, y2] = [
				this.new_node.data.x,
				this.new_node.data.y,
				this.new_node.data.x1,
				this.new_node.data.y1,
			].map((item) => {
				return parseFloat(item);
			});
			let [xmin, ymin, xmax, ymax] = [x1 > x2 ? x2 : x1, y1 > y2 ? y2 : y1, x1 < x2 ? x2 : x1, y1 < y2 ? y2 : y1];
			let region_data = {
				region_id: this.new_node.data.id,
				bbox: [xmin, ymin, xmax, ymax],
				element_id: this.new_node.id,
				points: this.new_node.points,
			};
			this.regions.push(region_data);
		},
		// 保存obsacle节点数据
		addObsacle() {},

		// 更新newnode节点信息
		updateNewNode(id) {
			let node = this.$d3.select(`#${id}`);
			console.log('id: ', id);
			let list = id.split('-');
			let index = 2;
			if (list.length === 3) {
				index = 1;
			}
			let type = list[index].toLowerCase(); // 更改了ID结构
			this[`${type}s`].forEach((item) => {
				if (item.element_id === id) {
					// 判断是否是ploygon shape的
					if (node.attr('shape') === 'polygon') {
						item['bbox'] = format_polygon_bbox(node.attr('bbox'));
						item['points'] = format_polygon_points(node.attr('points'));
						return item;
					} else {
						item['bbox'] = format_bbox(node.attr('bbox'));
						item['points'] = format_points(node.attr('points'));
						return item;
					}
				}
			});

			// 发请求保存数据
			let type_id = this.$store.getters.getGraphTypeById(type);

			if (type_id === this.$store.getters.getObstaclesType) {
				// "obstacles"
				this.updateObstaclesInfo();
			} else if (type_id === this.$store.getters.getConnectionItemType) {
				// "moving_paths"
				this.updateMovingPathInfo();
			}
		},

		// 关闭编辑货架弹窗
		cancelEditStorage(clean = false) {
			this.show_edit_storage = false;
			this.update_storage = false;
			if (clean) {
				// 取消选中某一行storage
				this.select_index = null;
				// 删除img
				this.$d3.selectAll(`.${get_class()['storage_img']}`).remove();
			}
		},
		// 重排货架
		rePaint() {
			// 先删除旧的plan
			// 更新storage_id
			// 生成新的plan
			this.cancelEditStorage(false);
			this.update_storage = true;
			// 重新排布
			this.$d3.select(`#${get_id()['assist_g']}`).remove();
			this.storages.forEach((ele, index) => {
				if (ele.id === this.edit_storage_info.storage_id) {
					this.select_index = index;
				}
			});
			// 重排货架时要更新当前region的points和bbox
			this.calculateStorageRegion(
				this.edit_storage_info.storage_id,
				this.edit_storage_info.storage_info.storage_group_id,
				[this.edit_storage_info.region_id],
				null,
				null
			);
		},
		onChangeDeleteRegionTogether(e) {
			console.log('e: ', e);
			this.deleteRegionTogether = e.target.checked;
			this.$forceUpdate();
		},
		// 删除排好的货架
		deletePaintedStorage(confirm = true) {
			let that = this;
			const func = () => {
				console.log('OK');
				// 发生接口请求删除
				const params = {
					project_id: that.project.project_id,
					storage_id: that.edit_storage_info.storage_id,
					storage_group_id: that.edit_storage_info.storage_info.storage_group_id,
					type: 'storage', //group/storage  删除一行/一个区域
				};
				let res = this.$model.project.deleteProjectHistory(params);
				res.then((data) => {
					// 删除top_views
					that.$d3.select(`#${get_id('REGIONS', that.edit_storage_info.region_id)['g_type_id']}`).remove();
					that.$d3
						.select(
							`#${
								get_id(
									that.edit_storage_info.storage_id,
									that.edit_storage_info.storage_info.storage_group_id,
									that.edit_storage_info.region_id
								)['storage_bbox_sid_sgid_rid']
							}`
						)
						.remove();

					clean();
					that.show_edit_storage = false;
					// 更新storages
					that.storages.forEach((element) => {
						if (element.group_id === that.edit_storage_info.storage_info.storage_group_id) {
							element.info.quantity -= that.edit_storage_info.quantity;
							that.storages_id++;
							element.id = that.storages_id;
							return element;
						}
					});
					// 删除该plan 保存在region里 重排时不删除regions 直接更新里面内容
					if (this.deleteRegionTogether) {
						// 删除时一起删除region
						if (confirm) {
							that.regions = that.regions.filter((region) => {
								if (region.info.storage_id * 1 !== that.edit_storage_info.storage_id * 1) {
									return region;
								}
							});
						}
					} else {
						// 删除时保留该region，删除货架
						console.log('保留region');
						that.regions.forEach((region) => {
							if (region.info.storage_id * 1 === that.edit_storage_info.storage_id * 1) {
								let propList = ['algorithm_info', 'draw_points', 'info', 'plan_info', 'region_info', 'top_views'];
								propList.forEach((prop) => {
									delete region[prop];
								});
								region['info'] = {};
								return region;
							}
						});
						that.reset('redraw');
					}
					that.deleteRegionTogether = true;
				});
			};
			if (confirm) {
				const h = this.$createElement;
				let _content = h(
					'a-checkbox',
					{
						// 组件属性
						props: {
							defaultChecked: that.deleteRegionTogether,
						},
						// dom动态属性
						domProps: {
							checked: that.deleteRegionTogether,
						},
						on: {
							change: that.onChangeDeleteRegionTogether,
						},
					},
					'Whether or not delete region together'
				);

				let content = h('div', {}, [
					h(
						'p',
						{
							style: {
								margin: '0 0 10px 0',
							},
						},
						`Name: ${that.edit_storage_info.storage_info.name}, Quantity: ${that.edit_storage_info.quantity}`
					),
					_content,
				]);

				that.$confirm({
					title: 'Are you sure delete this storage?',
					// content: `Name: ${that.edit_storage_info.storage_info.name}, Quantity: ${that.edit_storage_info.quantity}`,
					content: content,
					okText: 'Yes',
					okType: 'danger',
					cancelText: 'No',
					onOk() {
						func();
					},
					onCancel() {
						that.deleteRegionTogether = true;
						console.log('Cancel');
					},
				});
			} else {
				func();
			}
		},

		formatPolygon(obstacles, room_id = this.navigations[this.svg.active].room) {
			let result = [];
			if (obstacles.length > 0) {
				obstacles.forEach((obstacle) => {
					if (obstacle.room_id === room_id) {
						// 输出都统一以polygon 格式输出
						let bbox = JSON.parse(JSON.stringify(obstacle.bbox)); // 避免影响原bbox
						result.push(allToPolygon(bbox));
					}
				});
			}
			return result;
		},

		formatRegion(list) {
			let result = [];
			if (list.length > 0) {
				list.forEach((item) => {
					result.push(item.bbox);
				});
			}
			return result;
		},

		formatPath(list) {
			let result = [];
			if (list.length > 0) {
				list.forEach((item) => {
					result.push({
						box: item.bbox,
						direction: item.info._direction,
					});
				});
			}
			return result;
		},

		getGroupId(id) {
			this.storages.forEach((item) => {
				if (item.id === id) {
					return item.group_id;
				}
			});
		},

		findSomeInList(list, find, id = 'id', value = 'value') {
			let result = null;
			let r = list.find((item) => {
				return item[id] === find;
			});
			if (r && r[value]) {
				result = r[value];
			}
			return result;
		},

		// 拖拽货架进region区域
		calculateStorageRegion(storage_id, storage_group_id, regions, element, command) {
			if (!command) {
				// 判断 所选region是不是在当前仓间中
				console.log('判断 regions: ', regions);
				let regions_id = regions[regions.length - 1];
				let region_item = this.regions.find((item) => {
					return Number(item.region_id) === Number(regions_id);
				});
				console.log('region_item: ', region_item);
				if (region_item && region_item.room_id && region_item.room_id === this.navigations[this.svg.active].room) {
					// 重置算法info信息
					if (region_item.region_info && region_item.algorithm_info) {
						this.region_info = JSON.parse(JSON.stringify(region_item.region_info));
						this.algorithm_info = JSON.parse(JSON.stringify(region_item.algorithm_info));
					} else {
						let list = ['region', 'algorithm'];
						list.forEach((item) => {
							this[`${item}_info`] = JSON.parse(JSON.stringify(this[`origin_${item}_info`]));
						});
					}
					// TODO 人工排序
					this.algorithm_info.map((item, index) => {
						if (item.name === 'quantity') {
							this.algorithm_info.unshift(this.algorithm_info.splice(index, 1)[0]);
						}
					});

					this.show_region_confirm = true;

					this.choose_storage_region = {
						element: element,
						regions: regions,
						storage_id: storage_id,
						storage_group_id: storage_group_id,
					};
				} else {
					this.$message.warning(
						`Please select the region in the current room(${this.navigations[this.svg.active].room}).`
					);
				}
			} else if (command === 1) {
				let [storage_id, storage_group_id, regions, element] = [
					this.choose_storage_region.storage_id,
					this.choose_storage_region.storage_group_id,
					this.choose_storage_region.regions,
					this.choose_storage_region.element,
				];
				// 多个region重叠的时候 取最后一个
				let regions_id = regions[regions.length - 1];
				console.log('regions_id: ', regions_id);

				let region_item = this.regions.find((item) => {
					return Number(item.region_id) === Number(regions_id);
				});
				// ID不同了
				let regions_bbox = '';
				console.log('this.update_storage: ', this.update_storage);
				if (this.update_storage) {
					let bbox_node = this.$d3.select(
						`#${get_id(storage_id, storage_group_id, regions_id)['storage_bbox_sid_sgid_rid']}`
					);
					regions_bbox = this.$d3
						.select(`#${get_id(storage_id, storage_group_id, regions_id)['storage_bbox_sid_sgid_rid']}`)
						.attr('bbox');
					// 重排货架时要更新当前region的points和bbox
					this.regions.forEach((region) => {
						if (Number(region.region_id) === Number(regions_id)) {
							console.log('更新当前region的points和bbox');
							region.points = format_points(bbox_node.attr('points'));
							region.bbox = format_bbox(bbox_node.attr('bbox'));
							console.log('region: ', region);
						} else {
							console.log('未更新 ', region.region_id, regions_id);
						}
					});
					// 先删除现有的该货架 TODO 异步问题
					let res = this.deletePaintedStorage(false);
					// 更新 storage_id
					this.storages_id++;
					storage_id = this.storages_id;
				} else {
					regions_bbox = this.$d3.select(`#${get_id(regions_id)['newnode_rid']}`).attr('bbox');
				}
				console.log('region node', this.$d3.select(`#${get_id(regions_id)['newnode_rid']}`));
				setTimeout(() => {
					this.storages[this.select_index].info.storage_id = storage_id;
					this.storages[this.select_index].info.storage_group_id = storage_group_id; //

					const params = {
						project_id: this.project.project_id,
						session_id: -1,
						room_id: this.navigations[this.svg.active].room,
						storage_data: {
							info: this.storages[this.select_index].info,
							data: this.storages[this.select_index].baseInfo,
							thumbnail: this.storages[this.select_index].thumbnail,
						},
						room: {
							// 当前room参数
							bbox: this.navigations[this.svg.active].bbox,
							obstacles: this.formatPolygon(this.obstacles),
							guards: this.formatPolygon(this.guards),
							isolates: this.formatPolygon(this.isolates),
							evitables: this.formatPolygon(this.evitables),
							// walls: this.saveWalls[this.navigations[this.svg.active].room],
							walls: this.getWalls,
							height: 6000,
							info: '暂无',
						},
						region: {
							// 所选中room region 参数
							bbox: format_bbox(regions_bbox), // 坐标
						},
						region_info: this.region_info,
						algorithm_info: this.algorithm_info,
						connection_item: {
							moving_paths: this.formatPath(this.paths),
							blocks: this.formatPath(this.blocks),
						},
					};
					console.log('params: ', params);
					localStorage.setItem('params', JSON.stringify(params));
					let res = this.$model.cad.calculateProjectPlan(params);
					res.then((data) => {
						let plan_info = data.data.data.plan_info;

						let quantity = this.findSomeInList(plan_info, 'total_local_quantity');
						clean();
						// data.data.data.top_view['storage_id'] = storage_id;
						// data.data.data.top_view['regions_id'] = regions_id;
						// this.top_views = this.top_views.concat(data.data.data.top_view);
						// 更新storages
						this.storages.forEach((element) => {
							if (element.group_id === storage_group_id) {
								element.info.quantity += quantity;
								// if (element.info.quantity < 0) {
								//   element.info.full = true;
								// }
								this.storages_id++;
								element.id = this.storages_id; //TODO ID计算完后+1,下一次计算
								return element;
							}
						});
						let output_info = null;

						// 将storage info 存近region中
						this.regions.forEach((element) => {
							if (Number(element.region_id) === Number(regions_id)) {
								output_info = plan_info;

								// 更新region的bbox和points
								element['bbox'] = data.data.data.bbox;
								element['points'] = BBoxtoPoints(data.data.data.bbox, this.ratio);
								element['region_info'] = JSON.parse(JSON.stringify(this.region_info));
								element['algorithm_info'] = JSON.parse(JSON.stringify(this.algorithm_info));

								element['plan_info'] = plan_info;
								element.info = {};
								element.info['name'] = params.storage_data.info.name; //保证name第一
								// element.info = Object.assign(element.info, data.data.data.info);
								element.info = Object.assign(element.info, {});
								element.info['name'] = params.storage_data.info.name;
								element.info['area'] = quantity * 5;
								element.info['quantity'] = quantity;
								element.info['storage_id'] = storage_id;
								element.info['storage_group_id'] = storage_group_id;
								// 生成绘图points，方便吸附选点
								element['draw_points'] = [];
								data.data.data.top_view.forEach((ele, index) => {
									element['draw_points'][index] = [];
									ele['points'].forEach((item) => {
										let points = [];
										points = [
											toDecimal(item[0] / this.ratio),
											toDecimal(yTrans(item[1] / this.ratio, this.config.graph_height)),
										];
										element['draw_points'][index].push(points);
									});
								});
								element.top_views = data.data.data.top_view;
								return element;
							}
						});
						// 绘制top view
						let topview_config = {
							svg: this.svg.g,
							ratio: this.ratio,
							config: this.config,
							classes: get_class(storage_group_id)['storage_sgroup_sgid'],
							title: get_id('REGIONS', regions_id)['g_type_id'],
							data: data.data.data.top_view,
						};
						let topview = new TopViewGraph(topview_config);
						topview.draw();

						// 绘制active region rect 点击
						let active_bbox_config = {
							svg: this.svg.g,
							data: data.data.data.bbox.flat(1),
							ratio: this.ratio,
							config: this.config,
							id: get_id(storage_id, storage_group_id, regions_id)['storage_bbox_sid_sgid_rid'],
							class: `${get_class(storage_id)['storage_region_sid']} ${get_class()['storage_region']} ${
								get_class(storage_group_id)['storage_sgroup_sgid']
							} ${region_item.room_id}`,
						};
						let active_rect = new BboxGraph(active_bbox_config);
						let active_rect_node = active_rect.draw();
						let that = this;

						// active_rect_node 绑定事件
						let bindData = {
							storage_id,
							storage_group_id,
							region_id: regions_id, // TODO 合并
							storage_info: params.storage_data.info,
							quantity,
							plan_info: output_info,
						};
						this.bindEventToActiveRect(active_rect, active_rect_node, bindData);

						// TODO
						this.$d3.select(`#${get_id(regions_id)['newnode_rid']}`).remove(); // 删除Region
						this.$message.info(`storage_id:${storage_id}, regions:${regions}`);
					});

					console.log('regions: ', regions);
					console.log('storage_id: ', storage_id);
					// this.$d3.select(element).remove(); // 删除Region
					this.calculateStorageRegion(null, null, null, null, 2);
					this.select_index = null;
				}, 100);
			} else {
				// 存在则复位
				// if (this.choose_storage_region.element) {
				//   this.$d3
				//     .select(this.choose_storage_region.element)
				//     .attr(
				//       'x',
				//       this.$d3
				//         .select(this.choose_storage_region.element)
				//         .attr('origin_x')
				//     )
				//     .attr(
				//       'y',
				//       this.$d3
				//         .select(this.choose_storage_region.element)
				//         .attr('origin_y')
				//     );
				// }
				this.show_region_confirm = false;
				this.update_storage = false;

				this.choose_storage_region = {
					element: null,
					regions: [],
					storage_id: null,
					storage_group_id: null,
				};
			}
		},

		// 给active_rect绑定事件
		bindEventToActiveRect(active_rect, active_rect_node, data) {
			let { storage_id, storage_group_id, region_id, storage_info, quantity, plan_info } = data;
			let that = this;
			let active_rect_id = get_id(storage_id, storage_group_id, region_id)['storage_bbox_sid_sgid_rid'];

			// 绑定右键
			active_rect.bindEvent(active_rect_node, svgContextmenuEvent, this, function() {
				// 先取消所有高亮
				that.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['storage_region_active'], false);

				// 高亮该货架类型已经排好的货架
				that.$d3
					.select(`#${get_id(storage_id, storage_group_id, region_id)['storage_bbox_sid_sgid_rid']}`)
					.classed(get_class()['storage_region_active'], true);

				// 查找select_index
				that.storages.forEach((storage, index) => {
					if (storage.group_id == storage_group_id) {
						that.select_index = index;
					}
				});

				that.show_edit_storage = true;
				that.edit_storage_info.storage_id = storage_id;
				that.edit_storage_info.region_id = region_id;
				that.edit_storage_info.storage_info = storage_info;
				that.edit_storage_info.quantity = quantity;
			});

			// 绑定左键
			active_rect.bindEvent(active_rect_node, svgClickEvent, this, function() {
				console.log('active_rect_node: ', active_rect_node);

				// 如果不是在移动模式下 无法点击选中active_rect
				if (that.svg.shape !== 'normal') {
					console.log('error shape: ', that.svg.shape);
					return false;
				}

				// 绑定键盘事件
				active_rect_node.on('keydown', function() {
					var e = that.$d3.event;
					console.log('e.keyCode: ', e.keyCode);
					const BACKSPACE = 8;
					const DELETE = 46;
					if (e.keyCode === DELETE || e.keyCode === BACKSPACE) {
						that.edit_storage_info.storage_id = storage_id;
						that.edit_storage_info.region_id = region_id;
						that.edit_storage_info.storage_info = storage_info;
						that.edit_storage_info.quantity = quantity;
						that.deletePaintedStorage(true);
					}
				});

				// 清除辅助点
				that.$d3.selectAll(`#${get_id()['assist_g']}`).remove();

				// 先取消所有高亮
				that.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['storage_region_active'], false);

				// 先全部取消选中
				that.checkAllStorage = true; // 先取反
				that.onChangeAllStorage();

				// 高亮该货架类型已经排好的货架
				that.$d3.select(`#${active_rect_id}`).classed(get_class()['storage_region_active'], true);

				// 与右边的货架选中联动起来
				that.storages.forEach((storage, index) => {
					if (storage.group_id == storage_group_id) {
						storage.checked = false; // 先取反
						that.onChangeStorageItem(null, storage, 'left');
					}
				});

				// 新增辅助点
				addAssistPoints(active_rect_id, that);

				that.$d3.select(`#${active_rect_id}`).classed(get_class()['has_assist'], true);

				// 添加尺寸展示
				if (that.$d3.select(`#${get_id()['temp_text']}`).size() === 0) {
					that.svg.path_g
						.append('text')
						.text('')
						.attr('id', get_id()['temp_text'])
						.attr('text-anchor', 'start')
						.style('font-size', '20px')
						.attr('dy', 8);
				}
				let bbox = format_bbox(active_rect_node.attr('bbox'));
				let size_x = that.getLength(bbox);
				let size_y = that.getWidth(bbox);

				that.$d3
					.select(`#${get_id()['temp_text']}`)
					.text(`${size_x} * ${size_y}`)
					.attr('stroke', color_config()['region'])
					.attr('fill', color_config()['region'])
					.attr('x', active_rect_node.node().getBBox().x)
					.attr('y', active_rect_node.node().getBBox().y - 15);

				// 添加tools 浮窗
				let origin_node = that.$d3
					.select(`#${active_rect_id}`)
					.node()
					.getBBox();
				console.log('origin_node: ', origin_node);
				let tools = new ToolsGraph({
					vue: that,
					x: origin_node.x + origin_node.width,
					y: origin_node.y,
					iconList: ['icon_reset', 'icon_confirm', 'icon_delete'],
					funcList: [
						function() {
							// reset
							console.log('icon_reset');
							let origin_points = that.$d3.select(`#${active_rect_id}`).attr('origin_points');
							let origin_bbox = that.$d3.select(`#${active_rect_id}`).attr('origin_bbox');
							if (!origin_points || !origin_bbox) {
								return;
							}
							// 记住开始的位置
							that.$d3
								.select(`#${active_rect_id}`)
								.attr('points', origin_points)
								.attr('bbox', origin_bbox);

							// 将节点更新保存
							that.updateNewNode(active_rect_id);
							that.$d3.select(`#${get_id()['assist_g']}`).remove();
							addAssistPoints(active_rect_id, that);
							// 拖拽结束后重新生成tools
							origin_node = that.$d3
								.select(`#${active_rect_id}`)
								.node()
								.getBBox();
							tools.redraw(origin_node.x + origin_node.width, origin_node.y);
						},
						function() {
							// confirm 重排
							// 与右键函数相同 //TODO
							// 先取消所有高亮
							that.$d3
								.selectAll(`.${get_class()['storage_region']}`)
								.classed(get_class()['storage_region_active'], false);

							// 高亮该货架类型已经排好的货架
							that.$d3.select(`#${active_rect_id}`).classed(get_class()['storage_region_active'], true);

							// 查找select_index
							that.storages.forEach((storage, index) => {
								if (storage.group_id == storage_group_id) {
									that.select_index = index;
								}
							});

							that.edit_storage_info.storage_id = storage_id;
							that.edit_storage_info.region_id = region_id;
							that.edit_storage_info.storage_info = storage_info;
							that.edit_storage_info.quantity = quantity;
							that.rePaint();
						},
						function() {
							// delete
							console.log('icon_delete');
							that.edit_storage_info.storage_id = storage_id;
							that.edit_storage_info.region_id = region_id;
							that.edit_storage_info.storage_info = storage_info;
							that.edit_storage_info.quantity = quantity;
							that.deletePaintedStorage(true);
						},
					],
				});
				tools.draw();

				let start_x = 0;
				let start_y = 0;
				let has_assist = false;
				console.log('storage_id: ', storage_id);
				console.log('region_id: ', region_id);

				// 添加吸附组件
				let _adsorb = new Adsorb({
					vue: that,
					isExcluded: false,
					mode: 'mark',
					type: 'translate',
				});

				// 绑定拖拽事件
				active_rect_node.call(
					that.$d3
						.drag()
						.on('start', function() {
							has_assist = that.$d3.select(`#${active_rect_id}`).classed(get_class()['has_assist']);
							if (!has_assist) return;
							tools.destroy();

							let point = that.$d3.event;
							// start_x = point.x;
							// start_y = point.y;
							that.$d3.select(`#${get_id()['assist_g']}`).remove();

							// 记住开始的位置
							that.$d3
								.select(`#${active_rect_id}`)
								.attr('origin_points', that.$d3.select(`#${active_rect_id}`).attr('points'))
								.attr('origin_bbox', that.$d3.select(`#${active_rect_id}`).attr('bbox'));

							// 吸附开始
							_adsorb.drag_start(active_rect_id, point);
						})
						.on('drag', function() {
							if (!has_assist) return;

							let point = that.$d3.event;

							let points = format_points(that.$d3.select(`#${active_rect_id}`).attr('points'));
							let adsorb = _adsorb.drag(point, points, 0, 0);
							if (adsorb) {
								points = sort_points(adsorb);
							}
							// let remove_x = toDecimal(point.x - start_x);
							// let remove_y = toDecimal(point.y - start_y);

							// let points = format_points(
							//   that.$d3.select(`#${active_rect_id}`).attr('points')
							// );
							// points[0][0] = toDecimal(points[0][0] + remove_x);
							// points[0][1] = toDecimal(points[0][1] + remove_y);
							// points[1][0] = toDecimal(points[1][0] + remove_x);
							// points[1][1] = toDecimal(points[1][1] + remove_y);

							// that.$d3
							//   .select(`#${active_rect_id}`)
							//   .attr('points', re_format_points(points))
							//   .attr('bbox', pointsToBbox(points, that));
							// start_x = point.x;
							// start_y = point.y;
						})
						.on('end', function() {
							if (!has_assist) return;

							// start_x = 0;
							// start_y = 0;
							// 将节点更新保存
							that.updateNewNode(active_rect_id);
							that.$d3.select(`#${get_id()['assist_g']}`).remove();
							addAssistPoints(active_rect_id, that);
							// 拖拽结束后重新生成tools
							origin_node = that.$d3
								.select(`#${active_rect_id}`)
								.node()
								.getBBox();
							tools.redraw(origin_node.x + origin_node.width, origin_node.y);
						})
				);

				console.log('outputInfo element: ', plan_info);
				that.outputInfo = plan_info;
			});
		},

		getLength(bbox) {
			let result = 0;
			if (Array.isArray(bbox) && Array.isArray(bbox[0])) {
				result = Math.abs(bbox[1][0] - bbox[0][0]);
			}
			return result;
		},

		getWidth(bbox) {
			let result = 0;
			if (Array.isArray(bbox) && Array.isArray(bbox[1])) {
				result = Math.abs(bbox[1][1] - bbox[0][1]);
			}
			return result;
		},

		changeItemLength: debounce(function(e) {
			console.log('changeItemLength: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}
			this.temp_path_info.bbox[1][0] = this.temp_path_info.bbox[0][0] * 1 + value;

			this.updateItemSize();
		}, 400),

		changeItemWidth: debounce(function(e) {
			console.log('changeItemWidth: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}
			// this.temp_path_info.bbox[1][1] =
			//   this.temp_path_info.bbox[0][1] * 1 + e.target.value * 1;

			// 由于d3坐标是反过来的
			this.temp_path_info.bbox[0][1] = this.temp_path_info.bbox[1][1] * 1 - value;

			this.updateItemSize();
		}, 400),

		changeItemBbox: debounce(function(e, key1, key2) {
			console.log('changeItemBbox: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}

			this.temp_path_info.bbox[key1][key2] = value;

			this.updateItemSize();
		}, 400),

		updateItemSize() {
			// 根据bbox来更新Item
			let mode = this.temp_path_info.element_id.split('-')[1].toLowerCase();
			this[`${mode}s`].forEach((item) => {
				if (item.element_id === this.temp_path_info.element_id) {
					item.bbox = this.temp_path_info.bbox;
					item.points = [];

					item.bbox.forEach((point) => {
						item.points.push([
							toDecimal(point[0] / this.ratio),
							toDecimal(yTrans(point[1] / this.ratio, this.config.graph_height)),
						]);
					});

					let size_x = this.getLength(item.bbox);
					let size_y = this.getWidth(item.bbox);
					this.$d3
						.select(`#${item.element_id}`)
						.attr('bbox', re_format_polygon_bbox(item.bbox))
						.attr('points', re_format_points(item.points))
						.attr('size', `${size_x} * ${size_y}`);

					this.$d3.select(`#${get_id()['temp_text']}`).text(`${size_x} * ${size_y}`);

					this.updateNewNode(item.element_id);
				}
			});
		},

		changePlanLength: debounce(function(e) {
			console.log('changePlanLength: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}
			this.edit_storage_region_info.bbox[1][0] = this.edit_storage_region_info.bbox[0][0] * 1 + value;

			this.updatePlanSize();
		}, 400),

		changePlanWidth: debounce(function(e) {
			console.log('changePlanWidth: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}

			// 由于d3坐标是反过来的
			this.edit_storage_region_info.bbox[0][1] = this.edit_storage_region_info.bbox[1][1] * 1 - value;

			this.updatePlanSize();
		}, 400),

		changePlanBbox: debounce(function(e, key1, key2) {
			console.log('changeItemBbox: ', e);
			let value = Number(e.target.value);
			if (isNaN(value)) {
				return false;
			}

			this.edit_storage_region_info.bbox[key1][key2] = value;

			this.updatePlanSize();
		}, 400),

		updatePlanSize() {
			// 根据bbox来更新Item
			this.regions.forEach((item) => {
				if (item.region_id * 1 === this.edit_storage_info.region_id * 1) {
					// item.bbox = this.temp_path_info.bbox;
					item.points = [];

					item.bbox.forEach((point) => {
						item.points.push([
							toDecimal(point[0] / this.ratio),
							toDecimal(yTrans(point[1] / this.ratio, this.config.graph_height)),
						]);
					});

					let size_x = this.getLength(item.bbox);
					let size_y = this.getWidth(item.bbox);

					this.$d3
						.select(
							`#${
								get_id(
									this.edit_storage_info.storage_id,
									this.edit_storage_info.storage_info.storage_group_id,
									this.edit_storage_info.region_id
								)['storage_bbox_sid_sgid_rid']
							}`
						)
						.attr('bbox', re_format_polygon_bbox(item.bbox))
						.attr('points', re_format_points(item.points))
						.attr('size', `${size_x} * ${size_y}`);

					this.$d3.select(`#${get_id()['temp_text']}`).text(`${size_x} * ${size_y}`);
				}
			});
		},

		changeDirection(e) {
			let mode = this.temp_path_info.element_id.split('-')[1].toLowerCase();
			this[`${mode}s`].forEach((item) => {
				if (item.element_id === this.temp_path_info.element_id) {
					item.info.direction = this.temp_path_info.info.direction;
					item.info._direction = format_direction(item.info.direction, 'arr');
					// 更新箭头
					let _d = format_direction(item.info.direction, 'direction');
					this.$d3
						.select(`#${item.element_id}`)
						.attr('direction', item.info.direction)
						.attr('marker-start', `url(#${get_id(_d, mode.toUpperCase())['arrow']})`)
						.attr('marker-mid', `url(#${get_id(_d, mode.toUpperCase())['arrow']})`);
				}
			});
			this.updateMovingPathInfo();
			this.cancelEditPath();
		},
		cancelEditPath() {
			this.show_edit_path = false;
		},

		copyPath() {
			let element = this.temp_path_info;
			let mode = element.element_id.split('-')[1].toLowerCase();

			this[`${mode}s_count`] += 1;
			let data_id = this[`${mode}s_count`];

			const DEVIATION = 20;

			let node = new NewNodeGraph({
				vue: this,
				type: 'new',
				x: element.points[0][0] + DEVIATION,
				y: element.points[0][1] + DEVIATION,
				data: element,
			});
			node.draw(mode, data_id);
			node.drag({
				x: element.points[1][0] + DEVIATION,
				y: element.points[1][1] + DEVIATION,
			});
			node.end();
		},
		deletePath() {
			let mode = this.temp_path_info.element_id.split('-')[1].toLowerCase();
			let id = this.temp_path_info.element_id;
			let that = this;
			this.$confirm({
				title: `Are you sure delete this ${mode}?`,
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk() {
					console.log('OK');
					that.$d3.select(`#${id}`).remove();
					that.$d3.select(`#${get_id()['assist_g']}`).remove();
					clean();
					// 从数据中删除
					that[`${mode}s`] = that[`${mode}s`].filter((item) => {
						return item.element_id !== id;
					});

					let type_id = that.$store.getters.getGraphTypeById(mode);

					if (type_id === that.$store.getters.getObstaclesType) {
						// "obstacles"
						that.updateObstaclesInfo();
					} else if (type_id === store.getters.getConnectionItemType) {
						// "moving_paths"
						that.updateMovingPathInfo();
					}

					that.cancelEditPath();
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		},
		// ----------SVG---------- END

		// ----------底部OUTPUT---------- START
		createOutputInfo(name, value, id = '') {
			let unit = '';
			id = id || name;

			switch (name) {
				case 'area':
					unit = 'm²';
					break;

				default:
					break;
			}
			return {
				name,
				value,
				unit,
				id,
			};
		},

		updateOutputInfo(type, data) {
			// type room/group/plan

			// 重置outputInfo
			this.outputInfo = [];

			if (type === 'room') {
				let navigation = this.navigations[this.svg.active];
				this.outputInfo.push({
					type: 'info',
					list: [
						{
							name: 'name',
							value: navigation.room,
							unit: '',
							id: 'name',
						},
						{
							name: 'area',
							value: getBboxArea(navigation.bbox),
							unit: 'm²',
							id: 'area',
						},
					],
				});
			} else if (type === 'group') {
				this.outputInfo = [
					{
						type: 'info',
						list: [
							{
								name: 'name',
								value: data.plan_info.storage_type,
								unit: '',
								id: 'name',
							},
							{
								name: 'quantity',
								value: data.plan_info.total_local_quantity,
								unit: '',
								id: 'quantity',
							},
							{
								name: 'area',
								value: data.plan_info.storage_space,
								unit: 'm²',
								id: 'area',
							},
						],
					},
				];
			} else if (type === 'plan') {
				this.outputInfo = [
					{
						type: 'info',
						list: [
							{
								name: 'name',
								value: data.plan_info.storage_type,
								unit: '',
								id: 'name',
							},
							{
								name: 'quantity',
								value: data.plan_info.total_local_quantity,
								unit: '',
								id: 'quantity',
							},
							{
								name: 'area',
								value: data.plan_info.storage_space,
								unit: 'm²',
								id: 'area',
							},
						],
					},
					{
						type: 'img',
						id: 'side_view',
						title: 'Side View',
						url: 'xxxx',
					},
					{
						type: 'img',
						id: 'front_view',
						title: 'Front View',
						url: 'xxxx',
					},
				];
			}
		},
		// ----------底部OUTPUT---------- END

		// ----------右侧TABLE---------- START
		// 获取相关info信息
		getProjectInfoData() {
			let list = ['region', 'algorithm'];
			list.forEach((item) => {
				let res = this.$model.project.getProjectInfoData(this.project.project_id, item);
				res.then((resp) => {
					console.log('data: ', resp);
					this[`${item}_info`] = JSON.parse(JSON.stringify(resp.data.data[`${item}_info`]));
					this[`origin_${item}_info`] = JSON.parse(JSON.stringify(resp.data.data[`${item}_info`]));
					// if (item === 'algorithm') {
					// 	this[`${item}_info`].reverse();
					// 	this[`origin_${item}_info`].reverse();
					// }
				});
			});
		},

		// 获取上传后的cad信息
		getCadInfoData() {
			const cad = this.$model.project.getProjectCadInfo(`[${this.project.project_id}]`);
			cad.then((resp) => {
				console.log('resp: ', resp);
				let cadList = resp.data.data;
				cadList.forEach((item) => {
					if (item.project_id * 1 === this.project.project_id * 1) {
						this.$store.commit('SET_CAD_DATA', item.cad);
					}
				});
			});
		},
		// 获取storage_input
		getProjectStorageInput() {
			let storage_res = this.$model.project.getProjectStorageInput(this.project.project_id);
			storage_res.then((resp) => {
				console.log('getProjectStorageInput data: ', resp);
				// this.storage_types = data.data.data;
				let listData = resp.data.data;
				// 先找出最大的storages_id
				if (listData.length > 0) {
					var maxObj = listData.reduce(function(prev, current) {
						return prev.data.info.storage_id > current.data.info.storage_id ? prev : current;
					});
					this.storages_id = Number(maxObj.data.info.storage_id);
				}

				listData.forEach((data) => {
					if (data.data.info.storage_group_id) {
						this.storages_group_id = Number(data.data.info.storage_group_id);
					}

					this.storages_id++; // 先加 不然id会存在重复的现象

					this.storages.push({
						checked: false,
						baseInfo: data.data.data,
						group_id: Number(data.data.info.storage_group_id),
						id: Number(this.storages_id),
						info: data.data.info,
						thumbnail: data.data.thumbnail,
					});
				});
			});
		},
		//
		getFixturesData() {
			this.$model.project.getFixturesData(this.project.project_id).then((resp) => {
				console.log('resp: ', resp);
				this.$store.state.animation.fixtures = resp.data.data;

				let max_id = 0;
				if (resp.data.data.length > 0) {
					max_id = resp.data.data[resp.data.data.length - 1].id.split('-')[1];
				}

				this.$store.commit('UPDATE_MODEL_COUNT', Math.max(max_id, resp.data.data.length));
			});
		},
		// 获取storage type list
		getStorageTypeList() {
			let storage_res = this.$model.storage.getList();
			storage_res.then((data) => {
				this.storage_types = data.data.data;
			});
		},
		// 全选
		onChangeAllStorage(e) {
			console.log('e: ', e);
			this.checkAllStorage = !this.checkAllStorage;
			this.indeterminate = false;

			this.storages.forEach((storage) => {
				storage.checked = this.checkAllStorage;
			});
			if (this.checkAllStorage) {
				this.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['storage_region_active'], true);
			} else {
				clean();
			}
		},
		// 监听单个
		onChangeStorageItem(e, item, from) {
			item.checked = !item.checked;

			this.checkAllStorage = this.storages.every((storage) => {
				return storage.checked;
			});

			this.indeterminate =
				this.storages.some((storage) => {
					return storage.checked;
				}) && !this.checkAllStorage;

			if (from === 'right') {
				this.$d3
					.selectAll(`.${get_class(item.group_id)['storage_sgroup_sgid']}`)
					.classed(get_class()['storage_region_active'], item.checked);
			}

			clean(false);
		},
		// 删除多个storage
		deleteSomeStorage() {
			let deleteList = this.storages.filter((storage) => {
				return storage.checked;
			});
			if (deleteList.length === 0) {
				return false;
			}
			const h = this.$createElement;

			let _content = [];
			deleteList.forEach((item) => {
				_content.push(h('p', `Name: ${item.info.name}, Quantity: ${item.info.quantity}`));
			});

			let content = h('div', {}, _content);
			let that = this;

			this.$confirm({
				title: 'Are you sure delete these storages(Include all results)?',
				content: content, // 传递vnode节点进去
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk() {
					console.log('OK');
					deleteList.forEach((item) => {
						// 一种情况是没有plan的删除，一种是生成了plan的删除，通过该stotage的quantity来区分
						if (Number(item.info.quantity) === 0) {
							// 发送接口删除该storage
							const params = {
								project_id: that.project.project_id,
								storage_data: {
									info: item.info,
								},
							};
							let res = that.$model.project.deleteProjectStorageInput(params);
							res.then((resp) => {
								// 删除img
								that.$d3.select(`#${get_id(item.id)['storage_img_sid']}`).remove();
								// that.storages.splice(index, 1);
								clean();
							});
						} else {
							// 发送接口删除所有该group_id的plan
							const params = {
								project_id: that.project.project_id,
								storage_id: '',
								storage_group_id: item.group_id,
								type: 'group', //group/storage  删除一行/一个区域
							};
							let res = that.$model.project.deleteProjectHistory(params);
							res.then((data) => {
								console.log(data);
								// 删除该组的plan图形
								// 删除该组的active_bbox
								that.$d3.selectAll(`.${get_class(item.group_id)['storage_sgroup_sgid']}`).remove();
								// 删除img
								that.$d3.select(`#${get_id(item.id)['storage_img_sid']}`).remove();
								// that.storages.splice(index, 1);
								clean();
								// 删除该plan 保存在region里
								that.regions = that.regions.filter((region) => {
									if (region.info.storage_group_id * 1 !== item.group_id * 1) {
										return region;
									}
								});
							});
						}
					});
					// 统一在这里删除
					that.storages = that.storages.filter((storage) => {
						return !storage.checked;
					});

					// 重置参数
					that.checkAllStorage = false;
					that.indeterminate = false;
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		},
		// 拖拽storage 开始
		dragStorage(event, item, index) {
			console.log('item: ', item);
			console.log('drag start event: ', event);
			// 此时的event offsetX和offsetY就是鼠标相对于距离被拖拽元素左上角的偏移距离
			// this.SET_TEMP_MODEL(model);
			this.select_index = index;
			// 存储信息
			this.drag_storage_info = item;
			this.drag_storage_info.width = event.target.offsetWidth;
			this.drag_storage_info.height = event.target.offsetHeight;
			this.drag_storage_info.offsetX = event.offsetX;
			this.drag_storage_info.offsetY = event.offsetY;
		},

		// 改变shape
		chageShape(id) {
			console.log('chageShape: ', id);

			if (this.svg.mode === 'normal' && (id === 'region' || id === 'polygon')) {
				return false;
			}
			if (this.svg.mode !== 'normal') {
				let disabled = !this.$store.getters.getSomeGraphAttr(this.svg.mode.split('-')[1], 'allow_shapes').includes(id);
				console.log('disabled: ', disabled);
				if (disabled) {
					return false;
				}
			}
			// 校验

			this.svg.shape = id;

			if (id === 'normal') {
				this.svg.mode = id;
			}
		},
		// 松手落下
		drop(event) {
			console.log('drop event: ', event);

			// 两种情况 一种是拖拽货架 一种是拖拽其它模型 TODO
			// 拖拽模型
			if (this.$refs.topButton.show_model_popover) {
				this.dropModel(event);
			} else {
				this.dropStorage(event);
			}
		},
		dropModel(event) {
			console.log('event: ', event);

			this.$store.commit('UPDATE_MODEL_COUNT', this.$store.state.animation.models_count + 1);

			let config = {
				svg: this.$d3.select(`#${get_id()['model']}`),
				name: this.$store.state.animation.temp_model.model,
				x: event.x,
				y: event.y,
				vue: this,
				type: 'new',
				height: this.$store.state.animation.temp_model.height,
				width: this.$store.state.animation.temp_model.width,
				id: this.$store.state.animation.models_count,
				customizable: this.$store.state.animation.temp_model.customizable,
				direction: this.$store.state.animation.temp_model.direction,
			};
			console.log('config: ', config);
			let model = new ModelGraph(config);
			model.draw();
		},
		dropStorage(event) {
			// 判断是否在region中

			// 获取当前room_id的region
			let region_nodes = this.$d3
				.selectAll(`.${get_class()['region']}.${this.navigations[this.svg.active].room}`)
				.nodes();

			let current_region_count = this.regions.filter((item) => {
				return item.room_id === this.navigations[this.svg.active].room;
			}).length;
			console.log('current_region_count: ', current_region_count);
			console.log('## region_nodes: ', region_nodes);
			let scale = parseFloat(this.$d3.select(`#${get_id()['g']}`).attr('transform_scale'));
			let transform_x = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_x'));
			let transform_y = toDecimal(this.$d3.select(`#${get_id()['g']}`).attr('transform_y'));
			// 要注意缩放时
			// 坐标转换 event事件是鼠标松手时候的坐标
			let [imgx, imgy, storage_id, storage_group_id] = [
				toDecimal(event.layerX - this.drag_storage_info.offsetX - transform_x / scale),
				toDecimal(event.layerY - this.drag_storage_info.offsetY - transform_y / scale),
				this.drag_storage_info.id,
				this.drag_storage_info.group_id,
			];

			// let img_node = d3
			//   .select(this)
			//   .node()
			//   .getBBox();
			let img_node = {};
			img_node.x = imgx;
			console.log('imgx: ', imgx);
			img_node.y = imgy;
			console.log('imgy: ', imgy);
			// 宽高也要按比例变化
			img_node.width = this.drag_storage_info.width / scale;
			img_node.height = this.drag_storage_info.height / scale;

			let regions = [];

			if (region_nodes.length === 0 && current_region_count === 0) {
				// 当仓间内没有其它region时，拖拽货架进仓间，会默认以整个仓间为一个大region来进行计算。
				// 如果有其它region，则不会进行上述操作。

				// 判断是不是在当前仓间内
				let rs = judge_rect_intersect(
					img_node,
					this.$d3
						.select(`#${get_id()['active_bbox']}`)
						.node()
						.getBBox()
				);
				if (rs) {
					// 生成region TODO
					let mode = 'region';
					this[`${mode}s_count`] += 1;
					let data_id = this[`${mode}s_count`];

					let points = bboxToPoints(this.navigations[this.svg.active].bbox, this.ratio, this.config.graph_height);
					console.log('====== points: ', points);

					let node = new NewNodeGraph({
						vue: this,
						type: 'new',
						x: points[0][0],
						y: points[0][1],
						data: {},
					});
					node.draw(mode, data_id);
					node.drag({
						x: points[1][0],
						y: points[1][1],
					});
					node.end();
					console.log('=======node: ', node);

					regions.push(data_id);
				}
			} else {
				region_nodes.some((region_item) => {
					console.log('region_item: ', region_item);
					let region_bbox = this.$d3.select(region_item).attr('points');
					let region_id = this.$d3.select(region_item).attr('region_id');

					const s = new Set();
					console.log('region_bbox: ', region_bbox);
					region_bbox.split(/\s+|,/).forEach((item) => {
						item && s.add(parseFloat(item));
					});

					region_bbox = Array.from(s);
					console.log('##region_bbox: ', region_bbox);

					let rs = judge_rect_intersect(
						img_node,
						this.$d3
							.select(region_item)
							.node()
							.getBBox()
					);
					// 更换判断方式，交叉即可
					if (rs) {
						regions.push(region_id);
					}
				});
			}

			// clean node/data return {regions, imgid}
			if (regions.length > 0) {
				this.calculateStorageRegion(storage_id, storage_group_id, regions, null);
				// d3.select(this).remove();
			} else {
				// 移动到区域外则移回原位
				setTimeout(() => {
					this.$message.warning('Storage did not drag properly to the region area');
					// d3.select(this)
					//   .attr('x', d3.select(this).attr('origin_x'))
					//   .attr('y', d3.select(this).attr('origin_y'));
				}, 500);
			}
		},
		// 拖拽移动过程
		dragover(event) {
			event.preventDefault();
		},
		getImage(id) {
			let result = '';
			switch (id) {
				case 'apr':
					result = img_apr;
					break;
				case 'shelf':
					result = img_shelf;
					break;
				case 'stack':
					result = img_stack;
					break;
				default:
					break;
			}
			return result;
		},
		// 将storage添加到SVG中
		addStorageToSvg(item, index) {
			console.log('item: ', item);

			let size = this.$d3.selectAll(`.${get_class(item.group_id)['storage_sgroup_sgid']}`).size();

			// remove storage this.$d3 img
			this.$d3.select(`.${get_class()['storage_img']}`).remove();

			// 取消高亮该货架类型已经排好的货架
			this.$d3.selectAll(`.${get_class()['storage_region']}`).classed(get_class()['storage_region_active'], false);

			if (this.select_index !== index) {
				this.select_index = index;
				// 输出该货架所有已经排布的信息
				// TODO 屏蔽输出
				let flag = false;
				if (size > 0) {
					this.outputInfo = [];
					// 分别输出单个信息的写法
					// this.regions.forEach((element) => {
					//   if (
					//     element.info &&
					//     Number(element.info.storage_id) === Number(item.id)
					//   ) {
					//     Object.keys(element.info).forEach((key) => {
					//       if (key !== 'storage_id') {
					//         this.outputInfo.push(
					//           this.createOutputInfo(key, element.info[key])
					//         );
					//       }
					//     });
					//   }
					// });

					// 把信息统计整合后输出
					// TODO 修改格式后没有改
					let regions = JSON.parse(JSON.stringify(this.regions));
					regions = regions.filter((r) => {
						return r.info && r.info.storage_group_id === Number(item.group_id);
					});
					console.log('regions: ', regions);
					let that = this;
					let result = regions.reduce((obj, ele) => {
						let find = obj.find((i) => i.info && ele.info && i.info.storage_group_id === ele.info.storage_group_id);
						let _d = {
							...ele,
						};

						// find
						//   ? ((find.plan_info.total_local_quantity +=
						//       ele.plan_info.total_local_quantity),
						//     (find.plan_info.storage_space += ele.plan_info.storage_space))
						//   : obj.push(_d);

						find ? (find.plan_info = this.handlePlanInfo(find.plan_info.concat(ele.plan_info))) : obj.push(_d);

						// find ? find.plan_info.concat(ele.plan_info) : obj.push(_d);
						return obj;
					}, []);
					console.log(result);

					// this.updateOutputInfo('group', result[0]);
					this.outputInfo = result[0].plan_info;
				}

				// add storage this.$d3 img
				let img_x = this.config.graph_width - 100;
				let img = new StorageImgGraph({
					svg: this.svg.svg, // 后面换成一个独立的group,
					vue: this,
					data: {},
					ratio: this.ratio,
					config: this.config,
					x: img_x,
					id: item.id,
					group_id: item.group_id,
				});
				img.draw();

				// 高亮该货架类型已经排好的货架
				size > 0 &&
					this.$d3
						.selectAll(`.${get_class(item.id)['storage_region_sid']}`)
						.classed(get_class()['storage_region_active'], true);
			} else {
				this.select_index = null;
				// this.updateOutputInfo('room');
				this.getRoomOutputInfo();
			}
		},
		// 选择添加的storage类型
		choose(e) {
			let storage_res = this.$model.storage.getForm(e.key, e.domEvent.target.type);
			storage_res.then((data) => {
				this.storage_form = data.data.data;
				this.temp_storage_info = data.data.info;
				this.temp_storage_info.save_type = e.domEvent.target.type;
				this.thumbnail_info = [];
				this.previewImg(true);
				this.temp_storage_form = JSON.parse(JSON.stringify(this.storage_form));
				this.visible = true;
			});
		},
		// 删除table里的storage项
		deleteStorageItem(item, index) {
			let that = this;
			this.$confirm({
				title: 'Are you sure delete this storage(Include all results)?',
				content: `Name: ${item.info.name}, Quantity: ${item.info.quantity}`,
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk() {
					console.log('OK');

					// 一种情况是没有plan的删除，一种是生成了plan的删除，通过该stotage的quantity来区分
					if (Number(item.info.quantity) === 0) {
						// 发送接口删除该storage
						const params = {
							project_id: that.project.project_id,
							storage_data: {
								info: item.info,
							},
						};
						let res = that.$model.project.deleteProjectStorageInput(params);
						res.then((resp) => {
							// 删除img
							that.$d3.select(`#${get_id(item.id)['storage_img_sid']}`).remove();
							that.storages.splice(index, 1);
							clean();
						});
					} else {
						// 发送接口删除所有该group_id的plan
						const params = {
							project_id: that.project.project_id,
							storage_id: '',
							storage_group_id: item.group_id,
							type: 'group', //group/storage  删除一行/一个区域
						};
						let res = that.$model.project.deleteProjectHistory(params);
						res.then((data) => {
							console.log(data);
							// 删除该组的plan图形
							// 删除该组的active_bbox
							that.$d3.selectAll(`.${get_class(item.group_id)['storage_sgroup_sgid']}`).remove();
							// 删除img
							that.$d3.select(`#${get_id(item.id)['storage_img_sid']}`).remove();
							that.storages.splice(index, 1);
							clean();
							// 删除该plan 保存在region里
							that.regions = that.regions.filter((region) => {
								if (region.info.storage_group_id * 1 !== item.group_id * 1) {
									return region;
								}
							});
						});
					}
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		},
		// 只读storage基本属性
		showStorageModal(item, index) {
			console.log('item: ', item);
			// this.editAble = false;
			this.editAble = item.info.quantity === 0;
			if (this.editAble) {
				this.temp_storage_info = item.info;
			}

			this.storage_form = item.baseInfo;
			this.thumbnail_info = [];
			Object.keys(item.thumbnail).forEach((key) => {
				let title = key.replace('_', ' ');
				this.thumbnail_info.push({
					id: key,
					title: title.charAt(0).toUpperCase() + title.slice(1), // 'side_view' => 'Side view'
					url: item.thumbnail[key],
				});
			});
			this.visible = true;
		},
		// 将quantity<0的输入框显示
		changeFullFlag(item) {
			item.info.full = false;
			this.$forceUpdate();
		},
		// 取消添加storage项
		cancelStorage() {
			this.editAble = true;
			this.visible = false;
			this.storage_form = [];
			this.temp_storage_info = {};
		},
		// 添加storage项
		addStorage() {
			if (this.editAble) {
				let data = {};
				let reEdit = false;

				// 如果存在则说明是再次编辑状态
				if (this.temp_storage_info.storage_group_id && this.temp_storage_info.storage_id) {
					data.info = this.temp_storage_info;
					reEdit = true;
				} else {
					this.storages_group_id += 1;
					this.storages_id += 1;
					data.id = this.storages_id; // 更新一次+1
					data.group_id = this.storages_group_id; // 不变
					this.temp_storage_info.storage_id = this.storages_id; // 上次操作的ID 没有用
					this.temp_storage_info.storage_group_id = this.storages_group_id;
					data.info = this.temp_storage_info;
					data.info.quantity = 0;
					data.baseInfo = this.storage_form;
				}
				console.log('reEdit: ', reEdit);

				// 保存stoage
				let params = {
					project_id: this.project.project_id,
					storage_data: {
						info: data.info,
						data: this.storage_form,
					},
					is_save: true,
				};
				let res = this.$model.project.postProjectStorageInput(params);
				res.then((resp) => {
					console.log(resp);
					data.thumbnail = {
						front_view: resp.data.data.front_view,
						side_view: resp.data.data.side_view,
					};
					data.checked = false;
					if (!reEdit) {
						this.storages.push(data);
					}
				});
			}
			this.cancelStorage();
		},

		// ----------右侧TABLE---------- END

		// ----------右侧CANVAS---------- START
		redrawCanvas() {
			this.$refs.sc_canvas.render(this.$store.getters.truePointsArr);
		},

		// 获取在点A和点B的连线上，距离点A为d的点（同方向）
		queryPointForDistance(x1, y1, x2, y2, d) {
			let _d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
			let x, y;
			x = toDecimal((d * (x2 - x1)) / _d + x1);
			y = toDecimal((d * (y2 - y1)) / _d + y1);
			return { x, y };
		},
		blurDistance(e, index) {
			let current = this.$store.getters.truePointsArr[index];
			let next = this.$store.getters.truePointsArr[index + 1];
			let obj = this.queryPointForDistance(current.x, current.y, next.x, next.y, e);
			this.$store.commit('SET_POINTFORINDEX', { index: index + 1, point: obj });
			this.$forceUpdate();
			this.$refs.sc_canvas.render(this.$store.getters.truePointsArr);
		},
		getDistance(point, index) {
			let result = 0;
			if (this.$refs.sc_canvas === undefined) {
				return 0;
			}
			let arr = this.$store.getters.truePointsArr;
			if (index !== arr.length - 1) {
				result = this.$refs.sc_canvas.getTwoPointDistance(point.x, point.y, arr[index + 1].x, arr[index + 1].y, 2);
			} else {
				result = this.$refs.sc_canvas.getTwoPointDistance(point.x, point.y, arr[0].x, arr[0].y, 2);
			}
			return result;
		},
		// ----------右侧CANVAS---------- END

		// ----------STORAGE 模板---------- START
		handleSelectChange(e) {
			console.log('e: ', e);
		},
		// 监听input number是否超过范围
		changeNum(e, record) {
			console.log('record: ', record);
			console.log('e: ', e);
			let { min, max } = record;
			console.log('min: ', min);
			console.log('max: ', max);
			if (e > max || e < min) {
				console.log(this); //TODO
			}
		},
		// 生成storage 模板里每一项chioes的类名
		getClassName(index, c_index) {
			return `input-row-${index}-${c_index}`;
		},
		// 监听更新storage模板里的choices
		changeChoices(e) {
			const storage_index = e.target.dataset.storage;
			const key = e.target.dataset.index;
			const value = e.target.value;
			const type = 'choices';
			this.storage_form[storage_index][type][key] = Number(value);
		},
		// 增加storage模板里的choices项
		addChoiceItem(item, storage_index) {
			const type = 'choices';
			if (!this.storage_form[storage_index][type] || this.storage_form[storage_index][type].length === 0) {
				this.storage_form[storage_index][type] = [];
			}
			this.storage_form[storage_index][type].push('');
			this.$forceUpdate();
			let className = this.getClassName(storage_index, this.storage_form[storage_index][type].length - 1);
			setTimeout(() => {
				document.getElementsByClassName(className)[0].focus();
			}, 10);
		},
		// 移除storage模板里的choices项
		removeChoiceItem(item, storage_index) {
			const type = 'choices';
			if (this.storage_form[storage_index][type] && this.storage_form[storage_index][type].length > 0) {
				this.storage_form[storage_index][type].pop();
			}
			this.$forceUpdate();
		},
		// 点击保存storage模板
		saveTemplate() {
			this.show_sava_name = true;
			this.templateName = this.temp_storage_info.name;
		},
		// 发起保存storage模板请求
		savePostTemplate(save_as_new) {
			this.temp_storage_info.name = this.templateName;
			// 只保留初始字段
			let info = {
				id: this.temp_storage_info.id,
				name: this.temp_storage_info.name,
				base_rack: this.temp_storage_info.base_rack,
			};
			const params = {
				type: this.saveFlag,
				save_as_new,
				project_id: this.project.project_id,
				info: info,
				data: this.storage_form, // 为第二部所有data部分
			};
			let storage_res = this.$model.storage.SaveStorage(params);
			storage_res.then((data) => {
				console.log('data: ', data);
				this.temp_storage_info.id = data.data.data.id;
				this.$message.success('Storage template Saved');
				this.cancelSaveName();
				this.onCloseTemplate(false);
				this.getStorageTypeList();
			});
		},
		cancelSaveName() {
			this.show_sava_name = false;
			this.templateName = '';
			this.saveFlag = 0;
		},
		// 关闭storage drawer
		onCloseTemplate(back = true) {
			if (back) {
				this.storage_form = this.temp_storage_form;
				this.$forceUpdate();
			}
			this.templateVisible = false;
		},
		// 打开 storage drawer
		editTemplate() {
			this.templateVisible = true;
			this.temp_storage_form = JSON.parse(JSON.stringify(this.storage_form));
			this.templateName = this.temp_storage_info.name;
		},
		// reset storage profile values
		resetStorageTemplate() {
			this.storage_form = JSON.parse(JSON.stringify(this.temp_storage_form));
			this.thumbnail_info = JSON.parse(JSON.stringify(this.temp_thumbnail_info));
			this.$forceUpdate();
		},
		// 删除storage template
		deleteTemplate() {
			let that = this;
			this.$confirm({
				title: 'Are you sure delete this storage template?',
				okText: 'Yes',
				okType: 'danger',
				cancelText: 'No',
				onOk() {
					console.log('OK');
					const params = {
						info: that.temp_storage_info,
						data: that.storage_form,
						project_id: that.project.project_id,
					};
					let res = that.$model.storage.DeleteStorage(params);
					res.then((data) => {
						that.templateVisible = false;
						that.visible = false;
						that.$message.success('Template deleted successfully');
						that.getStorageTypeList();
					});
				},
				onCancel() {
					console.log('Cancel');
				},
			});
		},

		// 预览货架属性图片
		previewImg(backup = false) {
			let params = {
				project_id: this.project.project_id,
				storage_data: {
					info: Object.assign(JSON.parse(JSON.stringify(this.temp_storage_info)), {
						storage_id: 0,
						storage_group_id: 0,
					}),
					data: this.storage_form,
				},
				is_save: false,
			};
			let img_res = this.$model.project.postProjectStorageInput(params);
			img_res.then((data) => {
				console.log(data);
				this.thumbnail_info = [];
				this.thumbnail_info.push({
					title: 'Front view',
					id: 'front_view',
					url: data.data.data.front_view,
				});
				this.thumbnail_info.push({
					title: 'Side view',
					id: 'side_view',
					url: data.data.data.side_view,
				});
				console.log('backup: ', backup);
				if (backup) {
					this.temp_thumbnail_info = JSON.parse(JSON.stringify(this.thumbnail_info));
				}
			});
		},

		// ----------STORAGE 模板---------- END
	},
	data() {
		return {
			shapeList: [
				{
					id: 'normal',
					img: img_move,
				},
				{
					id: 'line',
					img: img_line,
				},
				{
					id: 'region',
					img: img_region,
				},
				{
					id: 'polygon',
					img: img_polygon,
				},
			],
			show: false,
			visible: false,
			show_region_confirm: false,
			templateVisible: false,
			cols: ['Storage Type', 'Quantity'],
			templateCols: ['Name', 'Description', 'Value', 'range', 'choices'],
			select_index: null,
			storages_group_id: 100,
			storages_id: 0,
			obstacles_count: 0,
			guards_count: 0,
			walls_count: 0,
			isolates_count: 0,
			evitables_count: 0,
			paths_count: 0,
			blocks_count: 0,
			regions_count: 0,
			storages: [],
			storage_types: [],
			storage_form: [],
			temp_storage_form: [],
			temp_thumbnail_info: [],
			temp_storage_info: {},
			obstacles: [],
			guards: [],
			walls: [],
			isolates: [],
			evitables: [],
			paths: [],
			regions: [],
			blocks: [],
			navigations: [],
			navigation_bbox: [],
			top_views: [],
			graph: {},
			saveWalls: {},
			editAble: true,
			thumbnail_info: [],
			show_sava_name: false,
			show_edit_storage: false,
			update_storage: false,
			templateName: '',
			saveFlag: 0,
			direction_options: [
				{ label: 'Up', value: 'up' },
				{ label: 'Right', value: 'right' },
				{ label: 'Down', value: 'down' },
				{ label: 'Left', value: 'left' },
			],
			isHideWallNode: true, // 是否隐藏Wall节点
			ratio: 1,
			origin_ratio: 1, // 初始渲染的ratio
			unredraw_scale: 1, // 未重绘时的scale
			svg: {
				mode: 'normal', // 普通拖拽模式,
				shape: 'normal', // 笔触
				active: 0, // 当前所选navigator,
				svg: null,
				g: null,
				path_g: null,
			},
			new_node: {
				id: null,
				type: null,
				node: null,
				points: null,
				data: null,
			},
			choose_storage_region: {
				regions: [],
				storage_id: null,
				storage_group_id: null,
				element: null,
			},
			edit_storage_info: {
				region_id: null,
				storage_id: null,
				storage_info: null,
				quantity: null,
			},
			outputInfo: [],
			region_info: [],
			algorithm_info: [],
			origin_region_info: [],
			origin_algorithm_info: [],
			drag_storage_info: null,
			show_edit_path: false,
			temp_path_info: {
				info: { direction: '', _direction: '' },
			},
			has_true_cad_data: false,
			show_greenfield: false,
			has_change_model_size_flag: false,
			lines: [],
			deleteRegionTogether: true,
			checkAllStorage: false, // 全选
			indeterminate: false, // 是否选中了部分但没有全选
		};
	},
};
</script>

<style scoped lang="less">
@import './index.less';
</style>
