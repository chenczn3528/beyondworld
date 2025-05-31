import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'cardImageIndexes';

export default function useCardImageIndex() {
  const [indexMap, setIndexMap] = useState({});
  const [loaded, setLoaded] = useState(false); // 标记是否加载完成

  useEffect(() => {
    get(STORAGE_KEY).then((data) => {
      if (data && typeof data === 'object') {
        setIndexMap(data);
      }
      setLoaded(true); // 数据加载完成
    });
  }, []);

  useEffect(() => {
    // 只有加载完成后，且indexMap不为空时才写入，避免覆盖原有数据
    if (loaded && Object.keys(indexMap).length > 0) {
      set(STORAGE_KEY, indexMap);
    }
  }, [indexMap, loaded]);

  const getImageIndex = (cardName) => {
    return indexMap[cardName] ?? 0; // 默认显示第0张
  };

  const setImageIndex = (cardName, index) => {
    setIndexMap((prev) => ({
      ...prev,
      [cardName]: index,
    }));
  };

  return {
    getImageIndex,
    setImageIndex,
    indexMap,
  };
}




// import { useState, useEffect } from 'react';
// import { get, set } from 'idb-keyval';
//
// const STORAGE_KEY = 'cardImageIndexes';
//
// export default function useCardImageIndex() {
//   const [indexMap, setIndexMap] = useState({});
//
//   useEffect(() => {
//     get(STORAGE_KEY).then((data) => {
//       if (data && typeof data === 'object') {
//         setIndexMap(data);
//       }
//     });
//   }, []);
//
//   useEffect(() => {
//     set(STORAGE_KEY, indexMap);
//   }, [indexMap]);
//
//   const getImageIndex = (cardName) => {
//     return indexMap[cardName] ?? 0; // 默认显示第0张
//   };
//
//   const setImageIndex = (cardName, index) => {
//     setIndexMap((prev) => ({
//       ...prev,
//       [cardName]: index,
//     }));
//   };
//
//   return {
//     getImageIndex,
//     setImageIndex,
//     indexMap,
//   };
// }
