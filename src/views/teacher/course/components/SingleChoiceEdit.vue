<template>
    <div>
        <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">
            <el-form-item label="课程：">
                <span>{{ courseName }}</span>
            </el-form-item>
            <el-form-item label="题型：">
                <span>{{ questionTypeName }}</span>
            </el-form-item>
            <el-form-item label="题目内容：" prop="title">
                <el-input type="textarea" :rows="6" v-model="form.title"
                    @click.native="inputClick(form, 'title')"></el-input>
            </el-form-item>
            <!-- 选择题、判断题的选项 -->
            <el-form-item v-if="[1, 2, 3].includes(questionType)" label="选项：">
                <div class="options-container">
                    <div class="options-tip" v-if="[1, 2].includes(questionType)">
                        <i class="el-icon-info"></i>
                        <span v-if="questionType === 1">单选题至少需要2个选项，最多8个选项</span>
                        <span v-if="questionType === 2">多选题至少需要2个选项，最多8个选项</span>
                    </div>
                    <div v-for="(item, index) in form.items" :key="index" class="option-item">
                        <div class="option-prefix">
                            <el-tag type="primary" size="medium">{{ item.prefix }}</el-tag>
                        </div>
                        <div class="option-input">
                            <el-input v-model="item.content" placeholder="请输入选项内容"
                                @click.native="inputClick(item, 'content')" size="medium">
                            </el-input>
                        </div>
                        <div class="option-actions">
                            <el-button v-if="form.items.length > 2 && questionType !== 3" type="danger" size="small"
                                icon="el-icon-delete" circle @click="questionItemRemove(index)" title="删除选项">
                            </el-button>
                        </div>
                    </div>
                    <div v-if="[1, 2].includes(questionType)" class="add-option-btn">
                        <el-button type="dashed" size="medium" icon="el-icon-plus" @click="questionItemAdd"
                            :disabled="form.items.length >= 8">
                            添加选项 ({{ form.items.length }}/8)
                        </el-button>
                    </div>
                </div>
            </el-form-item>

            <!-- 单选题答案 -->
            <el-form-item v-if="questionType === 1" label="答案：" prop="correct">
                <el-radio-group v-model="form.correct">
                    <el-radio v-for="item in form.items" :key="item.prefix" :label="item.prefix">{{ item.prefix
                        }}</el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 多选题答案 -->
            <el-form-item v-if="questionType === 2" label="答案：" prop="correctArray">
                <el-checkbox-group v-model="form.correctArray">
                    <el-checkbox v-for="item in form.items" :key="item.prefix" :label="item.prefix">{{ item.prefix
                        }}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>

            <!-- 判断题答案 -->
            <el-form-item v-if="questionType === 3" label="答案：" prop="correct">
                <el-radio-group v-model="form.correct">
                    <el-radio label="A">正确</el-radio>
                    <el-radio label="B">错误</el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 简答题答案 -->
            <el-form-item v-if="questionType === 5" label="参考答案：" prop="correct">
                <el-input type="textarea" :rows="4" v-model="form.correct"
                    @click.native="inputClick(form, 'correct')"></el-input>
            </el-form-item>
            <el-form-item label="解析：" prop="analyze">
                <el-input type="textarea" :rows="4" v-model="form.analyze"
                    @click.native="inputClick(form, 'analyze')"></el-input>
            </el-form-item>
            <el-form-item label="分数：" prop="score">
                <el-input v-model="form.score" placeholder="请输入分数"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm" :loading="formLoading">提交</el-button>
                <el-button @click="resetForm">重置</el-button>
                <el-button type="success" @click="showQuestion">预览</el-button>
                <el-button @click="goBack">返回</el-button>
            </el-form-item>
        </el-form>

        <!-- 富文本编辑器弹窗 -->
        <el-dialog :visible.sync="richEditor.dialogVisible" append-to-body :close-on-click-modal="false"
            style="width: 100%;height: 100%" :show-close="false" center>
            <Ueditor @ready="editorReady" />
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="editorConfirm">确定</el-button>
                <el-button @click="richEditor.dialogVisible = false">取消</el-button>
            </span>
        </el-dialog>

        <!-- 题目预览弹窗 -->
        <el-dialog :visible.sync="questionShow.dialog" style="width: 100%;height: 100%">
            <QuestionShow :qType="questionShow.qType" :question="questionShow.question"
                :qLoading="questionShow.loading" />
        </el-dialog>
    </div>
</template>

<script>
import QuestionShow from '@/views/exam/question/components/Show'
import Ueditor from '@/components/Ueditor'
import teacherExamApi from '@/api/teacherExam'
import { courseListByTeacher } from '@/api/teacher/course'

