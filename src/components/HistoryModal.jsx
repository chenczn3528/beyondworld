// HistoryModal.jsx
import React from 'react';

// 用于格式化日期的函数
// 记录时间的格式化
  const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = String(date.getFullYear()).slice(-2); // 取后两位
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hour}:${minute}`;
};

const HistoryModal = ({ showHistory, setShowHistory, history }) => {

  const style_long = {
    color: 'lightgray',
    flexBasis: '30%',
    textAlign: 'center',
    fontWeight: '800'
  };

  const style_short = {
    color: 'lightgray',
    flexBasis: '10%',
    textAlign: 'center',
    fontWeight: '800',
  };



  return (
    showHistory && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center w-full h-full"
        onClick={() => setShowHistory(false)}
      >
        <div
          className="relative flex flex-col w-[60vw] h-[60vh] p-4 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{backgroundColor: '#2a2d39'}}
        >
          <div className="relative z-10 flex flex-col h-full" style={{color: 'white'}}>

            {/*历史记录*/}
            <label className="text-center mt-[2vh] mb-[2vh]" style={{color: 'white', fontSize: '1.5vw', fontWeight: 800}}>
              历史记录
            </label>

            {/*表头*/}
            <div
                className="flex flex-row text-xs mb-2 flex justify-between ml-[3vw] mr-[3vw] h-[5vh] items-center"
                style={{backgroundColor: '#474964', fontSize: '1vw'}}
            >
              <div style={style_long}>侧影</div>
              <div style={style_short}>稀有度</div>
              <div style={style_long}>获取途径</div>
              <div style={style_long}>时间</div>
            </div>

            <div className="flex-1 overflow-y-auto mb-[2vh]">
              {history.slice().reverse().map((card, idx) => {
                const cardHistoryColors = {
                  "星": {color: "gray"},
                  "辰星": {color: "gray"},
                  "月": {color: "#a855f7"},
                  "世界": {color: "#dda516"}
                };
                const historyColor = cardHistoryColors[card.稀有度] || {color: "black"};

                const style1 = {
                  ...historyColor,
                  flexBasis: '30%',
                  textAlign: 'center',
                };

                const style2 = {
                  ...historyColor,
                  flexBasis: '10%',
                  textAlign: 'center',
                };

                const backgroundColor = idx % 2 === 0 ? 'transparent' : '#13141b';

                return (
                    <div
                        key={idx}
                        style={{backgroundColor, fontSize: '1vw'}}
                        className={`flex flex-row text-xs mb-2 flex justify-between ml-[3vw] mr-[3vw] h-[4vh] items-center`}
                    >
                      <div style={style1}>{card.主角}·{card.卡名}</div>
                      <div style={style2}>{card.稀有度}</div>
                      <div style={style1}>{card.获取途径}</div>
                      <div style={style1}>{formatDate(card.timestamp)}</div>
                    </div>
                );
              })}
            </div>
            <div className="pb-[10px]"></div>
          </div>
        </div>
      </div>
    )
  );
};

export default HistoryModal;
