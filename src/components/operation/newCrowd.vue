<template>
    <el-dialog title="选择定向类型" v-model="crowdVisible" :show-close="false" :close-on-click-modal="false">
        <div class="block" v-loading="loading" element-loading-text="定向类型获取中">
            <span class="wrapper selectCrowdType">
                <el-button :class="selected_cate_id === item.cate_id ? 'primary' : ''" v-for="item in data" :key="item.cate_id"  @click="handleClick(item)">{{item.cate_name}}</el-button>
            </span>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeAll">取 消</el-button>
            <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import bus from '@/assets/js/bus.js'
    export default {
        props:['crowdVisible'],
        data() {
            return {
                loading:true,
                data:[],
                selected_data:null,
                selected_cate_id:null,
            }
        },
        watch: {
            $route(curVal,oldVal) {},
            crowdVisible(curVal,oldVal){
                if(this.crowdVisible){
                    this.getCrowdList()
                }
            }
        },
        methods:{
            getCrowdList(){
                if(this.data.length){
                    this.$set(this,'loading', false)
                    return false
                }
                this.$http.post('crowd/ajax_get_crowd_list',{
                    settle_type:this.$route.query.type - 0
                }).then((res) => {
                    this.$set(this,'loading', false)
                    if (!res.success) { return } 
                    let data = res.data
                    this.$set(this, 'data', data);
                })
            },
            handleClick(data){
                this.$set(this,'selected_cate_id', data.cate_id)
                this.$set(this,'selected_data', data)
            },
            closeAll(){
                bus.$emit('closeAll')             
            },
            nextStep(){
                if(this.selected_data){
                    bus.$emit('nextStep', this.selected_data,'second')
                } else {
                    this.$alert('请选择一个定向类型', '提示信息', {
                        confirmButtonText: '确定',
                        callback: action => {}
                    });
                }
            },
        },
        components: {}
    }
</script>
<style scoped>
    .selectCrowdType .primary{
        color: #ffffff;
        background-color: #20a0ff;
    }
</style>