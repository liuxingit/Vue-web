<template>
    <div class="moreDataWrap">
        <div class="MoreDataIcon" v-if="type === 'allRpt'" @click="dialogMoreDataVisible = true">
            <i class="iconfont">&#xe60e;</i>
        </div>
        <div class="MoreDataBtn" v-else @click="dialogMoreDataVisible = true">
            <el-button class="light-blue-btn">更多数据</el-button>
        </div>
       <!--  <span v-else style="font-size:20px;font-weight:700;text-align:center;width:110px;display:inline-block;float:right" @click="dialogMoreDataVisible = true">……</span> -->
        <el-dialog title="更多数据" class="moreDataDialog" v-model="dialogMoreDataVisible" :close-on-click-modal="false" :modal="false">
            <div class="drag">
                <el-row :gutter="20">
                    <el-col :span="15">
                        <div class="grid-content bg-purple left">
                        <div class="title">
                            <span>选择度量</span>
                            <span class="reset" @click="updateRptSetting(true)">恢复默认设置</span>
                        </div>
                            <div v-model="list" class="dragArea">
                                <div class="dragItem" v-for="element in list">
                                    <el-checkbox v-model="element.checked" @change.stop.prevent="changeChecked(element)">{{element.name}}</el-checkbox>
                                </div>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="9">
                        <div class="grid-content bg-purple right">
                        <span style="font-size:12px">列表</span>
                        <draggable v-model="list2" class="dragArea" style="margin-top:10px; height:400px;" :options="{group:'people'}">
                            <div class="dragItem" v-for="element in list2">{{element.name}}</div>
                        </draggable>
                    </div>
                    </el-col>
                </el-row>
            </div>
            <p class="textDanger" v-if="error">请至少选择一个度量</p>
            <div slot="footer" class="dialog-footer">
                <el-button @click.stop="dialogMoreDataVisible = false">取 消</el-button>
                <el-button type="primary" @click.stop="updateRptSetting(false)">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '@/assets/js/bus.js'
    import draggable from 'vuedraggable'
    import {FEILDTITLE, FEILDTITLE2, ORI_MORE_DATA_COLUMNS} from '@/config'
    export default {
        props:['type'],
        data () {
            return {
                list:[],
                list2:[],
                dialogMoreDataVisible:false,
                showDefaultMenu:false,
                error:false
            }
        },
        watch:{
            dialogMoreDataVisible(val) {
                console.log('=========',val)
                this.$set(this,'showDefaultMenu',false)
                if (val) {
                    this.getList()
                    this.getList2()
                }
            }
        },
        computed:{
            RPT_SETTING(){
                if(this.type){
                    return this.type === 'allRpt' ? this.$store.state.plan.RPT_COLUMNS : this.$store.state.plan.ZZRPT_COLUMNS
                }
                return this.$store.state.plan.RPT_SETTING
            },
            ORI_COLUMNS() {
                if (this.type) {
                    return this.type === 'allRpt' ? ORI_MORE_DATA_COLUMNS.rpt : ORI_MORE_DATA_COLUMNS.zz
                }
                return ORI_MORE_DATA_COLUMNS.default
            }
        },
        methods: {
            getList(reset){
                console.log(ORI_MORE_DATA_COLUMNS, ORI_MORE_DATA_COLUMNS.rpt)
                let all_data = [], temp_FEILDTITLE2 = this.type && this.type === 'zzRpt' ? FEILDTITLE2 : FEILDTITLE
                for(let key in temp_FEILDTITLE2){
                    all_data.push({
                        key:key,
                        checked: reset ? this.ORI_COLUMNS.includes(key) : this.RPT_SETTING.includes(key),
                        name: temp_FEILDTITLE2[key]
                    })
                }
                
                this.$set(this,'list',all_data)
                console.log(all_data.length)
            },
            getList2(reset){
                let all_data = [],temp_FEILDTITLE2 = this.type && this.type === 'zzRpt' ? FEILDTITLE2 : FEILDTITLE
                const columnsRight = reset ? this.ORI_COLUMNS : this.RPT_SETTING
                for(let item of columnsRight){
                    all_data.push({
                        key:item,
                        name:temp_FEILDTITLE2[item]
                    })
                }
                this.$set(this,'list2',all_data)
                console.log(all_data.length)
            },
            changeChecked(data){
                console.log(77777,this.dialogMoreDataVisible)
                if(data.checked){
                    this.error && this.$set(this,'error',false)
                    this.list2.push({
                        key:data.key,
                        name:data.name
                    })
                } else {
                    for(let [index, item] of this.list2.entries()){
                        if(item.key === data.key){
                            this.list2.splice(index, 1)
                        }
                    }
                }
            },
            getSettingName(){
                let funName = '', storageName = ''
                if(this.type){
                    if(this.type === 'allRpt'){
                        funName = 'setRptColumns',
                        storageName = 'RPT_COLUMNS'
                    } else {
                        funName = 'setZZRptColumns',
                        storageName = 'ZZRPT_COLUMNS'
                    }
                } else {
                    funName = 'setRptSetting',
                    storageName = 'RPT_SETTING'
                }
                return {funName:funName, storageName:storageName}
            },
            updateRptSetting(reset){
                if(reset || this.list2.length){
                    let {funName, storageName} = this.getSettingName()
                    let all_data = []
                    if(reset){
                        localStorage.removeItem(storageName)
                        this.getList(reset)
                        this.getList2(reset)
                        // this.$set(this,'showDefaultMenu',false)
                        return
                    } else {
                        all_data = []
                        for(let {key} of this.list2){
                            all_data.push(key)
                        }

                        localStorage.setItem(storageName, all_data.join(',')) 
                        this.$set(this,'dialogMoreDataVisible',false) 
                    }
                    this.$store.commit(funName, all_data)
                    this.$message({
                        type: 'info',
                         message: '您的更多数据设置成功'
                    });
                } else {
                    this.$set(this,'error',true)
                }
            },
            toggleDefaultMenu(){
                console.log(this.showDefaultMenu,'7777777777')
                this.$set(this,'showDefaultMenu', !this.showDefaultMenu)
                console.log(this.showDefaultMenu,'8888888')
            }
        },
        components:{draggable}
    }
