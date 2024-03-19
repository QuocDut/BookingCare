require('dotenv').config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WIT_SERVER_TOKEN = process.env.WIT_AI_SERVER_TOKEN;
const WEBVIEW_URL = process.env.WEBVIEW_URL;

const DOCTOR_IMAGE_URL = "https://bralowmedicalgroup.com/wp-content/uploads/2018/06/blog.jpg";
const DOCTOR_URL = "https://doctorcare-v1.herokuapp.com/";

const BOOKING_IMAGE_URL = "http://ipright.vn/wp-content/uploads/2014/03/36322201-procedure-word-write-on-paper-Stock-Photo-1200x545_c.jpg";
const BOOKING_URL = "https://doctorcare-v1.herokuapp.com/";

const COXUONGKHOP_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const COXUONGKHOP_URL = "https://doctorcare-v1.herokuapp.com/";

const TIEUHOA_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const TIEUHOA_URL = "https://doctorcare-v1.herokuapp.com/";

const INFOWEBSITE_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const INFOWEBSITE_URL = "https://doctorcare-v1.herokuapp.com/";

const DEFAULT_IMAGE_URL = "https://www.freseniusmedicalcare.com.vn/fileadmin/_processed_/5/4/csm_SPE001_service-support-employee_7614d83ad5.jpg";
const DEFAULT_URL = "https://doctorcare-v1.herokuapp.com/";

let handlePostback = (sender_psid, received_postback) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            let payload = received_postback.payload;
            // Set the response based on the postback payload
            switch (payload) {
                case "GET_STARTED":
                case "RESTART_CONVERSATION":
                    let username = await getFacebookUsername(sender_psid);
                    let text = `Xin chào ${username}. Mình là chat bot hỗ trợ Doctor Care. Bạn cần mình giúp gì nào?`;
                    await sendMessageDefault(sender_psid, text);

                    resolve("OK");
                    break;

                case "DOCTORS":
                    await sendMessageReplyDoctors(sender_psid);
                    break;
                case "CLINICS":
                    await sendMessageReplyClinics(sender_psid);
                    break;
                case "SPECIALIZATION":
                    await sendMessageReplySpecialization(sender_psid);
                    break;

                case "ALL_DOCTORS":
                    await sendMessageAllDoctors(sender_psid);
                    break;
                case "ALL_CLINICS":
                    await sendMessageAllClinics(sender_psid);
                    break;
                case "ALL_SPECIALIZATION":
                    await sendMessageAllSpecializations(sender_psid);
                    break;
                case "CUSTOMER_SERVICE":
                    await chatWithCustomerService(sender_psid);
                    break;
                case "BOOKING_MESSENGER":
                    await sendMessageBooking(sender_psid);
                    break;
                case "BACK":
                    await sendMessageDefault(sender_psid, "Xem thêm thông tin:")
                    break;
                case "yes":
                    response = "Thanks!";
                    // Send the message to acknowledge the postback
                    await callSendAPI(sender_psid, response);
                    resolve("OK");
                    break;
                case "no":
                    response = "Oops, try sending another image.";
                    // Send the message to acknowledge the postback
                    await callSendAPI(sender_psid, response);
                    resolve("OK");
                    break;
                default:
                    console.log("Something wrong with switch case payload");
            }

        } catch (e) {
            reject(e);
        }
    });


};

let callSendAPI = (sender_psid, message) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "text": message
                }
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve("ok");
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });

};

let callSendAPIv2 = (sender_psid, title, subtitle, imageUrl, redirectUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            let body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [
                                {
                                    "title": title,
                                    "image_url": imageUrl,
                                    "subtitle": subtitle,
                                    "default_action": {
                                        "type": "web_url",
                                        "url": redirectUrl,
                                        "webview_height_ratio": "tall",
                                    },
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": redirectUrl,
                                            "title": "Xem chi tiết"
                                        },
                                        {
                                            "type": "phone_number",
                                            "title": "Gọi hotline",
                                            "payload": "+8498549864"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            };

            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": body
            }, (err, res, body) => {
                if (!err) {
                    resolve("ok");
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    })

};

let firstEntity = (nlp, name) => {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
};

