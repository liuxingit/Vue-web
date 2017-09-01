<template>
    <div class="flow-detail">
        <div class="title">
            <i class="iconfont">&#xe602;</i>整店流量详情
        </div>
        <div class="table" :class="noData">
            <paginate-table :data-list="tableData" :paginate-user-option="{total: tableData.length}" border style="width: 100%"
                v-loading="loading" element-loading-text="数据加载中" :empty-text="tableData.length ? '' : '暂无数据'">
                <paginate-table-column label="链接类型" width="120" align="center">
                    <template scope="e">
                        {{e.row.url_type | turnType}}
                    </template>
                </paginate-table-column>
                <paginate-table-column label="链接名称" min-width="300">
                    <template scope="e">
                        <a :href="e.row.url" target="_blank" :title="e.row.url_title ? '点击进入' : e.row.url">{{e.row.url_title || '点击进入'}}</a>
                    </template>
                </paginate-table-column>
                <paginate-table-column prop="uv" label="uv" sortable align="right"></paginate-table-column>
                <paginate-table-column label="跳失率" prop="bounce" sortable align="right">
                    <template scope="e">{{e.row.bounce * 100 }}%</template>
                </paginate-table-column>
                <paginate-table-column prop="duration" label="访问时长" sortable align="right">
                    <template scope="e">{{e.row.duration}}s</template>
                </paginate-table-column>
                <paginate-table-column label="操作" align="center">
                    <template scope="e">
                        <el-button type="text" size="mini" @click="pathToDetail(e.row)">查看详情</el-button>
                    </template>
                </paginate-table-column>
            </paginate-table>
        </div>
    </div>
</template>

<script>  
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    export default {
        components: {
            paginateTable,
            paginateTableColumn
        },
        computed: {
            noData() {
                return this.tableData.length ? '' : 'no-data'
            }
        },
        data() {
            return {
                tableData: [],
                detailChart: [],
                loading: true
            }
        },
        created() {
            this.$http.post('traffic_analysis/ajax_get_shop_traffic_detail', {})
            .then(res => {
                if (!res.success) {
                    return false
                }
                const data = res.data
                if (JSON.stringify(data) === '{}') {
                    this.loading = false
                    return false
                }
                let url, uv, bounce_all
                console.time('for')
                Object.keys(data).forEach(i => {
                    url = i
                    let pv_all = 0, ac_all = 0, uv_all = 0, duration = 0
                    const bounce = []
                    data[i].pv.forEach((pv, index) => {
                        let _bounce = (pv - data[i].a_c[index]) / pv
                        bounce.push(_bounce === Infinity || isNaN(_bounce) || _bounce < 0 ? 0 : +_bounce.toFixed(2))
                        pv_all += pv
                        ac_all += data[i].a_c[index]
                    })
                    bounce_all = (pv_all - ac_all) / pv_all
                    bounce_all = bounce_all === Infinity || isNaN(bounce_all) || bounce_all < 0 ? 0 : +bounce_all.toFixed(2)
                    data[i].page_duration.forEach(d => { duration += d })
                    uv = data[i].uv.map(u => {
                        uv_all += Object.keys(u).length
                        return Object.keys(u).length
                    })
                    const chart = [
                        {name: 'uv', data: uv }, 
                        {name: 'bounce', data: bounce },
                        {name: 'duration', data: data[i].page_duration}
                    ]
                    this.tableData.push({url, duration, uv: uv_all, bounce: bounce_all, chart,
                    url_type: data[i].url_type, detail: data[i].detail, url_title: data[i].url_title})
                    this.loading = false
                })
                console.timeEnd('for')
            })
        },
        filters: {
            turnType(t) {
                switch(t) {
                    case 1:
                    return '首页'
                    case 2:
                    return '宝贝页'
                    case 3:
                    return '活动页'
                    case 4:
                    return '其他页'
                }
            }
        },
        methods: {
            pathToDetail(data) {
                const chart = data.chart
                sessionStorage.setItem('analysisDetailChart', JSON.stringify(chart))
                sessionStorage.setItem('analysisDetailTable', JSON.stringify(data.detail))
                window.open('/shop_analysis/detail')
            }
        }
    }
</script>

<style lang="less">
    .flow-detail {
        background-color: #fff;
        padding: 20px;
        margin-top: 20px;
        .paginate-table .el-table{
            min-height: 300px;
        }
        .no-data {
            .paginate-table .el-table{
                min-height: 100px;
            }
        }
    }
</style>