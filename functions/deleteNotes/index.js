
// Import necessary AWS SDK, response handling, and middleware modules
const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); 
const { validateToken } = require('../middleware/auth');

// Define the deleteNotes function to handle the deletion of a note
const deleteNotes = async(event, context) => {

    // Check if there is an error in the event object indicating unauthorized access
    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});

    const requestBody = JSON.parse(event.body);
    const {id} = requestBody
    
    try {

         // Scan the DynamoDB table to get all items (notes)
        const {Items} = await db.scan({
            TableName: 'note-db'
        }).promise();
    
        const noteForDelete = Items.find((notes) => notes.id === id);

        if(!noteForDelete) {
            return sendResponse(404, {success: false, message : 'Note not found with this id!'});
        }

        // Delete the note with the specified ID from the DynamoDB table
        await db.delete({
            TableName: 'note-db',
            Key : { id: noteForDelete.id }
        }).promise();

        return sendResponse(200, { success: true, message : 'note deleted' });
    } catch (error) {
        return sendResponse(500, { success: false, message : 'could not delete note'});
    }

}
// Create a middleware-wrapped handler using 'middy' and add the 'validateToken' middleware
const handler = middy(deleteNotes)
     .use(validateToken)
     
// Export the handler for use in other parts of the application
module.exports = { handler };