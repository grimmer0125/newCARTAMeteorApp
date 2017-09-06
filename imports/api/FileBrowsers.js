import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FileBrowsers = new Mongo.Collection('filebrowsers');

if (Meteor.isServer) {
  console.log('publish FileBrowsers on server');
  Meteor.publish('filebrowserui', sessionID => FileBrowsers.find({ sessionID }));
}
