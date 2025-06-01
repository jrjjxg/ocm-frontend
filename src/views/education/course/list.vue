<template>
    <div class="app-container">
        <el-form :model="queryParam" ref="queryForm" :inline="true">
            <el-form-item label="课程名称：">
                <el-input v-model="queryParam.name"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">查询</el-button>
                <router-link :to="{ path: '/education/course/edit' }" class="link-left">
                    <el-button type="primary">添加</el-button>
                </router-link>
            </el-form-item>
        </el-form>

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
            <el-table-column width="340px" label="操作" align="center">
                <template slot-scope="{row}">
                    <el-button size="mini" @click="changeStatus(row)" class="link-left">
                        {{ statusBtnFormatter(row.status) }}
                    </el-button>
                    <router-link :to="{ path: '/education/course/edit', query: { id: row.id } }" class="link-left">
                        <el-button size="mini">编辑</el-button>
                    </router-link>
                    <router-link :to="{ path: '/education/course/teacher', query: { courseId: row.id } }"
                        class="link-left">
                        <el-button size="mini" type="success">管理教师</el-button>
                    </router-link>
                    <router-link :to="{ path: '/education/course/student', query: { courseId: row.id } }"
                        class="link-left">
                        <el-button size="mini" type="warning">管理学生</el-button>
                    </router-link>
                    <el-button size="mini" type="danger" @click="deleteCourse(row)" class="link-left">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex"
            :limit.sync="queryParam.pageSize" @pagination="search" />
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import courseApi from '@/api/course'

export default {
    components: { Pagination },
    data() {
        return {
            queryParam: {
                name: '',
                pageIndex: 1,
                pageSize: 10
            },
            listLoading: true,
            tableData: [],
            total: 0
        }
    },
    created() {
        this.search()
    },
    methods: {
        search() {
            this.listLoading = true
            courseApi.getCoursePageList(this.queryParam).then(data => {
                const re = data.response
                this.tableData = re.list
                this.total = re.total
                this.queryParam.pageIndex = re.pageNum
                this.listLoading = false
            })
        },
        changeStatus(row) {
            let _this = this
            courseApi.changeStatus(row.id).then(re => {
                if (re.code === 1) {
                    row.status = re.response
                    _this.$message.success(re.message)
                } else {
                    _this.$message.error(re.message)
                }
            })
        },
        deleteCourse(row) {
            let _this = this
            this.$confirm('确定删除该课程?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                courseApi.deleteCourse(row.id).then(re => {
                    if (re.code === 1) {
                        _this.search()
                        _this.$message.success(re.message)
                    } else {
                        _this.$message.error(re.message)
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        },
        submitForm() {
            this.queryParam.pageIndex = 1
            this.search()
        },
        statusFormatter(status) {
            return status === 1 ? '启用' : '禁用'
        },
        statusTagFormatter(status) {
            return status === 1 ? 'success' : 'danger'
        },
        statusBtnFormatter(status) {
            return status === 1 ? '禁用' : '启用'
        }
    }
}
</script>