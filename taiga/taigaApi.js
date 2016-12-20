var taiga = {};
var http = require('http');
taiga.userStory ={};

/*
{
    "assigned_to": null,
    "description": "{{OK afeffaff}}",
    "is_closed": true,
    "project": 1,
    "status": 2, //6 archived, 4 ready for test, status 5 done, 9 loaded in prd
    "milestone":6, //the sprint in which the userStory will be set
    "subject": "{{API2}}",
    "tags": ["test"],
    "watchers": []
}
 */
taiga.userStory.create = function(us, at){
    return new Promise(function(resolve, reject){
        var data = JSON.stringify(us,null,2);

        var req = http.request({
            method:'POST',
            path:'/api/v1/userstories',
            hostname:'localhost',
            port:8000,
            headers:{
                'Content-Type':'application/json',
                'content-length': Buffer.byteLength(data, 'utf-8'),
                'Authorization': 'Bearer '+at
            }
        }, function(res){
            var data = '';
            res.on('data', function(chunk){
                if(res.statusCode != 200 && res.statusCode != 201){
                    return reject(data);
                }
                data += chunk.toString();
            });
            res.on('end', function(){
                try{
                    var json = JSON.parse(data);
                    return resolve(json);
                }catch(e){
                    console.log('error ', e, data);
                    return reject('FPHOQUE '+ e);
                }
            })
        });
        req.on('error', reject);
        req.write(data);
    });
}


module.exports = taiga;