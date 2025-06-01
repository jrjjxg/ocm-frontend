<template>
    <div class="question-edit-wrapper">
        <component :is="currentEditor" :course-id="courseId" :question-id="questionId"></component>
    </div>
</template>

<script>
import SingleChoice from '@/views/exam/question/edit/single-choice'
import MultipleChoice from '@/views/exam/question/edit/multiple-choice'
import TrueFalse from '@/views/exam/question/edit/true-false'
import GapFilling from '@/views/exam/question/edit/gap-filling'
import ShortAnswer from '@/views/exam/question/edit/short-answer'

export default {
    components: {
        SingleChoice,
        MultipleChoice,
        TrueFalse,
        GapFilling,
        ShortAnswer
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
            const typeMap = {
                'singleChoice': SingleChoice,
                'multipleChoice': MultipleChoice,
                'trueFalse': TrueFalse,
                'gapFilling': GapFilling,
                'shortAnswer': ShortAnswer
            }
            return typeMap[this.type] || SingleChoice
        }
    }
}
</script>

<style scoped>
.question-edit-wrapper {
    width: 100%;
}
</style>