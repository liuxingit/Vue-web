<template>
    <div class="tableList">
        <el-popover ref="popover4" placement="right" width="400" trigger="click">
            <h1 class="taskTipTitle" v-if="failData.length">失败的任务：</h1>
            <p class="textDanger" v-for="item of failData" :key="item.task_id">{{item.message}}</p>
            <h1 class="taskTipTitle" v-if="doing_task_ids.length">进行中的任务：</h1>
            <p v-if="doing_task_ids.length" v-for="item of doing_task_ids" :key="item">任务id：{{item}}</p>
            <h1 class="taskTipTitle" v-if="done_task_ids.length">您已成功创建{{done_task_ids.length}}个推广组：</h1>
            <p v-if="done_task_ids.length" v-for="item of done_task_ids" :key="item">任务id：{{item}}</p>
        </el-popover>
        <div class="btn-opera-groups clearfix">
            <el-tooltip content="该托管计划不支持新建推广单元" placement="top" v-if="campaign_info && campaign_info.marketingdemand && (+campaign_info.marketingdemand === 1 || +campaign_info.marketingdemand === 3)"> 
                <button class="el-button el-button--primary is-disabled" style="cursor: not-allowed;">
                    <i class="iconfont">&#xe63e;</i>新建推广单元
                </button>
            </el-tooltip>
            <router-link v-else
            :to="{name:'AddAdgroupPage', params:{campaign_id:$route.params.campaign_id},query:{campaign_name:campaign_info.campaign_name,type:campaign_info.type, setting_type:campaign_info.setting_type, auto_managed:campaign_info.auto_managed}}" target="_blank" class="addAdgroupBtn"> 
            <i class="iconfont">&#xe63e;</i>新建推广单元</router-link >
            <span :class="tipClassName"><i title="点击查看详情" class="iconfont" v-popover:popover4>&#xe608;</i><span class="tipText">{{addTipMsg}}</span></span>
            <div class="fr">
                <el-select v-model="filter_status" placeholer="请选择">
                    <el-option label="推广单元列表" value="">
                    </el-option>
                    <el-option label="有效单元" value="tb_yx">
                    </el-option>
                    <el-option v-if="item.value !== 5"
                      v-for="item in CAMPAIGN_STATUS"
                      :label="item.label"
                      :value="item.value" :key="item.value">
                    </el-option>
                  </el-select>
                <date-time-picker rpt-time type="adgroups"></date-time-picker>
                <more-data></more-data>
            </div>
        </div>
        <paginate-table row-class-name="showHoverTr"  :data-list="currentAdgroups" :paginate-user-option="Object.assign(paginationOption,{total:currentAdgroups ? currentAdgroups.length : 0})" border style="width: 100%">
            <paginate-table-column fixed label="推广单元" width="310">
                <template scope="scope">
                    <div style="min-height: 38px; padding-top: 14px;">
                         <router-link :to="{name:'AdgroupDscPage',params:{ adgroup_id:scope.row.adgroup_id},query:{campaign_id:$route.params.campaign_id,adgroup_name:scope.row.adgroup_name,type:campaign_info.type, setting_type:campaign_info.setting_type,show:scope.row.online_status !== 9 && campaign_info.online_status !== 9,activeName:'crowd'}}">
                            {{scope.row.adgroup_name}}
                        </router-link>
                        <i class="hoverShow iconfont" v-if="scope.row.online_status !== 9 && campaign_info.online_status !== 9" @click="handleClick(scope.row,'adgroup_name')" title="修改推广单元名称">&#xe635;</i>
                        <a class="hoverShow" title="查看报表" :href="`/rpt?type=adgroup&campaign_id=${scope.row.campaign_id}&adrgoup_id=${scope.row.adgroup_id}`" target="_blank"><i class="iconfont">&#xe634;</i></a>
                        <i v-if="scope.row.online_status !== 1" class="hoverShow iconfont" @click="handleClick(scope.row,'delete')" title="删除推广单元">&#xe623;</i>
                    </div>
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
            <paginate-table-column fixed="right" label="状态" width="150">
                <template scope="scope">
                    <span :class="statusColor(scope.row.online_status)">{{CAMPAIGN_STATUS[scope.row.online_status] ? CAMPAIGN_STATUS[scope.row.online_status].label : '--'}}</span>
                    <el-button class="hoverShow" v-if="campaign_info.online_status !== 9 && scope.row.online_status !== 9" @click="handleClick(scope.row,'online_status')" type="text" size="small">修改</el-button>
                </template>
            </paginate-table-column>
            <paginate-table-column v-if="campaign_info.setting_type" fixed="right" label="优化状态" width="150">
                <template scope="scope">
                    <template v-if="campaign_info && campaign_info.marketingdemand && (+campaign_info.marketingdemand === 1 || +campaign_info.marketingdemand === 3)">--</template>
                    <template v-else>
                        <span v-if="campaign_info.online_status === 9 || scope.row.online_status === 9 || campaign_info.type === 2">--</span>
                        <div class="buttonNopm" v-else-if="scope.row.auto_managed === 1">
                            <el-button type="text" :class="scope.row.crowd_setting.crowd_optimize_type === 3 ? 'textDanger' : 'textSuccess'">{{scope.row.crowd_setting.crowd_optimize_type === 1 ? '自动优化中' : scope.row.crowd_setting.crowd_optimize_type === 2 ? '只优化价格' : '不自动优化'}}</el-button>
                            <i class="hoverShow iconfont" @click="handleClick(scope.row,'auto_managed')" title="修改优化状态">&#xe635;</i>
                            <div v-if="scope.row.crowd_setting.crowd_optimize_type !== 3">最高出价：{{Math.round(scope.row.crowd_setting.crowd_max_price) / 100}} 元</div>
                        </div>
                        <div class="buttonNopm" v-else>
                            <span>未托管</span>
                            <el-button class="hoverShow"  type="text" size="small"  @click="handleClick(scope.row,'auto_managed')">设为托管</el-button>
                        </div>
                    </template>
                </template>
            </paginate-table-column>
            <paginate-table-column fixed="right" label="操作" width="150">
                <template scope="scope">
                    <router-link :to="{name:'AdgroupDscPage',params:{ adgroup_id:scope.row.adgroup_id},query:{campaign_id:$route.params.campaign_id,adgroup_name:scope.row.adgroup_name,type:campaign_info.type, setting_type:campaign_info.setting_type,show:scope.row.online_status !== 9 && campaign_info.online_status !== 9,activeName:'crowd'}}">
                        <span>定向</span>
                    </router-link>
                    <router-link  :to="{name:'AdgroupDscPage',params:{ adgroup_id:scope.row.adgroup_id},query:{campaign_id:$route.params.campaign_id,adgroup_name:scope.row.adgroup_name, setting_type:campaign_info.setting_type,type:campaign_info.type,show:scope.row.online_status !== 9 && campaign_info.online_status !== 9,activeName:'adzone'}}">
                        <span>资源位</span>
                    </router-link>
                    <router-link :to="{name:'AdgroupDscPage',params:{ adgroup_id:scope.row.adgroup_id},query:{campaign_id:$route.params.campaign_id,adgroup_name:scope.row.adgroup_name, setting_type:campaign_info.setting_type,type:campaign_info.type,show:scope.row.online_status !== 9 && campaign_info.online_status !== 9,activeName:'creative'}}">
                        <span>创意</span>
                    </router-link>
                </template>
            </paginate-table-column>
        </paginate-table>
        <change-online-status></change-online-status>
        <change-adgroup-auto-managed :only_price="0"></change-adgroup-auto-managed>
    </div>
