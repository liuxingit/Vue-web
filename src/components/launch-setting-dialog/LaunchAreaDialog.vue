<template>
      <el-dialog custom-class="launch-area-dialog" title="投放地域选择" v-model="showDialog" @open="initDialog" @close="resetData" :close-on-click-modal="false">
        <auto-managed ref="autoManaged" v-if="edit && this.$store.state.plan.curCampaign.setting_type" type="area" @change="getAutoManaged"></auto-managed>
        <div class="clearfix">
            <div class="pullLeft">
                <div class="section">
                    <el-checkbox v-model="comSelectAll" @change="comChange({common: true})">全选-常用地区</el-checkbox>
                    <el-checkbox-group v-model="comGroup" size="small">
                        <div class="list-container clearfix" >
                            <div class="pullLeft">
                                <div class="list" v-for="(item, index) in comArea" v-if="index <= 6">
                                    <span class="flag">{{item.flag}}</span>
                                    <el-checkbox v-for="area in item.areas" :label="area.code" :key="area.code" @change="updateMapSelection({code: area.code})">{{area.name}}</el-checkbox>
                                </div>
                            </div>
                            <div class="pullRight">
                                <div class="list"  v-for="(item, index) in comArea" v-if="index > 6">
                                    <span class="flag">{{item.flag}}</span>
                                    <el-checkbox v-for="area in item.areas" :label="area.code" :key="area.code" @change="updateMapSelection({code: area.code})">{{area.name}}</el-checkbox>
                                </div>
                            </div>
                        </div>
                    </el-checkbox-group>
                </div>
                <div class="section">
                    <el-checkbox v-model="uncomSelectAll" @change="uncomChange({common: false})">全选-非常用地区</el-checkbox>
                    <el-checkbox-group v-model="uncomGroup">
                        <el-checkbox v-for="item in uncomArea" :label="item.code" :key="item.code" @change="updateMapSelection({code: item.code})">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>  
            <div class="pullLeft china-map"></div>     
        </div>
        <div slot="footer" class="dialog-footer textCenter">
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
    </el-dialog>
</template>

