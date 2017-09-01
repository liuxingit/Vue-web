<template>
    <div class="creative-table">
        <paginate-table :data-list="tableData" :paginate-user-option="paginationOption" 
            @select="delCreatives" @select-all="delCreatives"
            border tooltip-effect="dark" class="creative-list" style="width: 100%">
            <!--<paginate-table-column type="selection" align="center" width="50" ></paginate-table-column>-->
            <paginate-table-column label="创意信息" header-align="center" width="480" class-name="creative-info" fixed="left">
                <template scope="scope">
                    <div class="pullLeft img-paper" title="查看大图" @click="imgModalSrc = scope.row.image_path">
                        <img :src="scope.row.image_path">
                    </div>
                    <div class="pullLeft" style="color:#777">
                        <p class="edit-title" style="color:#333"  @click.stop>
                            <span v-if="titleIndex[scope.$index]" class="clearfix">
                                <span class="text" :title="`${scope.row.creative_name}_${scope.row.creative_size}`">创意标题：{{scope.row.creative_name}}</span>
                                <i class="iconfont" @click="editTitle(scope.$index, scope.row.creative_name)">&#xe635;</i>
                                <i class="iconfont" @click="pathToRptTotal(scope.row.creative_id)">&#xe634;</i>
                            </span>
                            <span v-else>
                                <el-input v-model="creative_name" size="mini" autofocus></el-input>
                                <el-button type="primary" size="mini" @click="saveTitle(scope.row, scope.$index)">确定</el-button>
                            </span>
                        </p>
                        <p>
                            <span>创意ID：{{scope.row.creative_id}}</span>
                        </p>
                        <p><span v-text="renderCat(scope.row.cat_id)"></span></p>
                    </div>
                </template>
            </paginate-table-column>
            <paginate-table-column prop="type" label="类型" align="center" width="">
                <template scope="e">{{renderTemp(creativeFormat, e.row.format)}}</template>
            </paginate-table-column>
            <paginate-table-column prop="creative_size" label="尺寸" align="center" width=""></paginate-table-column>
            <paginate-table-column prop="creative_level" label="等级" align="center" width="80" sortable>
                 <template scope="e">{{e.row.creative_level | turnLevel }}</template>
            </paginate-table-column>
            <paginate-table-column prop="audit_status" label="创意状态" align="center" width="100">
                <template scope="e">
                <div v-html="rendercreativeStatus(e.row.audit_status)"></div>       
                </template>
            </paginate-table-column>
            <paginate-table-column label="使用状态" align="center" width="100">
                <template scope="e">
                    <div v-html="renderOnlineStatus(e.row.online_status)"></div>
                </template>
            </paginate-table-column>
            <paginate-table-column label="投放位置" header-align="center" width="260">
                <template scope="scope">
                    <div v-if="scope.row.place">
                        <p>计划：{{scope.row.place[0].campaign_name}}</p>
                        <p>单元：{{scope.row.place[0].adgroup_name}}</p>
                        <p>推广位: {{scope.row.place[0].adzone_ids[0] ? scope.row.place[0].adzone_ids[0].adzone_name : '暂无推广位'}}
                            <el-button type="text" size="mini" @click="showMorePlace(scope.row)">更多</el-button>
                        </p>
                    </div>
                    <div v-else class="textCenter">--</div>
                </template>
            </paginate-table-column>
            <paginate-table-column label="推广链接类型" header-align="center" align="center" width="110">
                <template scope="scope">
                    <a :href="scope.row.click_url" target="_blank">{{renderTemp(urlFormat, scope.row.url_format) || '暂无'}}</a>
                </template>
            </paginate-table-column>
            <paginate-table-column prop="edate" label="到期时间" align="center" width="150">
                <template scope="e">
                    <span v-if="e.row.expire_time">{{renderDate(e.row.expire_time.$date)}}</span>
                    <span v-else>不限</span>
                </template>
            </paginate-table-column>
            <paginate-table-column label="操作" icon-class="icon-tishi" icon-tips="审核拒绝的创意方可编辑" width="100" fixed="right" align="center">
                <template scope="scope">
                    <el-button :disabled="scope.row.audit_status !== -2 && scope.row.audit_status !== -5 && scope.row.audit_status !== -9 || scope.row.format !== 2" size="mini" @click="showCreativeDialog(scope.row, 'edit')">编辑</el-button>
                </template>
            </paginate-table-column>
        </paginate-table>
        <el-dialog v-model="morePlaceDialog" custom-class="more-place-dialog">
            <el-table :data="morePlace" border>
                <el-table-column prop="campaign_name" label="计划" header-align="center"></el-table-column>
                <el-table-column prop="adgroup_name" label="推广单元" header-align="center"></el-table-column>
                <el-table-column label="资源位置" header-align="center">
                    <template scope="e">
                        <span>{{e.row.adzone_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="162">
                    <template scope="e">
                        <el-tooltip content="计划已结束投放" placement="top" v-if="filterOnlineSta(e.row.campaign_id, 'adgroup')">
                            <el-button type="text" size="mini" class="btn-disabled">进入单元</el-button>
                        </el-tooltip>
                        <el-button v-else @click="pathToAdgroup(e.row)" type="text" size="mini">进入单元</el-button>
                        <el-tooltip content="暂无数据" placement="top" v-if="filterOnlineSta(e.row.campaign_id, 'rpt')">
                            <el-button type="text" size="mini" class="btn-disabled">查看报表</el-button>
                        </el-tooltip>
                        <el-button v-else size="mini" type="text" @click="pathToRpt(e.row)">查看报表</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <handle-creative :show="creativeDialog" :catList="catList" :edit="editData" @close="creativeDialog = false" @submit="submitCreative"></handle-creative>
        <img-modal :img="imgModalSrc" @close="imgModalSrc = ''"></img-modal>
    </div>
</template>

<script>

import paginateTable from '@/components/paginate-table/table/index.js'
import paginateTableColumn from '@/components/paginate-table/table-column/index.js'
import imgModal from '@/components/widget/imgModal'
import handleCreative from './handleCreative'
import bus from '@/assets/js/bus'
import { formatDate } from '@/assets/js/base'

export default {
    components: {
        paginateTable, paginateTableColumn, handleCreative,imgModal
    },
    props: ['tableData', 'catList', 'creativeFormat', 'urlFormat'],
    methods: {
        // table创意标题修改
        editTitle(index, name) {
            if (this.titleIndex.every(i => i)) {
                this.$set(this.titleIndex, index, !this.titleIndex[index])
                this.creative_name = name
            }
        },
        saveTitle(data, index) {
            const creative = {
                creative_id: +data.creative_id,
                creative_name: this.creative_name,
                cat_id: +data.cat_id,
                click_url: data.click_url,
                image: data.image_path,
                is_trans_to_wifi: false,
            }
            this.saveCreative(creative, true)
            this.$set(this.titleIndex, index, !this.titleIndex[index])
        },
        // 投放位置跳转判断
        filterOnlineSta(id, type) {
            const campaignList = this.$store.state.plan.campaignList
            let online_status
            campaignList.some(e => {
                if (e.campaign_id === id) {
                    online_status = e.online_status
                    return true
                }
            })
            if (type === 'adgroup') {
                return online_status === 9
            }
            return online_status === 3 || online_status === 5 || online_status === -99
        },
        // 
        showCreativeDialog(edit) {
            this.creativeDialog = true
            this.editData = edit
        },
        submitCreative(data) {
            if (data.creative_id) {
                // 编辑
                // const index = this.tableData.findIndex(item => item.creative_id === data.creative_id)
                // if (data.image.indexOf('http') > -1) {
                //     delete data.image
                // }
                // delete data.is_trans_to_wifi
                // if (Object.keys(data).every(key => data[key] === this.tableData[index][key])) {
                //     this.creativeDialog = false
                //     return
                // }
                data.cat_id = +data.cat_id
                // data.is_trans_to_wifi = this.form.is_trans_to_wifi
                this.saveCreative(data, true)
            } else {
                // 新建
                delete data.creative_id
                data.cat_id = +data.cat_id
                this.saveCreative(data)
            }
        },
        saveCreative(data, edit) {
            let url, msg
            if (edit) {
                url = 'creatives/ajax_modify_creative'
                msg = '修改成功'
            } else {
                url = 'creatives/ajax_create_creative'
                msg = '新建成功'
            }
            this.$http.post(url, data).then(res => {
                if (!res.success) return
                this.$emit('updateList', res.data, edit)
                this.creativeDialog = false
                this.$message.success(msg)
            })
        },
        delCreatives() {
            // todo
        },
         // 投放位置更多信息显示
        showMorePlace(data) {
            this.morePlace = []
            data.place.forEach(place => {
                if (this.isArray(place.adzone_ids) && place.adzone_ids && place.adzone_ids.length) {
                    place.adzone_ids.forEach(adzone => {
                        this.morePlace.push({
                            campaign_id: place.campaign_id,
                            campaign_name: place.campaign_name,
                            adgroup_id: place.adgroup_id,
                            adgroup_name: place.adgroup_name,
                            online_status: place.online_status,
                            setting_type: place.setting_type,
                            creative_id: data.creative_id,
                            adzone_name: adzone.adzone_name,
                        })
                    })
                } else {
                    this.morePlace.push({
                        campaign_id: place.campaign_id,
                        campaign_name: place.campaign_name,
                        adgroup_id: place.adgroup_id,
                        adgroup_name: place.adgroup_name,
                        online_status: place.online_status,
                        setting_type: place.setting_type,
                        creative_id: data.creative_id,
                        adzone_name: '--'
                    })
                }
            })
            this.morePlaceDialog = true
        },
        pathToAdgroup(creative) {
            let setting_type, type;
            console.log(creative)
            this.$store.state.plan.campaignList.some(item => {
                if (item.campaign_id === creative.campaign_id) {
                    setting_type = item.setting_type
                    type = item.type
                    return true
                }
            })
            
            window.open(`/adgroupdsc/${creative.adgroup_id}?campaign_id=${creative.campaign_id}&adgroup_name=${creative.adgroup_name}`
             + `&type=${type}&setting_type=${setting_type}`
             + `&show=${creative.online_status !== 9}&activeName=creative&creative_id=${creative.creative_id}`)
        },
        pathToRpt(creative) {
            window.open(`/rpt_day/?active=day&type=creative&campaign_id=${creative.campaign_id}&adgroup_id=${creative.adgroup_id}&creative_id=${creative.creative_id}`)
        },
        pathToRptTotal(id) {
            window.open(`/rpt/?type=creative&is_single=1&creative_id=${id}`)
        },
        // 动态等比例显示图片宽高
        // imgStyle(index) {
        //     console.time('renderImg')
        //     var a = this.$nextTick(() => {
        //         const img = document.querySelectorAll('.creative-list img')[index]
        //         const w = img.width
        //         const h = img.height
        //         if (w > h) {
        //             return {
        //                 'width': '140px',
        //                 'height': 'auto',
        //                 'maxHeight': '70px',
        //             }
        //         }
        //         return {
        //             'width': 'auto',
        //             'height': '70px',
        //             'maxWidth': '140px',
        //         }
        //     })
        //     console.log(a)
            
        // },
        renderCat(val) {
            let temp;
            Object.keys(this.catList).some(key => {
                if (val === key) {
                    temp = `类目：${this.catList[key]}`
                    return true
                }
            })
            return temp;
        },
        renderOnlineStatus(val) {
            switch (val) {
                case 1: 
                return '<span class="textSuccess">使用中</span>';
                case 0: 
                return '<span class="textWarning">未使用</span>';
            }
        },
        rendercreativeStatus(val) {
            switch (val) {
                case -2: 
                case -5: 
                case -9: 
                return '<span class="textDanger">拒绝</span>';
                case 0: 
                case -1: 
                case -4: 
                return '<span class="textWarning">待审核</span>';
                case 1:
                return '<span class="textSuccess">通过</span>'
            }
        },
        renderTemp(list, val) {
            let temp;
            Object.keys(list).some(key => {
                if (val === +key) {
                    temp = list[key]
                    return true
                }
            })
            return temp;
        },
        renderDate(data) { 
            return formatDate(data, 'yyyymmdd:hhmmss') 
        }
    },
    computed: {
        paginationOption() {
            return {
                pageSize: 10,
                currentPage: 1,
                total: this.tableData.length,
            }
        },
    },
    filters: {
        turnLevel(v) {
            if (v === 99) { v = '--' }
            return v
        }
    },
    watch: {
        creativeDialog(v) {
            if (!v) {
                this.editData = ''
            }
        },
    },
    mounted() {
        // 修改标题
        document.addEventListener('click', (e) => {
            if ( this.titleIndex.some(i => i === false)) {
                this.titleIndex = this.titleIndex.map(i => true)
            }
        })
    },
    data() {
        return {
            titleIndex: new Array(10).fill(true),
            morePlaceDialog: false,
            creativeDialog: false,
            morePlace: [],
            creative_name: '',
            editData: '',
            imgModalSrc: '',
        }
    }
}
</script>

<style lang="less">
    .creative-table {
        line-height: 1;
        margin-top: 20px; 
        .creative-list {
            min-hight: 300px;
        }
        .more-place-dialog {
            min-width: 770px;
        }
        .btn-disabled {
            cursor: not-allowed;
            color: #bfcbd9;
        }
        table th {
            .iconfont {
                margin-left: 3px;
                color: #97a8be;
                font-size: 12px;
                cursor: pointer;
            }
        }    
        tbody tr {
            font-size: 12px;
            .creative-info {
                min-width: 300px;
                &:hover {
                    .iconfont {
                        opacity: 1
                    }
                }
                .iconfont {
                    opacity: 0;
                    cursor: pointer;
                }
                .edit-title {
                    .text {
                        display: inline-block;
                        float: left;
                        max-width: 250px;
                    }
                    i.iconfont {
                        float: left;
                        margin-left: 5px;
                        margin-top: 3px;
                    }
                    .el-input {
                        width: 238px;
                    }
                }
                div:nth-child(2) {
                    margin-left: 20px;
                    padding: 5px 0;
                }
                .img-paper {
                    height:80px; 
                    display: flex; 
                    align-items: center; 
                    width: 140px;
                    justify-content: center;
                    background-color:#f7f7f7;
                    border: 1px solid #e6e6e6;
                    cursor: pointer;
                }
                img {
                    border: none;
                    width: 140px;
                    height: auto;
                    max-height: 70px;
                }
                p {
                    margin: 0 0 5px;
                }
            }
        }
        .cell {
            line-height: initial;
            padding: 5px 10px;
            p {
                margin: 0 0 5px;
            }
        }
    }
</style>