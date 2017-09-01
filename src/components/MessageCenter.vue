<template>
    <el-dialog title="消息中心" v-model="visible" class="messageCenterDialog">
        <el-collapse accordion @change="handleChange" v-model="activeNames">
            <el-collapse-item v-for="(item, index) of currentData" :key="item.id" :name="index">
                <template slot="title">
                    <i :class="item.status === 'read' ? 'read iconfont' : 'unread iconfont'">&#xe67d;</i>
                    【{{MESSAGE_TYPE[item.category]}}】{{item.title}}
            
                    <span class="fr msgTime">{{renderDate(item.message_time.$date)}} </span>
                </template>
                <div class="msgCenterContent" v-html="item.content"></div>
            </el-collapse-item>
        </el-collapse>
        <div class="block">
            <div class="fl msgInfo">共 {{data.length}} 条消息，其中 <span class="textDanger">{{count}}</span> 条未读</div>
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5" layout="prev, pager, next, jumper" :total="data.length"></el-pagination>
        </div>
    </el-dialog>
</template>
<script>
    import {MESSAGE_TYPE} from '@/config'
    import {formatDate} from '../assets/js/base.js'
    import bus from '@/assets/js/bus.js'
    export default {
        data () {
            return {
                activeNames:[],
                currentPage:1,
                data:[],
                count:0,
                visible:false,
                MESSAGE_TYPE:MESSAGE_TYPE,
            }
        },
        computed:{
            currentData(){
                return this.data.slice((this.currentPage -1) * 5, this.currentPage * 5)
            },
        },
        watch:{
            count(curVal, oldVal){
                bus.$emit('messageCount', curVal)
            }
        },
        created(){
            this.$http.post('ajax_get_all_messages',{}).then((res) => {
                if (!res.success) {return false}
                this.$set(this,'data',res.data)
                let temp_count = 0, temp_index
                for(let [index, item] of this.data.entries()){
                    if(item.status === 'new'){
                        temp_count ++
                        if(!temp_index && temp_index !== 0){
                            temp_index = index
                        }
                    }
                }
                this.$set(this,'count',temp_count)
                if(this.count){
                    this.$set(this,'activeNames',[temp_index])
                    this.$set(this,'visible',true)
                    this.handleChange(temp_index)
                }
            })
        },
        mounted(){
            bus.$off('showMessageCenter').$on('showMessageCenter', () => {
                this.$set(this,'visible',true)
            })
        },
        methods:{
            handleChange(activeNames){
                if(activeNames || activeNames === 0){
                    let item = this.data[activeNames]
                    if(item.status === 'new'){
                        this.$http.post('ajax_set_messages_read',{ids:[item.id]}).then((res) => {
                            if (!res.success) {return false}
                            this.data.splice(activeNames, 1, Object.assign(item, {status:'read'}))
                            this.$set(this,'count',this.count - 1)
                        })
                    }
                }
            },
            renderDate(data){
                return formatDate(data)
            },
            handleCurrentChange(val){
                this.$set(this, 'currentPage', val)
                
            }
        }
    }
</script>
<style lang="less">
    @import './MessageCenter.less';
</style>