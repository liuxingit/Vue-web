<template lang="html">
    <div class="operation_log">
        <div v-title>优化记录</div> 
        <div class="filters clearfix">
            <div class="pullLeft">
                <el-select v-model="campaign_id" @change="getLogToal">
                    <el-option :value="optionEmpty" label="请选择"></el-option>
                    <el-option v-for="item in campaignOption" :key="item.campaign_id" :value="item.campaign_id" :label="item.campaign_name"></el-option>
                </el-select>
            </div>
            <div class="pullRight">
                <el-select v-model="ops" @change="getLogToal">
                    <el-option v-for="item in opsArr" :key="item.value" :value="item.value" :label="item.name"></el-option>
                </el-select>
                <!--<el-select v-model="">
                    <el-option v-for="" :key="item.value" :value="item.value" :label="item.name"></el-option>
                </el-select>-->
                <date-time-picker :customTime="[new Date(), new Date()]" type="operationLog"></date-time-picker>
            </div>
        </div>
        <div class="table">
            <el-table :data="dataList" border style="width: 100%">
                <el-table-column prop="operate_time" label="日期" width="160" sortable>
                    <template scope="c">
                        <span>{{ c.row.operate_time.$date | renderDate }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="ops" label="操作类型" width="100" align="center" header-align="center"></el-table-column>
                <el-table-column prop="campaign_name" label="推广计划"></el-table-column>
                <el-table-column prop="adgroup_name" label="推广单元"></el-table-column>
                <el-table-column label="操作详情" width="330">
                    <template scope="e">
                        <span v-text="turnCode(e.row.code)"></span>
                        <el-button type="text" size="mini" v-if="e.row.code > 99" @click="showDetailDialog(e.row)">详情</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="num" label="数量" width="70" align="center" header-align="center"></el-table-column>
            </el-table>
            <el-pagination class="textRight" :current-page="currentPage" :page-sizes="[10, 20, 50]" :page-size="this.pageSize" :total="totalPage" 
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            layout="total, prev, pager, next, jumper"></el-pagination>
        </div>
        <el-dialog custom-class="detail-dialog" title="操作详情" v-model="detailDialog">
             <el-table :data="detailData" border>
                <el-table-column prop="name" label="操作对象" min-width="130">
                    <template scope="e">
                        <div v-html="e.row.name" class="info"></div>
                    </template>
                </el-table-column>
                <el-table-column prop="before" label="修改前"></el-table-column>
                <el-table-column prop="after" label="修改后"></el-table-column>
             </el-table>
        </el-dialog>
        <el-dialog title="操作详情" v-model="detailTips">
            <div>原因：{{detailTipContent}}</div>
        </el-dialog>
    </div>
</template>

<script>
    import dateTimePicker from '@/components/DateTimePicker'
    import bus from '@/assets/js/bus'
    import { formatDate, getDefineDay, areaList } from '@/assets/js/base'

    export default {
        data() {
            return {
                optionEmpty: '',
                currentPage: 1,
                totalPage: 0,
                pageSize: 10,
                operate_comment: {},
                dataList: [],
                campaign_id: '',
                adgroup_id: '',
                ops: 'all',
                opsArr: [
                    { value: 'all', name: '全部'},
                    { value: 'sys', name: '系统'},
                    { value: 'user', name: '用户'}
                ],
                sdate: null,
                edate: null,
                detailDialog: false,
                detailData: [],
                detailTips: false,
                detailTipContent: null
            }
        },
        created() {
            this.campaign_id = +this.$route.params.campaign_id || ''
            this.getLogToal()
            window._hmt.push(['_trackEvent', 'pages_operation_log', 'click']);         
        },
        mounted() {
            bus.$off('getDateTime').$on('getDateTime', (val, type) => {
                if (type !== 'operationLog') return
                this.sdate = val.start_date
                this.edate = val.end_date
                this.getLogToal()
            })
        },
        methods: {
            handleSizeChange(val) {
                this.pageSize = val;
                this.getLog()
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getLog()
            },
            getLogToal() {
                this.$http.post('/campaign/ajax_get_detail_log_total_count', {
                    campaign_id: this.campaign_id || null,
                    adgroup_id: this.adgroup_id || null,
                    ops: this.ops,
                    sdate: this.sdate || formatDate(new Date(),'', 1),
                    edate: this.edate || formatDate(new Date(),'', 1),
                }).then((res) => {
                    if (!res.success) return
                    this.totalPage = res.data.count
                    this.operate_comment = res.data.operate_comment
                }).then(() => {
                    this.getLog()
                })
            },
            getLog() {
                this.$http.post('/campaign/ajax_get_detail_log', {
                    campaign_id: this.campaign_id || null,
                    adgroup_id: this.adgroup_id || null,
                    ops: this.ops,
                    sdate: this.sdate || formatDate(new Date(),'', 1),
                    edate: this.edate || formatDate(new Date(),'', 1),
                    page_no: this.currentPage,
                    page_size: this.pageSize
                }).then((res) => {
                    if (!res.success) return
                    this.dataList = res.data.log_list
                })
            },
            turnCode(val) {
                let text;
                Object.keys(this.operate_comment).forEach((item) => {
                    if (+val === +item) {
                        text = this.operate_comment[item];
                    }
                })
                return text;
            },
            turnOnlineStatus(val) {
                switch(val) {
                    case 1:
                    return '正在投放';
                    case 0:
                    return '暂停投放';
                    case 9:
                    return '结束投放';
                }
            },
            showDetailDialog(data) {
                const code = data.code
                const detail = data.detail[data.detail.type] || data.detail[`${data.detail.type}s`]
                let name = [], before = [], after = []
                let diff, text
                switch (+code) {
                    case 100:    // 加定向
                    detail.forEach((crowd, i) => {
                        crowd.matrix_prices.forEach(adzone => {
                            name.push(`定向${i + 1}：${crowd.crowd_name_for_display || crowd.crowd_name}<br><i>资源位：${adzone.adzone_name}</i>`)
                            before.push(false)
                            after.push(adzone.price)
                        })
                    })
                    this.setDetailData(name, false, after)
                    break;
                    case 101:    // 删定向
                    case 107:    // 删除行业店铺定向
                    detail.forEach((crowd, i) => {
                        name.push(`定向${i + 1}：${crowd.crowd_name_for_display || crowd.crowd_name}`)
                        after.push('删除')
                        before.push(false)
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 102:  // 加价
                    case 103:  // 减价
                    case 104:  // 改价
                    detail.forEach((crowd, i) => {
                        crowd.matrix_prices.forEach(adzone => {
                            name.push(`定向${i + 1}：${crowd.crowd_name_for_display || crowd.crowd_name}<br><i>资源位：${adzone.adzone_name}</i>`)
                            before.push(adzone.old_price)
                            after.push(adzone.price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 105: // 访客定向新增
                    detail.forEach(item => {
                        name.push(item)
                        after.push('新增')
                    })
                    this.setDetailData(name, false, after)
                    break;
                    case 106: // 访客定向减少
                    detail.forEach(item => {
                        name.push(item)
                        after.push('删除')
                    })
                    this.setDetailData(name, false, after)
                    break;
                    case 120:    // 添加资源位
                    detail.forEach((adzone, i) => {
                        adzone.matrix_price_list.forEach(crowd => {
                            name.push(`资源位${i + 1}：${adzone.adzone_name}<br><i>定向：${crowd.crowd_name_for_display || crowd.crowd_name}</i>`)
                            before.push(false)
                            after.push(crowd.price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 130:  // 添加dmp人群
                    if (!detail || !detail[0]) return
                    detail.forEach(item => {
                        name.push(item.crowd_name)
                    })
                    this.setDetailData(name, false, false)
                    break;
                    case 140:     // 分时优化
                    Object.keys(detail).forEach(key => {
                        if (key === 'workday') {
                            name.push('工作日')
                            before.push(detail[key].new_banner_time.map(i => i + '点').join(','))
                            after.push(detail[key].old_banner_time.map(i => i + '点').join(','))
                        }
                        if (key === 'weekend') {
                            name.push('休息日')
                            before.push(detail[key].new_banner_time.map(i => i + '点').join(','))
                            after.push(detail[key].old_banner_time.map(i => i + '点').join(','))
                        }
                    })
                    if (name.length) {
                        this.setDetailData(name, before, after)
                    }
                    break;
                    case 141:     // 地域优化 
                    areaList.forEach(area => {
                        detail.old_area_id_list && detail.old_area_id_list.some(code => {
                            if (code === area.code) {
                                before.push(area.name)
                                return true
                            }
                        })
                        
                        detail.new_area_id_list.some(code => {
                            if (code === area.code) {
                                after.push(area.name)
                                return true
                            }
                        })
                    })
                    this.setDetailData(data.campaign_name, before.join(','), after.join(','))
                    break;
                    case 1001:    // 新建单元
                    after = '新建单元'
                    this.setDetailData(data.adgroup_name, false, after)
                    break;
                    case 1002:    // 删除单元
                    after = '删除单元'
                    this.setDetailData(data.adgroup_name, false, after)
                    break;
                    case 1003:    // 修改单元名称
                    this.setDetailData(data.adgroup_name, detail.old_adgroup_name, data.adgroup_name)
                    break;
                    case 1004:    // 修改单元状态
                    this.setDetailData(data.adgroup_name, this.turnOnlineStatus(detail.old_online_status), this.turnOnlineStatus(detail.new_online_status))
                    break;
                    case 1005:    // 修改单元优化状态
                    case 1006:    // 单元开启自动托管
                    case 1007:    // 单元关闭自动托管
                    case 1008:    // 修改单元定向最高出价
                    case 1009:    // 修改单元优化方式
                    diff = this.diffObject(detail.old_setting, detail.new_setting)
                    diff.forEach(item => {
                        if (item.key === 'auto_managed') {
                            name.push('单元自动托管')
                            before.push(item.before ? '开启' : '关闭')
                            after.push(item.after ? '开启' : '关闭')
                        }
                        if (item.key === 'crowd_max_price') {
                            name.push('单元最高出价')
                            before.push(item.before)
                            after.push(item.after)
                        }
                        if (item.key === 'crowd_optimize_type') {
                            name.push('单元优化方式')
                            before.push(item.before === 1 ? '自动选择定向+改价+资源位更新' : item.before === 2 ? '只优化价格' : '不优化')
                            after.push(item.after === 1 ? '自动选择定向+改价+资源位更新' : item.after === 2 ? '只优化价格' : '不优化')
                        }
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 1010:    // 自动新建单元失败
                    this.detailTipContent = data.detail.message
                    this.detailTips = true
                    break;
                    case 2001:    // 增加定向
                    case 2002:    // 删除定向
                    if (!detail[0].crowd_name_for_display) return
                    detail.forEach((crowd,i) => {
                        crowd.matrix_prices.forEach(adzone => {
                            name.push(`定向${i + 1}：${crowd.crowd_name_for_display}<br><i>资源位：${adzone.adzone_name}</i>`)
                            before.push(false)
                            after.push(adzone.price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 3001:    // 增加资源位
                    case 3002:    // 删除资源位
                    if (!detail[0].matrix_price_list[0].crowd_name_for_display) return
                    detail.forEach((adzone,i) => {
                        adzone.matrix_price_list.forEach(crowd => {
                            name.push(`资源位${i + 1}：${adzone.adzone_name}<br><i>定向：${crowd.crowd_name_for_display}</i>`)
                            before.push(false)
                            after.push(crowd.price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 4001:    // 增加创意
                    case 4002:    // 删除创意
                    if (!detail) return
                    text = code === 4001 ? '新增' : '删除'
                    detail.forEach(creative => {
                        name.push(creative.name)
                        before.push(false)
                        after.push(text)
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 5001:    // 修改定向x资源位交叉出价
                    detail.forEach((crowd,i) => {
                        crowd.matrix_prices.forEach(matrix => {
                            name.push(`定向${i + 1}：${crowd.crowd_name_for_display}<br><i>资源位：${matrix.adzone_name}</i>`)
                            before.push(matrix.old_price)
                            after.push(matrix.new_price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                    case 5002:   // 修改资源位出价
                    detail.forEach((adzone, i) => {
                        adzone.matrix_price_list.forEach(matrix => {
                            name.push(`资源位${i + 1}：${adzone.adzone_name}<br><i>定向：${matrix.crowd_name_for_display}</i>`)
                            before.push(matrix.old_price)
                            after.push(matrix.new_price)
                        })
                    })
                    this.setDetailData(name, before, after)
                    break;
                }
            },
            /**
             * @param name 修改对象
             * @param before 修改前
             * @param after 修改后
             */
            setDetailData(name, before, after) {
                if (this.isArray(name)) {
                    this.detailData.length = name.length
                    this.detailData = name.map((item, index) => {
                        if (typeof before[index] === 'number') { before[index] = before[index] / 100 + '元'}
                        if (typeof after[index] === 'number') { after[index] = after[index] / 100 + '元'}
                        return {name: name[index], before: before[index] || '--', after: after[index] || '--'}
                    })
                } else {
                    this.detailData = []
                    this.detailData.push({name, before: before || '--', after: after || '--'})
                }
                this.detailDialog = true
            },
            diffObject(a, b) {
                if (!(a && b)) {
                    return [{key: 'auto_managed', before: false, after: true}]
                }
                let result = []
                Object.keys(a).forEach(key => {
                    if (a[key] !== b[key]) {
                        result.push({ key, before: a[key], after: b[key] })
                    }
                })
                return result
            },
        },
        computed: {
            campaignId() {
                return this.$store.state.plan.campaignId
            },
            campaignOption() {
                return this.$store.state.plan.campaignOption
            }
        },
        filters: {
            renderDate(val) {
                return formatDate(val, 'yyyymmdd:hhmmss')
            }
        },
        components: {
            dateTimePicker,
        }
    }
</script>

<style lang="less">
.operation_log {
    .filters {
        margin-bottom: 10px;
        .el-select {
            width: 150px;
        }
    }
    .detail-dialog {
        width: 800px;
        .info {
            i {
                color: #999;
            }
        }
    }
}
</style>