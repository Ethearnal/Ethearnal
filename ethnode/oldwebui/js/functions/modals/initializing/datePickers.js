// Initializing the date picker everytime we use this function.
function datePickerInit(dateFrom, dateTo) {
    dateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
        $(this).parent().addClass('is-dirty');
    });
    dateFrom.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
        dateTo.bootstrapMaterialDatePicker('setMinDate', date);
        $(this).parent().addClass('is-dirty');
    });
}


// Same thing as above, just for gigs, so we can have FORMAT OF DD/MM/YYYY.
function datePickerInitGig(dateFrom, dateTo) {
    dateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "DD/MM/YYYY"}).on('change', function(e, date) {
        $(this).parent().addClass('is-dirty');
    });
    dateFrom.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "DD/MM/YYYY"}).on('change', function(e, date) {
        dateTo.bootstrapMaterialDatePicker('setMinDate', date);
        $(this).parent().addClass('is-dirty');
    });
}