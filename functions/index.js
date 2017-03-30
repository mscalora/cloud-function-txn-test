'use strict';

const functions = require('firebase-functions');

    exports.receiveAndRemove = functions.database.ref('/dropbox/{entryId}').onWrite(function (event) {

      if (!event.data.exists()) {
        return;
      }

      let item, itemRef = event.data.adminRef;

      console.log(`Item: ${JSON.stringify(event.data.val())} at ${event.data.key}`);
      console.log(`Item ref: ${itemRef.toString()}`);

      itemRef.transaction(function (value) {
        console.log(`Value: ${JSON.stringify(value)}`);
        if (value) {
          item  = value;
          return null;
        }
      }).then(function (resolution) {
        console.log(`Txn resolution: ${resolution.committed ? 'commited' : 'NOT-COMMITED'}`);
        if (resolution.committed) {
          // process item
          console.log(`Process: ${JSON.stringify(item)}`);
        } else {
          // bad to assume here that item must have been removed by someone else
        }
      }).catch(function (err) {
        console.log(`Txn error: ${JSON.stringify(err, null, 2)}`);
      });

    });