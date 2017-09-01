<template>
    <el-dialog title="推广组托管" v-model="dialogAdgroupAutoManagedVisible" :close-on-click-modal="false">
        <el-form ref="form" :model="form" label-width="96px">
            <el-form-item label="设置自动托管：">
                <el-switch on-text="" off-text="" v-model="form.auto_managed"></el-switch>
                <span style="font-size:12px">（开启自动优化后，需要关闭官方“智能调价”功能）</span>
            </el-form-item>
            <el-form-item v-if="form.auto_managed" label="最高出价：" :class="error_flag_price ? 'is-error' : ''">
                <el-col :span="11">
                    <el-input @focus="focusInputPrice" type="crowd_max_price" props="crowd_max_price" v-model.number="price"></el-input>
                </el-col>
                    元
                    <span v-if="SUGGEST_PRICE">（类目CPC均价：{{SUGGEST_PRICE}}元）</span>
                <div v-if="error_flag_price"  class="el-form-item__error">{{error_price_msg}}</div>
            </el-form-item>
            <el-form-item v-if="form.auto_managed" label="优化方式：">
                <el-radio-group v-model="form.crowd_setting.crowd_optimize_type">
                    <el-radio v-for="item in ADGROUP_AUTO_MANAGED" :label="item.value" :key="item.value">{{item.label}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="" style="margin-bottom:0;margin-top:-25px">
                <span v-if="form.auto_managed && form.crowd_setting.crowd_optimize_type - 0 === 1" class="textDanger">软件自动优化时会对DMP进行算法优化，可能会进行新增、删除等操作。</span>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogAdgroupAutoManagedVisible=false">取 消</el-button>
            <el-button type="primary" @click="changeAutoManagedFinished('form')">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import '@/components/operation/changeOnlineStatus.less'
    import {ADGROUP_AUTO_MANAGED, TYPES_CROWD_PRICE} from '@/config'
    import bus from '@/assets/js/bus.js'
    export default {
        props:['only_price'],
        data() {
            return {
                dialogAdgroupAutoManagedVisible:false,
                price:null,
                form:{
                    auto_managed:false,
                    crowd_setting:{
                        crowd_optimize_type:1,
                        crowd_max_price:null,
                    }
                },
                error_flag_price:false,
                error_price_msg:'请检查您的最高出价',
                ADGROUP_AUTO_MANAGED:ADGROUP_AUTO_MANAGED,
            }
        },
        computed:{
            MAX_PRICE(){
                let MAX_PRICE;
                let campaigns = this.$store.state.plan.campaignList
                for(let {campaign_id, day_budget} of campaigns){
                    if(campaign_id === ((this.$route.query.campaign_id ? this.$route.query.campaign_id : this.$route.params.campaign_id) - 0)){
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
        mounted(){
            this.$store.dispatch('getAdgroupSuggestPrice')
            bus.$off('hideAutoManagedDialog').$on('hideAutoManagedDialog', () => {
                this.$set(this, 'dialogAdgroupAutoManagedVisible', false)
            })
            bus.$off('showAutoManagedDialog').$on('showAutoManagedDialog', (cur_setting, only_price) => {
                this.$set(this,'form',JSON.parse(JSON.stringify(cur_setting)))
                if(!Object.keys(this.form.crowd_setting).length){
                    this.$set(this.form, 'crowd_setting',{
                        crowd_optimize_type: 3,
                        crowd_max_price:null,
                    })
                }
                if(!this.form.crowd_setting.crowd_optimize_type){
                    this.$set(this.form.crowd_setting,'crowd_optimize_type', 3)
                }
                this.$set(this.form,'auto_managed', cur_setting.auto_managed ? true : false)
                this.$set(this, 'dialogAdgroupAutoManagedVisible', true)
                this.$set(this,'price', this.form.auto_managed ? this.form.crowd_setting.crowd_max_price / 100 : null)
            })
        },
        methods:{
            focusInputPrice(){
                this.$set(this,'error_flag_price', false)
            },
            changeAutoManagedFinished(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if(this.form.auto_managed){
                            if(isNaN(this.price) || this.price <= 0 || this.price > this.MAX_PRICE){
                                this.$set(this,'error_price_msg', '定向最高出价范围为0~' + this.MAX_PRICE + '元')
                                this.$set(this,'error_flag_price', true)
                                return false
                            } else {
                                let setting = Object.assign({},this.form)
                                setting.crowd_setting.crowd_max_price = Math.round(this.price * 100) //转为分
                                setting.auto_managed = 1
                                bus.$emit('changeAutoManagedFinished', setting,this.only_price ? 'adgroup' : 'adgroups')
                            }
                        } else {
                            bus.$emit('changeAutoManagedFinished', {auto_managed:0, crowd_setting:{}},this.only_price ? 'adgroup' : 'adgroups')
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