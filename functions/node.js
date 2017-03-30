'use strict';

const admin = require('firebase-admin'),
    credentials = require('../.auth.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: `https://${credentials.project_id}.firebaseio.com`
});

    admin.database().ref('/dropbox').on('child_added', function (childSnap) {

      let item, itemRef = childSnap.ref;

      console.log(`Item: ${JSON.stringify(childSnap.val())} at ${childSnap.key}`);
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