</script>
<style scoped lang="less">
.MoreDataIcon {
    width: 46px;
    text-align: center;
    padding: 0 10px;
    cursor: pointer;
    i.iconfont {
        color: #ccc;
        font-size: 30px;
    }
}
.title {
    font-size: 12px;
    margin-bottom: 10px;
    .reset {
        float: right;
        color: #0066de;
        cursor: pointer;
        text-decoration: underline;
    }
}
.moreDataWrap {
    align-self: center;
    position: relative;
    float: right;
    margin-left: 5px;
}
.moreDataWrap h2{
    font-size:12px;
    font-weight: 400;
    margin-top: -10px;
}
.moreDataWrap .drag {
    text-align: left;
}
.dragArea {
  height: 380px;
  overflow: auto;
}
.dragItem {
    margin:10px 15px 10px 0;
    cursor: pointer;
}
.left .dragArea {
    border: 1px solid #ccc;
    padding: 10px 10px 10px 20px;
}
.left .dragItem{
    width: 45%;
    float: left;
    height: 18px;
    line-height: 16.1px;
}
.right .dragItem{
    padding: 10px;
    border:1px dashed #cccccc;
    line-height: 1;
}
.right .dragArea .dragItem:first-child {
    margin-top:0;
}
.defaultSetting {
    cursor: pointer;
    border: 1px solid #cccccc;
    padding: 10px 4px;
    margin: 0;
    border-top: none;
    position: absolute;
    top: 31px;
    z-index: 343455;
    background: #f1f1f1;
    line-height: 1;
}
</style>