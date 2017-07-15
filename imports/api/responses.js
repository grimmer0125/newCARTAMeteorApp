import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Responses = new Mongo.Collection('responses');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('commandResponse', function tasksPublication(session_id) {
    return Responses.find();
  });
}
