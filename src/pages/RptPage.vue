<template>
    <div id="rpt_container" v-loading="loading" element-loading-text="加载中，请稍候...">
        <div v-title>报表</div>
        <div class="topContainer">
            <div class="topWrap">
                <div class="datePicker">
                     <el-date-picker
                                :clearable="false"
                                :editable="false"
                                v-model="date"
                                type="daterange"
                                align="right"
                                popper-class="rptDatePicker"
                                format="MM-dd"
                                :picker-options="pickerOptions"
                                @change="dateChange"
                                placeholder="过去七天">
                            </el-date-picker>
                </div>
                <div class="arrow" @click="arrow(1)"><i class="iconfont">&#xe63f;</i></div>
                <div class="showBox" :style="showBoxWidth">
                    <el-table :data="[{}]" :show-header="false" class="keyTable" @cell-click="changeKeys">
                        <el-table-column class-name="rpt-column" v-for="(rpt_type, index) in show_columns" :key="index" :min-width="showColumWidth" :show-overflow-tooltip="true">
                            <template scope="scope">
                                <div class="cellWrap" :class="current_keys.includes(show_columns[index]) ? 'active' : ''">
                                    <p class="key" :data-key="show_columns[index]">{{FEILDTITLE[show_columns[index]]}}</p>
                                    <p class="keyValue">{{formatData(sumData[show_columns[index]], show_columns[index])}}</p>
                                    <div class="split"></div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="arrow" @click="arrow(-1)" ><i class="iconfont">&#xe63c;</i></div>
                <more-data type="allRpt"></more-data>
            </div>
            <div class="rptCharts">
                <el-tabs class="compareTab">
                    <el-tab-pane label="汇总">
                        <div id="chart_sum" style="min-width:800px;width: 100%;height:400px"></div>
                    </el-tab-pane>
                    <el-tab-pane label="不同单元对比">
                        <div id="chart_compare" style="min-width:800px;width: 100%;height:400px"></div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
        <div class="TableContainer">
            <div class="rptWrap">
                <a href="/rpt">
                    <el-button type="primary" :class="{selected: type ==='campaign'}">
                        <i class="iconfont">&#xe64e;</i>店铺报表
                    </el-button>
                </a>
                <a href="/rpt?type=adzone&is_single=1">
                    <el-button type="primary" :class="{selected: type ==='adzone'}">
                        <i class="iconfont">&#xe63a;</i>资源位报表
                    </el-button>
                </a>
                <a href="/rpt?type=creative&is_single=1">
                    <el-button type="primary" :class="{selected: type ==='creative'}">
                        <i class="iconfont">&#xe632;</i>创意报表
                    </el-button>
                </a>
            </div>
            <el-table ref="multiTable" :data="tableData" border style="width: 100%" class="dataTable sum-table" @selection-change="handleSingle" :row-class-name="addRowClass" @sort-change="sortChange" :class="!is_single && ['campaign','adgroup','creative'].includes(type) ? 'detail-table-sum':''">
                <el-table-column fixed type="selection" width="55"> </el-table-column>
                <el-table-column fixed :label="HEAD[type].label" :width="type === 'creative' ?400:360">
                    <template scope="scope">
                        <div class="tdNameWrap thNameWrapSingle" v-if="is_single">
                            <div v-if="type === 'creative' && scope.row.is_sum" class="el-row">
                                <div class="el-col-8 img-paper" title="查看大图" @click="imgModalSrc = scope.row.image_path">
                                    <img :src="scope.row.image_path">
                                </div>
                                <div class="el-col-13 name" :title="scope.row.creative_name">&nbsp;&nbsp;{{scope.row.creative_name}}</div>
                            </div>
                            <div v-else class="name" :title="scope.row.is_sum ? scope.row[HEAD[type].label_key] : (scope.row.campaign_name+'-'+scope.row.adgroup_name)">{{scope.row.is_sum ? scope.row[HEAD[type].label_key] : (scope.row.campaign_name+'-'+scope.row.adgroup_name)}}</div>
                            <a href="javascript:;" class="link detail-link" @click="expandDetail" v-if="scope.row.is_sum" :data-kid="scope.row[type+'_id']" :class="openedIds.includes(scope.row[type+'_id']) ? 'opened':''">细分</a>
                            <a :href="`/rpt_day?active=day&type=${type}&campaign_id=${scope.row.campaign_id}&adgroup_id=${scope.row.adgroup_id}&${type+'_id'}=${scope.row[type+'_id']}`" v-if="!scope.row.is_sum" target="_blank" class="link">分日</a>
                            <a :href="`/rpt_day?active=time&type=${type}&campaign_id=${scope.row.campaign_id}&adgroup_id=${scope.row.adgroup_id}&${type+'_id'}=${scope.row[type+'_id']}`" v-if="!scope.row.is_sum" target="_blank" class="link timeLink">分时</a>
                        </div>
                        <div class="tdNameWrap" v-else>
                            <div v-if="type === 'creative'" class="el-row">
                                <div class="el-col-8">
                                    <img :src="scope.row.image_path" alt="" width="100" height="100"/>
                                </div>
                                <div class="el-col-16 name" :title="scope.row.creative_name">&nbsp;&nbsp;{{scope.row.creative_name}}</div>
                            </div>

                            <div v-else class="name" :title="scope.row[type ==='adzone'||type==='target' ? (!scope.row.is_sum ? (type==='adzone'?'target_name':'adzone_name') : HEAD[type].label_key ) : HEAD[type].label_key]">{{scope.row[type ==='adzone'||type==='target' ? (!scope.row.is_sum ? (type==='adzone'?'target_name':'adzone_name') : HEAD[type].label_key ) : HEAD[type].label_key]}}</div>
                            <a href="javascript:;" class="link detail-link" @click="expandDetail" v-if="scope.row.is_sum" :data-kid="scope.row[type+'_id']" :class="openedIds.includes(scope.row[type+'_id']) ? 'opened':''">细分</a>
                            <a :href="`/rpt_day?active=day&type=${scope.row.is_account ? 'account' : (type==='adzone'|| type==='target' ? ( scope.row.is_sum ? type : 'cross') : type )}&campaign_id=${scope.row.campaign_id}&adgroup_id=${scope.row.adgroup_id}&target_id=${scope.row.target_id}&adzone_id=${scope.row.adzone_id}&creative_id=${scope.row.creative_id}`" target="_blank" class="link">分日</a>
                            <a :href="`/rpt_day?active=time&type=${scope.row.is_account ? 'account' : (type==='adzone'|| type==='target' ? ( scope.row.is_sum ? type : 'cross') : type )}&campaign_id=${scope.row.campaign_id}&adgroup_id=${scope.row.adgroup_id}&target_id=${scope.row.target_id}&adzone_id=${scope.row.adzone_id}&creative_id=${scope.row.creative_id}`" target="_blank" class="link timeLink">分时</a>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column align="right" v-for="(rpt_type, index) of show_columns" :key="index" :label="FEILDTITLE[show_columns[index]]" 
                :sortable="!is_single && ['campaign','adgroup','creative'].includes(type) ? true:'custom'" min-width="110" :prop="show_columns[index]">
                    <template scope="scope">
                        <span>{{formatData(scope.row[show_columns[index]], show_columns[index])}}</span>
                    </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="180" v-if="type === 'campaign' || type === 'adgroup'">
                    <template scope="scope">
                        <a v-show="type === 'campaign' && !scope.row.is_account" :href="`/rpt?type=adgroup&campaign_id=${scope.row.campaign_id}`" target="_blank"><el-button type="text" size="small">查看推广单元</el-button></a>

                        <a v-show="type === 'adgroup'" :href="`/rpt?type=target&campaign_id=${campaign_id}&adgroup_id=${scope.row.adgroup_id}`" target="_blank">定向&nbsp;&nbsp;</a>
                        <a v-show="type === 'adgroup'" :href="`/rpt?type=adzone&campaign_id=${campaign_id}&adgroup_id=${scope.row.adgroup_id}`" target="_blank">资源位&nbsp;&nbsp;</a>
                        <a v-show="type === 'adgroup'" :href="`/rpt?type=creative&campaign_id=${campaign_id}&adgroup_id=${scope.row.adgroup_id}`" target="_blank">创意</a>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[20, 50, 100]"
                :page-size="page_size"
                layout="total, sizes, prev, pager, next"
                :total="total">
            </el-pagination>
            <img-modal :img="imgModalSrc" @close="imgModalSrc = ''"></img-modal>
        </div>
    </div>
