/**
 * SheetAccesserの生成
 * @constructor
 * @classdesc 特定のフォーマットで記載されたスプレッドシートを操作するため便利のクラス
 * @param spreadSheeetId {string} 対象のスプレッドシート
 */
var SheetAccesser = function (spreadSheeetId) {
  this.spSheet = SpreadsheetApp.openById(spreadSheeetId);
  this.valuesCache = {};
}

/**
 * シートの項目名と列番号を紐付けたマップを生成します。
 * @param tableName {string} シートの名前
 * @return {Object} {column1:0 ,column2:1}
 */
SheetAccesser.prototype.getNameIndexMap = function(tableName)
{
  var sheet = this.spSheet.getSheetByName(tableName);

  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, 1, 1, lastColumn).getValues();

  var colmunNameList = [];
  for(var i = 0,len = range[0].length; i < len; ++i){
      colmunNameList.push(range[0][i]);
  }

  // オブジェクト名と列番号のマップを作る
  var nameIndexMap = {};
  for(var i = 0; i < colmunNameList.length; ++i){
    nameIndexMap[colmunNameList[i]] = i;
  }
  return nameIndexMap;
}

/**
 * オブジェクト形式のデータをシートにダンプします
 * @param name {string} シートの名前
 * @param objList {Array[Object]} オブジェクト形式のデータリスト\
 */
SheetAccesser.prototype.dumpObjects = function(name ,objList)
{
  var sheet = this.spSheet.getSheetByName(name);

  var lastColumn = sheet.getLastColumn();

  // オブジェクト名と列番号のマップを作る
  var nameIndexMap = this.getNameIndexMap(name);

  // データリストを回す
  var values =[];
  for(var i = 0,len = objList.length; i < len; ++i){
    var row = new Array(lastColumn);

    var obj = objList[i];

    Object.keys(obj).forEach(function(key) {
      var value = this[key];
      row[nameIndexMap[key]] = value;
    }, obj);
    values.push(row);
  }

  // dump
  this.dumpValues(name,values);

}

/**
 * 2次元配列形式のデータをシートにダンプします
 * @param name {string} シートの名前
 * @param values {Array[Array]} 2次元配列形式のデータリスト
 */
SheetAccesser.prototype.dumpValues = function(name ,values)
{
  var sheet = this.spSheet.getSheetByName(name);
  if(0 < values.length){
    // dump
    sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
  }
}

/**
 * カラム一覧を取得します
 * @param tableName {string} シートの名前
 * @return Array　カラム
 */
SheetAccesser.prototype.getColumns = function(tableName)
{

  var sheet = this.spSheet.getSheetByName(tableName);

  var lastColumn = sheet.getLastColumn();
  var values = sheet.getRange(1, 1, 1, lastColumn).getValues();
  return values[0];
}
/**
 * 2次元配列形式のデータを取得します
 * @param tableName {string} シートの名前
 * @return {Array[Array]} 2次元配列形式のデータリスト
 */
SheetAccesser.prototype.getAllValues = function(tableName)
{
  if(!(tableName in this.valuesCache)){
    var sheet = this.spSheet.getSheetByName(tableName);
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    var values = [];
    if(1 < lastRow){
      values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    }
    this.valuesCache[tableName] = values;
  }
  return this.valuesCache[tableName];
}

/**
 * キーを指定して2次元配列形式のデータを取得します
 * @param tableName {string} シートの名前
 * @param keyObj {Object} 各カラムのkeyとvalueのマップオブジェクト
 * @return {Array[Object]} 2次元配列形式のデータリスト
 */
SheetAccesser.prototype.getValuesForKey = function(tableName ,keyObj)
{
  var allValues = this.getAllValues(tableName);
  var nameIndexMap = this.getNameIndexMap(tableName);

  var values = [];
  for(var i = 0; i < allValues.length; ++i){
    var row = allValues[i];
    var allSame = true;

    Object.keys(keyObj).forEach(function(key) {
      var value = this[key];

      if(row[nameIndexMap[key]] != value){
        allSame = false;
      }
    }, keyObj);

    if(allSame){
      values.push(row);
    }

  }

  return values;
}


/**
 * キーを指定してオブジェクト形式のデータを取得します
 * 指定しなければ、有効なすべての行を取得します
 * @param tableName {string} シートの名前
 * @param keyObj {Object} 各カラムのkeyとvalueのマップオブジェクト
 * @return {Array[Object]} オブジェクト形式のデータリスト
 */
SheetAccesser.prototype.getObjectValues = function(tableName ,keyObj)
{

  var sheet = this.spSheet.getSheetByName(tableName);
  var lastColumn = sheet.getLastColumn();
  var keys = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  var allValues = null;
  if(keyObj){
    allValues = this.getValuesForKey(tableName ,keyObj);
  } else {
    allValues = this.getAllValues(tableName);
  }

  if(!allValues[0] || keys.length !== allValues[0].length){
   return [];
  }

  var ret = [];

  for(var i = 0, iLen = allValues.length; i < iLen; ++i){
    var row = {};
    for(var j = 0, jLen = allValues[i].length; j < jLen; ++j){
      row[keys[j]] = allValues[i][j];
    }
    ret.push(row);
  }
  return ret;
}
