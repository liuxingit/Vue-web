<template>
    <div class="shop-analysis">
        <flow-chart class="component"></flow-chart>
        <area-analysis class="component"></area-analysis>
        <flow-detail class="component"></flow-detail>
    </div>
</template>

<script>
    import flowChart from '@/components/shop-analysis/flowChart'
    import areaAnalysis from '@/components/shop-analysis/areaAnalysis'
    import flowDetail from '@/components/shop-analysis/flowDetail'
    export default {
        components: {flowChart,areaAnalysis,flowDetail},
        data() {
            return {
            }
        },

    }
</script>

<style lang="less">
    .shop-analysis {
        .component {
            padding: 0 20px 20px;
        }
        .title {
            height: 46px;
            font-size: 14px;
            background-color: #EBF3FF;
            line-height: 46px;
            padding: 0 20px;
            margin: 0 -20px 20px;
            i {
                margin-right: 10px;
            }
        }
        .prompt {
            font-size: 12px;
            color: #aaa;
        }
        .table {
            .el-table__body-wrapper {
                overflow: initial;
            }
        }
    }
</style>