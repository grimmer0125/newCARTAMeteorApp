import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const HistogramDB = new Mongo.Collection('histogramdb');

if (Meteor.isServer) {
  console.log('publish HistogramD on server');
  Meteor.publish('histogramdb', sessionID => HistogramDB.find({ sessionID }));
}
