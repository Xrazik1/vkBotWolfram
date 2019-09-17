/* global require __dirname process*/

const VK = require('vk-node-sdk');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");


const WolframAlphaAPI = require("./wolfram/lib/WolframAlphaAPI.js");
const waApi = WolframAlphaAPI('52872U-EQ6HQAEGJA');

const Group = new VK.Group('') // Подробнее: https://vk.com/dev/access_token
const app = express();
// https://www.npmjs.com/package/vk-node-sdk


// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.use(express.static(path.join(__dirname, 'client')));

// Serve index.html from client folder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
});

// Set Port
const port = process.env.PORT || '3000';
app.set('port', port)

// Create an HTTP server
const server = http.createServer(app);

server.listen(port, () => console.log(`Server is up and running on localhost;port: ${port}`));


Group.onMessage((message) => {
    let messageElements = message.body.trim();
    messageElements = messageElements.split('');
    
    if(messageElements[0] == "{" && messageElements[messageElements.length - 1] == "}"){
        message.setTyping() // Отправляем статус "печатает";
        delete messageElements[0];
        delete messageElements[messageElements.length - 1];

        let userMessage = messageElements.join('');
        
        waApi.getFull(userMessage).then((queryresult) => {
        try {
            const pods = queryresult.pods;
            for (let pod of pods){
                message.addText(pod.title);
                
                for (let subpod of pod.subpods){
                    message.addPhoto(subpod.img.src);
                    message.send()
                }
            } 
        }catch (err){console.log(err)}   

       }).catch(console.error);
    }



})

