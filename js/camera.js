"use strict";

var clickedImage, sourceType, project = null;

function captureImage() {
  navigator.camera.getPicture(onSuccessCamera, onFailCamera, {
    quality:50,
    allowEdit:true, // ignored by Android
    destinationType:Camera.DestinationType.DATA_URL, // base64
    encodingType:Camera.EncodingType.JPEG,
    sourceType:sourceType, // camera or photoroll, depending on user choice
    targetWidth:398, // = double size for retina
    targetHeight:266
  });
}

function onSuccessCamera(imageData) {
  var theImage = "data:image/jpeg;base64," + imageData;

//  $.mobile.loading('show');
  // Set a delay so the spinner appears
  $(clickedImage).attr('src', theImage); // TODO move to successfunction
  setTimeout(function() {
    doPost(
      getServiceURL("/user/savephoto"),
      {
        'project' : project,
        'photo' : imageData
      },
      true,
      function(data) {
        if (data.success) {
          // change the image in the view
          showAlert("Op de server opslaan is gelukt");
//          $.mobile.loading('hide');
        } else {
          showAlert("Op de server opslaan is mislukt");
//          $.mobile.loading('hide');
        }
      }
    );
  }, 250);
}

function onFailCamera(message) {
  if (message == "no camera available") {
    navigator.notification.alert("Er is geen geschikte camera gevonden.", {}, "Probleempje..", "Sluiten");
  }
}

function cameraIconClicked(projectId, theElement) {
//  alert($(theElement).attr('src'));
  project = projectId;
  clickedImage = theElement;

  if (isMobile()) {
    navigator.notification.confirm(
        'U kunt de foto later altijd veranderen.', // message
        onConfirmNew, // callback to invoke with index of button pressed
        'Foto toevoegen', // title
        'Foto maken,Foto kiezen,Annuleren'  // buttonLabels
    );
  } else {
    alert("Dit kan alleen op mobiel");
  }
}

function onConfirmNew(buttonIndex) {
  if (buttonIndex == 1) {    // index starts at 1
    sourceType = Camera.PictureSourceType.CAMERA;
    captureImage();
  } else if (buttonIndex == 2) {
    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
    captureImage();
  } else {
    // cancelled
  }
}