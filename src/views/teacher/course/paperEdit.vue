<template>
    <div class="paper-edit-wrapper">
        <paper-edit-form :course-id="courseId" :paper-id="paperId" :return-path="returnPath"></paper-edit-form>
    </div>
</template>

<script>
import PaperEditForm from './paperEditForm'

export default {
    components: {
        PaperEditForm
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