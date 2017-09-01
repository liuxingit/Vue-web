<template>
    <div id="root">
        <navbar></navbar>
        <ads-banner type="bottom"></ads-banner>
        <copy-right-footer></copy-right-footer>
    </div>
</template>
<script>
    import Navbar from '@/components/Navbar'
    import AdsBanner from '@/components/AdsBanner'
    import CopyRightFooter from '@/components/CopyRightFooter'
    export default {
        created(){
            this.$store.dispatch('getBannerSetting')
        },
        components:{Navbar, AdsBanner, CopyRightFooter}
    }
</script>