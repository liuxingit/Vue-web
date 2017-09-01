//麦苗优钻宝的配置信息
//let pub = {};

let FEILDTITLE = {
    cvr: 'CVR',
    alipay_inshop_amt: '成交额',
    alipay_in_shop_num: '成交量',
    gmv_inshop_amt: 'GMV成交额',
    gmv_inshop_num: 'GMV成交量',
    cart_num: '加购物车数',
    dir_shop_col_num: '店铺收藏数',
    inshop_item_col_num: '宝贝收藏数',
    avg_access_page_num: '平均访问页面数',
    avg_access_time: '平均访问时长',
    deep_inshop_uv: '深度进店访客',
    uv: 'UV',
    ecpc: 'ECPC',
    ecpm: 'ECPM',
    ctr: 'CTR',
    roi: '投入产出比',
    charge: '花费',
    click: '点击数',
    ad_pv: '展现数',
}
let FEILDTITLE2 = {
    cvr: 'CVR',
    alipay_inshop_amt: '成交额',
    alipay_in_shop_num: '成交量',
    cart_num: '加购物车数',
    dir_shop_col_num: '店铺收藏数',
    inshop_item_col_num: '宝贝收藏数',
    ecpc: 'ECPC',
    ecpm: 'ECPM',
    ctr: 'CTR',
    roi: '投入产出比',
    charge: '花费',
    click: '点击数',
    ad_pv: '展现数',
}

const INDEX_RPT_SETTING = ['charge','ecpm','click','ad_pv','ecpc','ctr']
//let RPT_SETTING = ['charge','ad_pv','click','ctr','ecpm','ecpc','alipay_inshop_amt','roi', 'cvr']
const CAMPAIGN_STATUS = {
    1:{
        value:1,
        label:'正在投放',
        color_class:'textSuccess',
    },
    0:{
        value:0,
        label:'暂停投放',
        color_class:'textStop',
    },
    3:{
        value:3,
        label:'等待投放',
        color_class:'textWaiting',
    },
    9:{
        value:9,
        label:'结束投放',
        color_class:'',
    },
    '-99':{
        value:-99,
        label:'投放障碍',
        color_class:'textWarning',
    },
    5:{
        value:5,
        label:'待编辑',
        color_class:'textSuccess',
    }
}

//默认
//let RPT_COLUMNS = ['ad_pv','click','uv','ecpc','ctr','charge','alipay_inshop_amt','cvr','roi'];
//没有更多数据之前，展示全部
//let RPT_COLUMNS = ['ad_pv','click','uv','ctr','charge','ecpc','ecpm','cvr','alipay_in_shop_num','alipay_inshop_amt','roi','gmv_inshop_num','gmv_inshop_amt', 'cart_num', 'dir_shop_col_num', 'inshop_item_col_num', 'avg_access_page_num', 'avg_access_time', 'deep_inshop_uv'];
const DEFAULT_VALUE = {cvr: 0, alipay_inshop_amt: 0, alipay_in_shop_num: 0, gmv_inshop_amt: 0, gmv_inshop_num: 0, cart_num: 0, dir_shop_col_num: 0, inshop_item_col_num: 0, avg_access_page_num: 0, avg_access_time: 0, deep_inshop_uv: 0, uv: 0, ecpc: 0, ecpm: 0, ctr: 0, roi: 0, charge: 0, click: 0, ad_pv: 0 };

const TYPES = {2:'cpm', 8:'cpc'}//计划付费的类型
const TYPES_DAY_BUDGETS = {2:300, 8:30}//计划付费的最低日限额
const TYPES_CROWD_PRICE = {2:2000, 8:50}//计划付费的最低日限额

const ADGROUP_AUTO_MANAGED = {
    1:{
        label:'自动选择定向 + 改价 + 资源位更新',
        value:1
    },
    2:{
        label:'只优化价格',
        value:2,
    },
    3:{
        label:'不优化',
        value:3,
    }
}

