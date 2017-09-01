<template>
    <div id="rpt_combination" v-loading="loading" element-loading-text="加载中，请稍候...">
        <div v-if="has_account.length">
            <div class="tip1">
                <i class="iconfont">&#xe605;</i> 直通车店铺 {{has_account.join('、')}} 已经授权给您。您可以同时查看直通车账户和钻展账户的报表，我们也会根据直通车和钻展的投放情况给出预算分配建议。
            </div>
            <div class="tip2">
                <i class="iconfont">&#xe605;</i> 直钻结合预算分配建议更新了：{{suggests}}
                <el-button v-if="detail_status !== -1 && detail_status !== -2" @click="dialogVisible = true">查看详情</el-button>
                <el-dialog :title="'直钻结合预算分配建议（'+detail.update_time+'更新）'" class="bugetPop" v-model="dialogVisible">
                    <el-row :gutter="20">
                        <el-col :span="12"><div class="grid-content">
                            <el-row class="b12">
                                <el-col :span="8" class="bg-p"><div class="grid-content bg-purple">
                                    <p><i class="iconfont">&#xe61f;</i></p>
                                    <p>直通车账户</p>
                                </div></el-col>
                                <el-col :span="16"><div class="grid-content bg-purple-light">
                                    <p class="ml15" style="line-height:24px;margin-top:18px"><span class="num">{{detail.syb_cost}}</span><br>过去七天平均花费</p>
                                </div></el-col>
                            </el-row>
                        </div></el-col>
                        <el-col :span="12"><div class="grid-content">
                            <el-row class="b12">
                                <el-col :span="8" class="bg-p"><div class="grid-content bg-purple">
                                    <p><i class="iconfont">&#xe61f;</i></p>
                                    <p>钻展账户</p>
                                </div></el-col>
                                <el-col :span="16"><div class="grid-content bg-purple-light">
                                    <p class="ml15" style="line-height:24px;margin-top:18px"><span class="num">{{detail.zz_cost}}</span><br>过去七天平均花费</p>
                                </div></el-col>
                            </el-row>
                        </div></el-col>
                    </el-row>
                    <el-row :gutter="20" style="margin: 10px 0 20px">
                        <el-col :span="12" style="padding-left: 0"><div class="grid-content">
                            <el-row class="b12 middlerow">
                                <i class="iconfont blueColor">&#xe624;</i> 建议每天预算：<span class="bold">{{detail.syb_budget}}元</span>
                                <span :class="detail.syb_status ? 'red':'green'">
                                    {{detail.syb_status ? '↑':'↓'}} {{detail.syb_num}}
                                </span>
                            </el-row>
                        </div></el-col>
                        <el-col :span="12" style="padding-right: 0"><div class="grid-content">
                            <el-row class="b12 middlerow">
                                <i class="iconfont blueColor">&#xe624;</i> 建议每天预算：<span class="bold">{{detail.zz_budget}}元</span>
                                <span :class="detail.zz_status ? 'red':'green'">
                                    {{detail.zz_status ? '↑':'↓'}} {{detail.zz_num}}
                                </span>
                            </el-row>
                        </div></el-col>
                    </el-row>
                    <el-row :gutter="20" style="margin: 0;">
                        <el-col :span="24" class="b12" style="padding:0">
                            <div class="head">建议预算调整原因</div>
                            <div class="reason">{{detail.reason}}</div>
                        </el-col>
                    </el-row>
                </el-dialog>
            </div>
            <div class="topContainer">
                <div class="topWrap clearfix">
                    <el-table :data="[{}]" :show-header="false" style="width: 100%" class="keyTable" @cell-click="changeKeys">
                        <el-table-column width="240" fixed>
                            <template scope="scope">
                                <el-date-picker
                                    :clearable="false"
                                    :editable="false"
                                    type="daterange"
                                    align="right"
                                    popper-class="rptDatePicker"
                                    v-model="date"
                                    :picker-options="pickerOptions"
                                    @change="dateChange"
                                    placeholder="选择日期范围">
                                </el-date-picker>
                            </template>
                        </el-table-column>
                        <el-table-column v-for="(rpt_type, index) of show_columns" :key="index" min-width="160" :show-overflow-tooltip="true">
                            <template scope="scope">
                                <div class="cellWrap" :class="current_keys.includes(show_columns[index]) ? 'active' : ''">
                                    <p class="key" :data-key="show_columns[index]">{{FEILDTITLE[show_columns[index]]}}</p>
                                    <p class="keyValue">{{formatData(sumData[show_columns[index]], show_columns[index])}}</p>
                                    <div class="split"></div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                    <more-data type="zzRpt"></more-data>
                </div>
                <el-tabs class="compareTab" v-model="activeName">
                    <el-tab-pane label="不同单元对比" name="compare">
                        <div id="chart" style="min-width:800px;width: 100%;height:400px"></div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <el-table ref="multiTable" :data="tableData" border style="width: 100%" class="dataTable combinationTB"  @select="handleSingle" :row-class-name="addRowClass" @sort-change="sortChange">
                <el-table-column fixed type="selection" width="55"> </el-table-column>
                <el-table-column fixed label="店铺名称" width="230">
                    <template scope="scope">
                    {{scope.row.is_account ? scope.row.nick : scope.row.date_str}}
                    <a href="javascript:;" class="link detail-link" :data-uuid="scope.row.uuid" @click="expandDetail" :class="openedIds.includes(scope.row.uuid) ? 'opened':''" v-if="scope.row.is_account">细分</a>
                    </template>
                </el-table-column>
                <el-table-column  align="right" v-for="(rpt_type, index) of show_columns" :key="index" :label="FEILDTITLE[show_columns[index]]" :sortable="'custome'" min-width="160" :prop="show_columns[index]">
                    <template scope="scope">
                        <span>{{formatData(scope.row[show_columns[index]], show_columns[index])}}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="ac f14" v-else>
            <p>直钻结合功能需要掌柜开通直通车，并且购买本公司的省油宝产品，然后在省油宝中授权给钻展账户，才能使用。</p>
            <p>您可以：
                <a href="https://fuwu.taobao.com/ser/detail.htm?service_code=ts-1796606" target="_blank">
                    <el-button type="primary">立即去订购</el-button>
                </a>
                或咨询客服
                <a target="_blank" href="http://www.taobao.com/webww/ww.php?ver=3&amp;touid=%E9%BA%A6%E8%8B%97%E7%BD%91%E7%BB%9C%E6%8A%80%E6%9C%AF%3A%E6%B2%99%E6%B2%99&amp;siteid=cntaobao&amp;status=2&amp;charset=utf-8"><img border="0" src="https://staticwww.maimiaotech.com/syb/images/realonline.aw_8ab4b34.gif" alt="点这里给我发消息"></a>
            </p>
        </div>
    </div>
