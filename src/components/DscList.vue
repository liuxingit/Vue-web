<template>
    <div class="tableList DscLists">
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="定向" name="crowd"></el-tab-pane>
            <el-tab-pane label="资源位" name="adzone"></el-tab-pane>
            <el-tab-pane label="创意" name="creative"></el-tab-pane>
        </el-tabs>
        <div>
            <el-alert v-if="show_No_Edit_Price" title='由于智钻官方限制，类目型定向-高级兴趣点、智能定向-宝贝、行业店铺定向无法在系统内进行修改出价、新增资源位操作' type="warning" :closable="false"></el-alert>
            <div class="btn-opera-groups">
                <template v-if="activeName !== 'creative' && currentCampaign && currentCampaign.marketingdemand && (+currentCampaign.marketingdemand === 1 || +currentCampaign.marketingdemand === 3)">
                    <el-tooltip :content="`该托管计划不支持增加${ACTIVE_TYPE[activeName].title}`" placement="top"> 
                        <button class="el-button el-button--primary is-disabled" v-if="!(this.activeName === 'adzone' && show_No_Edit_Price)">
                            <i class="iconfont">&#xe63e;</i>{{'增加' + ACTIVE_TYPE[activeName].title}}
                        </button>
                    </el-tooltip>
                    <el-tooltip :content="`该托管计划不支持删除${ACTIVE_TYPE[activeName].title}`" placement="top"> 
                        <button class="el-button el-button--primary is-disabled" v-if="!(this.activeName === 'adzone' && show_No_Edit_Price)">
                            <i class="iconfont">&#xe623;</i>删除
                        </button>
                    </el-tooltip>
                </template>
                <template v-else>
                    <el-button type="primary" @click="addNew" v-if="!(this.activeName === 'adzone' && show_No_Edit_Price)"><i class="iconfont">&#xe63e;</i> {{'增加' + ACTIVE_TYPE[activeName].title}}</el-button>
                    <el-button type="primary" @click="deleteItem"><i class="iconfont">&#xe623;</i>删除</el-button>
                </template>
                <div class="fr">
                    <date-time-picker rpt-time type="adgroup"></date-time-picker>
                    <more-data></more-data>
                </div>
            </div>
            <paginate-table ref="multiTable" :row-class-name="activeName !== 'creative' ? 'showHoverDetailTr' : 'showHoverTr'" :data-list="adgroups" :paginate-user-option="paginationOption" @selection-change="handleSelectionChange" class="adgroupExpandTable" fit>
                <paginate-table-column fixed type="selection" width="55"></paginate-table-column>
                <paginate-table-column fixed v-if="activeName !== 'creative'" type="expand" width="30">
                    <template scope="scope">
                        <el-table :row-class-name="activeName !== 'creative' ? 'showHoverDetailTr' : 'showHoverTr'" class="noBorder" :show-header="false" :data="scope.row.matrix_prices" style="width: 100%">
                            <el-table-column  width="55"></el-table-column>
                            <el-table-column  width="30"></el-table-column>
                            <el-table-column  width="360">
                                <template scope="props">
                                    {{activeName === 'crowd' ? props.row.adzone_name : props.row.crowd_name_for_display}}
                                </template>
                            </el-table-column>
                            <el-table-column width="200">
                                <template scope="props">
                                    {{Math.round(props.row.price) / 100}} 元
                                    <i v-if="showEditPrice(scope.row) && $route.query.show" class=" hoverShow iconfont" @click="handleClick(props.row,'price', scope.row)">&#xe635;</i>
                                </template>
                            </el-table-column>
                            <el-table-column  align="right" :prop="RPT_SETTING[index]" v-for="(rpt_type, index) of RPT_SETTING" :key="index" :label="FEILDTITLE[RPT_SETTING[index]]" sortable min-width="160">
                                <template scope="props">
                                    {{props.row[RPT_SETTING[index]] ? commafyData(props.row[RPT_SETTING[index]], RPT_SETTING[index]) : 0}}
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </paginate-table-column>
                <paginate-table-column fixed :label="ACTIVE_TYPE[activeName].title + '信息'" width="360" prop="name">
                    <template scope="scope">
                        <el-row :gutter="20" v-if="activeName === 'creative'">
                            <el-col :span="10" class="creativeImgWrap" title="查看大图"><img :src="scope.row.image_path" @click="imgModalSrc = scope.row.image_path"/></el-col>
                            <el-col :span="14" class="creativeImgInfo">
                                <span>{{scope.row.creative_name}}&nbsp;</span>
                                <a class="hoverShow" title="查看报表" :href="`/rpt?type=creative&campaign_id=${$route.query.campaign_id}&adgroup_id=${$route.params.adgroup_id}&creative_id=${scope.row.creative_id}`" target="_blank"><i class="iconfont">&#xe634;</i></a>
                                <!-- <p>尺寸：{{scope.row.creative_size.width}} X {{scope.row.creative_size.height}}</p> -->
                            </el-col>
                        </el-row>
                        <div v-else>
                            <span>{{scope.row.crowd_name_for_display}}{{scope.row.adzone_name}}</span>
                            <a class="hoverShow" title="查看报表" :href="`/rpt?type=${activeName === 'crowd' ? 'target':'adzone'}&campaign_id=${$route.query.campaign_id}&adgroup_id=${$route.params.adgroup_id}&${activeName === 'crowd' ? 'target_id':'adzone_id'}=${scope.row[activeName+'_id']}`" target="_blank"><i class="iconfont">&#xe634;</i></a>
                        </div>
                    </template>
                </paginate-table-column>
                <paginate-table-column fixed v-if="activeName === 'creative'" label="审核状态" width="200">
                    <template scope="scope" :class="statusColor(scope.row.audit_status)">
                        {{AUDIT_STATUS_DICT[scope.row.audit_status] ? AUDIT_STATUS_DICT[scope.row.audit_status] : ''}}
                    </template>
                </paginate-table-column>
                <paginate-table-column fixed v-else label="出价" width="200">
                    <template scope="scope">
                        <span>{{scope.row.price}} 元</span>
                        <i v-if="showEditPrice(scope.row) && $route.query.show" class="hoverShow iconfont" @click="handleClick(scope.row,'price','all')">&#xe635;</i>
                    </template>
                </paginate-table-column>
                <paginate-table-column  align="right" header-align="right" :prop="RPT_SETTING[index]" 
                v-for="(rpt_type, index) of RPT_SETTING" :key="index" :label="FEILDTITLE[RPT_SETTING[index]]" 
                :icon-class="showTipIcon(FEILDTITLE[RPT_SETTING[index]])" :icon-tips="showTip(FEILDTITLE[RPT_SETTING[index]])"
                sortable min-width="160">
                    <template scope="scope">
                        {{scope.row[RPT_SETTING[index]] ? commafyData(scope.row[RPT_SETTING[index]], RPT_SETTING[index]) : 0}}
                    </template>
                </paginate-table-column>
            </paginate-table>
        </div>
        <new-crowd :crowdVisible="crowdVisible" :disable_crowd_data="disable_crowd_data"></new-crowd>
        <new-crowd-second :crowdSecondVisible="crowdSecondVisible" :selected_data="selected_data"></new-crowd-second>
        <new-adzone :adzoneVisible="adzoneVisible" :data="data"></new-adzone>
        <new-creative :creativeVisible="creativeVisible" :data="data"></new-creative>
        <set-multidimensional-price :multiplePriceVisible="multiplePriceVisible" :check_data="check_data" :set_type="activeName" :selected_data="selected_data"></set-multidimensional-price>
        <img-modal :img="imgModalSrc" @close="imgModalSrc = ''"></img-modal>
    </div>
