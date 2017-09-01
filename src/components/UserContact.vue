<template>
    <el-dialog title="" v-model="visible" class="userContactDialog" :close-on-click-modal="false">
        <div class="userContactWrap">
        <el-form ref="form" :rules="rules" :model="form" label-width="0">
            <el-form-item label="" prop="mobile">
                <el-input :disabled="has_contact && !edit" placeholder="手机号" v-model.number="form.mobile">
                    <template slot="prepend"><i class="iconfont">&#xe662;</i></template>
                 </el-input>
            </el-form-item>
            <el-form-item label="" v-if="!has_contact || edit && this.form.mobile !== this.mobile" prop="code">
                <el-input placeholder="验证码" v-model.number="form.code">
                    <template slot="prepend"><i class="iconfont">&#xe682;</i></template>
                    <el-button v-if="code_send_second <= 0 || code_send_second > 60" slot="append" @click="getCode">获取验证码</el-button>
                    <el-button v-else slot="append" :disabled="true">{{code_send_second}}秒之后重发</el-button>
                </el-input>
            </el-form-item>
           <el-form-item label="" prop="qq">
                <el-input :disabled="has_contact && !edit" placeholder="QQ号" v-model.number="form.qq">
                    <template slot="prepend"><i class="iconfont">&#xe713;</i></template>
                 </el-input>
            </el-form-item>
            <el-form-item>
                <el-button v-if="has_contact && !edit" class="blockButton" type="primary" @click="onEdit">修改</el-button>
                <template v-else>
                    <el-button v-loading.fullscreen.lock="fullscreenLoading" class="blockButton" type="primary" @click="onSubmit('form')">提交</el-button>
                    <el-button class="blockButton" @click="visible=false">取消</el-button>
                    <el-button type="text" @click="noRemind" class="noRemind">不再提示</el-button>
                </template>
            </el-form-item>
        </el-form>
        </div>
    </el-dialog>
</template>
<script>
    import bus from '@/assets/js/bus.js'
    import {getCookie, setCookie, delCookie} from '@/assets/js/base.js'
    var st
    export default {
        data () {
            var validateMobile = (rule,value,callback) => {
                if (!(/^1[3|4|5|7|8]\d{9}$/.test(value - 0))) {
                  return callback(new Error('请输入11位手机号'));
                }
                callback()
            };
            var validateCode = (rule,value,callback) => {
                if (this.form.mobile !== this.mobile && !(/^\d{6}$/.test(value - 0))) {
                  return callback(new Error('请输入6位验证码'));
                }
                callback()
            };
            var validateQq = (rule,value,callback) => {
                if (value && !(/^[1-9]\d{4,}$/.test(value - 0))) {
                  return callback(new Error('请输入正确的QQ号'));
                }
                callback()
            };
            return {
                mobile:null,
                qq:null,
                fullscreenLoading:false,
                form:{
                    mobile: '',
                    code: '',
                    qq: ''
                },
                rules:{
                    mobile: [
                        { validator: validateMobile, trigger: 'blur' }
                    ],
                    code: [
                        { validator: validateCode, trigger: 'blur' }
                    ],
                    qq: [
                        { validator: validateQq, trigger: 'blur' }
                    ],
                },
                code_send_second:61,
                visible:false,
                has_contact:false,
                edit:false,
            }
        },
        watch:{
            code_send_second(curVal, oldVal){
                this.$set(this,'code_send_second', curVal <= 0 ? 61 : curVal)
            },
            // visible(curVal, oldVal){
            //     if(curVal){
            //         this.$set(this,'code_send_second', 61)
            //         this.$set(this,'edit', false)
            //         this.$set(this,'form', Object.assign(this.form,{code:''}))
            //     }
            // },
        },
        created(){
            this.$http.post('ajax_get_contact',{}).then((res) => {
                if (!res.success) {return false}
                if(res.data && res.data.mobile){
                    this.$set(this,'mobile', res.data.mobile)
                    this.$set(this,'has_contact', true)
                } else {
                    if(!getCookie('contact-no-remind')){
                        this.$set(this,'visible', true)
                    }
                }
                Object.assign({}, res.data)
                this.$set(this,'form',Object.assign({}, res.data))
            })
        },
        mounted(){
            bus.$off('showUserContact').$on('showUserContact', () => {
                this.$set(this,'visible',true)
                this.$set(this,'code_send_second', 61)
                if(st){
                    clearInterval(st)
                    st = null
                }
                this.$set(this,'edit', false)
                this.$set(this,'form', Object.assign(this.form,{code:''}))
            })
        },
        methods:{
            onEdit(){
                this.$set(this,'edit', true)
            },
            onSubmit(formName){
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        if(this.form.mobile === this.mobile && this.form.qq === this.qq){
                            this.$set(this,'visible',false)
                            this.$alert('您未做任何修改', '提示信息', {
                                confirmButtonText: '确定',
                            });
                            return false
                        }
                        this.$set(this,'fullscreenLoading',true)
                        if(!this.form.qq){
                            delete this.form.qq
                        }
                        if(!this.form.code){
                            delete this.form.code
                        }
                        this.$http.post('ajax_set_contact',this.form).then((res) => {
                            this.$set(this,'fullscreenLoading',false)
                            if (!res.success) {return false}
                            this.$set(this,'mobile', this.form.mobile)
                            this.$set(this,'qq', this.form.qq)
                            this.$set(this,'has_contact', true)
                            this.$alert('联系方式修改成功', '提示信息', {
                                confirmButtonText: '确定',
                            });
                            this.$set(this,'visible',false)
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            getCode(){
                if ((/^1[3|4|5|7|8]\d{9}$/.test(this.form.mobile - 0))) {
                    this.$http.post('ajax_get_active_user_code',{mobile:this.form.mobile}).then((res) => {
                        if (!res.success) {return false}
                        this.$set(this,'code_send_second', this.code_send_second - 1)
                        let self = this
                        st = setInterval(function(){
                            var time_count = self.code_send_second - 1
                            if(time_count <= 0){
                                clearInterval(st)
                                st = null
                            }
                            self.$set(self,'code_send_second', time_count <= 0 ? 61 : time_count)
                        }, 1000)
                    }) 
                }
            },
            noRemind(){
                setCookie('contact-no-remind', true, 'd30')
                this.$set(this,'visible',false)
            }
        }
    }
</script>
<style lang="less">
    @import './UserContact.less';
</style>
