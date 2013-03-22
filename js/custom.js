"use strict";

// generic catch for errors
window.onerror = function(message, file, line) {
  showAlert('Error gevangen: ' + file + ':' + line + '\n' + message);
  console.log('Error gevangen: ' + file + ':' + line + '\n' + message);
};

function isAndroid() {
  return navigator.userAgent.toLowerCase().indexOf("android") > -1;
}

function isIOS() {
  return navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
}

function isMobile() {
  return isIOS() || isAndroid();
}

function getServiceURL(servicePath) {
  if (true || isMobile()) {
    return "http://mgggplus-backend.herokuapp.com" + servicePath;
  } else {
    // localhost can be used while developing the backend
    return "http://localhost:9000" + servicePath;
  }
}

function doPost(url, data, async, successFunction) {
  invokeRemote('POST', url, data, async, successFunction);
}

function doGet(url, async, successFunction) {
  invokeRemote('GET', url, null, async, successFunction);
}

function invokeRemote(method, url, data, async, successFunction) {
  $.ajax({
    type : method,
    url  : url,
    data : data,
    dataType : 'json',
    async: async,
    success : function(data) {
                successFunction(data);
              },
    error : function(XMLHttpRequest, textStatus, errorThrown) {
              if (XMLHttpRequest.status == 0) {
                showAlert("Server onbereikbaar " + errorThrown);
              } else {
                showAlert("Service failed: " + url + ", " + textStatus + "; " + errorThrown);
              }
            }
  });
}

function getPhoto(person) {
  if (person.mobileUser != null && person.mobileUser.photoContent != null) {
    return "data:image/jpeg;base64,"+person.mobileUser.photoContent;
  } else if (person.photoContent != null) {
    return "data:image/jpeg;base64,"+person.photoContent;
  } else if (person.gender == "MALE") {
    return "img/pasfoto/male.jpeg";
  } else if (person.gender == 'FEMALE') {
    return "img/pasfoto/female.jpeg";
  } else {
    return "img/pasfoto/empty.gif";
  }
}

//function savePersons(persons) {
//  localStorage.setItem("persons", persons);
//}

//function loadPersons() {
//  return localStorage.getItem("persons");
//}

//function addRequestsToCache(requests) {
//  localStorage.setItem("requests", JSON.stringify(requests));
//}

//function loadRequests() {
//  var storedRequests = localStorage.getItem("requests");
//  if (storedRequests != "undefined") {
//    return JSON.parse(storedRequests);
//  } else {
//    return null;
//  }
//}

//function retrieveRequestsFromServer(successCallback) {
//  doGet(
//      getServiceURL("/request/list"),
//      true,
//      function(data) {
//        if (data.success) {
//          if (successCallback != null) {
//            successCallback(data.output);
//          }
//        }
//      }
//  );
//}

function openWindow(pleaseTakeMeHere) {
  // window.open uses the PG InAppBrowser API (http://docs.phonegap.com/en/2.5.0/cordova_inappbrowser_inappbrowser.md.html)
  var ref = window.open(pleaseTakeMeHere, '_blank', 'location=no');
  // Programmatically closing the InAppBrowser clears its history.
  ref.addEventListener('exit', function() {
    ref.close();
  });
}

function showAlert(txt) {
  if (isMobile()) {
    navigator.notification.alert(txt, function(){}, "Melding");
  } else {
    alert(txt);
  }
}