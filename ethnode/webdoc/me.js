
console.log('MY PROFLE APP');
l.load_parse_json( 'GET',
        '/api/v1/profile?q=data',
        function(profile_data){
        ethevt.on_profile_data(profile_data);}
    );
