"use strict";

var sourceType, project = null;

function captureImage() {
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
      showAlert("De afbeelding is met groot succes opgeslagen op de server!");
    }
  );
}

function onFailCamera(message) {
  if (message == "no camera available") {
    navigator.notification.alert("Er is geen geschikte camera gevonden.", {}, "Probleempje..", "Sluiten");
  }
}

function cameraIconClicked(projectID) {
  project = projectID;

  if (isMobile()) {
    navigator.notification.confirm(
        'Deel een leuke foto van dit project. TIP: houd je telefoon horizontaal.', // message
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