</template>

<script>
    import Highcharts from 'highcharts';
    import moment from 'moment';
    import Qs from 'qs';

    import {FEILDTITLE, DEFAULT_VALUE} from '@/config';
    import {commafy, formatDate, price_arr, pickerOptions} from '@/assets/js/base';
    import './CombinationPage.less';
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')

    const Highcharts_COLORS = ['#888efa','#e9c01a', '#78c57b','#1cd3c8','#aeca2b', '#f5278e','#d1c0ab',"#df7fd7", "#847999","#f87f49","#458ae6"];

    let queryStr = Qs.parse(location.search.substr(1));

    export default {
        name: 'combination',
        data () {
            return {
                has_account: [],
                current_keys: ['ad_pv','click','ctr'],
                FEILDTITLE: FEILDTITLE,
                options: {
                    chart: {
                        type: 'line',
                        colorCount: 12,
                        height: 400,
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
                            var data_html = this.x + '：<br/>'
                            for(var i = 0; i < this.points.length; i++){
                                data_html += ('<span style="color:' + this.points[i].series.color + '">'  + this.points[i].series.name + ' ：' + Math.round(this.points[i].y * 100) / 100 + '</span><br/>');
                            }
                            return data_html;
                        }
                    },
                    plotOptions: {
                         series: {
                            connectNulls:true//断点续连
                        },
                    },
                },
                sumData: Object.assign({}, DEFAULT_VALUE),
                sumChartData: [],
                tableData: [],
                accountData: [],
                range: 7,
                xDates: [],
                openedIds: [],
                date: [],
                selections: [],
                params: {
                    start_date: '',
                    end_date: '',
                },
                obj: {},
                pickerOptions: pickerOptions(),
                loading: true,
                activeName: 'compare',
                detail_status: -1,
                suggests: '暂未获取',
                detail: {},
                dialogVisible: false,
                isFirst: true,
            }
        },
        computed:{
            show_columns(){
                return this.$store.state.plan.ZZRPT_COLUMNS
            }
        },
        watch: {
            show_columns(){
                if(!this.isFirst){
                    this.getCurrentKeys(true);
                }
                this.isFirst = false;
            }
        },
        created () {
            this.getCurrentKeys();
            //date start
            let s_date = moment(this.getCurrentDate()).subtract(7, 'days').format("YYYY-MM-DD");
            let e_date = moment(this.getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD");
            if(localStorage.ops_date && localStorage.ops_date === moment(this.getCurrentDate()).format("YYYY-MM-DD")){
                s_date = localStorage.s_date ? localStorage.s_date : s_date;
                e_date = localStorage.e_date ? localStorage.e_date : e_date;
            }else{
                localStorage.setItem('ops_date', moment(this.getCurrentDate()).format("YYYY-MM-DD"));
                localStorage.setItem('s_date', s_date);
                localStorage.setItem('e_date', e_date);
            }
            //date end
            this.$set(this, 'date', [s_date, e_date]);
            this.$set(this, 'range', moment(e_date).diff(moment(s_date), 'days') + 1);
            this.$set(this, 'params', {start_date: s_date, end_date: e_date});

            this.checkAccount();
            window._hmt.push(['_trackEvent', 'pages_combination', 'click']);
        },
        methods: {
            getCurrentKeys(flag){
                var list = this.$store.state.plan.ZZRPT_COLUMNS;
                var current_keys = [];
                if(localStorage.current_keys_zz){
                    let arr = localStorage.current_keys_zz.split(',');
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
                localStorage.current_keys_zz = current_keys;
                this.$set(this, 'current_keys', current_keys);
                if(flag){
                    this.keyChange();
                }
            },
            sortChange(params){
                if(!params.prop) return;
                console.log(this.openedIds,'-----------')
                let that = this;
                let data = that.accountData;
                if(params.order === 'ascending'){
                    data.sort((a, b) => {return a[params.prop] - b[params.prop]});
                }else{//descending
                    data.sort((a, b) => {return b[params.prop] - a[params.prop]});
                }
                let newArr = [];
                data.forEach(val => {
                    let tmp = [].concat(that.obj[val.uuid]);
                    tmp.sort((a, b) => {return b.log_date.$date - a.log_date.$date});
                    newArr = newArr.concat(val, tmp);
                });
                that.$set(that, 'selections', []);
                that.handleSumChart();
                that.$set(that, 'openedIds', []);
                that.$set(that, 'tableData', newArr);
                that.tableData.splice(newArr.length);
            },
            addRowClass(row, index){
                return (row.is_account ? 'p-tr sum-tr sum-tr-' : 'nodisplay detail-tr detail-tr-') + row.uuid;
            },
            handleSingle(selection, row){
                this.$set(this, 'selections', selection);
                if(this.selections.length){
                    this.handleChart();
                }else{
                    this.handleSumChart();
                }
            },
            expandDetail(e){
                let uuid = e.target.getAttribute('data-uuid'), that = this;
                let opened = e.target.classList.contains('opened');
                if(opened && that.openedIds.includes(uuid-0)){
                    that.openedIds.splice(that.openedIds.findIndex(val => {
                        return val === uuid-0;
                    }), 1);
                }
                if(!opened && !that.openedIds.includes(uuid-0)){
                    that.openedIds.push(uuid-0);
                }
                [...document.querySelectorAll('.detail-tr-' + uuid)].forEach(function(ele){
                    if(opened){//已打开，detail应隐藏
                        if(!ele.classList.contains('nodisplay')){
                            ele.className += ' nodisplay';
                        }
                    }else{//关闭的，detail应展示
                        ele.className = ele.className.replace('nodisplay', '');
                    }
                });
                if(opened){
                    e.target.className = e.target.className.replace('opened', '');
                }else{
                    e.target.className += ' opened';
                }
            },
            handleSumChart(){
                //图表
                let that = this, seriesData = [];
                that.current_keys.forEach(key => {
                    let obj = {
                        name: FEILDTITLE[key],
                        data: [],
                        marker:{
                            enabled: false,
                        },
                    };
                    that.sumChartData.forEach(function(val, i){
                        obj.data.push(price_arr.includes(key) ? (val[key]/100).toFixed(2)-0 : val[key]);
                    });
                    seriesData.push(obj);
                });
                console.log(that.xDates, 'xDates----', seriesData)
                that.drawChart('chart', that.xDates, seriesData);
            },
            checkAccount(){
                let that = this;
                this.$http.post('combination/ajax_get_syb_authorize_status', {}).then(res => {
                    if(!res.success){
                        that.$set(that, 'loading', false);
                        return false;
                    }

                    that.$set(that, 'has_account', res.data);
                    if(res.data.length){//有授权账号，发请求
                        that.getData();
                        that.getSuggestion();
                    }
                    that.$set(that, 'loading', false);
                });
            },
            getSuggestion(){
                let that = this, status = {
                    '-1': '钻展花费过低，无法给出预算分配。',
                    '-2': '省油宝花费过低，无法给出预算分配。',
                    '1': '直通车数据较好，钻展数据较好。',
                    '2': '直通车数据一般，钻展数据较好。',
                    '3': '直通车数据较好，钻展数据一般。',
                    '4': '直通车数据一般，钻展数据一般。',
                };
                this.$http.post('combination/ajax_get_budget_suggestion', {}).then(res => {
                    if(!res.success){
                        that.$set(that, 'loading', false);
                        return false;
                    }
                    let data = res.data;
                    data.detail.syb_cost = (data.detail.syb_cost / 100).toFixed(2) - 0;
                    data.detail.zz_cost = (data.detail.zz_cost / 100).toFixed(2) - 0;
                    data.detail.syb_budget = (data.detail.syb_budget / 100).toFixed(2) - 0;
                    data.detail.zz_budget = (data.detail.zz_budget / 100).toFixed(2) - 0;
                    that.$set(that, 'detail_status', data.status);
                    if(data.status === -1 || data.status === -2){
                        that.$set(that, 'suggests', status[data.status]);
                    }else{
                        var str = '直通车', d = data.detail, syb_num = '0%', zz_num = '0%';
                        if(d.syb_budget > d.syb_cost){
                            syb_num = (d.syb_cost !== 0 ? ((d.syb_budget-d.syb_cost)/d.syb_cost*100).toFixed(2) : 0) + '%';
                            data.detail.syb_status = 1;
                            str += '增加'+syb_num+'预算，';
                        }else{
                            syb_num = (d.syb_cost !== 0 ? ((d.syb_cost-d.syb_budget)/d.syb_cost*100).toFixed(2) : 0) + '%';
                            data.detail.syb_status = 0;
                            str += '减少'+syb_num+'预算，';
                        }
                        str += '钻展';
                        if(d.zz_budget > d.zz_cost){
                            zz_num = (d.zz_cost !== 0 ? ((d.zz_budget-d.zz_cost)/d.zz_cost*100).toFixed(2) : 0) + '%';
                            data.detail.zz_status = 1;
                            str += '增加'+zz_num+'预算。';
                        }else{
                            zz_num = (d.zz_cost !== 0 ? ((d.zz_cost-d.zz_budget)/d.zz_cost*100).toFixed(2) : 0) + '%';
                            data.detail.zz_status = 0;
                            str += '减少'+zz_num+'预算。';
                        }
                        data.detail.syb_num = syb_num;
                        data.detail.zz_num = zz_num;
                        data.detail.reason = status[data.status];
                        data.detail.update_time = formatDate(data.update_time.$date);
                        that.$set(that, 'detail', data.detail);
                        let out_status = {
                            '1': '推广效果都不错，继续稳定推广一段时间。',
                            '4': '直通车和钻展都需要努力提升效果。'
                        };
                        if(data.status === 1 || data.status === 4){
                            str = out_status[data.status];
                        }
                        that.$set(that, 'suggests', str);
                    }
                });
            },
            getData(){
                let that = this;
                this.$set(this, 'loading', true);
                this.$http.post('combination/ajax_get_combination_account_rpts', that.params).then(res => {
                    if(!res.success){
                        that.$set(that, 'loading', false);
                        return false;
                    }
                    let data = res.data;

                    that.$set(that, 'sumData', data.total_shop_rpts.account_total_rpts);
                    data.total_shop_rpts.account_day_rpts.sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                    that.$set(that, 'sumChartData', data.total_shop_rpts.account_day_rpts);

                    var arr = [], obj = {}, xDate = [], accountData = [];
                    if(data.sub_shop_rpts.length){
                        data.sub_shop_rpts.map(val => {
                            Object.assign(val.account_total_rpts, {uuid: val.uuid, nick: val.nick, is_account: true});
                            accountData.push(val.account_total_rpts);
                            obj[val.uuid] = val.account_day_rpts;
                            val.account_day_rpts.map((v, i) => {
                                v.date_str = formatDate(v.log_date.$date);
                                v.uuid = val.uuid;
                                xDate[i] = v.date_str;
                            });
                            val.account_day_rpts.sort((a, b) => {return b.log_date.$date - a.log_date.$date});
                            arr = arr.concat(val.account_total_rpts, val.account_day_rpts);
                        });
                        that.$set(that, 'tableData', arr);
                        that.$set(that, 'accountData', accountData);
                        console.log(arr,'tabledata --------')
                        that.$set(that, 'obj', obj);
                        that.$set(that, 'xDates', xDate);
                    }
                    this.handleSumChart();
                    this.$set(this, 'loading', false);
                });
            },
            getCurrentDate(){
                if(this.$store.state.plan.shopInfo && this.$store.state.plan.shopInfo.current_time && this.$store.state.plan.shopInfo.current_time.$date){
                    return new Date(this.$store.state.plan.shopInfo.current_time.$date - 8*3600000);
                }
                return new Date();
            },
            handleChart(){
                let seriesData = [], that = this;
                this.current_keys.forEach(v => {
                    that.selections.map(value => {
                        let tmp = {
                            name: FEILDTITLE[v] + '-' +value.nick,
                            data: [],
                            marker:{
                                enabled: false,
                            },
                        };
                        that.obj[value.uuid].sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                        that.obj[value.uuid].forEach(val => {
                            tmp.data.push(price_arr.includes(v) ? (val[v]/100).toFixed(2)-0 : val[v]);
                        });
                        seriesData.push(tmp);
                    });
                });
                this.drawChart('chart', this.xDates, seriesData);
            },
            drawChart(id, xDate, seriesData){
                var that = this;
                var chart = new Highcharts.Chart(id, Object.assign({}, this.options, {
                    xAxis: {
                        categories: xDate,   //指定x轴分组
                        tickInterval : (function(){
                            var num;
                            if(that.range <= 15){
                                num = 1;
                            } else if(that.range > 15 && that.range <= 31) {
                                num = 3;
                            }
                            return num;
                        })()
                    },
                    series: seriesData
                }));
            },
            formatData(val, key) {
                return commafy(val, key);
            },
            dateChange(dateStr){
                //判断是否超过30天
                let date = dateStr.split(' - '), range = moment(date[1]).diff(moment(date[0]), 'days') + 1;
                if (range > 30){
                    this.$message({
                        showClose: true,
                        message: '时间范围不能超过30天哦',
                        type: 'error'
                     });
                    this.$set(this, 'date', [this.params.start_date, this.params.end_date]);
                    return false;
                }
                if(date[0] === this.params.start_date && date[1] === this.params.end_date){//日期没变，不做处理
                    return false;
                }
                localStorage.setItem('s_date', date[0]);
                localStorage.setItem('e_date', date[1]);
                //数据清空
                this.$set(this, 'tableData', []);
                this.$set(this, 'accountData', []);
                this.$set(this, 'selections', []);
                this.$set(this, 'openedIds', []);
                this.$set(this, 'xDates', []);
                this.$set(this, 'params', {
                    'start_date': date[0],
                    'end_date': date[1]
                });
                this.$set(this, 'range', range);
                this.getData();
            },
            changeKeys(row, column, cell, event){
                if(!cell.querySelector('.key')){//点击更多数据和日期框
                    return false;
                }
                let type = cell.querySelector('.key').getAttribute('data-key'), arr = this.current_keys;
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
                this.$set(this, 'current_keys', arr);
                localStorage.setItem('current_keys_zz', arr);
                this.keyChange();
            },
            keyChange(){
                if(this.selections.length){
                    this.handleChart();
                }else{
                    this.handleSumChart();
                }
            },
        },
        components:{
            MoreData: MoreData,
        }
    }
</script>

<style scoped>

</style>
