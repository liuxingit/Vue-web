import axios from 'axios'
import config from './config'
import bus from './bus';

//假数据，后面需要接口获取
// let MM = {
//     ww_link: '1111',
//     STATIC_URL: '2222',
//     BASE_URL: '33333'
// }


// function getCookie(name){
//     var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
//     if(arr=document.cookie.match(reg)){
//         return unescape(arr[2]);
//     } else{
//         return null;
//     }
// }

// function delCookie(name){
//     var exp = new Date();
//     exp.setTime(exp.getTime() - 1);
//     var cval=getCookie(name);
//     if(cval!=null){
//         document.cookie= name + "="+cval+";expires="+exp.toGMTString();
//     }
// }
// //使用示例
// // setCookie("name","hayden");
// // alert(getCookie("name"));

// //如果需要设定自定义过期时间
// //那么把上面的setCookie　函数换成下面两个函数就ok;
// //程序代码
// function setCookie(name,value,time){
//     var strsec = getsec(time);
//     var exp = new Date();
//     exp.setTime(exp.getTime() + strsec*1);
//     document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
// }
// function getsec(str) {
//     alert(str);
//     var str1=str.substring(1,str.length)*1;
//     var str2=str.substring(0,1);
//     if (str2=="s") {
//         return str1*1000;
//     } else if (str2=="h") {
//         return str1*60*60*1000;
//     } else if (str2=="d") {
//         return str1*24*60*60*1000;
//     }
// }
//这是有设定过期时间的使用示例：
//s20是代表20秒
//h是指小时，如12小时则是：h12
//d是天数，30天则：d30
//setCookie("name","hayden","s20");

function errHandle(code, msg) {
    let options = {
        title: '出错了',
        msg: msg
    };
    if (code === 1111) {
        // 创意库转换无线链接失败
        options.msg = '转换链接失败，可参考转换规则手动转换'
    }
    bus.$msgbox({
        title: options.title,
        message: options.msg ? options.msg : '出错了~',
        type: 'warning',
        confirmButtonText: '确定',
        beforeClose: (action, instance, done) => {
          	//有的需要一些自定义事件，在这里写
	        done();
        }
    }).then(action => {
      	//其他处理
        if(options.msg === '计划不存在'){
            window.location.href = window.location.protocol + '//' +　window.location.host
        }
    });
}

// axios(config);
class API {
	//get方式
	get (url, param, is_origin, not_errhandle) {
		return axios.get(url,param ? param : {},config).then(function(res){
            if (res.status) {
                if (is_origin) { return res.data }
                return res.data.data
            }
			let originData = res;
			if(not_errhandle){
				return originData;
			}
			if(!originData.success){
				//错误处理
		    	errHandle(originData.code, originData.msg);
		    	return false;
			}
			return is_origin ? originData : originData.data;
		}).catch(err => {
			bus.$message({
	      		message: '请求出错了，请重试',
	      		type: 'error'
	    	});
            return {success: false};
		});
	}
	//post方式
	post (url, param, is_origin, not_errhandle) {
		return axios.post(url, param, config).then(function(res){
			let originData = res.data;
			if(not_errhandle){
				return originData;
			}
			if(!originData.success){
				//错误处理
		    	errHandle(originData.code, originData.msg);
		    	return originData;
			}
			return originData;//is_origin ? originData : originData.data;
		}).catch(err => {
			bus.$message({
	      		message: '请求出错了，请重试',
	      		type: 'error'
	    	});
            return {success: false};
		});
	}
	reqSuccess(obj,msg){
		obj.$message({
      		message: msg,
      		type: 'success'
    	});
	}
	reqFail(obj,msg){
		obj.$message({
      		message: msg,
      		type: 'error'
    	});
	}
}

export default API;