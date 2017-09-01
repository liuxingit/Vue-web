<template>
    <el-dialog title="修改状态" v-model="dialogChangeOnlineStatusVisible" class="smallDialog" :close-on-click-modal="false">
        <div style="text-align:center">
            <el-radio-group v-model="online_status">
                <el-radio v-for="item in CAMPAIGN_STATUS" :label="item.value" :key="item.value" v-if="item.value !== -99 && item.value !== 3 && item.value !== 5">{{item.label}}</el-radio>
            </el-radio-group>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogChangeOnlineStatusVisible = false">取 消</el-button>
            <el-button type="primary" @click="changeOnlineStatusFinished">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import {CAMPAIGN_STATUS} from '@/config'
    import bus from '@/assets/js/bus.js'
    export default {
        data() {
            return {
                CAMPAIGN_STATUS:CAMPAIGN_STATUS,
                online_status:1,
                dialogChangeOnlineStatusVisible:false
            }
        },
        mounted(){
            bus.$on('showChangeOnlineStatus', (online_status) => {
                this.$set(this,'dialogChangeOnlineStatusVisible', true)
                this.$set(this,'online_status', online_status)
            })
            bus.$on('closeChangeOnlineStatus', (online_status) => {
                this.$set(this,'dialogChangeOnlineStatusVisible', false)
            })
        },
        methods:{
            changeOnlineStatusFinished(){
                bus.$emit('changeOnlineStatus',this.online_status, this.$route.params.campaign_id ? 'adgroup' : 'campaign')
            }
        }
    }
</script>
