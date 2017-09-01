<template>
    <div class="creative-store">
        <div v-title>创意库</div>
        <div class="action">
            <div class="handle-creative">
                <el-button type="primary" icon="plus" @click="showCreativeDialog">添加创意</el-button>
            </div>
            <query-condition 
                :adzone="adzoneSelection" 
                :creativeStatus="creativeStatus"
                :onlineStatus="onlineStatus"
                :urlFormat="urlFormat"
                :catList="catList"
                :creativeFormat="creativeFormat"
                :size="creativeSize" :level="creativeLevel"
                @change-query-condition="getCreativeList"
                @search="searchCreative" @reset="resetcreativeList">
            </query-condition>
        </div>
        <creative-table ref="table" :tableData="creativeList" @updateList="updateList"
        :catList="catList" :creativeFormat="creativeFormat" :urlFormat="urlFormat"></creative-table>
    </div>
</template>

<script>
    import queryCondition from '@/components/creative-store/queryCondition'
    import creativeTable from '@/components/creative-store/creativeTable'
    export default {
        components: {
            queryCondition,
            creativeTable
        },
        data() {
            return {
                adzoneSelection: [],
                creativeStatus: {},
                onlineStatus: {},
                urlFormat: {},
                catList: {},
                creativeFormat: {},
                creativeSize: [],
                creativeLevel: {},
                creativeList: [],
                creativeListCache: []
            }
        },
        created() {
            window._hmt.push(['_trackEvent', 'pages_creative_store', 'click']);
        },
        mounted() {
            this.$http.post('creatives/ajax_get_creative_search_condition', {})
            .then(res => {
                if (!res.success) return
                const data = res.data
                this.adzoneSelection = data.adzone_list.map(item => {
                    item.adzone_size_list.forEach(i => {
                        this.creativeSize.push(i)
                    })
                    return { id: item.adzone_id, name: item.adzone_name, size: item.adzone_size_list, level: item.adzone_level }
                })
                this.creativeStatus = Object.assign({}, data.creative_status_list)
                Object.keys(this.creativeStatus).forEach(key => {
                    if (+key === -5 || +key === -9 || +key === -1 || +key === -4) {
                        delete this.creativeStatus[key]
                    }
                    if (+key === 0) {
                        this.creativeStatus['-4,-1,0'] = this.creativeStatus[key]
                        delete this.creativeStatus[key]
                    }
                    if (+key === -2) {
                        this.creativeStatus['-2,-5,-9'] = this.creativeStatus[key]
                        delete this.creativeStatus[key]
                    }
                })
                this.creativeSize = Array.from(new Set(this.creativeSize)) // 数组去重
                this.onlineStatus = data.online_status
                this.urlFormat = data.url_format_list
                this.catList = data.creative_cat
                this.creativeFormat = data.creative_format_list
                this.creativeLevel = data.creative_level_list
            })
            this.getCreativeList() 
        },
        methods: {
            getCreativeList(filter = {}) {
                this.$http.post('creatives/ajax_query_creatives', filter)
                .then(res => {
                    if (!res.success) return
                    console.time('sort')
                    const data = res.data.map(i => {
                        if (i.audit_status === 1) {
                            i.sort = -1
                        } else if (i.audit_status === -1 || i.audit_status === -4 || i.audit_status === 0) {
                            i.sort = 0
                        } else if (i.audit_status === -2 || i.audit_status === -5 || i.audit_status === -9) {
                            i.sort = 1
                        }
                        return i
                    }).sort((a, b) => {
                        return a.sort === b.sort ? 0 : a.sort > b.sort ? 1 : -1
                    })
                    this.creativeList = data.map(i => i)
                    this.creativeListCache = data.map(i => i)
                    console.timeEnd('sort')
                })
            },
            updateList(data, edit) {
                const insertIndex = this.creativeList.findIndex(i => i.sort === 0)
                if (edit) {
                    const index = this.creativeList.findIndex(item => {
                        return item.creative_id === data.creative_id
                    })
                    this.creativeList.splice(index, 1)
                    this.creativeList.splice(insertIndex, 0, Object.assign({}, this.creativeList[index], data, {sort: 0}))
                } else {
                    this.creativeList.splice(insertIndex, 0, Object.assign({}, data, {sort: 0}))
                }
                this.creativeListCache = this.creativeList.map(i => i)
            },
            searchCreative(data) {
                let condition, index
                if (/^[0-9]+.?[0-9]*$/.test(data)) {
                    condition = 'creative_id'
                    data = +data
                    index = this.creativeListCache.findIndex(item => item[condition] === data)
                } else {
                    condition = 'creative_name'
                    index = this.creativeListCache.findIndex(item => (item[condition] + '_' + item.creative_size) === data || item[condition] === data)
                }
                if (index > -1) {
                    this.creativeList = [this.creativeListCache[index]]
                } else {    
                    this.creativeList = []
                }
            },
            resetcreativeList() {
                this.creativeList = this.creativeListCache.map(i => i)
            },
            showCreativeDialog() {
                this.$refs.table.creativeDialog = true
            }
        }
    }
</script>

<style lang="less">
    .creative-store {
        padding: 20px;
        background-color: #fff;
        min-height: 500px;
        .action {
            margin-bottom: 20px;
            display: flex;
            display: -webkit-flex;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 1px solid #dfe6ec;
        }
    }
</style>