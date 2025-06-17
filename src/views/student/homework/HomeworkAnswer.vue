<template>
    <div class="homework-answer-container">
        <!-- 作业头部信息 -->
        <div class="homework-header">
            <div class="header-content">
                <h2>{{ homework.title }}</h2>
                <div class="homework-info">
                    <span class="info-item">总分：{{ homework.totalScore / 10 }}分</span>
                    <span class="info-item" v-if="homework.timeLimit">
                        时间限制：{{ homework.timeLimit }}分钟
                    </span>
                    <span class="info-item countdown" v-if="remainingTime">
                        剩余时间：{{ formatTime(remainingTime) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- 题目列表 -->
        <div class="question-container">
            <div v-for="(question, index) in questions" :key="question.id" class="question-item"
                :class="{ 'answered': isAnswered(question.id) }">
                <div class="question-header">
                    <span class="question-number">第{{ index + 1 }}题</span>
                    <span class="question-score">（{{ question.score / 10 }}分）</span>
                    <span class="question-type">{{ getQuestionTypeName(question.questionType) }}</span>
                </div>

                <!-- 题目内容 -->
                <div class="question-content" v-html="getQuestionContent(question)"></div>

                <!-- 答题区域 -->
                <div class="answer-area">
                    <!-- 单选题 -->
                    <div v-if="question.questionType === 1" class="choice-options">
                        <el-radio-group v-model="answers[question.id]"
                            @change="handleAnswerChange(question.id, $event)">
                            <el-radio v-for="(option, optIndex) in getQuestionOptions(question)" :key="optIndex"
                                :label="option.prefix" class="option-item">
                                {{ option.prefix }}. {{ option.content }}
                            </el-radio>
                        </el-radio-group>
                    </div>

                    <!-- 多选题 -->
                    <div v-else-if="question.questionType === 2" class="choice-options">
                        <el-checkbox-group v-model="answers[question.id]"
                            @change="handleAnswerChange(question.id, $event)">
                            <el-checkbox v-for="(option, optIndex) in getQuestionOptions(question)" :key="optIndex"
                                :label="option.prefix" class="option-item">
                                {{ option.prefix }}. {{ option.content }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>

                    <!-- 判断题 -->
                    <div v-else-if="question.questionType === 3" class="choice-options">
                        <el-radio-group v-model="answers[question.id]"
                            @change="handleAnswerChange(question.id, $event)">
                            <el-radio label="T" class="option-item">正确</el-radio>
                            <el-radio label="F" class="option-item">错误</el-radio>
                        </el-radio-group>
                    </div>

                    <!-- 填空题 -->
                    <div v-else-if="question.questionType === 4" class="fill-blank">
                        <el-input v-model="answers[question.id]" type="textarea" :rows="3" placeholder="请输入答案"
                            @input="handleAnswerChange(question.id, $event)" />
                    </div>

                    <!-- 简答题 -->
                    <div v-else-if="question.questionType === 5" class="essay-answer">
                        <el-input v-model="answers[question.id]" type="textarea" :rows="6" placeholder="请输入答案"
                            @input="handleAnswerChange(question.id, $event)" />
                    </div>

                    <!-- 拍照上传题 -->
                    <div v-else-if="question.questionType === 6" class="photo-upload">
                        <PhotoUpload :question-id="question.id" :max-count="5"
                            @change="handleFileChange(question.id, $event)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 提交区域 -->
        <div class="submit-area">
            <el-button type="primary" size="large" @click="submitHomework" :loading="submitting" :disabled="!canSubmit">
                {{ submitButtonText }}
            </el-button>
            <el-button size="large" @click="saveAnswers" :loading="saving">
                保存草稿
            </el-button>
        </div>

        <!-- 答题进度 -->
        <div class="progress-sidebar">
            <div class="progress-title">答题进度</div>
            <div class="progress-grid">
                <div v-for="(question, index) in questions" :key="question.id" class="progress-item" :class="{
                    'answered': isAnswered(question.id),
                    'current': currentQuestionIndex === index
                }" @click="scrollToQuestion(index)">
                    {{ index + 1 }}
                </div>
            </div>
            <div class="progress-stats">
                <p>已答：{{ answeredCount }}/{{ questions.length }}</p>
                <p>完成度：{{ Math.round(answeredCount / questions.length * 100) }}%</p>
            </div>
        </div>
    </div>
</template>

<script>
import { homeworkDetail, submitHomeworkAnswer, saveHomeworkDraft } from '@/api/student/homework'
import PhotoUpload from '@/components/PhotoUpload'

export default {
    name: 'HomeworkAnswer',
    components: {
        PhotoUpload
    },
    data() {
        return {
            homework: {},
            questions: [],
            answers: {},
            submitting: false,
            saving: false,
            remainingTime: 0,
            timer: null,
            currentQuestionIndex: 0,
            autoSaveTimer: null,
            maxAttempts: 0,
            submittedCount: 0
        }
    },
    computed: {
        answeredCount() {
            return Object.keys(this.answers).filter(key => {
                const answer = this.answers[key]
                return answer && answer !== '' && answer.length > 0
            }).length
        },
        canSubmit() {
            if (this.maxAttempts !== 0 && this.submittedCount >= this.maxAttempts) {
                return false
            }
            return this.answeredCount > 0
        },
        submitButtonText() {
            if (this.maxAttempts === 0) {
                return '提交作业'
            }
            if (this.submittedCount < this.maxAttempts) {
                return `提交作业 (${this.submittedCount + 1}/${this.maxAttempts})`
            }
            return '已达提交上限'
        }
    },
    mounted() {
        this.loadHomework()
        this.startTimer()
        this.startAutoSave()
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
        }
    },
    methods: {
        async loadHomework() {
            try {
                const homeworkId = this.$route.params.id
                const courseId = this.$route.query.courseId

                if (!courseId) {
                    this.$message.error('缺少课程信息')
                    return
                }

                const response = await homeworkDetail(courseId, homeworkId)
                console.log('作业详情API响应:', response)

                if (response.code === 1) {
                    this.homework = response.response
                    this.questions = response.response.questions || []
                    this.maxAttempts = response.response.maxAttempts || 0
                    this.submittedCount = response.response.submittedCount || 0

                    // 初始化答案对象 - 确保所有题目都有对应的答案字段
                    const initialAnswers = {}
                    this.questions.forEach(question => {
                        if (question.questionType === 2) { // 多选题
                            initialAnswers[question.id] = []
                        } else {
                            initialAnswers[question.id] = ''
                        }
                    })
                    // 使用Vue.set确保响应式
                    this.$set(this, 'answers', initialAnswers)

                    console.log('作业信息:', this.homework)
                    console.log('题目列表:', this.questions)
                    console.log('题目数量:', this.questions.length)
                    console.log('初始化答案对象:', this.answers)

                    // 详细打印每个题目的数据
                    this.questions.forEach((question, index) => {
                        console.log(`题目${index + 1} (ID: ${question.id}) 详细信息:`, question)
                        console.log(`题目${index + 1} 类型:`, question.questionType)
                        console.log(`题目${index + 1} 选项:`, question.options)
                        console.log(`题目${index + 1} 内容:`, question.content)
                    })

                    // 如果没有题目，显示提示
                    if (this.questions.length === 0) {
                        this.$message.warning('该作业暂无题目，请联系教师添加题目')
                    }

                    // 计算剩余时间
                    if (this.homework.timeLimit) {
                        const startTime = new Date(this.homework.startTime).getTime()
                        const now = new Date().getTime()
                        const elapsed = Math.floor((now - startTime) / 1000 / 60) // 已用时间（分钟）
                        this.remainingTime = Math.max(0, this.homework.timeLimit - elapsed) * 60 // 转换为秒
                    }
                } else {
                    console.error('加载作业失败:', response)
                    this.$message.error(response.message || '加载作业失败')
                }
            } catch (error) {
                this.$message.error('加载作业失败')
                console.error('Load homework error:', error)
            }
        },

        handleAnswerChange(questionId, answer) {
            this.$set(this.answers, questionId, answer)
            console.log('答案更新:', questionId, answer)
            console.log('当前所有答案:', this.answers)
        },

        handleFileChange(questionId, files) {
            this.$set(this.answers, questionId, files)
            console.log('文件上传答案更新:', questionId, files)
        },

        isAnswered(questionId) {
            const answer = this.answers[questionId]
            if (Array.isArray(answer)) {
                return answer.length > 0
            }
            return answer && answer !== ''
        },

        getQuestionTypeName(type) {
            const typeMap = {
                1: '单选题',
                2: '多选题',
                3: '判断题',
                4: '填空题',
                5: '简答题',
                6: '拍照上传题'
            }
            return typeMap[type] || '未知题型'
        },

        getQuestionContent(question) {
            // 如果content是字符串且看起来像JSON，尝试解析
            if (typeof question.content === 'string') {
                try {
                    // 检查是否是JSON格式
                    if (question.content.startsWith('{') && question.content.includes('titleContent')) {
                        const parsed = JSON.parse(question.content)
                        return parsed.titleContent || question.content
                    }
                } catch (e) {
                    // 如果解析失败，返回原始内容
                    console.warn('Failed to parse question content:', e)
                }
                return question.content
            }

            // 如果content是对象，尝试获取titleContent
            if (typeof question.content === 'object' && question.content.titleContent) {
                return question.content.titleContent
            }

            // 默认返回原始内容
            return question.content || '题目内容加载失败'
        },

        getQuestionOptions(question) {
            console.log('获取题目选项，题目数据:', question)

            // 如果已经是数组格式，直接返回
            if (Array.isArray(question.options)) {
                console.log('选项已是数组格式:', question.options)
                return question.options
            }

            // 如果options是字符串且看起来像JSON，尝试解析
            if (typeof question.options === 'string') {
                try {
                    const parsed = JSON.parse(question.options)
                    if (Array.isArray(parsed)) {
                        console.log('解析选项字符串成功:', parsed)
                        return parsed
                    }
                } catch (e) {
                    console.warn('Failed to parse question options:', e)
                }
            }

            // 如果question.content包含选项信息，尝试从中提取
            if (typeof question.content === 'string' && question.content.includes('questionItemObjects')) {
                try {
                    const parsed = JSON.parse(question.content)
                    if (parsed.questionItemObjects && Array.isArray(parsed.questionItemObjects)) {
                        const options = parsed.questionItemObjects.map(item => ({
                            prefix: item.prefix,
                            content: item.content
                        }))
                        console.log('从content中提取选项成功:', options)
                        return options
                    }
                } catch (e) {
                    console.warn('Failed to parse options from content:', e)
                }
            }

            console.warn('无法获取题目选项，题目类型:', question.questionType, '题目数据:', question)
            // 默认返回空数组
            return []
        },

        async submitHomework() {
            if (!this.canSubmit) {
                this.$message.warning('没有可提交的答案或已达到提交上限')
                return
            }

            if (this.maxAttempts !== 0 && this.submittedCount >= this.maxAttempts) {
                this.$message.error('您已达到最大提交次数，无法再次提交。')
                return
            }

            try {
                await this.$confirm('确定要提交作业吗？提交后将无法修改。', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                this.submitting = true
                const homeworkId = this.$route.params.id
                const courseId = this.$route.query.courseId

                const formattedAnswers = Object.keys(this.answers).map(questionId => {
                    return {
                        questionId: parseInt(questionId),
                        answer: this.answers[questionId]
                    }
                })

                const payload = {
                    homeworkId,
                    courseId,
                    answers: formattedAnswers
                }

                console.log('提交的答案:', payload)

                await submitHomeworkAnswer(payload)

                this.$message.success('作业提交成功！')
                this.$router.push({
                    name: 'HomeworkResult',
                    params: { id: homeworkId },
                    query: { courseId }
                })

            } catch (error) {
                if (error !== 'cancel') {
                    console.error('提交作业失败:', error)
                    this.$message.error(error.message || '提交失败，请稍后重试')
                }
            } finally {
                this.submitting = false
            }
        },

        async saveAnswers() {
            this.saving = true
            try {
                const courseId = this.$route.query.courseId
                const homeworkId = this.homework.id

                await saveHomeworkDraft(courseId, homeworkId, {
                    answers: this.answers
                })
                this.$message.success('草稿保存成功')
            } catch (error) {
                this.$message.error('保存失败')
                console.error('Save draft error:', error)
            } finally {
                this.saving = false
            }
        },

        startTimer() {
            if (this.remainingTime > 0) {
                this.timer = setInterval(() => {
                    this.remainingTime--
                    if (this.remainingTime <= 0) {
                        this.$message.warning('时间到，自动提交作业')
                        this.submitHomework()
                    }
                }, 1000)
            }
        },

        startAutoSave() {
            // 每30秒自动保存一次
            this.autoSaveTimer = setInterval(() => {
                if (Object.keys(this.answers).length > 0) {
                    this.saveAnswers()
                }
            }, 30000)
        },

        formatTime(seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            } else {
                return `${minutes}:${secs.toString().padStart(2, '0')}`
            }
        },

        scrollToQuestion(index) {
            this.currentQuestionIndex = index
            const element = document.querySelectorAll('.question-item')[index]
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }
}
</script>

<style scoped>
.homework-answer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
}

.homework-header {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.homework-header h2 {
    margin: 0 0 10px 0;
    color: #333;
}

.homework-info {
    display: flex;
    gap: 20px;
}

.info-item {
    color: #666;
    font-size: 14px;
}

.countdown {
    color: #f56c6c;
    font-weight: bold;
}

.question-container {
    margin-right: 200px;
}

.question-item {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    border-left: 4px solid #ddd;
}

.question-item.answered {
    border-left-color: #67c23a;
}

.question-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.question-number {
    font-weight: bold;
    color: #409eff;
}

.question-score {
    color: #f56c6c;
    font-weight: bold;
}

.question-type {
    background: #f0f9ff;
    color: #409eff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.question-content {
    margin-bottom: 20px;
    line-height: 1.6;
}

.answer-area {
    margin-top: 15px;
}

.choice-options .option-item {
    display: block;
    margin-bottom: 10px;
    line-height: 1.6;
}

.submit-area {
    text-align: center;
    margin: 40px 0;
}

.submit-area .el-button {
    margin: 0 10px;
}

.progress-sidebar {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 160px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 15px;
}

.progress-title {
    font-weight: bold;
    margin-bottom: 15px;
    text-align: center;
}

.progress-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 15px;
}

.progress-item {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s;
}

.progress-item:hover {
    border-color: #409eff;
}

.progress-item.answered {
    background: #67c23a;
    color: white;
    border-color: #67c23a;
}

.progress-item.current {
    border-color: #409eff;
    background: #409eff;
    color: white;
}

.progress-stats {
    font-size: 12px;
    color: #666;
}

.progress-stats p {
    margin: 5px 0;
}
</style>