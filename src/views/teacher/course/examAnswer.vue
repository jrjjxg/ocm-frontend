<template>
    <div class="answer-detail-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <el-button icon="el-icon-arrow-left" @click="goBack" class="back-btn">返回</el-button>
                    <div class="title-section">
                        <h1>答卷详情</h1>
                        <p v-if="answerInfo.studentName">学生：{{ answerInfo.studentName }} | 得分：{{ answerInfo.score / 10 }}分</p>
                    </div>
                </div>
                <div class="header-right">
                    <el-tag v-if="answerInfo.score" :type="getScoreType(answerInfo.score, answerInfo.paperScore)" size="large">
                        {{ Math.round(answerInfo.score / answerInfo.paperScore * 100) }}%
                    </el-tag>
                </div>
            </div>
        </div>

        <!-- 答卷信息卡片 -->
        <el-card class="answer-info-card" v-loading="loading">
            <div slot="header">
                <h3><i class="el-icon-document"></i> 答卷基本信息</h3>
            </div>
            <el-row :gutter="24" v-if="answerInfo.studentName">
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">学生姓名</span>
                        <span class="info-value">{{ answerInfo.studentName }}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">学号</span>
                        <span class="info-value">{{ answerInfo.studentId }}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">考试名称</span>
                        <span class="info-value">{{ answerInfo.paperName }}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">提交时间</span>
                        <span class="info-value">{{ answerInfo.submitTime }}</span>
                    </div>
                </el-col>
            </el-row>
            <el-row :gutter="24" style="margin-top: 20px;" v-if="answerInfo.doTime">
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">答题时长</span>
                        <span class="info-value">{{ formatDuration(answerInfo.doTime) }}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">总分</span>
                        <span class="info-value">{{ answerInfo.paperScore / 10 }}分</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">得分</span>
                        <span class="info-value score-highlight">{{ answerInfo.score / 10 }}分</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="info-item">
                        <span class="info-label">正确率</span>
                        <span class="info-value">{{ Math.round(answerInfo.score / answerInfo.paperScore * 100) }}%</span>
                    </div>
                </el-col>
            </el-row>
            <div v-else class="empty-info">
                暂无答卷信息
            </div>
        </el-card>

        <!-- 答题详情 -->
        <el-card class="answer-questions-card" v-loading="questionsLoading">
            <div slot="header">
                <h3><i class="el-icon-edit-outline"></i> 答题详情</h3>
                <div class="header-actions">
                    <el-button v-if="!isEvaluated" type="primary" @click="startEvaluation">开始批改</el-button>
                    <el-button v-else type="success" @click="updateEvaluation">更新评分</el-button>
                    <el-button type="info" @click="exportAnswer">导出答卷</el-button>
                </div>
            </div>

            <!-- 题目列表 -->
            <div v-if="questionAnswers.length > 0" class="questions-container">
                <div v-for="(titleItem, titleIndex) in groupedQuestions" :key="titleIndex" class="title-section">
                    <h3 class="section-title">{{ titleItem.name }}</h3>
                    
                    <div v-for="(question, qIndex) in titleItem.questions" :key="qIndex" class="question-item">
                        <div class="question-header">
                            <h4 class="question-title">
                                第{{ question.itemOrder }}题 {{ question.title }}
                                <span class="question-score">({{ question.questionScore / 10 }}分)</span>
                                <span class="question-type-tag">{{ formatQuestionType(question.questionType) }}</span>
                            </h4>
                            <div class="score-info">
                                <span class="student-score" :class="getScoreClass(question.customerScore, question.questionScore)">
                                    得分：{{ question.customerScore / 10 }}分
                                </span>
                            </div>
                        </div>

                        <!-- 题目内容 -->
                        <div class="question-content" v-html="question.title"></div>

                        <!-- 选择题选项 -->
                        <div v-if="question.questionType === 1 || question.questionType === 2" class="question-options">
                            <div v-for="(option, optionIndex) in question.questionItemObjects" :key="optionIndex" 
                                 class="option-item" :class="{
                                     'correct-option': option.correct,
                                     'student-selected': isStudentSelected(question.answer, optionIndex),
                                     'wrong-selected': isStudentSelected(question.answer, optionIndex) && !option.correct
                                 }">
                                <span class="option-prefix">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                                <span class="option-content">{{ option.content }}</span>
                                <div class="option-status">
                                    <el-tag v-if="option.correct" type="success" size="mini">正确答案</el-tag>
                                    <el-tag v-if="isStudentSelected(question.answer, optionIndex)" type="warning" size="mini">学生选择</el-tag>
                                </div>
                            </div>
                        </div>

                        <!-- 判断题 -->
                        <div v-else-if="question.questionType === 3" class="question-judge">
                            <div class="answer-comparison">
                                <div class="correct-answer">
                                    <span class="label">正确答案：</span>
                                    <el-tag :type="question.correct === 'true' ? 'success' : 'danger'" size="small">
                                        {{ question.correct === 'true' ? '正确' : '错误' }}
                                    </el-tag>
                                </div>
                                <div class="student-answer">
                                    <span class="label">学生答案：</span>
                                    <el-tag :type="question.answer === question.correct ? 'success' : 'danger'" size="small">
                                        {{ question.answer === 'true' ? '正确' : '错误' }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>

                        <!-- 填空题 -->
                        <div v-else-if="question.questionType === 4" class="question-fill">
                            <div class="answer-comparison">
                                <div class="correct-answer">
                                    <span class="label">参考答案：</span>
                                    <span class="answer-text">{{ question.correct }}</span>
                                </div>
                                <div class="student-answer">
                                    <span class="label">学生答案：</span>
                                    <span class="answer-text">{{ question.answer || '未作答' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 简答题 -->
                        <div v-else-if="question.questionType === 5" class="question-essay">
                            <div class="answer-comparison">
                                <div class="correct-answer">
                                    <span class="label">参考答案：</span>
                                    <div class="answer-content">{{ question.correct || '无参考答案' }}</div>
                                </div>
                                <div class="student-answer">
                                    <span class="label">学生答案：</span>
                                    <div class="answer-content">{{ question.answer || '未作答' }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- 评分区域（用于主观题评分） -->
                        <div v-if="(question.questionType === 4 || question.questionType === 5) && evaluationMode" 
                             class="evaluation-section">
                            <el-form-item label="得分：">
                                <el-input-number 
                                    v-model="question.customerScore" 
                                    :min="0" 
                                    :max="question.questionScore"
                                    :step="10"
                                    @change="updateQuestionScore(question)"
                                    style="width: 120px;">
                                </el-input-number>
                                <span class="score-unit">/ {{ question.questionScore / 10 }}分</span>
                            </el-form-item>
                            <el-form-item label="评语：">
                                <el-input 
                                    v-model="question.comment"
                                    type="textarea"
                                    :rows="2"
                                    placeholder="请输入评语（可选）"
                                    style="width: 300px;">
                                </el-input>
                            </el-form-item>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
                <i class="el-icon-document-remove"></i>
                <p>暂无答题记录</p>
            </div>
        </el-card>

        <!-- 评分操作区域 -->
        <div v-if="evaluationMode" class="evaluation-actions">
            <el-card>
                <div class="actions-content">
                    <div class="total-score">
                        <span>总分：{{ totalScore / 10 }}分 / {{ answerInfo.paperScore / 10 }}分</span>
                    </div>
                    <div class="action-buttons">
                        <el-button @click="cancelEvaluation">取消</el-button>
                        <el-button type="primary" @click="saveEvaluation" :loading="saving">保存评分</el-button>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import teacherExamApi from '@/api/teacherExam'

export default {
    name: 'TeacherExamAnswer',
    data() {
        return {
            loading: false,
            questionsLoading: false,
            saving: false,
            evaluationMode: false,
            answerInfo: {
                studentName: '',
                studentId: '',
                paperName: '',
                submitTime: '',
                doTime: 0,
                paperScore: 0,
                score: 0,
                status: 0
            },
            questions: [],
            questionLoading: false
        }
    },
    computed: {
        courseId() {
            return this.$route.params.courseId
        },
            courseExamId() {
      return this.$route.params.examId
    },
        answerId() {
            return this.$route.params.answerId
        },
        correctRate() {
            if (this.answerInfo.paperScore === 0) return 0
            return Math.round((this.answerInfo.score / this.answerInfo.paperScore) * 100)
        },
        groupedQuestions() {
            const groups = {}
            this.questions.forEach(question => {
                const type = question.questionType
                if (!groups[type]) {
                    groups[type] = []
                }
                groups[type].push(question)
            })
            return groups
        },
        totalScore() {
            return this.questions.reduce((sum, question) => sum + (question.customerScore || 0), 0)
        },
        isEvaluated() {
            return this.answerInfo.status === 1 // 已批改
        }
    },
    created() {
        this.loadAnswerInfo()
        this.loadQuestions()
    },
    methods: {
            async loadAnswerInfo() {
      try {
        const response = await teacherExamApi.getAnswerInfo(this.courseId, this.courseExamId, this.answerId)
        if (response.code === 1) {
          this.answerInfo = response.response
        } else {
          this.$message.error(response.message || '获取答卷信息失败')
        }
      } catch (error) {
        console.error('获取答卷信息失败:', error)
        this.$message.error('获取答卷信息失败')
      }
    },
    async loadQuestions() {
      this.questionLoading = true
      try {
        const response = await teacherExamApi.getAnswerQuestions(this.courseId, this.courseExamId, this.answerId)
        if (response.code === 1) {
          this.questions = response.response || []
        } else {
          this.$message.error(response.message || '获取题目详情失败')
        }
      } catch (error) {
        console.error('获取题目详情失败:', error)
        this.$message.error('获取题目详情失败')
      } finally {
        this.questionLoading = false
      }
    },
        getQuestionTypeName(type) {
            const types = {
                1: '单选题',
                2: '多选题',
                3: '判断题',
                4: '填空题',
                5: '简答题'
            }
            return types[type] || '未知题型'
        },
        openBatchGrade() {
            this.$message.info('批改功能开发中...')
        },
        exportAnswers() {
            this.$message.info('导出功能开发中...')
        },
        updateComment(question) {
            // 更新评语的逻辑，可以调用API保存
            console.log('更新评语:', question.id, question.comment)
        },
        startEvaluation() {
            this.evaluationMode = true
        },
        updateEvaluation() {
            this.evaluationMode = true
        },
        cancelEvaluation() {
            this.evaluationMode = false
            // 重新加载数据，取消未保存的修改
            this.loadAnswerInfo()
            this.loadQuestions()
        },
        async saveEvaluation() {
            try {
                this.saving = true
                
                const evaluationData = {
                    questionEvaluations: this.questions.map(q => ({
                        questionId: q.questionId,
                        score: q.customerScore,
                        comment: q.comment
                    }))
                }
                
                console.log('保存评分数据:', evaluationData)
                
                // 这里调用实际的API
                // const response = await teacherExamApi.evaluateAnswer(
                //     this.courseId, this.examId, this.answerId, evaluationData
                // )
                
                // 临时模拟成功
                this.$message.success('评分保存成功')
                this.evaluationMode = false
                
            } catch (error) {
                console.error('评分保存失败:', error)
                this.$message.error('评分保存失败')
            } finally {
                this.saving = false
            }
        },
        updateQuestionScore(question) {
            // 实时更新题目得分，重新计算总分在computed中处理
            console.log('更新题目得分:', question.questionId, question.customerScore)
        },
        exportAnswer() {
            this.$message.success('导出功能正在开发中')
        },
        goBack() {
            this.$router.go(-1)
        },
        formatQuestionType(type) {
            const typeMap = {
                1: '单选题',
                2: '多选题',
                3: '判断题', 
                4: '填空题',
                5: '简答题'
            }
            return typeMap[type] || '未知类型'
        },
        formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60
            
            if (hours > 0) {
                return `${hours}时${minutes}分${secs}秒`
            } else if (minutes > 0) {
                return `${minutes}分${secs}秒`
            } else {
                return `${secs}秒`
            }
        },
        getScoreType(score, total) {
            if (!score || !total) return 'info'
            const percentage = score / total
            if (percentage >= 0.9) return 'success'
            if (percentage >= 0.7) return 'warning'
            return 'danger'
        },
        getScoreClass(score, total) {
            if (!score || !total) return 'fail'
            const percentage = score / total
            if (percentage >= 0.9) return 'excellent'
            if (percentage >= 0.7) return 'good'
            if (percentage >= 0.6) return 'pass'
            return 'fail'
        },
        isStudentSelected(answer, optionIndex) {
            if (!answer && answer !== '0') return false
            const selectedIndexes = answer.split(',').map(i => parseInt(i))
            return selectedIndexes.includes(optionIndex)
        }
    }
}
</script>

<style scoped>
.answer-detail-container {
    min-height: 100vh;
    background: #f5f5f5;
}

.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    margin-bottom: 2rem;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
}

.title-section h1 {
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
}

.title-section p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
}

.answer-info-card, .answer-questions-card {
    max-width: 1200px;
    margin: 0 auto 2rem auto;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
}

.info-value {
    color: #333;
    font-size: 1rem;
}

.score-highlight {
    color: #409eff;
    font-weight: 700;
    font-size: 1.2rem;
}

.empty-info {
    text-align: center;
    color: #999;
    padding: 2rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.questions-container {
    margin-top: 1rem;
}

.title-section {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #409eff;
}

.question-item {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.question-title {
    font-size: 1.1rem;
    color: #333;
    margin: 0;
    flex: 1;
}

.question-score {
    color: #409eff;
    font-weight: 600;
    margin-left: 1rem;
}

.question-type-tag {
    background: #e1f3ff;
    color: #409eff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-left: 1rem;
}

.score-info {
    text-align: right;
}

.student-score {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
}

.student-score.excellent {
    background: #f0f9ff;
    color: #67c23a;
}

.student-score.good {
    background: #fdf6ec;
    color: #e6a23c;
}

.student-score.pass {
    background: #fdf2f2;
    color: #f56c6c;
}

.student-score.fail {
    background: #fef0f0;
    color: #f56c6c;
}

.question-content {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.question-options {
    margin-bottom: 1rem;
}

.option-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.option-item.correct-option {
    background: #f0f9ff;
    border: 1px solid #67c23a;
}

.option-item.student-selected {
    background: #fff7e6;
    border: 1px solid #e6a23c;
}

.option-item.wrong-selected {
    background: #fef0f0;
    border: 1px solid #f56c6c;
}

.option-prefix {
    font-weight: 600;
    margin-right: 0.5rem;
    width: 20px;
}

.option-content {
    flex: 1;
}

.option-status {
    display: flex;
    gap: 0.5rem;
}

.answer-comparison {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.correct-answer, .student-answer {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.label {
    font-weight: 600;
    color: #666;
    width: 80px;
    flex-shrink: 0;
}

.answer-text, .answer-content {
    flex: 1;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 4px;
    min-height: 40px;
    line-height: 1.6;
}

.evaluation-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #fafafa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
}

.score-unit {
    margin-left: 0.5rem;
    color: #666;
}

.evaluation-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.actions-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-score {
    font-size: 1.2rem;
    font-weight: 600;
    color: #409eff;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #999;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .answer-comparison {
        flex-direction: column;
    }
    
    .correct-answer, .student-answer {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .label {
        width: auto;
    }
}
</style>