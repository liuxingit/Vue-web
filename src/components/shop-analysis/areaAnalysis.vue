<template>
    <div class="area-analysis clearfix">
        <div class="title">
            <i class="iconfont">&#xe644;</i>
            整店地域分析
            <span class="prompt">不同地域转化数据-站内</span>
        </div>
        <div class="map pullLeft" ref="map">
            <el-select v-model="latitudeSelected">
                <el-option v-for="item in latitudeList" :key="item.val" :value="item.val" :label="item.name"></el-option>
            </el-select>
            <div class="china-map" ref="cmap"></div>
        </div>
        <div class="table pullRight">
            <paginate-table :data-list="tableData" :paginate-user-option="{total: tableData.length}" border style="width: 100%">
                <paginate-table-column prop="area" label="地区"></paginate-table-column>
                <paginate-table-column prop="pv" label="pv" sortable></paginate-table-column>
                <paginate-table-column prop="uv" label="uv" sortable></paginate-table-column>
                <paginate-table-column prop="alipay_trade_amt" label="订单金额" sortable></paginate-table-column>
                <paginate-table-column prop="alipay_trade_num" label="订单数" sortable></paginate-table-column>
            </paginate-table>
        </div>
    </div>
</template>

<script>
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    import echarts from 'echarts/lib/echarts'
    require('echarts/map/js/china')
    require('echarts/lib/chart/map')
    export default {
        data() {
            return {
                latitudeSelected: 'pv',
                latitudeList: [
                    { name: 'PV', val: 'pv' },
                    { name: 'UV', val: 'uv' },
                    { name: '订单金额', val: 'alipay_trade_amt' },
                    { name: '订单数', val: 'alipay_trade_num'}
                ],
                mapData: {},
                mapDataMax: {},
                tableData: [],
            }
        },
        mounted() {
            // getBoundingClientRect() 方法返回元素的大小及其相对于视口的位置
            this.$refs.cmap.style.height = this.$refs.map.getBoundingClientRect().width * 0.75 + 'px'
            this.$http.post('/traffic_analysis/ajax_get_shop_area_trend', {})
            .then(res => {
                if (!res.success) return
                let data = res.data
                if (!Object.keys(data)[0]) {
                    this.noDataMap()
                    return;
                }
                const dataKey = Object.keys(data)
                let max = {}
                // 取出4个维度
                dataKey.some((key, index) => {
                    if (index > 1) return true
                    for (let i in data[key]) {
                        this.mapData[i] = [{name: '南海诸岛',value: 0}, {name: '台湾', value: 0}]
                        max[i] = 0
                    }
                })
                // 转换维度
                dataKey.forEach(key => {
                    for (let i in data[key]) {
                        if (i === 'alipay_trade_amt') {
                            data[key][i] = +(+data[key][i]).toFixed(2)
                        }
                        this.mapData[i].push({name: key.replace('中国-', ''), value: data[key][i]})
                        if (data[key][i] > max[i]) {
                            max[i] = data[key][i]
                            this.mapDataMax[i] = max[i]
                        }
                    }
                })
                this.tableData = dataKey.map(key => {
                    return Object.assign({}, data[key], {area: key.replace('中国-', '')})
                })
                
                this.tableData.forEach(item => {
                    // console.log(item.alipay_trade_amt)
                    item.alipay_trade_amt = (+item.alipay_trade_amt).toFixed(2)
                })

                this.initMap()
            })
        },
        watch: {
            latitudeSelected() {
                if (!this.tableData[0]) return;
                this.updateMap()
            }
        },
        methods: {
            noDataMap() {
                const container = document.querySelector('.china-map')
                const option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}: <small>暂无数据</small>'
                    },
                    series: [
                        {
                            name: '中国',
                            type: 'map',
                            mapType: 'china',
                            label: {
                                normal: {
                                    show: true,
                                },
                            },
                            itemStyle: {
                                emphasis: {
                                    show: true,
                                    areaColor: '#569DFF'
                                },
                            }
                        }
                    ]
                };
                const emptyChart = echarts.init(container);
                emptyChart.setOption(option);
            },
            initMap() {
                const container = document.querySelector('.china-map')
                const option = {
                    tooltip : {
                        trigger: 'item',
                        formatter: '{b}: {c}'
                    },
                     visualMap: {
                        min: 0,
                        max: this.mapDataMax[this.latitudeSelected],
                        left: 'left',
                        top: 'bottom',
                        precision: 0,
                        inRange: {
                            color: ['#e0ffff', '#006edd']
                        },
                        calculable : true
                    },
                    series : [
                        {
                            name: '中国',
                            type: 'map',
                            mapType: 'china',
                            itemStyle:{
                                normal:{
                                    label:{show:true},
                                },
                                emphasis:{
                                    label:{show:true},
                                    areaColor: '#569DFF'
                                }
                            },
                            top: 10,
                            left: 50,
                            right: 0,
                            data: this.mapData[this.latitudeSelected]
                        }
                    ]
                };
                this.chinaMap = echarts.init(container)
                this.chinaMap.setOption(option)
            },
            updateMap() {
                const visualMap = { max: this.mapDataMax[this.latitudeSelected] }
                if (this.latitudeSelected === 'alipay_trade_amt') { visualMap.precision = 2 }
                this.chinaMap.setOption({
                    visualMap,
                    series: [{ data: this.mapData[this.latitudeSelected] }]
                })
            }
        },
        components: {
            paginateTable,
            paginateTableColumn
        }
    }
</script>

<style lang="less">
    .area-analysis {
        min-height: 560px;
        background-color: #fff;
        margin-top: 20px;
        .map {
            width: 40%;
            .china-map {
                width: 100%;
            }
        }
        .table {
            width: 58%;
        }
    }
</style>