export default {
    components: {
        Ueditor,
        QuestionShow
    },
    props: {
        courseId: {
            type: [String, Number],
            required: true
        },
        questionId: {
            type: [String, Number],
            default: null
        }
    },
    computed: {
        questionType() {
            // 从路由中获取题目类型
            const type = this.$route.params.type
            const typeMap = {
                'singleChoice': 1,
                'multipleChoice': 2,
                'trueFalse': 3,
                'gapFilling': 4,
                'shortAnswer': 5
            }
            return typeMap[type] || 1
        },
        questionTypeName() {
            const typeNames = {
                1: '单选题',
                2: '多选题',
                3: '判断题',
                4: '填空题',
                5: '简答题'
            }
            return typeNames[this.questionType] || '单选题'
        }
    },
    data() {
        return {
            courseName: '',
            form: {
                id: null,
                questionType: this.questionType,
                courseId: null,
                gradeLevel: 1, // 默认年级
                title: '',
                items: this.getDefaultItems(),
                analyze: '',
                correct: '',
                correctArray: [], // 多选题答案
                score: '10', // 字符串格式
            },
            formLoading: false,
            rules: {
                title: [
                    { required: true, message: '请输入题目内容', trigger: 'blur' }
                ],
                analyze: [
                    { required: true, message: '请输入解析', trigger: 'blur' }
                ],
                correct: [
                    { required: true, message: '请选择正确答案', trigger: 'change' }
                ],
                correctArray: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.questionType === 2 && (!value || value.length === 0)) {
                                callback(new Error('请至少选择一个正确答案'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ]
            },
            richEditor: {
                dialogVisible: false,
                object: null,
                parameterName: '',
                instance: null
            },
            questionShow: {
                qType: this.questionType,
                dialog: false,
                question: null,
                loading: false
            }
        }
    },
    created() {
        this.form.courseId = this.courseId
        this.form.questionType = this.questionType
        this.questionShow.qType = this.questionType
        this.loadCourseInfo()

        if (this.questionId) {
            this.loadQuestionData()
        }
    },
    methods: {
        getDefaultItems() {
            // 填空题和简答题不需要选项
            if ([4, 5].includes(this.questionType)) {
                return []
            }
            // 判断题只有两个选项
            if (this.questionType === 3) {
                return [
                    { prefix: 'A', content: '正确' },
                    { prefix: 'B', content: '错误' }
                ]
            }
            // 选择题默认有两个空选项，用户可以添加更多
            return [
                { prefix: 'A', content: '' },
                { prefix: 'B', content: '' }
            ]
        },

        async loadCourseInfo() {
            try {
                const response = await courseListByTeacher()
                if (response && response.code === 1 && response.response) {
                    const course = response.response.find(c => c.id == this.courseId)
                    this.courseName = course ? course.name : '未知课程'
                }
            } catch (error) {
                console.error('加载课程信息失败:', error)
            }
        },

        async loadQuestionData() {
            try {
                this.formLoading = true
                const response = await teacherExamApi.getQuestion(this.courseId, this.questionId)
                if (response.code === 1) {
                    this.form = {
                        ...response.response,
                        courseId: this.courseId
                    }

                    // 处理多选题答案显示
                    if (this.questionType === 2 && this.form.correct) {
                        // 将正确答案字符串转换为数组
                        this.form.correctArray = this.form.correct.split('')
                    }
                } else {
                    this.$message.error('加载题目失败: ' + response.message)
                }
            } catch (error) {
                console.error('加载题目失败:', error)
                this.$message.error('加载题目失败')
            } finally {
                this.formLoading = false
            }
        },

        editorReady(instance) {
            this.richEditor.instance = instance
            let currentContent = this.richEditor.object[this.richEditor.parameterName]
            this.richEditor.instance.setContent(currentContent || '')
            this.richEditor.instance.focus(true)
        },

        inputClick(object, parameterName) {
            this.richEditor.object = object
            this.richEditor.parameterName = parameterName
            this.richEditor.dialogVisible = true
        },

        editorConfirm() {
            let content = this.richEditor.instance.getContent()
            // 确保只更新指定的字段
            if (this.richEditor.object && this.richEditor.parameterName) {
                this.richEditor.object[this.richEditor.parameterName] = content
            }
            this.richEditor.dialogVisible = false
        },

        questionItemRemove(index) {
            if (this.form.items.length > 2) {
                this.form.items.splice(index, 1)
            }
        },

        questionItemAdd() {
            let items = this.form.items
            // 限制最多8个选项
            if (items.length >= 8) {
                this.$message.warning('最多只能添加8个选项')
                return
            }

            let newLastPrefix
            if (items.length > 0) {
                let last = items[items.length - 1]
                newLastPrefix = String.fromCharCode(last.prefix.charCodeAt() + 1)
            } else {
                newLastPrefix = 'A'
            }
            items.push({ prefix: newLastPrefix, content: '' })
        },

        async submitForm() {
            try {
                // 对于多选题，先验证答案
                if (this.questionType === 2) {
                    if (!this.form.correctArray || this.form.correctArray.length === 0) {
                        this.$message.error('请选择至少一个正确答案')
                        return
                    }
                }

                const valid = await this.$refs.form.validate()
                if (!valid) return

                this.formLoading = true

                // 调试信息：检查表单数据
                console.log('提交表单数据:', {
                    questionType: this.questionType,
                    items: this.form.items,
                    correctArray: this.form.correctArray,
                    correct: this.form.correct
                })

                // 准备提交数据
                const submitData = {
                    ...this.form,
                    courseId: this.courseId,
                    questionType: this.questionType
                }

                // 处理多选题答案
                if (this.questionType === 2) {
                    // 多选题：将correctArray转换为正确答案字符串
                    if (this.form.correctArray && this.form.correctArray.length > 0) {
                        // 确保correctArray中的元素都是字符串
                        const cleanArray = this.form.correctArray.map(item => {
                            if (typeof item === 'object' && item.prefix) {
                                return item.prefix
                            }
                            return typeof item === 'string' ? item : String(item)
                        })
                        submitData.correct = cleanArray.join('')
                        console.log('多选题答案处理:', {
                            original: this.form.correctArray,
                            cleaned: cleanArray,
                            result: submitData.correct
                        })
                    }
                }

                // 对于不同题型处理选项
                if ([1, 2, 3].includes(this.questionType)) {
                    // 选择题和判断题：过滤掉空的选项
                    if (submitData.items) {
                        submitData.items = submitData.items.filter(item =>
                            item.content && item.content.trim() !== ''
                        )

                        // 检查是否至少有2个选项
                        if (submitData.items.length < 2) {
                            this.$message.error('至少需要填写2个选项')
                            this.formLoading = false
                            return
                        }

                        // 对于判断题，如果没有选项，自动添加正确/错误选项
                        if (this.questionType === 3 && submitData.items.length === 0) {
                            submitData.items = [
                                { prefix: 'A', content: '正确' },
                                { prefix: 'B', content: '错误' }
                            ]
                        }
                    }
                } else if ([4, 5].includes(this.questionType)) {
                    // 填空题和简答题：不需要选项
                    submitData.items = []
                }

                let response
                if (this.questionId) {
                    // 更新题目
                    response = await teacherExamApi.updateQuestion(this.courseId, this.questionId, submitData)
                } else {
                    // 创建题目
                    response = await teacherExamApi.createQuestion(this.courseId, submitData)
                }

                if (response.code === 1) {
                    this.$message.success(this.questionId ? '更新成功' : '创建成功')
                    this.goBack()
                } else {
                    this.$message.error(response.message || '操作失败')
                }
            } catch (error) {
                console.error('提交失败:', error)
                this.$message.error('提交失败: ' + (error.message || '未知错误'))
            } finally {
                this.formLoading = false
            }
        },

        resetForm() {
            this.$refs.form.resetFields()
            this.form = {
                id: this.questionId,
                questionType: this.questionType,
                courseId: this.courseId,
                gradeLevel: 1,
                title: '',
                items: this.getDefaultItems(),
                analyze: '',
                correct: '',
                correctArray: [],
                score: '10',
            }
        },

        showQuestion() {
            this.questionShow.dialog = true
            this.questionShow.qType = this.questionType
            this.questionShow.question = this.form
        },

        goBack() {
            this.$router.push(`/teacher/course/${this.courseId}/questionBank`)
        }
    }
}
</script>

<style scoped>
.demo-ruleForm {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.options-container {
    width: 100%;
}

.options-tip {
    margin-bottom: 15px;
    padding: 10px 12px;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    color: #0050b3;
    font-size: 13px;
    display: flex;
    align-items: center;
}

.options-tip i {
    margin-right: 8px;
    color: #1890ff;
}

.option-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 12px;
    background-color: #fafafa;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.option-item:hover {
    background-color: #f5f7fa;
    border-color: #c0c4cc;
}

.option-prefix {
    flex-shrink: 0;
    margin-right: 15px;
}

.option-prefix .el-tag {
    font-weight: bold;
    font-size: 14px;
    min-width: 32px;
    text-align: center;
}

.option-input {
    flex: 1;
    margin-right: 15px;
}

.option-input .el-input__inner:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.option-item.focused {
    border-color: #409eff;
    background-color: #ecf5ff;
}

.option-actions {
    flex-shrink: 0;
}

.option-actions .el-button {
    opacity: 0.7;
    transition: all 0.3s ease;
}

.option-item:hover .option-actions .el-button {
    opacity: 1;
}

.option-actions .el-button:hover {
    transform: scale(1.1);
}

.add-option-btn {
    margin-top: 10px;
    text-align: center;
}

.add-option-btn .el-button {
    width: 100%;
    border-style: dashed;
    border-width: 2px;
    color: #409eff;
    background-color: transparent;
}

.add-option-btn .el-button:hover {
    background-color: #ecf5ff;
    border-color: #66b1ff;
}
</style>