import moment from 'moment';

let pub = {};

const price_arr = ['alipay_inshop_amt', 'gmv_inshop_amt', 'ecpm', 'ecpc', 'charge'];
const percent_arr = ['ctr','cvr'];

function commafy(num, key) {
    if (num === '-') {
        return num;
    }
    if ((num + "").trim() === "") {
        return "";
    }
    if (isNaN(num)) {
        return "";
    }
    if (key && price_arr.includes(key)) {
        num = num / 100;
    }
    if ((num + '').indexOf('.') >= 0) {
        num = (num - 0).toFixed(2);
    }
    num = num + "";
    if (/^.*\..*$/.test(num)) {
        let pointIndex = num.lastIndexOf(".");
        let intPart = num.substring(0, pointIndex);
        let pointPart = num.substring(pointIndex + 1, num.length);
        intPart = intPart + "";
        let re = /(-?\d+)(\d{3})/
        while (re.test(intPart)) {
            intPart = intPart.replace(re, "$1,$2")
        }
        num = intPart + "." + pointPart;
    } else {
        num = num + "";
        let re = /(-?\d+)(\d{3})/
        while (re.test(num)) {
            num = num.replace(re, "$1,$2")
        }
    }
    return (price_arr.includes(key) ? '¥ ' : '') + num + (percent_arr.includes(key) ? '%' : '');
}
let parseDate = function(d, no_minus) {
    if (typeof(d) === 'object') {
        return d;
    } else if (typeof(d) === 'string' && d.indexOf('-')) {
        if (d.indexOf(' ')) {
            d = d.split(' ')[0];
        }
        var da = d.split('-');
        return new Date(da[0], da[1] - 1, da[2]);
    } else {
        return new Date( no_minus ? d : (d - 8*3600000) );
    }
}
//格式化日期
let formatDate = function(d, format, no_minus) {
    d = parseDate(d, no_minus);
    let formatedDate  = '';
    var mon = d.getMonth() + 1;
    if (mon < 10) {
        mon = '0' + mon;
    }
    var day = d.getDate()
    if (day < 10) {
        day = '0' + day;
    }
    var hour = d.getHours();
    if (hour < 10) {
        hour = '0' + hour;
    }
    var minute = d.getMinutes();
    if (minute < 10) {
        minute = '0' + minute;
    }
    var second = d.getSeconds();
    if (second < 10) {
        second = '0' + second;
    }
    switch (format) {
        case 'mm-dd hh:mm':
            formatedDate = mon + '-' + day + ' ' + hour + ":" + minute;
            break;
        case 'mm-dd':
            formatedDate = mon + '-' + day;
            break;
        case 'yyyy-mm':
            formatedDate = d.getFullYear() + '-' + mon;
            break;
        case 'yyyymmdd:hhmm':
            formatedDate = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " + hour + ":" + minute;
            break;
        case 'yyyy-mm-dd hh:mm':
            formatedDate = d.getFullYear() + '-' + mon + '-' + day + " " + hour + ":" + minute;
            break;
        case 'yyyymmdd:hhmmss':
            formatedDate = d.getFullYear() + '-' + mon + '-' + day + " " + hour + ":" + minute + ":" + second;
            break;
        case 'mm-dd hhmmss':
            formatedDate = mon + '-' + day + " " + hour + ":" + minute + ":" + second;
            break;
        case 'hhmmss':
            formatedDate = hour + ":" + minute + ":" + second;
            break;
        case 'hhmm':
            formatedDate = hour + ":" + minute;
            break;
        case 'yyyy/mm/dd':
            formatedDate = d.getFullYear() + '/' + mon + '/' + day;
            break;
        case 'yyyy.mm.dd hh:mm':
            formatedDate = d.getFullYear() + '.' + mon + '.' + day +  " " + hour + ":" + minute;
            break;
        case 'yyyy.mm.dd':
            formatedDate = d.getFullYear() + '.' + mon + '.' + day;
            break;
        default:
            formatedDate = d.getFullYear() + '-' + mon + '-' + day;
            break;
    }
    return formatedDate;
}

