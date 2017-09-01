<template>
    <div id="index">
        <div v-title>首页</div>
        <el-row :gutter="20" class="indexTop">
            <el-col :span="18" class="indexLeft"><div class="grid-content bg-purple"><rpt-highcharts></rpt-highcharts></div></el-col>
            <el-col :span="6" class="indexRight"><div class="grid-content bg-purple "><user-center></user-center>
                <ads-banner type="right"></ads-banner></div></el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="24"><div class="grid-content bg-purple"><campaign-list></campaign-list></div></el-col>
        </el-row>
    </div>
</template>

<script>
    import RptHighcharts from '@/components/RptHighcharts'
    import UserCenter from '@/components/UserCenter'
    import AdsBanner from '@/components/AdsBanner'
    import CampaignList from '@/components/CampaignList'
    // const RptHighcharts = r => require.ensure([], () => r(require('@/components/RptHighcharts')), 'RptHighcharts')
    // const UserCenter = r => require.ensure([], () => r(require('@/components/UserCenter')), 'UserCenter')
    // const AdsBanner = r => require.ensure([], () => r(require('@/components/AdsBanner')), 'AdsBanner')
    // const CampaignList = r => require.ensure([], () => r(require('@/components/CampaignList')), 'CampaignList')
    export default {
        name: 'index',
        data () {
            return {
            }
        },
        created(){
            console.log('首页页面创建喽')
            window._hmt.push(['_trackEvent', 'pages_index', 'click']);
        },
        mounted(){
            console.log('首页页面绘制完成喽')
        },
        components:{
            RptHighcharts,UserCenter,AdsBanner,CampaignList,
        }
    }
</script>
<style scoped>
    @import './IndexPage.less'
</style>
