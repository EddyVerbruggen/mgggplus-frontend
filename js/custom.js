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

// watch the stream for new items every 10 seconds (poor man's websocket)
function checkForNewPhotos() {
  doGet(
      getServiceURL("/photo/newitemcount/" + getLastSeenPhotoID()),
      true,
      function(data) {
        updateCountBubble(data);
        setTimeout(checkForNewPhotos, 10000);
      }
  );
}

function retrieveAndShowStreamImages(element) {
  var that = $(element);
  doGet(
      getServiceURL("/photo/newitems/"+getLastSeenPhotoID()),
      true,
      function(data) {
        var newImages = data;
        var storedImages = JSON.parse(localStorage.getItem("storedImages"));
        if (storedImages != null) {
          newImages = $.merge(data, storedImages);
        }
        localStorage.setItem("storedImages", JSON.stringify(newImages));

        var content = '<div class="stream-description">Hier vindt u de meest recente project afbeeldingen gemaakt door klanten van Triodos Bank. Op de kaart kunt u zelf een foto toevoegen door een project aan te klikken en op het foto icoontje te drukken.</div>';
        $(newImages).each(function (i, photo) {
          // the first item is the newest, so remember its ID
          if (i==0) {
            setLastSeenPhotoID(photo.id);
          }
          content += '<img src="data:image/jpeg;base64,'+photo.content+'"/>';
        });
        $(that.html(content));
      }
  );
}

function updateCountBubble(items) {
  $("#newPhotoCount")
      .html(items)
      .css({'visibility':(items==0 ? 'hidden' : 'visible')});
}

function setLastSeenPhotoID(id) {
  localStorage.setItem("lastSeenPhotoID", id);
}

function getLastSeenPhotoID() {
  var lastSeenPhotoID = localStorage.getItem("lastSeenPhotoID");
  if (lastSeenPhotoID != "undefined") {
    return lastSeenPhotoID;
  } else {
    return -1;
  }
}

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