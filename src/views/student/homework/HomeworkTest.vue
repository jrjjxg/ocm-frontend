<template>
    <div class="homework-test-container">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>作业功能测试</span>
            </div>
            
            <div class="test-section">
                <h3>1. 测试作业列表API</h3>
                <el-button @click="testHomeworkList" :loading="testing.list">测试作业列表</el-button>
                <div v-if="results.list" class="test-result">
                    <pre>{{ JSON.stringify(results.list, null, 2) }}</pre>
                </div>
            </div>

            <div class="test-section">
                <h3>2. 测试作业详情API</h3>
                <el-input v-model="testHomeworkId" placeholder="输入作业ID" style="width: 200px; margin-right: 10px;"></el-input>
                <el-button @click="testHomeworkDetail" :loading="testing.detail">测试作业详情</el-button>
                <div v-if="results.detail" class="test-result">
                    <pre>{{ JSON.stringify(results.detail, null, 2) }}</pre>
                </div>
            </div>

            <div class="test-section">
                <h3>3. 创建测试作业</h3>
                <el-button @click="createTestHomework" :loading="testing.create">创建测试作业</el-button>
                <div v-if="results.create" class="test-result">
                    <pre>{{ JSON.stringify(results.create, null, 2) }}</pre>
                </div>
            </div>

            <div class="test-section">
                <h3>4. 数据库表检查</h3>
                <el-button @click="checkTables" :loading="testing.tables">检查数据库表</el-button>
                <div v-if="results.tables" class="test-result">
                    <pre>{{ JSON.stringify(results.tables, null, 2) }}</pre>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { studentHomeworkList, homeworkDetail } from '@/api/student/homework'

export default {
    name: 'HomeworkTest',
    data() {
        return {
            testCourseId: 1,
            testHomeworkId: 1,
            testing: {
                list: false,
                detail: false,
                create: false,
                tables: false
            },
            results: {
                list: null,
                detail: null,
                create: null,
                tables: null
            }
        }
    },
    methods: {
        async testHomeworkList() {
            this.testing.list = true
            try {
                console.log('测试作业列表API...')
                const response = await studentHomeworkList(this.testCourseId, {
                    pageIndex: 1,
                    pageSize: 10
                })
                console.log('作业列表API响应:', response)
                this.results.list = response
                
                if (response.code === 1) {
                    this.$message.success('作业列表API测试成功')
                } else {
                    this.$message.error('作业列表API测试失败: ' + response.message)
                }
            } catch (error) {
                console.error('作业列表API测试错误:', error)
                this.results.list = { error: error.message }
                this.$message.error('作业列表API测试错误: ' + error.message)
            } finally {
                this.testing.list = false
            }
        },

        async testHomeworkDetail() {
            if (!this.testHomeworkId) {
                this.$message.warning('请输入作业ID')
                return
            }
            
            this.testing.detail = true
            try {
                console.log('测试作业详情API...')
                const response = await homeworkDetail(this.testCourseId, this.testHomeworkId)
                console.log('作业详情API响应:', response)
                this.results.detail = response
                
                if (response.code === 1) {
                    this.$message.success('作业详情API测试成功')
                } else {
                    this.$message.error('作业详情API测试失败: ' + response.message)
                }
            } catch (error) {
                console.error('作业详情API测试错误:', error)
                this.results.detail = { error: error.message }
                this.$message.error('作业详情API测试错误: ' + error.message)
            } finally {
                this.testing.detail = false
            }
        },

        async createTestHomework() {
            this.testing.create = true
            try {
                // 这里可以调用教师端API创建测试作业
                this.$message.info('创建测试作业功能待实现')
                this.results.create = { message: '功能待实现' }
            } catch (error) {
                console.error('创建测试作业错误:', error)
                this.results.create = { error: error.message }
            } finally {
                this.testing.create = false
            }
        },

        async checkTables() {
            this.testing.tables = true
            try {
                // 检查数据库表是否存在
                this.$message.info('数据库表检查功能待实现')
                this.results.tables = { 
                    message: '需要检查以下表是否存在:',
                    tables: [
                        't_homework',
                        't_homework_question', 
                        't_homework_answer',
                        't_question',
                        't_text_content'
                    ]
                }
            } catch (error) {
                console.error('数据库表检查错误:', error)
                this.results.tables = { error: error.message }
            } finally {
                this.testing.tables = false
            }
        }
    },
    mounted() {
        // 从路由获取课程ID
        const courseId = this.$route.query.courseId || this.$route.params.courseId
        if (courseId) {
            this.testCourseId = parseInt(courseId)
        }
        
        console.log('作业测试页面加载完成，课程ID:', this.testCourseId)
    }
}
</script>

<style scoped>
.homework-test-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.test-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
}

.test-section h3 {
    margin-top: 0;
    color: #303133;
}

.test-result {
    margin-top: 15px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
}

.test-result pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 1.4;
}
</style>
