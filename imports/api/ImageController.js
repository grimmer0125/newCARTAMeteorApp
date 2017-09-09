import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ImageController = new Mongo.Collection('imagecontroller');

if (Meteor.isServer) {
  Meteor.publish('imagecontroller', sessionID => ImageController.find({ sessionID }));
}
