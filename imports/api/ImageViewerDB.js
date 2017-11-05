import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ImageViewerDB = new Mongo.Collection('imageviewer');
ImageViewerDB.cartaSet = 'imageviewer';

if (Meteor.isServer) {
  Meteor.publish(ImageViewerDB.cartaSet, sessionID => ImageViewerDB.find({ sessionID }));
}
