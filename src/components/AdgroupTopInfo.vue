<template>
    <div class="topLevelSetting">
        <h1 class="topLevelTitle">
            <i class="iconfont">&#xe642;</i> {{$route.query.adgroup_name}}
            <template v-if="$route.query.show">
                <span class="changePriceWrap" v-if="$route.query.setting_type && $route.query.setting_type - 0 == 1 && cur_setting.auto_managed">
                    最高出价：
                    <span>{{Math.round(cur_setting.crowd_setting.crowd_max_price) / 100}}</span> 元
                    <i class="hoverShow iconfont" @click="handleClick" title="修改定向最高出价">&#xe635;</i>
                </span>
                <span class="changePriceWrap" v-else-if="$route.query.setting_type && $route.query.setting_type - 0 == 1">
                    不优化
                    <i class="hoverShow iconfont" @click="handleClick" title="设为托管">&#xe635;</i>
                </span>
            </template>
        </h1>
        <el-alert v-if="$route.query.setting_type && $route.query.setting_type === 1 && cur_setting.auto_managed" title='开启自动优化后，系统将自动关闭官方"智能调价"功能' type="warning" :closable="false"></el-alert>
        <change-adgroup-auto-managed :only_price="1"></change-adgroup-auto-managed>
    </div>
</template>
<script>
    import '@/components/AdgroupTopInfo.less'
    import changeAdgroupAutoManaged from '@/components/operation/changeAdgroupAutoManaged'
    import bus from '@/assets/js/bus.js'
    export default {
        data() {
            return {
                cur_setting:{}
            }
        },
        watch:{
            cur_setting:{
                deep:true,
                handler(value){
                }
            }
        },
        methods:{
            handleClick(){
                bus.$emit('showAutoManagedDialog', this.cur_setting)
            },
            getAdgroup(){
                this.$http.post('adgroup/ajax_get_adgroup_list', {campaign_id:this.$route.query.campaign_id - 0,
                    adgroup_id_list :[this.$route.params.adgroup_id - 0]
                }).then((res) => {
                    if (!res.success) {return false}
                    let data = res.data
                    if(data.length){
                        this.$set(this, 'cur_setting', {
                            auto_managed: data[0].auto_managed,
                            crowd_setting:data[0].crowd_setting,
                        })
                    }
                })
            },
            changeAutoManaged(handle_setting){//修改推广组优化状态
                this.$http.post('adgroup/ajax_modify_adgroup_optimize_status',{campaign_id:this.$route.query.campaign_id - 0,
                    adgroup_id:this.$route.params.adgroup_id - 0,
                    auto_managed:handle_setting.auto_managed,
                    crowd_setting:handle_setting.crowd_setting
                }).then((res) => {
                    if (!res.success) {return false}
                    this.$set(this,'cur_setting',{
                        auto_managed:handle_setting.auto_managed,
                        crowd_setting:handle_setting.crowd_setting
                    })
                    bus.$emit('hideAutoManagedDialog')
                })
            },
        },
        mounted(){
            bus.$off('changeAutoManagedFinished').$on('changeAutoManagedFinished', (handle_setting, type) => {
                if (type === 'adgroup') { this.changeAutoManaged(handle_setting)}
            })
            if(this.$route.query.setting_type && this.$route.query.setting_type - 0 && this.$route.query.show){
                this.getAdgroup()
            }
        },
        components:{changeAdgroupAutoManaged}
    }
</script>