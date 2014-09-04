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
    templateId = "1674E3EB-887F-4290-874D-C23C04DF010C",			// provide valid templateId from a template in your account
    templateRoleName = "RoleOne",		// template role that exists on template referenced above
    baseUrl = "",				// we will retrieve this
    envelopeId = "";			// created from step 2

var newTemplate = undefined;
var pdfFile = undefined;

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
            var fs = require('fs');
            var file = __dirname + '/template.xml';

            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }

                newTemplate = data;

                //console.dir(newTemplate);
                next(null);
            });
        },

        // step 3 get the pdf
        function (next) {
            var fs = require('fs');
            var file = __dirname + '/LoremIpsum.pdf';

            fs.readFile(file, function (err, data) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }

                pdfFile = data;

                console.dir(pdfFile);

                next(null);
            });
        },

        // step 4 post it
        function (next) {
            var url = baseUrl + "/templates";// + templateId; // + ".XML";
            var body = newTemplate;

            // set request url, method, body, and headers
            //
            dsAuthHeader = JSON.stringify({
                "Username": email,
                "Password": password,
                "IntegratorKey": integratorKey	// global
            });

            var options = {
                uri: url,
                method: 'POST',
                body: body,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': ' multipart/form-data',
                    'X-DocuSign-Authentication': dsAuthHeader
                },
                multipart: [
                    {
                        'Content-Type': 'application/xml',
                        'Content-Disposition': 'form-data',
                        body: body
                    },
                    {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'file; filename="test1.pdf"; documentId=1',
                        body: pdfFile
                    }
                ]
            };
//var options = initializeRequest(url, "POST", body, email, password);

            // send the request...

            request(options, function (err, res, body) {
                if (!parseResponseBody(err, res, body)) {
                    return;
                }
                console.log('werew');

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