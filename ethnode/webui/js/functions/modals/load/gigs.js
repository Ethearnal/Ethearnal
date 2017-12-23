function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/gigs/',
        dataType: 'text',
        success: function(data) {
            $data = JSON.parse(data);

            // $(data).each(function(key, value) {
            //     console.log(key);
            // })

            // $data2 = JSON.stringify($data[0]);

            // $data2Parsed = JSON.parse($data2);


            // $data3 = JSON.stringify($data2Parsed);

            // console.log($data3)



            // for (var key in $data) {
            //     console.log("key " + key + " has value " + $data[key]);
            // }

            // console.log($data.toString());

            // loadGigsOnAjaxSuccess($data[i], false);
        }
    });
}

// Initializing function on website load
loadGigs();