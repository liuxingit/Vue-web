<template>
    <div class="shop-analysis-detail">
        <div class="panel">
            <div class="title"><i class="iconfont">&#xe639;</i>数据趋势</div>
            <div class="content">
                <div id="chart" style="min-width:800px;width: 100%;height:360px"></div>
            </div>
        </div>
        <div class="panel">
            <div class="title"><i class="iconfont">&#xe681;</i>流量去向解析</div>
            <div class="content clearfix">
                <div class="table pullLeft">
                    <paginate-table :data-list="detailFlow" :paginate-user-option="{total: detailFlow.length}" border style="width: 100%">
                        <paginate-table-column prop="index" label="编号" width="70" header-align="center" align="center"></paginate-table-column>
                        <paginate-table-column label="链接类型" align="center">
                            <template scope="e">{{e.row.url_type | turnType}}</template>
                        </paginate-table-column>
                        <paginate-table-column label="链接名称" min-width="200">
                            <template scope="e">
                               <a :href="e.row.access_url" target="_blank" :title="e.row.url_title ? '点击进入' : e.row.access_url">{{e.row.url_title || '点击进入'}}</a>
                            </template>
                        </paginate-table-column>
                        <paginate-table-column prop="pv" label="流量" align="center" sortable></paginate-table-column>
                    </paginate-table>
                </div>
                <div class="pullRight" style="width:40%">
                    <div id="pie" class="pie" ref="pie" style="width:100%;min-height:330px;min-width:260px"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    import Highcharts from 'highcharts';
    import {formatDate, getDefineDay} from '@/assets/js/base'
    export default {
        components: {
            paginateTable,
            paginateTableColumn
        },
        data() {
            return {
                seriesData: [],
                detailFlow: [],
            }
        },
        created() {
            this.seriesData = JSON.parse(sessionStorage.getItem('analysisDetailChart'))
            this.detailFlow = JSON.parse(sessionStorage.getItem('analysisDetailTable'))
            .map((d, i) => Object.assign(d, {index: i + 1}))
        },
        mounted() {
            let xDate = new Array(this.seriesData[0].data.length).fill(1)
            xDate = xDate.map((m, i) => formatDate(getDefineDay(i - xDate.length), '', 1))
            this.initChart('chart', xDate, this.seriesData)
            this.initPieChart('pie', this.detailFlow.map((item, index) => [item.url_title || '编号' + (index+1), item.pv]))
        },
        methods: {
            initChart(id, xDate, seriesData) {
                const turnName = function(name) {
                    switch(name) {
                        case 'uv':
                        return 'uv';
                        case 'bounce':
                        return '跳失率';
                        case 'duration':
                        return '访问时长';
                    }
                }
                const option = {
                    title: {text: null},
                    legend: {
                        padding: 10,
                        labelFormatter() {
                            return turnName(this.name)
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
                            data_html = this.x + '：<br/>'
                            for(var i = 0; i < this.points.length; i++){
                                if (this.points[i].series.name === 'bounce') {
                                    this.points[i].y = this.points[i].y * 100 + '%'
                                } else if (this.points[i].series.name === 'duration') {
                                    this.points[i].y = this.points[i].y + 's'
                                }
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
                }
                const chart = new Highcharts.chart(id,
                    Object.assign({}, option, {
                        xAxis: { categories: xDate },
                        series: seriesData
                    }),
                )
            },
            initPieChart(id, seriesData) {
                new Highcharts.chart(id, {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false
                        },
                        colors: ['#d2efff', '#b0e0fd', '#b0f7ec', '#81f3e1', '#62e4f0', '#74d4f4', '#a1c3e5', '#35bde7', '#49d5e1', '#17becd', '#1b99da', '#027ad6'],
                        title: {text: null},
                        credits: {enabled: false},
                        tooltip: {
                            headerFormat: '{series.name}<br>',
                            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    formatter: function() {
                                        return this.point.name.length > 5 ? this.point.name.substr(0, 5) + '...' : this.point.name
                                    }
                                }
                                
                            }
                        },
                        series: [{
                            type: 'pie',
                            name: '流量占比',
                            data: seriesData
                        }]
                    }
                )
            }
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
    }
</script>

<style lang="less">
    .shop-analysis-detail {
        .panel {
            padding: 0 20px 10px;
            background-color: #fff;
            margin-bottom: 20px;
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
            .content {
                .table {
                    width: 59%;
                }
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