<template>
    <div style="line-height:1.8">
        <div v-if="qType == 1" v-loading="qLoading">
            <div class="q-title" v-html="question.title" />
            <div class="q-content">
                <el-radio-group v-model="answer.content" @change="answer.completed = true">
                    <el-radio v-for="item in question.items" :key="item.prefix" :label="item.prefix">
                        <span class="question-prefix">{{ item.prefix }}.</span>
                        <span v-html="item.content" class="q-item-span-content"></span>
                    </el-radio>
                </el-radio-group>
            </div>
        </div>
        <div v-else-if="qType == 2" v-loading="qLoading">
            <div class="q-title" v-html="question.title" />
            <div class="q-content">
                <el-checkbox-group v-model="answer.contentArray" @change="answer.completed = true">
                    <el-checkbox v-for="item in question.items" :label="item.prefix" :key="item.prefix">
                        <span class="question-prefix">{{ item.prefix }}.</span>
                        <span v-html="item.content" class="q-item-span-content"></span>
                    </el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
        <div v-else-if="qType == 3" v-loading="qLoading">
            <div class="q-title" v-html="question.title" style="display: inline;margin-right: 10px" />
            <span style="padding-right: 10px;">(</span>
            <el-radio-group v-model="answer.content" @change="answer.completed = true">
                <el-radio v-for="item in question.items" :key="item.prefix" :label="item.prefix">
                    <span v-html="item.content" class="q-item-span-content"></span>
                </el-radio>
            </el-radio-group>
            <span style="padding-left: 10px;">)</span>
        </div>
        <div v-else-if="qType == 4" v-loading="qLoading">
            <div class="q-title" v-html="question.title" />
            <div style="color: #999; font-size: 12px; margin-bottom: 10px;" v-if="false">
                DEBUG: questionType={{ qType }}, items.length={{ question.items ? question.items.length : 'null' }},
                title contains gapfilling: {{ question.title && question.title.includes('gapfilling-span') }},
                title: "{{ question.title }}"
            </div>
            <div>
                <template v-if="question.items && question.items.length > 0">
                    <el-form-item :label="item.prefix" :key="item.prefix" v-for="item in question.items"
                        label-width="50px" style="margin-top: 10px;margin-bottom: 10px;">
                        <el-input v-model="answer.contentArray[item.prefix - 1]" @change="answer.completed = true" />
                    </el-form-item>
                </template>

                <template v-else-if="question.title && question.title.includes('gapfilling-span')">
                    <el-form-item v-for="(blank, index) in parseGapFillingBlanks(question.title)" :key="blank.uuid"
                        :label="blank.prefix" label-width="50px" style="margin-top: 10px;margin-bottom: 10px;">
                        <el-input v-model="answer.contentArray[index]" @change="answer.completed = true" />
                    </el-form-item>
                </template>

                <template v-else>
                    <el-form-item label="答案" label-width="50px" style="margin-top: 10px;margin-bottom: 10px;">
                        <el-input v-model="answer.content" @change="answer.completed = true" placeholder="请输入填空答案" />
                    </el-form-item>
                </template>
            </div>
        </div>
        <div v-else-if="qType == 5" v-loading="qLoading">
            <div class="q-title" v-html="question.title" />
            <div>
                <el-input v-model="answer.content" type="textarea" rows="5" @change="answer.completed = true" />
            </div>
        </div>
        <div v-else>
        </div>
    </div>
</template>

<script>
export default {
    name: 'QuestionEdit',
    props: {
        question: {
            type: Object,
            default: function () {
                return {}
            }
        },
        answer: {
            type: Object,
            default: function () {
                return { id: null, content: '', contentArray: [] }
            }
        },
        qLoading: {
            type: Boolean,
            default: false
        },
        qType: {
            type: Number,
            default: 0
        }
    },
    methods: {
        parseGapFillingBlanks(title) {
            const blanks = [];
            let index = 0;
            let match;
            const regex = /gapfilling-span-(\d+)/g;
            while ((match = regex.exec(title)) !== null) {
                blanks.push({ prefix: match[1], uuid: match.input });
                index++;
            }
            return blanks;
        }
    }
}
</script>

<style lang="scss" scoped>
.q-title {
    margin-bottom: 15px;
}

.q-content {
    margin-left: 15px;
}

.question-prefix {
    padding-right: 8px;
}

.q-item-span-content {
    ::v-deep img {
        max-width: 100%;
    }
}
</style>