<template>
    <div class="paper-edit-wrapper">
        <paper-editor :course-id="courseId" :paper-id="paperId" :return-path="returnPath"></paper-editor>
    </div>
</template>

<script>
import PaperEditor from '@/views/exam/paper/edit'

export default {
    components: {
        PaperEditor
    },
    computed: {
        courseId() {
            return this.$route.params.id
        },
        paperId() {
            return this.$route.query.id
        },
        returnPath() {
            return this.$route.query.returnPath || `/teacher/course/${this.courseId}/papers`
        }
    }
}
</script>

<style scoped>
.paper-edit-wrapper {
    width: 100%;
}
</style>