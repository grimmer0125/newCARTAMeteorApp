// import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';
//
// export const Tasks = new Mongo.Collection('tasks');

// Meteor.methods({

// 'tasks.insert'(text) {
//   check(text, String);
//
//   // Make sure the user is logged in before inserting a task
//   if (! Meteor.userId()) {
//     throw new Meteor.Error('not-authorized');
//   }
//
//   Tasks.insert({
//     text,
//     createdAt: new Date(),
//     owner: Meteor.userId(),
//     username: Meteor.user().username,
//   });
// },
// 'tasks.setChecked'(taskId, setChecked) {
//   check(taskId, String);
//   check(setChecked, Boolean);
//
//   Tasks.update(taskId, { $set: { checked: setChecked } });
// },
// });
