<template>
    <el-dialog title="选择创意" v-model="creativeVisible" :show-close="false" :close-on-click-modal="false" class="addCreative-pop">
        <el-form :inline="true">
            <el-form-item label="">
                <select v-model="size_list" placeholder="请选择" class="creativeSelect">
                    <option v-for="item of SIZE_LIST" :value="item" :key="item">{{item}}</option>
                </select>
            </el-form-item>
            <el-form-item label="">
                <select v-model="creative_level" placeholder="请选择" class="creativeSelect">
                    <option v-for="item in CREATIVE_LEVEL" :value="item.value" :key="item.title">{{item.title}}</option>
                </select>
            </el-form-item>
            <el-form-item label="">
                <select v-model="audit_status" placeholder="请选择" class="creativeSelect">
                    <option value="1" key="审核通过">审核通过</option>
                </select>
            </el-form-item>
        </el-form>
        <div class="creativesWrap">
            <p v-if="loading">数据获取中,请稍后……</p>
            <p v-else-if="!creatives.length">暂无数据</p>
            <div v-else :class="index % 4 === 3 ? 'creativeItemWrap lastCreativeItemWrap' : 'creativeItemWrap'" v-for="(item,index) of creatives">
                <div class="creativeImgItem" ><img :src="item.image_path" /></div>
                <p>
                    <el-row :gutter="10">
                        <el-col :span="18">
                            <div class="grid-content bg-purple">
                                尺寸：{{item.creative_size.width}}*{{item.creative_size.height}}
                            </div>
                        </el-col>
                        <el-col :span="6"><div class="grid-content bg-purple">
                        {{CREATIVE_LEVEL[item.creative_level] ? CREATIVE_LEVEL[item.creative_level].title : item.creative_level}}
                        </div></el-col>
                    </el-row>
                    <el-checkbox v-model="item.checked" @change="changeCheckedStatus(item)">{{item.creative_name}}</el-checkbox>
                </p>
            </div>
        </div>
        <el-pagination  :current-page="paginationOption.currentPage" :page-size="paginationOption.pageSize" layout="total, prev, pager, next" :total="paginationOption.total"  @current-change="currentChange"></el-pagination>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeAll">取 消</el-button>
            <el-button type="primary" @click="submitCrowdAdzoneCreative">确 定</el-button>
        </div>
    </el-dialog>
