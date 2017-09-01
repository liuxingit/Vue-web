// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import "babel-polyfill";
import Vue from 'vue'
import 'element-ui/lib/theme-default/index.css'
import ElementUI from 'element-ui'
import BasePage from '@/pages/BasePage'
import router from '@/router/index'
import store from '@/store/index'
import '@/assets/js/comm';
import '@/assets/css/base.less'
import API from '@/assets/js/api'
//import bus from '@/assets/js/bus'



const api = new API();
Object.defineProperty(Vue.prototype, '$http', { value: api });

//检测页面关闭
/*window.onbeforeunload = function(){//进店监控需要
    bus.$http.post('ajax_send_offline_signal', {}).then(res => {});
};*/

Vue.config.productionTip = false

let staticUrl = '/static/'
let testUrl = "https://www.easy-mock.com/mock/5902b92c7a878d73716dea61/yzb/"
if(process.env.NODE_ENV === 'production'){
    staticUrl = '/dist/yzb_static/'
    testUrl = '/'
} else if(process.env.NODE_ENV === 'testing'){
    staticUrl = '//static.maimiaotech.com/'
    testUrl = '/'
}
Vue.prototype.staticUrl = staticUrl
Vue.prototype.testUrl = testUrl

Vue.prototype.isObject = function(obj) {
    return obj !== null && typeof obj === 'object';
};
Vue.prototype.isArray = function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
};
Vue.prototype.isInteger = function(obj) {
  return (obj | 0) === obj
}

// localstorage时间过零点清理
import { getDefineDay } from '@/assets/js/base'
const zeroTime = getDefineDay(1)
if (localStorage.getItem('zero_time')) {
    if (new Date().getTime() > localStorage.getItem('zero_time')) {
        localStorage.setItem('zero_time', zeroTime)
        localStorage.removeItem('rpt_time')
    }
} else {
    localStorage.setItem('zero_time', zeroTime)
}

//console.log(process.env, Vue.prototype.staticUrl,Vue.prototype.testUrl ,11111111111)

/* eslint-disable no-new */
Vue.use(ElementUI)

Vue.directive('title', {
  inserted: function (el, binding) {
    document.title = '优钻宝-智能钻展优化系统-' + el.innerText
    el.remove()
  }
})

new Vue({
    el: '#root',
    router,
    store,
    template: '<BasePage/>',
    components: { BasePage }
    // filter:{
    //     tofixed2:function(argument) {
    //         // body...
    //         console.log(argument,3333333333)
    //     }
    // };
})