<template>
    <transition name="modal-fade">
        <div class="img-modal" v-if="img">
            <div class="modal" @click="close">
                <img :src="img" @click.stop>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        props: {
            img: {
                default: ''
            }
        },
        watch: {
            img (v) {
                console.log(v)
                if (v) {
                    console.log(document.querySelector('body').style.overflow)
                    document.querySelector('body').style.overflow = 'hidden'
                } else {
                    document.querySelector('body').style.overflow = 'initial'
                }
            }
        },
        methods: {
            close() {
                this.$emit('close')
            }
        }
    }
</script>

<style lang="less">
    .modal-fade-enter-active, .modal-fade-leave-active {
        transition: all linear .3s;
    }
    .modal-fade-enter, .modal-fade-leave-active {
        opacity: 0;
        margin-top: -100px;
    }
    .img-modal {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 999;
        .modal {
            background: rgba(0,0,0,0.6);
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                cursor: pointer;
            }
        }
    }
</style>