</template>

<script>
    import Highcharts from 'highcharts';
    import moment from 'moment';
    import Qs from 'qs';

    import {FEILDTITLE, DEFAULT_VALUE} from '@/config';
    import {commafy, formatDate, price_arr, pickerOptions} from '@/assets/js/base';
    import './RptPage.less';
    const MoreData = r => require.ensure([], () => r(require('@/components/MoreData')), 'MoreData')
    import imgModal from '@/components/widget/imgModal'

    let queryStr = Qs.parse(location.search.substr(1));
    let type = queryStr.type && ['campaign','adgroup','creative','adzone','target'].includes(queryStr.type) ? queryStr.type : null;

    export default {
        name: 'rpt',
        data () {
            return {
                type: type ? type : 'campaign',//campaign | adgroup | creative | adzone | target
                date: [],
                current_keys: ['ad_pv','click','ctr'],
                pickerOptions: pickerOptions(),
                HEAD: {
                    campaign: {label:'计划信息', label_key: 'campaign_name'},
                    adgroup: {label:'推广单元信息', label_key: 'adgroup_name'},
                    creative: {label:'创意', label_key: 'creative_name'},
                    adzone: {label:'资源位', label_key: 'adzone_name'},
                    target: {label:'定向', label_key: 'target_name'},
                },
                FEILDTITLE: FEILDTITLE,
                options: {
                    chart: {
                        type: 'line',
                        height: 400,
                        //marginBottom: 90,
                        colorCount: 12,
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    colors: ['#888efa','#e9c01a', '#ed551a', '#78c57b','#1cd3c8','#aeca2b', '#f5278e','#d1c0ab', "#f96307","#df7fd7","#f87f49","#458ae6"],
                    credits: {enabled: false},
                    legend: {
                        padding: 10
                    },
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
                tableData: [],
                sumChartData: [],//7天汇总数据
                //sumSeriesData: [],
                chartData: [],//key-value原始数据
                targetChartData: {},
                adzoneChartData: {},
                creativeChartData: {},
                selections: [],
                selections_back: [],
                range: 7,
                xDates: [],
                selection_checked: [false],
                campaign_id: queryStr.campaign_id-0,
                adgroup_id: queryStr.adgroup_id-0,
                is_sum: true,
                is_single: queryStr.is_single,
                urls: {
                    campaign: {
                        table: '/ajax_get_campaign_total_rpts',
                        chart: '/ajax_get_account_day_rpts',
                        compare: '/ajax_get_campaign_day_rpts',
                    },
                    adgroup: {
                        table: '/ajax_get_adgroup_total_rpts',
                        chart: '/ajax_get_campaign_day_rpts',
                        compare: '/ajax_get_adgroup_day_rpts'
                    },
                    creative: {
                        table: '/ajax_get_creative_total_rpts',
                        chart: queryStr.is_single ? '/ajax_get_account_day_rpts' : '/ajax_get_adgroup_day_rpts',
                        compare: '/ajax_get_creative_day_rpts'
                    },
                    adzone: {
                        table: '/ajax_get_target_adzone_total_rpts',
                        chart: queryStr.is_single ? '/ajax_get_account_day_rpts' : '/ajax_get_adgroup_day_rpts',
                        compare: '/ajax_get_adzone_day_rpts',
                    },
                    target: {
                        table: '/ajax_get_target_adzone_total_rpts',
                        chart: '/ajax_get_adgroup_day_rpts',
                        compare: '/ajax_get_target_day_rpts',
                    },
                },
                params: {
                    start_date: '',
                    end_date: ''
                },
                obj: {},
                loading: true,
                info: {},
                currentPage: 1,
                page_size: 50,
                total: 0,
                openedIds: [],
                isFirst: true,
                imgModalSrc: '',
                could_show_col_num: 0,
                showBoxWidth: {},
                showColumWidth: 0,
                //shopInfo: {}
            }
        },
        computed:{
            show_columns(){
                return this.$store.state.plan.RPT_COLUMNS
            },
        },
        watch: {
            show_columns(a, b){
                if(!this.isFirst){
                    this.getCurrentKeys(true);
                }
                this.isFirst = false;
                console.log(this.could_show_col_num, this.show_columns.length)
                if (this.could_show_col_num > this.show_columns.length) {
                    document.querySelector('.keyTable .el-table__body').style.left = 0
                    return
                }
                if (a.length < b.length) {
                    document.querySelector('.keyTable .el-table__body').style.left = 
                    +document.querySelector('.keyTable .el-table__body').style.left.replace('px', '') + this.showColumWidth * (b.length - a.length) + 'px'
                    return
                }
            },
        },
        created () {
            this.getCurrentKeys();
            //this.$set(this, 'shopInfo', this.$store.state.plan.shopInfo);
            //日期start
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
            //日期end
            this.$set(this, 'date', [s_date, e_date]);
            this.$set(this, 'range', moment(e_date).diff(moment(s_date), 'days') + 1);
            this.$set(this, 'params', {start_date:s_date, end_date: e_date});

            let params = this.params;
            if(this.type === 'adgroup'){
                params.campaign_id = this.campaign_id;
            }else if( ['creative','adzone','target'].includes(this.type) && !queryStr.is_single){
                params.campaign_id = this.campaign_id;
                params.adgroup_id = this.adgroup_id;
            }
            this.getTableData();
            this.getChartData();
            window._hmt.push(['_trackEvent', 'pages_rpt', 'click']);
        },
        mounted() {
            const datePickerWidth = document.querySelector('.datePicker').getBoundingClientRect().width
            const topWrapWidth = document.querySelector('.topWrap').getBoundingClientRect().width
            const showBoxWidth = Math.floor(topWrapWidth - datePickerWidth - 66)
            this.showBoxWidth = { width: showBoxWidth + 'px' }

            document.querySelector('.keyTable .el-table__body').style.left = 0
            
            const keyTableWitdh = showBoxWidth - 76
            this.could_show_col_num = Math.round(keyTableWitdh / 160)
            this.showColumWidth = Math.floor(keyTableWitdh / this.could_show_col_num)
            // 
        },
        methods: {
            // pathTo(type) {
            //     let url = '/rpt'
            //     if (type === 'adzone') {
            //         url = '/rpt?type=adzone&is_single=1'
            //     } else if (type === 'creative') {
            //         url = '/rpt?type=creative&is_single=1'
            //     }
            //     this.$router.push(url)
            //     this.type = type
            // },
            arrow(num) {
                if (this.could_show_col_num > this.show_columns.length) return
                const left = document.querySelector('.keyTable .el-table__body').style.left.replace('px', '')
                const boxInnerWidth = this.show_columns.length * this.showColumWidth
                const maxLeft = this.show_columns.length * this.showColumWidth - (+this.showBoxWidth.width.replace('px', '') - 60)
                if (num > 0 && +left + this.showColumWidth * num * 3 > 0) {
                    document.querySelector('.keyTable .el-table__body').style.left = 0
                    return
                }
                if (num < 0 && +left + this.showColumWidth * num * 3 < -maxLeft) {
                    document.querySelector('.keyTable .el-table__body').style.left = -maxLeft + 'px'
                    return
                }
                if (+left === 0 && num > 0 ) return
                document.querySelector('.keyTable .el-table__body').style.left = +left + this.showColumWidth * num * 3 + 'px'
            },
            getCurrentKeys(flag){
                var list = this.$store.state.plan.RPT_COLUMNS;
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
                localStorage.current_keys = current_keys;
                this.$set(this, 'current_keys', current_keys);
                if(flag){
                    this.keyChange();
                }
            },
            sortChange(params){
                console.log('sort------',params)
                if(this.is_single || ['target','adzone'].includes(this.type)){
                    if(!params.prop) return;
                    let that = this;
                    let data = [].concat(that.tableData);
                    if(params.order === 'ascending'){
                        data.sort((a, b) => {return a[params.prop] - b[params.prop]});
                    }else{//descending
                        data.sort((a, b) => {return b[params.prop] - a[params.prop]});
                    }
                    let newArr = [];
                    data.forEach(val => {
                        if(val.is_sum){
                            let tmp = that.obj[val[that.type+'_id']];
                            if(params.order === 'ascending'){
                                tmp.sort((a, b) => {return a[params.prop] - b[params.prop]});
                            }else{
                                tmp.sort((a, b) => {return b[params.prop] - a[params.prop]});
                            }
                            newArr = newArr.concat(val, tmp);
                        }
                    });
                    that.$set(that, 'is_sum', true);
                    that.handleSumChart(true);
                    that.$set(that, 'selections', []);
                    that.$set(that, 'selections_back', []);
                    that.$set(that, 'openedIds', []);
                    let detailTB = document.querySelector('.detail-table');
                    if(detailTB){
                        detailTB.className = detailTB.className.replace('detail-table', '');
                    }
                    that.$set(that, 'tableData', newArr);
                    setTimeout(function(){
                        that.handlePagination();
                    }, 100);

                    /*setTimeout(() => {
                        [...document.querySelectorAll('.sum-tr')].forEach(ele => {
                            ele.parentNode.append(ele);
                            var id = ele.className.match(/sum-tr-(\d+)/)[1];
                            ele.parentNode.querySelectorAll('.detail-tr-'+id).forEach(detailTr => {
                                ele.parentNode.append(detailTr);
                            });
                        });
                        //触发分页
                        that.handlePagination();
                    }, 200);*/
                }
            },
            getCurrentDate(){
                if(this.$store.state.plan.shopInfo && this.$store.state.plan.shopInfo.current_time && this.$store.state.plan.shopInfo.current_time.$date){
                    return new Date(this.$store.state.plan.shopInfo.current_time.$date - 8*3600000);
                }
                return new Date();
            },
            handleSizeChange(size){
                this.$set(this, 'page_size', size);
                //重新分页
                this.handlePagination();
            },
            handleCurrentChange(page_num){
                this.$set(this, 'currentPage', page_num);
                this.handlePagination();
            },
            handlePagination(){
                let that = this;

                [...document.querySelectorAll('.el-table__body-wrapper .p-tr')].forEach((ele, index) => {
                    that.handleTr(ele, index);
                });
                [...document.querySelectorAll('.el-table__fixed .p-tr')].forEach((ele, index) => {
                    that.handleTr(ele, index);
                });
                [...document.querySelectorAll('.el-table__fixed-right .p-tr')].forEach((ele, index) => {
                    that.handleTr(ele, index);
                });
            },
            handleTr(ele, index){
                let h_index = this.currentPage*this.page_size, l_index = (this.currentPage-1)*this.page_size;
                let has_detail = this.is_single || ['adzone','target'].includes(this.type);
                if(index >= h_index || index < l_index){
                    if(!ele.classList.contains('nodisplay')){
                        ele.className += ' nodisplay';
                    }
                    if(has_detail){
                        var id = ele.className.match(/sum-tr-(\d+)/)[1];
                        //if(ele.querySelector('.detail-link.opened')){
                            [...document.querySelectorAll('.detail-tr-'+id)].forEach(detailTr => {
                                if(!detailTr.classList.contains('nodisplay')){
                                    detailTr.className += ' nodisplay';
                                }
                            });
                        //}
                    }
                }else{
                    if(ele.classList.contains('nodisplay')){
                        ele.className = ele.className.replace('nodisplay', '');
                    }
                    if(has_detail){
                        var id = ele.className.match(/sum-tr-(\d+)/)[1];
                        if(ele.querySelector('.detail-link.opened')){
                            [...document.querySelectorAll('.detail-tr-'+id)].forEach(detailTr => {
                                if(detailTr.classList.contains('nodisplay')){
                                    detailTr.className = detailTr.className.replace('nodisplay', '');
                                }
                            });
                        }else{
                            [...document.querySelectorAll('.detail-tr-'+id)].forEach(detailTr => {
                                if(!detailTr.classList.contains('nodisplay')){
                                    detailTr.className += ' nodisplay';
                                }
                            });
                        }
                    }
                }
            },
            expandDetail(e){
                let kid = e.target.getAttribute('data-kid'), that = this;
                let opened = e.target.classList.contains('opened');
                if(opened && that.openedIds.includes(kid-0)){
                    that.openedIds.splice(that.openedIds.findIndex(val => {
                        return val === kid-0;
                    }), 1);
                }
                if(!opened && !that.openedIds.includes(kid-0)){
                    that.openedIds.push(kid-0);
                }
                [...document.querySelectorAll('.detail-tr-' + kid)].forEach(function(ele){
                    if(opened){//已打开，detail应隐藏
                        if(!ele.classList.contains('nodisplay')){
                            ele.className += ' nodisplay';
                            //若选中，则取消选中
                            if(ele.querySelector('.is-checked')){
                                var index = ele.className.match(/index-(\d+)/)[1];
                                that.$refs.multiTable.toggleRowSelection(that.tableData[index], false);
                            }
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
                let is_sum = that.openedIds.length <= 0;
                that.$set(that, 'is_sum', is_sum);
                let tb = document.querySelector('.sum-table');
                if(is_sum && tb.classList.contains('detail-table')){
                    tb.className = tb.className.replace('detail-table', '');
                }
                if(!is_sum && !tb.classList.contains('detail-table')){
                    tb.className += ' detail-table';
                }
                [...document.querySelectorAll('.sum-tr .el-checkbox .is-checked')].forEach(function(ele){
                    if(!is_sum){
                        var index = ele.parentNode.parentNode.parentNode.parentNode.className.match(/index-(\d+)/)[1];
                        that.$refs.multiTable.toggleRowSelection(that.tableData[index], false);
                    }
                });
                //如果当前没有选中的，则恢复汇总图表
                if(!this.selections.length){//全部细分关闭或者展开的时候，中间恢复汇总图表
                    this.handleSumChart(true);
                }
            },
            addRowClass(row, index){
                if(queryStr.is_single || ['target', 'adzone'].includes(this.type)){
                    return ((row.is_sum ? 'p-tr sum-tr sum-tr-' : 'nodisplay detail-tr detail-tr-')+row[this.type+'_id']) + ' index-'+index;
                    //return ((row.is_sum ? 'p-tr sum-tr sum-tr-' : ((!this.is_sum && this.openedIds.includes(row[this.type+'_id'])?'':'nodisplay ')+'detail-tr detail-tr-'))+row[this.type+'_id']) + ' index-'+index;
                }else if(this.type === 'campaign'){
                    return row.is_account ? 'p-tr sum-tr' : 'p-tr detail-tr';
                }
                return 'p-tr';
            },
            dateChange(dateStr){
                //判断是否超过30天
                let date = dateStr.split(' - ');
                    date[0] = new Date().getFullYear() + '-' + date[0]
                    date[1] = new Date().getFullYear() + '-' + date[1]
                let range = moment(date[1]).diff(moment(date[0]), 'days') + 1;
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
                this.$set(this, 'currentPage', 1);
                this.$set(this, 'tableData', []);
                this.$set(this, 'xDates', []);
                this.$set(this, 'chartData', {});
                this.$set(this, 'targetChartData', {});
                this.$set(this, 'adzoneChartData', {});
                this.$set(this, 'creativeChartData', {});
                this.$set(this, 'selections', []);
                this.$set(this, 'selections_back', []);
                this.$set(this, 'openedIds', []);
                this.$set(this, 'selection_checked', [false]);
                this.$set(this, 'is_sum', true);
                var params = Object.assign({}, this.params);
                Object.assign(params, {
                    'start_date': date[0],
                    'end_date': date[1]
                });
                this.$set(this, 'params', params);
                this.$set(this, 'range', range);
                this.getTableData();
                this.getChartData();
            },
            getTableData(){
                let that = this, sumTrLength = 0;
                this.$set(this, 'loading', true);
                var params = Object.assign({return_key_value: false}, this.params);
                this.$http.post(this.urls[this.type].table, params).then(res => {
                    if (!res.success){
                        that.$set(that, 'loading', false);
                        return false;
                    }
                    let data = res.data;
                    if(queryStr.is_single || ['adzone','target'].includes(that.type)){
                        //资源位和定向交叉数据，进行数据的重新整理
                        let obj = {}, id = that.type+'_id', sumArr = [], obj_repeat = {};
                        data.forEach(val => {
                            if(!obj[val[id]]){
                                obj[val[id]] = [val];
                            }else{
                                obj[val[id]].push(val);
                            }
                        });
                        //对于资源位和创意汇总的数据，需要除重：相同计划、相同推广单元、相同资源位（但可能是不同定向，需要把不同定向的加一起）
                        if(that.is_single){
                            for(let key in obj){
                                obj[key].forEach(val => {
                                    let jz = val[id]+'-'+val.campaign_id+'-'+val.adgroup_id;
                                    if(!obj_repeat[jz]){
                                        obj_repeat[jz] = [val];
                                    }else{
                                        obj_repeat[jz].push(val);
                                    }
                                });
                                obj[key] = [];
                            }
                            console.log(obj_repeat)
                            for(let key in obj_repeat){
                                let id = key.split('-')[0] - 0;
                                if(obj_repeat[key].length > 1){//多条，需要相加
                                    let sum = Object.assign({}, DEFAULT_VALUE);
                                    obj_repeat[key].map(val => {
                                        for(let k in sum){
                                            if(['avg_access_page_num', 'avg_access_time'].includes(k)){
                                                sum[k] += val[k] * val.deep_inshop_uv;
                                            }else{
                                                sum[k] += val[k];
                                            }
                                        }
                                    });
                                    sum = that.needCompute(sum);
                                    Object.assign(sum, {
                                        campaign_id: obj_repeat[key][0].campaign_id,
                                        campaign_name: obj_repeat[key][0].campaign_name,
                                        adgroup_id: obj_repeat[key][0].adgroup_id,
                                        adgroup_name: obj_repeat[key][0].adgroup_name,
                                        [that.type+'_id']: id,
                                        [that.type+'_name']: obj_repeat[key][0][that.type+'_name'],
                                    });
                                    obj_repeat[key] = [sum];
                                }
                                obj[id].push(obj_repeat[key][0]);
                            }
                        }

                        for(var key in obj){
                            sumTrLength++;
                        }
                        that.$set(that, 'obj', obj);

                        for(let keyId in obj){
                            //计算汇总数据
                            let sum = Object.assign({}, DEFAULT_VALUE);
                            obj[keyId].forEach(value => {
                                for(let key in sum){
                                    if(['avg_access_page_num', 'avg_access_time'].includes(key)){
                                        sum[key] += value[key] * value.deep_inshop_uv;
                                    }else{
                                        sum[key] += value[key];
                                    }
                                }
                            });
                            sum = that.needCompute(sum);
                            Object.assign(sum, {
                                campaign_id: obj[keyId][0].campaign_id,
                                campaign_name: obj[keyId][0].campaign_name,
                                adgroup_id: obj[keyId][0].adgroup_id,
                                adgroup_name: obj[keyId][0].adgroup_name,
                                target_id: obj[keyId][0].target_id,
                                target_name: obj[keyId][0].target_name,
                                adzone_id: obj[keyId][0].adzone_id,
                                adzone_name: obj[keyId][0].adzone_name,
                                creative_id: obj[keyId][0].creative_id,
                                creative_name: obj[keyId][0].creative_name,
                            });
                            sum.is_sum = true;
                            sumArr = sumArr.concat(sum, obj[keyId]);
                        }
                        data = sumArr;
                    }
                    /*data.forEach((val, index) => {
                        val.index = index;
                    });*/
                   
                    if (queryStr.is_single && queryStr.creative_id) {
                        data.forEach(e => {
                            if (e.creative_id === +queryStr.creative_id) {
                                e.is_sum ? this.tableData.unshift(e) : this.tableData.push(e)
                            }
                        })
                        
                        if (this.tableData.length) {
                            this.tableData.splice(this.tableData.length, 0, ...data.filter(i => i.creative_id !== +queryStr.creative_id))
                            console.log(this.tableData)
                            this.$nextTick(() => {
                                this.$refs.multiTable.toggleRowSelection(this.tableData[0])
                            })
                        } else {
                            that.$set(that, 'tableData', data);
                        }
                    } else {
                        that.$set(that, 'tableData', data);
                    }
                     //获取创意image_path
                    that.$set(that, 'total', !that.is_single && ['campaign','adgroup','creative'].includes(that.type) ? data.length : sumTrLength);
                    //分页start
                    setTimeout(function(){
                        that.handlePagination();
                    }, 100);
                    //分页end
                    that.$set(that, 'loading', false);
                    if(that.type === 'creative'){
                        that.getInfo();
                    }
                });
            },
            getInfo() {
                let data = this.tableData, that = this;
                let params = {page_size: 5000};
                if(!that.is_single){
                    params.campaign_id = that.campaign_id;
                    params.adgroup_id = that.adgroup_id;
                }
                this.$http.post('/creative/ajax_get_creative_list', params).then(res => {
                    if (!res.success) return;
                    let creativeData = res.data;
                    let info = Object.assign({}, that.info);
                    if(creativeData){
                        creativeData.creative_list.forEach(val => {
                            info[val.creative_id] = {
                                creative_id: val.creative_id,
                                creative_name: val.creative_name,
                                image_path: val.image_path,
                            };
                        });
                        that.$set(that, 'info', info);
                    }
                    data.forEach(val => {
                        if(that.info[val.creative_id]){
                            Object.assign(val, that.info[val.creative_id]);
                        }else{
                            Object.assign(val, {image_path:'https://staticwww.maimiaotech.com/assets/yzb/default-small.png'});
                        }
                    });
                    that.$set(that, 'tableData', data);
                    that.tableData.splice(data.length);
                });
            },
            needCompute(sum_obj){
                //需要计算的数据
                sum_obj.cvr = sum_obj.click ? Math.round(sum_obj.alipay_in_shop_num / sum_obj.click * 10000) / 100 : 0;
                sum_obj.avg_access_page_num = sum_obj.deep_inshop_uv ? ((sum_obj.avg_access_page_num / sum_obj.deep_inshop_uv).toFixed(2) - 0) : 0;
                sum_obj.avg_access_time = sum_obj.deep_inshop_uv ? ((sum_obj.avg_access_time / sum_obj.deep_inshop_uv).toFixed(2) - 0) : 0;
                sum_obj.ecpm = sum_obj.ad_pv ? ((sum_obj.charge / sum_obj.ad_pv * 1000).toFixed(2)-0): 0;
                sum_obj.ecpc = sum_obj.click ? ((sum_obj.charge / sum_obj.click).toFixed(2)-0) : 0;
                sum_obj.ctr = sum_obj.ad_pv ? Math.round(sum_obj.click / sum_obj.ad_pv * 10000) / 100 : 0;
                sum_obj.roi = sum_obj.charge ? ((sum_obj.alipay_inshop_amt / sum_obj.charge).toFixed(2)-0) : 0;
                return sum_obj;
            },
            getChartData(){
                let that = this, params = Object.assign({return_key_value: false}, this.params);
                this.$http.post(this.urls[this.type].chart, params).then(res => {
                    if (!res.success) return;
                    let data = res.data;
                    if(!data.length){//数据补零
                        data = [];
                        for(let i=0;i<that.range;i++){
                            data.push(Object.assign({
                                log_date: {
                                    $date: moment(that.params.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                },
                                campaign_name: '',
                                adgroup_name: '',
                                adzone_name: '',
                                target_name: '',
                                creative_name: '',
                            }, DEFAULT_VALUE));
                        }
                    }
                    let xDate = [];
                    data.sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                    data.forEach((val, j) => {
                        xDate[j] = formatDate(val.log_date.$date);
                    });
                    that.$set(that, 'xDates', xDate);
                    that.$set(that, 'sumChartData', data);
                    //if(that.type !== 'campaign'){//计算顶部汇总数据
                        let sum = Object.assign({}, DEFAULT_VALUE);
                        data.forEach(v => {
                            for(let key in sum){
                                if(['avg_access_page_num', 'avg_access_time'].includes(key)){
                                    sum[key] += v[key] * v.deep_inshop_uv;
                                }else{
                                    sum[key] += v[key];
                                }
                            }
                        });
                        sum = that.needCompute(sum);
                        that.$set(that, 'sumData', sum);

                        /*if(that.type === 'campaign'){
                            //var tableData = that.tableData;
                            that.$set(that, 'selection_checked', [false]);//默认店铺是不选中的
                            sum.campaign_name = '店铺汇总';
                            sum.is_account = true;
                            //tableData.splice(0, 0, sum);
                            //that.$set(that, 'tableData', tableData);
                            //that.tableData.splice(tableData.length);
                            that.tableData.splice(0, 0, sum);
                        }*/
                    //}
                    that.handleSumChart(true);
                });
            },
            handleSumChart(is_init){
                let seriesData = [], that = this;
                this.current_keys.forEach((v, i) => {
                    let tmp = {
                        name: FEILDTITLE[v],
                        data: [],
                        marker:{
                            enabled: false,
                        },
                    };
                    that.sumChartData.forEach(val => {
                        tmp.data.push(price_arr.includes(v) ? (val[v]/100).toFixed(2)-0 : val[v]);
                    });
                    seriesData.push(tmp);
                });

                //this.$set(this, 'sumSeriesData', seriesData);
                this.drawChart('chart_sum', this.xDates, seriesData);//汇总
                if(is_init){//单元对比默认也是汇总数据
                    this.drawChart('chart_compare', this.xDates, seriesData);
                }
            },
            handleCompareChart(){
                let seriesData = [], that = this;
                if(!this.selections.length){//恢复汇总
                    this.handleSumChart(true);
                    return false;
                }

                this.$set(this, 'loading', true);
                if(queryStr.is_single){//汇总报表
                    //要调接口获取分日数据，需要自己加总
                    this.getDayRpt();
                }else if(['adzone', 'target'].includes(this.type)){
                    //要调接口获取分日数据
                    let url = this.urls[this.type].compare,
                        feild = this.type+'ChartData',
                        id = this.type+'_id';
                    if(!this.is_sum){
                        url = 'ajax_get_target_adzone_day_rpts';//叉乘分日
                        feild = this.type === 'adzone' ? 'targetChartData' : 'adzoneChartData';
                        id = this.type === 'adzone' ? 'target_id' : 'adzone_id';
                    }
                    let data = this[feild];

                    let promises = this.selections.map(val => {
                        let cachedData = data[val[id]];
                        if(!that.is_sum){
                            cachedData = data[val[that.type+'_id']+'-'+val[id]];
                        }
                        if(cachedData){
                            return {success: true, data: that.is_sum ? {[val[id]]: cachedData} : {
                                [val[that.type+'_id']+'-'+val[id]]: cachedData
                            }};
                        }else{
                            return that.$http.post(url, Object.assign({
                                start_date: that.params.start_date,
                                end_date: that.params.end_date,
                                campaign_id: that.campaign_id,
                                adgroup_id: that.adgroup_id,
                                return_key_value: true
                            }, that.is_sum ? {
                                [id]: val[id],
                            } : {
                                target_id: val.target_id,
                                adzone_id: val.adzone_id,
                            } ));
                        }
                    });
                    Promise.all(promises).then(posts => {
                        let obj = {};
                        posts.map((res, a_index) => {
                            if(res.success){
                                let val = res.data, arr = that.selections;
                                if(that.is_sum){//返回key-value格式
                                    //判断长度 补零
                                    if(val[arr[a_index][that.type+'_id']].length){
                                        Object.assign(obj, val);
                                    }else{
                                        var tmp = [];
                                        for(let i=0;i<that.range;i++){
                                            tmp.push(Object.assign({
                                                log_date: {
                                                    $date: moment(that.params.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                                },
                                                campaign_id: arr[a_index].campaign_id,
                                                adgroup_id: arr[a_index].adgroup_id,
                                                adzone_id: arr[a_index].adzone_id,
                                                target_id: arr[a_index].target_id,
                                                creative_id: arr[a_index].creative_id,
                                                campaign_name: arr[a_index].campaign_name,
                                                adgroup_name: arr[a_index].adgroup_name,
                                                target_name: arr[a_index].target_name,
                                                adzone_name: arr[a_index].adzone_name,
                                                creative_name: arr[a_index].creative_name,
                                            }, DEFAULT_VALUE));
                                        }
                                        Object.assign(obj, {[arr[a_index][that.type+'_id']]: tmp});
                                    }
                                }else{//叉乘分日数据（后端一直返回数组，要自己组装）
                                    if(val.length){
                                        Object.assign(obj, {
                                            [val[0][that.type+'_id']+'-'+val[0][id]]: val
                                        });
                                    }else{//补零
                                        var tmp = [];
                                        for(let i=0;i<that.range;i++){
                                            tmp.push(Object.assign({
                                                log_date: {
                                                    $date: moment(that.params.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                                },
                                                campaign_id: arr[a_index].campaign_id,
                                                adgroup_id: arr[a_index].adgroup_id,
                                                adzone_id: arr[a_index].adzone_id,
                                                target_id: arr[a_index].target_id,
                                                creative_id: arr[a_index].creative_id,
                                                campaign_name: arr[a_index].campaign_name,
                                                adgroup_name: arr[a_index].adgroup_name,
                                                target_name: arr[a_index].target_name,
                                                adzone_name: arr[a_index].adzone_name,
                                                creative_name: arr[a_index].creative_name,
                                            }, DEFAULT_VALUE));
                                        }
                                        obj[arr[a_index][that.type+'_id']+'-'+arr[a_index][id]] = tmp;
                                    }
                                }
                            }
                        });
                        obj = Object.assign({}, that[feild], obj);
                        that.$set(that, feild, obj);
                        that.drawCompare(that[feild]);
                        this.$set(this, 'loading', false);
                    }).catch(error => {
                        this.$set(this, 'loading', false);
                    });
                }else if(['campaign', 'adgroup', 'creative'].includes(this.type)){
                    //调用勾选的计划的分日数据
                    let params = Object.assign({}, this.params);
                    let promises = this.selections.map(val => {
                        if(that.chartData[val]){
                            return {success: true, data: {[val]: that.chartData[val]}};
                        }else{
                            return that.$http.post(that.urls[that.type].compare, Object.assign({
                                start_date: that.params.start_date,
                                end_date: that.params.end_date,
                                return_key_value: true
                            }, that.type === 'campaign' ? {
                                campaign_id: val,
                            } : that.type === 'adgroup' ? {
                                campaign_id: that.campaign_id,
                                adgroup_id: val,
                            } : {
                                campaign_id: that.campaign_id,
                                adgroup_id: that.adgroup_id,
                                creative_id: val,
                            } ));
                        }
                    });
                    Promise.all(promises).then(posts => {
                        let obj = {}, arr = that.selections_back;
                        posts.map((res, a_index) => {
                            if(res.success){
                                if(res.data[arr[a_index][that.type+'_id']].length){
                                    Object.assign(obj, res.data);
                                }else{
                                    var tmp = [];
                                    for(let i=0;i<that.range;i++){
                                        tmp.push(Object.assign({
                                            log_date: {
                                                $date: moment(that.params.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                            },
                                            campaign_id: arr[a_index].campaign_id,
                                            adgroup_id: arr[a_index].adgroup_id,
                                            adzone_id: arr[a_index].adzone_id,
                                            target_id: arr[a_index].target_id,
                                            creative_id: arr[a_index].creative_id,
                                            campaign_name: arr[a_index].campaign_name,
                                            adgroup_name: arr[a_index].adgroup_name,
                                            target_name: arr[a_index].target_name,
                                            adzone_name: arr[a_index].adzone_name,
                                            creative_name: arr[a_index].creative_name,
                                        }, DEFAULT_VALUE));
                                    }
                                    Object.assign(obj, {[arr[a_index][that.type+'_id']]: tmp});
                                }
                            }
                        });
                        obj = Object.assign({}, that.chartData, obj);
                        that.$set(that, 'chartData', obj);
                        that.drawCompare(that.chartData);
                        this.$set(this, 'loading', false);
                    }).catch(error => {
                        this.$set(this, 'loading', false);
                    });
                }
            },
            getDayRpt(){//获取某计划下某单元下的创意或者资源位的报表
                //缓存汇总：adzoneChartData:{adzone_id:[7天]}，细分:creativeChartData:{campaign_id-adgroup_id-adzone_id:[7天]}
                let that = this, id = this.type + '_id', feild = this.type === 'adzone' ? 'creativeChartData' : 'adzoneChartData';

                let arr = this.selections;
                if(that.is_sum){
                    arr = [];
                    this.selections.map(val => {
                        arr = arr.concat(that.obj[val[id]]);
                    });
                }
                let promises = arr.map(val => {
                    let cachedData = that[feild][val.campaign_id+'-'+val.adgroup_id+'-'+val[id]];
                    if(cachedData){
                        return {success: true,data:{[val.campaign_id+'-'+val.adgroup_id+'-'+val[id]]: cachedData}};
                    }else{
                        return that.$http.post(that.urls[that.type].compare, {
                            start_date: that.params.start_date,
                            end_date: that.params.end_date,
                            campaign_id: val.campaign_id,
                            adgroup_id: val.adgroup_id,
                            [id]: val[id],
                            return_key_value: true
                        });
                    }
                });
                Promise.all(promises).then(posts => {
                    let single_obj = Object.assign({}, that[feild]);
                    posts.map((res, a_index) => {
                        if(res.success){
                            let val = res.data;
                            for(let key in val){
                                if(val[key].length){
                                    val[key].sort((a, b) => {return a.log_date.$date - b.log_date.$date});
                                    let v = val[key][0];
                                    single_obj[v.campaign_id+'-'+v.adgroup_id+'-'+v[id]] = val[key];
                                }else{//补零
                                    var tmp = [];
                                    for(let i=0;i<that.range;i++){
                                        tmp.push(Object.assign({
                                            log_date: {
                                                $date: moment(that.params.start_date).subtract(-(i+1), 'days').toDate().getTime()
                                            },
                                            campaign_id: arr[a_index].campaign_id,
                                            adgroup_id: arr[a_index].adgroup_id,
                                            adzone_id: arr[a_index].adzone_id,
                                            target_id: arr[a_index].target_id,
                                            creative_id: arr[a_index].creative_id,
                                            campaign_name: arr[a_index].campaign_name,
                                            adgroup_name: arr[a_index].adgroup_name,
                                            target_name: arr[a_index].target_name,
                                            adzone_name: arr[a_index].adzone_name,
                                            creative_name: arr[a_index].creative_name,
                                        }, DEFAULT_VALUE));
                                    }
                                    single_obj[arr[a_index].campaign_id+'-'+arr[a_index].adgroup_id+'-'+arr[a_index][id]] = tmp;
                                }
                            }
                        }
                    });
                    single_obj = Object.assign({}, that[feild], single_obj);
                    that.$set(that, feild, single_obj);

                    //汇总加和
                    if(that.is_sum){
                        let sumData = Object.assign({}, that[that.type+'ChartData']);
                        that.selections.map(val => {
                            if(!sumData[val[id]]){//重新计算
                                for(let i=0; i < that.range;i++){
                                    let sum = Object.assign({}, DEFAULT_VALUE);
                                    that.obj[val[id]].map(v => {
                                        for(var key in sum){
                                            if(that[feild][v.campaign_id +'-'+v.adgroup_id+'-'+v[id]] && that[feild][v.campaign_id +'-'+v.adgroup_id+'-'+v[id]][i]){
                                                if(['avg_access_page_num', 'avg_access_time'].includes(key)){
                                                    sum[key] += that[feild][v.campaign_id +'-'+v.adgroup_id+'-'+v[id]][i][key] * that[feild][v.campaign_id +'-'+v.adgroup_id+'-'+v[id]][i].deep_inshop_uv;
                                                }else{
                                                    sum[key] += that[feild][v.campaign_id +'-'+v.adgroup_id+'-'+v[id]][i][key];
                                                }
                                            }
                                        }
                                    });
                                    sum = this.needCompute(sum);
                                    let value = that.obj[val[id]][0];
                                    Object.assign(sum, {
                                        campaign_id: value.campaign_id,
                                        campaign_name: value.campaign_name,
                                        adgroup_id: value.adgroup_id,
                                        adgroup_name: value.adgroup_name,
                                        target_id: value.target_id,
                                        target_name: value.target_name,
                                        adzone_id: value.adzone_id,
                                        adzone_name: value.adzone_name,
                                        creative_id: value.creative_id,
                                        creative_name: value.creative_name
                                    });
                                    if(sumData[val[id]]){
                                        sumData[val[id]].push(sum);
                                    }else{
                                        sumData[val[id]] = [sum];
                                    }
                                }
                            }
                        });
                        that.$set(that, that.type+'ChartData', sumData);
                        that.drawCompare(sumData);
                    }else{
                        this.drawCompare(that[feild]);
                    }
                    this.$set(this, 'loading', false);
                }).catch(error => {
                    this.$set(this, 'loading', false);
                });
            },
            drawCompare(data){
                let that = this, seriesData = [],
                    is_cross_detail = !that.is_single && ['target','adzone'].includes(that.type) && !that.is_sum,
                    is_single_detail = that.is_single && !that.is_sum;

                that.current_keys.forEach(function(key, i, arr){
                    that.selections.forEach(function(id, j, a){
                        let tmp = {
                            name: '',
                            data: [],
                            marker:{
                                enabled: false,
                            },
                        };
                        let keyId = id;
                        if(that.is_single){
                            if(that.is_sum){
                                keyId = id[that.type + '_id'];
                            }else{
                                keyId = id.campaign_id+'-'+id.adgroup_id+'-'+id[that.type+'_id'];
                            }
                        }else{
                            if(['adzone','target'].includes(that.type)){
                                if(that.is_sum){
                                    keyId = id[that.type + '_id'];
                                }else{
                                    keyId = id[that.type+'_id']+'-'+id[that.type === 'adzone' ? 'target_id':'adzone_id'];
                                }
                            }
                        }

                        let flag = data[keyId];
                        if(flag.length){
                            flag.forEach(function(val, k, b){
                                if(!tmp.name){
                                    if(is_single_detail){
                                        tmp.name = FEILDTITLE[key]+'-'+val[that.type+'_name']+'-'+val.campaign_name+'-'+val.adgroup_name;
                                    }else if(is_cross_detail){
                                        tmp.name = FEILDTITLE[key]+'-'+val[that.type+'_name']+'-'+val[that.type === 'adzone'?'target_name':'adzone_name'];
                                    }else{
                                        tmp.name = FEILDTITLE[key]+'-'+val[that.type+'_name'];
                                    }
                                }
                                tmp.data.push(price_arr.includes(key) ? (val[key]/100).toFixed(2)-0 : val[key]);
                            });
                            seriesData.push(tmp);
                        }
                    });
                });
                that.drawChart('chart_compare', that.xDates, seriesData);//单元对比

                //汇总图表重画
                let choosedSumArr = [], choosedSumSeriesData = [];
                for(let i = 0; i < that.range; i++){
                    let sum = Object.assign({}, DEFAULT_VALUE);
                    that.selections.forEach(id => {
                        let keyId = id;
                        if(that.is_single){
                            if(that.is_sum){
                                keyId = id[that.type + '_id'];
                            }else{
                                keyId = id.campaign_id+'-'+id.adgroup_id+'-'+id[that.type+'_id'];
                            }
                        }else{
                            if(['adzone','target'].includes(that.type)){
                                if(that.is_sum){
                                    keyId = id[that.type + '_id'];
                                }else{
                                    keyId = id[that.type+'_id']+'-'+id[that.type === 'adzone' ? 'target_id':'adzone_id'];
                                }
                            }
                        }
                        let flag = data[keyId];
                        if(flag && flag[i]){//有数据
                            for(var key in sum){
                                if(['avg_access_page_num', 'avg_access_time'].includes(key)){
                                    sum[key] += flag[i][key] * flag[i].deep_inshop_uv;
                                }else{
                                    sum[key] += flag[i][key];
                                }
                            }
                        }
                    });
                    sum = this.needCompute(sum);
                    choosedSumArr.push(sum);
                }
                that.current_keys.forEach((key, i) => {
                    let tmp = {
                        name: FEILDTITLE[key],
                        data: [],
                        marker:{
                            enabled: false,
                        },
                    };
                    choosedSumArr.forEach(val => {
                        tmp.data.push(price_arr.includes(key) ? (val[key]/100).toFixed(2)-0 : val[key]);
                    });
                    choosedSumSeriesData.push(tmp);
                });
                that.drawChart('chart_sum', that.xDates, choosedSumSeriesData);//汇总对比
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
            handleSingle(selection, row){
                //获取所有的xxx_id
                let arr = [], key = this.type + '_id', that = this;
                console.log(selection, row, this.type)
                if(this.type === 'campaign'){
                    /*if(row.is_account){
                        //汇总的店铺的无campaign_id，相当于全选
                        if(this.tableData.length > 1){//有计划
                            let ids = [];
                            this.tableData.forEach(row => {
                                this.$refs.multiTable.toggleRowSelection(row, !this.selection_checked[0]);
                                if(!this.selection_checked[0] && row[key]){
                                    ids.push(row[key]);
                                }
                            });
                            this.$set(this, 'selections', ids);
                        }
                        this.selection_checked[0] = !this.selection_checked[0];
                    }else{
                        selection.forEach(function(val, index, array){
                            if(val[key]){//剔除总条目
                                arr.push(val[key]);
                            }
                        });*/
                        selection.forEach(function(val, index, array){
                            arr.push(val[key]);
                        });
                        this.$set(this, 'selections', arr);
                        this.$set(this, 'selections_back', selection);

                        /*if(this.selections.length === (this.tableData.length - 1)){//是否全部选中
                            this.$refs.multiTable.toggleRowSelection(this.tableData[0], true);
                            this.selection_checked[0] = true;
                        }else{
                            this.$refs.multiTable.toggleRowSelection(this.tableData[0], false);
                            this.selection_checked[0] = false;
                        }*/
                    //}
                }else if(queryStr.is_single || ['adzone', 'target'].includes(this.type)){//汇总
                    this.$set(this, 'selections', selection);
                }else if(['adgroup', 'creative'].includes(this.type)){
                    selection.forEach(function(val, index, array){
                        arr.push(val[key]);
                    });
                    this.$set(this, 'selections', arr);
                    this.$set(this, 'selections_back', selection);
                }
                this.handleCompareChart();
            },
            formatData(val, key) {
                return commafy(val, key);
            },
            changeKeys(row, column, cell, event){
                if(!cell.querySelector('.key')){//点击更多数据和日期框
                    return false;
                }
                let type = cell.querySelector('.key').getAttribute('data-key'), arr = this.current_keys;
                if(cell.querySelector('.active')){//取消选中
                    if(arr.length > 1){
                        arr.splice(arr.findIndex(val => {
                            return val === type;
                        }), 1);
                    }
                }else{//选中
                    if(arr.length >= 3){
                        arr.splice(0, 1);
                    }
                    arr.push(type);
                }
                localStorage.setItem('current_keys', arr);
                this.$set(this, 'current_keys', arr);
                this.keyChange();
            },
            keyChange(){
                if(this.selections.length > 0){
                    if(this.is_single || ['adzone', 'target'].includes(this.type)){
                        let obj = {
                            adzone: this.is_single ? 'creativeChartData' : 'targetChartData',
                            target: 'adzoneChartData',
                            creative: 'adzoneChartData',
                        };
                        var data = this[this.is_sum ? this.type+'ChartData' : obj[this.type]];
                        this.drawCompare(data);
                    }else if(['campaign', 'adgroup', 'creative'].includes(this.type)){
                        this.drawCompare(this.chartData);
                    }
                }else{
                    this.handleSumChart(true);//小于1则没有选中的，要用汇总图表数据
                }
            },
        },
        components:{
            MoreData:MoreData,
            imgModal,
        }
    }
</script>

<style scoped lang="less">
    .img-paper {
        height:80px; 
        display: flex; 
        align-items: center; 
        width: 140px;
        justify-content: center;
        background-color:#f7f7f7;
        border: 1px solid #e6e6e6;
        cursor: pointer;
        img {
            border: none;
            width: 140px;
            height: auto;
            max-height: 70px;
        }
    }
                
</style>
