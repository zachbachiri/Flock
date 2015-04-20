/*
    COOKIES.JS
    ----------
    @author:  Jimmy Ly
    @created: Apr 19, 2015
    @purpose: Provide a set of functions used to create, read, update,
              and delete browser cookies
*/

/*
    @author:  Jimmy Ly
    @created: Apr 19, 2015
    @purpose: Return the value of the browser cookie for the given key
    @param:   key - name of the key for the cookie value to be obtained
    @return:  String representing the value of the cookie with the given key
*/
var readCookie = function(key){
    // create list of cookie key/value pairs by parsing cookie string
    // "key1=val1; key2=val2;" ... into ["key1=val1", "key2=val2"]
    var cookieList = document.cookie.split(';');
    // look for the correct key/value pair based on given key
    for (var i in cookieList){
        if (cookieList[i].trim().startsWith(key + '=')){
            // return the value of the found key/value pair
            return cookieList[i].split('=')[1];
        }
    }
    return '';
};

/*
    @author:  Jimmy Ly
    @created: Apr 19, 2015
    @purpose: Set the given key/value pair into the browser cookie.
              If the key is not already in the cookie, then the key is created.
              Otherwise, the new key/value pair replaces the old key/value pair.
              The cookies will expire 5 hours after being set.
    @param:   key - String name of the key for the browser cookie key/value pair to be set
              value - String value of the value for the browser cookie key/value pair to be set
*/
var setCookie = function(key, value){
    // 5 hours in milliseconds
    var expireTime = 1000 * 60 * 60 * 5;
    var currentDate = new Date();
    currentDate.setTime(currentDate.getTime() + expireTime)
    // convert current time in milliseconds + expire time in milliseconds to UTC time
    var expires = "expires=" + currentDate.toUTCString();
    // create/set the key/value pair in the browser cookie with the expire date
    document.cookie = key + "=" + value + "; " + expires;
};

/*
    @author:  Jimmy Ly
    @created: Apr 19, 2015
    @purpose: Delete the key/value pair from the browser cookie based on the given key.
              Suggested method of deleting browser is to set the expire time of the key/value
              pair to a time in the past and the browser will consequently delete the key/value pair.
    @param:   key - String name of the key for the browser cookie key/value pair to be deleted
*/
var deleteCookie = function(key){
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
};

/*
    @author:  Jimmy Ly
    @created: Apr 19, 2015
    @purpose: Delete all Flock browser cookies
*/
var clearCookies = function(){
    var cookieList = document.cookie.split(';');
    // Iterate through and delete each Flock cookie
    for (var i in cookieList){
        deleteCookie(cookieList[i].split("=")[0]);
    }
};