<template>
    <div>
        <div class="setTitle"><i class=""></i>设置推广单元</div>
        <el-form :model="form" :rules="rules" ref="form" label-width="120px" class="setContent">
            <p v-if="$route.query.setting_type - 0">温馨提示：系统将自动删除您在官方后台添加的类目型定向-高级兴趣点、行业店铺定向，以便进行优化及管理。</p>
            <el-form-item label="推广单元名称：" prop="adgroup_name"  :class="error_flag_name ? 'is-error' : ''">
                 <el-input v-model="form.adgroup_name"  @focus="error_flag_name=false" @blur="checkName"></el-input>
                 <div v-if="error_flag_name"  class="el-form-item__error">{{error_name_msg}}</div>
            </el-form-item>
            <el-form-item v-if="$route.query.setting_type - 0" label="设置自动托管：">
                <el-switch on-text="" off-text="" v-model="form.auto_managed"></el-switch>
                <!-- <span v-if="$route.query.setting_type - 0">开启自动优化后，需要关闭官方“智能调价”功能</span> -->
            </el-form-item>
            <el-form-item v-if="$route.query.setting_type - 0 && form.auto_managed" label="最高出价：" :class="error_flag_price ? 'is-error' : ''">
                <el-col :span="12">
                    <el-input props="crowd_max_price" v-model.number="form.crowd_setting.crowd_max_price" @focus="error_flag_price=false" @blur="checkPrice"></el-input>
                </el-col> 元
                    <span v-if="SUGGEST_PRICE">（类目CPC均价：{{SUGGEST_PRICE}}元）</span>
                <div v-if="error_flag_price"  class="el-form-item__error">{{error_price_msg}}</div>
            </el-form-item>
            <el-form-item v-if="$route.query.setting_type - 0 && form.auto_managed" label="定向优化方式：">
                <el-radio-group v-model="form.crowd_setting.crowd_optimize_type">
                    <el-radio v-if="item.value !== 3" v-for="item in ADGROUP_AUTO_MANAGED" :label="item.value" :key="item.value">{{item.label}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="" style="margin-bottom:0;margin-top:-25px">
                <span v-if="$route.query.setting_type - 0 && form.auto_managed && form.crowd_setting.crowd_optimize_type - 0 === 1" class="textDanger">软件自动优化时会对DMP进行算法优化，可能会进行新增、删除等操作。</span>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import {ADGROUP_AUTO_MANAGED, TYPES_CROWD_PRICE} from '@/config'
import bus from '@/assets/js/bus.js'
export default {
    data () {
        return {
            ADGROUP_AUTO_MANAGED:ADGROUP_AUTO_MANAGED,
            form:{
                adgroup_name:null,
                auto_managed:this.$route.query.setting_type - 0 ? true : false,
                crowd_setting:{
                    crowd_optimize_type:1,
                    crowd_max_price:null,
                }
            },
            rules:{
                adgroup_name:[
                    { required: true, message: '请输入推广单元名称，只支持汉字、字母、数字、下划线,且长度为1~32个字符'},
                ],
            },
            error_flag_price:false,
            error_price_msg:'',
            error_flag_name:false,
            error_name_msg:'请输入推广单元名称，只支持汉字、字母、数字、下划线,且长度为1~32个字符'
        }
    },
    watch:{
        form:{
            deep:true,
            handler(oldVal, curVal){
                bus.$emit('show_crowd_adzone',this.form.auto_managed && this.form.crowd_setting.crowd_optimize_type !== 1 || !this.form.auto_managed)
            }
        }
    },
    computed:{
        MAX_PRICE(){
            let MAX_PRICE = TYPES_CROWD_PRICE[this.$route.query.type]
            let campaigns = this.$store.state.plan.campaignList
            for(let {campaign_id, day_budget} of campaigns){
                if(campaign_id === this.$route.params.campaign_id - 0){
                    MAX_PRICE = Math.round(day_budget) / 100
                    break;
                }
            }
            return MAX_PRICE
        },
        SUGGEST_PRICE(){
            return this.$store.state.plan.adgroup_suggest_price
        }
    },
    mounted() {
        this.$store.dispatch('getAdgroupSuggestPrice')
        bus.$off('getAdgroupSetting').$on('getAdgroupSetting', () => {
            this.checkAdgroupData('form')
        })
    },
    methods:{
        checkName(){
            console.log(!(/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/.test(this.form.adgroup_name)),'>>>>>>>>>match')
            if(!this.form.adgroup_name || this.form.adgroup_name.length > 32 || !(/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/.test(this.form.adgroup_name))){
                    this.$set(this,'error_flag_name', true)
                    return false
            }
        },
        checkPrice(){
            if(this.$route.query.setting_type && this.form.auto_managed){
                let crowd_max_price = this.form.crowd_setting.crowd_max_price
                if(isNaN(crowd_max_price) || crowd_max_price - 0 <= 0 || crowd_max_price - 0 > this.MAX_PRICE || Math.round((crowd_max_price - 0) * 100) !== (crowd_max_price - 0) * 100){
                    this.$set(this,'error_price_msg', '出价应为0~' + this.MAX_PRICE + '的合法数值，最多两位小数')
                    this.$set(this,'error_flag_price', true)
                    return false
                }
            }
        },
        checkAdgroupData(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.checkName()
                    if(!this.error_flag_name){
                        if(this.$route.query.setting_type && this.form.auto_managed){
                            if(!this.error_flag_price && !this.error_price_msg){
                                this.checkPrice()
                            }
                            if(!this.error_flag_price){
                                bus.$emit('updateAdgroupData', Object.assign({}, this.form, {
                                    auto_managed:this.form.auto_managed ? 1 : 0,
                                    crowd_setting:{
                                    crowd_max_price:Math.round(this.form.crowd_setting.crowd_max_price * 100),
                                    crowd_optimize_type:this.form.crowd_setting.crowd_optimize_type
                                }}), 'adgroup_setting')
                            }
                        } else {
                            bus.$emit('updateAdgroupData', {adgroup_name:this.form.adgroup_name, auto_managed:0, crowd_setting:{}}, 'adgroup_setting')
                        }
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        }
    }
}
</script>