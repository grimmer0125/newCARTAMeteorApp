import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const UIData = new Mongo.Collection('uidata');

if (Meteor.isServer) {
  console.log('publish uidata on server');
  // This code only runs on the server
  Meteor.publish('filebrowserui', () => UIData.find());
} else {
  console.log('load uidata.js on client');
}
