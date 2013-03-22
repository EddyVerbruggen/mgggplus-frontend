"use strict";

var clickedImage, sourceType, project = null;

function captureImage() {
  navigator.camera.getPicture(onSuccessCamera, onFailCamera, {
    quality:50,
    allowEdit:true, // ignored by Android
    destinationType:Camera.DestinationType.DATA_URL, // base64
    encodingType:Camera.EncodingType.JPEG,
    sourceType:sourceType, // camera or photoroll, depending on user choice
    targetWidth:400, // = double size for retina
    targetHeight:400 // 266
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
      // change the image in the view
      showAlert("De afbeelding is met groot succes opgeslagen op de server!");
      // show the image immediately
      $(clickedImage).attr('src', "data:image/jpeg;base64," + imageData);
    }
  );
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