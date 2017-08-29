import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Images = new Mongo.Collection('images');

if (Meteor.isServer) {
  Meteor.publish('images', sessionID => Images.find({ sessionID }));
}
