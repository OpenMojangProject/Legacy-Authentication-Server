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

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

document.addEventListener('DOMContentLoaded', function () {
    const jwt = getJWT();

    // Send JSON data to the server
    fetch("/auth/validate", {
        method: "POST",
        body: JSON.stringify({ "accessToken": jwt }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                deleteAllCookies();
                window.location = "index.html";
            }
        })
        .catch(error => {
            if (error.error) {
                deleteAllCookies();
                window.location = "index.html";
            }
        });
});

document.getElementById("skinUpload").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    let req = new XMLHttpRequest();
    let formData = new FormData();

    try {
        formData.append("skin", document.getElementById("skin").files[0]);
        formData.append("uuid", uuidv4());
        req.open("POST", '/auth/skins/upload');
        req.setRequestHeader("Authorization", `Bearer ${getJWT()}`);
        req.send(formData);

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                const json = JSON.parse(req.responseText);
                if (json.message !== "No file uploaded") {
                    document.getElementById("command-vanilla").textContent = `Vanilla: /skin set ${document.location.href.split('//')[0] + "//" + document.location.hostname}/${json.location}`
                    document.getElementById("command-modded").textContent = `Modded: /skin set web classic "${document.location.href.split('//')[0] + "//" + document.location.hostname}/${json.location}"`
                }
                else
                {
                    alert("Please upload a valid file.");
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
});

document.getElementById("changePassword").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    var jsonData = {};

    jsonData["accessToken"] = getJWT();
    jsonData["newPassword"] = document.forms['changePassword'].elements['newPassword'].value;

    // Create a JSON string
    var jsonString = JSON.stringify(jsonData);

    // Send JSON data to the server
    fetch("/auth/changePassword", {
        method: "POST",
        body: jsonString,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
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


document.getElementById("logout").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default form submission

    var jsonData = {};

    jsonData["accessToken"] = getJWT();

    // Create a JSON string
    var jsonString = JSON.stringify(jsonData);

    // Send JSON data to the server
    fetch("/auth/signout", {
        method: "POST",
        body: jsonString,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data === true) {
                deleteAllCookies();
                window.location = "index.html";
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
});