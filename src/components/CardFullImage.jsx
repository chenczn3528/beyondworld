import { LazyLoadImage } from 'react-lazy-load-image-component';

const CardFullImage = (
    {
        card,
        onClick,
        setIsSkipped,
        setCurrentIndex,
        isSecondImage = false,
        isShowCardResult = false,
        fontsize,
    }) => {

    const rarityMap = {
        世界: 'images/world.png',
        月: 'images/moon.png',
        辰星: 'images/star1.png',
        星: 'images/star2.png',
    };

    const isFiveStar = card.稀有度 === '世界';

    return (
        <div className="relative w-full h-full flex z-100">
            <div
                className="absolute w-full h-full animate-fadeZoomIn"
                onClick={onClick}
                style={{
                    backgroundImage: `url(${isSecondImage ? card.图片信息[1].srcset2 : card.图片信息[0].srcset2})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <img
                className="absolute"
                src={rarityMap[card.稀有度]}
                style={{
                    height: `${fontsize * 5}px`,
                    left: `${fontsize * 4}px`,
                    top: `${fontsize * 2}px`,
                }}
            />

            <label
                className="absolute"
                style={{
                    color: 'white',
                    fontSize: `${fontsize * 1.5}px`,
                    fontWeight: 600,
                    left: `${fontsize * 5.5}px`,
                    bottom: `${fontsize * 7.5}px`,
                    textShadow: '0 0 2px gray, 0 0 4px gray',
                }}
            >
                {card.主角}
            </label>

            <div
                className="absolute flex items-center"
                style={{
                    left: `${fontsize * 7.5}px`,
                    bottom: `${fontsize * 4.5}px`,
                }}
            >
                <label
                    style={{
                        color: 'white',
                        fontSize: `${fontsize * 2.3}px`,
                        fontWeight: 800,
                        marginRight: '1px',
                        textShadow: '0 0 2px gray, 0 0 4px gray',
                    }}
                >
                    {card.卡名}
                </label>
                <img
                    src={`images/60px-${card.属性}.png`}
                    alt="图标"
                    style={{
                        height: `${fontsize * 3}px`,
                        width: 'auto',
                    }}
                />
            </div>

            {!(isShowCardResult || isFiveStar) && (
                <button
                    className="absolute"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        right: `${fontsize * 3}px`,
                        top: `${fontsize * 2}px`,
                        color: 'white',
                        fontSize: `${fontsize}px`,
                        textShadow: '0 0 2px black, 0 0 4px black',
                    }}
                    onClick={() => {
                        setIsSkipped(true);
                        setCurrentIndex(0);
                    }}
                >
                    跳过
                </button>
            )}
        </div>
    );
};

export default CardFullImage;
