/**
 * name : utils.js
 * author : Rakesh kumar
 * Date : 17-March-2020
 * Description : All utility functions.
 */

 /**
  * convert string to camelCaseToTitleCase.
  * @function
  * @name camelCaseToTitleCase
  * @param {String} in_camelCaseString - String of camel case.
  * @returns {String} returns a titleCase string. ex: helloThereMister, o/p: Hello There Mister
*/

function camelCaseToTitleCase(in_camelCaseString) {
  var result = in_camelCaseString // "ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
    .replace(/([a-z])([A-Z][a-z])/g, "$1 $2") // "To Get YourGEDIn TimeASong About The26ABCs IsOf The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times IsNot AsEasy As123ForC3POOrR2D2Or2R2D"
    .replace(/([A-Z][a-z])([A-Z])/g, "$1 $2") // "To Get YourGEDIn TimeASong About The26ABCs Is Of The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([a-z])([A-Z]+[a-z])/g, "$1 $2") // "To Get Your GEDIn Time ASong About The26ABCs Is Of The Essence But APersonal IDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([A-Z]+)([A-Z][a-z][a-z])/g, "$1 $2") // "To Get Your GEDIn Time A Song About The26ABCs Is Of The Essence But A Personal ID Card For User456In Room26A ContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
    .replace(/([a-z]+)([A-Z0-9]+)/g, "$1 $2") // "To Get Your GEDIn Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3POOr R2D2Or 2R2D"

    // Note: the next regex includes a special case to exclude plurals of acronyms, e.g. "ABCs"
    .replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"
    .replace(/([0-9])([A-Z][a-z]+)/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC 26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"

    // Note: the next two regexes use {2,} instead of + to add space on phrases like Room26A and 26ABCs but not on phrases like R2D2 and C3PO"
    .replace(/([A-Z]{2,})([0-9]{2,})/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
    .replace(/([0-9]{2,})([A-Z]{2,})/g, "$1 $2") // "To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
    .trim();

  // capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}


 /**
  * Convert string from hyphen case to camelCase.
  * @function
  * @name hyphenCaseToCamelCase
  * @param {String} string - String in hyphen case.
  * @returns {String} returns a camelCase string.
*/

function hyphenCaseToCamelCase(string) {
  return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

 /**
  * convert string to lowerCase.
  * @function
  * @name lowerCase
  * @param {String} str 
  * @returns {String} returns a lowercase string. ex: HELLO, o/p: hello
*/

function lowerCase(str) {
  return str.toLowerCase()
}

 /**
  * check whether the given string is url.
  * @function
  * @name lowerCase
  * @param {String} str 
  * @returns {Boolean} returns a Boolean value. ex:"http://example.com:3000/pathname/?search=test" , o/p:true
*/

function checkIfStringIsUrl(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

 /**
  * Convert camel case to capitalize case.
  * @function
  * @name camelCaseToCapitalizeCase
  * @param {String} str 
  * @returns {String} Capitalize string 
*/

function camelCaseToCapitalizeCase(str) {
  let capitalize = str.replace( /([A-Z])/g, " $1" );
  return capitalize.charAt(0).toUpperCase() + capitalize.slice(1);
}

/**
  * sort Array Of Objects  by key .
  * @function
  * @name sortArrayOfObjects
  * @param {String} key and Order
  * @returns {Object} array of objects 
*/

function sortArrayOfObjects(key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

module.exports = {
  camelCaseToTitleCase : camelCaseToTitleCase,
  lowerCase : lowerCase,
  checkIfStringIsUrl : checkIfStringIsUrl,
  hyphenCaseToCamelCase : hyphenCaseToCamelCase,  
  camelCaseToCapitalizeCase : camelCaseToCapitalizeCase,
  sortArrayOfObjects:sortArrayOfObjects
};
