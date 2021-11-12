<template>
    <div>
        <Loading
                :spinning="$store.state.request.loading"
                :loadingText="$store.state.request.loadingText"
        ></Loading>
        <ProjectsHeader/>
        <!-- <div class="projects">
          <a-card>
            <div>
              <router-link to="/project?id=999" class="ui-nav-item"
                >Test Projcet</router-link
              >
            </div>
            <div>
              <router-link to="/v2/project/step2?id=999&step=1" class="ui-nav-item"
                >Test Component</router-link
              >
            </div>
          </a-card>
        </div> -->
        <a-layout-content class="content">
            <a-card>
                <div class="add">
                    <a-button type="primary" icon="plus" @click="createProject">
                        Create New Project
                    </a-button>
                    <a-button icon="import" @click="cad_visible=true" style="margin-left: 20px">
                        Import From CAD Library
                    </a-button>
                </div>

                <table>
                    <thead class="ant-table-thead">
                    <tr>
                        <th
                                class="ant-table-column-has-actions ant-table-column-has-sorters"
                        >
                            <div class="ant-table-column-sorters">
                                name
                            </div>
                        </th>
                        <th
                                class="ant-table-column-has-actions ant-table-column-has-sorters"
                        >
                            <div class="ant-table-column-sorters">
                                CAD File
                            </div>
                        </th>
                        <th
                                class="ant-table-column-has-actions ant-table-column-has-sorters"
                                @click="refreshUpdate"
                        >
                            <div class="ant-table-column-sorters">
                                update_date
                            </div>
                        </th>
                        <th
                                class="ant-table-column-has-actions ant-table-column-has-sorters"
                        >
                            <div class="ant-table-column-sorters">
                                actions
                            </div>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="ant-table-tbody" ref="tbody">
                    <tr
                            class="ant-table-row ant-table-row-level-0"
                            :value="item.id"
                            :key="item.id"
                            v-for="item in list"
                    >
                        <td>
                            <a
                                    href="javascript:;"
                                    @click="gotoProject(item)"
                                    class="m-link"
                            >
                                {{ item.name }}
                            </a>
                        </td>
                        <td>
                            {{ item.cad && item.cad.cad_name }}
                        </td>
                        <td>
                            {{ item.update_date }}
                        </td>
                        <td>
                            <a-icon
                                    type="copy"
                                    class="icon-button"
                                    @click="copyProject(item)"
                            />
                            <a-icon
                                    type="delete"
                                    class="icon-button"
                                    @click="deleteProject(item)"
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <a-pagination
                        :pageSize="10"
                        :defaultCurrent="Number(page)"
                        :total="total"
                        class="pagination"
                        @change="gotoPage"
                />
            </a-card>
        </a-layout-content>
        <a-modal
                title="Are you absolutely sure?"
                v-model="show.delete_modal"
                @ok="deleteModal"
                @cancel="cancelModal"
                okText="Delete"
                :okButtonProps="{
        props: { disabled: projectName != tempProject.name },
      }"
                cancelText="Cancel"
        >
            <p style="font-weight: 600; margin-bottom: 10px; color: #333;">
                You will delete project '{{ tempProject.name }}'. The deletion can not
                be undone. Please type in the name of project to confirm.
            </p>
            <a-input placeholder="project name" v-model="projectName"/>
        </a-modal>
        <a-modal
                title="cad From CAI"
                :visible="cad_visible"
                @ok="importFromCad(1)"
                @cancel="importFromCad(0)"
                style="max-height: 400px; overflow-y: auto"
        >
            <a-radio-group v-model="cad_choose">
                <a-radio
                        v-for="(cad, index) in cad_data"
                        :value="cad.id"
                        :key="index"
                        style="margin: 5px 10px"
                >
                    {{cad.name}}
                </a-radio>
            </a-radio-group>
        </a-modal>
    </div>
</template>

<script>
    import ProjectsHeader from './header';
    import {init} from './index.event';
    import {mapState} from 'vuex';

    export default {
        name: 'projects-index',
        components: {
            ProjectsHeader,
        },
        mounted() {
            this.$request.get("/api/config").then((data) => {
                if (data.data.deploy === 0) {
                    // 单机模式
                    this.getProjects();
                } else {
                    // 云服务 goto 404
                    window.location.replace(data.data.errpage);
                }
            })
            this.$request.get("/api/wda_cad").then((data) => {
                // console.log(data.data.data)
                this.cad_data = data.data.data
            })
        },
        created() {
            init.call(this);
        },
        computed: mapState({
            config: (state) => state.config,
        }),
        methods: {
            importFromCad(command) {
                if (command === 1) {
                    // create new project and import cad file from cad library
                    if (this.cad_choose) {
                        let formdata = {
                            id: this.cad_choose,
                        }
                        this.$request.post("/api/wda_cad", formdata).then((data) => {
                            let new_id = data.data.data.new_id
                            let uri = `/v2/project/step2?id=${new_id}&step=1`;
                            this.$router.push(uri);
                        })
                    }
                }
                this.cad_visible = false
                this.cad_choose = null
            }
        },
        data() {
            return {
                title: 'projects',
                total: 0,
                page: 1,
                list: [],
                show: {
                    main_loading: false,
                    delete_modal: false,
                },
                tempProject: {
                    name: '',
                },
                projectName: '',
                cad_visible: false,
                cad_data: [],
                cad_choose: null,
            };
        },
    };
</script>

<style scoped lang="less">
    @import './index.less';
</style>
