<template>
    <div v-if="show_crowd">
        <div class="setTitle"><i class=""></i>设置定向<span class="textDanger" v-if="error_flag_price">{{error_price_msg}}</span></div>
        <div :class="show_crowd ? 'setContent' : 'hide setContent'">
            <!-- <span class="textDanger" v-if="error_flag_price">{{error_price_msg}}</span> -->
            <div class="crowdItem" v-for="item of crowdsList">
                <span class="crowdName">{{item.cate_name}}</span><span class="info">--{{CROWDS_INFO[item.cate_name]}}</span>
                <el-switch v-if="item.cate_id === 3 || item.cate_id === 8" v-model="switch_data[item.cate_id]" on-text="" off-text="" @change="setCrowd(item, 'switch')"></el-switch>
                <el-button v-else type="text" @click="setCrowd(item)">设置定向</el-button>
                <div v-if="crowds_setting_data[item.cate_id]">
                    <el-table class="addTable" :data="crowds_setting_data[item.cate_id]" style="width: 100%" :show-header="false" fit>
                        <el-table-column type="expand" width="30">
                            <template scope="scope">
                                <el-table :show-header="false" :data="scope.row.matrix_prices" style="width: 100%">
                                    <el-table-column  width="30"></el-table-column>
                                    <el-table-column>
                                        <template scope="props">
                                            --{{props.row.adzone_name}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column>
                                        <template scope="props">
                                            <el-row>
                                                <el-col :span="12">
                                                    <el-input placeholder="请填写出价" v-model="props.row.price" @focus="focusAdzoneInput(scope.row, item.cate_id)" ></el-input>
                                                </el-col>
                                                <el-col :span="12">元</el-col>
                                            </el-row>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template scope="scope">
                            {{scope.row['crowd_name']}}
                            {{setSubName(scope.row)}}
                            <!-- {{scope.row.sub_crowds ? scope.row.sub_crowds.length ? scope.row.sub_crowds.len '：' + scope.row.sub_crowds[0].sub_crowd_name}} -->
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template scope="scope">
                                <el-row>
                                    <el-col :span="12">
                                        <el-input placeholder="批量出价" @blur="changeBatchPrice(scope.row)" @focus="focusAdzoneInput(scope.row, item.cate_id)" v-model="scope.row.price"></el-input>
                                    </el-col>
                                    <el-col :span="12">元</el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <new-crowd-second :crowdSecondVisible="crowdSecondVisible" :selected_data="selected_data"></new-crowd-second>
    </div>
</template>
<script>
import {CROWDS_INFO, TYPES_CROWD_PRICE} from '@/config'
import newCrowdSecond from '@/components/operation/newCrowdSecond'
import bus from '@/assets/js/bus.js'
export default {
    data () {
        return {
            show_crowd:!(this.$route.query.setting_type - 0),
            CROWDS_INFO:CROWDS_INFO,
            crowdsList:[],
            switch_data:{
                3:false,
                8:false,
            },
            adzones:[],
            crowdSecondVisible:false,
            selected_data:null,
            crowds_setting_data:{},
            cur_name:null,
            cur_cate_id:null,
            error_flag_price:false,
            error_price_msg:'请检查您的出价数据'
            //MAX_PRICE:MAX_PRICE,
            //error_price_msg:error_price_msg,
        }
    },
    created(){
        this.getCrowdList()
    },
    computed:{
        MAX_PRICE(){
            let campaigns = this.$store.state.plan.campaignList
            for(let {campaign_id, day_budget} of campaigns){
                if(campaign_id === this.$route.params.campaign_id - 0){
                    return Math.round(day_budget) / 100
                }
            }
            return TYPES_CROWD_PRICE[this.$route.query.type] 
        },
    },
    mounted() {
        bus.$on('show_crowd_adzone', (flag) => {
            this.$set(this,'show_crowd',flag)
        })
        bus.$on('closeAll', (type) => {
            if(type === 'newcrowd'){
                this.$set(this,'crowdSecondVisible', false)
            }
        }),
        bus.$on('nextStep', (setting_data,type) => {
            if(type === 'newcrowd'){
                this.$set(this,'crowdSecondVisible', false)
                for(let item of setting_data){
                    Object.assign(item, {matrix_prices:JSON.parse(JSON.stringify(this.adzones))})
                }
                this.$set(this,'crowds_setting_data',Object.assign(this.crowds_setting_data,{
                    [this.selected_data.cate_id ? this.selected_data.cate_id : this.cur_cate_id]:setting_data
                }))
            }
        })
        bus.$on('getCrowdsSetting', () => {
            let error
            if(!Object.keys(this.crowds_setting_data).length){
                this.$alert('至少设置一个定向', '提示信息', {
                    confirmButtonText: '确定',
                    callback: action => {}
                });
                return false
            } else {
                let crowds = [], crowds_setting_data = JSON.parse(JSON.stringify(this.crowds_setting_data))
                for(let cate_id in crowds_setting_data){
                    let crowd_item = crowds_setting_data[cate_id]
                    for(let item of crowd_item){
                        if(item.matrix_prices){
                            for(let [index, matrix_price] of item.matrix_prices.entries()){
                                if(!matrix_price.price){
                                    this.$set(this,'error_price_msg', '请填写定向资源位交叉出价')
                                    this.$set(this,'error_flag_price', true)
                                    break;
                                } else {
                                    item.matrix_prices.splice(index, 1, Object.assign(matrix_price, {price:matrix_price.price * 100}))
                                }
                            }
                        } else {
                            this.$set(this,'error_price_msg', '请填写定向资源位交叉出价')
                            this.$set(this,'error_flag_price', true)
                        }
                        crowds.push(item)
                    }
                }
                if(!this.error_flag_price){
                    if(this.cur_cate_id === 4 || this.cur_cate_id === 5) {//达摩盘定向  + 行业店铺
                        for(let crowd of crowds){
                            crowd.crowd_name = crowd.sub_crowds[0].sub_crowd_name
                            crowd.crowd_value = crowd.crowd_value ? crowd.crowd_value : crowd.sub_crowds[0].sub_crowd_value
                        }
                    }
                    bus.$emit('updateAdgroupData', {crowds:crowds}, 'crowds')
                }
            }
        }),
        bus.$on('updateAdzoneData', (data) => {
            for(let item of data){
                item.price = null
            }
            this.$set(this, 'adzones', data)
            let crowds_setting_data = JSON.parse(JSON.stringify(this.crowds_setting_data))
            for(let cate_id in crowds_setting_data){
                let crowd_item = crowds_setting_data[cate_id]
                for(let item of crowd_item){
                    Object.assign(item, {price:null,matrix_prices:JSON.parse(JSON.stringify(this.adzones))})
                }
            }
            this.$set(this, 'crowds_setting_data', crowds_setting_data)
        })
    },
    methods:{
        setSubName(data){
            let sub_crowds = data.sub_crowds
            if(!sub_crowds || !sub_crowds.length){
                return ''
            } else {
                let sub_name = []
                if(sub_crowds.length){
                    for({sub_crowd_name} of sub_crowds){
                        sub_name.push(sub_crowd_name)
                    }
                }
                return '：' + sub_name.join(',')
            }
        },
        changeBatchPrice(data){
            let value = data.price
            if(isNaN(value) || value - 0 <= 0 || value - 0 > this.MAX_PRICE || Math.round((value - 0) * 100) !== (value - 0) * 100){
                this.$set(this,'error_price_msg', '出价应为0~' + this.MAX_PRICE + '的合法数值，最多两位小数')
                this.$set(this,'error_flag_price', true)
                return false
            } else {
                if(this.crowds_setting_data[this.cur_cate_id]){
                    let temp_data = this.crowds_setting_data[this.cur_cate_id];
                    for(let item of temp_data){
                        let name = item['crowd_name']
                        if(item.sub_crowds && item.sub_crowds.length){
                            name += item.sub_crowds[0].sub_crowd_name
                        }
                        if(name === this.cur_name && item.matrix_prices){
                            for(let [index,matrix_price] of item.matrix_prices.entries()){
                                item.matrix_prices.splice(index,1, Object.assign(matrix_price, {price:value}))
                            }
                            break;
                        }
                    }

                    this.$set(this, 'crowds_setting_data', Object.assign(this.crowds_setting_data, {
                        [this.cur_cate_id]:temp_data
                    }))
                }
            }
        },
        focusAdzoneInput(data, cate_id){
            this.$set(this, 'error_flag_price', false)
            let name = data['crowd_name']
            if(data.sub_crowds && data.sub_crowds.length){
                name += data.sub_crowds[0].sub_crowd_name
            }
            this.$set(this,'cur_name', name)
            this.$set(this,'cur_cate_id', cate_id)
        },
        getCrowdList(){
            this.$http.post('crowd/ajax_get_crowd_list',{
                settle_type:this.$route.query.type - 0
            }).then((res) => {
                if (!res.success) { return } 
                let data = res.data
                this.$set(this, 'crowdsList', data);
            })
        },
        setCrowd(data, type){
            this.$set(this,'selected_data', data)
            if(type === 'switch'){
                if(this.switch_data[data.cate_id]){
                    let setting_data = this.selected_data.crowds.slice(0)
                    for(let item of setting_data){
                        item.sub_crowds = []
                    }
                    bus.$emit('nextStep', setting_data, 'newcrowd')
                } else {
                    delete this.crowds_setting_data[data.cate_id]
                }
            } else {
                this.$set(this,'crowdSecondVisible', true)
            }
        },     
    },
    components:{newCrowdSecond}
}
</script>
<style scoped>
    @import './crowdSetting.less'
</style>