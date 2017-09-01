<template>
    <div class="mm-pane" id="user_center" >
        <div class="mm-pane-title"><i class="iconfont">&#xe607;</i>账户情况</div>
        <div>
            <i class="iconfont block">&#xe61e;</i>
            <div>剩余金额</div>
            <div>{{$store.state.plan.account}}</div>
        </div>
    </div>
</template>
<script>
    import '@/components/UserCenter.less'
    export default {
        data () {
            return {
            }
        },
        created(){
            this.$store.dispatch('getAccount')
        }
    }
</script>