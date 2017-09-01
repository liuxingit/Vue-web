<template>
    <el-dialog custom-class="campaign-time-modify" title="投放时间修改" v-model="show" :close-on-click-modal="false">
        <el-radio-group v-model.number="limit_put_time_status">
            <p>
                <el-radio :label="1">不限</el-radio>
            </p>
            <p>
                <el-radio :label="0">自定义日期</el-radio>
            </p>
        </el-radio-group>
        <div class="time-select" v-show="!limit_put_time_status">
            <p>
                <span>起始时间：</span>
                <el-date-picker v-model="start_time" :disabled="start_disabled" size="small" :clearable="false" :editable="false" type="date" placeholder="选择日期" :picker-options="pickerOptions"></el-date-picker>
            </p>
            <p>
                <span>结束时间：</span>
                <el-date-picker v-model="end_time" :disabled="end_disabled" size="small" :clearable="false" :editable="false" type="date" placeholder="选择日期" :picker-options="pickerOptions"></el-date-picker>
            </p>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="show = false">取&nbsp;消</el-button>
            <el-button type="primary" @click="handleSave">保&nbsp;存</el-button>
        </div>
    </el-dialog>
</template>

<script>
import {formatDate} from '@/assets/js/base'

    export default {
        data () {
            return {
                show: false,
                limit_put_time_status: 1,
                campaign_id: '',
                online_status: '',
                start_time: '',
                end_time: '',
                start_time_cache: '',
                end_time_cache: '',
                end_disabled: false,
                pickerOptions: {
                    shortcuts: [{
                        text: '今天',
                        onClick(picker) {
                            picker.$emit('pick', new Date());
                        }
                    }, {
                        text: '15天后',
                        onClick(picker) {
                            let date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 14);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '30天后',
                        onClick(picker) {
                            let date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 29);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '60天后',
                        onClick(picker) {
                            let date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 59);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '90天后',
                        onClick(picker) {
                            let date = new Date();
                            date.setTime(date.getTime() + 3600 * 1000 * 24 * 89);
                            picker.$emit('pick', date);
                        }
                    }],
                    disabledDate:function(current){
                        return current.getTime() < Date.now() - 8.64e7
                    }
                },
            }
        },
        watch: {
            limit_put_time_status(v) {
                if (v === 0) {
                    this.end_time = new Date().getTime() + 5 * 24 * 3600 * 1000
                }
            }
        },
        computed: {
            start_disabled() {
                if (this.online_status === 0 || this.online_status === 1) {
                   return true
                }
            },
        },
        methods: {
            handleSave() {
                if (new Date(formatDate(this.start_time)).getTime() > new Date(formatDate(this.end_time)).getTime()) {
                    this.$message.error('结束时间不能小于开始时间')
                    return
                }
                if (this.limit_put_time_status === 1) {
                    this.start_time = this.start_time_cache
                    this.end_time = 7226582400000
                }
                this.$emit('save-time', this.campaign_id, 
                    this.start_time, this.end_time,
                    this.limit_put_time_status
                )
            },
        }
    }
</script>

<style lang="less">
    .campaign-time-modify {
        width: 300px;
        p {
            margin: 0 0 10px;
        }
        .el-date-editor.el-input .el-input__inner {
            border: 1px solid #D9E7FD;
        }
    }
</style>