var Util = {
  /**
   * 指定した列番号の最終行番号を返します
   * @param sheet {Sheet} GASのSheetオブジェクト
   * @param column {int} 列番号
   * @return {int} 行番号
   */
  getLastRowWithColumn: function(sheet,column){
    var ret = 0;
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if(0 < lastRow && 0 < lastCol && column <= lastCol){
      var values = sheet.getRange(1,1,lastRow,lastCol).getValues();

      for(var i = values.length - 1; i >= 0; i--){
        if(values[i][column-1] != ''){
          ret  = i+1;
          break;
        }
      }
    }
    return ret;
  },
  /**
   * 指定した列番号の最初の行番号を返します
   * @param sheet {Sheet} GASのSheetオブジェクト
   * @param column {int} 列番号
   * @return {int} 行番号
   */
  getFirstRowWithColumn: function(sheet,column){
    var ret = 0
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if(0 < lastRow && 0 < lastCol){
      var values = sheet.getRange(1,1,lastRow,lastCol).getValues();

      for(var i = 0; i < lastRow; ++i){
        if(values[i][column-1] != ''){
          ret  = i+1;
          break;
        }
      }
    }
    return ret;
  },
  /**
   * url形式のファイルのファイル名のみを抜き出します
   * @param filePath {string} urlパス
   * @return {string} ファイル名
   */
  getFileName: function(filePath){
    fileName = filePath.substring(filePath.lastIndexOf('/')+1, filePath.length);
    return fileName;
  },
  /**
   * 日本の祝日カレンダーを利用して休日・祝日判定を行います。
   * @param {Date} {date=今日} - 対象日
   * @return {bool} 休みであればtrue
   */
  isHoliday: function(date)
  {
    date = date || new Date();
    var cal = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
    return cal.getEventsForDay(date).length > 0 || date.getDay() == 0 || date.getDay() == 6;
  },
  /**
   * 対象日が指定した期間内か
   * @param checkDate {Date} 対象日
   * @param beforeDate {Date} 前日
   * @param afterDate {Date} 後日
   * @return {bool} 期間内であればtrue
   */
  betweenDate: function(checkDate,beforeDate,afterDate){
    return beforeDate.getTime() < checkDate.getTime() && checkDate.getTime() < afterDate.getTime();
  },
  /**
   * 同じ日か
   * @param day1 {Date} 対象日1
   * @param day2 {Date} 対象日2
   * @return {bool} 同じであればtrue
   */
  matchDate: function(day1,day2){
    return day1.getFullYear() === day2.getFullYear() && day1.getMonth() === day2.getMonth() && day1.getDate() === day2.getDate();
  },
  typeIs: function(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  }
};
