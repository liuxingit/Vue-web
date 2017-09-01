<template>
    <div class="container">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
            <el-menu-item index="1"><router-link to="/"><img class="logoImg" src="../assets/images/logo.png"></router-link></el-menu-item>
            
            <el-submenu index="3" class="camlistWrap mainNav">
                <template slot="title"><i class="iconfont">&#xe6a9;</i>计划管理</template>
                <el-menu-item v-if="!campaignsPuting.length" class="navSummenuItem" index="3-0">
                    <span>暂无正在投放的计划</span>
                </el-menu-item>
                <el-menu-item  v-else class="navSummenuItem" v-for="{index, setting_type,type, campaign_name,campaign_id, online_status} in campaignsPuting" :index="'3-1'" :key="campaign_id">
                    <router-link :to="{name:'AdgroupsPage',params:{campaign_id:campaign_id}}">
                        <span style="color:#888;border-radius:3px;border:1px solid #888;padding:0 2px;">{{TYPES[type].toUpperCase()}}</span>
                        <span v-if="setting_type" style="color:#5dc88d;border-radius:3px;border:1px solid #5dc88d;padding:0 2px;">自动</span>
                        {{campaign_name}}
                    </router-link>
                </el-menu-item>
            </el-submenu>
            <el-submenu index="4" class="camlistWrap mainNav">
                <template slot="title"><i class="iconfont">&#xe606;</i>我的报表</template>
                <el-menu-item index="4-1" class="navSummenuItem"><router-link to="/rpt">我的报表</router-link></el-menu-item>
                <el-menu-item index="4-2" class="navSummenuItem"><router-link to="/shop_analysis">整店流量</router-link></el-menu-item>
                <el-menu-item index="4-3" class="navSummenuItem"><router-link to="/operation_log">优化记录</router-link></el-menu-item>
            </el-submenu>
            <el-menu-item index="7" class="mainNav"><router-link to="/combination"><i class="iconfont">&#xe67b;</i>直钻结合</router-link></el-menu-item>
            <el-menu-item index="5" class="mainNav"><router-link to="/creative_store"><i class="iconfont">&#xe63b;</i>创意库</router-link></el-menu-item>
            <!-- <el-menu-item index="5"><router-link target="_blank" to="https://www.taobao.com/webww/ww.php?ver=3&touid=%E9%BA%A6%E8%8B%97%E7%BD%91%E7%BB%9C%E6%8A%80%E6%9C%AF%3A%E8%8E%8E%E8%8E%8E&siteid=cntaobao&status=2&charset=utf-8"><i class="iconfont">&#xe60a;</i>联系客服</router-link></el-menu-item> -->
            <el-submenu index="6" class="mainNav">
                <template slot="title"><i class="iconfont">&#xe60a;</i>联系客服</template>
                <el-menu-item class="serviceItemWrap" :index="'6-0'">
                    <a target="_blank" href="http://www.taobao.com/webww/ww.php?ver=3&touid=%E9%BA%A6%E8%8B%97%E7%BD%91%E7%BB%9C%E6%8A%80%E6%9C%AF%3A%E6%B2%99%E6%B2%99&siteid=cntaobao&status=2&charset=utf-8">联系沙沙：<img border="0" src="http://amos.alicdn.com/online.aw?v=2&uid=麦苗网络技术:沙沙&site=cntaobao&s=1&charset=utf-8" alt="点这里给我发消息"></a>&nbsp;&nbsp;&nbsp;&nbsp;
                    <a target="_blank" href="http://www.taobao.com/webww/ww.php?ver=3&touid=%E9%BA%A6%E8%8B%97%E7%BD%91%E7%BB%9C%E6%8A%80%E6%9C%AF%3A%E5%B0%8F%E5%88%9A&siteid=cntaobao&status=2&charset=utf-8">联系小刚：<img border="0" src="http://amos.alicdn.com/online.aw?v=2&uid=麦苗网络技术:小刚&site=cntaobao&s=1&charset=utf-8" alt="点这里给我发消息"></a>
                    <div class="timeWrap">
                        <b>工作时间：</b> 工作日：9:00 - 18:00
                    </div>
                </el-menu-item>
            </el-submenu>
            <!-- <el-menu-item index="5"><router-link to="/rpt"><i class="el-icon-message"></i>直钻结合</router-link></el-menu-item>
            <el-menu-item index="6"><router-link to="/creative_store"><i class="el-icon-message"></i>创意库</router-link></el-menu-item>
            <el-menu-item index="7"><router-link to="/tools"><i class="el-icon-message"></i>工具</router-link></el-menu-item> -->
            <div class="nav-right">
                <span>您好，{{nick}}</span>
                <a class="logout" href="javascript:;" @click="beforeLogout" v-if="!QN">退出</a>
                <i class="messageIcon iconfont" @click="showMessageCenter">&#xe67d;</i>
                <sup v-if="messageCount" class="messageCount">{{messageCount}}</sup>
                <i class="userCenterIcon iconfont" @click="showUserContact">&#xe662;</i>
            </div>
        </el-menu>
        <div class="main"><router-view></router-view></div>
        <message-center></message-center>
        <user-contact></user-contact>
    </div>
</template>

<script>
    import {TYPES} from '@/config'
    import bus from '@/assets/js/bus.js'
    import MessageCenter from '@/components/MessageCenter'
    import UserContact from '@/components/UserContact'
    //考虑组件双向通信，传campaigns回campaignList组件
    const NAV = {
        'adgroups': '3-1',
        'adgroupdsc': '3-1',
        'rpt': '4-1',
        'rpt_day': '4-1',
        'shop_analysis': '4-2',
        'operation_log': '4-3',
        'creative_store': '5',
        'combination': '7',
    };
    const path = location.pathname.match(/adgroupdsc|adgroups|rpt|rpt_day|operation_log|combination|shop_analysis/)
    
    export default {
        data () {
            return {
                TYPES:TYPES,
                activeIndex: path &&  path[0] ? NAV[path[0]] : '2',
                messageCount:0,
                QN: false,
            }
        },
        created(){
            this.$store.dispatch('getShopInfo');
            this.$store.dispatch('getBannerCampaigns')
            this.$http.post('ajax_get_login_type', {})
            .then(res => {
                if (!res.success) return
                this.QN = res.data.indexOf('qianniu') > -1 ? true : false
            })
        },
        // mounted(){
            // bus.$off('changeActiveIndex').$on('changeActiveIndex', (activeIndex) => {
            //     this.$set(this, 'activeIndex', activeIndex);
            // });
        // },
        computed: {
            campaignsPuting() {
                return this.$store.state.plan.campaignList.filter(i => +i.online_status === 1)
            },
            nick(){
                return this.$store.state.plan.shopInfo.nick
            }
        },
        methods: {
            showMessageCenter(){
                bus.$emit('showMessageCenter')
            },
            showUserContact(){
                bus.$emit('showUserContact')
            },
            beforeLogout(){
                this.$http.post('ajax_send_offline_signal', {}).then(res => {
                    window.open('/logout', '_self')
                });
            }
        },
        watch: {
            $route (to,from){
                var path = to.path.match(/adgroupdsc|adgroups|rpt|rpt_day|operation_log|combination|creative_store|shop_analysis/);
                var activeIndex = path && path[0] ? NAV[path[0]] : '2';
                this.$set(this, 'activeIndex', activeIndex);
            }
        },
        components:{
            MessageCenter,UserContact
        }
    }
</script>
<style lang='less'>
    @import './Navbar.less';
</style>
