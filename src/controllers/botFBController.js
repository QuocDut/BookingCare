import chatFBService from "./../services/chatFBService";
import request from "request";

require('dotenv').config();

let getWebhookFB = (req, res) => {
    let VERIFY_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

let postWebhookFB =  (req, res) => {
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {

            if (entry.standby) {
                //if user's message is "back" or "exit", return the conversation to the bot
                let webhook_standby = entry.standby[0];
                if(webhook_standby && webhook_standby.message){
                    if (webhook_standby.message.text === "back" || webhook_standby.message.text === "exit") {
                        // call function to return the conversation to the primary app
                        // chatbotService.passThreadControl(webhook_standby.sender.id, "primary");
                        chatFBService.takeControlConversation(webhook_standby.sender.id);
                    }
                }

                return;
            }
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            if (webhook_event.message) {
                chatFBService.handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                chatFBService.handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};

let getSetupBotFBPage = (req, res) => {
    return res.render("setupBotFB.ejs")
};

let handleSetupBotFBPage = async (req, res) => {
    try {
        await chatFBService.handleSetupBotFBPage();
        return res.status(200).json({
            message: "ok"
        })
    } catch (e) {
        return res.status(500).json(e)
    }
};

let getBookingOnlineMessengerPage = (req,res) =>{
    return res.render("bookingOnlineMessenger.ejs")
};

let setInfoBookingMessenger = async (req, res) =>{
    try{
        let info = {
            "psid": req.body.psid,
            "customerName": req.body.customerName,
            "phone": req.body.phone,
            "reason": req.body.reason
        };
        await chatFBService.handleResBookingOnlineMessenger(info);
        return res.status(200).json({
            "message": "done"
        });
    }catch (e) {
        console.log(e);
        return res.status(500).json(e);
    }
};

module.exports = {
    getWebhookFB: getWebhookFB,
    postWebhookFB: postWebhookFB,
    getSetupBotFBPage: getSetupBotFBPage,
    handleSetupBotFBPage: handleSetupBotFBPage,
    getBookingOnlineMessengerPage: getBookingOnlineMessengerPage,
    setInfoBookingMessenger: setInfoBookingMessenger
};