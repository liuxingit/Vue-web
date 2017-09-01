<template lang="html">
    <div class="hours-selection">
        <div class="title">时间段：
            <el-button :type="state ? 'success' : ''" @click="selectAll" size="small">{{title}}</el-button>
            <div class="pullRight">
                <el-button v-if="this.edit" :plain="true" size="small" type="success" @click="handleRevert">还原</el-button>
            </div>
        </div>
        <ul>
            <li v-for="(item, index) in hours" :class="{active: item}" @click="handleHours(index)">
                <span>{{ index }}</span>
                <span></span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ['title', 'hours', 'type', 'edit'],
    computed: {
        state() {
            if (this.hours.every(item => {return item})) { return true }
            return false
        }
    },
    methods: {
        selectAll() {
            this.$emit('select-all', this.type, this.state)
        },
        handleHours(index) {
            this.$emit('select-time', this.type, index)
        },
        handleRevert() {
            this.$emit('revert')
        },
    }
}
</script>

<style lang="less" scoped>
.hours-selection {
    .title {
        .el-tag {
            border-radius: 20px;
            margin-left: 5px;
        }
    }
    ul {
        padding: 0;
        li {
            display: inline-block;
            text-align: center;
            width: 30px;
            margin-left: -1px;
            cursor: pointer;
            &.active {               
                background-color: #DDEBFF;
                span {
                    &:first-child {
                        background-color: #569DFF;
                        color: #fff;
                    }
                }
            }
            span {
                display: block;
                &:first-child {
                    height: 20px;
                    line-height: 20px;
                }
                &:last-child {
                    height: 15px;
                    margin: 10px 0;
                    border-left: 1px solid #ddd;
                }
            }
        }
    }
}
</style>