let handleMessage = async (sender_psid, received_message) => {
    //handle message for react, like press like button
    // id like button: sticker_id 369239263222822
    if (received_message.sticker_id) {
        await callSendAPI(sender_psid, "Cảm ơn bạn đã sử dụng dịch vụ của Doctors Care !!!");
        return;
    }
    //checking quick reply
    if (received_message && received_message.quick_reply && received_message.quick_reply.payload) {
        let payload = received_message.quick_reply.payload;
        if (payload === "KHAM_BENH") {
            await sendMessageMedicalExamination(sender_psid);
            return;
        } else if (payload === "DOCTORS") {
            await sendMessageReplyDoctors(sender_psid);
            return;
        } else if (payload === "CLINICS") {
            await sendMessageReplyClinics(sender_psid);
            return;
        } else if (payload === "SPECIALIZATION") {
            await sendMessageReplySpecialization(sender_psid);
            return;
        }

    }


    let name = "";
    let entityCheck = {};
    let arrPossibleEntity = [ 'intent', 'booking', 'info' ];
    for (let i = 0; i < arrPossibleEntity.length; i++) {
        let entity = firstEntity(received_message.nlp, arrPossibleEntity[i]);
        if (entity && entity.confidence > 0.8) {
            name = arrPossibleEntity[i];
            entityCheck = entity;
            break;
        }
    }
    await handleEntity(name, sender_psid, entityCheck);
};

let handleEntity = async (name, sender_psid, entity) => {
    switch (name) {
        case "intent":
            if (entity.value === 'doctors') {
                await callSendAPI(sender_psid, "Bạn đang tìm kiếm thông tin về bác sĩ, xem thêm ở link bên dưới nhé.");
                let title = "Doctors Care";
                let subtitle = 'Thông tin bác sĩ làm việc tại Doctors Care';
                await callSendAPIv2(sender_psid, title, subtitle, DOCTOR_IMAGE_URL, DOCTOR_URL);
                await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
            }
            if (entity.value === 'tiêu hóa') {
                await callSendAPI(sender_psid, "Bạn đang gặp vấn đề về bệnh đường tiêu hóa, xem thêm danh sách bác sĩ chuyên khoa TIÊU HÓA.");
                let title = "Chuyên khoa khám bệnh";
                let subtitle = 'Thông tin bác sĩ chuyên khoa tiêu hóa';
                await callSendAPIv2(sender_psid, title, subtitle, TIEUHOA_IMAGE_URL, TIEUHOA_URL);
                await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
            }
            if (entity.value === 'cơ-xương-khớp') {
                await callSendAPI(sender_psid, "Bạn đang gặp vấn đề về cơ-xương-khớp, xem thêm danh sách bác sĩ chuyên khoa CƠ XƯƠNG KHỚP.");
                let title = "Chuyên khoa khám bệnh";
                let subtitle = 'Thông tin bác sĩ chuyên khoa cơ-xương-khớp';
                await callSendAPIv2(sender_psid, title, subtitle, COXUONGKHOP_IMAGE_URL, COXUONGKHOP_URL);
                await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
            }
            break;
        case"booking":
            await callSendAPI(sender_psid, "Bạn đang cần đặt lịch khám bệnh, xem thêm hướng dẫn đặt lịch chi tiết ở link bên dưới nhé.");
            await callSendAPIv2(sender_psid, "Đặt lịch khám bệnh", "Hướng dẫn đặt lịch khám bệnh tại Doctors Care", BOOKING_IMAGE_URL, BOOKING_URL);
            await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
            break;
        case"info":
            await callSendAPI(sender_psid, "Bạn đang tìm hiểu về thông tin website, xem thêm ở link bên dưới nhé.");
            await callSendAPIv2(sender_psid, "Thông tin website", "Thông tin website Doctors care", INFOWEBSITE_IMAGE_URL, INFOWEBSITE_URL);
            await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
            break;
        default:
            await callSendAPI(sender_psid, "Rất tiếc bot chưa được hướng dẫn để trả lời câu hỏi của bạn. Để được hỗ trợ, vui lòng truy câp:");
            await callSendAPIv2(sender_psid, "Hỗ trợ khách hàng", "Thông tin hỗ trợ khách hàng Doctors care", DEFAULT_IMAGE_URL, DEFAULT_URL);
            await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
    }
};

