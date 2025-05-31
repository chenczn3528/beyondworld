// HistoryModal.jsx
import React from 'react';
import {playClickSound} from "../utils/playClickSound.js";

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

const HistoryModal = ({ showHistory, setShowHistory, history, fontsize }) => {
    // console.log(history)

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
        className="absolute w-full h-full flex justify-center items-center z-50"
        onClick={() => {playClickSound(); setShowHistory(false)}}
      >
          <div
              className="absolute flex flex-col items-center"
              onClick={(e) => {
                  playClickSound();
                  e.stopPropagation()
              }}
              style={{
                  backgroundColor: '#2a2d39',
                  width: `${fontsize * 40}px`,
                  height: `${fontsize * 25}px`,
              }}
          >
              {/*历史记录*/}
              <label
                  style={{
                      color: 'white',
                      fontSize: `${fontsize * 1.5}px`,
                      fontWeight: 800,
                      marginTop: `${fontsize * 1.5}px`,
                      marginBottom: `${fontsize * 0.2}px`,
                  }}
              >
                  历史记录
              </label>

              <label
                  style={{
                      color: '#ffffff80',
                      fontSize: `${fontsize * 0.7}px`,
                      marginBottom: `${fontsize * 1}px`,
              }}
              >
                  只显示最新的2000条记录，多了会卡
              </label>

              {/*表头*/}
              <div
                  className="flex flex-row items-center justify-center"
                  style={{
                      backgroundColor: '#474964',
                      fontSize: `${fontsize}px`,
                      width: `${fontsize * 36}px`,
                      height: `${fontsize * 2.2}px`,
                  }}
              >
                  <div style={style_long}>侧影</div>
                  <div style={style_short}>稀有度</div>
                  <div style={style_long}>获取途径</div>
                  <div style={style_long}>时间</div>
              </div>


              <div
                  className="flex-1 overflow-y-auto"
                  style={{
                      fontSize: `${fontsize}px`,
                      width: `${fontsize * 36}px`,
                      marginBottom: `${fontsize * 2.2}px`,
                  }}
              >
                  {history.slice(-2000).reverse().map((card, idx) => {
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
                              style={{backgroundColor, fontSize: `${fontsize}px`, height: `${fontsize * 1.5}px`,}}
                              className="flex flex-row"
                              // className={`absolute flex flex-row text-xs mb-2 flex justify-between ml-[3vmin] mr-[3vmin] h-[4vmin] items-center`}
                          >
                              <div style={style1}>{card.主角}·{card.卡名}</div>
                              <div style={style2}>{card.稀有度}</div>
                              <div
                                  style={style1}>{card.获取途径.split("】").length === 1 ? card.获取途径 : card.获取途径.split("】")[0] + "】"}</div>
                              <div style={style1}>{formatDate(card.timestamp)}</div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
    )
  );
};

export default HistoryModal;
