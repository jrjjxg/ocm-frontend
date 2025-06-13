<template>
    <div class="question-edit-wrapper">
        <component :is="currentEditor" :course-id="courseId" :question-id="questionId"></component>
    </div>
</template>

<script>
import SingleChoice from './components/SingleChoiceEdit'

export default {
    components: {
        SingleChoice
    },
    props: {
        type: {
            type: String,
            required: true
        }
    },
    computed: {
        courseId() {
            return this.$route.params.id
        },
        questionId() {
            return this.$route.query.id
        },
        currentEditor() {
            // 所有题型都使用统一的SingleChoiceEdit组件
            // 这个组件内部会根据questionType自动适配不同的题型
            return SingleChoice
        }
    }
}
</script>

<style scoped>
.question-edit-wrapper {
    width: 100%;
}
</style>