</template>
<script>
    import {FEILDTITLE, CAMPAIGN_STATUS, TYPES, TYPES_CROWD_PRICE, AUDIT_STATUS,AUDIT_STATUS_DICT} from '@/config'
    import bus from '@/assets/js/bus.js'
    import {commafy, formatDate} from '@/assets/js/base.js'
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    import imgModal from '@/components/widget/imgModal'
    import DateTimePicker from '@/components/DateTimePicker'
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')
    // const DateTimePicker = r => require.ensure([], () => r(require('@/components/DateTimePicker')), 'DateTimePicker')
    const newCrowd = r => require.ensure([], () => r(require('@/components/operation/newCrowd')), 'newCrowdAndAdzoneAndCreative')
    const newCrowdSecond = r => require.ensure([], () => r(require('@/components/operation/newCrowdSecond')), 'newCrowdAndAdzoneAndCreative')
    const newAdzone = r => require.ensure([], () => r(require('@/components/operation/newAdzone')), 'newCrowdAndAdzoneAndCreative')
    const newCreative = r => require.ensure([], () => r(require('@/components/operation/newCreative')), 'newCrowdAndAdzoneAndCreative')
    const setMultidimensionalPrice = r => require.ensure([], () => r(require('@/components/operation/setMultidimensionalPrice')), 'newCrowdAndAdzoneAndCreative')


    const SPECIAL_CROWD = [2048,1048576,524288]
    const ACTIVE_TYPE = {
        crowd:{
            sub_key:'adzone',
            title:'定向',
            url:'crowd/ajax_get_adgroup_crowd_list',
            add_url:'crowd/ajax_add_crowd',
            delete_url:'crowd/ajax_delete_crowd',
            update_url:'crowd/ajax_update_crowd',
        },
        adzone:{
            sub_key:'crowd',
            title:'资源位',
            url:'adzone/ajax_get_adgroup_adzone_list',
            add_url:'adzone/ajax_bind_adzone',
            delete_url:'adzone/ajax_unbind_adzone',
        },
        creative:{
            title:'创意',
            url:'creative/ajax_get_adgroup_creative_list',
            add_url:'creative/ajax_bind_creative',
            delete_url:'creative/ajax_unbind_creative',
        }
    }
    export default {
        data() {
            return {
                show_No_Edit_Price:false,
                // 分页配置信息
                paginationOption: {
                    pageSize: 20,
                    currentPage: 1,
                    total: 1,
                },
                AUDIT_STATUS_DICT:AUDIT_STATUS_DICT,
                AUDIT_STATUS: AUDIT_STATUS,
                ACTIVE_TYPE: ACTIVE_TYPE,
                adgroups: [],
                disable_crowd_data:{},
                activeName: 'crowd',
                FEILDTITLE: FEILDTITLE,
                loading: false,
                // RPT_SETTING: localStorage.getItem('RPT_SETTING') ? localStorage.getItem('RPT_SETTING') : RPT_SETTING,
                crowdVisible: false,
                crowdSecondVisible:false,
                adzoneVisible: false,
                creativeVisible: false,
                multiplePriceVisible:false,
                data:{},
                multipleSelection:[],
                check_data:[],//存放被选择的资源位,
                selected_data:null,//存放被选择的定向类型的数据
                Rpt:{},//存放报表
                Crowd_Adzone_Rpt:[],
                hadCrowdTypes:[],//存放已有的定向的type
                imgModalSrc: '',
            }
        },
        watch: {
            $route(curVal,oldVal){
                this.$set(this,'data', {
                    campaign_id:this.$route.query.campaign_id - 0,
                    adgroup_id:this.$route.params.adgroup_id - 0,
                })
                this.getData()
                //this.getRpt()
            },
            Rpt:{
                deep:true,
                handler(value){
                    let resetRpt = {}
                    for(let rpt_type in FEILDTITLE){
                        resetRpt[rpt_type] = '-'
                    }
                    for(let [index,adgroup] of this.adgroups.entries()){
                        this.adgroups.splice(index, 1, Object.assign(adgroup, this.Rpt[adgroup[this.activeName + '_id']] ? this.Rpt[adgroup[this.activeName + '_id']][0] : resetRpt))
                    }
                    if (this.$route.query.activeName === 'creative') {
                        const index = this.adgroups.findIndex(i => i.creative_id === +this.$route.query.creative_id)
                        if (index > -1) {
                            this.$nextTick(() => {
                                this.$refs.multiTable.toggleRowSelection(this.adgroups[index])
                            })
                        }
                    }
                }
            },
            Crowd_Adzone_Rpt:{
                deep:true,
                handler(value){
                    if(this.activeName !== 'creative'){
                        let id = this.activeName === 'crowd' ? 'target_id' : 'adzone_id'
                        let sub_id = this.activeName === 'crowd' ? 'adzone_id' : 'target_id'
                        let resetRpt = {}
                        for(let rpt_type in FEILDTITLE){
                            resetRpt[rpt_type] = '-'
                        }
                        let temp_data = this.adgroups
                        if(this.Crowd_Adzone_Rpt && this.Crowd_Adzone_Rpt.length){
                            let rpts = {}
                            for(let rpt of this.Crowd_Adzone_Rpt){
                                if(!rpts[rpt[id]]){
                                    rpts[rpt[id]] = {}
                                }
                                rpts[rpt[id]][rpt[sub_id]] = rpt
                            }
                            for(let [index,adgroup] of temp_data.entries()){
                                if(rpts[adgroup[this.activeName + '_id']]){
                                    for(let [index1, matrix_price] of adgroup.matrix_prices.entries()){
                                        if(rpts[adgroup[this.activeName + '_id']][matrix_price[ACTIVE_TYPE[this.activeName].sub_key + '_id']]){
                                            adgroup.matrix_prices.splice(index1, 1, Object.assign(matrix_price, rpts[adgroup[this.activeName + '_id']][matrix_price[ACTIVE_TYPE[this.activeName].sub_key + '_id']]))
                                        } else {
                                            adgroup.matrix_prices.splice(index1, 1, Object.assign(matrix_price, resetRpt))
                                        }
                           
                                    }
                                } else {
                                    for(let [index1,matrix_price] of adgroup.matrix_prices.entries()){
                                        adgroup.matrix_prices.splice(index1, 1, Object.assign(matrix_price, resetRpt))
                                    }
                                }
                                
                            }
                        } else {
                            for(let [index,adgroup] of temp_data.entries()){
                                for(let [index1,matrix_price] of adgroup.matrix_prices.entries()){
                                    adgroup.matrix_prices.splice(index1, 1, Object.assign(matrix_price, resetRpt))
                                }
                            }
                        }
                        this.$set(this, 'adgroups', temp_data)
                    }
                }
            }
        },
        computed:{
            RPT_SETTING(){
                return this.$store.state.plan.RPT_SETTING
            },
            MAX_PRICE(){
                let MAX_PRICE = TYPES_CROWD_PRICE[this.$route.query.type]
                let campaigns = this.$store.state.plan.campaignList
                for(let {campaign_id, day_budget} of campaigns){
                    if(campaign_id === this.$route.query.campaign_id - 0){
                        MAX_PRICE = Math.round(day_budget) / 100
                        break;
                    }
                }
                return MAX_PRICE
            },
            currentCampaign() {
                const list =  this.$store.state.plan.campaignList
                const index = list.findIndex(i => i.campaign_id === +this.$route.query.campaign_id)
                if (index > -1) {
                    return list[index]
                }
            },
        },
        created(){
            this.activeName = this.$route.query.activeName
            this.getData()
        },
        mounted() {
            bus.$off('getDateTime').$on('getDateTime', (val,type) => {
                if(type === 'adgroup') {
                    this.getRpt(val)
                }
            }),
            bus.$off('closeAll').$on('closeAll', () => {
                this.$set(this,'crowdVisible', false)
                this.$set(this,'crowdSecondVisible', false)
                this.$set(this,'adzoneVisible', false)
                this.$set(this,'creativeVisible', false)
                this.$set(this,'multiplePriceVisible', false)
            }),
            bus.$off('closePrice').$on('closePrice',() => {
                this.$set(this,'multiplePriceVisible', false)
                if(this.activeName === 'crowd'){
                    this.$set(this,'crowdSecondVisible', true)
                } else {
                    this.$set(this,'adzoneVisible', true)
                }
            }),
            bus.$off('prevStep').$on('prevStep', () => {
                this.$set(this,this.activeName + 'SecondVisible', false)
            })
            bus.$off('nextStep').$on('nextStep', (setting_data,type) => {
                if(type === 'second'){//资源位只有两步
                    if(this.activeName === 'adzone'){
                        this.$set(this,'selected_data', {})
                        this.$set(this,'check_data', setting_data)
                        this.$set(this,'multiplePriceVisible', true)
                    } else {
                        this.$set(this,'selected_data', setting_data)
                        this.$set(this,this.activeName + 'SecondVisible', true)
                    }
                    return false
                } else if(type === 'third'){//定向有第三步
                    this.$set(this,'check_data', setting_data)
                    this.$set(this,'multiplePriceVisible', true)
                    return false
                }
            })
            bus.$off('submitCrowdAdzoneCreative').$on('submitCrowdAdzoneCreative', (setting_data,type) =>{
                if(type !== 'newCreatives'){
                    this.addNewFinished(setting_data,type)
                }
            })
        },
        methods: {
            showTipIcon(type) {
                if (type.match(/CTR|ECPC|CVR|ECPM|UV/)) {
                    return 'icon-question'
                }
                return ''
            },
            showTip(type) {
                switch (type) {
                    case 'CTR':
                    return '点击率';
                    case 'ECPC':
                    return '千次点击费用';
                    case 'CVR':
                    return '点击转化率';
                    case 'ECPM':
                    return '千次展现成本';
                    case 'UV':
                    return '访客';
                    default:
                    return '';
                }
            },
            showEditPrice(data){
                let showFlag =  true
                if(this.activeName === 'crowd'){
                    showFlag =  SPECIAL_CROWD.indexOf(data.crowd_type) < 0
                    if(!showFlag){
                        this.$set(this,'show_No_Edit_Price', !showFlag)
                    }
                    return showFlag
                } else {
                    for(let matrix_price of data.matrix_prices){
                        if(SPECIAL_CROWD.indexOf(matrix_price.crowd_type) > -1){
                            showFlag = false
                            break
                        }
                    }
                    this.$set(this,'show_No_Edit_Price', !showFlag)
                    return showFlag
                }
                
            },
            commafyData(data, rpt_type){
                return commafy(data, rpt_type)
            },
            handleTabClick(){
                this.$set(this, 'adgroups', [])
                this.getData()
                //this.getRpt()
            },
            statusColor(status){//审核状态文案颜色
                for(let key of Object.keys(this.AUDIT_STATUS)){
                    if(key.splice(',').indexOf(status) > -1){
                        return this.AUDIT_STATUS[key].color_class
                        break;
                    }
                }
                return ''
            },
            handleClick(data, type, is_all) {
                const INFO = {
                    // name: {
                    //     title: '请输入新的定位信息',
                    //     inputValue:data.crowd_name,
                    //     inputPattern:/.+/,
                    //     msg:'定位信息修改成功！',
                    //     inputErrorMessage:'定位信息不能为空'
                    // },
                    price:{
                        title: '请输入出价',
                        inputValue:is_all && is_all === 'all' ? '' : Math.round(data.price) / 100,
                        inputPattern:/^[0-9]{1,}.?\d{0,2}$/,
                        msg:'出价修改成功！',
                        inputErrorMessage:'出价应为合法数值，单位元，最多两位小数'
                    },
                }
                let options = {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }
                if(type === 'price'){
                    Object.assign(options, {
                        inputPattern:INFO[type].inputPattern,
                        inputValue:INFO[type].inputValue,
                        inputErrorMessage: INFO[type].inputErrorMessage
                    })
                    this.$prompt(INFO[type].title, '修改' + ACTIVE_TYPE[this.activeName].title + '信息', options).then(({ value }) => {
                        let post_data = {
                            campaign_id: this.$route.query.campaign_id - 0,
                            adgroup_id: this.$route.params.adgroup_id - 0,
                        }
                        let camp_type = this.$route.query.type - 0
                        if(isNaN(value) || value <= 0 || value > this.MAX_PRICE){
                            this.$alert('出价应为0~' + this.MAX_PRICE + '的合法数值，最多两位小数', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                            return false
                        } else {
                            value = Math.round((value - 0) * 100)
                            let key = ACTIVE_TYPE[this.activeName].sub_key
                            if(is_all === 'all'){
                                let matrix_prices = []
                                for(let item of data.matrix_prices){
                                    item.price = value
                                    let matrix_price = {
                                        [key + '_id']:item[key + '_id'],
                                        price:value,
                                    }
                                    if(item.crowd_type || item.crowd_type === 0){
                                        Object.assign(matrix_price, {crowd_type:item.crowd_type})
                                    }
                                    matrix_prices.push(matrix_price)
                                }
                                if(this.activeName === 'crowd'){
                                    Object.assign(post_data, {
                                        crowds:[{
                                            crowd_id:data.crowd_id,
                                            crowd_name:data.crowd_name,
                                            crowd_value:data.crowd_value,
                                            sub_crowds:data.sub_crowds,
                                            crowd_type:data.crowd_type,
                                            matrix_prices:matrix_prices
                                        }]
                                    })
                                } else {
                                    Object.assign(post_data, {
                                        adzone_id:data.adzone_id,
                                        matrix_prices:matrix_prices
                                        // crowds:[{
                                        //     // crowd_name:data.crowd_name,
                                        //     // crowd_value:data.crowd_value,
                                        //     // sub_crowds:data.sub_crowds,
                                        //     // crowd_type:data.crowd_type,
                                        //     matrix_prices:matrix_prices
                                        // }]
                                    })
                                }
                            } else {
                                data.price = value
                                let min, max;
                                let matrix_prices = []
                                for(let item of is_all.matrix_prices){
                                    matrix_prices.push({
                                        [key + '_id']:item[key + '_id'],
                                        price:item.price,
                                    })
                                    min = min ? Math.min(min, item.price) : item.price
                                    max = max ? Math.max(max, item.price) : item.price
                                }
                                is_all.price = min === max ? Math.round(min) / 100 :
                                 Math.round(min) / 100 + '~' + Math.round(max) / 100
                                if(this.activeName === 'crowd'){
                                    Object.assign(post_data, {
                                        crowds:[{
                                            crowd_id:is_all.crowd_id,
                                            crowd_name:is_all.crowd_name,
                                            crowd_value:is_all.crowd_value,
                                            sub_crowds:is_all.sub_crowds,
                                            crowd_type:is_all.crowd_type,
                                            matrix_prices:matrix_prices
                                        }],
                                    })
                                } else {
                                    Object.assign(post_data, {
                                        adzone_id:is_all.adzone_id,
                                        matrix_prices:[{
                                            crowd_type:data.crowd_type,
                                            crowd_id:data.crowd_id,
                                            price:value
                                        }]
                                    })
                                }
                            }
                            this.$http.post(this.activeName === 'crowd' ? 'crowd/ajax_update_crowd' : 'adzone/ajax_update_adzone',post_data).then((res) => {
                                if (!res.success) {return false}
                                let res_data = res.data
                                data[type] = is_all && is_all === 'all' ? Math.round(value) / 100 : value
                                this.$message({
                                    type: 'success',
                                    message: INFO[type].msg
                                });
                            })
                        }


                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '您已取消操作'
                        });
                    });
                }
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            deleteItem(){
                console.log('选择的定向或者资源位或者创意》》》',this.multipleSelection.length,this.multipleSelection)
                if(this.multipleSelection.length){
                    if(this.multipleSelection.length === this.adgroups.length && this.activeName !== 'creative'){
                        this.$confirm('推广单元至少要保留一个' + ACTIVE_TYPE[this.activeName].title, '提示信息', {
                            confirmButtonText: '确定',
                            type:'warning',
                            callback: action => {}
                        });
                    } else {
                        this.$confirm('确定删除选中的'+ this.multipleSelection.length + '个' + ACTIVE_TYPE[this.activeName].title + '吗？', '提示信息', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type:'warning'
                        }).then(({ value }) => {
                            let ids = []
                            for(let item of this.multipleSelection){
                                ids.push(item[this.activeName + '_id'])
                            }
                            let post_data = {
                                campaign_id:this.$route.query.campaign_id - 0,
                                adgroup_id:this.$route.params.adgroup_id - 0
                            }
                            post_data[this.activeName + '_id_list'] = ids
                            this.$http.post(this.ACTIVE_TYPE[this.activeName].delete_url,post_data).then((res) => {
                                if(res.success){
                                    this.$message('操作成功');
                                    this.getData(false)
                                }
                            })
                        })
                    }
                } else {
                    this.$alert('请至少选择一个操作', '提示信息', {
                        confirmButtonText: '确定',
                        callback: action => {}
                    });
                }
            },
            getData(not_rpt){
                this.$http.post(this.ACTIVE_TYPE[this.activeName].url,{
                    campaign_id: this.$route.query.campaign_id - 0,
                    adgroup_id: this.$route.params.adgroup_id - 0,
                }).then((res) => {
                    if(!res.success) {
                        return false
                    }
                    let data = res.data
                    if(!data){
                        data = []
                    }
                    this.$set(this.paginationOption, 'total', data.length)
                    if(data.length){
                        if(this.activeName !== 'creative'){
                            for(let item of data){
                                let min, max;
                                let prices_list = item.matrix_prices
                                for(let {price} of prices_list){
                                    min = min ? Math.min(min, price) : price
                                    max = max ? Math.max(max, price) : price
                                }
                                item.price = min === max ? Math.round(min) / 100 :
                                 Math.round(min) / 100 + '~' + Math.round(max) / 100
                            }
                            if (this.activeName === 'crowd'){
                                this.$set(this, 'hadCrowdTypes', [])
                                for(let {crowd_id, crowd_type , crowd_name} of data){
                                    this.hadCrowdTypes.push([crowd_type, crowd_id, crowd_name].join('&'))
                                }
                            }
                        }
                        for(let [index,item] of data.entries()){
                            item.checked = false
                            if(this.Rpt[item[this.activeName + '_id']]){
                                Object.assign(item, this.Rpt[item[this.activeName + '_id']][0])
                            }
                        }
                    }
                    this.$set(this, 'adgroups', data);
                   
                    if(!not_rpt){
                        this.getRpt()
                    }
                })
            },
            addNew(){
                this.$set(this, this.activeName + 'Visible', true)
            },
            addNewFinished(setting_data, type){
                let promises = []
                let post_data = {
                    campaign_id: this.$route.query.campaign_id - 0,
                    adgroup_id: this.$route.params.adgroup_id - 0,
                }
                if(this.activeName === 'crowd'){
                    let crowds2 = [], indexs = []
                    for(let [index, crowd] of setting_data.entries()){
                        for(let item of this.hadCrowdTypes){
                            let [crowd_type, crowd_id, crowd_name] = item.split('&')
                            //128 为达摩盘， 16384 为cpm的兴趣点定向
                            let special_crowd_type = [128, 16384, 16, 32]
                            let flag = special_crowd_type.indexOf(crowd.crowd_type) > -1 ? crowd_name === crowd.crowd_name && crowd_type - 0 === crowd.crowd_type : crowd_type - 0 === crowd.crowd_type
                            if(flag){
                                crowds2.push(Object.assign(crowd,{crowd_id:crowd_id - 0}))
                                indexs.push(index)
                            }
                        }
                    }
                    if(crowds2.length){
                        for(let index of indexs.reverse()){
                            setting_data.splice(index, 1)
                        }
                        promises.push(this.$http.post(this.ACTIVE_TYPE[this.activeName].update_url,Object.assign({crowds:crowds2},post_data)))
                    }
                    if(setting_data.length){
                         Object.assign(post_data, {
                            crowds:setting_data
                        })
                        promises.push(this.$http.post(this.ACTIVE_TYPE[this.activeName].add_url,post_data))
                    }
                } else {
                    if(this.activeName === 'creative'){
                        Object.assign(post_data, {
                            creative_id_list:setting_data
                        })
                    } else if(this.activeName === 'adzone'){
                        Object.assign(post_data, {
                            adzone_bid_list:setting_data
                        })
                    }
                    promises.push(this.$http.post(this.ACTIVE_TYPE[this.activeName].add_url,post_data))
                }
                Promise.all(promises).then(posts => {
                    let error = false
                    for(let res_data of posts){
                        if(!res_data.success){
                            error = true
                        }
                    }
                    if(this.activeName === 'creative'){
                        this.$set(this,'creativeVisible', false)
                    } else if(this.activeName === 'adzone'){
                        this.$set(this,'adzoneVisible', false)
                        this.$set(this,'multiplePriceVisible', false)
                    } else {
                        this.$set(this,'crowdVisible', false)
                        this.$set(this,'crowdSecondVisible', false)
                        this.$set(this,'multiplePriceVisible', false)
                    }
                    if(!error){
                        this.$message('操作成功');
                    }
                    this.getData()
                })
            },
            getRpt(post_data){
                post_data = Object.assign(post_data || {
                    start_date:this.$store.state.plan.init_rpt_time[0],
                    end_date:this.$store.state.plan.init_rpt_time[1]
                })
                Object.assign(post_data, {
                    campaign_id:this.$route.query.campaign_id - 0,
                    adgroup_id:this.$route.params.adgroup_id - 0,
                    return_key_value:true
                })
                let post_data1, post_data2;
                if(post_data.start_date === post_data.end_date && post_data.start_date === formatDate(new Date())){
                    let ids = [], key = this.activeName === 'crowd' ? 'target' : this.activeName
                    let sub_ids = [],key2 = this.activeName === 'crowd' ? 'adzone' : 'target'
                    for(let item of this.adgroups){
                        ids.push(item[this.activeName + '_id'])

                        if(this.activeName !== 'creative'){
                            for(let item2 of item.matrix_prices){
                                sub_ids.push({
                                    [key2 + '_id']:item2[ACTIVE_TYPE[this.activeName].sub_key + '_id'],
                                    [key + '_id']:item[this.activeName + '_id']
                                })
                            }
                        }
                    }
                    post_data1 = Object.assign({},post_data, {[key + '_ids']:ids})
                    post_data2 = Object.assign({},post_data, {target_adzone_ids:sub_ids})
                } else {
                    post_data1 = post_data
                    post_data2 = post_data
                }

                this.$http.post('ajax_get_' + (this.activeName === 'crowd' ? 'target' : this.activeName)  + '_total_rpts',post_data1).then((res) => {
                    if (!res.success) { return }
                    let data = res.data
                    if(data){
                        this.$set(this,'Rpt',data)
                    }
                })
                if(this.activeName !== 'creative'){
                    this.$http.post('ajax_get_target_adzone_total_rpts',post_data2).then((res) => {
                        if (!res.success) { return }
                        let data = res.data
                        if(data){
                            // console.log(this.adgroups,'>>>>>>.所有的资源位')
                            // for(let [index,adgroup] of this.adgroups.entries()){
                            //     let id = this.activeName === 'crowd' ? 'target_id' : 'adzone_id'
                            //     let sub_id = this.activeName === 'crowd' ? 'adzone_id' : 'target_id'
                            //     for(let rpt of data){
                            //         console.log(111,rpt[id], adgroup[this.activeName + '_id'], rpt[id] === adgroup[this.activeName + '_id'])
                            //         if(rpt[id] === adgroup[this.activeName + '_id']){
                            //             for(let matrix_price of adgroup.matrix_prices){
                            //                 console.log(222,matrix_price[ACTIVE_TYPE[this.activeName].sub_key + '_id'] , rpt[sub_id], matrix_price[ACTIVE_TYPE[this.activeName].sub_key + '_id'] === rpt[sub_id])
                            //                 if(matrix_price[ACTIVE_TYPE[this.activeName].sub_key + '_id'] === rpt[sub_id]){
                            //                     Object(matrix_price, rpt)
                            //                 }
                            //             }
                            //         }
                            //     }
                            // }
                            this.$set(this, 'Crowd_Adzone_Rpt', data)
                        } else {
                            this.$set(this, 'Crowd_Adzone_Rpt', [])
                        }
                    })
                }
            },
        },
        components:{
            DateTimePicker,
            MoreData: MoreData,
            newCrowd: newCrowd,
            newCrowdSecond: newCrowdSecond,
            newCreative: newCreative,
            newAdzone: newAdzone,
            setMultidimensionalPrice: setMultidimensionalPrice,
            imgModal,paginateTable, paginateTableColumn
        }
    }
</script>
<style lang="less">
.DscLists {
    .adgroupExpandTable .el-table__expanded-cell {
        padding:0;
    }
    .creativeImgWrap {
        height:80px; 
        display: flex; 
        align-items: center; 
        width: 140px;
        justify-content: center;
        background-color:#f7f7f7;
        border: 1px solid #e6e6e6;
        cursor: pointer;
        img {
            border: none;
            width: 140px;
            height: auto;
            max-height: 70px;
        }
    }
    .creativeImgInfo {
        height: 80px;
        display: flex;
        align-items: center;
    }
    .creativeImgInfo a{
        line-height: 15px;
    }
}
</style>