<template>
    <div class="auto">
        <span>自动优化：</span>
        <el-switch :width="SWITCH_WIDTH" on-text="开启" off-text="关闭" on-color="#54d68e" v-model="managed" @change="saveManage"></el-switch>
    </div>
</template>

<script>
    export default {
        props: ['type'],
        data() {
            return {
                SWITCH_WIDTH: 66,
                managed: null,
            }
        },
        created() {
            if (this.type === 'time') {
                this.managed = this.$store.state.plan.curCampaign.optimize_banner_time_status ? true : false
            } else {
                this.managed = this.$store.state.plan.curCampaign.optimize_area_status ? true : false
            }
        },
        methods: {
            saveManage(v) {
                this.$emit('change', v ? 1 : 0)
            }
        }
    }
</script>