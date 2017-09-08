import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ImageViewers = new Mongo.Collection('imagesviewers');

if (Meteor.isServer) {
  Meteor.publish('imageviewers', sessionID => ImageViewers.find({ sessionID }));
}
