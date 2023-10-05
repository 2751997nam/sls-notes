const { CognitoJwtVerifier } = require('aws-jwt-verify');

const jwtVerifier = CognitoJwtVerifier.create({
    // eslint-disable-next-line no-undef
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    // eslint-disable-next-line no-undef
    clientId: process.env.COGNITO_WEB_CLIENT_ID
});

const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke"
                }
            ]
        };

        authResponse.policyDocument = policyDocument;
    }

    authResponse.context = {
        foo: "bar"
    };

    console.log(JSON.stringify(authResponse));

    return authResponse;
};

exports.handler = async (event, context, callback) => {
    var token = event.authorizationToken; // "allow" or "deny"
    console.log(token);
    try {
        const payload = await jwtVerifier.verify(token);
        console.log(payload);
        callback(null, generatePolicy("user", "Allow", event.methodArn));
    } catch (error) {
        callback("Error: invalid token");
    }
};