</template>
<script>
    import {FEILDTITLE, CAMPAIGN_STATUS, TYPES} from '@/config'
    import DateTimePicker from '@/components/DateTimePicker'
    import changeAdgroupAutoManaged from '@/components/operation/changeAdgroupAutoManaged'
    import changeOnlineStatus from '@/components/operation/changeOnlineStatus'
    import bus from '@/assets/js/bus.js'
    import {commafy} from '../assets/js/base.js'
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')
    export default {
        data() {
            return {
                // 分页配置信息
                paginationOption: {
                    pageSize: 20,
                    currentPage: 1,
                    total: 0,
                },
                FEILDTITLE:FEILDTITLE,
                CAMPAIGN_STATUS:CAMPAIGN_STATUS,
                filtered_adg_title: [],//筛选的推广单元名称
                loading: false,
                ADGROUPS_NAME:[],//筛选后的推广单元名称
                adgroups:[],//所有的计划
                dialogChangeOnlineStatusVisible:false,
                cur_online_status:null,
                dialogAdgroupAutoManagedVisible:false,
                cur_adgroup_id:null,
                cur_setting:null,
                Adgroup_Rpt:{},
                filter_status:'tb_yx',
                addTipMsg:'',//创建推广单元的提示信息
                showPopoverFailFlag:false,
                failData:[],
                doing_task_ids:[],
                done_task_ids:[],
            }
        },
        created(){
            this.getAdgroupList()
            this.getAdgroupsRpt()
            // localStorage.setItem('addAdgroup' + this.$route.params.campaign_id, 'adad92b9-6019-4003-88c0-457fa5506969#1498118527942')
            this.getTaskStatus()
            let self = this
            setInterval(function(){
                self.getTaskStatus()
            }, 10000)
        },
        watch: {
            $route(curVal,oldVal){
                this.$set(this, 'doing_task_ids', []);
                this.$set(this, 'failData', []);
                this.$set(this, 'done_task_ids', []);
                this.$set(this, 'showPopoverFailFlag', false);
                this.$set(this, 'addTipMsg', '');
                this.getAdgroupList()
                this.getAdgroupsRpt()
            },
            Adgroup_Rpt:{
                deep:true,
                handler(value){
                    let resetRpt = {}
                    for(let rpt_type in FEILDTITLE){
                        resetRpt[rpt_type] = '-'
                    }
                    for(let [index,adgroup] of this.adgroups.entries()){
                        this.adgroups.splice(index, 1, Object.assign(adgroup, this.Adgroup_Rpt[adgroup.adgroup_id] ? this.Adgroup_Rpt[adgroup.adgroup_id][0] : resetRpt))
                    }
                }
            },
        },
        computed:{
            tipClassName(){
                return this.addTipMsg ? this.failData.length ? 'ybtask-tip fail' : 'ybtask-tip doing' : 'ybtask-tip hide' 
            },
            RPT_SETTING(){
                return this.$store.state.plan.RPT_SETTING
            },
            campaign_info() {
                return this.$store.state.plan.curCampaign
            },
            currentAdgroups(){
                if(!this.filter_status && this.filter_status !== 0){
                    return this.adgroups
                } else {
                    if (this.adgroups) {
                        return this.adgroups.filter(item => {
                            return this.filter_status === 'tb_yx' ? item.online_status !== 9 : item.online_status === this.filter_status
                        })
                    }
                }
            },
        },
        mounted() {
            bus.$off('getDateTime').$on('getDateTime', (val,type) => {
                if (type === 'adgroups') { this.getAdgroupsRpt(val) }
            })
            bus.$off('changeAutoManagedFinished').$on('changeAutoManagedFinished', (handle_setting, type) => {
                if (type === 'adgroups') { this.changeAutoManaged(handle_setting) }
            })
            bus.$off('changeOnlineStatus').$on('changeOnlineStatus', (online_status, type) => {
                if(type === 'adgroup'){
                    let adgroup_id = this.cur_adgroup_id
                    this.$http.post('adgroup/ajax_modify_adgroup_status',{
                        campaign_id:this.$route.params.campaign_id - 0,
                        adgroup_id_list:[adgroup_id],
                        status:online_status
                    }).then((res) => {
                        if (!res.success) {return}
                        let data = res.data
                        bus.$emit('closeChangeOnlineStatus')
                        let index = this.adgroups.findIndex(function(element){
                            return element.adgroup_id === adgroup_id
                        })
                        if(index > -1){
                            this.adgroups[index].online_status = online_status
                        }
                    })
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
            commafyData(data, rpt_type){
                return commafy(data, rpt_type)
            },
            getAdgroupList(){
                this.$http.post('adgroup/ajax_get_adgroup_list', {campaign_id:this.$route.params.campaign_id - 0}).then((res) => {
                    if (!res.success) {return}
                    let data = res.data
                    if(data.length){
                        for(let [index,adgroup] of data.entries()){
                            if(this.Adgroup_Rpt[adgroup.adgroup_id]){
                                Object.assign(adgroup, this.Adgroup_Rpt[adgroup.adgroup_id][0])
                            }
                        }
                        this.$set(this, 'adgroups', data);
                    } else {
                        let task_ids = this.hasTaskIds()
                        if(!task_ids){
                            this.$alert('您需要新建个推广单元', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.$router.push({name:'AddAdgroupPage', params:{campaign_id:this.$route.params.campaign_id},query:{campaign_name:this.campaign_info.campaign_name,type:this.campaign_info.type, setting_type:this.campaign_info.setting_type, auto_managed:this.campaign_info.auto_managed}})
                                }                            
                            });
                        }
                    }
                })
            },
            getAdgroupsRpt(post_data){
                this.$http.post('ajax_get_adgroup_total_rpts',Object.assign(post_data || {
                    start_date:this.$store.state.plan.init_rpt_time[0],
                    end_date:this.$store.state.plan.init_rpt_time[1]
                }, {campaign_id:this.$route.params.campaign_id - 0,return_key_value:true})).then((res) => {
                    if(!res.success){return}
                    let data = res.data
                    for(let adgroup_id in data){
                        delete data[adgroup_id][0].adgroup_name
                    }
                    this.$set(this,'Adgroup_Rpt',data)
                })
            },
            handleClick(data, type) {
                if(type === 'online_status'){
                    this.$set(this,'cur_adgroup_id',data.adgroup_id)
                    this.$set(this,'cur_online_status',data.online_status)
                    bus.$emit('showChangeOnlineStatus', data.online_status)
                } else if(type === 'auto_managed'){
                    this.$set(this, 'cur_setting', {
                        auto_managed:data.auto_managed,// ? data.auto_managed : false,
                        crowd_setting:data.crowd_setting ? Object.assign({},data.crowd_setting) : {crowd_optimize_type:1, crowd_max_price:null}
                    })
                    this.$set(this,'cur_adgroup_id',data.adgroup_id)
                    bus.$emit('showAutoManagedDialog', this.cur_setting)
                } else {
                    const INFO = {
                        // cancel:{
                        //     title: '确定修改该推广单元的优化状态吗？',
                        //     msg:'推广单元：' + data.adgroup_name + '优化状态修改成功！',
                        // },
                        delete:{
                            title: '确定删除推广单元' + data.adgroup_name + '吗？',
                            msg:'推广单元：' + data.adgroup_name + '删除成功！',
                        },
                        adgroup_name: {
                            title: '请输入新的推广单元名称',
                            inputValue:data.adgroup_name,
                            inputPattern:/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/,
                            msg:'推广单元名称修改成功！',
                            inputErrorMessage:'推广单元名称不能为空,且长度为1~32个字符'
                        },
                    }
                    let options = {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                    }
                    if(type === 'delete'){
                        Object.assign(options, {
                            type:'warning'
                        })
                        let url = 'adgroup/ajax_delete_adgroup', post_data={
                            campaign_id:this.$route.params.campaign_id - 0,
                            adgroup_id_list:[data.adgroup_id]
                        }
                        this.$confirm(INFO[type].title, '提示', options).then(({ value }) => {
                            this.$http.post(url, post_data).then((res) => {
                                if (!res.success) {return}
                                let res_data = res.data
                                let index = this.adgroups.findIndex(function(element){
                                    return element.adgroup_id === data.adgroup_id
                                })
                                if(index > -1){
                                    this.adgroups.splice(index,1)
                                }
                                this.$message({
                                    type: 'success',
                                    message: INFO[type].msg
                                });
                            })
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '您已取消操作'
                            });
                        });
                    } else if(type === 'adgroup_name'){
                        Object.assign(options, {
                            inputPattern:INFO[type].inputPattern,
                            inputValue:INFO[type].inputValue,
                            inputErrorMessage: INFO[type].inputErrorMessage
                        })
                        this.$prompt(INFO[type].title, '修改计划信息', options).then(({ value }) => {
                            let post_data = {
                                campaign_id:this.$route.params.campaign_id - 0,
                                adgroup_id:data.adgroup_id
                            }
                            post_data[type] = value
                            if(post_data[type] === data[type]){
                                return false
                            }
                            this.$http.post('adgroup/ajax_modify_adgroup',post_data).then((res) => {
                                if (!res.success) { return false}
                                let res_data = res.data
                                if(res_data || res_data === ''){
                                    data[type] = value
                                    this.$message({
                                        type: 'success',
                                        message: INFO[type].msg
                                    });
                                }
                            })
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '您已取消操作'
                            });
                        });
                    }
                }
            },
            statusColor(status){//计划状态文案颜色
                return CAMPAIGN_STATUS[status] ? CAMPAIGN_STATUS[status].color_class : ''
            },
            changeAutoManaged(handle_setting){//修改推广组优化状态
                handle_setting.auto_managed = handle_setting.auto_managed ? 1 : 0
                if((handle_setting.auto_managed === this.cur_setting.auto_managed && handle_setting.auto_managed === 0)|| JSON.stringify(handle_setting) === JSON.stringify(this.cur_setting)){
                    bus.$emit('hideAutoManagedDialog')
                    return false
                }
                this.$http.post('adgroup/ajax_modify_adgroup_optimize_status',Object.assign({campaign_id:this.$route.params.campaign_id - 0,
                    adgroup_id:this.cur_adgroup_id,
                },handle_setting)).then((res) => {
                    if (!res.success) { return false}
                    bus.$emit('hideAutoManagedDialog')
                    for(let [index, adgroup] of this.adgroups.entries()){
                        if(this.cur_adgroup_id === adgroup.adgroup_id){
                            this.adgroups.splice(index, 1, Object.assign(adgroup, handle_setting))
                        }
                    }
                })
            },
            close(dialogName){
                this.$set(this,dialogName, false)
            },
            getCurrentDate(){
                if(this.$store.state.plan.shopInfo && this.$store.state.plan.shopInfo.current_time && this.$store.state.plan.shopInfo.current_time.$date){
                    return new Date(this.$store.state.plan.shopInfo.current_time.$date - 8*3600000);
                }
                return new Date();
            },
            hasTaskIds(){
                var tasks = localStorage.getItem('addAdgroup' + this.$route.params.campaign_id)
                if(tasks){
                    tasks = tasks.split('&')
                    let limit_date = (this.getCurrentDate()).getTime() - 24 * 3600000

                    for(let [index, item] of tasks.entries()){
                        let temp_item = item.split('#')
                        if(temp_item[1] < limit_date){
                            tasks.splice(index,1)
                        }
                    }
                    localStorage.setItem('addAdgroup' + this.$route.params.campaign_id, tasks.join('&'))
                }
                return tasks
            },
            getTaskStatus(){
                let tasks = this.hasTaskIds()
                if(tasks){
                    let task_ids = []
                    for(let item of tasks){
                        task_ids.push(item.split('#')[0])
                    }
                    let count = {'doing':0, 'fail':0, 'done':0}, msg = '', doing_task_ids = [],failData = this.failData, done_task_ids = this.done_task_ids
                    this.$http.post('ajax_get_task_status',{task_ids:task_ids}).then((res) => {
                        if (!res.success) { return false}
                        let data = res.data
                        for(let task_item of data){
                            for(let task_id in task_item){
                                let status = task_item[task_id].status
                                if(status === 'done' && !task_item[task_id].result.success){//任务本身成功，但事情失败
                                    count.fail = count.fail + 1
                                } else {
                                    count[status] = count[status] + 1
                                }
                                if(status === 'doing'){
                                    doing_task_ids.push(task_id)
                                } else if(status === 'fail' || (status === 'done' && !task_item[task_id].result.success)) {
                                    failData.push({
                                        task_id:task_id,
                                        message:'任务' + task_id + '：' + (status === 'fail' ? '异步执行失败' : task_item[task_id].result.message)
                                    })
                                } else if(status === 'done' && task_item[task_id].result.success){
                                    done_task_ids.push(task_id)
                                }
                            }
                        }
                        if(count.done){//新增成功才会重新获取推广单元列表
                            this.getAdgroupList()
                            this.getAdgroupsRpt()
                        }
                        if(failData.length){
                            msg += failData.length + '个推广单元创建失败;'
                        }
                        if(done_task_ids.length){
                            msg += done_task_ids.length + '个推广单元创建成功;'
                        }
                        if(count.doing){
                            msg += count.doing + '个推广单元正在创建;'
                            let cur_doing_tasks = []
                            for(let task_id of doing_task_ids){
                                for(let task of tasks){
                                    let task_data = task.split('#')
                                    if(task_data[0] === task_id){
                                        cur_doing_tasks.push(task)
                                    }
                                }
                            }
                            localStorage.setItem('addAdgroup' + this.$route.params.campaign_id, cur_doing_tasks.join('&')) 
                        } else {
                            localStorage.removeItem('addAdgroup' + this.$route.params.campaign_id)
                        }
                        this.$set(this, 'doing_task_ids', doing_task_ids)
                        this.$set(this, 'addTipMsg', msg)
                        this.$set(this, 'failData', failData)
                    })
                }
            },
        },
        components:{paginateTable, paginateTableColumn, DateTimePicker, changeAdgroupAutoManaged,changeOnlineStatus,
            MoreData: MoreData,
        }

    }
</script>
<style scoped>
    @import './AdgroupList.less'
</style>
