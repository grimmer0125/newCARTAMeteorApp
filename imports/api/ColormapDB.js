import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ColormapDB = new Mongo.Collection('colormapdb');
ColormapDB.cartaSet = 'colormapdb';

if (Meteor.isServer) {
  console.log('publish ColormapDB on server');
  Meteor.publish(ColormapDB.cartaSet, sessionID => ColormapDB.find({ sessionID }));
}
export default ColormapDB;
