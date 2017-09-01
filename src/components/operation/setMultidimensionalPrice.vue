<template>
    <el-dialog title="设置出价" v-model="multiplePriceVisible" :close-on-click-modal="false" size="large"  :show-close="false">
        <div v-loading="submitLoading" element-loading-text="正在提交数据，请稍后……">
            <el-table class="addTable" :data="data" style="width: 100%" :show-header="false" fit :default-expand-all="true">
                <el-table-column type="expand" width="30">
                    <template scope="scope">
                        <el-table :show-header="false" :data="scope.row.sub" style="width: 100%">
                            <el-table-column  width="30"></el-table-column>
                            <el-table-column>
                                <template scope="props">
                                    --{{props.row.name}}
                                </template>
                            </el-table-column>
                            <el-table-column>
                                <template scope="props">
                                    <el-row>
                                        <el-col :span="12">
                                            <el-input placeholder="请填写出价" v-model="props.row.price"></el-input>
                                        </el-col>
                                        <el-col :span="12">元</el-col>
                                    </el-row>
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template scope="scope">
                    {{scope.row[set_type + '_name']}}
                    {{setSubName(scope.row)}}
                    <!-- {{scope.row.sub_crowds ? scope.row.sub_crowds.length ? scope.row.sub_crowds.len '：' + scope.row.sub_crowds[0].sub_crowd_name}} -->
                    </template>
                </el-table-column>
                <el-table-column>
                    <template scope="scope">
                        <el-row>
                            <el-col :span="12">
                                <el-input placeholder="批量出价" @change="changeBatchPrice" @focus="focusAdzoneInput(scope.row)" v-model="scope.row.price"></el-input>
                            </el-col>
                            <el-col :span="12">元</el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="!submitLoading" slot="footer" class="dialog-footer">
            <el-button @click="closePrice">上一步</el-button>
            <el-button type="primary" @click="submitCrowdAdzoneCreative">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import '@/components/operation/setMultidimensionalPrice.less'
    import bus from '@/assets/js/bus.js'
    const SET_TYPE = {
        crowd:{
            sub_key:'adzone',
            url:'adzone/ajax_get_adgroup_adzone_list'
        },
        adzone:{
            sub_key:'crowd',
            url:'crowd/ajax_get_adgroup_crowd_list'
        }
    }
    export default {
        props:['multiplePriceVisible', 'check_data', 'set_type', 'selected_data'],
        data() {
            return {
                data:null,//已经选择的资源位数据
                multipleSelection:[],
                sub:null,
                cur_name:null,
                SET_TYPE:SET_TYPE,
                defaultProps: {
                  children: 'children',
                  label: 'label'
                },
                submitLoading:false
            }
        },
        watch: {
            check_data(curVal,oldVal){
                console.log('渲染价格的数据',this.check_data)
                this.getData()
            },
            set_type(curVal,oldVal) {},
            selected_data(curVal,oldVal) {
                console.log(this.selected_data,'>>>>>selected_data')
            },
            multiplePriceVisible(curVal,oldVal){
                this.$set(this,'submitLoading',false)
                console.log(this.submitLoading,111111111111)
            }
        },
        methods:{
            setSubName(data){
                let sub_crowds = data.sub_crowds
                if(!sub_crowds || !sub_crowds.length){
                    return ''
                } else {
                    let sub_name = []
                    if(sub_crowds.length){
                        for({sub_crowd_name} of sub_crowds){
                            sub_name.push(sub_crowd_name)
                        }
                    }
                    return '：' + sub_name.join(',')
                }
            },
            getData(){
                let data = this.check_data.slice(0)
                for(let item of data){
                    item.price = null
                }
                this.$set(this,'data', data)
                this.getSubList()
            },
            getSubList(){
                this.$http.post(SET_TYPE[this.set_type].url,{
                    campaign_id: this.$route.query.campaign_id - 0,
                    adgroup_id: this.$route.params.adgroup_id - 0,
                }).then((res) => {
                    if (!res.success) { return } 
                    let data = res.data
                    for(let item of data){
                        item.price = null
                    }
                    this.$set(this,'sub', data)
                    this.setSub()
                })
            },
            setSub(){
                for(let [index, item] of this.data.entries()){
                    let sub = []
                    for(let sub_item of this.sub){
                        sub.push({
                            crowd_type:this.set_type === 'crowd' ? null : sub_item.crowd_type,
                            name:this.set_type === 'crowd' ? sub_item[SET_TYPE[this.set_type].sub_key + '_name'] : sub_item.crowd_name_for_display,
                            id:sub_item[SET_TYPE[this.set_type].sub_key + '_id'],
                            price:null,//sub_item.price
                        })
                    }
                    console.log(sub)
                    this.data.splice(index, 1, Object.assign(item, {sub:sub}))
                }
            },
            focusAdzoneInput(data){
                let name = data[this.set_type + '_name']
                if(data.sub_crowds && data.sub_crowds.length){
                    name += data.sub_crowds[0].sub_crowd_name
                }
                this.$set(this,'cur_name', name)
            },
            changeBatchPrice(value){
                // console.log(data1,data2)
                // return false
                // console.log(this.cur_name,'当前的id')
                if(isNaN(value) || value - 0 < 0 || Math.round((value - 0) * 100) !== (value - 0) * 100){
                    this.$alert('数据应为大于0的合法数值，最多两位小数', '提示信息', {
                        confirmButtonText: '确定',
                        callback: action => {}
                    });
                    return false
                } else {
                    for(let item of this.data){
                        let name = item[this.set_type + '_name']
                        if(item.sub_crowds && item.sub_crowds.length){
                            name += item.sub_crowds[0].sub_crowd_name
                        }
                        if(name === this.cur_name){
                            for(let [index,sub] of item.sub.entries()){
                                sub.price = value - 0
                                console.log(index, sub,222222222)
                            }
                            break;
                        }
                    }
                }
            },
            closePrice(){
                this.$set(this,'submitLoading', false)
                bus.$emit('closePrice')             
            },
            submitCrowdAdzoneCreative(){
                let post_data = []
                for(let item of this.data){
                    let sub = item.sub;
                    let matrix_prices = []
                    for(let sub_item of sub){
                        let {price, name, id} = sub_item
                        if(isNaN(price) || price - 0 <= 0 || Math.round((price - 0) * 100) !== (price - 0) * 100){
                            this.$alert('数据应为大于0的合法数值，最多两位小数', '提示信息', {
                                confirmButtonText: '确定',
                                callback: action => {}
                            });
                            return false
                        }
                        let matrix_prices_item = {
                            [SET_TYPE[this.set_type].sub_key + '_id']:id,
                            price:Math.round(price * 100)
                        }
                        if(this.set_type === 'adzone'){
                            Object.assign(matrix_prices_item, {crowd_type:sub_item.crowd_type})
                        }
                        matrix_prices.push(matrix_prices_item)
                    }
                    console.log(item,'===============')
                    let post_item = JSON.parse(JSON.stringify(Object.assign({},item, {matrix_prices:matrix_prices})))
                    let delete_arr = ['price','sub', 'adzone_size_list', 'allow_ad_format_list','allow_adv_type','media_type','adzone_name', 'adzone_level','coverage','enable_time','update_time', 'crowd_id','checked']
                    for(let key of delete_arr){
                        delete post_item[key]
                    }
                    post_data.push(post_item)
                }
                console.log(this.selected_data,'>>>>>>>')
                if(this.selected_data && this.selected_data.cate_id && (this.selected_data.cate_id === 4 || this.selected_data.cate_id === 5)) {//达摩盘定向  + 行业店铺
                    for(let crowd of post_data){
                        crowd.crowd_name = crowd.sub_crowds[0].sub_crowd_name
                        crowd.crowd_value = crowd.crowd_value ? crowd.crowd_value : crowd.sub_crowds[0].sub_crowd_value
                    }
                }
                console.log(post_data, '新增的数据')
                this.$set(this,'submitLoading', true)
                bus.$emit('submitCrowdAdzoneCreative', post_data)
            }
        },
    }
</script>