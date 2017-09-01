import Vue from 'vue'
import Router from 'vue-router'

const IndexPage = r => require.ensure([], () => r(require('@/pages/IndexPage.vue')), 'IndexPage')
const RptPage = r => require.ensure([], () => r(require('@/pages/RptPage.vue')), 'RptPage')
const RptPageDay = r => require.ensure([], () => r(require('@/pages/RptPageDay.vue')), 'RptPageDay')
const CombinationPage = r => require.ensure([], () => r(require('@/pages/CombinationPage.vue')), 'CombinationPage')
const AdgroupsPage = r => require.ensure([], () => r(require('@/pages/AdgroupsPage.vue')), 'AdgroupsPage')
const AdgroupDscPage = r => require.ensure([], () => r(require('@/pages/AdgroupDscPage.vue')), 'AdgroupDscPage')
//const ToolsPage = r => require.ensure([], () => r(require('@/pages/ToolsPage.vue')), 'ToolsPage')
const CreativeStorePage = r => require.ensure([], () => r(require('@/pages/CreativeStorePage.vue')), 'CreativeStorePage')
// const HelpPage = r => require.ensure([], () => r(require('@/pages/HelpPage.vue')), 'HelpPage')
//const ServicePage = r => require.ensure([], () => r(require('@/pages/ServicePage.vue')), 'ServicePage')
const AddAdgroupPage = r => require.ensure([], () => r(require('@/pages/AddAdgroupPage.vue')), 'AddAdgroupPage')
const OperationLogPage = r => require.ensure([], () => r(require('@/pages/OperationLogPage.vue')), 'OperationLogPage')
const ShopAnalysis = r => require.ensure([], () => r(require('@/pages/ShopAnalysis.vue')), 'ShopAnalysis')
const ShopAnalysisDetail = r => require.ensure([], () => r(require('@/pages/ShopAnalysisDetail.vue')), 'ShopAnalysisDetail')

import NotFoundComponent from '@/components/NoFoundComponent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'IndexPage',
      component: IndexPage
    },
    {
      path: '/rpt',
      name: 'RptPage',
      component: RptPage
    },
    {
      path: '/rpt_day',
      name: 'RptPageDay',
      component: RptPageDay
    },
    {
      path: '/combination',
      name: 'CombinationPage',
      component: CombinationPage
    },
    {
      path: '/adgroups/:campaign_id',
      name: 'AdgroupsPage',
      component: AdgroupsPage
    },
    {
      path: '/add_adgroup/:campaign_id',
      name: 'AddAdgroupPage',
      component: AddAdgroupPage
    },
    {
      path: '/adgroupdsc/:adgroup_id',
      name: 'AdgroupDscPage',
      component: AdgroupDscPage
    },
    // {
    //   path: '/tools',
    //   name: 'ToolsPage',
    //   component: ToolsPage
    // },
    // {
    //   path: '/help',
    //   name: 'HelpPage',
    //   component: HelpPage
    // },
    {
      path: '/creative_store',
      name: 'CreativeStorePage',
      component: CreativeStorePage
    },
    // {
    //   path: '/service',
    //   name: 'ServicePage',
    //   component: ServicePage
    // },
    {
      path: '/operation_log',
      name: 'OperationLogPage',
      component: OperationLogPage
    },
    {
      path: '/operation_log/:campaign_id',
      name: 'OperationLogPage',
      component: OperationLogPage
    },
    {
      path: '/shop_analysis',
      name: 'ShopAnalysis',
      component: ShopAnalysis
    },
    {
      path: '/shop_analysis/detail',
      name: 'ShopAnalysisDetail',
      component: ShopAnalysisDetail
    },
    {
      path: '*',
      name: 'NotFoundComponent',
      component: NotFoundComponent
    }
  ]
})