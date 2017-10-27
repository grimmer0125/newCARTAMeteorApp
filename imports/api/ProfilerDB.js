import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ProfilerDB = new Mongo.Collection('profilerdb');
ProfilerDB.cartaSet = 'profilerdb';

if (Meteor.isServer) {
  console.log('publish profilerDB on server');
  Meteor.publish('profilerdb', sessionID => ProfilerDB.find({ sessionID }));
}
