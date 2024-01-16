function getJWT() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('jwt=')) {
            return cookie.substring(4);
        }
    }
    return null;
}

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const jwt = getJWT();
    if (jwt) {
        window.location = "account.html";
    }
});

// JavaScript code to handle form submission
document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    console.log(document.forms['login']);

    var jsonData = {};

    jsonData["username"] = document.forms['login'].elements['identifier'].value;
    jsonData["password"] = document.forms['login'].elements['password'].value;

    // Create a JSON string
    var jsonString = JSON.stringify(jsonData);

    // Send JSON data to the server
    fetch("/auth/authenticate", {
        method: "POST",
        body: jsonString,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.accessToken) {
                setCookie('jwt', data.accessToken);
                window.location = "account.html"
            }
            else
            {
                alert(data.errorMessage);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

function setCookie(name, value, daysToExpire) {
    let cookie = name + '=' + encodeURIComponent(value);
  
    if (daysToExpire) {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
      cookie += '; expires=' + expirationDate.toUTCString();
    }
  
    document.cookie = cookie;
  }