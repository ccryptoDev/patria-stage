#!/bin/sh

mongo --eval 'db.useractivity.deleteMany({})' patria
mongo --eval 'db.paymentmanagement.deleteMany({})' patria
mongo --eval 'db.screentracking.deleteMany({})' patria
mongo --eval 'db.references.deleteMany({})' patria
mongo --eval 'db.user.deleteMany({})' patria
mongo --eval 'db.userbankaccount.deleteMany({})' patria
mongo --eval 'db.paymentschedulehistory.deleteMany({})' patria
mongo --eval 'db.logactivity.deleteMany({})' patria
mongo --eval 'db.employmenthistory.deleteMany({})' patria

