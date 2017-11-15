import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const HistogramDB = new Mongo.Collection('histogramdb');
HistogramDB.cartaSet = 'histogramdb';

if (Meteor.isServer) {
  console.log('publish HistogramD on server');
  Meteor.publish(HistogramDB.cartaSet, sessionID => HistogramDB.find({ sessionID }));
}
export default HistogramDB;
