<template>
    <el-dialog title="选择资源位" v-model="adzoneVisible"  :close-on-click-modal="false" size="large" :show-close="false">
        <el-form :inline="true" :model="form">
            <el-form-item label="">
                <el-select @change="handleChange" v-model="form.site_type" placeholder="请选择">
                    <el-option v-for="item of SITE_TYPE"
                      :label="item.title"
                      :value="item.value" :key="item.title"></el-option>     
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-select @change="handleChange" v-model="form.media_type" placeholder="请选择">
                    <el-option v-for="item in MEDIA_TYPE"
                      :label="item.title"
                      :value="item.value" :key="item.title"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-checkbox v-model="form.audit_passed"  @change="handleChange">是否有可用的创意</el-checkbox>
            </el-form-item>
        </el-form>
        <div>
            <paginate-table :data-list="adzones" :paginate-user-option="Object.assign(paginationOption,{total:adzones ? adzones.length : 0})" border style="width: 100%">
                <!-- <paginate-table-column type="selection" width="55"></paginate-table-column> -->
                <paginate-table-column  label="" width="55">
                    <template scope="scope">
                        <el-checkbox v-model="scope.row.checked" @change="handleSelectionChange(scope.row)"></el-checkbox>
                    </template>
                </paginate-table-column>
                <paginate-table-column prop="adzone_name" label="资源位" width="">
                    <template scope="scope">{{scope.row.adzone_name}}</template>
                </paginate-table-column>
                <!-- <paginate-table-column prop="adzone_name" label="网站行业" width="">
                    <template scope="scope">网上购物111</template>
                </paginate-table-column> -->
                <paginate-table-column prop="adzone_name" label="创意最低等级" width="">
                    <template scope="scope">{{scope.row.adzone_level}}</template>
                </paginate-table-column>
                <!-- <paginate-table-column prop="adzone_name" label="可裂变尺寸" width="">
                    <template scope="scope">11111111</template>
                </paginate-table-column> -->
                <paginate-table-column prop="adzone_name" label="资源位尺寸" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </paginate-table-column>
                <!-- <paginate-table-column prop="adzone_name" label="日均竞流量" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </paginate-table-column>
                <paginate-table-column prop="adzone_name" label="点击率" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </paginate-table-column>
                <paginate-table-column prop="adzone_name" label="上架时间" width="">
                    <template scope="scope">{{scope.row.adzone_size_list[0]}}</template>
                </paginate-table-column> -->
            </paginate-table>
        </div>

        <div slot="footer" class="dialog-footer">
            <el-button @click="closeAll">取 消</el-button>
            <el-button type="primary" @click="nextStep">{{newFlag ? '确定' : '下一步'}}</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import {SITE_TYPE, MEDIA_TYPE, ALLOW_AD_FORMAT_LIST} from '@/config'
    import bus from '@/assets/js/bus.js'
    import paginateTable from '@/components/paginate-table/table/index.js'
    import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
    let temp_checkedAdzoneIds, temp_checkedAdzone
    export default {
        props:['adzoneVisible', 'data'],
        data() {
            return {
                // 分页配置信息
                paginationOption: {
                    pageSize: 10,
                    currentPage: 1,
                    total: 1,
                },
                form:{
                    site_type:1,
                    media_type:1,
                    audit_passed:true,
                },
                SITE_TYPE:SITE_TYPE,
                MEDIA_TYPE:MEDIA_TYPE,
                adzones:[],
                checkedAdzoneIds:[],
                checkedAdzone:[],
                newFlag:this.$route.params.adgroup_id ? false : true
            }
        },
        watch:{
            adzoneVisible(curVal,oldVal){
                if(this.adzoneVisible){
                    if(this.$route.params.adgroup_id){
                        // temp_checkedAdzoneIds = []
                        // temp_checkedAdzone = []
                        this.$set(this,'checkedAdzoneIds',[])
                        this.$set(this,'checkedAdzone',[])
                    }
                    temp_checkedAdzoneIds = JSON.parse(JSON.stringify(this.checkedAdzoneIds));
                    temp_checkedAdzone = JSON.parse(JSON.stringify(this.checkedAdzone));
                    this.getAdzoneList()
                }
            },
        },
        methods:{
            handleSelectionChange(data){
                if(data.checked){
                    if(temp_checkedAdzoneIds.indexOf(data.adzone_id) < 0){
                        temp_checkedAdzoneIds.push(data.adzone_id)
                        temp_checkedAdzone.push(data)
                    } 
                } else {
                    let index = temp_checkedAdzoneIds.indexOf(data.adzone_id)
                    if(index > -1){
                        temp_checkedAdzoneIds.splice(index, 1)
                        temp_checkedAdzone.splice(index, 1)
                    }
                }
            },
            getAdzoneList(){
                let post_data = {
                    settle_type_list:[this.$route.query.type - 0],
                    audit_passed:this.form.audit_passed,
                }
                if(this.form.site_type !== 3){
                    Object.assign(post_data, {
                        site_type_list:[this.form.site_type]
                    })
                }
                if(this.form.media_type !== 3){
                    Object.assign(post_data, {
                        media_type_list:[this.form.media_type]
                    })
                }
                this.$http.post('adzone/ajax_get_adzone_list',post_data).then((res) => {
                    if (!res.success) {return false}
                    let data = res.data

                    if(data){
                        this.$set(this.paginationOption, 'total', data.length)
                        for(let item of data){
                            item.checked = this.checkedAdzoneIds.indexOf(item.adzone_id) > -1
                        }
                        this.$set(this, 'adzones', data);
                        if(this.$route.params.adgroup_id){
                            this.$set(this,'checkedAdzoneIds',[])
                            this.$set(this,'checkedAdzone',[])
                        }
                    }
                })
            },
            handleChange(){
                this.$set(this.paginationOption,'currentPage',1)
                this.getAdzoneList()
            },
            closeAll(){
                bus.$emit('closeAll', this.newFlag ? 'newAdzone' : '')             
            },
            nextStep(){
                if(temp_checkedAdzoneIds.length){
                    this.$set(this,'checkedAdzoneIds', temp_checkedAdzoneIds)
                    this.$set(this,'checkedAdzone', temp_checkedAdzone)
                    bus.$emit('nextStep',temp_checkedAdzone, this.newFlag ?  'newAdzone' : 'second')
                } else {
                    this.$alert('请至少选择一个资源位', '提示信息', {
                        confirmButtonText: '确定',
                        callback: action => {}
                    });
                }
            },
        },
        components: {paginateTable, paginateTableColumn}
    }
</script>