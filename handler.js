'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({ 
    region: 'us-east-1',
    maxRetries: 3,
    httpOptions: {
        timeout: 5000
    }
});
// eslint-disable-next-line no-undef
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
    return {
        statusCode,
        body: JSON.stringify(data),
    };
};

module.exports.createNote = async (event, context, callback) => {
    context.callbackWaitsForEmtpyEventLoop = false;

    let data = JSON.parse(event.body);
    try {
        const params = {
            TableName: NOTES_TABLE_NAME,
            Item: {
                noteId: data.id,
                title: data.title,
                body: data.body
            },
            ConditionExpression: "attribute_not_exists(noteId)"
        };

        await documentClient.put(params).promise();

        callback(null, {
            statusCode: 201,
            body: JSON.stringify(data),
        });
    } catch (error) {
        callback(null, send(500, error.message));
    }
};

module.exports.updateNote = async (event, context, callback) => {
    context.callbackWaitsForEmtpyEventLoop = false;

    let noteId = event.pathParameters.id;
    let data = JSON.parse(event.body);

    try {
        const params = {
            TableName: NOTES_TABLE_NAME,
            Key: {
                noteId: noteId
            },
            UpdateExpression: 'set #title = :title, #body = :body',
            ExpressionAttributeNames: {
                '#title': 'title',
                '#body': 'body'
            },
            ExpressionAttributeValues: {
                ':title': data.title,
                ':body': data.body,
            },
            ConditionExpression: 'attribute_exists(noteId)'
        };

        await documentClient.update(params).promise();
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(data),
        });
    } catch (error) {
        callback(null, send(500, error.message));
    }
};

module.exports.deleteNote = async (event, context, callback) => {
    context.callbackWaitsForEmtpyEventLoop = false;

    let noteId = event.pathParameters.id;

    try {
        const params = {
            TableName: NOTES_TABLE_NAME,
            Key: { noteId: noteId },
            ConditionExpression: 'attribute_exists(noteId)'
        };

        await documentClient.delete(params).promise();
        callback(null, send(200, noteId));
    } catch (error) {
        callback(null, send(500, error.message));
    }
};

module.exports.getNotes = async (event, context, callback) => {
    context.callbackWaitsForEmtpyEventLoop = false;

    try {
        const params = {
            TableName: NOTES_TABLE_NAME,
        };

        const notes = await documentClient.scan(params).promise();

        callback(null, send(200, notes));
    } catch (error) {
        callback(null, send(500, error.message));
    }
};
