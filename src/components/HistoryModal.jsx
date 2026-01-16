// HistoryModal.jsx
import React, { useMemo, useRef, useState } from 'react';
import {playClickSound} from "../utils/playClickSound.js";
import FilterIcon from "../icons/FilterIcon.jsx";

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

const FILTER_MODES = [
  {
    label: '全部',
    description: '显示全部稀有度',
    limitNote: '只显示最新的2000条记录',
    iconColor: '#a855f7',
    match: () => true,
    limitToRecent: true,
  },
  {
    label: '月卡+',
    description: '仅显示月卡及以上',
    limitNote: '只显示最新的2000条记录',
    iconColor: '#f5c542',
    match: (card) => ['月', '瞬', '世界', '刹那'].includes(card.稀有度),
    limitToRecent: true,
  },
  {
    label: '世界卡+',
    description: '仅显示世界卡及以上',
    limitNote: '不限制数量',
    iconColor: '#9ca3af',
    match: (card) => ['世界', '刹那'].includes(card.稀有度),
    limitToRecent: false,
  },
];

const HistoryModal = ({ showHistory, setShowHistory, history, fontsize }) => {
    // console.log(history)
  const [filterMode, setFilterMode] = useState(0);
  const listRef = useRef(null);

  const baseHistory = useMemo(() => {
    const mode = FILTER_MODES[filterMode];
    const source = mode.limitToRecent ? history.slice(-2000) : history;
    return source.slice().reverse();
  }, [history, filterMode]);
  const filteredHistory = useMemo(
    () => baseHistory.filter(FILTER_MODES[filterMode].match),
    [baseHistory, filterMode]
  );
  const totalCount = filteredHistory.length;

  const handleToggleFilter = () => {
    setFilterMode((prev) => (prev + 1) % FILTER_MODES.length);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  };

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
              <div
                  className="flex items-center justify-center"
                  style={{
                      width: `${fontsize * 36}px`,
                      marginTop: `${fontsize * 1.5}px`,
                      marginBottom: `${fontsize * 0.2}px`,
                  }}
              >
                  <label
                      style={{
                          color: 'white',
                          fontSize: `${fontsize * 1.5}px`,
                          fontWeight: 800,
                      }}
                  >
                      历史记录
                  </label>
              </div>

              <label
                  style={{
                      color: '#ffffff80',
                      fontSize: `${fontsize * 0.7}px`,
                      lineHeight: `${fontsize * 1.1}px`,
                      marginBottom: `${fontsize * 1}px`,
              }}
              >
                  <div
                      className="flex items-center justify-center"
                      style={{gap: `${fontsize * 0.3}px`}}
                  >
                      <span>{FILTER_MODES[filterMode].description}（{FILTER_MODES[filterMode].limitNote}）</span>
                      <button
                          type="button"
                          className="flex items-center justify-center"
                          onClick={() => {
                              playClickSound();
                          handleToggleFilter();
                      }}
                          style={{
                              color: FILTER_MODES[filterMode].iconColor,
                              backgroundColor: 'transparent',
                              borderRadius: `${fontsize * 0.4}px`,
                              padding: `${fontsize * 0.2}px`,
                          }}
                      >
                          <FilterIcon size={fontsize * 1.1} color={FILTER_MODES[filterMode].iconColor} />
                      </button>
                  </div>
                  {/* <div className="text-center">{FILTER_MODES[filterMode].limitNote}</div> */}
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
                  ref={listRef}
                  style={{
                      fontSize: `${fontsize}px`,
                      width: `${fontsize * 36}px`,
                      marginBottom: `${fontsize * 2.2}px`,
                  }}
              >
                  {filteredHistory.length === 0 ? (
                      <div
                          style={{
                              color: '#2ecc71',
                              textAlign: 'center',
                              padding: `${fontsize * 0.6}px 0`,
                          }}
                      >
                          —— 共 0 条记录 ——
                      </div>
                  ) : (
                  filteredHistory.map((card, idx) => {
                      const cardHistoryColors = {
                          "刹那": {color: "#ffd700"},
                          "星": {color: "gray"},
                          "辰星": {color: "gray"},
                          "月": {color: "#a855f7"},
                          "瞬": {color: "#c4a1ff"},
                          "世界": {color: "#dda516"}
                      };
                      const roleColorMap = {
                          "顾时夜": "#6fa2e6",
                          "易遇": "#7fd3a4",
                          "柏源": "#f2ad6b",
                          "夏萧因": "#b28fe6",
                          "夏萧音": "#b28fe6",
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

                      const recordCount = idx + 1;
                      const isLastRecord = recordCount === totalCount;
                      const shouldShowSplit = recordCount % 10 === 0 && !isLastRecord;

                      return (
                          <React.Fragment key={idx}>
                              <div
                                  style={{backgroundColor, fontSize: `${fontsize}px`, height: `${fontsize * 1.5}px`,}}
                                  className="flex flex-row"
                                  // className={`absolute flex flex-row text-xs mb-2 flex justify-between ml-[3vmin] mr-[3vmin] h-[4vmin] items-center`}
                              >
                                  <div style={style1}>
                                      <span
                                          style={{
                                              color: ['世界', '刹那'].includes(card.稀有度)
                                                  ? (roleColorMap[card.主角] || historyColor.color)
                                                  : historyColor.color
                                          }}
                                      >
                                          {card.主角}
                                      </span>
                                      ·{card.卡名}
                                  </div>
                                  <div style={style2}>{card.稀有度}</div>
                                  <div
                                      style={style1}>{card.获取途径.split("】").length === 1 ? card.获取途径 : card.获取途径.split("】")[0] + "】"}</div>
                                  <div style={style1}>{formatDate(card.timestamp)}</div>
                              </div>
                              {shouldShowSplit && (
                                  <div
                                      style={{
                                          color: '#2ecc71',
                                          textAlign: 'center',
                                          padding: `${fontsize * 0.4}px 0`,
                                      }}
                                  >
                                      —— {recordCount} 条记录 ——
                                  </div>
                              )}
                              {isLastRecord && (
                                  <div
                                      style={{
                                          color: '#2ecc71',
                                          textAlign: 'center',
                                          padding: `${fontsize * 0.4}px 0`,
                                      }}
                                  >
                                      —— 共 {totalCount} 条记录 ——
                                  </div>
                              )}
                          </React.Fragment>
                      );
                  })
                  )}
              </div>
          </div>
      </div>
    )
  );
};

export default HistoryModal;
