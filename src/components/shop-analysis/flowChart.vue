<template>
    <div class="flow-chart">
        <div class="title"><i class="iconfont">&#xe639;</i>整店流量趋势</div>
        <template v-if="!noData">
            <div id="chart" v-loading="loading" element-loading-text="图表加载中" style="min-width:800px;width: 100%;height:360px"></div>
        </template>
        <div v-else class="textCenter">
            暂无数据
        </div>
    </div>
</template>

<script>
import Highcharts from 'highcharts';
import {formatDate} from '@/assets/js/base'
export default {
    name: 'flowChart',
    data() {
        return {
            option: {
                title: {text: null},
                legend: {
                    padding: 10,
                    labelFormatter() {
                    switch(this.name) {
                            case 'shop_uv':
                            return '整店流量';
                            case 'zz_uv':
                            return '钻展流量';
                            case 'brand_uv':
                            return '品牌搜索流量';
                            case 'nature_uv':
                            return '自然搜索流量';
                        }
                    }
                },
                tooltip: {
                    crosshairs: true,
                    shared: true,
                    style: {
                        color: '#fff',
                        padding: '8px',
                        opacity:0.9,
                    },
                    backgroundColor:'#5e5b53',
                    borderColor:'#5e5b53',
                    borderRadius: 3,
                    formatter: function(a) {
                        let tip
                        let data_html
                        function turnName(name) {
                            switch(name) {
                                case 'shop_uv':
                                return '整店流量';
                                case 'zz_uv':
                                return '钻展流量';
                                case 'brand_uv':
                                return '品牌搜索流量';
                                case 'nature_uv':
                                return '自然搜索流量';
                            }
                        }
                        data_html = this.x + '：<br/>'
                        for(var i = 0; i < this.points.length; i++){
                            data_html += ('<span style="color:' + this.points[i].series.color + '">'  + turnName(this.points[i].series.name) + ' ：' + this.points[i].y + '</span><br/>');
                        }
                        return data_html;
                    }
                },
                chart: {
                    type: 'line',
                    height: 360,
                    colorCount: 4,
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                colors: ['#888efa','#e9c01a', '#ed551a', '#78c57b','#1cd3c8','#aeca2b', '#f5278e','#d1c0ab', "#f96307","#df7fd7","#f87f49","#458ae6"],
                credits: {enabled: false},
                xAxis: {
                    categories: [],
                },
                yAxis: {
                    title: {text: null}
                },
                series: [],
                plotOptions: {
                    series: {
                        connectNulls:true, //断点续连
                        events: {
                            legendItemClick: function(e) {
                                if(!e.target.visible){
                                    e.target.show()
                                    return false
                                }
                                if (this.chart.series.map(i => i.visible).filter(i => i === true).length === 1) {
                                    return false
                                }
                            }
                        }
                    },
                },
            },
            seriesData: [],
            loading: true,
            noData: false,
        }
    },
    mounted() {
        this.$http.post('/traffic_analysis/ajax_get_shop_traffic_trend', {})
            .then(res => {
                if (!res.success) return false
                const data = res.data
                const dateArr = Object.keys(data).sort()
                if (!dateArr.length) {
                    this.loading = false
                    this.noData = true
                    return false
                }
                Object.keys(data[dateArr[0]]).forEach(key => {
                    this.seriesData.push({ name: key, data: [] })
                })
                // Todo 
                for (var day of dateArr) {  // 
                    for (var key in data[day]) {
                        for (var item of this.seriesData) {
                            if (key === item.name) {
                                item.data.push(data[day][key])
                            }
                        }
                    }
                }
                const xDate = dateArr.map(i => formatDate(+i, undefined, true))
                this.initChart('chart', xDate, this.seriesData)
                this.loading = false
            })
    },
    methods: {
        initChart(id, xDate, seriesData) {
            const chart = new Highcharts.Chart(id,
                Object.assign({}, this.option, {
                    xAxis: { categories: xDate },
                    series: seriesData
                }),
                
            )
        },
    },
}
</script>

<style lang="less">
    .flow-chart {
        background-color: #fff;
        padding: 20px;
    }
</style> 