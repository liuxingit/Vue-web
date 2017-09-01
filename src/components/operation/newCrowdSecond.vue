<template>
    <el-dialog :title="selected_data ? selected_data.cate_name :'设置定向'" v-model="crowdSecondVisible"  :close-on-click-modal="false" :size="selected_data && selected_data.cate_id === 7 && $route.query.type - 0 === 8 ? 'small' : 'large'" :show-close="false">
        <div v-if="selected_data">
            <div v-if="selected_data.cate_id === 2">
                <div class="crowdTitle">选择定向人群</div>
                <el-checkbox-group v-model="checkList1" class="simliarCrowd">
                    <el-checkbox v-for="{crowd_name,crowd_type} of selected_data.crowds" :label="crowd_name" :value="crowd_type" :key="crowd_name"></el-checkbox>
                </el-checkbox-group>
                <div class="crowdTitle">选择宝贝</div>
                <div v-if="getDataLoading">数据获取中,请稍后……</div>
                <paginate-table v-else-if="!getDataLoading && items" :data-list="items" :paginate-user-option="paginationOption">
                <!-- <paginate-table v-loading.table="getItemsLoading" element-loading-text="数据正在获取中" :data-list="items" :paginate-user-option="paginationOption"> -->
                    <paginate-table-column label="" width="38">
                        <template scope="scope">
                            <el-radio class="radio" v-model="selected_item_id" :label="scope.row.item_id"></el-radio>
                        </template>
                    </paginate-table-column>
                    <paginate-table-column label="宝贝信息">
                        <template scope="scope">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <img :src="scope.row.item_pic_url" width="100" height="100" />
                                </el-col>
                                <el-col :span="16">
                                    {{scope.row.item_name}}
                                </el-col>
                            </el-row>
                        </template>
                    </paginate-table-column>
                    <!-- <paginate-table-column label="人群数量">
                        <template scope="scope">
                            未知
                        </template>
                    </paginate-table-column> -->
                </paginate-table>
            </div>
            <div v-else-if="selected_data.cate_id === 3 || selected_data.cate_id === 8">
                <div class="znWrap" v-if="selected_data.cate_id === 3 && $route.query.type - 0 === 2">
                    <el-alert v-if="checkList4.indexOf('智能定向-宝贝') > -1" title="智能定向-宝贝”定向绑定的创意一定要投放到相应的宝贝页面。" type="warning" :closable="false"></el-alert>
                    <el-alert v-if="checkList4.length === 2" title="“智能定向-店铺”和“智能定向-宝贝”最好分开2个推广单元投放。" type="warning" :closable="false"></el-alert>
                    <el-checkbox-group v-model="checkList4">
                        <el-checkbox v-for="{crowd_name,crowd_type} of selected_data.crowds" :label="crowd_name" :value="crowd_type" :key="crowd_name">{{ZNDX_INFO[crowd_name]}}</el-checkbox>
                    </el-checkbox-group>
                    <!-- <paginate-table v-if="checkList4.indexOf('智能定向-宝贝') > -1" :data-list="items" :paginate-user-option="paginationOption">
                        <paginate-table-column label="" width="38">
                            <template scope="scope">
                                <el-radio class="radio" v-model="selected_item_id" :label="scope.row.item_id"></el-radio>
                            </template>
                        </paginate-table-column>
                        <paginate-table-column label="宝贝信息">
                            <template scope="scope">
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <img :src="scope.row.item_pic_url" width="100" height="100" />
                                    </el-col>
                                    <el-col :span="16">
                                        {{scope.row.item_name}}
                                    </el-col>
                                </el-row>
                            </template>
                        </paginate-table-column>
                        <paginate-table-column label="人群数量">
                            <template scope="scope">
                                未知
                            </template>
                        </paginate-table-column>
                    </paginate-table> -->
                </div>
                <el-switch v-else v-model="switch_value" on-text="" off-text=""></el-switch>
            </div>
            <div v-else-if="selected_data.cate_id === 4">
                <div v-if="getDataLoading">数据获取中,请稍后……</div>
                <paginate-table v-else-if="!getDataLoading && dmp_crowd" :data-list="dmp_crowd" :paginate-user-option="paginationOption">
                    <paginate-table-column label="" width="38">
                        <template scope="scope">
                            <el-checkbox class="checkbox" v-model="scope.row.checked" :label="scope.row.dmp_crowd_id"></el-checkbox>
                        </template>
                    </paginate-table-column>
                   <!--  <paginate-table-column type="selection" width="55"></paginate-table-column> -->
                    <paginate-table-column label="人群名称">
                        <template scope="scope">
                            {{scope.row.dmp_crowd_name}}
                        </template>
                    </paginate-table-column>
                    <!-- <paginate-table-column label="人群描述">
                        <template scope="scope">
                            具体的描述信息
                        </template>
                    </paginate-table-column>
                    <paginate-table-column label="人群相关度">
                        <template scope="scope">
                            具体的描述信息
                        </template>
                    </paginate-table-column> -->
                    <paginate-table-column label="全网人群数量">
                        <template scope="scope">
                            {{scope.row.coverage}}
                        </template>
                    </paginate-table-column>
                    <paginate-table-column label="初次同步时间">
                        <template scope="scope">
                            {{scope.row.enable_time}}
                        </template>
                    </paginate-table-column>
                </paginate-table>
            </div>
            <div v-else-if="selected_data.cate_id === 5 || selected_data.cate_id === 6">
                <el-row :gutter="20" v-if="selected_data.cate_id === 6 || selected_data.cate_id === 5">
                    <el-col :span="12">
                        <div class="grid-content bg-purple">
                            <div v-if="getDataLoading">数据获取中,请稍后……</div>
                            <paginate-table v-else-if="!getDataLoading && all_data" class="addTable" :data-list="all_data" :paginate-user-option="paginationOption" :row-class-name="rowClassName">
                                <el-table-column type="expand" width="30" v-if="selected_data.cate_id === 5 && $route.query.type - 0 === 8">
                                    <template scope="scope">
                                        <el-table v-if="scope.row.sub_labels && scope.row.sub_labels.length" :show-header="false" :data="scope.row.sub_labels" style="width: 100%">
                                            <el-table-column  width="30"></el-table-column>
                                            <el-table-column>
                                                <template scope="props">
                                                    --{{props.row.name}}
                                                </template>
                                            </el-table-column>
                                            <el-table-column width="150" label="操作">
                                                <template scope="props">
                                                    <el-button @click="addSimilarShop(props.row, scope.row.name)" type="text">添加</el-button>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                        <table
                                    </template>
                                </el-table-column>
                                <paginate-table-column :label="selected_data.cate_id === 6 ? '店铺推荐标签' : $route.query.type - 0 === 8 ? '定向标签' : '标签'">
                                    <template scope="scope">
                                        {{selected_data.cate_id === 6 ? scope.row.seller_name : $route.query.type - 0 === 8 ? scope.row.name : scope.row.interest_name}}
                                    </template>
                                </paginate-table-column>
                                <paginate-table-column width="150" label="操作">
                                    <template scope="scope">
                                        <el-button @click="addSimilarShop(scope.row)" type="text">添加</el-button>
                                    </template>
                                </paginate-table-column>
                            </paginate-table>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="grid-content bg-purple">
                            <paginate-table :data-list="add_data" :paginate-user-option="paginationOption2">
                                <paginate-table-column :label="selected_data.cate_id === 6 ? '店铺推荐标签' : $route.query.type - 0 === 8 ? '定向标签' : '标签'">
                                    <template scope="scope">
                                        {{selected_data.cate_id === 6 ? scope.row.seller_name : $route.query.type - 0 === 8 ? scope.row.name : scope.row.interest_name}}
                                    </template>
                                </paginate-table-column>
                                <paginate-table-column width="150" label="操作">
                                    <template scope="scope">
                                        <el-button @click="deleteSimilarShop(scope.row)" type="text" class="textDanger">移除</el-button>
                                    </template>
                                </paginate-table-column>
                            </paginate-table>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <div v-else-if="selected_data.cate_id === 7">
                <el-checkbox-group v-if="$route.query.type - 0 === 8" v-model="checkList2">
                    <p v-for="{crowd_name,crowd_type} of selected_data.crowds" :key="crowd_name">
                        <el-checkbox :label="crowd_name" :value="crowd_name" class="yxItem2"></el-checkbox> <span class="info">{{YX_INFO[crowd_name]}}</span>
                    </p>
                </el-checkbox-group>
                <div v-else v-for="({crowd_name,crowd_type,sub_crowds},index) of selected_data.crowds" :key="crowd_name" class="yxWrap">
                    <div class="yxLeft">
                        <el-checkbox  class="yxItem" :label="crowd_name" @change="handleCheckAllChange" v-model="checkList3[index].checkAll">{{crowd_name}}</el-checkbox>
                    </div>
                    <div class="yxRight">
                        <el-checkbox-group class="yxItem"  @change="handleCheckedItemChange" v-model="checkList3[index].checkedItem">
                            <el-checkbox v-for="{sub_crowd_name} of sub_crowds" :label="sub_crowd_name" :key="sub_crowd_name">{{sub_crowd_name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                </div>
            </div>
            <div v-else-if="selected_data.cate_id === 9">  
                <el-form ref="form" :model="catelabel_form" label-width="100px" label-position="top">
                    <el-form-item class="labelTitle" label="系统推荐标签">
                        <el-checkbox-group class="labelWrap" v-model="catelabel_form.checked_arr">
                            <el-checkbox :label="catelabel[0] && catelabel[0].cate_name"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item  class="labelTitle" label="其他标签">
                        <el-checkbox-group class="labelWrap" v-model="catelabel_form.checked_arr">
                            <el-checkbox v-if="index" v-for="({cate_id, cate_name},index) of catelabel" :label="cate_name" :key="cate_name">{{cate_name.length > 10 ? cate_name.substring(0,10) + '……' : cate_name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
            </div>
        </div>
 
        <div slot="footer" class="dialog-footer">
            <el-button @click="prevStep">{{newFlag ? '取消' : '上一步'}}</el-button>
            <el-button type="primary" @click="nextStep">{{newFlag ? '确定' : '下一步'}}</el-button>
        </div>
    </el-dialog>
</template>
<script>
    // import 'element-ui/lib/theme-default/index.css'
    // import {Select, Button} from 'element-ui'
    import bus from '@/assets/js/bus.js'
    import {YX_INFO, ZNDX_INFO} from '@/config'
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    
    export default {
        props:['crowdSecondVisible', 'selected_data'],
        data() {
            return {
                // 分页配置信息
                paginationOption: {
                    pageSize: 20,
                    currentPage: 1,
                    total: 1,
                },
                paginationOption2: {
                    pageSize: 20,
                    currentPage: 1,
                    total: 1,
                },
                catelabel:[],//存放群体定向的数据
                catelabel_form:{
                    checked_arr:[]
                },//存放群体定向的选中数据
                ZNDX_INFO:ZNDX_INFO,
                YX_INFO:YX_INFO,
                selected_item_id:null,//选中的宝贝
                multipleSelection:[],//选中的表格数据
                all_data:[],//访客定向相似店铺
                add_data:[],
                items:null,//存放宝贝相关数据
                dmp_crowd:[],//存放人群相关的数据
                checkList1:[],
                checkList2:[],//cpc 营销场景
                checkList3:[],//cpm 营销场景
                checkList4:[],//智能定向
                switch_value:false,
                adgroup_adzone:null,//存放推广单元的资源位数据
                newFlag:this.$route.params.adgroup_id ? false : true,
                getDataLoading:false,
                // getDmpLoading:false,
            }
        },
        watch: {
            selected_data(val) {
                let need_deal_key = ['all_data', 'add_data','checkList1','checkList2','checkList3','checkList4','dmp_crowd']
                for(let key of need_deal_key){
                    this.$set(this, key, [])
                }
                this.$set(this, 'paginationOption', {
                    pageSize: 20,
                    currentPage: 1,
                    total: 1,
                })
                this.$set(this, 'switch_value', false)
                
                if(this.selected_data.cate_id === 2){
                    this.getItemsList()
                    let checkList1 = []
                    for({crowd_name} of this.selected_data.crowds){
                        checkList1.push(crowd_name)
                    }
                    this.$set(this,'checkList1',checkList1)
                } else if(this.selected_data.cate_id === 4){
                    this.getDmpList()
                } else if(this.selected_data.cate_id === 9){
                    this.getCatelabelList()
                } else if(this.selected_data.cate_id === 7){
                    if(this.$route.query.type - 0 === 2){
                        let checkList3 = []
                        for(let {crowd_name,sub_crowds} of this.selected_data.crowds){
                            let items = []
                            for(let {sub_crowd_name} of sub_crowds){
                                items.push(sub_crowd_name)
                            }
                            checkList3.push({
                                checkAll: false,
                                checkedItem: [],
                                items: items
                            })
                        }
                        this.$set(this, 'checkList3', checkList3)
                    }
                } else if(this.selected_data.cate_id === 6){
                    this.getSimilarShopList()
                } else if(this.selected_data.cate_id === 5){
                    if(this.$route.query.type - 0 === 8){
                        this.getLabelList()
                    } else {
                        this.getInterestList()
                    }
                }
            },
            checkList4(val) {
                if(this.checkList4.indexOf('智能定向-宝贝') > -1){
                    if(!this.items.length){
                        this.getItemsList()
                    }
                }
            }
        },
        // mounted(){
        //     bus.$on('resetData', (val,type) => {
        //         if(type === 'adgroup') {this.getRpt(val)}
        //     }),
        // },
        methods:{
            rowClassName(row, index){
                return row.sub_labels && row.sub_labels.length ? 'showSubLabels' : 'hideSubLabels'
            },
            addSimilarShop(data, parent_name){
                let temp_data = Object.assign(true, {}, data)
                let has_flag = false
                let key = this.selected_data.cate_id === 6 ? 'seller_id' : this.$route.query.type - 0 === 8 ? 'target_id' : 'interest_id'
                console.log(temp_data, parent_name)
                for(let item of this.add_data){
                    if(temp_data[key] === item[key]){
                        has_flag = true;
                    }

                }
                if(!has_flag){
                    temp_data.name = (parent_name ? parent_name + '--' : '') +  data.name
                    this.add_data.push(temp_data)
                    this.$set(this.paginationOption2,'total', this.add_data.length)
                }
            },
            deleteSimilarShop(data){
                this.add_data.splice(this.add_data.indexOf(data),1)
                this.$set(this.paginationOption2,'total', this.add_data.length)
            },
            selectedItemchange(value){
                this.$set(this, 'selected_item_id', value);
            },
            handleCheckAllChange(event) {
                for(let [index, {checkAll, checkedItem, items}] of this.checkList3.entries()){
                    this.checkList3.splice(index, 1, {
                        checkAll:checkAll,
                        items:items,
                        checkedItem: checkAll ? items.slice(0) : []
                    })
                }
            },
            handleCheckedItemChange(){
                for(let [index, {checkAll, checkedItem, items}] of this.checkList3.entries()){
                    this.checkList3.splice(index, 1, {
                        checkAll:checkedItem.length === items.length,
                        items:items,
                        checkedItem:checkedItem
                    })
                }
            },
            // handleSelectionChange(val){
            //     console.log(11111111,val)
            //     this.multipleSelection = val;
            // },
            getItemsList(){
                this.$set(this,'getDataLoading',true)
                this.$http.post('item/ajax_get_item_list',{}).then((res) => {
                    this.$set(this,'getDataLoading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        this.$set(this, 'items', data);
                    }
                })
            },
            getInterestList(){
                this.$set(this,'getDataLoading',true)
                this.$http.post('crowd/ajax_get_interest_list',{}).then((res) => {
                    this.$set(this,'getDataLoading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        this.$set(this, 'all_data', data);
                        this.$set(this, 'add_data', []);
                    }
                })
            },
            getLabelList(){
                this.$set(this,'getDataLoading',true)
                this.$http.post('crowd/ajax_get_label_list',{}).then((res) => {
                    this.$set(this,'getDataLoading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        this.$set(this, 'all_data', data);
                        this.$set(this, 'add_data', []);
                    }
                })
            },
            getSimilarShopList(){
                this.$set(this,'getDataLoading',true)
                this.$http.post('crowd/ajax_get_similar_shop_list',{}).then((res) => {
                    this.$set(this,'getDataLoading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        this.$set(this, 'all_data', data);
                        this.$set(this, 'add_data', []);
                    }
                })
            },              
            getCatelabelList(){
                this.$http.post('crowd/ajax_get_catelabel_list',{}).then((res) => {
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this, 'catelabel', data);
                    }
                })
            },
            getDmpList(){
                this.$set(this,'getDataLoading',true)
                this.$http.post('crowd/ajax_get_dmp_list',{}).then((res) => {
                    this.$set(this,'getDataLoading',false)
                    if (!res.success) { return } 
                    let data = res.data
                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        for(let item of data){
                            item.checked =false
                        }
                        this.$set(this, 'dmp_crowd', data);
                    }
                })
            },
            getAdgroupAdzoneList(){
                if(this.adgroup_adzone){
                    this.setAdzoneCrowd()
                } else {
                    this.$http.post('adzone/ajax_get_adgroup_adzone_list',{
                        campaign_id: this.$route.query.campaign_id - 0,
                        adgroup_id: this.$route.params.adgroup_id - 0,
                    }).then((res) => {
                        if (!res.success) { return } 
                        let data = res.data
                        if(data){
                            for(let item of data){
                                item.price = null
                            }
                            this.$set(this,'adgroup_adzone', data)
                            this.setAdzoneCrowd()
                        }
                    })
                    
                }
            },
            setAdzoneCrowd(){
                for(let item of this.data){
                    let adgroup_adzone = []
                    for(let {adzone_name, adzone_id, price} of this.adgroup_adzone){
                        adgroup_adzone.push({
                            adzone_name:adzone_name,
                            adzone_id:adzone_id,
                            price:price
                        })
                    }
                    item.adgroup_adzone = adgroup_adzone
                }
            },
            prevStep(){
                if(this.newFlag){
                    bus.$emit('closeAll', 'newcrowd')
                } else {
                    bus.$emit('prevStep')
                }
            },
            nextStep(type){
                let error, setting_data;
                if(this.selected_data.cate_id === 3 || this.selected_data.cate_id === 8){
                    if(this.selected_data.cate_id === 3 && this.$route.query.type - 0 === 2){
                        if(this.checkList4.length){
                            let temp_data = []
                            for(let item of this.selected_data.crowds){
                                if(this.checkList4.indexOf(item.crowd_name) > -1){
                                    let temp_item = Object.assign({},item)
                                    if(item.crowd_name === '智能定向-宝贝'){
                                        if(this.selected_item_id){
                                            for(let {item_id, item_name} of this.items){
                                                if(item_id ===  this.selected_item_id){
                                                    temp_item.sub_crowds.push({
                                                        sub_crowd_name:item_name,
                                                        sub_crowd_value:item_id
                                                    })
                                                    temp_item.crowd_value = item_id
                                                    break;
                                                }
                                            }
                                        } else {
                                            this.$alert('请选择一个宝贝', '提示信息', {
                                                confirmButtonText: '确定',
                                                callback: action => {}
                                            });
                                        }
                                        
                                    }
                                    temp_data.push(temp_item)
                                }
                            }
                            
                            setting_data = temp_data
                            bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                        } else {
                            this.$alert('请至少选择一个子定向', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                        }
                    } else {
                        if(this.switch_value){
                            setting_data = this.selected_data.crowds.slice(0)
                            for(let item of setting_data){
                                item.sub_crowds = []
                            }
                            bus.$emit('nextStep', setting_data, 'third')
                        } else {
                            this.$alert('请开启后再进入下一步', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                        }
                    }
                } else if(this.selected_data.cate_id === 7){
                    if(this.$route.query.type - 0 === 8){
                        if(this.checkList2.length){
                            let temp_data = []
                            for(let item of this.selected_data.crowds){
                                if(this.checkList2.indexOf(item.crowd_name) > -1){
                                    temp_data.push(Object.assign({},item,{crowd_name:this.selected_data.cate_name}))
                                }
                            }
                            
                            setting_data = temp_data
                            bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                        } else {
                            this.$alert('请至少选择一个子定向', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                        }
                    } else {
                        let count = 0
                        for(let {checkedItem} of this.checkList3){
                            count = checkedItem.length
                            if(count){
                                break
                            }
                        }
                        if(count){
                            let temp_data = []
                            for(let [index, item] of this.selected_data.crowds.entries()){
                                if(this.checkList3[index].checkedItem.length){
                                    let temp_sub_crowds = []
                                    for(let {sub_crowd_name, sub_crowd_value} of item.sub_crowds){
                                        if(this.checkList3[index].checkedItem.indexOf(sub_crowd_name) > -1){
                                            temp_sub_crowds.push({
                                                sub_crowd_name:sub_crowd_name,
                                                sub_crowd_value:sub_crowd_value
                                            })
                                        }
                                    }
                                    if(temp_sub_crowds.length){
                                        temp_data.push(Object.assign({},item,{
                                            sub_crowds:temp_sub_crowds
                                        }))
                                    }
                                }
                            }
                            setting_data = temp_data
                            bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                        } else {
                            this.$alert('请至少选择一个子定向', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                        }
                    }
                } else if(this.selected_data.cate_id === 2){
                    if(this.checkList1.length && this.selected_item_id){
                        let temp_data = []
                        for(let item of this.selected_data.crowds){
                            if(this.checkList1.indexOf(item.crowd_name) > -1){
                                let temp_item = Object.assign({},item)
                                for(let {item_id, item_name} of this.items){
                                    if(item_id ===  this.selected_item_id){
                                        temp_item.sub_crowds = [{
                                            sub_crowd_name:item_name,
                                            sub_crowd_value:item_id
                                        }]
                                        break;
                                    }
                                }
                                temp_data.push(temp_item)
                            }
                        }
                        setting_data = temp_data
                        bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                    } else {
                        this.$alert('请至少选择一个子定向和一个宝贝', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    }
                } else if(this.selected_data.cate_id === 9){
                    if(this.catelabel_form.checked_arr.length){
                        setting_data = this.selected_data.crowds.slice(0)   
                        //crowds是数组
                        for(let item of this.catelabel){
                            if(this.catelabel_form.checked_arr.indexOf(item.cate_name) > -1){
                                setting_data[0].sub_crowds.push({
                                    sub_crowd_name:item.cate_name,
                                    sub_crowd_value:item.cate_id,
                                })
                            }
                        }
                        bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                    } else {
                        this.$alert('请至少选择一条数据', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    }
                } else if(this.selected_data.cate_id === 5 || this.selected_data.cate_id === 6){
                    if(this.add_data.length){
                        let temp_data = [],key_id, key_name
                        if(this.selected_data.cate_id === 5 && this.$route.query.type - 0 === 8){
                            key_id = 'target_id';
                            key_name = 'name';
                            let temp_item = this.selected_data.crowds[0]
                            for(let item of this.add_data){
                                temp_data.push(Object.assign({}, temp_item,{
                                    crowd_name:this.selected_data.cate_name,
                                    sub_crowds:[{
                                        sub_crowd_value:item[key_id],
                                        sub_crowd_name:item[key_name]
                                    }]
                                }))
                            }
                        } else {
                            if(this.selected_data.cate_id === 6){
                                key_id = 'seller_id';
                                key_name = 'seller_name';
                            } else {
                                key_id = 'interest_id';
                                key_name = 'interest_name';
                            }
                            let temp_item = this.selected_data.crowds[0]
                            temp_item.sub_crowds = []
                            for(let item of this.add_data){
                                temp_item.sub_crowds.push({
                                    sub_crowd_value:item[key_id],
                                    sub_crowd_name:item[key_name]
                                })
                            }
                            temp_data.push(temp_item)
                        }
                        setting_data = temp_data
                        bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                    } else {
                        this.$alert('请至少选择一条数据', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    }
                } else if (this.selected_data.cate_id === 4){
                    let setting_data = []
                    for(let item of this.dmp_crowd){
                        if(item.checked){
                            setting_data.push({
                                crowd_name:this.selected_data.crowds[0].crowd_name ? this.selected_data.crowds[0].crowd_name : this.selected_data.cate_name,
                                crowd_type:this.selected_data.crowds[0].crowd_type,
                                crowd_value:this.selected_data.crowds[0].crowd_value ? this.selected_data.crowds[0].crowd_value : item.dmp_crowd_id,
                                sub_crowds:[{
                                    sub_crowd_name:item.dmp_crowd_name,
                                    sub_crowd_value:item.dmp_crowd_id
                                }],
                                sub:item.sub
                            })
                        }
                    }
                    if(setting_data.length){
                        bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                    } else {
                        this.$alert('请至少选择一条数据', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    }
                } else {
                    if(this.multipleSelection.length){
                        bus.$emit('nextStep', setting_data, this.newFlag ? 'newcrowd' : 'third')
                    } else {
                        this.$alert('请至少选择一条数据', '提示信息', {
                            confirmButtonText: '确定',
                            callback: action => {}
                        });
                    }
                }
            },
        },
        components:{paginateTable, paginateTableColumn}
    }
</script>
<style scoped>
    .simliarCrowd {
        margin-bottom: 20px
    }
    .crowdTitle {
        margin-bottom: 10px;
    }
    .yxItem2 {
        margin:10px 0;
    }
    .yxItem2 .el-checkbox__label {
        font-size:14px;
    }
    .info {
        font-size:12px;
        color:#666666;
    }
    .yxWrap {
        clear: both;
        overflow: hidden;
        border: 1px solid #cccccc;
        border-left: none;
        margin-top: -1px;
    }
    .yxLeft,.yxRight {
        float:left;
    }
    .yxLeft {
        background-color:#D9E7FD;
    }
    .yxItem {
        padding:20px;
        border-left:1px solid #cccccc;
    }
    .znWrap {
        margin-bottom: 20px;
    }
    .znWrap .el-alert {
        margin-bottom: 10px;
    }
    .znWrap .el-checkbox{
        display: block;
        margin:0 0 20px 0;
    }
    .labelWrap .el-checkbox+.el-checkbox {
        margin-left: 0;
    }
    .labelWrap .el-checkbox{
        margin-right: 15px;
        width: 118px
    }
    .labelWrap .el-checkbox__label {
        font-size: 12px;
        color:#666666;
    }
    .labelTitle .el-form-item__label {
        font-size:14px;
    }
    /*.hideSubLabels .el-table__expand-icon>.el-icon {
        display: none;
    }*/
</style>