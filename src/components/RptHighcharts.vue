<template>
    <div id="index_rpt">
        <el-tabs class="index-tab-card" v-model="activeName" type="card" @tab-click="changeRptType" show-header=false>
            <el-tab-pane v-for="item in TAB_PANE_SETTING" :key="item.name" :label="item.title" :name="item.name">
            </el-tab-pane>
        </el-tabs>
        <div v-loading="loading" element-loading-text="数据加载中">
            <div class="sumRpt">
                <el-table :data="[1]" :show-header="false" style="width: 100%">
                    <el-table-column v-for="rpt_type in INDEX_RPT_SETTING" :key="rpt_type" :class="rpt_type">
                        <template scope="scope">
                            <div :class="ACTIVE_CURRENT_TYPE === rpt_type ? 'currentType' : ''"  @click="changeRptItemType(rpt_type)">
                                <p class="rptTypeTitle">{{FEILDTITLE[rpt_type]}}{{rpt_type === 'charge' || rpt_type === 'ecpm' || rpt_type === 'ecpc' ? '（元）' : rpt_type === 'ctr' ? '（%）' : ''}}</p>
                                <p class="rptToday">{{(data[activeName] ? data[activeName].sum_data[rpt_type].today : 0)}}</p>
                                <p class="rptYestoday">{{(data[activeName] ? data[activeName].sum_data[rpt_type].yestoday : 0)}}</p>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="highchart-wrap"></div>
        </div>
    </div>
</template>

