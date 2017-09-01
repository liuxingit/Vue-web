<template>
  <div id="help">
    <div v-title>帮助</div> 
    <el-button @click="visible = true">按钮测试</el-button>
    <el-radio class="radio" v-model="radio" label="1">备选项</el-radio>
    <el-radio class="radio" v-model="radio" label="2">备选项</el-radio>
    <div class="block">
      <span class="demonstration">默认</span>
      <el-slider v-model="value1"></el-slider>
    </div>
    <div class="block">
      <span class="demonstration">自定义初始值</span>
      <el-slider v-model="value2"></el-slider>
    </div>
    <div class="block">
      <span class="demonstration">隐藏 Tooltip</span>
      <el-slider v-model="value3" :show-tooltip="false"></el-slider>
    </div>
    <div class="block">
      <span class="demonstration">格式化 Tooltip</span>
      <el-slider v-model="value4" :format-tooltip="formatTooltip"></el-slider>
    </div>
    <div class="block">
      <span class="demonstration">禁用</span>
      <el-slider v-model="value5" disabled></el-slider>
    </div>
    <el-button :plain="true" @click="open">打开消息提示</el-button>
      <!-- <div id="navbar">
        <navbar></navbar>
      </div>
      <div class="main">
          <div id="rpt_highchart_wrap">
              <rpt-highcharts></rpt-highcharts>
          </div>
          <div id="user_center">
              <user-center></user-center>
          </div>
          <div id="table_wrap">
              <campaign-list></campaign-list>
          </div>
      </div> -->
  </div>
</template>

<script>
import Vue from 'vue'
// import { Button, Select ,Dialog} from 'element-ui'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
// Vue.use(Button)
// Vue.use(Select)
Vue.use(ElementUI)
// import Navbar from '@/components/Navbar'
// import RptHighcharts from '@/components/RptHighcharts'
// import UserCenter from '@/components/UserCenter'
// import CampaignList from '@/components/CampaignList'

export default {
  name: 'extra',
  data () {
    return {
      title: '帮助页面的组件',
      radio:'1',
      value1: 0,
      value2: 50,
      value3: 36,
      value4: 48,
      value5: 42,
    }
  },
  methods: {
    open() {
      this.$message('这是一条消息提示');
    }
  }
  //components:{Navbar,RptHighcharts, UserCenter, CampaignList}
}
</script>

<style scoped>
    h1 {
      color:#ff0000;
    }
</style>
