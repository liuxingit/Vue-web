<template>
    <div class="query-condition">
        <el-cascader v-model="adzoneCascaderVal" :options="adzoneCascader" expand-trigger="hover" :show-all-levels="false"
        class="" style="width: 150px">
        </el-cascader>
        <el-select v-model="query.audit_status" clearable>
            <el-option value="" label="创意状态"></el-option>
            <el-option v-for="(name,key) in creativeStatus" :key="key" :value="key" :label="name"></el-option>
        </el-select>
        <el-select v-model="query.online_status" clearable>
            <el-option value="" label="使用状态"></el-option>
            <el-option v-for="(name,key) in onlineStatus" :key="key" :value="key" :label="name"></el-option>
        </el-select>
        <el-select v-model="query.url_format" clearable placeholder="">
            <el-option value="" label="推广链接类型"></el-option>
            <el-option v-for="(name,key) in urlFormat" :key="key" :value="key" :label="name"></el-option>
        </el-select>
        <input v-model="search" class="search el-input__inner" placeholder="创意id或名称" @blur="searchCreative" @keyup.enter="searchCreative"></input>
        <i class="iconfont search-icon" @click="searchCreative">&#xe646;</i>
        <el-button type="text" style="margin-left: 10px" @click="moreSelection = !moreSelection" size="mini">{{ moreSelection ? `收起更多搜索项` : `展开更多搜索项`}}</el-button>
        <div class="more-selection" v-show="moreSelection">
            <el-select v-model="query.cat_id" clearable placeholder="">
                <el-option value="" label="全部类目"></el-option>
                <el-option v-for="(name,key) in catList" :key="key" :value="key" :label="name"></el-option>
            </el-select>
            <el-select v-model="query.creative_format" clearable placeholder="">
                <el-option value="" label="创意类型"></el-option>
                <el-option v-for="(name,key) in creativeFormat" :key="key" :value="key" :label="name"></el-option>
            </el-select>
            <el-select v-model="query.creative_size" clearable placeholder="">
                <el-option value="" label="创意尺寸"></el-option>
                <el-option v-for="item in sizeCache" :key="item" :value="item" :label="item"></el-option>
            </el-select>
            <el-select v-model="query.creative_level" clearable placeholder="">
                <el-option value="" label="创意等级"></el-option>
                <el-option v-for="(name,key) in levelCache" :key="key" :value="key" :label="name"></el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['adzone', 'creativeStatus', 'onlineStatus', 'urlFormat', 'catList', 'creativeFormat', 'size', 'level'],
        data() {
            return {
                query: {
                    adzone_id: '',
                    audit_status: '',
                    online_status: '',
                    url_format: '',
                    cat_id: '',
                    creative_format: '',
                    creative_size: '',
                    creative_level: '',
                },
                adzoneCascaderVal: [''],
                search: '',
                sizeCache: [],
                levelCache: {},
                moreSelection: false
            }
        },
        watch: {
            size(data) {
                this.sizeCache = data.map(i => i)
            },
            level(data) {
                this.levelCache = Object.assign({}, data)
            },
            adzoneCascaderVal(val) {
                this.query.adzone_id = val[1] || ''
            },
            search(v) {
                if (!v) {
                    this.$emit('reset')
                }
            },
            query: {
                deep: true,
                handler(val) {
                    let data = Object.assign({}, val)
                    this.levelCache = Object.assign({}, this.level)
                    Object.keys(data).forEach(key => {
                        if (key === 'adzone_id') {
                            if (data[key] !== '') { 
                                this.adzone.some(item => {
                                    if (item.id === data[key]) {
                                        this.sizeCache =  item.size
                                        Object.keys(this.levelCache).forEach(key2 => {
                                            if (+item.level < +key2) {
                                                delete this.levelCache[key2]
                                            }
                                        })
                                        data.creative_level = item.level + ''
                                        return true
                                    }
                                })
                                if (!data.creative_size) {
                                    data.creative_size  = this.sizeCache
                                }
                            } else {
                                this.sizeCache = this.size.map(i => i)
                                this.levelCache = Object.assign({}, this.level)
                            }
                        }
                        if (key === 'creative_size' && data[key] !== '') {
                            data[key] = this.isArray(data[key]) ? data[key] : [data[key]]
                        }
                        if (key === 'adzone_id' && data[key] !== '') {
                            data[key] = data[key] + ''
                        }
                        if (data[key] === '') {
                            delete data[key]
                        }
                    })
                    this.$emit('change-query-condition', data)
                }
            }
        },
        computed: {
            adzoneCascader() {
                const adzoneArr = [
                    { value: '', label: '可投放资源位选择' },
                    { value: 'inner', label: '站内', children: [] },
                    { value: 'outer', label: '站外', children: [] },
                ]
                this.adzone.map(item => {
                    const ob = { value: item.id, label: item.name }
                    const index = item.name.indexOf('网上购物') > -1 ? 1 : 2
                    adzoneArr[index].children.push(ob)
                })
                return adzoneArr
            }
        },
        methods: {
            searchCreative() {
                if (!this.search) {
                    return
                }
                this.$emit('search', this.search)
            },
        },
    }
</script>

<style lang="less">
    .query-condition {
        .el-cascader {
            margin-right: 15px;
            .el-input .el-input__icon {
                font-size: 12px;
            }
        }
        .el-select {
            margin-right: 15px;
            input {
                background-color: #fff;
                border-color: #bfcbd9;
                color: #333;
            }
            .el-input .el-input__icon {
                color: #bfcbd9;
            }
        }
        .search {
            width: 130px;
            display: inline-block;
        }
        .search-icon {
            cursor: pointer;
            margin-left: -26px;
        }
        .more-selection {
            margin-top: 15px;
            margin-left: 170px;
        }
    }
</style>