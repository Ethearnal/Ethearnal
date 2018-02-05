var profileID = null;
getNodeData(function(nodeData) {
    $data = JSON.parse(nodeData);
    profileID = $data.guid;
    updateProfile();
});
//
function getProfileFromCache(profileID,profileKey){
    if(ertdata.guids.hasOwnProperty(profileID)){
        // has guid
        profile_o = ertdata.guids[profileID];

        if(profile_o.hasOwnProperty(profileKey)) {
            // has the property
            value= profile_o[profileKey];
            console.log('PROFILE GET FROM CACHE', profileID, profileKey, value);
            return profile_o[profileKey];
        }

    }
    return null;
}

function setProfileToCache(profileID,profileKey, value) {
    if(ertdata.guids.hasOwnProperty(profileID)) {
        //has the profile object
        profile_o = ertdata.guids[profileID];

        if(profile_o.hasOwnProperty(profileKey)){
            // has the profile key and update value
            // update in certain conditions
            // profile_o[profileKey] = value;
        }
        else {
            // don't have the property and update it;
            console.log('PROFILE SET TO CACHE', profileID, profileKey, value);
            profile_o[profileKey] = value;
        }
    }
    else {
            ertdata.guids[profileID] = {};
            ertdata.guids[profileID][profileKey] = value;
    }
}


// profileKey is for what thing you want to change.
function getProfileValue(profileID, profileKey, callback) {
    //cached_prop = getProfileFromCache(profileID, profileKey);
//    if(cached_prop !== null) {
//        // count here and update at some point
//        return cached_prop;
//    }

    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=" + profileKey,
        type: "GET",
        profile_id:profileID,
        profile_key:profileKey,
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(data_js){
            //data_o = JSON.parse(data_js);
            //setProfileToCache(this.profile_id, this.profile_key, data_o);
            callback(data_js);
        }
    });
}

function setProfileValue(profileKey, value) {
    // callback == callback || function(success) { /* do nothing */ }

    $.ajax({
        url: '/api/v1/dht/profile?profile_key=' + profileKey,
        type: "PUT",
        processData: false,
        data: JSON.stringify(value),
        contentType: 'application/json; charset=utf-8',
        success: function(success) {
            // do nothing ;
        }
    });
}