"use strict";

var sourceType, project = null;

function captureImage() {
  // see http://docs.phonegap.com/en/2.5.0/cordova_camera_camera.md.html
  navigator.camera.getPicture(onSuccessCamera, onFailCamera, {
    quality:50,
    allowEdit:false, // ignored by Android and when true: iOS images are square
    destinationType:Camera.DestinationType.DATA_URL, // base64
    encodingType:Camera.EncodingType.JPEG,
    sourceType:sourceType, // camera or photoroll, depending on user choice
    targetWidth:400, // = double size for retina
    targetHeight:300
  });
}

function onSuccessCamera(imageData) {
  doPost(
    getServiceURL("/photo/save"),
    {
      'projectref' : project,
      'content' : imageData
    },
    true,
    function(data) {
        var greatSuccess = imageData.byteLength > 1024;
      showAlert("De afbeelding is met " + (greatSuccess ? " groot" : "") + " succes opgeslagen op de server!");
    }
  );
}

function onFailCamera(message) {
  showAlert("Er is een probleem met de camera. Details: " + message);
}

function cameraIconClicked(projectID) {
  project = projectID;

  if (isMobile()) {
    // see http://docs.phonegap.com/en/2.5.0/cordova_notification_notification.md.html
    navigator.notification.confirm(
        'Deel een leuke foto van dit project. TIP: houd je telefoon horizontaal.', // message
        onConfirmNew, // callback to invoke with index of button pressed
        'Foto toevoegen', // title
        'Foto maken,Foto kiezen,Annuleren'  // buttonLabels
    );
  } else {
    showAlert("Dit kan alleen op mobiel");
  }
}

function onConfirmNew(buttonIndex) {
  if (buttonIndex == 1) { // index starts at 1
    sourceType = Camera.PictureSourceType.CAMERA;
    captureImage();
  } else if (buttonIndex == 2) {
    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
    captureImage();
  } else {
    // cancelled
  }
}