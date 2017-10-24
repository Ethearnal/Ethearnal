console.log('PEERS APP');

var nodes = null;
var edges = null;
var network = null;

var draw  =  function() {
      // create people.
      // value corresponds with the age of the person
      nodes = [
        {id: 1,  value: 25,  label: 'Ramy' },
        {id: 2,  value: 31, label: 'Riya'},
        {id: 3,  value: 25, label: 'Stan'},
        {id: 5,  value: 25, label: 'Vlad' },
        {id: 7,  value: 25, label: 'Doby'},
        {id: 6,  value: 25,  label: 'Romn'},
        {id: 8,  value: 35,  label: 'Vity'},

      ];

      // create connections between people
      // value corresponds with the amount of contact between two people
      edges = [
        {from: 1, to: 8, value: 3, title: '3 emails per week'},
        {from: 1, to: 5, value: 3, title: '3 emails per week'},
        {from: 2, to: 5, value: 3, title: '3 emails per week'},
        {from: 2, to: 5, value: 5, title: '5 emails per week'},
        {from: 7, to: 1, value: 5, title: '5 emails per week'},
        {from: 5, to: 7, value: 2, title: '2 emails per week'},
        {from: 8, to: 6, value: 5, title: '5 emails per week'},
        {from: 6, to: 3,value: 2, title: '2 emails per week'},
        {from: 8, to: 5,value: 2, title: '2 emails per week'},
        {from: 8, to: 6,value: 2, title: '2 emails per week'},
        {from: 2, to: 3, value: 6, title: '6 emails per week'},

        {from: 5, to: 3, value: 1, title: '1 emails per week'},
        {from: 2, to: 7, value: 4, title: '4 emails per week'}
      ];

      // Instantiate our network object.
      var container = document.getElementById('mynetwork');
      var data = {
        nodes: nodes,
        edges: edges
      };
      var options = {
        nodes: {
          shape: 'dot',
          scaling:{
            label: {
              min:8,
              max:20
            }
          }
        }
      };
      network = new vis.Network(container, data, options);
    };

 /* boot vis js */
 /* draw(); */
 draw();
