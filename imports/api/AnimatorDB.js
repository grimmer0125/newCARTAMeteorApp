import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const AnimatorDB = new Mongo.Collection('animatordb');
AnimatorDB.cartaSet = 'animatordb';

if (Meteor.isServer) {
  console.log('publish AnimatorDB on server');
  Meteor.publish(AnimatorDB.cartaSet, sessionID => AnimatorDB.find({ sessionID }));
}
export default AnimatorDB;
