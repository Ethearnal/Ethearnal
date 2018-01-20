var reputationValue = 0;

var budgetSliderFromValue = 0;
var budgetSliderToValue = 5000;


// BUDGET SLIDER
$(function() {

  // Initiate Slider
  $('#slider-range').slider({
    range: true,
    min: 0,
    max: 10000,
    step: 50,
    values: [budgetSliderFromValue, budgetSliderToValue]
  });



  // Move the range wrapper into the generated divs
  $('.ui-slider-range').append($('.range-wrapper'));

  // Apply initial values to the range container
  $('.range').html('<span class="range-value"><sup>$</sup>' + $('#slider-range').slider("values", 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span><span class="range-divider"></span><span class="range-value"><sup>$</sup>' + $("#slider-range").slider("values", 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span>');

  // Show the gears on press of the handles
  $('.ui-slider-handle, .ui-slider-range').on('mousedown', function() {
    $(this).parent().parent().find('.gear-large').addClass('active');
  });



  // Hide the gears when the mouse is released
  // Done on document just incase the user hovers off of the handle
  $(document).on('mouseup', function() {
    if ($('.gear-large').hasClass('active')) {
      $('.gear-large').removeClass('active');
    }
  });

  // Rotate the gears
  var gearOneAngle = 0,
    gearTwoAngle = 0,
    rangeWidth = $('.ui-slider-range').css('width');

  $('.gear-one').css('transform', 'rotate(' + gearOneAngle + 'deg)');
  $('.gear-two').css('transform', 'rotate(' + gearTwoAngle + 'deg)');

  $('#slider-range').slider({
    slide: function(event, ui) {

      // Update the range container values upon sliding
      $('.range').html('<span class="range-value"><sup>$</sup>' + ui.values[0].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span><span class="range-divider"></span><span class="range-value"><sup>$</sup>' + ui.values[1].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span>');

      // Get old value
      var previousVal = parseInt($(this).data('value'));

      // Save new value
      $(this).data({
        'value': parseInt(ui.value)
      });

      budgetSliderFromValue = ui.values[0];
      budgetSliderToValue = ui.values[1];

      clearTimeout(Timer);
      //Timer = setTimeout(SendRequestBudget, 400);

      // Figure out which handle is being used
      if (ui.values[0] == ui.value) {

        // Left handle
        if (previousVal > parseInt(ui.value)) {
          // value decreased
          gearOneAngle -= 7;
          $('.gear-one').css('transform', 'rotate(' + gearOneAngle + 'deg)');
        } else {
          // value increased
          gearOneAngle += 7;
          $('.gear-one').css('transform', 'rotate(' + gearOneAngle + 'deg)');
        }

      } else {

        // Right handle
        if (previousVal > parseInt(ui.value)) {
          // value decreased
          gearOneAngle -= 7;
          $('.gear-two').css('transform', 'rotate(' + gearOneAngle + 'deg)');
        } else {
          // value increased
          gearOneAngle += 7;
          $('.gear-two').css('transform', 'rotate(' + gearOneAngle + 'deg)');
        }

      }

      if (ui.values[1] === 10000) {
        if (!$('.range-alert').hasClass('active')) {
          $('.range-alert').addClass('active');
        }
      } else {
        if ($('.range-alert').hasClass('active')) {
          $('.range-alert').removeClass('active');
        }
      }
    }
  });

  // Prevent the range container from moving the slider
  $('.range, .range-alert').on('mousedown', function(event) {
    event.stopPropagation();
  });

});


//
//
// REPUTATION SLIDER
//
// $(function() {
//
//   // Initiate Slider
//   $('#slider-range-2').slider({
//     range: "min",
//     min: 0,
//     max: 5000,
//     step: 25,
//     value: 0,
//
//     // SLIDE FUNCTION
//     slide: function(event, ui) {
//
//       // Show the gears on press of the handles
//       $(this).find('.ui-slider-handle, .ui-slider-range').on('mousedown', function() {
//           $(this).parent().parent().find('.gear-large-2').addClass('active');
//       });
//
//       // Update the range container values upon sliding
//       $('.range-2').html('<span class="range-divider-2"></span><span class="range-value-2"><sup><i class="material-icons">polymer</i></sup>' + ui.value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span>');
//
//       // Get old value
//       var previousVal = parseInt($(this).data('value'));
//
//       // Save new value
//       $(this).data({
//         'value': parseInt(ui.value)
//       });
//
//       reputationValue = ui.value;
//
//       clearTimeout(Timer);
//       Timer = setTimeout(SendRequestReputation, 400);
//     }
//   });
//
//   // Move the range wrapper into the generated divs
//   $('.ui-slider-range-2').append($('.range-wrapper-2'));
//
//   // Apply initial values to the range container
//   $('.range-2').html('<span class="range-divider-2"></span><span class="range-value-2"><sup><i class="material-icons">polymer</i></sup>' + $("#slider-range-2").slider("values", 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span>');
//
//
//   // Prevent the range container from moving the slider
//   $('.range-2, .range-alert-2').on('mousedown', function(event) {
//     event.stopPropagation();
//   });
//
// });