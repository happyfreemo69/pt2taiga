#Basic importer

Not the most sexy one. Adapt to your need fork or whatever.
Purpose is to allow the migration from pivotaltracker to taiga.

What it does is:

- fetch the PT userstories, bugs and chores (./pivofetch.sh)
- map them to taiga userstories (./convert.js, taigaUploader.js)
- import them into taiga. (./taigaApi.js)

requirements:

- the mapping of task statuses from PT to taiga
- access token of pivotal and taiga
- the taiga default sprint id (in which imported task of archived status will be set) (you must create one in taiga)


## 0. set your accessToken as env

    export PIVOTOKEN='yourpivotaltrackertoken';
    export TAIGATOKEN='yourtaigatoken';

## 1. fetch the PT user ids

```
./accounts.sh
```

## 2. fetch the PT stories
```
./pivofetch.sh
```

They are retrieved as bulk, so for n stories, there is a bulkId.json generated.

## 3. import the bulkId.json to taiga

- in taiga./taigaApi.js

modify eventually hostname and port (although in localhost the import would be faster...)

- in taiga/taigaUploader.js

define the taskStatus mapping from pivotal (a string, respectively accepted, etc) to taiga (an int).

To get taiga's enums corresponding to your statuses, you may observe the PATCH made when moving one taiga story from one column to one another.

    var taigaStatus = {
        archived:6,
        loadedInTest:4,
        started:3,
        ready:2
    }
    var taskMapping = {
        "accepted":  taigaStatus.archived, //chore go there
        "delivered": taigaStatus.loadedInTest,
        "finished": taigaStatus.started,
        "rejected": taigaStatus.started,
        "started":taigaStatus.started,
        "unscheduled":taigaStatus.ready,
        "unstarted":taigaStatus.ready
    }

then import your bulkId.json
```
node convert -i 0.json
```
