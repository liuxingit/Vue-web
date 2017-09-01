<template>
    <div class="vue-base64-file-upload">
        <div class="vue-base64-file-upload-wrapper" :style="wrapperStyles">
            <!--<div v-show="previewImage && !disablePreview"></div>-->
            <div class="icon" v-if="!previewImage">
                <i class="iconfont icon-jia"></i>
                <span>点击上传图片</span>
            </div>
            <img :src="previewImage" :class="imageClass" :style="[noBorder, imgSize]"/>
            <input v-if="reset"
            type="file"
            @change="onChange"
            :style="fileInputStyles"
            :accept=accept />
        </div>
        <input
            v-show="previewImage"
            type="text"
            :class="inputClass"
            :style="textInputStyles"
            :value="fileName || file && file.name"
            disabled />
    </div>
</template>

<script>
    if (!window.FileReader) {
        this.$message.error('你的浏览器不支持 FileReader API!');
    }
    export default {
        props: {
            imageClass: {
                type: String,
                default: ''
            },
            inputClass: {
                type: String,
                default: ''
            },
            accept: {
                type: String,
                default: 'image/png,image/gif,image/jpeg'
            },
            maxSize: {
                type: Number,
                default: 10 // megabytes
            },
            disablePreview: {
                type: Boolean,
                default: false
            },
            fileName: {
                type: String,
                default: ''
            },
            placeholder: {
                type: String,
                default: '点此此处上传图片'
            },
            defaultPreview: {
                type: String,
                default: ''
            },
            reset: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                file: null,
                preview: null,
                visiblePreview: false,
                width: null,
                height: null,
                imgWidth: 0,
                imgHeight: 1,
                sizeLoop: [ 
                    { wh: '190x90', size: 9216 },
                    { wh: '0x0', size: 9216 },
                    { wh: '0x1', size: 9216 },
                    { wh: '190x43', size: 13312 },
                    { wh: '220x52', size: 15360 },
                    { wh: '168x76', size: 16384 },
                    { wh: '320x50', size: 17408 },
                    { wh: '194x129', size: 21504 },
                    { wh: '145x165', size: 21504 },
                    { wh: '110x300', size: 25600 },
                    { wh: '180x180', size: 25600 },
                    { wh: '160x200', size: 25600 },
                    { wh: '130x280', size: 27648 },
                    { wh: '370x100', size: 27648 },
                    { wh: '250x155', size: 28672 },
                    { wh: '240x164', size: 28672 },
                    { wh: '300x125', size: 28672 },
                    { wh: '200x200', size: 29696 },
                    { wh: '300x150', size: 31744 },
                    { wh: '728x90', size: 32768 },
                    { wh: '210x220', size: 32768 },
                    { wh: '160x310', size: 33792 },
                    { wh: '240x200', size: 33792 },
                    { wh: '375x130', size: 33792 },
                    { wh: '186x275', size: 34816 },
                    { wh: '200x250', size: 34816 },
                    { wh: '500x105', size: 35840 },
                    { wh: '600x90', size: 36864 },
                    { wh: '640x90', size: 37888 },
                    { wh: '300x250', size: 37888 },
                    { wh: '200x300', size: 39936 },
                    { wh: '250x250', size: 40960 },
                    { wh: '320x200', size: 41984 },
                    { wh: '640x100', size: 41984 },
                    { wh: '750x90', size: 43008 },
                    { wh: '500x140', size: 44032 },
                    { wh: '760x90', size: 44032 },
                    { wh: '640x110', size: 45056 },
                    { wh: '314x260', size: 50176 },
                    { wh: '750x112', size: 51200 },
                    { wh: '950x90', size: 52224 },
                    { wh: '600x145', size: 53248 },
                    { wh: '1000x90', size: 54272 },
                    { wh: '990x90', size: 54272 },
                    { wh: '600x150', size: 54272 },
                    { wh: '640x140', size: 54272 },
                    { wh: '336x280', size: 56320 },
                    { wh: '990x95', size: 56320 },
                    { wh: '940x107', size: 59392 },
                    { wh: '500x200', size: 59392 },
                    { wh: '200x500', size: 59392 },
                    { wh: '506x200', size: 60416 },
                    { wh: '340x300', size: 60416 },
                    { wh: '300x350', size: 62464 },
                    { wh: '280x406', size: 66560 },
                    { wh: '300x400', size: 69632 },
                    { wh: '400x300', size: 69632 },
                    { wh: '650x200', size: 74752 },
                    { wh: '600x220', size: 75776 },
                    { wh: '700x200', size: 79872 },
                    { wh: '520x280', size: 81920 },
                    { wh: '720x200', size: 81920 },
                    { wh: '750x200', size: 84992 },
                    { wh: '640x245', size: 88064 },
                    { wh: '642x250', size: 90112 },
                    { wh: '740x230', size: 94208 },
                    { wh: '940x180', size: 94208 },
                    { wh: '700x250', size: 97280 },
                    { wh: '300x600', size: 99328 },
                    { wh: '800x234', size: 103424 },
                    { wh: '586x325', size: 104448 },
                    { wh: '640x296', size: 104448 },
                    { wh: '640x300', size: 105472 },
                    { wh: '640x320', size: 111616 },
                    { wh: '690x300', size: 112640 },
                    { wh: '720x290', size: 113664 },
                    { wh: '640x330', size: 114688 },
                    { wh: '850x250', size: 115712 },
                    { wh: '730x300', size: 118784 },
                    { wh: '690x336', size: 124928 },
                    { wh: '640x370', size: 128000 },
                    { wh: '600x400', size: 129024 },
                    { wh: '690x350', size: 130048 },
                    { wh: '656x396', size: 139264 },
                    { wh: '800x330', size: 141312 },
                    { wh: '676x396', size: 143360 },
                    { wh: '920x300', size: 147456 },
                    { wh: '640x200', size: 153600 },
                    { wh: '720x410', size: 156672 },
                    { wh: '600x500', size: 159744 },
                    { wh: '640x480', size: 162816 },
                    { wh: '720x450', size: 171008 },
                    { wh: '1000x400', size: 209920 },
                    { wh: '900x500', size: 234496 },
                    { wh: '1200x658', size: 404480 },
                    { wh: '1200x664', size: 407552 },
                    { wh: '1715x520', size: 455680 }
                ],
            }
        },
        computed: {
            wrapperStyles() {
                const border = this.previewImage ? '1px' : '0'
                return {
                    'position': 'relative',
                    'width': '100%',
                    'height': '160px',
                    'border': `${border} solid #ccc`,
                    'borderRadius': '4px'
                };
            },
            fileInputStyles() {
                return {
                    'width': '100%',
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'bottom': 0,
                    'opacity': 0,
                    'overflow': 'hidden',
                    'outline': 'none',
                    'cursor': 'pointer'
                };
            },
            textInputStyles() {
                return {
                    'width': '100%',
                    'cursor': 'pointer'
                };
            },
            imgSize() {
                const rate = (this.imgWidth/this.imgHeight).toFixed(3)
                return {
                    width: rate > 2.625 ? (this.imgWidth > 420 ? '100%' : this.imgWidth) : 'auto' || 0,
                    height: rate < 2.625 ? (this.imgHeight > 160 ? '100%' : this.imgHeight) : 'auto' || 0,
                }
            },
            noBorder() {
                if (this.previewImage) {
                    return { opacity: 1 }
                }
                return { opacity: 0 }
            },
            borderDotted() {
                if (this.previewImage) {
                    return { borderStyle: 'none' }
                }
                return { borderStyle: 'dotted' } 
            },
            previewImage() {
                return this.preview || this.defaultPreview;
            }
        },
        watch: {
            reset(v) {
                if (!v) {
                    this.file = null
                    this.preview = null
                }
            }
        },
        methods: {
            onChange(e) {
                const files = e.target.files || e.dataTransfer.files;
                if (!files.length) {
                    return;
                }
                const file = files[0];
                const size = file.size
                // check file max size
                if (size > this.maxSize) {
                    this.$emit('size-exceeded', size);
                    return;
                }
                // update file
                
                const reader = new FileReader();
                reader.onload = e => {
                    const dataURI = e.target.result;
                    if (dataURI) {
                        this.loadImage(dataURI, (w, h) => {
                            const wh = `${w}x${h}`
                            const flag = this.sizeLoop.some(item => {
                                if (item.wh === wh) {
                                    if (size <= item.size) {
                                        return true
                                    }
                                    this.$message.error(`尺寸为${wh}的图片需小于${item.size/1024}kb`)
                                }
                            })
                            if (flag) {
                                this.file = file;
                                this.imgWidth = w
                                this.imgHeight = h
                                this.$emit('file', file);
                                this.preview = dataURI;
                                this.$emit('load', dataURI, w, h);
                                this.$emit('error', false);
                                return
                            } 
                            this.$emit('error', true)
                        })
                    }
                };
                // read blob url from file data
                reader.readAsDataURL(file);
            },
            loadImage(src, cb) {
                const img = new Image()
                img.src = src
                img.onload = () => {
                    const w = img.width
                    const h = img.height
                    typeof cb === 'function' && cb(w, h)
                }
            }
        },
    }
</script>

<style lang="less">
    .vue-base64-file-upload {
        .icon {
            text-align: center;
            position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            margin: auto;
            padding: 50px;
            color: #ccc;
            font-size: 12px;
            border: 2px dashed;
            border-radius: 5px;
            .iconfont {
                font-size: 36px;
                color: #ccc;
                display: block;
            }
        }
    }
</style>