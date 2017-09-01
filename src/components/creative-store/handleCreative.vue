<template>
    <el-dialog v-model="showDialog" custom-class="creative-dialog" :title="title" @open="open" @close="close">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="创意名称：" prop="creative_name" class="inline">
                <el-input v-model="form.creative_name"></el-input>
                <span class="prompt">
                    <el-checkbox v-model="showSize" label="显示创意尺寸"></el-checkbox>
                </span>
            </el-form-item>
            <el-form-item label="创意类目：" prop="cat_id" class="inline">
                <el-select v-model="form.cat_id" size="small" :style="{width: '120px'}">
                    <el-option value="" label="请选择"></el-option>
                    <el-option v-for="(name,key) in catList" :key="key" :value="key" :label="name"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="URL链接：" prop="click_url">
                <el-input v-model="form.click_url"></el-input>
                    <span class="prompt">
                    <el-checkbox v-model="form.is_trans_to_wifi" label="转化无线店铺首页／宝贝链接"></el-checkbox>
                    <a href="http://bbs.taobao.com/catalog/thread/14181510-260443736.htm" target="_blank">转换规则</a>
                    </span>
            </el-form-item>
            <el-form-item label="创意图片：" prop="image">
                <base64-file-upload ref="fileUpload"
                    class="file-upload"
                    accept="image/png,image/jpeg,image/jpg"
                    image-class="file-upload-image"
                    input-class="file-upload-input el-input__inner"
                    :max-size="customImageMaxSize"
                    :default-preview="editPreview"
                    :reset="showDialog"
                    @size-exceeded="onSizeExceeded"
                    @error="onImgError"
                    @load="onLoad" />
                <span class="prompt">支持jpg、jpeg、png格式，大小2MB以内, 查看<a href="https://zuanshi.taobao.com/web/size.html?spm=a2322.8223125.1092310.df612117b.OyfK8G" target="_blank">具体尺寸要求</a></span>
                <span class="red" v-show="imgError">图片尺寸或大小不符合要求</span>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="showDialog = false">取消</el-button>
            <el-button type="primary" @click="handleCreative('form')">保存</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import base64FileUpload from './base64FileUpload'

    export default {
        components: { base64FileUpload },
        props: {
            edit: {
                default: '',
            },
            show: {
                type: Boolean,
                default: false,
            },
            catList: {
                type: Object
            }
        },
        computed: {
            title() {
                return this.edit ? '编辑创意' : '新建创意'
            }
        },
        watch: {
            show(v) {
                this.showDialog = v
            },
            showSize(t) {
                const name = this.form.creative_name
                const nameSize = name.slice(name.lastIndexOf('_') + 1, name.length)
                if (!this.edit && !this.imgSize) return 
                if (nameSize === this.imgSize.slice(1) || nameSize === (this.edit && this.edit.creative_size.replace('*', 'x'))) {
                    if (t) {
                        this.form.creative_name = name.slice(0, name.lastIndexOf('_')) + this.imgSize
                    } else {
                        this.form.creative_name = name.slice(0, name.lastIndexOf('_'))
                    }
                } else {
                    this.form.creative_name = t ? name + this.imgSize : name
                }
            },
            imgSize(newSize, oldSize) {
                if (this.showSize) {
                    const name = this.form.creative_name
                    const nameSize = name.slice(name.lastIndexOf('_') + 1, name.length)
                    if (nameSize === oldSize.slice(1) || nameSize === (this.edit && this.edit.creative_size.replace('*', 'x'))) {
                        this.form.creative_name = name.slice(0, name.lastIndexOf('_')) + newSize
                    } else {
                        this.form.creative_name = name + newSize
                    }
                }
            }
        },
        methods: {
            onLoad(dataUri, w, h) {
                this.form.image = dataUri
                this.imgSize = `_${w}x${h}`
            },
            onSizeExceeded(size) {
                this.$message.error('图片大小限制在2MB内');
            },
            onImgError(b) {
                this.imgError = b
            },
            handleCreative(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let data = Object.assign({}, this.form)
                        let url;
                        if (this.imgError) {
                            return
                        }
                        if (!data.image) {
                            this.$message.error('请先上传图片')
                            return
                        }
                        this.$emit('submit', data)
                    }
                })
            },
            open() {
                if (this.edit) {
                    Object.keys(this.form).forEach(key => {
                        this.form[key] = this.edit[key] ? this.edit[key] : this.form[key]
                    })
                    this.form.image = this.edit.image_path
                    this.editPreview = this.edit.image_path
                    this.imgSize = '_' + this.edit.creative_size.replace('*', 'x')
                    this.showSize = true
                    this.$nextTick(() => {
                        this.$refs.fileUpload.imgWidth = this.edit.creative_size.split('*')[0]
                        this.$refs.fileUpload.imgHeight = this.edit.creative_size.split('*')[1]
                    })
                    const name = this.form.creative_name
                    const nameSize = name.slice(name.lastIndexOf('_') + 1, name.length)
                    if (nameSize === this.imgSize.slice(1) || nameSize === (this.edit && this.edit.creative_size.replace('*', 'x'))) {
                        this.form.creative_name = name.slice(0, name.lastIndexOf('_')) + this.imgSize
                    } else {
                        this.form.creative_name = name + this.imgSize
                    }
                }

            },
            close() {
                this.$emit('close')
                Object.keys(this.form).forEach(key => 
                    this.form[key] = key !== 'is_trans_to_wifi' ? '' : false
                )
                this.editPreview = null
                this.imgSize = ''
                this.imgError = false
            },
        },
        data() {
            const validateName = (rule, val, cb) => {
                const patrn = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,32}$/g
                if (!val) { return cb(new Error('创意名称不能为空')) }
                if (!patrn.test(val)) { return cb(new Error('只支持汉字、字母、数字、下划线')) } 
                cb()
            }
            const validateUrl = (rule, val, cb) => {
                if (!val) {
                    return cb(new Error('URL不能为空'))
                } 
                const reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
                if (!reg.test(val)) { return cb(new Error('URL格式不正确')) }
                cb()
            }
            const validateCat =  (rule, val, cb) => {
                if (!val) {
                    return cb(new Error('创意类目不能为空'))
                }
                cb()
            }
            return {
                form: {
                    creative_name: '',
                    cat_id: '',
                    click_url: '',
                    image: '',
                    creative_id: '',
                    is_trans_to_wifi: false,
                },
                showSize: true,
                rules: {
                    creative_name: [
                        { validator: validateName, trigger: 'blur' }
                    ],
                    click_url: [
                        { validator: validateUrl, trigger: 'blur' }
                    ],
                    cat_id: [
                        { validator: validateCat, trigger: 'blur' }
                    ]
                },
                customImageMaxSize: 2097152,
                editPreview: null,
                showDialog: false,
                imgSize: '',
                imgError: false,
            }
        }
    }
