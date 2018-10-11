/**
 * CloudConvertApi
 * @constructor
 * @classdesc CloudConvertApiApiのラップクラス
 * @param apiKey {string} apiKey
 * @url https://cloudconvert.com/api
 */
var CloudConvertApi = function(apiKey){
  this.apiKey = apiKey;
}

CloudConvertApi.prototype.m4aToFlac = function(m4a){
  var options = {
    "method":"POST",
    "contentType":"application/json",
    "payload":JSON.stringify({
      "apikey": this.apiKey,
      "inputformat": "m4a",
      "outputformat": "flac",
      "input": "base64",
      "filename":String(new Date())+'.m4a',
      "wait": true,
      "download": "inline",
      "file":Utilities.base64Encode(m4a),
      "converteroptions":{
        "audio_codec":"FLAC",
        "audio_frequency":16000,
        "audio_channels":1,
        "audio_bitrate": 16
      }
    })
  };
  
  return UrlFetchApp.fetch('https://api.cloudconvert.com/convert', options).getContent();
}