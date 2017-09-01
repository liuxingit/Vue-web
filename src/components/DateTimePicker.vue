<template>
    <el-date-picker v-model="rpt_time" type="daterange" placeholder="时间选择" :size = "size":picker-options="option || pickerOptions2" :clearable="false" :editable="false" @change="selectDateTime"></el-date-picker>
</template>

<script>
    import bus from '@/assets/js/bus.js'
    import { getDefineDay, getZeroDay, formatDate } from '@/assets/js/base'
    export default {
        props: {
            type: String,
            rptTime: {
                type: Boolean,
                default: false
            },
            noInitTime: {
                type: Boolean,
                default: false
            },
            size: String,
            option: Object,
            customTime: Array
        },
        computed: {
            yesterday() {
                return this.$store.state.plan.init_rpt_time
            }
        },
        data () {
            return {
                rpt_time: null,
                pickerOptions2: {
                    shortcuts: [{
                        text: '今日实时',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '昨天',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
                            picker.$emit('pick', [start, start]);
                        }
                    }, {
                        text: '最近7天',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
                            start.setTime(end.getTime() - 3600 * 1000 * 24 * 6);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近30天',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
                            start.setTime(end.getTime() - 3600 * 1000 * 24 * 29);
                            picker.$emit('pick', [start, end]);
                        }
                    }],
                    disabledDate:function(current){
                        return current > new Date() || current < new Date(getDefineDay(-90))
                    }
                },
            }
        },
        created(){
            if (this.noInitTime) { return }
            if (this.customTime && this.customTime.length) { 
                this.$set(this, 'rpt_time', [this.customTime[0], this.customTime[1]]) 
                return
            }
            this.setDate()
        },
        mounted() {
            bus.$off('date-picker-init-time').$on('date-picker-init-time', () => {
                this.rpt_time = null
            })
        },
        methods: {
            postTime(value){
                let post_time
                this.isArray(value) ? post_time = value : post_time = value.split(' - ')
                post_time = {
                    start_date:post_time[0],
                    end_date:post_time[1],
                }
                bus.$emit('getDateTime', post_time, this.type)  
                this.$emit('get-date-time', post_time, this.type)           
            },
            setDate() {
                this.$set(this,'rpt_time',localStorage.getItem('rpt_time') && this.rptTime ? localStorage.getItem('rpt_time').split(',') : [this.yesterday[0], this.yesterday[1]])                         
            },
            selectDateTime(value){
                let date = value.split(' - ')
                if (this.rptTime && getZeroDay(date[1]) - getZeroDay(date[0]) > 29 * 24 * 3600 * 1000) {
                    this.$message({
                        showClose: true,
                        message: '最长只能选择30天哦',
                        type: 'error'
                     });
                    this.setDate()
                    return
                }
                if (this.rptTime && date.some(item => { return item === formatDate(getZeroDay(), '', 1) }) && date[0] !== date[1]) {
                    this.$message({
                        showClose: true,
                        message: '今天的数据只能实时查询',
                        type: 'error'
                     });
                    this.setDate()
                    return
                }          
                this.postTime(value)
                if (this.rptTime) { 
                    localStorage.setItem('rpt_time', date) 
                    this.$store.commit('setInitRptTime', date)
                }            
            }
        }
    }
</script>