let getWitEntities = () => {
    return new Promise((resolve, reject) => {
        try {
            request({
                "uri": "https://api.wit.ai/entities",
                "method": "GET",
                "auth": {
                    'bearer': WIT_SERVER_TOKEN
                }
            }, (err, res, body) => {
                if (!err) {
                    let result = JSON.parse(body);
                    let arr = [];
                    for (let [ key, value ] of Object.entries(result)) {

                        // arr.push(value)

                        arr.push(value.name)
                    }
                    // new wit update, tạm thời comment lại
                    // let userEntity = arr.filter(e => {
                    //     return e.indexOf("wit") !== 0;
                    // });
                    // resolve(userEntity);
                    resolve(arr)
                } else {
                    reject(err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
};

let getEntityByName = (name) => {
    return new Promise((resolve, reject) => {
        try {
            request({
                "uri": `https://api.wit.ai/entities/${name}?v=20170307`,
                "method": "GET",
                "auth": {
                    'bearer': WIT_SERVER_TOKEN
                }
            }, (err, res, body) => {
                if (!err) {
                    resolve(body);
                } else {
                    reject(err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
};

let getWitEntitiesWithExpression = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let entities = await getWitEntities();
            let result = [];
            await Promise.all(entities.map(async (name) => {
                let b = await getEntityByName(name);
                result.push(JSON.parse(b));
            }));
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
};

let handleSetupBotFBPage = () => {
    return new Promise((resolve, reject) => {
        let data = {
            "get_started": {
                "payload": "GET_STARTED"
            },
            "persistent_menu": [
                {
                    "locale": "default",
                    "composer_input_disabled": false,
                    "call_to_actions": [
                        {
                            "type": "postback",
                            "title": "Chăm sóc khách hàng",
                            "payload": "CUSTOMER_SERVICE"
                        },
                        {
                            "type": "postback",
                            "title": "Restart hội thoại",
                            "payload": "RESTART_CONVERSATION"
                        },
                        {
                            "type": "nested",
                            "title": "Thông tin",
                            "call_to_actions": [
                                {
                                    "type": "web_url",
                                    "title": "Xem website",
                                    "url": "https://doctorcare-v1.herokuapp.com",
                                    "webview_height_ratio": "full"
                                },
                                {
                                    "type": "postback",
                                    "title": "Đặt lịch (thử nghiệm)",
                                    "payload": "BOOKING_MESSENGER"
                                },
                            ]
                        },


                    ]
                }
            ],
            "whitelisted_domains": [
                "https://doctorcare-v1.herokuapp.com/"
            ]
        };

        request({
            "uri": `https://graph.facebook.com/v6.0/me/messenger_profile?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            "method": "POST",
            "json": data
        }, (err, res, body) => {
            if (!err) {
                resolve("Done!")
            } else {
                reject(err);
            }
        });
    });
};

let getFacebookUsername = (sender_psid) => {
    return new Promise((resolve, reject) => {
        // Send the HTTP request to the Messenger Platform
        let uri = `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`;
        request({
            "uri": uri,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                //convert string to json object
                body = JSON.parse(body);
                let username = `${body.last_name} ${body.first_name}`;
                resolve(username);
            } else {
                reject("Unable to send message:" + err);
            }
        });
    });
};

let sendMessage = (sender_psid, response) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response,
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                console.log(body)
                if (!err) {
                    resolve("ok")
                } else {
                    reject(err);
                }
            });
        } catch (e) {
            reject(e);
        }
    })
};

let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageMedicalExamination = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Quy trình khám bệnh với Doctor Care gồm những bước sau:" +
                    "\n\n1. Bệnh nhân lựa chọn bác sĩ khám bệnh từ website." +
                    "\n\n2. Bệnh nhân điền thông tin, chọn lịch khám và xác nhận đặt lịch." +
                    "\n\n3. Nhân viên hỗ trợ gọi điện xác nhận lịch hẹn." +
                    "\n\n4. Bệnh nhân đến khám bệnh tại cơ sở y tế, phòng khám đã đặt lịch."
            };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": "Để được hỗ trợ thông tin cũng như đặt lịch khám bệnh online," +
                            "vui lòng liên hệ tổng đài: 1900.000.111",
                        "buttons": [
                            {
                                "type": "phone_number",
                                "title": "GỌI HOTLINE",
                                "payload": "+8498549864"
                            }
                        ]
                    }
                }
            };

            let response3 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    }
                ]
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            await sendMessage(sender_psid, response3);

            resolve("ok");
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageReplyDoctors = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Doctors Care tự hào mang đến cho bạn đội ngũ bác sĩ hàng đầu, chất lượng và uy tín." +
                    "\n\nMột số bác sĩ tiêu biểu trên Doctors Care:"
            };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "GS.TS Phạm Văn Tuấn",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor.jpg",
                                "subtitle": "Y học cổ truyền",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/2",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "GS.TS Hoàng Đình Tùng",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor-hoang-dinh-tung.jpg",
                                "subtitle": "Cơ xương khớp",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/4",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "GS.TS Eric Pham",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor-eric-pham.jpg",
                                "subtitle": "Tai mũi họng",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/5",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "Xem thêm thông tin:",
                                "image_url": " https://bit.ly/imageToSend",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Tất cả bác sĩ",
                                        "payload": "ALL_DOCTORS",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Chuyên khoa",
                                        "payload": "SPECIALIZATION",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Phòng khám",
                                        "payload": "CLINICS",
                                    }
                                ],
                            }
                        ]
                    }
                }
            };

            let response3 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    },
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                ]
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            await sendMessage(sender_psid, response3);

            resolve("ok");
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageReplySpecialization = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Doctors Care có đầy đủ các chuyên khoa khám chữa bệnh cho mọi lứa tuổi." +
                    "\n\nMột số chuyên khoa tiêu biểu trên Doctors Care:"
            };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "TAI MŨI HỌNG",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/specializations/tai-mui-hong.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/specialization/1",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "THẦN KINH",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/specializations/than-kinh.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/specialization/2",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "TIÊU HÓA",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/specializations/tieu-hoa.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/specialization/3",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "Xem thêm thông tin:",
                                "image_url": " https://bit.ly/imageToSend",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Tất cả chuyên khoa",
                                        "payload": "ALL_SPECIALIZATION",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Phòng khám",
                                        "payload": "SPECIALIZATION",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Bác sĩ",
                                        "payload": "DOCTORS",
                                    },
                                ],
                            }
                        ]
                    }
                }
            };

            let response3 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    },
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                ]
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            await sendMessage(sender_psid, response3);

            resolve("ok");
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageReplyClinics = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Doctors Care có trên 20 cơ sở y tế, phòng khám hợp tác phát triển." +
                    "\n\nMột số phòng khám tiêu biểu trên Doctors Care:"
            };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Phòng khám đa khoa Thu Cúc",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/clinics/phong-kham-thu-cuc.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/clinic/1",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "Phòng khám Meditec",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/clinics/phong-kham-meditec.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/clinic/2",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "Phòng khám quốc tế Bảo Sơn",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/clinics/phong-kham-bao-son.jpg",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/clinic/3",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "Xem thêm thông tin:",
                                "image_url": " https://bit.ly/imageToSend",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Tất cả phòng khám",
                                        "payload": "ALL_CLINICS",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Bác sĩ",
                                        "payload": "DOCTORS",
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Chuyên khoa",
                                        "payload": "SPECIALIZATION",
                                    },
                                ],
                            }
                        ]
                    }
                }
            };

            let response3 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    },
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                ]
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            await sendMessage(sender_psid, response3);

            resolve("ok");
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageAllDoctors = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Danh sách tất cả bác sĩ bạn xem thêm ở link bên dưới nhé:" +
                    "\n\n 👉 https://doctorcare-v1.herokuapp.com/all-doctors  "
            };
            let response2 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    }
                ]
            };
            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            resolve("ok");
        } catch (e) {
            reject(e);
        }
    })
};
let sendMessageAllClinics = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Danh sách tất cả phòng khám bạn xem thêm ở link bên dưới nhé:" +
                    "\n\n 👉 https://doctorcare-v1.herokuapp.com/all-clinics  "
            };
            let response2 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    }
                ]
            };
            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            resolve("ok");
        } catch (e) {
            reject(e);
        }
    })
};
let sendMessageAllSpecializations = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "Danh sách tất cả các chuyên khoa bạn xem thêm ở link bên dưới nhé:" +
                    "\n\n 👉 https://doctorcare-v1.herokuapp.com/all-specializations  "
            };
            let response2 = {
                "text": "Xem thêm thông tin:",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    }
                ]
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            resolve("ok");
        } catch (e) {
            reject(e);
        }
    })
};
let sendMessageDefault = (sender_psid, text) => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = {
                "text": text,
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Khám bệnh",
                        "payload": "KHAM_BENH",
                    },
                    {
                        "content_type": "text",
                        "title": "Bác sĩ",
                        "payload": "DOCTORS",
                    },
                    {
                        "content_type": "text",
                        "title": "Phòng khám",
                        "payload": "CLINICS",
                    },
                    {
                        "content_type": "text",
                        "title": "Chuyên khoa",
                        "payload": "SPECIALIZATION",
                    }
                ]
            };

            await sendMessage(sender_psid, res);
            resolve("ok");
        } catch (e) {
            reject(e);
        }
    })
};

let chatWithCustomerService = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            //send a text message
            let response1 = {
                "text": "Bạn đã lựa chọn chat với hỗ trợ viên chăm sóc khách hàng" +
                    "\n Vui lòng để lại lời nhắn và chúng tôi sẽ phản hồi trong ít phút nữa." +
                    "\n\nĐể bật lại bot trả lời tự động, nhập 'exit' hoặc 'back' và gửi tin nhắn."
            };

            await sendMessage(sender_psid, response1);

            //change this conversation to page inbox
            await passThreadControl(sender_psid);
            resolve("done");
        } catch (e) {
            reject(e);
        }
    })
};

let passThreadControl = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "target_app_id": "263902037430900",
                "metadata": "Pass thread control to inbox chat"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/pass_thread_control",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                console.log(body)
                if (!err) {
                    resolve('message sent!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let takeControlConversation = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "metadata": "Pass this conversation from page inbox to the bot - primary app"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/take_thread_control",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, async (err, res, body) => {
                if (!err) {
                    //send messages
                    await sendMessage(sender_psid, { "text": "Bạn đã kích hoạt lại bot trả lời tự động." });
                    await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
                    resolve('message sent!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let sendMessageBooking = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        let response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": `Bạn đã lựa chọn đặt khám online, vui lòng nhấn vào "Cài đặt thông tin" để hoàn tất các thông tin cần thiết.`,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": WEBVIEW_URL,
                            "title": "Cài đặt thông tin",
                            "webview_height_ratio": "tall", //display on mobile
                            "messenger_extensions": true //false : open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "Quay trở lại",
                            "payload": "BACK",
                        }

                    ]
                }
            }
        };

        await sendMessage(sender_psid, response);
        resolve("done");
    });
};

let handleResBookingOnlineMessenger = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            //save to database
            //name, phone, reason
            let username = user.customerName;
            let phoneNumber = user.phone;
            if(username === ""){
                username = await getFacebookUsername(user.psid);
            }

            let response = {
                "text": `*Thông tin khám bệnh:*
                    \n*Họ và tên*: _${username}_
                    \n*Số điện thoại*: _${phoneNumber}_
                    \n*Lí do khám*: _${user.reason}_
                    \n\nThông tin của bạn đã được ghi nhận. Nhân viên chăm sóc khách hàng sẽ liên lạc với bạn trong thời gian sớm nhất.`
            };
            await sendMessage(user.psid, response);
            await sendMessageDefault(user.psid, "Xem thêm thông tin:");
            resolve("done");
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    handlePostback: handlePostback,
    handleMessage: handleMessage,
    getWitEntities: getWitEntities,
    getWitEntitiesWithExpression: getWitEntitiesWithExpression,
    handleSetupBotFBPage: handleSetupBotFBPage,
    getFacebookUsername: getFacebookUsername,
    sendMessageAllDoctors: sendMessageAllDoctors,
    sendMessageAllClinics: sendMessageAllClinics,
    sendMessageAllSpecializations: sendMessageAllSpecializations,
    sendMessageDefault: sendMessageDefault,
    takeControlConversation: takeControlConversation,
    handleResBookingOnlineMessenger: handleResBookingOnlineMessenger
};
