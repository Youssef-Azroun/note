const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');

const deleteNotes = async(event, context) => {

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});

    const requestBody = JSON.parse(event.body);
    const {id} = requestBody
    
    try {

        const {Items} = await db.scan({
            TableName: 'note-db'
        }).promise();
    
        const noteForDelete = Items.find((notes) => notes.id === id);

        if(!noteForDelete) {
            return sendResponse(404, {success: false, message : 'Note not found with this id!'});
        }

        await db.delete({
            TableName: 'note-db',
            Key : { id: noteForDelete.id }
        }).promise();

        return sendResponse(200, { success: true, message : 'note deleted' });
    } catch (error) {
        return sendResponse(500, { success: false, message : 'could not delete note'});
    }

}

const handler = middy(deleteNotes)
     .use(validateToken)
     

module.exports = { handler };