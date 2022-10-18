#!/bin/sh

# We should not use this file to clean out the db. We use this to insert/remove static data in mongo.
#mongo --eval 'db.useractivity.deleteMany({})' patria
#mongo --eval 'db.paymentmanagement.deleteMany({})' patria
#mongo --eval 'db.screentracking.deleteMany({})' patria
#mongo --eval 'db.references.deleteMany({})' patria
#mongo --eval 'db.user.deleteMany({})' patria
#mongo --eval 'db.userbankaccount.deleteMany({})' patria
#mongo --eval 'db.paymentschedulehistory.deleteMany({})' patria
#mongo --eval 'db.logactivity.deleteMany({})' patria
#mongo --eval 'db.employmenthistory.deleteMany({})' patria


#
#mongo --eval 'db.practicemanagement.deleteMany({})' patria
#mongoimport --mode=upsert -j 1 -d patria -c practicemanagement practicemanagement.js
#mongo --eval 'db.roles.deleteMany({})' patria
#mongoimport --mode=upsert -j 1 -d patria -c roles roles.js
#mongo --eval 'db.collectionroles.deleteMany({})' patria
#mongoimport --mode=upsert -j 1 -d patria -c collectionroles collectionroles.js
mongo --eval 'db.infotable.deleteMany({})' patria
mongoimport --mode=upsert -j 1 -d patria -c infotable infotable.js

echo "✓ Done!";
