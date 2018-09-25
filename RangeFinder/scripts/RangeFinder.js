var RangeFinder = function(sheet){
  this.sheet = sheet;
}
/**
* 複数の条件からシート内を検索して範囲を返す
* @param [Object] option
*   {
*     word:'',
*     type: 'MATCH',// CONTAIN
*     bgColor:'#FFFFFF',
*     textColor:'#000000',
*     multiple: false
*   }
*/
RangeFinder.prototype.find = function(option){
  option.type = option.type || 'CONTAIN';
  option.rowCount = option.rowCount || 1;
  option.colCount = option.colCount || 1;

  var ret = option.multiple ? [] : null;
  var lastRow = this.sheet.getLastRow();
  var lastCol = this.sheet.getLastColumn();

  var values = this.sheet.getRange(1, 1,lastRow,lastCol).getValues();

  for(var i = 0,iLen = values.length; i < iLen;++i){
    var end = false;

    var row = values[i];
    for(var j = 0,jLen = row.length; j < jLen;++j){

      if(options.word){
        var cell = String(row[j]);
        var isTarget = false;

        // ①検索文字列
        switch(option.type){
          case 'MATCH"':
            isTarget = (cell == option.word);
            break;
          case 'CONTAIN':
            isTarget = (-1 < cell.indexOf(option.word));
            break;
        }
      }

      if(!isTarget){
        continue;
      }

      var range = this.sheet.getRange((i+1), (j+1) ,option.rowCount ,option.colCount);

      if(option.bgColor){
        // ②背景色
        isTarget = (range.getBackground() == option.bgColor);
        if(!isTarget){
          continue;
        }
      }

      if(option.textColor){
        // ③文字色
        isTarget = (range.getFontColor() == option.textColor);
        if(!isTarget){
          continue;
        }
      }
      if(option.multiple){
        ret.push(range);
      } else {
        ret = range;
        end = true;
        break;
      }
    }

    if(end){
      break;
    }
  }

  return ret;
}
