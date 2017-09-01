<template>
    <div>
        <div class="setTitle">
            <i class="el-icon-document"></i>
            设置创意
            <el-button type="primary" @click="creativeVisible = true">选择创意</el-button>
        </div>
        <div class="setContent">
            <div :class="index % 4 === 3 ? 'creativeItemWrap lastCreativeItemWrap' : 'creativeItemWrap'" v-for="(item,index) of data">
                <div class="creativeImgItem" ><img :src="item.image_path" /></div>
                <p>
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <div class="grid-content bg-purple">
                                尺寸：{{item.creative_size.width}}*{{item.creative_size.height}}
                            </div>
                        </el-col>
                        <!-- <el-col :span="6"><div class="grid-content bg-purple">
                          ctr%
                        </div></el-col> -->
                        <el-col :span="6"><div class="grid-content bg-purple">
                        {{CREATIVE_LEVEL[item.creative_level].title}}
                        </div></el-col>
                    </el-row>
                    {{item.creative_name && item.creative_name.length > 10 ? item.creative_name.substring(0, 12) + '……' : item.creative_name}}
                    <i class="iconfont deleteCreativeImg" @click="deleteItem(item,'delete')" title="删除创意">&#xe623;</i>
                </p>
            </div>
        </div>
        <new-creative :creativeVisible="creativeVisible" :data="data"></new-creative>
    </div>
</template>
<script>
import newCreative from '@/components/operation/newCreative'
import {CREATIVE_LEVEL} from '@/config'
import bus from '@/assets/js/bus.js'
export default {
    data () {
        return {
            CREATIVE_LEVEL:CREATIVE_LEVEL,
            data:[],
            creativeVisible:false,
        }
    },
    mounted(){
        bus.$on('closeAll', (type) => {
            if(type === 'newCreatives'){
                this.$set(this, 'creativeVisible', false)
            }
        })
        bus.$on('submitCrowdAdzoneCreative', (setting_data, type) => {
            if(type === 'newCreatives'){
                this.$set(this, 'creativeVisible', false)
                if(setting_data){
                    this.$set(this, 'data', setting_data.creatives)
                    bus.$emit('updateAdgroupData', setting_data, 'creative')
                }
            }
        })
    },
    methods:{
        deleteItem(data){
            this.$confirm('确定删除该创意吗？', '提示信息', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type:'warning'
            }).then(({}) => {
                for(let [index, item] of this.data.entries()){
                    if(data.creative_id === item.creative_id){
                        this.data.splice(index, 1)
                    }
                }
                bus.$emit('deleteCreative')
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '您已取消操作'
                });
            });
        }
    },
    components:{newCreative}
}
</script>
<style>
    .creativeItemWrap {
        float: left;
        width: 24%;
        margin-right: 1%;
        margin-bottom: 20px;
    }
    .lastCreativeItemWrap {
        margin-right: 0;
    }
    .creativeImgItem {
        width:100%;
        height: 175px;
        display: flex;
        align-items: center;
        overflow: hidden;
        background-color:#f1f1f1;
    }
    .creativeImgItem img{
        width:100%;
        height: auto;
        background-size:contain;
    }
    .deleteCreativeImg {
        float: right;
        cursor: pointer;
    }
</style>