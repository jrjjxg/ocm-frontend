<template>
    <div class="teacher-app-wrapper">
        <div class="teacher-main-container">
            <div class="teacher-header">
                <teacher-navbar />
                <teacher-tags-view />
            </div>
            <app-main class="teacher-content" />
        </div>
    </div>
</template>

<script>
import { AppMain } from './components'
import TeacherNavbar from './components/TeacherNavbar'
import TeacherTagsView from './components/TeacherTagsView'
import BackToTop from '@/components/BackToTop'

export default {
    name: 'TeacherLayout',
    components: {
        AppMain,
        TeacherNavbar,
        TeacherTagsView,
        BackToTop
    }
}
</script>

<style lang="scss" scoped>
.teacher-app-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: #f5f7fa;
}

.teacher-main-container {
    height: 100%;
    width: 100%;
    position: relative;
}

.teacher-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: 100%;
    transition: width 0.28s;
    background: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
}

.teacher-content {
    padding-top: 84px;
    /* Header高度 + TagsView高度 */
    min-height: calc(100vh - 84px);
    width: 100%;
    position: relative;
}

.foot-copyright {
    background: #fff;
    border-top: 1px solid #e6e6e6;
    text-align: center;
    padding: 10px 0;
    color: #909399;
    font-size: 14px;
}
</style>