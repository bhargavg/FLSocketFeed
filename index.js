var colors = require('colors');
var userPrompt = require('prompt');
var WebSocket = require('ws');
var flAuthHelper = require('./fl-auth-helper.js');

var themeIndex = 0;

var thingsToGetFromUser = [
                            {
                                name:"username",
                                description: "Freelancer Username/Email",
                                message : "Invalid Username/Email",
                                type : "string",
                                required:true
                            },
                            {
                                name: "password",
                                description: "Password",
                                message : "Invalid Password",
                                type : "string",
                                required:true,
                                hidden:true
                            }];

userPrompt.message = '';
userPrompt.delimiter = '';

userPrompt.start();

userPrompt.get(thingsToGetFromUser, function(err, result){
    if(!err){

        var userName = result.username;
        var password = result.password;

        flAuthHelper.getAuthMessage(userName, password, function(authMessage){
            console.log('Opening Socket...');
            openSocket(authMessage);
        });
    }
});



function openSocket(authMessage) {
    var ws = new WebSocket('wss://notifications.freelancer.com/559/7ywjmq5q/websocket');

    ws.on('open', function(){
        console.log('Success'.green);
    });


    ws.on('message', function(data){

        if(data === 'o') {
            console.log('Authentication with socket...');
            ws.send(authMessage);
        } else {
            parseMessage(data);
        }

    });



    ws.on('close', function(){
        console.log('Socket closed'.yellow);
    });
}



function parseMessage(data) {

    if(data.indexOf('a') == 0) {
        data = data.substring('1');
        var objects = JSON.parse(data);
        for(var i=0; i<objects.length; i++) {

            var object = JSON.parse(objects[i]); 

            if(object.body === "OK") {
                console.log("Success".green);
            } else {

                var title          = object.body.data.title;
                var description    = object.body.data.appended_descr;
                var currencySymbol = object.body.data.currency;
                var minBudget      = object.body.data.minbudget;
                var maxBudget      = object.body.data.maxbudget;
                var projectLink    = "https://www.freelancer.in" + object.body.data.linkUrl; 

                if(themeIndex%2 == 0) {
                    console.log(title.bgGreen.black);
                    console.log(colors.bgGreen.black(minBudget + currencySymbol + " - " + maxBudget + currencySymbol));
                    console.log(colors.bgGreen.red.underline(projectLink));
                    console.log(description.bgGreen.black);
                } else {
                    console.log(title.bgBlue.black);
                    console.log(colors.bgBlue.black(minBudget + currencySymbol + " - " + maxBudget + currencySymbol));
                    console.log(colors.bgBlue.red.underline(projectLink));
                    console.log(description.bgBlue.black);
                }

                themeIndex++;
            }
        }
    }
}
