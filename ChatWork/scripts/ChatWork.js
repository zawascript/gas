/**
 * ChatWorkの生成
 * @constructor
 * @classdesc チャットワークAPIを叩くためのラップクラス
 * @param token {string} APIトークン
 * @param roomId {int} 投稿したい部屋のID
 * @param {int} [accountId=0] - bot自身のaccountId
 */
var ChatWork = function(token,roomId,accountId)
{
  this.token = token;
  this.roomId = roomId || 0;
  this.accountId = accountId || 0; // 自身のid
  this.headers = {
    "X-ChatWorkToken" : token
  }

  this.initQuery();

  // urlを作っておく
  this.urlBase = 'https://api.chatwork.com/v2/rooms/';
  this.url = {
    messages: this.urlBase + this.roomId + '/messages',
    tasks: this.urlBase + this.roomId + '/tasks',
    members: this.urlBase + this.roomId + '/members',
    rooms: this.urlBase
  };
}
ChatWork.prototype.initQuery = function(query)
{
  // パラメータ
  this.query = query || {
    "body" : "",
  }
}


/**
* メッセージを投稿します
* @param message {string}
* @return {bool} 成功失敗
*/
ChatWork.prototype.postMessage = function(message)
{
  this.initQuery();
  this.query.body = message;

  var options = {
    "method" : "POST",
    "headers" : this.headers,
    "payload" : this.query
  }

  var response = UrlFetchApp.fetch(this.url.messages, options) || false;


  var ret = true;
  if (!response || response.getResponseCode() != 200) {
    ret = false;
  }

  return ret;
}
/**
* 未読のメッセージを取得します
* @param {bool} [omitChabot] - 自身の投稿を省きます
* @return {Array} 未読メッセージリスト
*/
ChatWork.prototype.getUnreadMessage = function(omitChabot)
{
  this.initQuery();
  omitChabot = omitChabot || true;

  var options = {
    "method" : "GET",
    "headers" : this.headers
  }

  var response = UrlFetchApp.fetch(this.url.messages, options) || false;
  var text = '[]';
  if(response && response.getResponseCode() == 200){
    text = response.getContentText('UTF-8');
  }

  // 未読の全てのメッセージ
  var messages = JSON.parse(text);

  if(!omitChabot){
    return messages;
  }

  // 自分を除外
  var omitChabotMessages = [];

  for(var i = 0; i < messages.length; ++i)
  {
    if(messages[i].account.account_id != this.accountId){
      omitChabotMessages.push(messages[i]);
    }
  }

  return omitChabotMessages;
}
/**
* タスクを追加します
* @param body {string} タスクの内容
* @param limit {int} unix time
* @param accountIds {Array[int]} 追加するアカウントIDのリスト
*/
ChatWork.prototype.addTask = function(body,limit,accountIds)
{
  this.initQuery({"body":body,"limit":String(limit),"to_ids":accountIds.join(",")});

  var options = {
    "method" : "POST",
    "headers" : this.headers,
    "payload" : this.query
  }

  var response = UrlFetchApp.fetch(this.url.tasks, options) || false;


  var ret = true;
  if (!response || response.getResponseCode() != 200) {
    ret = false;
  }

  return ret;
}


/**
　　* 複数のルームにメンバーを一括で追加します
 * @param accountIdList {Array} 部屋に追加するアカウントIDのリスト
 * @param roomList {Array} 追加する部屋のリスト
 * @param {int} [authority=2] - 権限 1:管理者,2:メンバー,3:閲覧のみ
 * @return {bool} 全て成功したか
 */
ChatWork.prototype.addRooms = function(accountIdList ,roomList ,authority)
{
  this.initQuery({});
  authority = authority || Type.ChatWork.Authority.member;

  var allSuccess = true;
  for(var i = 0; i < roomList.length; ++i){

    var members_admin_ids = [];
    var members_member_ids = [];
    var members_readonly_ids = [];

    // urlは同じ
    var url = this.urlBase + roomList[i] + '/members';

    var options = {
      "method" : "GET",
      "headers" : this.headers,
    }

    // そのルームのメンバーを取得
    var users = null;
    var res = UrlFetchApp.fetch(url, options) || false;
    if (res && res.getResponseCode() == 200) {
       users = JSON.parse(res.getContentText('UTF-8'));
    } else {
      continue;
    }

    // 振り分け
    for(var j = 0; j < users.length;++j){
      var targetArray = getTargetArray(members_admin_ids,members_member_ids,members_readonly_ids,Type.ChatWork.Authority[users[j].role]);
      targetArray.push(users[j]["account_id"]);
    }
    // 追加
    var pushArray = getTargetArray(members_admin_ids,members_member_ids,members_readonly_ids,authority);
    for(var j =0; j < accountIdList.length; ++j){

      // 既に自分があるものは一旦消す
      splice(members_admin_ids ,accountIdList[j]);
      splice(members_member_ids ,accountIdList[j]);
      splice(members_readonly_ids ,accountIdList[j]);

      pushArray.push(accountIdList[j])
    }
    this.initQuery({
      "members_admin_ids":members_admin_ids.join(","),
      "members_member_ids":members_member_ids.join(","),
      "members_readonly_ids":members_readonly_ids.join(",")
    });
    options.method = "PUT";
    options.payload = this.query;

    var response = UrlFetchApp.fetch(url, options) || false;

    if (!response || response.getResponseCode() != 200) {
      allSuccess = false;
    }
  }

  return allSuccess;
}
/**
* 自身が所属する部屋の一覧を取得します
* @return {Array} 部屋のリスト
*/
ChatWork.prototype.getRooms = function()
{
  this.initQuery();

  var options = {
    "method" : "GET",
    "headers" : this.headers
  }

  var response = UrlFetchApp.fetch(this.url.rooms, options) || false;
  var text = '[]';
  if(response && response.getResponseCode() == 200){
    text = response.getContentText('UTF-8');
  }

  // 未読の全てのメッセージ
  var rooms = JSON.parse(text);
  return rooms;
}

function getTargetArray(adminArr,memberArr,readonlyArr,type)
{
  var targetArray = [];
  switch(type){
    case Type.ChatWork.Authority.admin:
      targetArray = adminArr;
      break;
    case Type.ChatWork.Authority.member:
      targetArray = memberArr;
      break;
    case Type.ChatWork.Authority.readonly:
      targetArray = readonlyArr;
      break;
  }
  return targetArray;
}
function splice(targetArr,accountId){
  for(var i = 0; i < targetArr.length; ++i){
    if(targetArr[i] === accountId){
      targetArr.splice(i,1);
      break;
    }
  }
}
