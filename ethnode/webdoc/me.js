
console.log('MY PROFLE APP');
l.include('GET','/api/v1/profile?q=guid','ethdata.my.guid');
l.load_parse_json( 'GET',
        '/api/v1/profile?q=data',
            function(profile_data){
            ethevt.on_profile_data(profile_data);
            console.log('PROFILE DATA LOADED',profile_data)

            // l.load_html('GET','/api/v1/profile?q=html',
            // function(html_data){
            //         l.html_content('ethdata.my.html_resume', html_data);
            //     }
            // );
        }
    );
l.include('GET','/api/v1/profile?q=html','ethdata.my.html_resume');

