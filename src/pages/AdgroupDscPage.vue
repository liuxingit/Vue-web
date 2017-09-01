<template>
    <div class="adgroupdsc">
      <div v-title>推广单元</div>
      <adgroup-top-info></adgroup-top-info>
      <dsc-list></dsc-list>
    </div>
</template>

<script>
import AdgroupTopInfo from '@/components/AdgroupTopInfo'
import DscList from '@/components/DscList'
export default {
  created(){
    console.log('推广组详情页面创建喽')
    window._hmt.push(['_trackEvent', 'pages_adgroupdsc', 'click']);
  },
  mounted(){
    console.log('推广组详情页面绘制完成喽')
  },
  components:{AdgroupTopInfo, DscList}
}
</script>