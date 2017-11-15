import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FileBrowserDB = new Mongo.Collection('filebrowserdb');
FileBrowserDB.cartaSet = 'filebrowserdb';

if (Meteor.isServer) {
  console.log('publish FileBrowserDB on server');
  Meteor.publish(FileBrowserDB.cartaSet, sessionID => FileBrowserDB.find({ sessionID }));
}
export default FileBrowserDB;
