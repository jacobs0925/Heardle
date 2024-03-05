var isLoggedIn = false

function setCookie(cookieName, cookieMap)   
{
    var cookieValue = JSON.stringify(cookieMap);
    var today = new Date();
    var midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0); // Calculate midnight of the next day
    var expiration = midnight.toUTCString(); // Convert to UTC string format

    var cookie = encodeURIComponent(cookieName) + "=" + encodeURIComponent(cookieValue) + "; expires=" + expiration + "; path=/";

    document.cookie = cookie;
}

function getCookie(cookieName)
{
    var name = encodeURIComponent(cookieName) + "=";
    var cookieArray = document.cookie.split(';');
    var cookie = cookieArray[0].trim();

    cookieArray.forEach(function (subcookie)
    {
        var current = subcookie.trim();
        if (current.indexOf(name) != -1)
        {
            cookie = current;
        }
    });

    if (cookie.indexOf(name) === 0)
    {
        var jsonValue = decodeURIComponent(cookie.substring(name.length));
        var value = JSON.parse(jsonValue); // Convert JSON string to map object
        return value;
    }

    return null;
}

function removeCookie(cookieName) 
{
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function setLogged(loginState)
{
    isLoggedIn = loginState
}

function getLogged()
{
    return isLoggedIn
}

export { setCookie, getCookie, removeCookie, setLogged, getLogged }