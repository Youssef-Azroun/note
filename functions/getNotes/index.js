const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');

const getNotes = async(event, context) => {

    if (event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'Invalid token'});

    const username = event.username

    const {Items} = await db.scan({
        TableName: 'note-db',
        FilterExpression: "#username = :username",
        ExpressionAttributeNames: {
            "#username" : "username"
        },
        ExpressionAttributeValues: {
            ":username" : username
        }
      }).promise();
    
        return sendResponse(200, {success: true, notes: Items});
}

const handler = middy(getNotes)
     .use(validateToken)
     

module.exports = { handler };