<script setup>
const props=defineProps({
    text: {
        type: String,
        default: '',
    },
    circle: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: '',
    }
})
</script>

<template>
    <el-button v-if="!circle" type="primary" class="btn">
        {{ text }}
    </el-button>
    <el-button v-else :icon="icon" type="primary" circle class="circle">
    </el-button>
</template>

<style lang="sass" scoped>
@import '@/assets/styles/index.sass'

.btn
    font-size:  17px
    padding: 20px 24px
    background-color: $violet
    border-radius: 4px

.circle
    font-size: 16px
    background-color: $violet
</style>

