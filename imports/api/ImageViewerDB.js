import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const ImageViewerDB = new Mongo.Collection('imageviewerdb');
ImageViewerDB.cartaSet = 'imageviewerdb';

if (Meteor.isServer) {
  Meteor.publish(ImageViewerDB.cartaSet, sessionID => ImageViewerDB.find({ sessionID }));
}
export default ImageViewerDB;
