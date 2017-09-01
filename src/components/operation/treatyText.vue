<template>
    <div>
          <el-popover popper-class="zuanzhan-treaty" title="钻石展位广告服务使用规范" ref="treaty" trigger="click" width="300" placement="right-end">
            <div class="zuanzhan-treaty-text">
                <span>为了各位掌柜的利益，请认真阅读以下内容</span>
                <p>
                    <span>您需要：</span>
                    <span>1、新建或者选择一个现有计划（必须CPC模式）设置为托管计划。</span>
                    <span>2、在计划中添加推广单元，包括定向、资源位、创意的添加。</span>
                </p>
                <p>
                    <span>系统将：</span>
                    <span>1、为托管的推广单元进行自动优化，包括投放地域、投放时段优化。</span>
                    <span>2、为您选择的托管单元进行自动优化、只优化价格等操作。</span>
                    <span>3、自动优化的推广单元，系统会关闭官方的智能条件功能。</span>
                    <span>4、自动优化dmp，可能会进行新增操作。</span>
                    <span>5、删除您在官方后台添加的行业店铺定向，以便进行算法优化</span>
                </p>
                <p>
                    <span>温馨提示：</span>
                    <span>1、经您确认后的推广单元，务必遵守《钻石展位广告服务使用规范》。</span>
                    <span>2、开启自动计划后，系统根据您所设的条件自动进行优化，若因违规所导致的钻展惩罚，对您的店铺造成的损失，优钻宝不承担任何责任！</span>
                </p>
                <p> 
                    <span>计划设置：</span>
                    <span>1、自动计划仅支持CPC计划。</span>
                    <span>2、可以对自动计划中的推广单元进行托管操作。</span>
                </p>
                <p>
                    <span>选择人群：</span>
                    <span>1、不要频繁更换定向人群，效果需要培养的。</span>
                </p>
        </div> 
    </el-popover>
    <el-button v-popover:treaty type="text" size="mini">查看服务条款</el-button>
</div>
</template>

<style lang="less">
    .zuanzhan-treaty {
        .zuanzhan-treaty-text {
            p {
                margin-bottom: 5px;
                span {
                    display: block;
                    margin-bottom: 5px;
                }
            }
        }
}
</style>