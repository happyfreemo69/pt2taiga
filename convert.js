#!/usr/bin/node
var fs = require('fs');
var taigaUploader = require('./taiga/taigaUploader');
var optimist = require('optimist')
    .usage('$0: node app -i pivo.json -o folder')
    .options('i', {
        alias : 'input',
        type:'string',
        describe:'file containing json stories of pivotal'
    })
    .options('t', {
        alias : 'taigatoken',
        type:'string',
        describe:'taigatoken to make the api call',
    })
    .demand('input', 'output');

var argv = optimist.argv;
if(argv.help){
    optimist.showHelp()
    process.exit(0);
}

var ifname = argv.input;
var tasks = require('./'+ifname);
var accounts = require('./accounts.json');
/*
 { kind: 'project_membership',
    id: 7635505,
    created_at: '2016-10-06T16:01:41Z',
    updated_at: '2016-10-06T16:07:27Z',
    person:
     { kind: 'person',
       id: 2155751,
       name: 'sponge bob',
       email: 'spongebob@citylity.com',
       initials: 'ap',
       username: 'aureliepetitjean' },
    project_id: 1452050,
    role: 'owner',
    project_color: 'ffc100',
    favorite: false,
    last_viewed_at: '2016-10-06T16:07:27Z',
    wants_comment_notification_emails: true,
    will_receive_mention_notifications_or_emails: true }
 */
function username(id){
    const personIdToName = accounts.reduce((acc,x)=>{
        acc[x.person.id] = x.person.name;
        return acc;
    },{});
    //in case people left pivotal, hardcoded, but maybe still existing in pivotal api. keep it simple
    personIdToName[1827946] = 'corentinpacaud';
    personIdToName[1833390] = 'napoleon';
    personIdToName[1833422] = 'guillaumechave';
    personIdToName[1833386] = 'amandineferrand';
    personIdToName[1834874] = 'jeremiegaudry';

    var res = personIdToName[id]||'someone who left';
    return res;
}


/*
{
    "id": 106313824,
    "updated_at": "2016-03-08T18:43:13Z",
    "story_type": "bug",
    "name": "[Vote] Faute d'ortho",
    "description": "Gérer les vote**s**. A corriger.\nVoir PJ\n",
    "current_state": "accepted",
    "requested_by_id": 1827944,
    "labels": [
        {
            "id": 13088218,
            "project_id": 1452050,
            "kind": "label",
            "name": "bo",
            "created_at": "2015-10-20T07:54:49Z",
            "updated_at": "2015-10-20T07:54:49Z"
        }
    ],
    "tasks": [],
    "comments": [
        {
            "kind": "comment",
            "id": 115530054,
            "person_id": 1827944,
            "created_at": "2015-10-22T15:31:50Z",
            "updated_at": "2015-10-22T15:31:50Z",
            "story_id": 106313824
        },
        {
            "kind": "comment",
            "id": 115609036,
            "text": "c'est corrigé sur dev, la prochaine version",
            "person_id": 1827946,
            "created_at": "2015-10-23T06:12:13Z",
            "updated_at": "2015-10-23T06:12:13Z",
            "story_id": 106313824
        }
    ]
}
 */

var p = Promise.resolve();
tasks.slice(0).forEach(task=>{
    task.tags = task.labels.map(x=>x.name);
    task.description = ['user: '+username(task.requested_by_id)+'\n'+task.description].concat(task.comments.reduce((acc,comment)=>{
        if(!comment.text){return acc;}
        var date = comment.date;
        return acc.concat('user: '+username(comment.person_id)+'|'+comment.updated_at+'\n'+comment.text.trim())
    }, [])).join('<hr/>');
    if(JSON.stringify(task).indexOf('someone who left')!=-1){
        console.log('SOMEONE UNKNOWN ', task.id);
    }
    p = p.then(function(){
        return taigaUploader.uploaded(task).then(y=>{
            if(y){
                return console.log('nothing to do '+task.id);
            }
            return taigaUploader.upload(task, argv.taigatoken || process.env.TAIGATOKEN);
        });
    }).catch(function(e){
        console.log('e :', e)
        return Promise.resolve();
    })
});
