/**
 * GoogleVisionApi
 * @constructor
 * @classdesc VisionApiのラップクラス
 * @param apiKey {string} apiKey
 */
var GoogleVisionApi = function(apiKey){
  
  this.apiKey = apiKey;
}

GoogleVisionApi.prototype.textDetection = function(base64EncodedImg){
  var body = {
    "requests":[
      {
        "image":{
          "content": base64EncodedImg
        },
        "features":[
          {
            "type":"TEXT_DETECTION",
            "maxResults":1
          }
        ],
        "imageContext":{
        "languageHints":["ja"]
        }
      }
    ]
  };
  
  var head = {
    "method":"POST",
    "contentType":"application/json",
    "payload":JSON.stringify(body)
  };
  
  return JSON.parse(UrlFetchApp.fetch('https://vision.googleapis.com/v1/images:annotate?key='+this.apiKey, head));
}