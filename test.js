const _ = require('lodash'); 

var arr1 = [{'a' : 1}, {'b':22}];
var arr2 = [{'c' : 1}, {'b':22}];

console.log(_.differenceWith(arr2, arr1, _.isEqual))

// var b = arr1.filter((e) => {
//     if(arr2.indexOf(e) === -1)
//         return e;
// });

// a = []

// for(let i = 0; i < arr1.length; i++){
//     if
// }


// console.log('arr1 ', a);
// console.log('arr2 ', b);