import Vue from 'vue'
import { formatDate, getDefineDay } from '@/assets/js/base'
import { FEILDTITLE } from '@/config'
const defaultColumns = {
    'zz':['ad_pv','click', 'charge', 'alipay_in_shop_num', 'ecpc', 'alipay_inshop_amt', 'roi', 'inshop_item_col_num','dir_shop_col_num', 'cart_num'],//直钻结合
    'rpt':['charge','click','ctr','ad_pv','ecpc','alipay_inshop_amt','cvr','roi'],//报表
    'default':['charge','ad_pv','click','ctr','ecpm','ecpc','alipay_inshop_amt','roi'],//计划推广单元等等
}
const state = {
    BANNER_SETTING:{},
    shopInfo: {},
    campaignList: [],
    campaignOption: null,
    campaignId: null,
    account:0,
    curCampaign: {},
    ZZRPT_COLUMNS:localStorage.getItem('ZZRPT_COLUMNS') ? localStorage.getItem('ZZRPT_COLUMNS').split(',') : defaultColumns['zz'],
    RPT_COLUMNS:localStorage.getItem('RPT_COLUMNS') ? localStorage.getItem('RPT_COLUMNS').split(',') : defaultColumns['rpt'],
    RPT_SETTING: localStorage.getItem('RPT_SETTING') ? localStorage.getItem('RPT_SETTING').split(',') : defaultColumns['default'],
    init_rpt_time: localStorage.getItem('rpt_time') ? localStorage.getItem('rpt_time').split(',') : [formatDate(getDefineDay(-1),'', 1), formatDate(getDefineDay(-1),'',1)],
    adgroup_suggest_price:null,
}

const mutations = {
    setBannerSetting(state, data){
        Vue.set(state, 'BANNER_SETTING', data);
    },
    setZZRptColumns(state, data){
        Vue.set(state, 'ZZRPT_COLUMNS', data.length ? data : defaultColumns['zz']);
    },
    setRptSetting(state, data){
        Vue.set(state, 'RPT_SETTING', data.length ? data : defaultColumns['default']);
    },
    setRptColumns(state, data){
        Vue.set(state, 'RPT_COLUMNS', data.length ? data : defaultColumns['rpt']);
    },
    setInitRptTime(state, data) {
        Vue.set(state, 'init_rpt_time', data)
    },
    setCurCampaign(state, data) {
        Vue.set(state, 'curCampaign', data);
    },
    getCampaignId(state, id) {
        Vue.set(state, 'campaignId', +id)
    },
    getCampaignList (state, data) {
        Vue.set(state, 'campaignList', data)
    },
    campaignOption (state, data) {
        state.campaignOption =  data.map((item) => {
            return { campaign_name: item.campaign_name, campaign_id: item.campaign_id }
        })
    },
    campaignRpt (state, data) {
        if(state.campaignList && state.campaignList.length){
            let resetRpt = {}
            for(let rpt_type in FEILDTITLE){
                resetRpt[rpt_type] = '-'
            }
            for(let [index, campaign] of state.campaignList.entries()){
                state.campaignList.splice(index, 1, Object.assign(campaign, data[campaign.campaign_id] ? data[campaign.campaign_id][0] : resetRpt))
            }
        }
    },
    setShopInfo (state, data) {
        Vue.set(state, 'shopInfo', data);
    },
    setAccount (state, data) {
        Vue.set(state, 'account', data);
    },
    setAdgroupSuggestPrice (state, data) {
        Vue.set(state, 'adgroup_suggest_price', Math.round(data) / 100);
    }
}

const actions = {
    getBannerCampaigns({ commit }) {
        Vue.prototype.$http.post('campaign/ajax_query_banner_campaigns', {})
        .then((res) => {
            if (!res.success) return
            //排序 先手动自动 在cpc cpm
            let arr = [], zd_arr = [], sd_arr = [];
            res.data.forEach(val => {
                if(val.setting_type){
                    zd_arr.push(val);
                }else{
                    sd_arr.push(val);
                }
            });
            zd_arr.sort((a, b) => {return b.type - a.type});
            sd_arr.sort((a, b) => {return b.type - a.type});
            arr = [].concat(zd_arr, sd_arr);
            commit('getCampaignList', arr)
            commit('campaignOption', arr)
        })
    },
    getCurrentCampaign({ commit, state }) {
        commit('setCurCampaign',{})
        Vue.prototype.$http.post('campaign/ajax_get_campaign_area_list', { campaign_id: state.campaignId })
        .then(res => {
            if (!res.success) return
            if(res.data.campaign_id === state.campaignId){
                commit('setCurCampaign', res.data)
            }
        })
    },
    getShopInfo({ commit, state }){
        Vue.prototype.$http.post('ajax_get_shop_version', {})
        .then(res => {
            if (!res.success) return
            commit('setShopInfo', res.data);
        })
    },
    getAccount({ commit, state }){
        Vue.prototype.$http.post('ajax_get_account_balance', {})
        .then(res => {
            if (!res.success) return
            commit('setAccount', res.data);
        })
    },
    getAdgroupSuggestPrice({ commit, state }){
        Vue.prototype.$http.post('adgroup/ajax_get_adgroup_suggested_bid_max', {})
        .then(res => {
            if (!res.success) return
            commit('setAdgroupSuggestPrice', res.data);
        })
    },
    getBannerSetting({ commit, state }){
        Vue.prototype.$http.post('ajax_get_settings_banner', {})
        .then(res => {
            if (!res.success) return
            commit('setBannerSetting', res.data);
        })
    },
}

export default {
    state,
    mutations,
    actions
}