from pathlib import Path

app_js = r'''const articleInput =
    document.getElementById("article");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const errorBox =
    document.getElementById("error");

const emptyState =
    document.getElementById("emptyState");

const analysisState =
    document.getElementById("analysisState");

const analysisStateMessage =
    document.getElementById("analysisStateMessage");

const resultArea =
    document.getElementById("resultArea");

const overview =
    document.getElementById("overview");

const teaching =
    document.getElementById("teaching");

const wordCount =
    document.getElementById("wordCount");

const topStatus =
    document.getElementById("topStatus");


/* =====================================================
   字数统计
===================================================== */

articleInput.addEventListener(
    "input",
    updateWordCount
);


function updateWordCount() {

    const text =
        articleInput.value.trim();

    if (!text) {
        wordCount.textContent =
            "0 words";
        return;
    }

    const words =
        text.split(/\s+/).length;

    wordCount.textContent =
        `${words} words`;
}


/* =====================================================
   开始分析
===================================================== */

analyzeBtn.addEventListener(
    "click",
    async () => {

        const article =
            articleInput.value.trim();

        if (!article) {
            alert("请先输入英文文本");
            return;
        }

        enterAnalysisMode();

        try {

            const response =
                await fetch(
                    `/api/analyze?article=${
                        encodeURIComponent(article)
                    }`,
                    {
                        method: "POST"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `创建任务失败：${response.status}`
                );
            }

            const data =
                await response.json();

            await pollAnalysis(
                data.run_id
            );

        } catch (error) {

            showError(
                error.message
            );

        }

    }
);


/* =====================================================
   后台任务轮询
===================================================== */

async function pollAnalysis(runId) {

    while (true) {

        const response =
            await fetch(
                `/api/analysis/${runId}`
            );

        if (!response.ok) {
            throw new Error(
                `获取分析状态失败：${response.status}`
            );
        }

        const data =
            await response.json();

        updateProgress(
            data.message ||
                "正在分析...",
            data.stage ||
                ""
        );

        if (
            data.status === "completed"
        ) {

            showReport(
                data.result.report
            );

            return;
        }

        if (
            data.status === "failed"
        ) {

            throw new Error(
                data.message ||
                "分析失败"
            );
        }

        await sleep(1800);
    }
}


/* =====================================================
   页面状态切换
===================================================== */

function enterAnalysisMode() {

    analyzeBtn.disabled = true;

    errorBox.classList.add(
        "hidden"
    );

    resultArea.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    analysisState.classList.remove(
        "hidden"
    );

    topStatus.textContent =
        "分析中";

    analysisStateMessage.textContent =
        "正在准备分析任务……";

    resetSteps();
}


function showReport(report) {

    analyzeBtn.disabled = false;

    analysisState.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    errorBox.classList.add(
        "hidden"
    );

    resultArea.classList.remove(
        "hidden"
    );

    topStatus.textContent =
        "分析完成";

    renderReport(report);

    activateTab("overview");
}


function showError(message) {

    analyzeBtn.disabled = false;

    analysisState.classList.add(
        "hidden"
    );

    resultArea.classList.add(
        "hidden"
    );

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );

    topStatus.textContent =
        "分析失败";
}


/* =====================================================
   右侧分析进度
===================================================== */

function resetSteps() {

    const steps = getAnalysisSteps();

    steps.forEach(step => {
        step.classList.remove(
            "analysis-step-active",
            "analysis-step-completed"
        );
    });
}


function getAnalysisSteps() {

    return [
        document.getElementById(
            "analysisStep1"
        ),
        document.getElementById(
            "analysisStep2"
        ),
        document.getElementById(
            "analysisStep3"
        )
    ];
}


function updateProgress(
    message,
    stage
) {

    analysisStateMessage.textContent =
        message;

    const [
        step1,
        step2,
        step3
    ] = getAnalysisSteps();

    resetSteps();


    /* Pass 1 正在进行 */

    if (stage === "pass1") {

        step1.classList.add(
            "analysis-step-active"
        );

        return;
    }


    /* Pass 1 完成 */

    if (
        stage ===
        "pass1_completed"
    ) {

        step1.classList.add(
            "analysis-step-completed"
        );

        return;
    }


    /* Pass 2 正在进行 */

    if (stage === "pass2") {

        step1.classList.add(
            "analysis-step-completed"
        );

        step2.classList.add(
            "analysis-step-active"
        );

        return;
    }


    /* Pass 2 完成 */

    if (
        stage ===
        "pass2_completed"
    ) {

        step1.classList.add(
            "analysis-step-completed"
        );

        step2.classList.add(
            "analysis-step-completed"
        );

        return;
    }


    /* Pass 3 正在进行 */

    if (stage === "pass3") {

        step1.classList.add(
            "analysis-step-completed"
        );

        step2.classList.add(
            "analysis-step-completed"
        );

        step3.classList.add(
            "analysis-step-active"
        );

        return;
    }


    /* Pass 3 完成 */

    if (
        stage ===
        "pass3_completed" ||
        stage === "completed"
    ) {

        step1.classList.add(
            "analysis-step-completed"
        );

        step2.classList.add(
            "analysis-step-completed"
        );

        step3.classList.add(
            "analysis-step-completed"
        );
    }
}


/* =====================================================
   报告总入口
===================================================== */

function renderReport(report) {

    overview.innerHTML = "";
    teaching.innerHTML = "";


    /* ======================
       速览
    ====================== */

    renderSnapshotPro(
        report[
            "一、Teacher Snapshot"
        ]
    );

    renderLogicSection(
        report[
            "二、Underlying Logic"
        ]
    );

    createStandardSection(
        overview,
        "03",
        "Insight",
        "文本真正建立了什么意义，以及问题是否已经解决",
        report["四、Insight"],
        true
    );

    createStandardSection(
        overview,
        "04",
        "Deep Shift",
        "文本中是否存在真正的认知结构变化",
        report["五、Deep Shift"]
    );


    /* ======================
       教学
    ====================== */

    renderEvidenceSection(
        report["三、Evidence"]
    );

    createStandardSection(
        teaching,
        "02",
        "Meaning-bearing Language",
        "真正承担意义、立场与逻辑功能的语言",
        report[
            "六、Meaning-bearing Language"
        ]
    );

    renderTeachingValue(
        report[
            "七、Teaching Value"
        ]
    );

    renderInquiryPro(
        report[
            "八、Inquiry Path"
        ]
    );

    renderCloseReading(
        report[
            "九、Close Reading"
        ]
    );

    renderTransfer(
        report["十、Transfer"]
    );
}


/* =====================================================
   Teacher Snapshot
===================================================== */

function renderSnapshotPro(content) {

    const section =
        createSectionWrapper(
            "01",
            "Teacher Snapshot",
            "先看这一篇到底值得教什么"
        );

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "snapshot-pro";


    if (!content) {

        wrapper.appendChild(
            createEmpty()
        );

    } else {

        /*
         * 不显示 Snapshot 内部的 Deep Shift，
         * 因为下面已经有独立的 Deep Shift 模块。
         */

        const order = [
            "Core Insight",
            "一句话内容",
            "一句话底层逻辑",
            "Core Tension / Key Question",
            "Logic Hinge",
            "Must Teach",
            "最值得问学生的问题",
            "迁移任务"
        ];


        order.forEach(key => {

            if (!(key in content)) {
                return;
            }

            const block =
                document.createElement(
                    "div"
                );

            block.className =
                "snapshot-block";


            if (
                key ===
                "Core Insight"
            ) {

                block.classList.add(
                    "primary"
                );
            }


            if (
                key ===
                "Must Teach"
            ) {

                block.classList.add(
                    "must"
                );
            }


            if (
                key ===
                "最值得问学生的问题"
            ) {

                block.classList.add(
                    "question"
                );
            }


            if (
                key ===
                "迁移任务"
            ) {

                block.classList.add(
                    "transfer"
                );
            }


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "snapshot-kicker";

            label.textContent =
                key;


            const value =
                document.createElement(
                    "div"
                );

            value.className =
                "snapshot-main";

            value.textContent =
                formatValue(
                    content[key]
                );


            block.appendChild(
                label
            );

            block.appendChild(
                value
            );

            wrapper.appendChild(
                block
            );
        });
    }


    section.appendChild(
        wrapper
    );

    overview.appendChild(
        section
    );
}


/* =====================================================
   Underlying Logic
===================================================== */

function renderLogicSection(content) {

    const section =
        createSectionWrapper(
            "02",
            "Underlying Logic",
            "不是段落大意，而是作者如何一步步推进"
        );


    const card =
        document.createElement("div");

    card.className =
        "report-card";


    if (!content) {

        card.appendChild(
            createEmpty()
        );

    } else {

        const chain =
            content["Logic Chain"];


        if (chain) {

            const chainBox =
                document.createElement(
                    "div"
                );

            chainBox.className =
                "logic-chain";


            let nodes =
                normalizeLogicChain(
                    chain
                );


            nodes.forEach(
                (node, index) => {

                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "logic-node";


                    const number =
                        document.createElement(
                            "div"
                        );

                    number.className =
                        "logic-number";

                    number.textContent =
                        index + 1;


                    const line =
                        document.createElement(
                            "div"
                        );

                    line.className =
                        "logic-line";


                    const text =
                        document.createElement(
                            "div"
                        );

                    text.className =
                        "logic-text";

                    text.textContent =
                        node;


                    row.appendChild(
                        number
                    );

                    row.appendChild(
                        line
                    );

                    row.appendChild(
                        text
                    );


                    chainBox.appendChild(
                        row
                    );
                }
            );


            card.appendChild(
                chainBox
            );
        }


        if (
            content[
                "Logic Hinge"
            ]
        ) {

            card.appendChild(
                createLogicHighlight(
                    "Logic Hinge",
                    content[
                        "Logic Hinge"
                    ]
                )
            );
        }


        if (
            content[
                "Logic Function"
            ]
        ) {

            card.appendChild(
                createLogicHighlight(
                    "Logic Function",
                    content[
                        "Logic Function"
                    ]
                )
            );
        }


        if (
            content[
                "Transferable Logic Pattern"
            ]
        ) {

            card.appendChild(
                createLogicHighlight(
                    "Transferable Logic Pattern",
                    content[
                        "Transferable Logic Pattern"
                    ]
                )
            );
        }
    }


    section.appendChild(
        card
    );

    overview.appendChild(
        section
    );
}


function normalizeLogicChain(chain) {

    if (Array.isArray(chain)) {

        return chain
            .map(item =>
                String(item).trim()
            )
            .filter(Boolean);
    }


    if (
        typeof chain !==
        "string"
    ) {

        return [
            formatValue(chain)
        ];
    }


    /*
     * 支持：
     * 1. A → B → C
     * 2. 1. A 2. B 3. C
     * 3. 多行列表
     */

    let nodes =
        chain
            .split(/→|\n/)
            .map(item =>
                item
                    .replace(
                        /^\s*\d+[\.\、]\s*/,
                        ""
                    )
                    .trim()
            )
            .filter(Boolean);


    if (
        nodes.length === 1
    ) {

        const numbered =
            chain
                .split(
                    /(?=\d+[\.\、]\s*)/
                )
                .map(item =>
                    item
                        .replace(
                            /^\s*\d+[\.\、]\s*/,
                            ""
                        )
                        .trim()
                )
                .filter(Boolean);

        if (
            numbered.length > 1
        ) {
            nodes = numbered;
        }
    }


    return nodes;
}


function createLogicHighlight(
    title,
    value
) {

    const box =
        document.createElement(
            "div"
        );

    box.className =
        "logic-highlight";


    const heading =
        document.createElement(
            "div"
        );

    heading.className =
        "logic-highlight-title";

    heading.textContent =
        title;


    const text =
        document.createElement(
            "div"
        );

    text.className =
        "report-value";

    text.textContent =
        formatValue(value);


    box.appendChild(
        heading
    );

    box.appendChild(
        text
    );

    return box;
}


/* =====================================================
   Evidence
===================================================== */

function renderEvidenceSection(content) {

    const section =
        createSectionWrapper(
            "01",
            "Evidence",
            "先回到文本，再谈解释"
        );


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "evidence-list";


    if (
        !Array.isArray(content) ||
        content.length === 0
    ) {

        wrapper.appendChild(
            createEmpty()
        );

    } else {

        content.forEach(item => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "evidence-card";


            const quote =
                document.createElement(
                    "div"
                );

            quote.className =
                "evidence-quote";

            quote.textContent =
                item[
                    "原文关键证据"
                ] ||
                item[
                    "原文关键句"
                ] ||
                "—";


            card.appendChild(
                quote
            );


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "evidence-meta";


            Object.entries(item)
                .filter(
                    ([key]) =>
                        key !==
                        "原文关键证据" &&
                        key !==
                        "原文关键句"
                )
                .forEach(
                    ([key, value]) => {

                        const row =
                            document.createElement(
                                "div"
                            );

                        row.className =
                            "evidence-row";


                        const label =
                            document.createElement(
                                "div"
                            );

                        label.className =
                            "evidence-label";

                        label.textContent =
                            key;


                        const body =
                            document.createElement(
                                "div"
                            );

                        body.textContent =
                            formatValue(
                                value
                            );


                        row.appendChild(
                            label
                        );

                        row.appendChild(
                            body
                        );


                        meta.appendChild(
                            row
                        );
                    }
                );


            card.appendChild(
                meta
            );

            wrapper.appendChild(
                card
            );
        });
    }


    section.appendChild(
        wrapper
    );

    teaching.appendChild(
        section
    );
}


/* =====================================================
   Teaching Value
===================================================== */

function renderTeachingValue(content) {

    const section =
        createSectionWrapper(
            "03",
            "Teaching Value",
            "明确课堂取舍，而不是把所有内容都讲一遍"
        );


    const grid =
        document.createElement(
            "div"
        );

    grid.className =
        "teaching-value-grid";


    const configs = [
        [
            "Must Teach",
            "必须教",
            "must"
        ],
        [
            "May Teach",
            "可以教",
            "may"
        ],
        [
            "Not Necessary",
            "不必展开",
            "not"
        ]
    ];


    configs.forEach(
        ([key, title, type]) => {

            const column =
                document.createElement(
                    "div"
                );

            column.className =
                `teaching-value-column ${type}`;


            const heading =
                document.createElement(
                    "div"
                );

            heading.className =
                "teaching-value-title";

            heading.textContent =
                title;


            column.appendChild(
                heading
            );


            const values =
                content
                    ? content[key]
                    : null;


            if (
                Array.isArray(values) &&
                values.length > 0
            ) {

                const list =
                    document.createElement(
                        "ul"
                    );

                list.className =
                    "report-list";


                values.forEach(value => {

                    const li =
                        document.createElement(
                            "li"
                        );

                    li.textContent =
                        formatValue(value);

                    list.appendChild(
                        li
                    );
                });


                column.appendChild(
                    list
                );

            } else {

                const value =
                    document.createElement(
                        "div"
                    );

                value.className =
                    "report-value";

                value.textContent =
                    formatValue(values);

                column.appendChild(
                    value
                );
            }


            grid.appendChild(
                column
            );
        }
    );


    section.appendChild(
        grid
    );

    teaching.appendChild(
        section
    );
}


/* =====================================================
   Inquiry Path
===================================================== */

function renderInquiryPro(content) {

    const section =
        createSectionWrapper(
            "04",
            "Inquiry Path",
            "从发现文本，到判断与迁移"
        );


    const timeline =
        document.createElement(
            "div"
        );

    timeline.className =
        "inquiry-timeline";


    if (
        !Array.isArray(content) ||
        content.length === 0
    ) {

        timeline.appendChild(
            createEmpty()
        );

    } else {

        content.forEach(
            (item, index) => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "inquiry-step";


                const number =
                    document.createElement(
                        "div"
                    );

                number.className =
                    "inquiry-index";

                number.textContent =
                    index + 1;


                const body =
                    document.createElement(
                        "div"
                    );

                body.className =
                    "inquiry-content";


                if (
                    typeof item ===
                        "object" &&
                    item !== null
                ) {

                    const level =
                        document.createElement(
                            "div"
                        );

                    level.className =
                        "inquiry-level";

                    level.textContent =
                        item["层级"] ||
                        item["step"] ||
                        `Question ${index + 1}`;


                    const question =
                        document.createElement(
                            "div"
                        );

                    question.className =
                        "inquiry-question";

                    question.textContent =
                        item["问题"] ||
                        item["question"] ||
                        "";


                    body.appendChild(
                        level
                    );

                    body.appendChild(
                        question
                    );


                    const anchorText =
                        item[
                            "文本锚点"
                        ] ||
                        item[
                            "rationale"
                        ];


                    if (anchorText) {

                        const anchor =
                            document.createElement(
                                "div"
                            );

                        anchor.className =
                            "inquiry-anchor";

                        anchor.textContent =
                            anchorText;

                        body.appendChild(
                            anchor
                        );
                    }

                } else {

                    const question =
                        document.createElement(
                            "div"
                        );

                    question.className =
                        "inquiry-question";

                    question.textContent =
                        formatValue(item);

                    body.appendChild(
                        question
                    );
                }


                row.appendChild(
                    number
                );

                row.appendChild(
                    body
                );

                timeline.appendChild(
                    row
                );
            }
        );
    }


    section.appendChild(
        timeline
    );

    teaching.appendChild(
        section
    );
}


/* =====================================================
   Close Reading
===================================================== */

function renderCloseReading(content) {

    const section =
        createSectionWrapper(
            "05",
            "Close Reading",
            "真正值得停下来读深的语言位置"
        );


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "close-reading-list";


    if (
        !Array.isArray(content) ||
        content.length === 0
    ) {

        wrapper.appendChild(
            createEmpty()
        );

    } else {

        content.forEach(item => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "close-reading-card";


            const sentence =
                document.createElement(
                    "div"
                );

            sentence.className =
                "close-reading-sentence";

            sentence.textContent =
                item["句子"] ||
                "—";


            card.appendChild(
                sentence
            );


            const body =
                document.createElement(
                    "div"
                );

            body.className =
                "close-reading-body";


            Object.entries(item)
                .filter(
                    ([key]) =>
                        key !== "句子"
                )
                .forEach(
                    ([key, value]) => {

                        const row =
                            document.createElement(
                                "div"
                            );

                        row.className =
                            "close-reading-row";


                        const label =
                            document.createElement(
                                "div"
                            );

                        label.className =
                            "close-reading-label";

                        label.textContent =
                            key;


                        const text =
                            document.createElement(
                                "div"
                            );

                        text.textContent =
                            formatValue(value);


                        row.appendChild(
                            label
                        );

                        row.appendChild(
                            text
                        );


                        body.appendChild(
                            row
                        );
                    }
                );


            card.appendChild(
                body
            );

            wrapper.appendChild(
                card
            );
        });
    }


    section.appendChild(
        wrapper
    );

    teaching.appendChild(
        section
    );
}


/* =====================================================
   Transfer
===================================================== */

function renderTransfer(content) {

    const section =
        createSectionWrapper(
            "06",
            "Transfer",
            "迁移的是思维方式，而不是简单换一个主题"
        );


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "transfer-card";


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "transfer-title";

    title.textContent =
        "TRANSFER TASK";


    const text =
        document.createElement(
            "div"
        );

    text.className =
        "transfer-text";

    text.textContent =
        formatValue(content);


    card.appendChild(
        title
    );

    card.appendChild(
        text
    );


    section.appendChild(
        card
    );

    teaching.appendChild(
        section
    );
}


/* =====================================================
   通用 Section
===================================================== */

function createSectionWrapper(
    number,
    title,
    subtitle
) {

    const section =
        document.createElement(
            "section"
        );

    section.className =
        "report-section";


    const heading =
        document.createElement(
            "div"
        );

    heading.className =
        "section-heading";


    const numberBox =
        document.createElement(
            "div"
        );

    numberBox.className =
        "section-number";

    numberBox.textContent =
        number;


    const titleBox =
        document.createElement(
            "div"
        );


    const titleEl =
        document.createElement(
            "div"
        );

    titleEl.className =
        "section-title";

    titleEl.textContent =
        title;


    const subtitleEl =
        document.createElement(
            "div"
        );

    subtitleEl.className =
        "section-subtitle";

    subtitleEl.textContent =
        subtitle;


    titleBox.appendChild(
        titleEl
    );

    titleBox.appendChild(
        subtitleEl
    );


    heading.appendChild(
        numberBox
    );

    heading.appendChild(
        titleBox
    );


    section.appendChild(
        heading
    );

    return section;
}


function createStandardSection(
    container,
    number,
    title,
    subtitle,
    content,
    highlight = false
) {

    const section =
        createSectionWrapper(
            number,
            title,
            subtitle
        );


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "report-card";

    if (highlight) {
        card.classList.add(
            "report-card-highlight"
        );
    }


    renderContent(
        content,
        card
    );


    section.appendChild(
        card
    );

    container.appendChild(
        section
    );
}


/* =====================================================
   通用递归内容渲染
===================================================== */

function renderContent(
    content,
    parent
) {

    if (
        content === null ||
        content === undefined ||
        content === ""
    ) {

        parent.appendChild(
            createEmpty()
        );

        return;
    }


    /* Array */

    if (Array.isArray(content)) {

        if (
            content.length === 0
        ) {

            parent.appendChild(
                createEmpty()
            );

            return;
        }


        const objectArray =
            content.every(
                item =>
                    typeof item ===
                        "object" &&
                    item !== null
            );


        if (objectArray) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "object-list";


            content.forEach(item => {

                const sub =
                    document.createElement(
                        "div"
                    );

                sub.className =
                    "object-card";

                renderContent(
                    item,
                    sub
                );

                wrapper.appendChild(
                    sub
                );
            });


            parent.appendChild(
                wrapper
            );

        } else {

            const list =
                document.createElement(
                    "ul"
                );

            list.className =
                "report-list";


            content.forEach(item => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    formatValue(item);

                list.appendChild(
                    li
                );
            });


            parent.appendChild(
                list
            );
        }

        return;
    }


    /* Object */

    if (
        typeof content ===
        "object"
    ) {

        for (
            const [key, value]
            of Object.entries(content)
        ) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "report-item";


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "report-label";

            label.textContent =
                key;


            const body =
                document.createElement(
                    "div"
                );

            body.className =
                "report-value";


            item.appendChild(
                label
            );

            item.appendChild(
                body
            );


            renderContent(
                value,
                body
            );


            parent.appendChild(
                item
            );
        }

        return;
    }


    /* Primitive */

    const value =
        document.createElement(
            "div"
        );

    value.className =
        "report-value";

    value.textContent =
        formatValue(content);

    parent.appendChild(
        value
    );
}


/* =====================================================
   Helpers
===================================================== */

function createEmpty() {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "empty-value";

    element.textContent =
        "无";

    return element;
}


function formatValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "无";
    }


    if (Array.isArray(value)) {

        if (
            value.length === 0
        ) {
            return "无";
        }

        return value
            .map(item =>
                formatValue(item)
            )
            .join("；");
    }


    if (
        typeof value ===
        "object"
    ) {

        try {
            return JSON.stringify(
                value,
                null,
                2
            );
        } catch {
            return String(value);
        }
    }


    return String(value);
}


function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =====================================================
   Tabs
===================================================== */

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                activateTab(
                    tab.dataset.tab
                );
            }
        );
    });


function activateTab(tabId) {

    document
        .querySelectorAll(".tab")
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    document
        .querySelectorAll(
            ".tab-content"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    const targetTab =
        document.querySelector(
            `.tab[data-tab="${tabId}"]`
        );

    const targetContent =
        document.getElementById(
            tabId
        );


    if (targetTab) {
        targetTab.classList.add(
            "active"
        );
    }

    if (targetContent) {
        targetContent.classList.add(
            "active"
        );
    }
}
'''

path = Path("/mnt/data/app.js")
path.write_text(app_js, encoding="utf-8")
print(f"已生成：{path}")
print(f"大小：{path.stat().st_size} bytes")