</template>
<script>
    import bus from '@/assets/js/bus.js'
    import {CREATIVE_LEVEL} from '@/config'
    const all_SIZE = '所有尺寸'
    export default {
        props:['creativeVisible', 'data'],
        data() {
            return {
                loading:true,
                // 分页配置信息
                paginationOption: {
                    pageSize: 12,
                    currentPage: 1,
                    total: 1,
                },
                creative_level:1,
                audit_status:1,
                size_list:all_SIZE,
                //AUDIT_STATUS:AUDIT_STATUS,
                CREATIVE_LEVEL:CREATIVE_LEVEL,
                SIZE_LIST:['所有尺寸'],
                creatives:[],
                checkedCreativeIds:[],
                checkedCreatives:[],
            }
        },
        watch: {
            data(curVal,oldVal){},
            creativeVisible(curVal,oldVal) {
                if(this.creativeVisible){
                    if(this.$route.params.adgroup_id){
                        this.getCreativeSizeList()
                        this.$set(this, 'checkedCreativeIds', [])
                        this.$set(this, 'checkedCreatives', []);
                    }
                    this.getCreativeList()
                } else {
                    this.$set(this, 'size_list', all_SIZE)
                }
            },
            creative_level(curVal,oldVal){
                this.handleChange()
            },
            audit_status(curVal,oldVal){
                this.handleChange()
            },
            size_list(curVal,oldVal){
                this.handleChange()
            },
        },
        created(){
        },
        mounted(){
            bus.$on('deleteCreative', () => {
                this.$set(this,'checkedCreatives', this.data.slice(0))
                let checkedCreativeIds = []
                for(let {creative_id} of this.checkedCreatives){
                    checkedCreativeIds.push(creative_id)
                }
                this.$set(this,'checkedCreativeIds',checkedCreativeIds)
            })
            bus.$on('updateAdzoneData', (data) => {
                let SIZE_LIST = [], max_level = 0;
                for(let item of data){
                    max_level = Math.max(max_level,item.adzone_level)
                    let size = item.adzone_size_list[0]
                    if(SIZE_LIST.indexOf(size) < 0){
                        SIZE_LIST.push(item.adzone_size_list[0])
                    }
                }
                for(let key in this.CREATIVE_LEVEL){
                    if(key - 0 > max_level){
                        delete this.CREATIVE_LEVEL[key]
                    }
                }
                this.$set(this, 'SIZE_LIST',[all_SIZE].concat(SIZE_LIST))

            })
        },
        methods:{
            changeCheckedStatus(data){
                if(data.checked){
                    if(this.checkedCreativeIds.indexOf(data.creative_id) < 0){
                        this.checkedCreativeIds.push(data.creative_id)
                        this.checkedCreatives.push(data)
                    } 
                } else {
                    let index = this.checkedCreativeIds.indexOf(data.creative_id)
                    if(index > -1){
                        this.checkedCreativeIds.splice(index, 1)
                        this.checkedCreatives.splice(index, 1)
                    }
                }
            },
            currentChange(val){
                this.$set(this.paginationOption, 'currentPage',val)
                this.getCreativeList()
            },
            getCreativeSizeList(){
                let post_data = {}, url = ''// = 'creative/ajax_get_creative_size_list'
                if(this.$route.params.adgroup_id){
                    post_data = {
                        campaign_id:this.$route.query.campaign_id - 0,
                        adgroup_id:this.$route.params.adgroup_id - 0
                    }
                    url = 'adzone/ajax_get_adzone_size_list'
                }
                this.$http.post(url ,post_data).then((res) => {
                    if (!res.success) {return false}
                    let data = res.data
                    this.$set(this, 'SIZE_LIST',[all_SIZE].concat(data))
                })
            },
            getCreativeList(){
                let post_data = {
                    page_size:this.paginationOption.pageSize,
                    page_num:this.paginationOption.currentPage,
                    creative_level: this.creative_level,
                    audit_status_list: [this.audit_status - 0]
                }
                if(this.size_list !== '所有尺寸'){
                    Object.assign(post_data, {size_list: [this.size_list]})
                } else if(!this.$route.params.adgroup_id){
                    let size_list =  this.SIZE_LIST.slice(0)
                    size_list.shift()
                    Object.assign(post_data, {size_list: size_list})
                }
                if(this.$route.params.adgroup_id){
                    Object.assign(post_data, {
                        campaign_id:this.$route.query.campaign_id - 0,
                        adgroup_id:this.$route.params.adgroup_id - 0
                    })
                }
                this.$set(this,'loading', true)
                this.$http.post('creative/ajax_get_creative_list',post_data).then((res) => {
                    if (!res.success) { return } 
                    let data = res.data
                    data.creative_list.sort(function(a,b){
                        return b.creative_size.width * 1000 * b.creative_size.height - a.creative_size.width * 1000 * a.creative_size.height
                    })
                    for(let item of data.creative_list){
                        item.checked = this.checkedCreativeIds.indexOf(item.creative_id) > -1
                    }
                    this.$set(this.paginationOption, 'total', data.total_count)
                    this.$set(this, 'creatives', data.creative_list);
                    this.$set(this,'loading', false)
                })
            },
            handleChange(){
                this.getCreativeList()
            },
            closeAll(){
                if(this.$route.params.adgroup_id){
                    bus.$emit('closeAll')
                } else {
                    bus.$emit('closeAll', 'newCreatives')
                }
            },
            submitCrowdAdzoneCreative(){
                if(this.checkedCreativeIds.length){
                    if(this.$route.params.adgroup_id){
                        bus.$emit('submitCrowdAdzoneCreative',this.checkedCreativeIds)
                    } else {
                        bus.$emit('submitCrowdAdzoneCreative',{
                            creatives:this.checkedCreatives,
                            creative_id_list:this.checkedCreativeIds},'newCreatives')
                    }
                } else {
                    this.$alert('请至少选择一个创意', '提示信息', {
                        confirmButtonText: '确定',
                        callback: action => {}
                    });
                }
            }
        },
    }
</script>
<style scoped>
    .creativesWrap {
        clear: both;
        overflow: hidden;
    }
    .creativeItemWrap {
        float: left;
        width: 24%;
        margin-right: 1%;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        font-size: 12px;
        overflow: hidden;
    }
    .lastCreativeItemWrap {
        margin-right: 0;
    }
    .creativeImgItem {
        width:100%;
        height: 175px;
        display: flex;
        align-items: center;
        overflow: hidden;
        background-color: #f1f1f1;
    }
    .creativeImgItem img{
        width:100%;
        height: auto;
        background-size:contain;
    }
    .creativeItemWrap p {
        margin: 10px 0 0;
        padding: 0 5px;
    }
    .creativeItemWrap p .el-col-6 {
        text-align: right;
        color: #5AA0FF;
    }
    .creativeItemWrap p .el-checkbox {
        margin: 5px 0;
    }
    .creativeSelect  {
        height: 30px;
        border-color: #8391a5;
        width: 100px;
        border-radius: 2px;
    }
/*    .creativeSelect option {
        height: 30px;
    }*/
</style>