</script>

<style lang="less">
     .creative-dialog {
            width: 600px;
            .el-dialog__body {
                padding-left: 30px;
                padding-right: 50px;
                .el-form {
                    .inline {
                        display: inline-block;
                        &:first-child {
                            width: 56%;
                        }
                        &:nth-child(2) {
                            width: 36%;
                            margin-left: 22px;
                        }
                    }
                    .file-upload {
                        .file-upload-image {
                            margin: auto;  
                            position: absolute;  
                            top: 50%; left: 50%;  
                            -webkit-transform: translate(-50%,-50%);  
                                -ms-transform: translate(-50%,-50%);  
                                    transform: translate(-50%,-50%);  
                        }
                        .file-upload-input {
                            width: 100%;
                            margin-top: 10px;
                        }
                    }
                    .red {
                        line-height: 1;
                        font-size: 12px;
                        color: #ff4949;
                        float: left;
                        margin-top: 5px;
                    }
                    .prompt {
                        font-size: 12px;
                        color: #aaa;
                        display: inline-block;
                        margin-top: 8px;
                        line-height: 1;
                        white-space: nowrap;
                        float: left;
                        .el-checkbox {
                            color: #aaa;
                            .el-checkbox__inner {
                                width: 16px;
                                height: 16px;
                            }
                            .el-checkbox__inner::after {
                                height: 7px;
                                left: 4px;
                                width: 4px;
                            }
                        }
                    }
                }
            }
        }
</style>