

console.log('from me.js', ethapp)
l.load('GET','/api/v1/profile?q=data',async,function(data){
    console.log(data);
    ethapp.my.profile = JSON.parse(data);
    //console.log(ethapp.my.profile.first);
});