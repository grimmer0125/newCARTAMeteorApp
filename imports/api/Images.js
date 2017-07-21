import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Images = new Mongo.Collection('images');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('images', session_id => Images.find());
}
