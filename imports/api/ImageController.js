import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ImageController = new Mongo.Collection('imagecontroller');
ImageController.cartaSet = 'imagecontroller';

if (Meteor.isServer) {
  Meteor.publish(ImageController.cartaSet, sessionID => ImageController.find({ sessionID }));
}
