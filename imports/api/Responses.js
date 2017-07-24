import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Responses = new Mongo.Collection('responses');

if (Meteor.isServer) {
  Meteor.publish('commandResponse', session_id => Responses.find());
}
