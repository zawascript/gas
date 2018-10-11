/**
 * LineMessagingApi
 * @constructor
 * @classdesc LineMessagingApiのラップクラス
 * @param accessToken {string} accessToken
 * @param replyToken {string} replyToken
 * @param channelSecret {string} WIP
 */
var LineMessagingApi = function(accessToken ,replyToken ,channelSecret){
  this.options = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + accessToken
    }
  };

  this.replyToken = replyToken;
  this.channelSecret = channelSecret || null;
  this.altText = 'スマートフォンでのみ閲覧可能なメッセージです';
  this.messageQueue = [];
}

LineMessagingApi.prototype.getImageBlob = function(messageId){
  
  var options = JSON.parse(JSON.stringify(this.options));
  options.method = 'get';
  delete options.headers['Content-Type'];
  
  return UrlFetchApp.fetch('https://api.line.me/v2/bot/message/'+messageId+'/content',options).getContent();
}

LineMessagingApi.prototype.getAudioBlob = function(messageId){
  
  var options = JSON.parse(JSON.stringify(this.options));
  options.method = 'get';
  delete options.headers['Content-Type'];
  
  return UrlFetchApp.fetch('https://api.line.me/v2/bot/message/'+messageId+'/content',options).getContent();
}



LineMessagingApi.prototype.exec = function(){
  var self = this;
  this.options.payload = JSON.stringify({
    "replyToken" : self.replyToken,
    "messages" : self.messageQueue
  });

  return UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", this.options);
}

LineMessagingApi.prototype.message = function(message)
{
  this.messageQueue.push(
      {
        "type" : "text",
        "text" : message
      });

  return this;
}

LineMessagingApi.prototype.bubble = function(buble)
{    
  this.messageQueue.push({
    "type": "flex",
    "altText": this.altText,
    "contents": buble
  });

  return this;
}

LineMessagingApi.prototype.carousel = function(contentList)
{
  if(0 < contentList.length){
    
    var msgCount = parseInt((contentList.length + 9) / 10 ,10);
    
    // carouselの最大は10なので、それ以上は分割する
    for(var i = 0; i < msgCount; ++i){
      var contents = [];
      for(var j = i*10; j < (i+1)*10 && j < contentList.length; ++j){
        contents.push(contentList[j]);
      }
      
      this.messageQueue.push({
        "type": "flex",
        "altText": this.altText,
        "contents": {
          "type": "carousel",
          "contents": contents
        }
      });
    }
  }
  return this;
}