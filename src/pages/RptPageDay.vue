<template>
    <div id="rpt_container_day" v-loading="loading" element-loading-text="加载中，请稍候...">
        <div v-title>分日报表</div>
        <el-tabs class="compareTab" v-model="activeName" @tab-click="handleTabChange">
            <el-tab-pane label="分日" name="day">
                <div class="tab-content">
                    <div class="topWrap">
                        <el-table :data="[{}]" :show-header="false" style="width: 100%" class="keyTable" @cell-click="changeKeys">
                            <el-table-column width="240" fixed>
                                <template scope="scope">
                                    <el-date-picker
                                        :clearable="false"
                                        :editable="false"
                                        type="daterange"
                                        align="right"
                                        popper-class="rptDatePicker"
                                        v-model="date_day"
                                        :picker-options="pickerOptions"
                                        @change="dateChange"
                                        placeholder="选择日期范围">
                                    </el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column v-for="(rpt_type, index) of show_columns_day" :key="index" min-width="160" :show-overflow-tooltip="true">
                                <template scope="scope">
                                    <div class="cellWrap" :class="current_keys_day.includes(show_columns_day[index]) ? 'active' : ''">
                                        <p class="key" :data-key="show_columns_day[index]">{{FEILDTITLE[show_columns_day[index]]}}</p>
                                        <p class="keyValue">{{formatData(sumData_day[show_columns_day[index]], show_columns_day[index])}}</p>
                                        <div class="split"></div>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- <el-table-column fixed="right" width="156">
                                <template scope="scope">
                                    <more-data type="allRpt"></more-data>
                                </template>
                            </el-table-column> -->
                        </el-table>
                        <more-data type="allRpt"></more-data>
                    </div>
                    <div id="chart_day" style="min-width:800px;width: 100%;height:400px"></div>
                    <div class="split"></div>
                    <div class="tableContainer">
                        <div class="titleWrap"><span>{{title}}</span> &gt;&gt; 分日数据</div>
                        <el-table ref="multiTable" :data="tableData_day" border style="width: 100%" class="dataTable">
                            <el-table-column fixed prop="date_str" label="日期" width="230"></el-table-column>
                            <el-table-column  align="right" :prop="show_columns_day[index]" v-for="(rpt_type, index) of show_columns_day" :key="index" :label="FEILDTITLE[show_columns_day[index]]" sortable min-width="160">
                                <template scope="scope">
                                    <span>{{formatData(scope.row[show_columns_day[index]], show_columns_day[index])}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="分时" name="time">
                <div class="tab-content timeWrap">
                    <div class="topWrap">
                        <el-table :data="[{}]" :show-header="false" style="width: 100%" class="keyTable" @cell-click="changeKeys">
                            <el-table-column width="240">
                                <template scope="scope">
                                    <el-date-picker
                                        :clearable="false"
                                        :editable="false"
                                        type="daterange"
                                        align="right"
                                        popper-class="rptDatePicker"
                                        v-model="date_time"
                                        :picker-options="pickerOptions_time"
                                        @change="dateChange"
                                        placeholder="选择日期范围">
                                    </el-date-picker>
                                </template>
                            </el-table-column>
                            <el-table-column v-for="(rpt_type, index) of show_columns_time" :key="index" min-width="160" :show-overflow-tooltip="true">
                                <template scope="scope">
                                    <div class="cellWrap" :class="current_keys_time.includes(show_columns_time[index]) ? 'active' : ''">
                                        <p class="key" :data-key="show_columns_time[index]">{{FEILDTITLE[show_columns_time[index]]}}</p>
                                        <p class="keyValue">{{formatData(sumData_time[show_columns_time[index]], show_columns_time[index])}}</p>
                                        <div class="split"></div>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- <more-data type="allRpt"></more-data> -->
                    </div>
                    <div id="chart_time" style="min-width:800px;width: 100%;height:400px"></div>
                    <div class="split"></div>
                    <div class="tableContainer">
                        <div class="titleWrap"><span>{{title}}</span> &gt;&gt; 分时数据</div>
                        <el-table ref="timeTable" :data="tableData_time" border style="width: 100%" class="dataTable">
                            <el-table-column label="时间">
                                <template scope="scope">
                                    <span>{{scope.row.hour_id+':00'}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column  align="right" :prop="show_columns_time[index]" v-for="(rpt_type, index) of show_columns_time" :key="index" :label="FEILDTITLE[show_columns_time[index]]" sortable min-width="160">
                                <template scope="scope">
                                    <span>{{formatData(scope.row[show_columns_time[index]], show_columns_time[index])}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import Highcharts from 'highcharts';
    import moment from 'moment';
    import Qs from 'qs';
    import {FEILDTITLE, DEFAULT_VALUE} from '@/config';
    import {commafy, formatDate, price_arr, pickerOptions} from '@/assets/js/base';
    import './RptPageDay.less';
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')

    let queryStr = Qs.parse(location.search.substr(1));

    export default {
        name: 'rpt_day',
        data () {
            return {
                title: '报表',
                type: queryStr.type ? queryStr.type : 'account',
                activeName: queryStr.active ? queryStr.active : 'day',//// day | time
                current_keys_day: ['ad_pv','click','ctr'],
                current_keys_time: localStorage.current_keys_time ? localStorage.current_keys_time.split(',') : ['ad_pv','click','ctr'],
                FEILDTITLE: FEILDTITLE,
                options: {
                    chart: {
                        type: 'line',
                        height: 400,
                        colorCount: 12,
                        marginBottom: 90,
                    },
                    colors: ['#888efa','#e9c01a', '#ed551a', '#78c57b','#1cd3c8','#aeca2b', '#f5278e','#d1c0ab', "#f96307","#df7fd7","#f87f49","#458ae6"],
                    credits: {enabled: false},
                    title: {text: null},
                    xAxis: {categories: []},
                    yAxis: {
                        title: {text: null}
                    },
                    series: [],
                    plotOptions: {
                         series: {
                            connectNulls:true//断点续连
                        },
                    },
                },
                // show_columns_day: localStorage.rpt_columns ? localStorage.rpt_columns.split(',') : RPT_COLUMNS,
                show_columns_time: ['ad_pv','click','ctr','ecpc','ecpm','charge'],
                sumData_day: Object.assign({}, DEFAULT_VALUE),
                sumData_time: {'ad_pv':0,'click':0,'ctr':0,'ecpc':0,'ecpm':0,'charge':0},
                tableData_day: [],
                tableData_time: [],
                range_day: 7,
                range_time: 7,
                xDates_day: [],
                xDates_time: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
                campaign_id: queryStr.campaign_id-0,
                adgroup_id: queryStr.adgroup_id-0,
                creative_id: queryStr.creative_id-0,
                target_id: queryStr.target_id-0,
                adzone_id: queryStr.adzone_id-0,
                date_day: [],
                date_time: [],
                got: {day: false, time: false},
                urls: {
                    account: {
                        day: '/ajax_get_account_day_rpts',
                        time: '/ajax_get_account_rt_rpts',
                    },
                    campaign: {
                        day: '/ajax_get_campaign_day_rpts',
                        time: '/ajax_get_campaign_rt_rpts',
                    },
                    adgroup: {
                        day: '/ajax_get_adgroup_day_rpts',
                        time: '/ajax_get_adgroup_rt_rpts',
                    },
                    creative: {
                        day: '/ajax_get_creative_day_rpts',
                        time: '/ajax_get_creative_rt_rpts',
                    },
                    adzone: {
                        day: '/ajax_get_adzone_day_rpts',
                        time: '/ajax_get_adzone_rt_rpts',
                    },
                    target: {
                        day: '/ajax_get_target_day_rpts',
                        time: '/ajax_get_target_rt_rpts',
                    },
                    cross: {
                        day: '/ajax_get_target_adzone_day_rpts',
                        time: '/ajax_get_target_adzone_rt_rpts',
                    }
                },
                params_day: {
                    start_date: '',
                    end_date: '',
                    return_key_value: false
                },
                params_ids: {},
                params_time: {
                    start_date: '',
                    end_date: '',
                },
                pickerOptions: pickerOptions(91),
                pickerOptions_time: pickerOptions(31),
                timeChartData: {
                    yestoday: [],
                    compare: [],
                },
                loading: true,
                yestoday: 0,
                isFirst: true,
                //shopInfo: {},
            }
        },
        computed:{
            show_columns_day(){
                return this.$store.state.plan.RPT_COLUMNS
            }
        },
        watch:{
            show_columns_day(){
                if(!this.isFirst){
                    this.getCurrentKeys(true);
                }
                this.isFirst = false;
            }
        },
        //components: {MoreData},
        created () {
            this.getCurrentKeys();
            //this.$set(this, 'shopInfo', this.$store.state.plan.shopInfo);
            //date start
            let s_date = moment(this.getCurrentDate()).subtract(7, 'days').format("YYYY-MM-DD");
            let e_date = moment(this.getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD");
            this.$set(this, 'yestoday', e_date);
            this.$set(this, 'date_time', [s_date, e_date]);
            this.$set(this, 'params_time', {start_date:s_date, end_date: e_date});

            if(this.activeName === 'day'){
                if(localStorage.ops_date && localStorage.ops_date === moment(this.getCurrentDate()).format("YYYY-MM-DD")){
                    s_date = localStorage.s_date ? localStorage.s_date : s_date;
                    e_date = localStorage.e_date ? localStorage.e_date : e_date;
                }else{
                    localStorage.setItem('ops_date', moment(this.getCurrentDate()).format("YYYY-MM-DD"));
                    localStorage.setItem('s_date', s_date);
                    localStorage.setItem('e_date', e_date);
                }
            }
            //date end
            this.$set(this, 'date_day', [s_date, e_date]);
            this.$set(this, 'range_day', moment(e_date).diff(moment(s_date), 'days') + 1);
            this.$set(this, 'params_day', {start_date:s_date, end_date: e_date, return_key_value: false});

            //拼接参数
            var params_ids = Object.assign({}, this.params_ids);
            if(this.type !== 'account'){
                params_ids.campaign_id = this.campaign_id;
                if(['creative','adzone','target', 'cross'].includes(this.type)){
                    Object.assign(params_ids, {
                        campaign_id: this.campaign_id,
                        adgroup_id: this.adgroup_id,
                        [this.type+'_id']: this[this.type+'_id'],
                    });
                    if(this.type === 'cross'){
                        Object.assign(params_ids, {
                            target_id: this.target_id,
                            adzone_id: this.adzone_id,
                        });
                    }else{
                        params_ids[this.type+'_id'] = this[this.type+'_id'];
                    }
                }else if(this.type === 'adgroup'){
                    params_ids.adgroup_id = this.adgroup_id;
                }
            }

            this.params_ids = params_ids;

            this.getData();

            window._hmt.push(['_trackEvent', 'pages_rpt_day', 'click']);
        },
        methods: {
            getCurrentKeys(flag){
                var list = this.$store.state.plan.RPT_COLUMNS;
                console.log(list, localStorage.current_keys,'--------------')
                var current_keys = [];
                if(localStorage.current_keys){
                    let arr = localStorage.current_keys.split(',');
                    arr.map((v, i) => {
                        if(list.includes(v)){
                            current_keys.push(v);
                        }
                    });
                }
                if(!current_keys.length){
                    current_keys.push(list[0]);
                    if(list[1]){
                        current_keys.push(list[1]);
                    }
                    if(list[2]){
                        current_keys.push(list[2]);
                    }
                }
                console.log(current_keys, '---------====')
                localStorage.current_keys = current_keys;
                this.$set(this, 'current_keys_day', current_keys);
                if(flag){
                    this.handleChart_day();
                }
            },
            getCurrentDate(){
                if(this.$store.state.plan.shopInfo && this.$store.state.plan.shopInfo.current_time && this.$store.state.plan.shopInfo.current_time.$date){
                    return new Date(this.$store.state.plan.shopInfo.current_time.$date - 8*3600000);
                }
                return new Date();
            },
            handleTabChange(tab, e){
                this.$set(this, 'activeName', tab.$props.name);
                if(!this.got[this.activeName]){
                    this.getData();
                }
            },
            getData(){
                //获取昨日分时数据
                if(this.activeName === 'time' && !this.timeChartData.yestoday.length){
                    this.getYestodayTime();
                }
                let that = this, params = Object.assign({}, this.params_ids, this['params_'+this.activeName]);

                //this.loading = Loading.service({text: '正在加载，请稍候...'});
                this.$set(this, 'loading', true);
                this.$http.post(this.urls[this.type][this.activeName], params).then(res => {
                    if(!res.success){
                        that.$set(that, 'loading', false);
                        return false;
                    }
                    let data = res.data;
                    if(!data.length){//数据补零
                        data = [];
                        if(that.activeName === 'day'){
                            for(let i=0;i<that.range_day;i++){
                                data.push(Object.assign({
                                    log_date: {
                                        $date: moment(that.params_day.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                    },
                                    campaign_name: '',
                                    adgroup_name: '',
                                    adzone_name: '',
                                    target_name: '',
                                    creative_name: '',
                                }, DEFAULT_VALUE));
                            }
                        }else{
                            that.xDates_time.map(val => {
                                data.push(Object.assign({
                                    log_date: {
                                        $date: moment(that.yestoday+' '+val+':00:00').toDate().getTime()
                                    },
                                    hour_id: val,
                                    campaign_name: '',
                                    adgroup_name: '',
                                    adzone_name: '',
                                    target_name: '',
                                    creative_name: '',
                                }, DEFAULT_VALUE));
                            });
                        }
                    }

                    if(that.activeName === 'day'){
                        data.sort((a, b) => {return b.log_date.$date - a.log_date.$date});
                    }else{
                        data.sort((a, b) => {return (a.hour_id-0) - (b.hour_id-0)});
                    }
                    let sum = Object.assign({}, DEFAULT_VALUE);
                    //计算汇总数据
                    data.forEach(function(v){
                        if(that.activeName === 'day'){
                            v.date_str = formatDate(v.log_date.$date);
                        }
                        for(let key in sum){
                            if(['avg_access_page_num', 'avg_access_time'].includes(key)){
                                sum[key] += v[key] * v.deep_inshop_uv;
                            }else{
                                sum[key] += v[key];
                            }
                        }
                    });
                    sum = this.needCompute(sum, that.activeName === 'time');
                    //title 需要在确认接口的返回 是否有这些那么  ？？？？？
                    if(that.activeName !== 'time' && that.type !== 'account'){
                        let str = data[0].campaign_name;
                        if(['target','adzone','creative', 'cross'].includes(that.type)){
                            str += ' >> ' + data[0].adgroup_name + ' >> ';
                            if(that.type === 'cross'){
                                str += data[0].adzone_name + ' >> ' + data[0].target_name;
                            }else{
                                str += data[0][that.type+'_name'];
                            }
                        }else if(that.type === 'adgroup'){
                            str += ' >> ' + data[0].adgroup_name;
                        }
                        that.$set(that, 'title', str);
                    }
                    that.$set(that, 'sumData_'+that.activeName, sum);
                    that.$set(that, 'tableData_'+that.activeName, data);
                    console.log(that.tableData_time,'tableData_day>>>>>>>>>>>>>>')
                    console.log(that.sumData_time,'sumData>>>>>>>>>>>>>>')

                    //图表
                    if(that.activeName === 'day'){
                        let xDate = [], seriesData = [], charData = [].concat(data);
                        that.current_keys_day.forEach(key => {
                            let obj = {
                                name: FEILDTITLE[key],
                                data: [],
                                marker:{
                                    enabled: false,
                                },
                            };
                            charData.sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                            charData.forEach(function(val, i){
                                obj.data.push(price_arr.includes(key) ? (val[key]/100).toFixed(2)-0 : val[key]);
                                if(!xDate[i]){
                                    xDate[i] = val.date_str;
                                }
                            });
                            seriesData.push(obj);
                        });
                        that.$set(that, 'xDates_day', xDate);
                        that.drawChart('chart_day', xDate, seriesData);
                    }else{
                        that.$set(that.timeChartData, 'compare', data);
                        that.handleChart_time();
                    }

                    that.got[that.activeName] = true;
                    that.loading = false;
                    //that.loading.close();
                });
            },
            getYestodayTime(){
                if(this.timeChartData.yestoday.length){
                    this.handleChart_time();
                }else{
                    let that = this, params = Object.assign({
                        start_date: this.yestoday,
                        end_date: this.yestoday,
                    }, this.params_ids);
                    this.$http.post(this.urls[this.type][this.activeName], params).then(res => {
                        if(!res.success){
                            that.$set(that, 'loading', false);
                            return false;
                        }
                        let data = res.data;
                        if(!data.length){
                            data = [];
                            that.xDates_time.map(val => {
                                data.push(Object.assign({
                                    log_date: {
                                        $date: moment(that.yestoday+' '+val+':00:00').toDate().getTime()
                                    },
                                    hour_id: val,
                                    campaign_name: '',
                                    adgroup_name: '',
                                    adzone_name: '',
                                    target_name: '',
                                    creative_name: '',
                                }, DEFAULT_VALUE));
                            });
                        }
                        data.sort((a, b) => {return (a.hour_id-0) - (b.hour_id-0)});
                        that.$set(that.timeChartData, 'yestoday', data);
                        that.handleChart_time();
                    });
                }
            },
            handleChart_time(){
                let seriesData = [], that = this;
                that.current_keys_time.forEach(key => {
                    for(let feild in that.timeChartData){
                        let obj = {
                            name: FEILDTITLE[key]+'-'+(feild === 'yestoday'?'昨日数据':'对比数据'),
                            data: [],
                            marker:{
                                enabled: false,
                            },
                        };
                        if(that.timeChartData[feild].length){
                            that.timeChartData[feild].forEach(val => {
                                obj.data.push(price_arr.includes(key) ? (val[key]/100).toFixed(2)-0 : val[key]);
                            });
                            seriesData.push(obj);
                        }
                    }
                });
                that.drawChart('chart_time', that.xDates_time, seriesData);
            },
            needCompute(sum_obj, is_time){
                //分时的时候，实时的数据有些不需要计算，到时候再加？？？
                //需要计算的数据
                sum_obj.ecpm = sum_obj.ad_pv ? (sum_obj.charge / sum_obj.ad_pv * 1000).toFixed(2)-0 : 0;
                sum_obj.ecpc = sum_obj.click ? (sum_obj.charge / sum_obj.click).toFixed(2)-0 : 0;
                sum_obj.ctr = sum_obj.ad_pv ? Math.round(sum_obj.click / sum_obj.ad_pv * 10000) / 100 : 0;
                if(!is_time){
                    sum_obj.cvr = sum_obj.click ? Math.round(sum_obj.alipay_in_shop_num / sum_obj.click * 10000) / 100 : 0;
                    sum_obj.roi = sum_obj.charge ? (sum_obj.alipay_inshop_amt / sum_obj.charge).toFixed(2)-0 : 0;
                    sum_obj.avg_access_page_num = sum_obj.deep_inshop_uv ? (sum_obj.avg_access_page_num / sum_obj.deep_inshop_uv).toFixed(2) - 0 : 0;
                    sum_obj.avg_access_time = sum_obj.deep_inshop_uv ? (sum_obj.avg_access_time / sum_obj.deep_inshop_uv).toFixed(2) - 0 : 0;
                }
                return sum_obj;
            },
            handleChart_day(){
                let seriesData = [], that = this, charData = [].concat(this.tableData_day);
                this.current_keys_day.forEach(function(v, i ,a){
                    let tmp = {
                        name: FEILDTITLE[v],
                        data: [],
                        marker:{
                            enabled: false,
                        },
                    };
                    charData.sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                    charData.forEach(function(val, index, arr){
                        tmp.data.push(price_arr.includes(v) ? (val[v]/100).toFixed(2)-0 : val[v]);
                    });
                    seriesData.push(tmp);
                });
                this.drawChart('chart_day', this.xDates_day, seriesData);
            },
            drawChart(id, xDate, seriesData){
                var that = this;
                var chart = new Highcharts.Chart(id, Object.assign({}, this.options, {
                    xAxis: {
                        categories: xDate,   //指定x轴分组
                        tickInterval : (function(){
                            var num = 1;
                            if(that.activeName === 'day'){
                                if(that.range_day <= 15){
                                    num = 1;
                                } else if(that.range_day > 15 && that.range_day <= 31) {
                                    num = 3;
                                }
                            }
                            return num;
                        })()
                    },
                    series: seriesData,
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
                            var data_html = this.x +(that.activeName === 'time' ? '点':'')+ '：<br/>';
                            for(var i = 0; i < this.points.length; i++){
                                data_html += ('<span style="color:' + this.points[i].series.color + '">'  + this.points[i].series.name + ' ：' + Math.round(this.points[i].y * 100) / 100 + '</span><br/>');
                            }
                            return data_html;
                        }
                    },
                }));
            },
            formatData(val, key) {
                return commafy(val, key);
            },
            dateChange(dateStr){
                let cur = this.activeName;
                //判断是否超过30天
                let date = dateStr.split(' - '), range = moment(date[1]).diff(moment(date[0]), 'days') + 1;
                if (range > 30){
                    this.$message({
                        showClose: true,
                        message: '时间范围不能超过30天哦',
                        type: 'error'
                     });
                    this.$set(this, 'date_'+cur, [this['params_'+cur].start_date, this['params_'+cur].end_date]);
                    return false;
                }
                if(date[0] === this['params_'+cur].start_date && date[1] === this['params_'+cur].end_date){//日期没变，不做处理
                    return false;
                }
                if(cur === 'day'){
                    localStorage.setItem('s_date', date[0]);
                    localStorage.setItem('e_date', date[1]);
                }
                //数据清空
                this.$set(this, 'tableData_'+cur, []);
                if(cur === 'day'){
                    this.$set(this, 'xDates_day', []);
                }
                var params = Object.assign({}, this['params_'+cur]);
                Object.assign(params, {
                    'start_date': date[0],
                    'end_date': date[1]
                });
                this.$set(this, 'params_'+cur, params);
                this.$set(this, 'range_'+cur, range);
                this.getData();
            },
            changeKeys(row, column, cell, event){
                if(!cell.querySelector('.key')){//点击更多数据和日期框
                    return false;
                }
                let type = cell.querySelector('.key').getAttribute('data-key'), arr = this['current_keys_'+this.activeName];
                if(cell.querySelector('.active')){//取消选中
                    if(arr.length > 1){
                        arr.splice(arr.findIndex(function(val, i){
                            return val === type;
                        }), 1);
                    }
                }else{//选中
                    if(arr.length >= 3){
                        arr.splice(0, 1);
                    }
                    arr.push(type);
                }
                this.$set(this, 'current_keys_'+this.activeName, arr);
                localStorage.setItem('current_keys'+(this.activeName==='day'?'':'_time'), arr);
                this['handleChart_'+this.activeName]();
            },
        },
        components:{
            MoreData: MoreData,
        }
    }
</script>

<style scoped>

</style>
