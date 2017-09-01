import Qs from 'qs'
import {getCookie} from '@/assets/js/base'

let baseURL = window.location.protocol + '//' + window.location.host
/* 前期开发阶段接口访问mockjs */
if(window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('devstatic.maimiaotech.com') > -1){
  baseURL = 'https://www.easy-mock.com/mock/5902b92c7a878d73716dea61/yzb/'
}
if(process.env.NODE_ENV && process.env.NODE_ENV !== 'development'){
    baseURL = '/'
}

export default {
	method: 'POST',
  baseURL:baseURL,
	transformRequest: [
		function(data) {
			//为了避免qs格式化时对内层对象的格式化先把内层的对象转为
			//data.strSQL = base64encode(data.strSQL);
			//由于使用的form-data传数据所以要格式化
			return JSON.stringify(data);
		}
	],
	transformResponse: [
		function(data) {
			return data;
		}
	],
	headers: {
    'X-CSRFToken': getCookie('csrftoken'),
    'X-Requested-With': 'XMLHttpRequest'
	},
	// params: {

	// },
	// paramsSerializer: function(params) {
	// 	return Qs.stringify(params)
	// },
	// data: {},
	timeout: 60000,
	withCredentials: false, // default
	responseType: 'json', // default
	//将upload事件注释掉，防止跨域状态下发起option请求

	// onUploadProgress: function(progressEvent) {
	// 	// Do whatever you want with the native progress event
	// },


	// onDownloadProgress: function(progressEvent) {
	// 	// Do whatever you want with the native progress event
	// },
	//maxContentLength: 2000,
	validateStatus: function(status) {
		return (status >= 200 && status < 300) || status === 304; // default
	},
	//maxRedirects: 5, // default
}

// function getCookie(name){
//     var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
//     if(arr=document.cookie.match(reg)){
//         return unescape(arr[2]);
//     } else{
//         return null;
//     }
// }

function base64encode(str) {
  	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  	var output = "";
  	var chr1, chr2, chr3 = "";
  	var enc1, enc2, enc3, enc4 = "";
  	var i = 0;
  	var input = utf16to8(str);
  	do {
  		chr1 = input.charCodeAt(i++);
  		chr2 = input.charCodeAt(i++);
  		chr3 = input.charCodeAt(i++);
  		enc1 = chr1 >> 2;
  		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
  		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
  		enc4 = chr3 & 63;
  		if (isNaN(chr2)) {
  			enc3 = enc4 = 64;
  		} else if (isNaN(chr3)) {
  			enc4 = 64;
  		}
  		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  		chr1 = chr2 = chr3 = "";
  		enc1 = enc2 = enc3 = enc4 = "";
  	} while (i < input.length);
  	return output;
  }

function utf16to8(str) {
  	var out, i, len, c;
  	out = "";
  	len = str.length;
  	for (i = 0; i < len; i++) {
  		c = str.charCodeAt(i);
  		if ((c >= 0x0001) && (c <= 0x007F)) {
  			out += str.charAt(i);
  		} else if (c > 0x07FF) {
  			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
  			out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
  			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
  		} else {
  			out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
  			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
  		}
  	}
  	return out;
}