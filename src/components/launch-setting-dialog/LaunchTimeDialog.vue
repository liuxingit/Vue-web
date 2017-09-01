<template lang="html">
    <el-dialog custom-class="launch-time-dialog" title="投放时段选择" v-model="showDialog" @open="initDialog" @close="resetData" :close-on-click-modal="false">
        <auto-managed ref="autoManaged" v-if="this.$store.state.plan.curCampaign.setting_type && edit" type="time" @change="getAutoManaged"></auto-managed>
        <hours-selection :edit="edit" :title="workTitle" :hours="workdayCache" type="workday" 
        @revert="revert('workday')" @select-all="selectAll" @select-time="selectTime"></hours-selection>

        <hours-selection :edit="edit" :title="weekTitle" :hours="weekendCache" type="weekend"
         @revert="revert('weekend')" @select-all="selectAll" @select-time="selectTime"></hours-selection>
        <div slot="footer" class="dialog-footer textCenter">
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
    </el-dialog>
</template>

<script>
import hoursSelection from './hoursSelection'
import bus from '@/assets/js/bus'
import autoManaged from './autoManaged'

export default {
    components: {
        hoursSelection, autoManaged
    },
    props: {
        show: Boolean,
        edit: {
            type: Boolean,
            default: false,
        },
        workday: Array,
        weekend: Array,
    },
    watch: {
        showDialog(val) {
            if (val === false) {
                this.$emit('close')      
            } 
        },
        show(val) {
            this.showDialog = val
        },
        workday(data) {
            if (data) {
                this.workdayCache = data.map(i => i)
            }
        },
        weekend(data) {
            if (data) {
                this.weekendCache = data.map(i => i)
            }
        },
    },
    methods: {
        initDialog() {
            if (this.edit) {
                this.workdayCache = this.workday.map(i => i)
                this.weekendCache = this.weekend.map(i => i)
                if (this.$store.state.plan.curCampaign.setting_type) {
                    this.autoManageData = {
                        campaign_id: this.$store.state.plan.campaignId,
                        auto_managed: this.$store.state.plan.curCampaign.auto_managed,
                        optimize_banner_time_status: this.$store.state.plan.curCampaign.optimize_banner_time_status,
                    }
                }
            } else if (this.weekendSaved && this.workdaySaved) {
                this.workdayCache = this.workdaySaved.map(i => i)
                this.weekendCache = this.weekendSaved.map(i => i)
            } else {
                this.workdayCache = new Array(24).fill(true)
                this.weekendCache = new Array(24).fill(true)
            }
        },
        revert(type) {
            if (type === 'workday') { this.workdayCache = this.workday.map(i => i) }
            if (type === 'weekend') { this.weekendCache = this.weekend.map(i => i) }
        },
        selectAll(type, state) {
            if (type === 'workday') { this.workdayCache = new Array(24).fill(!state) }
            if (type === 'weekend') { this.weekendCache = new Array(24).fill(!state) } 
        },
        selectTime(type, index) {
            if (type === 'workday') {
                this.workdayCache.splice(index, 1, !this.workdayCache[index])
            } else if (type === 'weekend') {
                this.weekendCache.splice(index, 1, !this.weekendCache[index])
            }
        },
        clearTime(type) {
            if (type === 'workday') { this.workdayCache = new Array(24).fill(false) }
            if (type === 'weekend') { this.weekendCache = new Array(24).fill(false) } 
        },
        getAutoManaged(data) {
            this.autoManageData = Object.assign(this.autoManageData, { optimize_banner_time_status: data })
        },
        handleSave() {
            let work = this.workdayCache,
             week = this.weekendCache, 
             auto = this.autoManageData;
            if (this.workdayCache.every(i => !i) && this.weekendCache.every(i => !i)) {
                this.$alert('请至少选择一个投放时段')
                return false
            }
            if (!this.edit) {
                this.weekendSaved = this.weekendCache.map(i => i)
                this.workdaySaved = this.workdayCache.map(i => i)
            } else {
                // 接口不重复调用
                if (this.workdayCache.toString() === this.workday.toString() 
                && this.weekendCache.toString() === this.weekend.toString()) {
                    work = null
                    week = null
                } else {
                    work = this.workdayCache
                    week = this.weekendCache
                }
                if (this.$store.state.plan.curCampaign.setting_type) {
                    if (auto.optimize_banner_time_status === this.$store.state.plan.curCampaign.optimize_banner_time_status) {
                        auto = null
                    }
                }
            }
            this.$emit('submit', work, week, auto)
        },
        cancel() {
            this.$emit('close')
        },
        resetData() {
            if (this.edit && this.$store.state.plan.curCampaign.setting_type) {
                this.$refs.autoManaged.managed = this.$store.state.plan.curCampaign.optimize_banner_time_status ? true : false
            }
        },
    },
    data () {
        return {
            showDialog: false,
            workTitle: '周一到周五',
            weekTitle: '周六到周日',
            workdayCache: new Array(24).fill(true),
            weekendCache: new Array(24).fill(true),
            weekendSaved: null,
            workdaySaved: null,
            autoManageData: null,
        }
    },
}
</script>
