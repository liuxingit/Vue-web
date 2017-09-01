<template>
    <div v-if="type === 'bottom'" class="bottomBanner">
        <el-carousel :interval="time_interval" indicator-position=none arrow="never" :style="{height:height + 'px'}">
            <el-carousel-item v-for="item in data"  :key="item._id">
                <div class="bottomBannerItem" v-html="item.message_settings.content.html"></div>
            </el-carousel-item>
        </el-carousel>
    </div>
    <div v-else class="mm-pane" id="announce" :interval="time_interval">
        <div class="mm-pane-title"><i class="iconfont">&#xe605;</i>活动通知</div>
        <div class="block">
            <el-carousel height="223px">
                <el-carousel-item v-for="item in data"  :key="item._id">
                    <div class="announce-item" v-html="item.message_settings.content.show_html"></div>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
</template>
<script>
    export default {
        props:['type'],
        data () {
            return {
                res:{},
                time_interval:5000,
                data:[],
                height:'100'
            }
        },
        computed:{
            banner_setting(){
                return this.$store.state.plan.BANNER_SETTING
            },
        },
        watch: {
            banner_setting(){
                this.setData()
            }
        },
        created(){
            this.$http.post('ajax_get_activitys_by_type',{act_type:this.type}).then((res) => {
                if (!res.success) {return false}
                this.$set(this,'res', res)
                this.setData()
            })
        },
        methods:{
            setData(){
                if(this.res.data && this.res.data.length){
                    let temp_data, time_interval;
                    if(!this.banner_setting || this.banner_setting && (!Object.keys(this.banner_setting).length || this.banner_setting[this.type + '_type'])){
                        temp_data = this.res.data
                    } else {
                        let Range = this.res.data.length - 1;
                        let Rand = Math.random();
                        let num = Math.round(Rand * Range); //四舍五入
                        temp_data = [this.res.data[num]]
                    }
                    time_interval = this.banner_setting && this.banner_setting[this.type + '_time_interval'] ? (this.banner_setting[this.type + '_time_interval'] - 0) * 1000 : this.time_interval
                    this.$set(this,'data', temp_data)
                    this.$set(this,'time_interval', time_interval)
                    if(this.type === 'bottom'){
                        document.getElementsByClassName("bottomBanner")[0].style.display = 'block'
                        this.getRatio(temp_data[0])
                        
                    }
                } else {
                    if(this.type === 'bottom'){
                        document.getElementsByClassName("bottomBanner")[0].style.display = 'none'
                    }
                }
            },
            getRatio(data){
                let self = this
                return new Promise(function(resolve,reject){
                    let src = self.getImgSrc(data.message_settings.content.html)
                    let img = new Image();
                    img.onload = function(){

                        self.$set(self,'height', document.body.clientWidth * img.height / img.width)
                        resolve(); 
                    };
                    img.onerror = function(){
                        reject(new Error('Could not load image '));
                    };
                    img.src = src;
                })
            },
            getImgSrc(str){
                //匹配图片（g表示匹配所有结果i表示区分大小写）
                var imgReg = /<img.*?(?:>|\/>)/gi;
                //匹配src属性
                var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
                var arr = str.match(imgReg);
                for (var i = 0; i < arr.length; i++) {
                    var src = arr[i].match(srcReg);
                    return src[1]
                }
            }
        }
    }
</script>
<style lang="less">
    @import './AdsBanner.less';
</style>