//创意审核状态
const AUDIT_STATUS_DICT = {
    '-4':'待审核',
    '-1':'待审核',
    '0':'待审核',
    '1':'审核通过',
    '-2':'审核拒绝',
    '-5':'审核拒绝',
    '-9':'审核拒绝',
}
const AUDIT_STATUS = {
    '-4,-1,0':{
        value:'-4,-1,0',
        title:'待审核',
        color_class:'textWarning',
    },
    // '-1':{
    //     value:-1,
    //     title:'待审核',
    //     color_class:'textWarning',
    // },
    // '0':{
    //     value:0,
    //     title:'待审核',
    //     color_class:'textWarning',
    // },
    '1':{
        value:'1',
        title:'审核通过',
        color_class:'textSuccess',
    },
    '-2,-5,-9':{
        value:'-2,-5,-9',
        title:'审核拒绝',
        color_class:'textDanger',
    },
    // '-5':{
    //     value:-5,
    //     title:'审核拒绝',
    //     color_class:'textDanger',
    // },
    // '-9':{
    //     value:-9,
    //     title:'审核拒绝',
    //     color_class:'textDanger',
    // }
}
const CREATIVE_LEVEL = {
    1:{
        value:1,
        title:'一级',
        color_class:'textWarning',
    },
    2:{
        value:2,
        title:'二级',
        color_class:'textWarning',
    },
    3:{
        value:3,
        title:'三级',
        color_class:'textWarning',
    },
    4:{
        value:4,
        title:'四级',
        color_class:'textSuccess',
    },
    10:{
        value:10,
        title:'十级',
        color_class:'textDanger',
    },
    99:{
        value:99,
        title:'未分级',
        color_class:'textDanger',
    },
}
const SITE_TYPE = {
    1:{
        value:1,
        title:'站内',
    },
    2:{
        value:2,
        title:'站外',
    },
    3:{
        value:3,
        title:'全部',
    },
}
const MEDIA_TYPE = {
    1:{
        value:1,
        title:'PC',
    },
    2:{
        value:2,
        title:'无线',
    },
    3:{
        value:3,
        title:'全部',
    },
}
//营销场景定向的提示信息
const YX_INFO = {
    '触达客户':'对店铺、宝贝，有搜索、浏览、收藏、购买行为的人群',
    '兴趣客户':'点击广告的人群',
    '核心客户':'广告展现的人群',
}
const CROWDS_INFO = {
    '类目型定向-高级兴趣点':'近期对某些购物兴趣点有意向的人群。兴趣点定向的升级版',
    '相似宝贝定向':'近期对置顶宝贝的竞品宝贝感兴趣的人群',
    '智能定向':'系统根据您的店铺或宝贝为您挑选的优质人群（为保证投放效果，建议持续投放2天以上）',
    '营销场景定向':'按用户与店铺之间更细力度的营销关系划分圈定的人群',
    '达摩盘定向':'基于达摩自定义组合圈定的各类人群',
    '兴趣点定向':'对某些类型或庚哥的商品感兴趣的人群',
    '访客定向':'近期访问过某些店铺的人群',
    '群体定向':'对某一些一级类目感兴趣的人群',
    '通投':'不限人群投放',
    '系统智能推荐':'',
    '行业店铺':'',
}
const ZNDX_INFO = {
    '智能定向-店铺':'系统根据您的店铺现状为您挑选的优质人群。勾选店铺时建议您投放到店铺页面效果更佳。',
    '智能定向-宝贝':'系统根据您选择的宝贝为您挑选的优质人群。勾选宝贝时建议您投放到宝贝详情页效果更佳。'
}

const ALLOW_AD_FORMAT_LIST = {
    2:'图片',
    5:'文字链',
    3:'FLASH',
    9:'FLASH不遮盖',
    10:'创意模板'
}

const MESSAGE_TYPE = {
    'activity': '活动通知',
    'cs_message': '专属留言',
    'expire_remind': '到期提醒',
    'activity_yuny': '最新活动',
    'auto_add_adgroup': '添加确认',
    'main_account_confirm': '授权确认'
}
export const ORI_MORE_DATA_COLUMNS = {
    'zz':['ad_pv','click', 'charge', 'alipay_in_shop_num', 'ecpc', 'alipay_inshop_amt', 'roi', 'inshop_item_col_num','dir_shop_col_num', 'cart_num'],//直钻结合
    'rpt':['charge','click','ctr','ad_pv','ecpc','alipay_inshop_amt','cvr','roi'],//报表
    'default':['charge','ad_pv','click','ctr','ecpm','ecpc','alipay_inshop_amt','roi'],//计划推广单元等等
}

export {MESSAGE_TYPE,FEILDTITLE2,AUDIT_STATUS_DICT, ZNDX_INFO,ALLOW_AD_FORMAT_LIST,TYPES_CROWD_PRICE,ADGROUP_AUTO_MANAGED, FEILDTITLE,INDEX_RPT_SETTING, CAMPAIGN_STATUS,TYPES, TYPES_DAY_BUDGETS,DEFAULT_VALUE,AUDIT_STATUS,CREATIVE_LEVEL,SITE_TYPE,MEDIA_TYPE,YX_INFO,CROWDS_INFO}
// export default pub;