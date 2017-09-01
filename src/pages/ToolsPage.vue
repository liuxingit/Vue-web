<template>
  <div id="tools">
    <el-select v-model="type" @change="filter">
        <el-option :key="0" :value="0" :label="0"></el-option>
        <el-option :key="1" :value="1" :label="1"></el-option>
        <el-option :key="2" :value="2" :label="2"></el-option>
        <el-option :key="3" :value="3" :label="3"></el-option>
        <el-option :key="4" :value="4" :label="4"></el-option>
    </el-select>
    <paginate-table :data-list="tableData" :paginate-user-option="paginationOption">
        <paginate-table-column fixed prop="type" label="类型" align="center">
            <template scope="e">{{e.row.type}}</template>
        </paginate-table-column>
        <paginate-table-column prop="size" label="尺寸" align="center" width=""></paginate-table-column>
        <paginate-table-column label="等级" prop="level" align="center" sortable>
            <template scope="scope">
                    <span>{{scope.row.level}}</span>
            </template>
        </paginate-table-column>
        <paginate-table-column prop="edate" label="时间" align="center" sortable></paginate-table-column>
        <paginate-table-column fixed="right" prop="name" label="名称" align="center"></paginate-table-column>
        <paginate-table-column fixed-"right" prop="detail" label="细节" align="center"></paginate-table-column>
    </paginate-table>
<el-button @click="del">del</el-button>
</div>
</template>

<script>
    // import Navbar from '@/components/Navbar'
    // import RptHighcharts from '@/components/RptHighcharts'
    // import UserCenter from '@/components/UserCenter'
    // import CampaignList from '@/components/CampaignList'
    import paginateTable from '../components/paginate-table/table/index.js'
    import paginateTableColumn from '../components/paginate-table/table-column/index.js'

    export default {
        name: 'extra',
        data() {
            return {
                // 分页配置信息
                paginationOption: {
                    pageSize: 10,
                    currentPage: 1,
                    total: 1,
                },
                tableData: [], // 表格分页总信息(总条数)
                tableDataCache: [],
                type: 1,
            }
        },
        created() {
            this.$http.get(`${this.testUrl}ajax_get_creative_list`).then((res) => {
                this.$set(this, 'tableData', res.datalist)
                this.$set(this, 'tableDataCache', res.datalist)
                this.$set(this.paginationOption, 'total', res.datalist.length)
            })
        },
        methods: {
            del() {
                this.$set(this, 'tableData', [])
            },
            filter(type) {
                this.tableData = this.tableDataCache.filter(item => {
                    return item.type === type
                })
                this.$set(this.paginationOption, 'total', this.tableData.length)
            }
        },
        components: {
            paginateTable,
            paginateTableColumn
        }
    }
</script>

<style scoped>
    h1 {
        color: #00ff00;
    }
    
    .demo-table-expand {
        font-size: 0;
    }
    
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>