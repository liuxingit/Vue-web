<template>
    <div class="tableList">
        <div class="btn-opera-groups">
            <div class="clearfix" style="display:inline-block">
                <el-button type="primary" class="pullLeft" @click="dialogSetCampaignVisible = true"><i class="iconfont">&#xe63e;</i> 新建推广计划</el-button>
                <span class="prompt pullLeft campaign-prompt">温馨提示：由于官方权限问题，对于即将到期的用户，我们会在到期前一个工作日暂停系统内建立的计划，由此带来的不便敬请谅解。</span>
            </div>
            <div class="fr">
                <el-select v-model="filter_camp_status" placeholer="请选择">
                    <el-option label="计划列表" value="">
                    </el-option>
                    <el-option label="有效计划" value="tb_yx">
                    </el-option>
                    <el-option
                      v-for="item in CAMPAIGN_STATUS"
                      :label="item.label"
                      :value="item.value" :key="item.value">
                    </el-option>
                  </el-select>
                <date-time-picker rpt-time type="campaign" @get-date-time="getCampaignsRpt"></date-time-picker>
                <more-data></more-data>
            </div>
        </div>
        <paginate-table row-class-name="showHoverTr" :data-list="currentCampaigns" :paginate-user-option="Object.assign(paginationOption,{total:currentCampaigns ? currentCampaigns.length : 0})" border style="width: 100%">
            <paginate-table-column fixed label="计划名称" width="420" label-tip="温馨提示：仅支持CPC计划的托管">
                <template scope="scope">
                    <div class="handler" :class="!scope.row.auto_managed ? 'manual' : 'auto'" style="min-height: 38px; padding-top: 12px;">
                        <span @click="goToCampManage(scope.row)" :class="scope.row.online_status !== 9 ? 'cursorPointer' : ''">
                            <span style="color:#888;border-radius:3px;border:1px solid #888;padding:0 2px;">{{TYPES[scope.row.type].toUpperCase()}}</span>
                            <span v-if="scope.row.setting_type" style="color:#5dc88d;border-radius:3px;border:1px solid #5dc88d;padding:0 2px;">自动</span>
                            <span class="creative-title" :title="scope.row.campaign_name">{{scope.row.campaign_name}}</span>
                        </span>
                        <i class="hoverShow iconfont" v-if="scope.row.online_status !== 9" @click="handleClick(scope.row,'campaign_name')" title="修改计划名">&#xe635;</i>
                        <a  class="hoverShow" title="查看报表" :href="`/rpt?type=campaign&campaign_id=${scope.row.campaign_id}`" target="_blank"><i class="iconfont">&#xe634;</i></a>
                        <i v-if="scope.row.online_status !== 1" class="hoverShow iconfont" @click="handleClick(scope.row,'delete')" title="删除计划">&#xe623;</i>
                    </div>
                </template>
            </paginate-table-column>
            <paginate-table-column label="日预算" width="80">
                <template scope="scope">
                    <span>{{Math.round(scope.row.day_budget) / 100}}</span>
                    <i v-if="scope.row.online_status !== 9" class="hoverShow iconfont" @click="handleClick(scope.row,'day_budget')">&#xe635;</i>
                </template>
            </paginate-table-column>
            <paginate-table-column label="投放时间" width="220">
                <template scope="scope">
                    <span v-if="scope.row.limit_put_time_status">{{formateTime(scope.row.start_time.$date)}} -- 不限</span>
                    <span v-else>{{formateTime(scope.row.start_time.$date)}} -- {{formateTime(scope.row.end_time.$date)}}</span>
                    <i v-if="scope.row.online_status !== 9" class="hoverShow iconfont" @click="handleTimeModifyDialog(scope.row)">&#xe635;</i>
                </template>
            </paginate-table-column>
            <paginate-table-column align="right" header-align="right" prop="adgroup_nums" label="推广组数" width="100" sortable>
                <template scope="scope">
                    <span>{{scope.row.adgroup_nums}}</span>
                </template>
            </paginate-table-column>
            <paginate-table-column  align="right" header-align="right" :prop="RPT_SETTING[index]"
            v-for="(rpt_type, index) of RPT_SETTING" :icon-class="showTipIcon(FEILDTITLE[RPT_SETTING[index]])" :icon-tips="showTip(FEILDTITLE[RPT_SETTING[index]])"
            :key="index" :label="FEILDTITLE[RPT_SETTING[index]]" sortable min-width="140">
                <template scope="scope">
                    {{scope.row[RPT_SETTING[index]] ? commafyData(scope.row[RPT_SETTING[index]], RPT_SETTING[index]) : 0}}
                </template>
            </paginate-table-column>
            <paginate-table-column fixed="right" label="计划状态" width="100" header-align="center" align="center">
                <template scope="scope">
                    <span :class="statusColor(scope.row.online_status)" style="display: block">{{CAMPAIGN_STATUS[scope.row.online_status] ? CAMPAIGN_STATUS[scope.row.online_status].label : '--'}}</span>
                    <el-button class="hoverShow" v-if="scope.row.online_status !== 9" @click="handleClick(scope.row,'online_status')" type="text" size="mini">修改</el-button>
                </template>
            </paginate-table-column>
            <paginate-table-column fixed="right" label="优化状态" width="100" header-align="center" align="center">
                <template scope="scope">
                    <span v-if="scope.row.online_status === 9 || scope.row.type === 2">--</span>
                    <template v-else-if="+scope.row.marketingdemand === 1 || +scope.row.marketingdemand === 3">
                        <el-tooltip v-if="+scope.row.marketingdemand === 1" content="日常托管计划不支持软件内的托管" placement="top">
                            <span>--</span>
                        </el-tooltip>
                        <el-tooltip v-if="+scope.row.marketingdemand === 3" content="拉新托管计划不支持软件内的托管" placement="top">
                            <span>--</span>
                        </el-tooltip>
                    </template>
                    <template v-else-if="!scope.row.setting_type">
                        <span style="display: block">未托管</span>
                        <el-button class="hoverShow" @click="handleClick(scope.row,'change_auto_managed')" type="text" size="mini">设为托管</el-button>
                    </template>
                    <template v-else>
                        <span class="textSuccess" style="display: block">{{scope.row.auto_managed === 1 ? '优化中' : '暂停'}}</span>
                        <el-button class="hoverShow" @click="handleClick(scope.row,'auto_managed')" type="text" size="mini">{{scope.row.auto_managed === 1 ? '暂停' : '设为自动'}}</el-button>
                    </template>
                </template>
            </paginate-table-column>
        </paginate-table>
        <change-online-status></change-online-status>
        <el-dialog custom-class="campaign-hosted" title="计划托管" v-model="campaignHostedDialog">
            <p>
                <span>投放地域：</span>
                <el-switch :width="SWITCH_WIDTH" on-text="开启" off-text="关闭" on-color="#54d68e" v-model="campaignHosted.area"></el-switch>
            </p>
            <p>
                <span>投放时间：</span>
                <el-switch :width="SWITCH_WIDTH" on-text="开启" off-text="关闭" on-color="#54d68e" v-model="campaignHosted.time"></el-switch>
            </p>
            <!--<p>
                <el-checkbox :label="true" v-model.number="reatyAgree">我已阅读并完全同意优钻宝条款，并遵守《钻石展位广告服务使用规范》</el-checkbox>
                <treaty-text></treaty-text>
            </p>-->
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="campaignHostedDialog=false">取&nbsp;消</el-button>
                <el-button size="small" type="primary"
                @click="campaignSettingFinished({
                    optimize_area_status: campaignHosted.area ? 1 : 0,
                    optimize_banner_time_status: campaignHosted.time ? 1 : 0
                })">确&nbsp;定</el-button>
            </div>
        </el-dialog>
        <campaign-time-modify ref="campaignTimeModify" @save-time="modifyCampaignTime"></campaign-time-modify>
        <new-campaign-dialog :show="dialogSetCampaignVisible" :areaList="areaList" :workday="workday" :weekend="weekend"
        @submit="campaignSettingFinished" @close="dialogSetCampaignVisible = false" @back="resetNewCampaignCache"
        @area-show="launchAreaFlag = true" @time-show="launchTimeFlag = true"></new-campaign-dialog>
        <launch-area-dialog ref="launchArea" :show="launchAreaFlag" @submit="getAreaList" @close="launchAreaFlag = false"></launch-area-dialog>
        <launch-time-dialog ref="launchTime" :show="launchTimeFlag" @submit="getTimeList" @close="launchTimeFlag = false"></launch-time-dialog>
    </div>
