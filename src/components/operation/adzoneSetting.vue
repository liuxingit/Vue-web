<template>
    <div v-if="show_adzone">
        <div class="setTitle">
            <i class="el-icon-document"></i>
            设置投放资源位
            <el-button type="primary" @click="adzoneVisible= true">选择资源位</el-button>
        </div>
        <div :class="show_adzone ? 'setContent' : 'hide setContent'">
            <!-- <div class="adzoneItem" v-for="item of data">
                {{item.adzone_name}}
                {{setSubName(item)}}
            </div> -->
             <el-table :data="data" border style="width: 100%" >
                <!-- <el-table-column type="selection" width="55"></el-table-column> -->
                <el-table-column prop="adzone_name" label="资源位" width="">
                    <template scope="scope">{{scope.row.adzone_name}}</template>
                </el-table-column>
                <!-- <el-table-column prop="adzone_name" label="网站行业" width="">
                    <template scope="scope">网上购物111</template>
                </el-table-column> -->
                <el-table-column prop="adzone_name" label="创意最低等级" width="">
                    <template scope="scope">{{scope.row.adzone_level}}</template>
                </el-table-column>
                <!-- <el-table-column prop="adzone_name" label="可裂变尺寸" width="">
                    <template scope="scope">11111111</template>
                </el-table-column> -->
                <el-table-column prop="adzone_name" label="资源位尺寸" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </el-table-column>
                <!-- <el-table-column prop="adzone_name" label="日均竞流量" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </el-table-column>
                <el-table-column prop="adzone_name" label="点击率" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </el-table-column> -->
            </el-table>
        </div>
        <new-adzone :adzoneVisible="adzoneVisible" :data="data"></new-adzone>
    </div>
</template>
<script>
import newAdzone from '@/components/operation/newAdzone'
import bus from '@/assets/js/bus.js'
export default {
    data () {
        return {
            data:[],
            adzoneVisible:false,
            show_adzone:!(this.$route.query.setting_type - 0),
        }
    },
    mounted(){
        bus.$on('show_crowd_adzone', (flag) => {
            this.$set(this,'show_adzone',flag)
        })
        bus.$on('closeAll', (type) => {
            if(type === 'newAdzone'){
                this.$set(this,'adzoneVisible', false)
            }
        })
        bus.$on('nextStep', (setting_data,type) => {
            if(type === 'newAdzone'){
                this.$set(this,'adzoneVisible', false)
                this.$set(this, 'data', setting_data)
                bus.$emit('updateAdgroupData', {adzone_bid_list:this.data}, 'adzone')
                bus.$emit('updateAdzoneData', this.data)
            }
        })
    },
    methods:{
    },
    components:{newAdzone}
}
</script>
<style scoped>
    .adzoneItem {
        margin:0 15px 15px;
    }
</style>