export const getCookie = function(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
    } else{
        return null;
    }
}
export const delCookie = function(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null){
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
}
export const setCookie = function(name,value,time){
    var strsec = getsec(time);
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec*1);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getsec(str) {
    //格式 s1000  表示1000秒   h1 表示1h
    var str1=str.substring(1,str.length)*1;
    var str2=str.substring(0,1);
    if (str2=="s") {
        return str1*1000;
    } else if (str2=="h") {
        return str1*60*60*1000;
    } else if (str2=="d") {
        return str1*24*60*60*1000;
    }
}


export const getZeroDay = (time) => {
    if (time && typeof time !== 'string') {
        console.warn('[base.js] getZeroDay need a variable typeof String')
        return
     }
     if (!time) { return (new Date(new Date().toLocaleDateString()).getTime()) }
     return (new Date(new Date(time).toLocaleDateString()).getTime())
}

// 传入day天前/后，day:30  30天后    返回一个时间戳
export const getDefineDay = (day, time) => {
    return getZeroDay(time) + day * 24 * 3600 * 1000
}


/**
 * @param object 查询的对象
 * @param 要查找的key对应的val
 */
export const getValueByPath = function(object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

function pickerOptions(days){
    days = days || 91;
    return {
        shortcuts: [{
            text: '昨天',
            onClick(picker) {
                const start = new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD"));
                const end = new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD"));
                picker.$emit('pick', [start, end]);
            }
        }, {
            text: '过去7天',
            onClick(picker) {
                const end = new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD"));
                const start = new Date(moment(getCurrentDate()).subtract(7, 'days').format("YYYY-MM-DD"));
                picker.$emit('pick', [start, end]);
            }
        }, {
            text: '过去15天',
            onClick(picker) {
                const end = new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD"));
                const start = new Date(moment(getCurrentDate()).subtract(15, 'days').format("YYYY-MM-DD"));
                picker.$emit('pick', [start, end]);
            }
        }, {
            text: '过去30天',
            onClick(picker) {
                const end = new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD"));
                const start = new Date(moment(getCurrentDate()).subtract(30, 'days').format("YYYY-MM-DD"));
                picker.$emit('pick', [start, end]);
            }
        }],
        disabledDate:function(current){
            return current > new Date(moment(getCurrentDate()).subtract(1, 'days').format("YYYY-MM-DD")) || current < new Date(moment(getCurrentDate()).subtract(days, 'days').format("YYYY-MM-DD"))
        }
    };
}


export const areaList = [
    {code:1,name:'安徽'},
    {code:19,name:'北京'},
    {code:532,name:'重庆'},
    {code:39,name:'福建'},
    {code:68,name:'广东'},
    {code:92,name:'广西'},
    {code:109,name:'贵州'},
    {code:52,name:'甘肃'},
    {code:165,name:'黑龙江'},
    {code:125,name:'河北'},
    {code:145,name:'河南'},
    {code:184,name:'湖北'},
    {code:212,name:'湖南'},
    {code:120,name:'海南'},
    {code:234,name:'吉林'},
    {code:255,name:'江苏'},
    {code:279,name:'江西'},
    {code:294,name:'辽宁'},
    {code:333,name:'内蒙古'},
    {code:351,name:'宁夏'},
    {code:357,name:'青海'},
    {code:393,name:'山西'},
    {code:406,name:'陕西'},
    {code:368,name:'山东'},
    {code:417,name:'上海'},
    {code:438,name:'四川'},
    {code:461,name:'天津'},
    {code:488,name:'云南'},
    {code:508,name:'浙江'},
    {code:471,name:'新疆'},
    {code:463,name:'西藏'},
    {code:577,name:'台湾'},
    {code:599,name:'香港'},
    {code:576,name:'澳门'},
    {code:531,name:'中国其他'},
]

function getCurrentDate(){
    return new Date();
}
export {commafy, formatDate, getCurrentDate, price_arr, pickerOptions};
