<template>
    <div class="campaignSettings topLevelSetting">
        <h1 class="topLevelTitle">
            <i class="el-icon-date"></i>{{campaign_info.setting_type ? '自动' : '手动'}}-{{campaign_info.campaign_name}}
            <span class="type-symbol">{{typeFormat}}计划</span>
        </h1>
        <div class="btn-opera-groups">
            <el-button @click="showLaunchDialog('area')"><i class="iconfont">&#xe644;</i> 投放地域设置</el-button>
            <el-button @click="showLaunchDialog('time')"><i class="iconfont">&#xe643;</i> 投放时段设置</el-button>
            <el-button v-if="campaign_info.setting_type" @click="resetCampaign"><i class="iconfont">&#xe630;</i> 恢复手动计划</el-button>
            <el-button @click="routeToOperationLog"><i class="iconfont">&#xe63b;</i> 优化日志</el-button>
        </div>
        <launch-area-dialog edit ref="launchArea" :show="launchAreaFlag" :area-list="campaign_info.area_id_list" @close="launchAreaFlag = false" @submit="submitLaunchArea"></launch-area-dialog>
        <launch-time-dialog edit ref="launchTime" :show="launchTimeFlag" :workday="campaign_info.workday" :weekend="campaign_info.weekend" @close="launchTimeFlag = false" @submit="submitLaunchTime"></launch-time-dialog>
    </div>
</template>
<script>
    import {TYPES} from '@/config'
    import bus from '@/assets/js/bus'
    const LaunchTimeDialog = r => require.ensure([], () => r(require('@/components/launch-setting-dialog/LaunchTimeDialog')), 'campaignSetting')
    const LaunchAreaDialog = r => require.ensure([], () => r(require('@/components/launch-setting-dialog/LaunchAreaDialog')), 'campaignSetting')
    export default {
        data() {
            return {
                launchTimeFlag: false,
                launchAreaFlag: false,
            }
        },
        computed:{
            campaign_info() {
                return this.$store.state.plan.curCampaign
            },
            typeFormat(){
                return this.$store.state.plan.curCampaign.type ? TYPES[this.$store.state.plan.curCampaign.type].toUpperCase() : ''
            },
            // weekend() {
            //     return this.$store.state.plan.curCampaign.weekend
            // },
            // workday() {
            //     return this.$store.state.plan.curCampaign.workday
            // },
            // areaList() {
            //     return this.$store.state.plan.curCampaign.areaList
            // },
            campaignList() {
                return this.$store.state.plan.campaignList
            }
        },
        methods: {
            showLaunchDialog(type) {
                if (type === 'area' && this.$refs.launchArea) {
                    // this.$refs.launchArea.showDialog = true
                    this.launchAreaFlag = true
                }
                if (type === 'time' && this.$refs.launchTime) {
                    // this.$refs.launchTime.showDialog = true
                    this.launchTimeFlag = true
                }
            },
            resetCampaign(){
                this.$confirm('确定将改计划恢复为手动计划吗？', '提示信息', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type:'warning'
                }).then(({}) => {
                    this.$http.post('campaign/ajax_reset_campaign', {campaign_id:+this.$route.params.campaign_id}).then((res) => {
                        if (!res.success) return
                        let campaigns = this.campaignList
                        for(let [index, campaign] of campaigns.entries()){
                            if(campaign.campaign_id === this.campaign_info.campaign_id){
                                campaigns.splice(index, 1, Object.assign(campaign, {setting_type:0}))
                                break;
                            }
                        }
                        this.campaign_info.setting_type = 0
                        this.$store.commit('getCampaignList', campaigns)
                        this.$store.commit('setCurCampaign', Object.assign(this.$store.state.plan.curCampaign, {setting_type:0}))
                        this.$alert('操作成功', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '您已取消操作'
                    });
                });
            },
            routeToOperationLog() {
                window.open('/operation_log/' + this.$store.state.plan.campaignId)
            },
            submitLaunchArea(area_id_list, auto_managed) {
                if (area_id_list && area_id_list.length) {
                    this.$http.post('/campaign/ajax_modify_banner_campaign', {
                        campaign_id: this.$store.state.plan.campaignId,
                        area_id_list,
                    }).then((res) => {
                        if (!res.success) return
                        this.$store.commit('setCurCampaign', Object.assign(this.$store.state.plan.curCampaign, {area_id_list}))
                        this.$message({
                            message: '设置保存成功!',
                            type: 'success'
                        });
                        this.launchAreaFlag = false
                    })
                }
                if (auto_managed) { this.setAutoManage(auto_managed, 'area') }
                if (!area_id_list && !auto_managed) {
                    this.launchAreaFlag = false
                }
            },
            submitLaunchTime(workday, weekend, auto_managed) {
                if (workday && weekend) {
                    this.$http.post('/campaign/ajax_modify_banner_campaign', {
                        campaign_id: this.$store.state.plan.campaignId,
                        workday,
                        weekend,
                    }).then((res) => {
                        if (!res.success) return
                        this.$store.commit('setCurCampaign', Object.assign(this.$store.state.plan.curCampaign, {workday}, {weekend}))
                        this.$message({
                            message: '设置保存成功!',
                            type: 'success'
                        });
                        this.launchTimeFlag = false
                    })
                }
                if (auto_managed) { 
                    this.setAutoManage(auto_managed, 'time')
                }
                if (!workday && !weekend && !auto_managed) {
                    this.launchTimeFlag = false
                }
            },
            setAutoManage(auto_managed, type) {
                this.$http.post('campaign/ajax_modify_banner_campaign_handle_status', auto_managed).then(res => {
                    let modify_data
                    if (!res.success) return
                    if (type === 'area') {
                        this.launchAreaFlag = false
                        modify_data = { optimize_area_status: auto_managed.optimize_area_status }
                    } else if (type === 'time') {
                        this.launchTimeFlag = false
                        modify_data = { optimize_banner_time_status: auto_managed.optimize_banner_time_status }
                    }
                    this.$store.commit('setCurCampaign', Object.assign(this.$store.state.plan.curCampaign, modify_data))
                })
            },
        },
        components:{
            LaunchTimeDialog: LaunchTimeDialog,
            LaunchAreaDialog: LaunchAreaDialog
        }
    }
</script>