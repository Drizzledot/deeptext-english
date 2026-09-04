const setupForm =
    document.getElementById(
        "setupForm"
    );

const baseUrlInput =
    document.getElementById(
        "baseUrl"
    );

const apiKeyInput =
    document.getElementById(
        "apiKey"
    );

const modelInput =
    document.getElementById(
        "model"
    );

const testBtn =
    document.getElementById(
        "testBtn"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const toggleKeyBtn =
    document.getElementById(
        "toggleKeyBtn"
    );

const messageBox =
    document.getElementById(
        "messageBox"
    );


/* =====================================================
   初始化
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadCurrentStatus
);


async function loadCurrentStatus() {

    try {

        const response =
            await fetch(
                "/api/setup/status"
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        if (data.base_url) {

            baseUrlInput.value =
                data.base_url;
        }


        if (data.model) {

            modelInput.value =
                data.model;
        }


        if (data.configured) {

            showMessage(
                "当前 Codespace 已存在模型配置。你可以重新配置，或者直接返回 DeepText。",
                "info"
            );
        }

    } catch (error) {

        console.error(
            "读取配置状态失败：",
            error
        );
    }
}


/* =====================================================
   显示 API Key
===================================================== */

toggleKeyBtn.addEventListener(
    "click",
    () => {

        const showing =
            apiKeyInput.type ===
            "text";


        apiKeyInput.type =
            showing
                ? "password"
                : "text";


        toggleKeyBtn.textContent =
            showing
                ? "显示"
                : "隐藏";
    }
);


/* =====================================================
   测试连接
===================================================== */

testBtn.addEventListener(
    "click",
    async () => {

        const config =
            readForm();


        if (!config) {
            return;
        }


        setBusy(true);


        showMessage(
            "正在测试模型连接，请稍候……",
            "info"
        );


        try {

            const response =
                await fetch(
                    "/api/setup/test",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                config
                            )
                    }
                );


            const data =
                await safeJson(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    `连接失败：${response.status}`
                );
            }


            showMessage(
                `连接成功，模型 ${config.model} 可以正常响应。`,
                "success"
            );

        } catch (error) {

            showMessage(
                error.message ||
                "连接测试失败",
                "error"
            );

        } finally {

            setBusy(false);
        }
    }
);


/* =====================================================
   保存配置
===================================================== */

setupForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const config =
            readForm();


        if (!config) {
            return;
        }


        setBusy(true);


        showMessage(
            "正在保存配置……",
            "info"
        );


        try {

            const response =
                await fetch(
                    "/api/setup/save",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                config
                            )
                    }
                );


            const data =
                await safeJson(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    `保存失败：${response.status}`
                );
            }


            showMessage(
                "配置已保存，正在进入 DeepText……",
                "success"
            );


            window.setTimeout(
                () => {

                    window.location.href =
                        "/";

                },
                600
            );

        } catch (error) {

            showMessage(
                error.message ||
                "保存配置失败",
                "error"
            );


            setBusy(false);
        }
    }
);


/* =====================================================
   Helpers
===================================================== */

function readForm() {

    const baseUrl =
        baseUrlInput
            .value
            .trim();


    const apiKey =
        apiKeyInput
            .value
            .trim();


    const model =
        modelInput
            .value
            .trim();


    if (!baseUrl) {

        showMessage(
            "请填写 API 地址。",
            "error"
        );

        baseUrlInput.focus();

        return null;
    }


    if (!apiKey) {

        showMessage(
            "请填写 API Key。",
            "error"
        );

        apiKeyInput.focus();

        return null;
    }


    if (!model) {

        showMessage(
            "请填写模型名称。",
            "error"
        );

        modelInput.focus();

        return null;
    }


    return {
        base_url:
            baseUrl,

        api_key:
            apiKey,

        model:
            model
    };
}


function setBusy(busy) {

    testBtn.disabled =
        busy;

    saveBtn.disabled =
        busy;
}


function showMessage(
    message,
    type
) {

    messageBox.textContent =
        message;

    messageBox.className =
        `message ${type}`;
}


async function safeJson(
    response
) {

    try {

        return await response.json();

    } catch {

        return {};
    }
}