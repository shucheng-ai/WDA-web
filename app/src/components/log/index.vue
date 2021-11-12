<template>
    <div>
        <SCNav/>
        <a-card style="width: 80%;margin: 60px auto;">

            <div style="margin-bottom: 30px;">
                <div style="display: inline-block">
                    <a-button type="primary" shape="circle" icon="redo" @click="refresh"/>
                </div>
                <div style="width: 300px;float: right">
                    <a-input-search placeholder="input search ip" v-model="ip" enter-button @search="seachIp(null)"/>
                </div>
            </div>

            <table style="width: 100%">
                <thead class="ant-table-thead">
                <tr>
                    <th class="ant-table-column-has-actions ant-table-column-has-sorters" v-for="(key,index) in keys"
                        :key="index">
                        <div class="ant-table-column-sorters">
                            {{key}}
                        </div>
                    </th>
                    <th>
                        search
                    </th>
                </tr>
                </thead>

                <tbody class="ant-table-tbody" ref="tbody">
                <tr
                        class="ant-table-row ant-table-row-level-0"
                        :key="item.id"
                        v-for="item in data"
                >
                    <td v-for="key in keys" :key="key">
                        <div v-show="key==='project_id'">
                            <a :href="`/v2/project/step2?id=${item[key]}&step=1`" target="_blank">
                                {{item[key]}}
                            </a>
                        </div>
                        <div v-show="key==='ip'" style="width: 120px">
                            <a-button type="link" @click="editIp(item[key], 1)" style="padding: 0">
                                <a-icon type="edit" v-show="item[key]"/>
                                <span v-show="iptable[item[key]]">
                                    ({{iptable[item[key]]}})
                                </span>
                            </a-button>
                            {{item[key]}}
                        </div>
                        <div v-show="showOther(key)">
                            {{item[key]}}
                        </div>
                    </td>
                    <td>
                        <a-button type="primary" size="small" @click="seachIp(item.ip)">
                            search
                        </a-button>
                    </td>
                </tr>
                </tbody>
            </table>
        </a-card>

        <a-modal
                title="IP Table Form"
                :visible="visibleIpTable"
                @ok="editIp(null, 2)"
                @cancel="visibleIpTable=false"
        >
            <p>
                <b>{{choose_ip}}</b>
                <a-input placeholder="ip note"
                         v-model="ip_note"
                         style="display: inline-block;margin-left: 40px; width: 240px"/>
            </p>
        </a-modal>

    </div>
</template>

<script>
    import SCNav from '../projects/header'

    const IP_API = "/api/util/ip"
    const IP_EVENT_API = "/api/util/ip/event"

    export default {
        name: 'iplog-index',
        components: {
            SCNav,
        },
        mounted() {
            this.refresh()
            this.$request.get(IP_API).then((iptable) => {
                this.iptable = iptable.data.data
            })
        },
        methods: {
            refresh() {
                this.$request.get(IP_EVENT_API).then((data) => {
                    this.data = data.data.data.data;
                    this.$forceUpdate();
                })
            },
            seachIp(ip) {
                ip = ip ? ip : this.ip;
                let api = `${IP_EVENT_API}?ip=${ip}`
                let res = this.$request.get(api);
                res.then((data) => {
                    this.data = data.data.data.data;
                    this.$forceUpdate();
                })
            },
            showOther(key) {
                if (key !== 'ip' && key !== 'project_id') {
                    return true
                } else {
                    return false
                }
            },
            editIp(ip, command) {
                if (command === 1) {
                    this.visibleIpTable = true
                    this.choose_ip = ip
                    this.ip_note = this.iptable[ip] ? this.iptable[ip] : ''
                } else {
                    this.iptable[this.choose_ip] = this.ip_note
                    this.$request.post(IP_API, {
                        ip: this.choose_ip,
                        text: this.ip_note
                    });
                    this.visibleIpTable = false
                    this.choose_ip = ''
                    this.$forceUpdate();
                }
            }
        },
        data() {
            return {
                iptable: {},
                keys: ['id', 'ip', 'event_name', 'project_id', 'project_name', 'creat_date', 'note'],
                data: [],
                ip: null,
                visibleIpTable: false,
                choose_ip: '',
                ip_note: ''
            }
        }
    }
</script>
