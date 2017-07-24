import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FileBrowsers = new Mongo.Collection('filebrowsers');

if (Meteor.isServer) {
  console.log('publish uidata on server');
  Meteor.publish('filebrowserui', () => FileBrowsers.find());
} else {
  console.log('load uidata.js on client');
}
