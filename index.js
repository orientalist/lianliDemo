const axios = require('axios');
const fetch = require('node-fetch');

exports.handler = async (event) => {
    const body = event.body;

    const SVID = body.split('&')[0].split('=')[1];
    const HASH = body.split('&')[1].split('=')[1];
    await main(SVID, HASH);
    return {
        statusCode: 200,
        body: "Success"
    };
};

const createUser = async (email, name) => {
    var data = JSON.stringify({
        "user": {
            "email": email,
            "identities": [
                {
                    "type": "email",
                    "value": email
                }
            ],
            "name": name
        },
        "skip_verify_email":true
    });

    const zendeskToken = '';

    const zendeskUsername = '';

    //產生 API Token
    const authHeader = `Basic ${Buffer.from(`${zendeskUsername}/token:${zendeskToken}`).toString('base64')}`;

    var config = {
        method: 'POST',
        url: '',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader, // Base64 encoded "username:password"
        },
        data: data,
    };

    await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
}

//寫入 Zendesk 工單
const insertZendesk = async (surveyCakeData) => {

    //Zendesk 工單的評論部分
    let comment = '';

    //Zendesk 工單的左側客製欄位
    const customField = [];

    //遍巡 SurveyCake 問卷填答
    surveyCakeData.result.forEach(c => {

        //以 "題目名稱" : "該題的填答" 為格式組成字串 append 到 comment 中
        comment += `${c.subject} : ${c.type === 'FILEUPLOAD' ? `https://abc.com?q=${c.answer[0]}` : c.answer[0]}\n`;

        //判斷該題目是否要寫到 Zendesk 的客製欄位中，判斷原則為該題目是否有格式為 zid-數字 的別名
        const regex = /^zid_\d+$/;
        if (regex.test(c.label)) {

            //建立客製欄位值的變數，預設為該題的填答
            let customFieldValue = c.answer[0];

            //若該題為檔案上傳題，以此前綴加上檔案名稱組成完整的檔案位置 url，以寫入 Zendesk 工單
            if (c.type === 'FILEUPLOAD') {
                customFieldValue = `https://abc.com?q=${c.answer[0]}`;
            }

            if (c.type === 'CHOICEONE') {
                customFieldValue = c.answerAlias[0];
            }

            //剔除別名中標示用的 zid_
            const zid = c.label.replace('zid_', '');

            //將 Zendesk 編號 : 填答值 push 進陣列中
            customField.push({ id: zid, value: customFieldValue });
        }

    });

    //組成呼叫 Zendesk API 建立工單的 body
    const ticketData = {
        ticket: {
            //以 填答編號 為外部編號
            external_id: surveyCakeData.id,
            //以 問卷編號 填答時間 為工單題目
            subject: `${surveyCakeData.title} ${surveyCakeData.submitTime}`,
            //comment 放這
            comment: { body: comment },
            //工單請求者姓名會在問卷中具有 name 標籤
            requester: { name: surveyCakeData.result.find(r => r.alias === 'name').answer[0], email: surveyCakeData.result.find(r => r.alias === 'email').answer[0] },
            //需要建立成 Zendesk 標籤的問卷題目會以 tag 標籤標示出來
            tags: surveyCakeData.result.filter(d => d.label === 'tag').map(d => d.answer[0]),
            type: 'task',
            status: 'new',
            priority: 'urgent',
            //客製化欄位放這
            custom_fields: customField,
            //Zendesk 表單類型編號放這
            ticket_form_id: surveyCakeData.result.find(d => d.alias === 'ticket_form_id') ? surveyCakeData.result.find(d => d.alias === 'ticket_form_id').answer[0] : ''
        }
    };

    //await createUser(surveyCakeData.result.find(r => r.alias === 'email').answer[0],surveyCakeData.result.find(r => r.alias === 'name').answer[0]);

    //Zendesk API 參數
    const zendeskUrl = '';
    const zendeskUsername = '';
    const zendeskToken = '';

    //組成 API url
    const ticketCreateUrl = `${zendeskUrl}/tickets.json`;
    //產生 API Token
    const authHeader = `Basic ${Buffer.from(`${zendeskUsername}/token:${zendeskToken}`).toString('base64')}`;

    //呼叫 API
    const response = await axios.post(ticketCreateUrl, ticketData, {
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json'
        }
    });

    //console.log(response);
    return response.data;
}

//主程式
const main = async (svid, hash) => {
    try {

        const decryptor_url = `https://abc.com?svid=${svid}&hash=${hash}&domain=lianli.surveycake.biz`;
        const surveyResp = await fetch(decryptor_url);
        const surveyData = await surveyResp.json();

        //Step 3 呼叫 BS API 將問卷填達寫入 Zendesk
        const zenDeskResult = await insertZendesk(surveyData);

        return {
            code: '200',
            message: 'OK'
        };

    } catch (err) {
        console.log(err);
        return {
            code: err.statusCode,
            message: err.message
        }
    }
}