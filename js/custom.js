"use strict";

// generic catch for errors
window.onerror = function(message, file, line) {
  showAlert('Error gevangen: ' + file + ':' + line + '\n' + message);
  console.log('Error gevangen: ' + file + ':' + line + '\n' + message);
};

window.onresize = resizePage;

function resizePage() {
  // make sure the google map is exactly the height of the page minus the header
  document.getElementById('map_canvas').style.height = (document.documentElement.clientHeight - 42) + 'px';
  document.getElementById('page_stream').style.height = (document.documentElement.clientHeight - 42) + 'px';
}

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

function loadProjectPhotos(project) {
  doGet(
      getServiceURL("/photo/load/project/" + project),
      true,
      function(data) {
        if (data != "") {
          $(".triodosInfoWindow img")
              .unwrap('<a/>')
              .wrap('<ul class="rslides"/>')
              .wrap('<li/>');
          $(data).each(function(index, photo) {
            $(".rslides").append('<li><img src="data:image/jpeg;base64,'+photo.content+'" width="200px"/></li>');
          });
          $('.rslides').responsiveSlides({
            auto: false,
            pager: true,
            nav: true,
            speed: 500,
            maxwidth: 200,
            namespace: "centered-btns"
          });
        }
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
        var lastSeenPhotoID = getLastSeenPhotoID();

        // the first item is the newest, so remember its ID
        setLastSeenPhotoID($(newImages)[0].id);

        $(newImages).each(function (i, photo) {
          // add a nice animation to the new images
          content += '<img ';
          if (photo.id > lastSeenPhotoID) {
            content += 'class="animated fadeInDownBig" ';
          }
          content += 'src="data:image/jpeg;base64,'+photo.content+'"/>';
        });
        $(that.html(content));
        updateCountBubble(0);
      }
  );
}

function updateCountBubble(items) {
  if (items == 0) {
    $("#newPhotoCount")
        .removeClass("visible animated fadeInRight")
        .hide();
  } else {
    $("#newPhotoCount")
        .html(items)
        .addClass("visible animated fadeInRight");
  }
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


function forceUseOfInAppBrowser(anchors) {
  $(anchors).each(function(i, anchor) {
    $(anchor).attr('onclick', "openWindow(\'"+anchor.href+"\')");
    // the href tag is replaced by a #
    $(anchor).attr('href', "#");
    // remove target="_blank"
    $(anchor).attr('target', null);
  });
}

function showAlert(txt) {
  if (isMobile()) {
    navigator.notification.alert(txt, function(){}, "Melding");
  } else {
    alert(txt);
  }
}

function sanitiseKmlContent(text) {
  // replace all (relative) links (/g for global), so the links open correctly
  text = text.replace(/\"\?projectId=/g, 'http://www.triodos.nl/nl/over-triodos-bank/mijngeldgaatgoed/resultaten/?projectId=');
  // add a class to the first two divs, so we can style the meta info
  text = text.replace(/<div>/, '<div class="metaInfo">');
  return text.replace(/<div>/, '<div class="metaInfo">');
}

function extractProjectID(text) {
  // 'text' contains stuff like this: <a href="?projectId=103145&amp;locationId=1905&amp;name=stichting" target="_blank"><img src="http://projects.triodos.com/projects/nl/philosophy_of_life/3033_pola_van_der_donck_stichting/03033_L1040053.jpg" height="133" width="199"></a><a href="?projectId=103145&amp;locationId=1905&amp;name=stichting" target="_blank"><strong>Pola van der Donck Stichting</strong></a><div>Levensbeschouwing</div><div>Kampen, Nederland</div><div>In 1999 werd de Pola van der Donck Stichting opgericht. Deze stichting... <a href="?projectId=103145&amp;locationId=1905&amp;name=stichting" target="_blank">Meer&#187;</a></div>
  var startIndexString = "?projectId=";
  var startIndex = text.indexOf(startIndexString);
  var endIndexString = "&amp;";
  var endIndex = text.indexOf(endIndexString);
  return text.substring(startIndex + startIndexString.length, endIndex);
}