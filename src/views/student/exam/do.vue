<template>
    <div>
        <el-row class="do-exam-title">
            <el-col :span="24">
                <span :key="item.itemOrder" v-for="item in answer.answerItems">
                    <el-tag :type="questionCompleted(item.completed)" class="do-exam-title-tag"
                        @click="goAnchor('#question-' + item.itemOrder)">{{ item.itemOrder }}</el-tag>
                </span>
                <span class="do-exam-time">
                    <label>剩余时间：</label>
                    <label>{{ formatSeconds(remainTime) }}</label>
                </span>
            </el-col>
        </el-row>
        <el-row class="do-exam-title-hidden">
            <el-col :span="24">
                <span :key="item.itemOrder" v-for="item in answer.answerItems">
                    <el-tag class="do-exam-title-tag">{{ item.itemOrder }}</el-tag>
                </span>
                <span class="do-exam-time">
                    <label>剩余时间：</label>
                </span>
            </el-col>
        </el-row>
        <el-container class="app-item-contain">
            <el-header class="align-center">
                <h1>{{ form.name }}</h1>
                <div>
                    <span class="question-title-padding">试卷总分：{{ form.score }}</span>
                    <span class="question-title-padding">考试时长：{{ form.suggestTime }}分钟</span>
                </div>
            </el-header>
            <el-main>
                <el-form :model="form" ref="form" v-loading="formLoading" label-width="100px">
                    <el-row :key="index" v-for="(titleItem, index) in form.titleItems">
                        <h3>{{ titleItem.name }}</h3>
                        <el-card class="exampaper-item-box" v-if="titleItem.questionItems.length !== 0">
                            <el-form-item :key="questionItem.itemOrder" :label="questionItem.itemOrder + '.'"
                                v-for="questionItem in titleItem.questionItems" class="exam-question-item"
                                label-width="50px" :id="'question-' + questionItem.itemOrder">
                                <QuestionEdit :qType="questionItem.questionType" :question="questionItem"
                                    :answer="answer.answerItems[questionItem.itemOrder - 1]" />
                            </el-form-item>
                        </el-card>
                    </el-row>
                    <el-row class="do-align-center">
                        <el-button type="primary" @click="submitForm">提交</el-button>
                        <el-button @click="goBack">取消</el-button>
                    </el-row>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { formatSeconds } from '@/utils'
import QuestionEdit from './components/QuestionEdit'
import studentExamApi from '@/api/studentExam'
import examPaperApi from '@/api/examPaper'
import examPaperAnswerApi from '@/api/examPaperAnswer'
import { getExamDetail, submitExamAnswer } from '@/api/student/exam'