<script>
    import './RptHighcharts.less'
    import {INDEX_RPT_SETTING, FEILDTITLE} from '@/config'
    import {commafy} from '@/assets/js/base'
    import Highcharts from 'highcharts'
    const TAB_PANE_SETTING = [{
        title:'全店',
        name:"first"
    // }, {
    //     title:'PC焦点',
    //     name:"second"
    // }, {
    //     title:'移动首焦',
    //     name:"third"
    }]
    const COLORS = ['#94adf7','#97df97','#dda6fe']
    const TIME_SETTING = {
        days_ago_7:{
            title:'过去7日平均',
            index:2,
        },
        yestoday:{
            title:'昨日实时',
            index:1,
        },
        today:{
            title:'今日实时',
            index:0,
        }
    }
    export default {
        data () {
            return {
                loading:false,
                FEILDTITLE:FEILDTITLE,
                INDEX_RPT_SETTING:INDEX_RPT_SETTING,
                TAB_PANE_SETTING:TAB_PANE_SETTING,
                activeName:TAB_PANE_SETTING[0].name,
                data:{},
                ACTIVE_CURRENT_TYPE:INDEX_RPT_SETTING[0],
            }
        },
        methods: {
            getData(temp_activeName){
                let url, post_data = {},sum_data={}
                //let temp_activeName = this.activeName
                if(temp_activeName === 'first'){
                    url = 'ajax_get_index_account_rt'
                } else {
                    url = 'ajax_get_index_adzone_rt'
                    Object.assign(post_data, {adzone:temp_activeName === 'second' ? 'pc_main' : 'wx_main'})
                }
                this.$set(this,'loading',true)
                this.$http.post(url, post_data).then((res) => {
                    this.$set(this,'loading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(!Object.keys(data).length){
                        for(let rpt_type  of INDEX_RPT_SETTING){
                            data[rpt_type] = {}
                            for(let time in TIME_SETTING){
                                data[rpt_type][time] = Array(24).fill(0)
                            }
                        }
                    }
                    for(let rpt_key in data){//等于INDEX_RPT_SETTING
                        if(rpt_key !== 'date_list'){
                            sum_data[rpt_key] = {}
                            let rpt_keys = Object.keys(data[rpt_key])//['days_ago_7','yestoday', 'today']
                            for(let time_key of rpt_keys){
                                if(time_key !== 'days_ago_7'){
                                    sum_data[rpt_key][time_key] = 0
                                    for(let data_item of data[rpt_key][time_key]){
                                        sum_data[rpt_key][time_key] += (data_item - 0)
                                    }
                                }
                            }
                        }
                    }
                    sum_data['ecpc']['yestoday'] = sum_data['click']['yestoday'] ? sum_data['charge']['yestoday'] / sum_data['click']['yestoday'] : 0
                    sum_data['ecpc']['today'] = sum_data['click']['today'] ? sum_data['charge']['today'] / sum_data['click']['today'] : 0
                    sum_data['ctr']['yestoday'] = sum_data['ad_pv']['yestoday'] ? sum_data['click']['yestoday'] / sum_data['ad_pv']['yestoday'] * 100 : 0
                    sum_data['ctr']['today'] = sum_data['ad_pv']['today'] ? sum_data['click']['today'] / sum_data['ad_pv']['today'] * 100 : 0
                    sum_data['ecpm']['yestoday'] = sum_data['ad_pv']['yestoday'] ? sum_data['charge']['yestoday'] / sum_data['ad_pv']['yestoday'] * 1000 : 0
                    sum_data['ecpm']['today'] = sum_data['ad_pv']['today'] ? sum_data['charge']['today'] / sum_data['ad_pv']['today'] * 1000 : 0

                    for(let rpt_type in sum_data){
                        for(let time_key in sum_data[rpt_type]){
                            sum_data[rpt_type][time_key] = commafy(sum_data[rpt_type][time_key],rpt_type)
                        }
                    }
                    let highcharts_data = Object.assign({}, data)
                    for(let rpt_key in data) {
                        if(rpt_key === 'ecpm' || rpt_key === 'charge' || rpt_key === 'ecpc'){
                            let rpt_keys = Object.keys(data[rpt_key])//['days_ago_7','yestoday', 'today']
                            for(let time_key of rpt_keys){
                                for(let [index, data_item] of data[rpt_key][time_key].entries()){
                                    data[rpt_key][time_key].splice(index, 1,Math.round(data_item) / 100)
                                }
                            }
                        }
                    }
                    this.$set(this.data, temp_activeName, {
                        sum_data:sum_data,
                        highcharts_data:highcharts_data,
                        CURRENT_TYPE:INDEX_RPT_SETTING[0],
                    })
                    this.ACTIVE_CURRENT_TYPE = this.data[temp_activeName].CURRENT_TYPE
                    //绘制图表
                    if(this.activeName === temp_activeName){
                        this.insertHighchart()
                    }
                })
            },
            changeRptType(tab, event) {
                //获取数据
                if(!this.data[this.activeName]){
                    this.getData(this.activeName)
                } else {
                    this.$set(this,'loading',false)
                    this.ACTIVE_CURRENT_TYPE = this.data[this.activeName].CURRENT_TYPE
                    //绘制图表
                    this.insertHighchart()
                }
            },
            changeRptItemType(rpt_type){
                this.data[this.activeName].CURRENT_TYPE = rpt_type
                this.ACTIVE_CURRENT_TYPE = rpt_type
                //之后开始绘制表格
                this.insertHighchart()
            },
            insertHighchart(){
                let rpt_type = this.data[this.activeName].CURRENT_TYPE
                let container = document.querySelector('.highchart-wrap')
                let highcharts_data = this.data[this.activeName].highcharts_data
                let seriesData = highcharts_data[rpt_type], xDate = highcharts_data.date_list
                let seriesArr = [], i = 0;
                let types = rpt_type === 'ecpc' ? ['spline', 'spline', 'spline'] : ['areaspline', 'areaspline', 'areaspline']
                for(var key in seriesData) {
                    var options = {
                        key:key,
                        name: TIME_SETTING[key].title,
                        color: COLORS[TIME_SETTING[key].index],
                        type: types[i],
                        data:seriesData[key],
                        i:i
                    }
                    seriesArr.push(options)
                    options.type === 'areaspline' && Object.assign(seriesArr[i], {fillOpacity:0.1})
                    i++
                }
                //排序当日数据排前面
                seriesArr.sort(function(a, b){
                    return TIME_SETTING[a.key].index - TIME_SETTING[b.key].index
                })
                if(!container){
                    return false
                }
                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: container,
                        height: 330,
                    },
                    title: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis:{
                        categories:xDate
                    },
                    yAxis:{
                        title:''
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
                            var data_html = this.x + '点：<br/>'
                            for(var i = 0; i < this.points.length; i++){
                                data_html += ('<span style="color:' + this.points[i].series.color + '">'  + this.points[i].series.name + ' ：' + (rpt_type === 'charge' || rpt_type === 'ecpm' || rpt_type === 'ecpc' ? '¥' : '') + Math.round(this.points[i].y * 100) / 100 + (rpt_type === 'ctr' ? '%' : '') + '</span><br/>');
                            }
                            return data_html;
                        }
                    },
                    plotOptions: {
                        series: {
                            connectNulls:true//断点续连
                        },
                        lineWidth: 4,
                        states: {
                            hover: {
                                lineWidth: 5
                            }
                        },
                    },
                    legend: {
                        padding:10,
                        align: 'left',
                        verticalAlign: 'top',
                        //floating: true,//图表可与图例重合
                        x: 60,
                        symbolHeight: 10,
                        symbolWidth: 10
                    },
                    series: seriesArr
                });
            },
        },
        mounted(){
           this.changeRptType()
        }
    }
</script>
