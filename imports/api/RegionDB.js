import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const RegionDB = new Mongo.Collection('regiondb');

if (Meteor.isServer) {
  console.log('publish regionDB on server');
  Meteor.publish('regiondb', sessionID => RegionDB.find({ sessionID }));
}
