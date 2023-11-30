const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');

const updateNotes = async(event, context) => {

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});

    const requestBody = JSON.parse(event.body);
    const { id, title, text } = requestBody

    try {

        const {Items} = await db.scan({
            TableName: 'note-db'
        }).promise();
    
        const updateNote = Items.find((notes) => notes.id === id);

        if(!updateNote) {
            return sendResponse(404, {success: false, message : 'Note not found with this id!'});
        }
    
        const createdAt = new Date().toISOString();
        const modifiedAt = `${createdAt}` 


        await db.update({
            TableName: 'note-db',
            Key : { id: updateNote.id },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: 'set #notetext = :text, #notetitle = :title, modifiedAt = :modifiedAt',
            ExpressionAttributeValues: {
                ':text' : text,
                ':title' : title,
                ':modifiedAt' : modifiedAt,
            },
            ExpressionAttributeNames: {
                '#notetext' : 'text',
                '#notetitle' : 'title',

            }
        }).promise();

        return sendResponse(200, { success: true, message : 'note updatet successfully' });
    } catch (error) {
        return sendResponse(500, { success: false, message : 'could not update note'});
    }

}

const handler = middy(updateNotes)
     .use(validateToken)
     

module.exports = { handler };