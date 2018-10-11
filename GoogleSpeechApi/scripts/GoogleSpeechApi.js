/**
 * GoogleSpeechApi
 * @constructor
 * @classdesc SpeechApiのラップクラス
 * @param apiKey {string} apiKey
 */
var GoogleSpeechApi = function(apiKey){
  this.apiKey = apiKey;
}

GoogleSpeechApi.prototype.speechToText = function(base64EncodedAudio){
  var body = {
    'config': {
      'encoding': 'FLAC',
      'languageCode': 'ja'
    },
    'audio': {
      'content': base64EncodedAudio
    }
  };
  
  var head = {
    "method":"POST",
    "contentType":"application/json",
    "payload":JSON.stringify(body)
  };
  return JSON.parse(UrlFetchApp.fetch('https://speech.googleapis.com/v1/speech:recognize?key='+this.apiKey, head));
}