<template>
    <div class="app-container">
        <div class="filter-container" style="margin-bottom: 20px;">
            <span class="page-title">我的课程</span>
        </div>

        <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="id" label="Id" />
            <el-table-column prop="name" label="课程名称" />
            <el-table-column prop="code" label="课程代码" />
            <el-table-column prop="semester" label="学期" />
            <el-table-column prop="credit" label="学分" />
            <el-table-column prop="createTime" label="创建时间" width="160px" />
            <el-table-column label="状态" prop="status" width="70px">
                <template slot-scope="{row}">
                    <el-tag :type="statusTagFormatter(row.status)">
                        {{ statusFormatter(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column width="240px" label="操作" align="center">
                <template slot-scope="{row}">
                    <router-link :to="{ path: `/teacher/course/${row.id}/overview` }" class="link-left">
                        <el-button size="mini" type="primary">进入课程</el-button>
                    </router-link>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import teacherCourseApi from '@/api/teacherCourse'

export default {
    data() {
        return {
            listLoading: true,
            tableData: []
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        fetchData() {
            this.listLoading = true
            teacherCourseApi.getCourseList().then(data => {
                const re = data.response
                this.tableData = re
                this.listLoading = false
            })
        },
        statusFormatter(status) {
            return status === 1 ? '启用' : '禁用'
        },
        statusTagFormatter(status) {
            return status === 1 ? 'success' : 'danger'
        }
    }
}
</script>

<style scoped>
.page-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
}
</style>