<script>
import bus from '@/assets/js/bus'
import autoManaged from './autoManaged'
import echarts from 'echarts/lib/echarts'
require('echarts/map/js/china')
require('echarts/lib/chart/map')

    export default {
        components: { autoManaged },
        props: {
            areaList: Array,
            show: {
                type: Boolean,
                required: true
            },
            edit: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            show(v) {
                this.showDialog = v
            },
            showDialog(v) {
                if (v === false) { 
                    this.$emit('close') 
                }
            },
            comGroup(arr, a, b) {
                this.comSelectAll = arr.length === 29 ? true : false
            },
            uncomGroup(arr) {
                this.uncomSelectAll = arr.length === 6 ? true : false
            },
        },
        methods: {
            comChange(common) {
                if (this.comSelectAll) {
                    this.comArea.forEach(item => {
                        item.areas.forEach(area => { 
                            if (this.comGroup.indexOf(area.code) < 0) {
                                this.comGroup.push(area.code)
                            }   
                        })
                    })
                } else {
                    this.comGroup = []
                }
                this.updateMapSelection(common)
            },
            uncomChange(common) {
                this.uncomGroup = this.uncomSelectAll ? this.uncomArea.map(i => i.code) : []
                this.updateMapSelection(common)
            },
            initDialog() {
                this.renderMap()
                this.edit || this.areaListCache ? this.specialInit() : this.defaultInit()
                if (this.edit && this.$store.state.plan.curCampaign.setting_type) {
                    this.autoManageData = {
                        campaign_id: this.$store.state.plan.campaignId,
                        auto_managed: this.$store.state.plan.curCampaign.auto_managed,
                        optimize_area_status: this.$store.state.plan.curCampaign.optimize_area_status,
                    }
                }             
            },
            defaultInit() {
               this.comSelectAll = true
               this.comChange({common: true})
            },
            specialInit() {
                const arr = this.edit ? this.areaList : this.areaListCache
                let time;
                arr.forEach(code => {
                    if (this.uncomArea.some(item => item.code === code)) {
                        this.uncomGroup.push(code)
                    } else {
                        this.comGroup.push(code)
                    }
                    this.updateMapSelection({code}, true)
                })
                this.updateMap()
            },
            initChinaMap() {
                const container = document.querySelector('.china-map')
                const option = {
                    tooltip : {
                        trigger: 'item',
                        formatter: '{b}'
                    },
                    series : [
                        {
                            name: '中国',
                            type: 'map',
                            mapType: 'china',
                            selectedMode : 'multiple',
                            itemStyle:{
                                normal:{
                                    label:{show:true},
                                    
                                },
                                emphasis:{
                                    label:{show:true},
                                    areaColor: '#569DFF'
                                }
                            },
                            left: 0,
                            right: 0,
                            data: this.mapSelection
                        }
                    ]
                };
                this.chinaMap = echarts.init(container)
                this.chinaMap.setOption(option)
                this.chinaMap.on('click', (params) => {
                    const index = this.mapSelection.findIndex((i) => {
                        return i.code === params.data.code
                    })
                    this.mapSelection.splice(index, 1, params.data)
                    this.updateGroup(params.data)
                })
            },
            renderMap() {
                if (this.chinaMap) {
                    this.updateMap()
                    clearTimeout(time)
                    return
                }
                // element ui 的dialog在打开过后querySelector才找得到DOM
                let time = setTimeout(() => {
                    this.initChinaMap()
                }, 0)
            },
            updateMap() {
                if (!this.chinaMap) { return }
                this.chinaMap.setOption({
                    series: [{ data: this.mapSelection }]
                })
            },
            updateGroup(province) {
                let index;
                let group = province.common ? this.comGroup : this.uncomGroup
                index = group.indexOf(province.code);
                index > -1 ? group.splice(index, 1) : group.push(province.code)
            },
            updateMapSelection(data, init) {
                this.mapSelection = this.mapSelection.filter(item => {
                    if (data.code) {
                        item.selected = item.code === data.code ? !item.selected : item.selected
                    } else {
                        if (item.common === data.common) {
                            item.selected = data.common ? this.comSelectAll : this.uncomSelectAll
                        }
                    }
                    return item
                })
                if (!init) { this.updateMap() }
            },
            getAutoManaged(data) {
                this.autoManageData = Object.assign(this.autoManageData, { optimize_area_status: data })
            },
            cancel() {
                this.$emit('close')
            },
            handleSave() {
                let data = [...this.comGroup, ...this.uncomGroup]
                let auto_managed = this.autoManageData
                if (!data.length) { 
                    this.$alert('请至少选择一个投放地域')
                    return false
                }
                if (this.edit && this.areaList && this.areaList.length && data.toString() === this.areaList.toString()) {
                    data = null
                }
                if (this.edit && this.$store.state.plan.curCampaign.setting_type) {
                    if (auto_managed.optimize_area_status === this.$store.state.plan.curCampaign.optimize_area_status) {
                        auto_managed = null
                    }
                }
                if (!this.edit) {
                    this.areaListCache = data
                }
                // data = Array.from(new Set(data)) // 数组去重
                this.edit ? this.$emit('submit', data, auto_managed) :this.$emit('submit', data)
            },
            resetData() {
                this.comGroup = []
                this.uncomGroup = []
                this.comSelectAll = false
                this.uncomSelectAll = false
                this.mapSelection = this.mapSelection.map(item => {
                    item.selected = false
                    return item
                })
                if (this.edit && this.$store.state.plan.curCampaign.setting_type) {
                    this.$refs.autoManaged.managed = this.$store.state.plan.curCampaign.optimize_area_status ? true : false
                }
            }
        },
        computed: {
            areaListCache: {
                get() {
                    if (this.edit) {
                        return 
                    }
                    return this.newAreaList
                },
                set(arr) {
                    this.newAreaList = arr
                }
            }
        },
        data() {
            return {
                showDialog: false,
                newAreaList: null,
                comSelectAll: false,
                comGroup: [],
                uncomSelectAll: false,
                uncomGroup: [],
                mapSelection: [],
                chinaMap: null,
                comArea: [
                    { flag: 'A', areas: [{code:1,name:'安徽'}]},
                    { flag: 'B', areas: [{code:19,name:'北京'}]},
                    { flag: 'C', areas: [{code:532,name:'重庆'}]},
                    { flag: 'F', areas: [{code:39,name:'福建'}]},
                    { flag: 'G', areas: [
                        {code:68,name:'广东'},
                        {code:92,name:'广西'},
                        {code:109,name:'贵州'},
                        {code:52,name:'甘肃'}
                    ]},
                    { flag: 'H', areas: [
                        {code:165,name:'黑龙江'},
                        {code:125,name:'河北'},
                        {code:145,name:'河南'},
                        {code:184,name:'湖北'},
                        {code:212,name:'湖南'},
                        {code:120,name:'海南'},
                    ]},
                    { flag: 'J', areas: [
                        {code:234,name:'吉林'},
                        {code:255,name:'江苏'},
                        {code:279,name:'江西'}
                    ]},
                    { flag: 'L', areas: [{code:294,name:'辽宁'}]},
                    { flag: 'N', areas: [
                        {code:333,name:'内蒙古'},
                        {code:351,name:'宁夏'},
                    ]},
                    { flag: 'Q', areas: [{code:357,name:'青海'}]},
                    { flag: 'S', areas: [
                        {code:393,name:'山西'},
                        {code:406,name:'陕西'},
                        {code:368,name:'山东'},
                        {code:417,name:'上海'},
                        {code:438,name:'四川'},
                    ]},
                    { flag: 'T', areas: [{code:461,name:'天津'}]},
                    { flag: 'Y', areas: [{code:488,name:'云南'}]},
                    { flag: 'Z', areas: [{code:508,name:'浙江'}]}
                ],
                uncomArea: [
                    {code:471,name:'新疆'},
                    {code:463,name:'西藏'},
                    {code:577,name:'台湾'},
                    {code:599,name:'香港'},
                    {code:576,name:'澳门'},
                    {code:531,name:'中国其他'},
                ],
                autoManageData: null,
            }
        },
        created() {
           this.comArea.forEach(item => {
               item.areas.forEach(area => { this.mapSelection.push(Object.assign(area, { selected: false, common: true })) })
           })
           this.uncomArea.forEach(i => {
               this.mapSelection.push(Object.assign(i, { selected: false, common: false }))
           })
        },
    }
</script>
<style lang="less">
    .launch-area-dialog {
        .el-dialog__body {
            padding: 20px;
        }
        .auto {
            margin-bottom: 15px;
        }
        width:1000px !important;
        .section {
            width: 440px;
            .list {
                width: 220px;
                margin-bottom: 10px;
                .flag {
                    display: inline-block;
                    float: left;
                    width: 15px;
                    font-weight: 600;
                }
            }
            .el-checkbox {
                margin-bottom: 10px;
                width: 50px;
                .el-checkbox__label {
                    font-size: 12px;
                }
                .el-checkbox__inner {
                    width: 15px;
                    height: 15px;
                    &:after {
                        height: 8px;
                        left: 4px;
                        top:0;
                        width: 4px;
                    }
                }
            }
        }
    .china-map {
        width: 500px;
        height: 400px;
    }
}
</style>