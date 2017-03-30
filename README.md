I have existing admin api code that I've simplifile down to this for testing purposes (this works):

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
        console.log(`Txn resolution: ${resolution.committed ? 'committed' : 'NOT-COMMITTED'}`);
        if (resolution.committed) {
          // process item
          console.log(`Process: ${JSON.stringify(item)}`);
        } else {
          // assume that item must have been removed by someone else
        }
      }).catch(function (err) {
        console.log(`Txn error: ${JSON.stringify(err, null, 2)}`);
      });
    
    });

When I run:

  firebase database:push /dropbox <<<'{"test":"abc123"}'

The console output is:

    Item: {"test":"abc123"} at -KgTpp3FzgbLUrMNofNZ
    Item ref: https://cloud-function-txn-test.firebaseio.com/dropbox/-KgTpp3FzgbLUrMNofNZ
    Value: {"test":"abc123"}
    Txn resolution: committed
    Process: {"test":"abc123"}

I've been trying to move my code and this example to a cloud function. I realize that .on('child_added', f) and .onWrite(f) treat existing data differently but I can't get the transaction code to work correctly. The parameter passed to my transaction function is always null.

As a cloud function (this does not work):
    
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
        console.log(`Txn resolution: ${resolution.committed ? 'committed' : 'NOT-COMMITTED'}`);
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

For some reason, the transaction never removes the item. Log output:

    2017-03-30T10:51:19.387565284Z D receiveAndRemove: Function execution started
    2017-03-30T10:51:19.395Z I receiveAndRemove: Item: {"test":"abc123"} at -KgTpp3FzgbLUrMNofNZ
    2017-03-30T10:51:19.395Z I receiveAndRemove: Item ref: https://cloud-function-txn-test.firebaseio.com/dropbox/-KgTpp3FzgbLUrMNofNZ
    2017-03-30T10:51:19.396Z I receiveAndRemove: Value: null
    2017-03-30T10:51:19.396Z I receiveAndRemove: Txn resolution: NOT-COMMITTED
    2017-03-30T10:51:19.418446269Z D receiveAndRemove: Function execution took 32 ms, finished with status: 'ok'

Of course, the cloud function fails to remove the item and because the transaction didn't commit the remove, also doesn't process the item. I expect both to happen and I expect this code to work even when the node server version is running. The items should always be processed exactly once no matter how how many instances are running in the cloud and/or my server.

Is there some subtle difference in cloud functions I am missing? Is there something I'm doing with transactions incorrectly or that doesn't work with cloud functions?

Stack overflow: http://stackoverflow.com/questions/43116774/in-firebase-why-dont-transactions-work-in-cloud-functions-like-they-do-in-the
