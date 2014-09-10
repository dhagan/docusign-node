//
// to run this sample
//  1. copy the file in your own directory - say, example.js
//  2. change "***" to appropriate values
//  3. install async and request packages
//     npm install async
//     npm install request
//  4. execute
//     node example.js 
// 

var async = require("async"),		// async module
    request = require("request"),		// request module
    config = require("./config.js"),
    email = config.email,				// your account email
    password = config.password,			// your account password
    integratorKey = config.integratorKey,			// your account Integrator Key (found on Preferences -> API page)
    recipientName = "John Doe",			// recipient (signer) name
    //templateId = "1674E3EB-887F-4290-874D-C23C04DF010C",			// provide valid templateId from a template in your account
    templateId = "1674E3EB-887F-4290-874D-C23C04DF010C",
    templateRoleName = "RoleOne",		// template role that exists on template referenced above
    baseUrl = "",				// we will retrieve this
    envelopeId = "";			// created from step 2

async.waterfall(
    [
        //////////////////////////////////////////////////////////////////////
        // Step 1 - Login (used to retrieve accountId and baseUrl)
        //////////////////////////////////////////////////////////////////////
        function (next) {
            var url = "https://demo.docusign.net/restapi/v2/login_information";
            var body = "";	// no request body for login api call

            // set request url, method, body, and headers
            var options = initializeRequest(url, "GET", body, email, password);

            // send the request...
            request(options, function (err, res, body) {
                if (!parseResponseBody(err, res, body)) {
                    return;
                }
                baseUrl = JSON.parse(body).loginAccounts[0].baseUrl;
                next(null); // call next function
            });
        },

        //////////////////////////////////////////////////////////////////////
        // Step 2 - Send envelope with one Embedded recipient (using clientUserId property)
        //////////////////////////////////////////////////////////////////////
        function (next) {
            var url = baseUrl + "/templates/" + templateId + ".XML";
            var body = undefined;

            // set request url, method, body, and headers
            var options = initializeRequest(url, "GET", body, email, password);

            // send the request...
            request(options, function (err, res, body) {
//			if(!parseResponseBody(err, res, body)) {
//				return;
//			}
                var fs = require('fs');
                var file = __dirname + '/' + templateId + '.template.xml';
                fs.writeFile(file, body, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(file + "The file was saved!");
                    }
                });
            });
        }
    ]);

//***********************************************************************************************
// --- HELPER FUNCTIONS ---
//***********************************************************************************************
function initializeRequest(url, method, body, email, password) {
    var options = {
        "method": method,
        "uri": url,
        "body": body,
        "headers": {}
    };
    addRequestHeaders(options, email, password);
    return options;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function addRequestHeaders(options, email, password) {
    // JSON formatted authentication header (XML format allowed as well)
    dsAuthHeader = JSON.stringify({
        "Username": email,
        "Password": password,
        "IntegratorKey": integratorKey	// global
    });
    // DocuSign authorization header
    options.headers["X-DocuSign-Authentication"] = dsAuthHeader;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function parseResponseBody(err, res, body) {
    console.log("\r\nAPI Call Result: \r\n", JSON.parse(body));
    if (res.statusCode != 200 && res.statusCode != 201) { // success statuses
        console.log("Error calling webservice, status is: ", res.statusCode);
        console.log("\r\n", err);
        return false;
    }
    return true;
}