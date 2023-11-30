const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');
const { nanoid } = require('nanoid'); //unika användar-id


const postNotes = async (event, context) => {
    
    if (event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'Invalid token'});

    const notes = JSON.parse(event.body);

    if (notes.title.length > 50){
        return sendResponse(400, {
            success: false, message: 'title can\'t be longer than 50 chars '
        })
    }

    if (notes.text.length > 400){
        return sendResponse(400, {
            success: false, 
            message: 'text can\'t be longer than 400 chars'
        })
    }

    const createdAt = new Date().toISOString();
    notes.id = nanoid();
    notes.createdAt = `${createdAt}`;
    notes.modifiedAt = createdAt
    notes.username = event.username

    try{
        await db.put({
            TableName: 'note-db',
            Item: notes
        }).promise()

        return sendResponse(200, {success: true});
    } catch (error) {
        return sendResponse(500, {success: false});
    }
}

const handler = middy(postNotes)
     .use(validateToken)
     
module.exports = { handler };