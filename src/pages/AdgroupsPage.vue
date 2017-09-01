<template>
    <div class="adgroups">
      <div v-title>计划管理</div>
      <campaign-top-info></campaign-top-info>
      <adgroup-list></adgroup-list>
    </div>
</template>

<script>
  import CampaignTopInfo from '@/components/CampaignTopInfo'
  import AdgroupList from '@/components/AdgroupList'
  // const CampaignTopInfo = r => require.ensure([], () => r(require('@/components/CampaignTopInfo')), 'CampaignTopInfo')
  //const AdgroupList = r => require.ensure([], () => r(require('@/components/AdgroupList')), 'AdgroupList')
  export default {
      name: 'adgroups',
      data () {
          return {
          }
      },
      watch:{
        $route(curVal,oldVal){
            this.$store.commit('getCampaignId', this.$route.params.campaign_id)
            this.$store.dispatch('getCurrentCampaign')
        },
      },
      created(){
        console.log('计划管理页面创建喽')
        this.$store.commit('getCampaignId', this.$route.params.campaign_id)
        this.$store.dispatch('getCurrentCampaign')
        window._hmt.push(['_trackEvent', 'pages_adgroups', 'click']);
      },
      mounted(){
        console.log('计划管理页面绘制完成喽')
      },
      components:{
          CampaignTopInfo,
          AdgroupList
      }
  }
</script>
<style scoped>
    @import './AdgroupsPage.less'
</style>

