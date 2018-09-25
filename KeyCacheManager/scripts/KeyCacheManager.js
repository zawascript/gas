/**
 * KeyCacheManagerの生成
 * @constructor
 * @classdesc GoogleDriveのcacheフォルダにSheetAccesserの結果をキャッシュし、高速なアクセスを提供します。
 * @param spSheetId {string} スプレッドシートID
 */
var KeyCacheManager = function(spSheetId)
{
  this.spSheet = SpreadsheetApp.openById(spSheetId);
  this.cacheTable = {};
}

/**
 * 指定したユニークなキーからCacheを取得します
 * @param tableName {string} 対象のシート名
 * @param keys {Array[string]} キーとするカラムのリスト
 * @return {Object} 引数のキーリストを「_」で繋いだ値をキーとするオブジェクト
 */
KeyCacheManager.prototype.getCacheMap = function(tableName ,keys)
{
  if(tableName in this.cacheTable){
    // ①自身がキャッシュを保持していればそれを返す
      Logger.log('自身のキャッシュから返却します');
  } else{
    // ②自身はキャッシュしてないけどドライブにあればそれを返す
    var map = null;
    var folderItr = DriveApp.getFoldersByName('cache');
    while(folderItr.hasNext()) {
      var folder = folderItr.next();
      var fileItr = folder.getFilesByName(tableName+'.json');
      while(fileItr.hasNext()){
        var file = fileItr.next();
        map = JSON.parse(file.getBlob().getDataAsString());
      }
    }

    // ③それもなければキャッシュ作る
    if(!map){
      map = this.createCacheMap(tableName ,keys);
    } else {
      Logger.log('ドライブからキャッシュを取得します');
    }

    this.cacheTable[tableName] = map;
  }
  return this.cacheTable[tableName];
}

/**
 * 指定したユニークなキーからCacheを生成します
 * @param tableName {string} 対象のシート名
 * @param keys {Array[string]} キーとするカラムのリスト
 * @return {Object} 引数のキーリストを「_」で繋いだ値をキーとするオブジェクト
 */
KeyCacheManager.prototype.createCacheMap = function(tableName ,keys)
{
  if(!keys){
    Logger.log('キャッシュのキーが定義されていません：'+JSON.stringify(keys));
  }

  Logger.log(tableName+'のキャッシュを作成します');
  var map = {};

  var gcdm = new SheetAccesser(this.spSheet.getId());
  var values = gcdm.getAllValues(tableName);

  var nameIdxMap = gcdm.getNameIndexMap(tableName);

  for(var i = 0,iLen = values.length; i < iLen; ++i){
    var keyName = '';
    for(var j = 0,jLen = keys.length; j < jLen; ++j){
      if(j !== 0){
        keyName += '_';
      }
      keyName += values[i][nameIdxMap[keys[j]]];
    }
    map[keyName] = values[i];
  }

  // フォルダ取得
  var folderItr = DriveApp.getFoldersByName('cache');
  while(folderItr.hasNext()){
    var folder = folderItr.next();
    var oldFileItr = folder.getFiles();
    // 古いファイルの削除
    while(oldFileItr.hasNext()){
      var file = oldFileItr.next();
      if(file.getName() === (tableName+'.json')){
        folder.removeFile(file);
      }
    }
    folder.createFile(tableName+'.json', JSON.stringify(map));
  }

  return map;
}
