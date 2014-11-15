var request = require("request")
var colors = require("colors")

module.exports = {
    getAuthMessage:function(username, password, cb) {

        console.log('Logging into Freelancer.com...');

        request({
            uri: "https://www.freelancer.in/users/ajaxonlogin.php",
            method: "POST",
            jar:true,
            form: {
                username:username,
                passwd:password,
                savelogin:"off"
            }
            }, function(error, response, body) {
                var jsonStatusBody = JSON.parse(body);

                if(jsonStatusBody.status == 'success') {

                    console.log('Success!'.green);

                    request({
                        uri:jsonStatusBody.goto_url,
                        jar:true
                    }, function(error, response, body){

                        var authObject = {};

                        authObject.channel = "auth";
                        authObject.body = {};

                        getUserChannels(body, authObject.body);
                        getAuthCookies(response, authObject.body);

                        authObject = JSON.stringify([JSON.stringify(authObject)]);


                        cb(authObject);
                    });
                } else {
                    console.log('Failed'.red);
                    console.log(body);
                }
            }
        );
    }
}



function getUserChannels(webpage, authObject) {
    var matches = webpage.match(/user_jobs *= *(\[[^\[]*\])/);

    authObject.channels = JSON.parse(matches[1]);
}

function getAuthCookies(response, authObject) {
    var responseCookies = JSON.stringify(response.headers['set-cookie']); 

    var hashV2Regex = /GETAFREE_AUTH_HASH_V2=(?!deleted)([^;]*)/;
    var hashRegex  = /GETAFREE_AUTH_HASH=(?!deleted)([^;]*)/;
    var userRegex  = /GETAFREE_USER_ID=(?!deleted)([^;]*)/;

    authObject['hash']    = responseCookies.match(hashRegex)[1];
    authObject['hash2']   = responseCookies.match(hashV2Regex)[1];
    authObject['user_id'] = responseCookies.match(userRegex)[1];
}
