import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const FeatureContainerDB = new Mongo.Collection('featureContainerdb');
FeatureContainerDB.cartaSet = 'featureContainerdb';

if (Meteor.isServer) {
  console.log('publish FeatureContainerDB on server');
  Meteor.publish(FeatureContainerDB.cartaSet, sessionID => FeatureContainerDB.find({ sessionID }));
}
export default FeatureContainerDB;
