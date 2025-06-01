<template>
    <div class="app-container">
        <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
            <el-table-column prop="id" label="Id" />
            <el-table-column prop="name" label="课程名称" />
            <el-table-column prop="code" label="课程代码" />
            <el-table-column prop="semester" label="学期" />
            <el-table-column prop="credit" label="学分" />
            <el-table-column prop="createTime" label="创建时间" width="160px" />
            <el-table-column width="180px" label="操作" align="center">
                <template slot-scope="{row}">
                    <router-link :to="{ path: '/student/course/detail', query: { id: row.id } }" class="link-left">
                        <el-button size="mini">查看详情</el-button>
                    </router-link>
                    <el-button size="mini" type="primary" @click="enrollCourse(row)" class="link-left">选课</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import studentCourseApi from '@/api/studentCourse'

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
            studentCourseApi.getAvailableCourses().then(data => {
                const re = data.response
                this.tableData = re
                this.listLoading = false
            })
        },
        enrollCourse(row) {
            let _this = this
            this.$confirm('确定选择该课程?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                studentCourseApi.enrollCourse(row.id).then(re => {
                    if (re.code === 1) {
                        _this.fetchData()
                        _this.$message.success(re.message)
                    } else {
                        _this.$message.error(re.message)
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消选课'
                })
            })
        }
    }
}
</script> 