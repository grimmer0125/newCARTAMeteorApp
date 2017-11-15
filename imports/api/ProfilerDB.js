import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ProfilerDB = new Mongo.Collection('profilerdb');
ProfilerDB.cartaSet = 'profilerdb';

if (Meteor.isServer) {
  console.log('publish profilerDB on server');
  Meteor.publish(ProfilerDB.cartaSet, sessionID => ProfilerDB.find({ sessionID }));
}
export default ProfilerDB;
