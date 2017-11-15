import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const RegionDB = new Mongo.Collection('regiondb');
RegionDB.cartaSet = 'regiondb';

if (Meteor.isServer) {
  console.log('publish regionDB on server');
  Meteor.publish(RegionDB.cartaSet, sessionID => RegionDB.find({ sessionID }));
}
export default RegionDB;