</template>
<script>
    import {FEILDTITLE, CAMPAIGN_STATUS, TYPES,TYPES_DAY_BUDGETS} from '@/config'
    import {formatDate, commafy} from '@/assets/js/base.js'
    import bus from '@/assets/js/bus.js'
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    import campaignTimeModify from '@/components/operation/campaignTimeModify'
    import changeOnlineStatus from '@/components/operation/changeOnlineStatus'
    import DateTimePicker from '@/components/DateTimePicker'
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')
    // const DateTimePicker = r => require.ensure([], () => r(require('@/components/DateTimePicker')), 'DateTimePicker')
    const newCampaignDialog = r => require.ensure([], () => r(require('@/components/operation/newCampaignDialog')), 'campaignSetting')
    const LaunchTimeDialog = r => require.ensure([], () => r(require('@/components/launch-setting-dialog/LaunchTimeDialog')), 'campaignSetting')
    const LaunchAreaDialog = r => require.ensure([], () => r(require('@/components/launch-setting-dialog/LaunchAreaDialog')), 'campaignSetting')
    export default {
        data() {
            return {
                // 分页配置信息
                paginationOption: {
                    pageSize: 20,
                    currentPage: 1,
                    total: 0,
                },
                TYPES:TYPES,
                FEILDTITLE:FEILDTITLE,
                filter_camp_status:'tb_yx',
                CAMPAIGN_STATUS:CAMPAIGN_STATUS,
                filtered_camp_name: [],//筛选的计划名
                loading: false,
                CAMPAIGNS_NAME:[],//筛选后的计划名称
                cur_campaign:{},
                dialogSetCampaignVisible:false,//设置计划
                dialogChangeOnlineStatusVisible:false,//修改计划状态
                campaignHostedDialog: false, // 托管
                dialogChangeTimeVisible: false,
                campaignHosted: {
                    area: false,
                    time: false,
                },
                SWITCH_WIDTH: 66,
                date_time_picker: [],
                Campaign_Rpt:{},
                launchTimeFlag: false,
                launchAreaFlag: false,
                treatyAgree: false, // 服务条款
                areaList: [],
                workday: [],
                weekend: [],
            }
        },
        created() {
            this.getCampaignsRpt()
        },
        watch: {
            campaignHostedDialog(val) {
                if (!val) {
                    this.campaignHosted.area = false;
                    this.campaignHosted.time = false;
                }
            },
            dialogSetCampaignVisible(val) {
                if (!val) {
                    this.resetNewCampaignCache()
                }
            },
        },
        computed:{
            RPT_SETTING(){
                return this.$store.state.plan.RPT_SETTING
            },
            campaigns() {
                if (this.$store.state.plan.campaignList && this.$store.state.plan.campaignList.length) {
                    return this.$store.state.plan.campaignList.map(item => { return item })
                }
            },
            currentCampaigns(){
                if(!this.filter_camp_status && this.filter_camp_status !== 0){
                    return this.campaigns
                } else {
                    if (this.campaigns) {
                        return this.campaigns.filter(item => {
                            return this.filter_camp_status === 'tb_yx' ? item.online_status !== 9 : item.online_status === this.filter_camp_status
                        })
                    }
                }
            }
        },
        mounted() {
            bus.$off('changeOnlineStatus').$on('changeOnlineStatus', (online_status, type) => {
                if(type === 'campaign'){
                    let campaign_id = this.cur_campaign.campaign_id
                    this.$http.post('campaign/ajax_modify_banner_campaign_status',{campaign_id:campaign_id, status:online_status}).then((res) => {
                        if (!res.success) {return false}
                        let data = res.data
                        if(data || data === ''){
                            bus.$emit('closeChangeOnlineStatus')
                            let index = this.campaigns.findIndex(function(element){
                                return element.campaign_id === campaign_id
                            })
                            if(index > -1){
                                this.campaigns[index].online_status = online_status
                                this.$store.commit('getCampaignList', this.campaigns)
                            }
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
            resetNewCampaignCache() {
                this.$refs.launchArea.areaListCache = null
                this.$refs.launchTime.workdaySaved = null
                this.$refs.launchTime.weekendSaved = null
            },
            getAreaList(areaList) {
                this.areaList = areaList;
                this.launchAreaFlag = false
            },
            getTimeList(workday, weekend) {
                this.workday = workday
                this.weekend = weekend
                this.launchTimeFlag = false
            },
            handleTimeModifyDialog(data) {
                this.$refs.campaignTimeModify.limit_put_time_status = data.limit_put_time_status
                this.$refs.campaignTimeModify.start_time = data.start_time.$date
                this.$refs.campaignTimeModify.start_time_cache = data.start_time.$date
                this.$refs.campaignTimeModify.end_time = data.end_time.$date
                this.$refs.campaignTimeModify.end_time_cache = data.end_time.$date
                this.$refs.campaignTimeModify.online_status = data.online_status
                this.$refs.campaignTimeModify.campaign_id = data.campaign_id
                this.$refs.campaignTimeModify.show = true
            },
            modifyCampaignTime(campaign_id, start_time, end_time, limit_put_time_status) {
                const put_time = {
                    start_time: formatDate(start_time),
                    end_time: formatDate(end_time)
                }
                this.$http.post('campaign/ajax_modify_banner_campaign', { campaign_id, put_time })
                .then(res => {
                    if (!res.success) return
                    const index = this.campaigns.findIndex(item => { return item.campaign_id === campaign_id })
                    if (index > -1) {
                        this.campaigns[index].start_time.$date = new Date(start_time).getTime() + 3600 * 1000 * 8
                        this.campaigns[index].end_time.$date = new Date(end_time).getTime() + 3600 * 1000 * 8
                        this.campaigns[index].limit_put_time_status = limit_put_time_status
                        this.$store.commit('getCampaignList', this.campaigns)
                        this.$refs.campaignTimeModify.show = false
                        this.$message.success('投放时间修改成功')
                    }
                })
            },
            commafyData(data, rpt_type){
                return commafy(data, rpt_type)
            },
            formateTime(date){
                return formatDate(date)
            },
            handleClick(data, type) {
                if(type === 'change_auto_managed'){//手动变托管
                    this.$set(this,'campaignHostedDialog', true)
                    this.$set(this,'cur_campaign',data)
                } else if(type === 'online_status'){
                    bus.$emit('showChangeOnlineStatus', data.online_status)
                    this.$set(this,'cur_campaign',data)
                } else {
                    const INFO = {
                        auto_managed:{
                            title: '确定修改计划：' + data.campaign_name + '的优化状态吗？',
                            msg:'成功修改' + data.campaign_name + '的优化状态！',
                        },
                        delete:{
                            title: '确定删除该计划吗？',
                            msg:'计划删除成功！',
                        },
                        campaign_name: {
                            title: '请输入新的计划名称',
                            inputValue:data.campaign_name,
                            inputPattern:/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/,
                            msg:'计划名称修改成功！',
                            inputErrorMessage:'计划名称不能为空,且长度为1~32个字符'
                        },
                        day_budget:{
                            title: '请输入日限额',
                            inputValue:Math.round(data.day_budget) / 100,
                            inputPattern:data.type === 2 ? /^([3-9]\d{2,}|[1-2]\d{3,})$/ : /^([3-9]\d{1,}|[1-2]\d{2,})$/,
                            msg:'日限额修改成功！',
                            inputErrorMessage:TYPES[data.type].toUpperCase() + '模式下日限额最低' + TYPES_DAY_BUDGETS[data.type] + ',最高不能超过账户余额，且单位为元的整数'
                        },
                    }
                    let options = {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                    }
                    if(type === 'delete' || type === 'auto_managed'){
                        Object.assign(options, {
                            type:'warning'
                        })
                        let url, post_data
                        if(type === 'auto_managed'){
                            url = 'campaign/ajax_modify_banner_campaign_handle_status'
                            post_data = {
                                auto_managed:data.auto_managed === 1 ? 2 : 1,
                                campaign_id:data.campaign_id
                            }
                        } else {
                            url = 'campaign/ajax_delete_banner_campaign'
                            post_data = {del_campaigns:[{campaign_id:data.campaign_id,campaign_name:data.campaign_name}]}
                        }
                        this.$confirm(INFO[type].title, '修改计划信息', options).then(({ value }) => {
                            this.$http.post(url, post_data).then((res) => {
                                if (!res.success) {return}
                                if(type === 'auto_managed'){
                                        data[type] = post_data[type]
                                    } else {
                                        let index = this.campaigns.findIndex(function(element){
                                            return element.campaign_id === data.campaign_id
                                        })
                                        if(index > -1){
                                            this.campaigns.splice(index,1)
                                        }
                                    }
                                    this.$store.commit('getCampaignList', this.campaigns)
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
                    } else if(type === 'campaign_name' || type === 'day_budget'){
                        Object.assign(options, {
                            inputPattern:INFO[type].inputPattern,
                            inputValue:INFO[type].inputValue,
                            inputErrorMessage: INFO[type].inputErrorMessage
                        })
                        let post_data = {
                            campaign_id:data.campaign_id
                        }
                        this.$prompt(INFO[type].title, '修改计划信息', options).then(({ value }) => {
                            if(type === 'day_budget' && value - 0 > this.$store.state.plan.account){
                                this.$alert(TYPES[data.type].toUpperCase() + '模式下日限额最低' + TYPES_DAY_BUDGETS[data.type] + ',最高不能超过账户余额，且单位为元的整数', '提示信息', {
                                    confirmButtonText: '确定',
                                    callback: action => {}
                                });
                            } else {
                                post_data[type] = type === 'day_budget' ? (value - 0) * 100 : value
                                if(type === 'campaign_name' && value.length > 32){
                                    this.$alert('计划名长度不能超过32个字符', '提示信息', {
                                        confirmButtonText: '确定',
                                        callback: action => {}
                                    });
                                } else {
                                    console.log('用户没有修改不用调用接口》》》',post_data[type], data[type],post_data[type] === data[type])
                                    if(post_data[type] === data[type]){
                                        return false
                                    }
                                    this.$http.post('campaign/ajax_modify_banner_campaign',post_data).then((res) => {
                                        if (!res.success) return
                                        data[type] = post_data[type]
                                        this.$store.commit('getCampaignList', this.campaigns)
                                        this.$message({
                                            type: 'success',
                                            message: INFO[type].msg
                                        });
                                    })
                                }
                            }
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
            campaignSettingFinished(setting_info){//计划设置 投放时间 方式 地域等等
                let url, cur_campaign_id = this.cur_campaign.campaign_id;
                if(setting_info.name){//新计划
                    url = 'campaign/ajax_create_banner_campaign'
                } else {
                    url = 'campaign/ajax_modify_banner_campaign_handle_status'
                    Object.assign(setting_info, {
                        campaign_id:cur_campaign_id,
                        auto_managed:1
                    })
                }
                this.$http.post(url, setting_info).then((res) => {
                    if (!res.success) {return}
                    let data = res.data
                    if(setting_info.name){//新计划
                        this.dialogSetCampaignVisible = false
                        
                        let resetRpt = {}
                        for(let rpt_type in FEILDTITLE){
                            resetRpt[rpt_type] = '-'
                        }
                        this.campaigns.push(Object.assign(data,resetRpt))
                        this.$store.commit('getCampaignList', this.campaigns)
                        window.open('/adgroups/' + data.campaign_id)
                    } else {
                        const index = this.campaigns.findIndex(item => { return item.campaign_id === cur_campaign_id })
                        if (index > -1) {
                            this.campaigns[index].auto_managed = 1//自动优化
                            this.campaigns[index].setting_type = 1
                        }
                        this.campaignHostedDialog = false
                    }
                    this.$store.commit('getCampaignList', this.campaigns)
                })
            },
            changeOnlineStatusFinished(online_status){//修改计划状态
                let self = this
                if(online_status === false){
                    self.dialogChangeOnlineStatusVisible = false
                    return false
                }
                this.$http.post('campaign/ajax_modify_banner_campaign_status',{campaign_id:self.cur_campaign.campaign_id, status:online_status}).then((res) => {
                    if (!res.success) {return}
                    self.dialogChangeOnlineStatusVisible = false
                    let index = self.campaigns.findIndex(function(element){
                        return element.campaign_id === self.cur_campaign.campaign_id
                    })
                    if(index > -1){
                        self.campaigns[index].online_status = online_status
                        this.$store.commit('getCampaignList', this.campaigns)
                    }
                })
            },
            goToCampManage(data){
                if(data.online_status !== 9){
                    this.$router.push({name:'AdgroupsPage',params:{campaign_id: data.campaign_id}})
                }
            },
            getCampaignsRpt(post_data, type){
                if (type && type !== 'campaign') { return }
                post_data = Object.assign(post_data || {
                    start_date:this.$store.state.plan.init_rpt_time[0],
                    end_date:this.$store.state.plan.init_rpt_time[1]
                })
                if(post_data.start_date === post_data.end_date && post_data.start_date === formatDate(new Date())){
                    let campaign_ids = []
                    for(let {campaign_id} of this.$store.state.plan.campaignList){
                        campaign_ids.push(campaign_id)
                    }
                    Object.assign(post_data, {campaign_ids:campaign_ids})
                }
                Object.assign(post_data, {return_key_value:true})
                this.$http.post('ajax_get_campaign_total_rpts',post_data).then((res) => {
                    if (!res.success) { return }
                    let data = res.data
                    for(let campaign_id in data){
                        delete data[campaign_id][0].campaign_name
                    }
                    this.$store.commit('campaignRpt',data)
                })
            }
        },
        components:{
            paginateTable, paginateTableColumn,campaignTimeModify,changeOnlineStatus,
            MoreData: MoreData,
            DateTimePicker: DateTimePicker,
            newCampaignDialog: newCampaignDialog,
            LaunchTimeDialog: LaunchTimeDialog,
            LaunchAreaDialog: LaunchAreaDialog
        }
    }
</script>
<style scoped>
     @import './CampaignList.less'
</style>
