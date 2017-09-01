<template>
    <div id="addAdgroup">
        <div v-title>新建推广单元</div>
        <el-row :gutter="20">
            <el-col :span="12">
                <div class="grid-content bg-purple addAdgroupWrap">
                    <adgroup-setting></adgroup-setting>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="grid-content bg-purple addAdgroupWrap">
                    <adzone-setting></adzone-setting>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="grid-content bg-purple addAdgroupWrap">
                    <crowd-setting></crowd-setting>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="grid-content bg-purple addAdgroupWrap">
                    <creative-setting></creative-setting>
                </div>
            </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer addAdgroupBtns">
            <el-button v-loading.fullscreen.lock="fullscreenLoading" type="primary" @click="addAdgroup" :disabled="buttonDisabled">完成创建</el-button>
        </div>
    </div>
</template>

<script>
import './AddAdgroupPage.less'
import bus from '@/assets/js/bus.js'
import adgroupSetting from '@/components/operation/adgroupSetting'
import creativeSetting from '@/components/operation/creativeSetting'
const crowdSetting = r => require.ensure([], () => r(require('@/components/operation/crowdSetting')), 'crowdSetting')
const adzoneSetting = r => require.ensure([], () => r(require('@/components/operation/adzoneSetting')), 'adzoneSetting')
// const creativeSetting = r => require.ensure([], () => r(require('@/components/operation/creativeSetting')), 'creativeSetting')
export default {
    name: 'add_adgroup',
    data () {
        return {
            fullscreenLoading:false,
            data:{},
            buttonDisabled:false
        }
    },
    created() {
        window._hmt.push(['_trackEvent', 'pages_add_adgroup', 'click']);
    },
    mounted() {
        bus.$on('updateAdgroupData', (data, type) => {
            if(type === 'adgroup_setting'){
                if(data.auto_managed){
                    delete this.data.auto_managed
                    delete this.data.crowd_setting
                }
                this.$set(this, 'data', Object.assign(this.data,data))
                let KEY_OBJ = {
                    creative_id_list:{
                        key:'creative_id_list',
                        title:'创意',
                    }
                }
                let is_all_auto = data.auto_managed && data.crowd_setting.crowd_optimize_type === 1
                if(!is_all_auto){
                    Object.assign(KEY_OBJ, {
                        adzone_bid_list:{
                            key:'adzone_bid_list',
                            title:'资源位',
                        },
                    })
                }
                let error;
                for(let key in KEY_OBJ){
                    if(!this.data[key] || !this.data[key].length){
                        this.$alert('至少设置一个' + KEY_OBJ[key].title, '提示', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                        error = true;
                        break;
                    }
                }
                if(!error){
                    if(!is_all_auto){
                        bus.$emit('getCrowdsSetting')
                    } else {
                        this.createNewAdgroup()
                    }
                }
            } else {
                this.$set(this, 'data', Object.assign(this.data,data))
                if(type === 'crowds'){
                    this.createNewAdgroup()
                }
            }
            console.log(data)
        })
    },
    methods:{
        addAdgroup() {
            bus.$emit('getAdgroupSetting')
        },
        getCurrentDate(){
            if(this.$store.state.plan.shopInfo && this.$store.state.plan.shopInfo.current_time && this.$store.state.plan.shopInfo.current_time.$date){
                return new Date(this.$store.state.plan.shopInfo.current_time.$date - 8*3600000);
            }
            return new Date();
        },
        createNewAdgroup(){
            let post_data = Object.assign({campaign_id:this.$route.params.campaign_id - 0 },this.data)
            delete post_data.creatives
            console.log('post_data >>>>>>>',post_data, this.data)
            if(post_data.adzone_bid_list && post_data.adzone_bid_list.length){
                let adzone_bid_list = []
                for(let item of post_data.adzone_bid_list){
                    adzone_bid_list.push({
                        adzone_id:item.adzone_id
                    })
                }
                post_data.adzone_bid_list = adzone_bid_list
            }
            if(post_data.crowds && post_data.crowds.length){
                let adzone_bid_list = []
                for(let [index,item] of post_data.crowds.entries()){
                    let temp_matrix_prices = []
                    delete item.price
                    for(let matrix_price of item.matrix_prices){
                        temp_matrix_prices.push({
                            adzone_id:matrix_price.adzone_id,
                            //adzone_name:matrix_price.adzone_name,
                            price:matrix_price.price
                        })
                    }
                    post_data.crowds.splice(index, 1, Object.assign(item, {matrix_prices:temp_matrix_prices}))
                }
            }
            console.log('post_data >>>改变后>>>>',post_data, this.data)
            this.$set(this,'buttonDisabled',true)
            this.$set(this,'fullscreenLoading', true)
            this.$http.post('adgroup/ajax_create_adgroup', post_data).then((res) => {
                this.$set(this,'fullscreenLoading', false)
                if(!res.success){
                    return false
                }

                //83cfcbcc-619d-4ec2-be94-e323b4bebce8
                let is_auto = post_data.auto_managed && post_data.crowd_setting.crowd_optimize_type === 1
                console.log(is_auto,777777777777)
                if(is_auto){
                    let task_id = localStorage.getItem('addAdgroup' + this.$route.params.campaign_id)
                    localStorage.setItem('addAdgroup' + this.$route.params.campaign_id, (task_id ? task_id + '&' : '') + res.data +'#' +(this.getCurrentDate()).getTime()) 
                    console.log(localStorage.getItem('addAdgroup' + this.$route.params.campaign_id),88888)
                }
                let msg = is_auto ? '您选择的优化方式为：系统自动选择定向 + 改价 + 资源位优化，过程可能需要10分钟左右，请耐心等待。' : '您已成功创建推广组，请返回计划管理查看'
                this.$alert(msg, '提示信息', {
                    confirmButtonText: '确定',
                    callback: action => {
                        window.location.href = '/adgroups/' + this.$route.params.campaign_id
                    }
                });
            })
        }

    },
    components:{
        adgroupSetting,
        crowdSetting: crowdSetting,
        adzoneSetting: adzoneSetting,
        creativeSetting,
    }
}
</script>