import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FileBrowserDB = new Mongo.Collection('filebrowserdb');

if (Meteor.isServer) {
  console.log('publish FileBrowserDB on server');
  Meteor.publish('filebrowserdb', sessionID => FileBrowserDB.find({ sessionID }));
}
