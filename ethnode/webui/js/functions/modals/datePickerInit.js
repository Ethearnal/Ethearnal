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