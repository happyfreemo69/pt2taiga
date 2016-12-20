var fs = require('fs');
var uploader = {};
var taigaApi = require('./taigaApi');

const OUTPUT_FOLDER = __dirname+'/stories/';
uploader.uploaded = function(task){
    return new Promise(function(resolve, reject){
        //console.log('check :' , __dirname+'/uploaded_'+task.id)
        return fs.exists(OUTPUT_FOLDER+task.id, function(y){
            return resolve(y);
        })
    });
}

var storyTemplate = JSON.stringify(require('./userStory.json'), null, 1);
var taigaStatus = {
    archived:6,
    loadedInTest:4,
    started:3,
    ready:2
}
//grep -oE 'current_state[^,]+' *.json |sort --uniq|cut -d':' -f3|sort --uniq
var taskMapping = {
    "accepted":  taigaStatus.archived, //chore go there
    "delivered": taigaStatus.loadedInTest,
    "finished": taigaStatus.started, //or Chore finished or accepted?
    "rejected": taigaStatus.started,
    "started":taigaStatus.started,
    "unscheduled":taigaStatus.ready,
    "unstarted":taigaStatus.ready
}
uploader.upload = function(iTask, at){
    var task = JSON.parse(storyTemplate);//clone object
    task.subject = iTask.name;
    task.description = iTask.description;
    task.tags = iTask.tags.concat(["pivotask"]);
    task.status = taskMapping[iTask.current_state] || taskMapping.ready;
    task.milestone = task.status == taigaStatus.archived? 7:null; //1 is the archived sprint, check that!

    return taigaApi.userStory.create(task, at).then(function(res){
        var fname = OUTPUT_FOLDER+iTask.id;
        console.log('written ', fname);
        fs.writeFileSync(fname, JSON.stringify(res))
        return res;
    }).catch(function(e){
        console.log('failed ', e);
        return Promise.reject(e);
    })
}
module.exports = uploader;