export default {
    components: { QuestionEdit },
    data() {
        return {
            form: {},
            formLoading: false,
            answer: {
                id: null,
                examId: null,
                courseId: null,
                doTime: 0,
                answerItems: []
            },
            timer: null,
            remainTime: 0
        }
    },
    created() {
        let paperId = this.$route.params.id || this.$route.query.id
        let examId = this.$route.query.examId || paperId
        let courseId = this.$route.query.courseId

        if (paperId && parseInt(paperId) !== 0) {
            this.formLoading = true

            // 优先使用课程考试API，如果有courseId的话
            if (courseId) {
                this.loadCourseExam(courseId, examId, paperId)
            } else {
                this.loadExamPaper(paperId, examId, courseId)
            }
        }
    },
    beforeDestroy() {
        window.clearInterval(this.timer)
    },
    methods: {
        formatSeconds(theTime) {
            return formatSeconds(theTime)
        },
        timeReduce() {
            let _this = this
            this.timer = setInterval(function () {
                if (_this.remainTime <= 0) {
                    _this.submitForm()
                } else {
                    ++_this.answer.doTime
                    --_this.remainTime
                }
            }, 1000)
        },
        questionCompleted(completed) {
            return this.enumFormat(this.doCompletedTag, completed)
        },
        goAnchor(selector) {
            this.$el.querySelector(selector).scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' })
        },
        initAnswer(paperId, examId, courseId) {
            this.answer.id = paperId
            this.answer.examId = examId
            this.answer.courseId = courseId
            let titleItemArray = this.form.titleItems
            for (let tIndex in titleItemArray) {
                let questionArray = titleItemArray[tIndex].questionItems
                for (let qIndex in questionArray) {
                    let question = questionArray[qIndex]
                    this.answer.answerItems.push({
                        questionId: question.id,
                        content: null,
                        contentArray: [],
                        completed: false,
                        itemOrder: question.itemOrder
                    })
                }
            }
        },
        submitForm() {
            let _this = this
            window.clearInterval(_this.timer)
            _this.formLoading = true

            // 如果是课程考试，使用课程考试API提交
            if (this.answer.courseId && this.answer.examId) {
                this.submitCourseExam()
            } else {
                this.submitExamPaper()
            }
        },

        // 提交课程考试答案
        async submitCourseExam() {
            try {
                const response = await submitExamAnswer(this.answer.courseId, this.answer.examId, this.answer)
                if (response.code === 1) {
                    this.$alert('试卷得分：' + response.response + '分', '考试结果', {
                        confirmButtonText: '返回课程页面',
                        callback: action => {
                            this.goBack()
                        }
                    })
                } else {
                    this.$message.error(response.message)
                }
            } catch (error) {
                console.error('Submit course exam error:', error)
                this.$message.error('提交答案失败')
                // 如果课程考试API失败，尝试使用普通考试API
                this.submitExamPaper()
            } finally {
                this.formLoading = false
            }
        },

        // 提交普通考试答案
        async submitExamPaper() {
            try {
                const response = await examPaperAnswerApi.answerSubmit(this.answer)
                if (response.code === 1) {
                    this.$alert('试卷得分：' + response.response + '分', '考试结果', {
                        confirmButtonText: '返回课程页面',
                        callback: action => {
                            this.goBack()
                        }
                    })
                } else {
                    this.$message.error(response.message)
                }
            } catch (error) {
                console.error('Submit exam paper error:', error)
                this.$message.error('提交答案失败')
            } finally {
                this.formLoading = false
            }
        },
        goBack() {
            // 返回课程详情页面
            if (this.answer.courseId) {
                this.$router.push(`/student/course/${this.answer.courseId}`)
            } else {
                this.$router.go(-1)
            }
        },

        // 加载课程考试数据
        async loadCourseExam(courseId, examId, paperId) {
            try {
                const response = await getExamDetail(courseId, examId)
                if (response.code === 1) {
                    this.form = response.response
                    // 如果有考试时长设置，则优先使用考试设置的时长
                    if (this.$route.query.duration) {
                        this.remainTime = parseInt(this.$route.query.duration) * 60
                    } else {
                        this.remainTime = response.response.suggestTime * 60
                    }
                    this.initAnswer(paperId, examId, courseId)
                    this.timeReduce()
                } else {
                    this.$message.error('获取考试信息失败: ' + response.message)
                }
            } catch (error) {
                console.error('Load course exam error:', error)
                this.$message.error('获取考试信息失败')
                // 如果课程考试API失败，尝试使用普通考试API
                this.loadExamPaper(paperId, examId, courseId)
            } finally {
                this.formLoading = false
            }
        },

        // 加载普通考试数据
        async loadExamPaper(paperId, examId, courseId) {
            try {
                const response = await examPaperApi.select(paperId)
                this.form = response.response
                // 如果有考试时长设置，则优先使用考试设置的时长
                if (this.$route.query.duration) {
                    this.remainTime = parseInt(this.$route.query.duration) * 60
                } else {
                    this.remainTime = response.response.suggestTime * 60
                }
                this.initAnswer(paperId, examId, courseId)
                this.timeReduce()
            } catch (error) {
                console.error('Load exam paper error:', error)
                this.$message.error('获取试卷信息失败')
            } finally {
                this.formLoading = false
            }
        }
    },
    computed: {
        ...mapGetters('enumItem', ['enumFormat']),
        ...mapState('enumItem', {
            doCompletedTag: state => state.exam.question.answer.doCompletedTag
        })
    }
}
</script>

<style lang="scss" scoped>
.do-exam-title {
    position: fixed;
    left: 0;
    top: 50px;
    width: 100%;
    background: #fff;
    z-index: 1001;
    padding: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .do-exam-time {
        float: right;
        margin-right: 10px;
    }

    .do-exam-title-tag {
        margin-left: 5px;
        cursor: pointer;
    }
}

.do-exam-title-hidden {
    padding: 15px;
    visibility: hidden;
}

.align-center {
    text-align: center
}

.exam-question-item {
    padding: 10px;

    .el-form-item__label {
        font-size: 15px !important;
    }
}

.question-title-padding {
    padding-left: 25px;
    padding-right: 25px;
}

.app-item-contain {
    padding: 15px;
}

.do-align-center {
    text-align: center;
    margin: 20px 0;
}
</style>