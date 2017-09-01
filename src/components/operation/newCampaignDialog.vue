<template>
    <el-dialog custom-class="new-campaign-dialog" :title="title" v-model="showDialog" :close-on-click-modal="false">
        <transition-group name="" mode="out-in">
            <div class="new-campaign-select" v-show="step === 1" key="select">
                <div :class="{selected: setting_type === 1}" class="campaignType" @click="setting_type = 1">
                    <i class="iconfont">&#xe63d;</i>
                    <p>自动计划</p>
                </div>
                <div class="orDiv">or</div>
                <div :class="{selected: setting_type === 0}" class="campaignType" @click="setting_type = 0">
                    <i class="iconfont">&#xe647;</i>
                    <p>手动计划</p>
                </div>
            </div>
            <div class="new-campaign-setting" v-show="step === 2" key="setting">
                <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="campaign-setting-form" label-position="top">
                    <div class="form-inline">
                        <el-form-item label="计划名称：" prop="name">
                            <el-input v-model="form.name" size="small"></el-input>
                        </el-form-item>
                        <el-form-item label="每日预算：" prop="day_budget">
                            <el-input type="day_budget" v-model.number="form.day_budget" size="small"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-background">
                        <el-form-item label="投放日期：" prop="put_time">
                            <el-radio-group v-model.number="form.limit_put_time_status">
                                <el-radio :label="1">不限</el-radio>
                                <el-radio :label="0">自定义日期</el-radio>
                            </el-radio-group>
                            <date-time-picker noInitTime type="newCampaignSetting" size="mini" v-show="!form.limit_put_time_status" :option="pickerOption" @get-date-time="setTime"></date-time-picker>
                        </el-form-item>
                        <div class="form-inline">
                            <el-form-item label="付费方式：">
                                <el-radio-group v-model.number="form.type">
                                    <el-radio v-if="!form.setting_type" :label="2">CPM</el-radio>
                                    <el-radio :label="8">CPC</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-if="form.setting_type" label="投放地域：">
                                <el-radio-group v-model.number="form.optimize_area_status">
                                    <el-radio :label="0" @click.native="showAreaDialog">自定义</el-radio>
                                    <el-radio :label="1">开启自动优化</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-else label="投放地域：">
                                <el-radio :label="true"  v-model="form.launchArea" @click.native="showAreaDialog">自定义</el-radio>
                            </el-form-item>
                        </div>
                        <div class="form-inline">
                            <el-form-item  label="投放方式：">
                                <el-radio-group v-model.number="form.speed_type">
                                    <el-radio :label="1">尽快投放</el-radio>
                                    <el-radio :label="2">均匀投放</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-if="form.setting_type" label="投放时段：">
                                <el-radio-group v-model.number="form.optimize_banner_time_status">
                                    <el-radio :label="0" @click.native="showTimeDialog">自定义</el-radio>
                                    <el-radio :label="1">开启自动优化</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-else label="投放时段：">
                                <el-radio :label="true" v-model="form.launchTime" @click.native="showTimeDialog">自定义</el-radio>
                            </el-form-item>
                        </div>
                    </div>
                    <el-form-item prop="agree">
                        <el-checkbox :label="true" name="agree" v-model.number="form.agree">我已阅读并完全同意优钻宝条款，并遵守《钻石展位广告服务使用规范》</el-checkbox>
                        <treatyText></treatyText>
                    </el-form-item>
                </el-form>
            </div>
        </transition-group>
        <div slot="footer" class="dialog-footer">
            <div v-show="step === 1">
                <el-button @click="cancel">取&nbsp;消</el-button>
                <el-button type="primary" @click="handleNext">继&nbsp;续</el-button>
            </div>
            <div v-show="step === 2">
                <el-button @click="back">返&nbsp;回</el-button>
                <el-button type="primary" :disabled="hasSubmit" @click="handleConfirm('form')">确&nbsp;定</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    import '@/components/operation/newCampaignDialog.less'
    import treatyText from '@/components/operation/treatyText'
    import DateTimePicker from '@/components/DateTimePicker'
    import {TYPES, TYPES_DAY_BUDGETS} from '@/config'
    import bus from '@/assets/js/bus'
    export default {
        props:['show', 'areaList', 'workday', 'weekend'],
        data() {
            const checkName = (rule, val, cb) => {
                const patrn = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/g
                if (!val) { return cb(new Error('计划名不能为空')) }
                if (val.length > 32) { return cb(new Error('最长不能超过32个字符')) }
                if (!patrn.test(val)) { return cb(new Error('只支持汉字、字母、数字、下划线')) } 
                return cb()
            }
            const checkBudget = (rule, val, cb) => {
                if (!val) { return cb(new Error('预算不能为空')) }
                if (!Number.isInteger(val) || val <= 0) { return cb(new Error('预算必须是正整数')) }
                if (val > this.$store.state.plan.account) { return cb(new Error('预算不能大于账户余额')) }
                return cb()
            }
            return {
                showDialog: false,
                setting_type: 1,
                title: '新建推广计划',
                step: 1,
                form: {
                    name:'',
                    day_budget:null,
                    type:8,
                    speed_type:1,
                    area_id_list:[1,19,532,39,68,92,109,52,165,125,145,184,212,120,234,255,279,294,333,351,357,393,406,368,417,438,461,488,508],
                    limit_put_time_status:1,
                    optimize_area_status:1,
                    optimize_banner_time_status:1,
                    agree:null,
                    workday: new Array(24).fill(true),
                    weekend: new Array(24).fill(true),
                    launchArea: false,
                    launchTime: false,
                    setting_type: 1,
                },
                rules:{
                    name:[{ validator: checkName, trigger: 'blur' }],
                    day_budget:[{ validator: checkBudget, trigger: 'blur' }],
                    agree:[{ required: true, message: '请勾选已阅读服务条款'},],
                },
                pickerOption: {
                    disabledDate:function(current){
                        return current.getTime() < Date.now() - 8.64e7
                    }
                },
                hasSubmit: false
            }
        },
        watch: {
            showDialog(val) {
                if (val === false) {
                    this.$emit('close')
                    bus.$emit('date-picker-init-time')
                    this.initData()
                }
            },
            show(val) {
                this.showDialog = val
            },
            setting_type(val) {
                Object.assign(this.form, {setting_type: val})
                this.form.optimize_banner_time_status = val
                this.form.optimize_area_status = val
            },
            areaList(val) {
                if (val) { this.form.area_id_list = val }
            },
            workday(arr) {
                if (arr) { this.form.workday = arr.map(i => i) }
            },
            weekend(arr) {
                if (arr) { this.form.weekend = arr.map(i => i) }
            }
        },
        methods:{
            showAreaDialog() {
                this.$emit('area-show')
            },
            showTimeDialog() {
                this.$emit('time-show')
            },
            setTime(postTime, type) {
                if (type === 'newCampaignSetting') {
                    this.form.start_time = postTime.start_date
                    this.form.end_time = postTime.end_date
                }
            },
            handleConfirm(formName){
                this.form.agree = this.form.agree ? true : null;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                            if(this.form.day_budget < TYPES_DAY_BUDGETS[this.form.type]){
                                this.$alert(TYPES[this.form.type].toUpperCase() + '模式下最低日限额是' + TYPES_DAY_BUDGETS[this.form.type] + '元', '提示信息', {
                                    confirmButtonText: '确定',
                                });
                                return false
                            }
                            if (this.form.limit_put_time_status === 0 && !this.form.end_time && !this.form.start_time) {
                                this.$alert('请选择自定义投放日期')
                                return false
                            }
                            if (!this.setting_type && !this.form.optimize_area_status && !this.form.launchArea) {
                                this.$alert('请选择至少一个投放地域')
                                return false
                            }
                            if (!this.setting_type && !this.form.optimize_banner_time_status && !this.form.launchTime) {
                                this.$alert('请选择至少一个投放时段')
                                return false
                            }
                            let setting_info;

                            setting_info = Object.assign({},this.form)
                            delete setting_info.agree
                            delete setting_info.launchArea
                            delete setting_info.launchTime
                            setting_info.day_budget = Math.round(setting_info.day_budget * 100) //转为分
                            if (setting_info.limit_put_time_status === 1) {
                                delete setting_info.start_time
                                delete setting_info.end_time
                            }
                            if (setting_info.optimize_banner_time_status === 1) {
                                delete setting_info.weekend
                                delete setting_info.workday
                            }
                            this.$emit('submit', setting_info)
                            this.hasSubmit = true;
                    } else {
                            console.log('error submit!!');
                            return false;
                    }
                });
            },
            handleNext() {
                this.step = 2;
                this.title = '新建' + (this.form.setting_type ? '自动' : '手动') + '计划';
            },
            back() {
                this.$emit('back')
                this.initData(this.setting_type)
            },
            cancel() {
                this.$emit('close')
            },
            initData(setting_type) {
                this.step = 1
                this.title = '新建推广计划'
                this.setting_type = setting_type === 0 ? 0 : 1
                this.form.name = ''
                this.form.day_budget = ''
                this.form.type = 8
                this.form.speed_type = 1
                this.form.area_id_list = [1,19,532,39,68,92,109,52,165,125,145,184,212,120,234,255,279,294,333,351,357,393,406,368,417,438,461,488,508]
                this.form.limit_put_time_status = 1
                this.form.optimize_area_status = setting_type === 0 ? 0 : 1
                this.form.optimize_banner_time_status = setting_type === 0 ? 0 : 1
                this.form.agree = null
                this.form.workday =  new Array(24).fill(true)
                this.form.weekend =  new Array(24).fill(true)
                this.form.launchArea = false
                this.form.launchTime = false
                this.hasSubmit = false;
            }
        },
        components: { 
            DateTimePicker, treatyText
        }
    }
</script>

<style lang="less">
    .new-campaign-transition-enter-active, .new-campaign-transition-leave-active {
        transition: all .4s
    }
    .new-campaign-transition-enter, .new-campaign-transition-leave-active {
        opacity: 0;
    }
</style>