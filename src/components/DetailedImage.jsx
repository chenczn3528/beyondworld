import { LazyLoadImage } from 'react-lazy-load-image-component';
import {playClickSound} from "../utils/playClickSound.js";
import { Asset } from './Asset.jsx';

const DetailedImage = ({ card, onClose, baseSize }) => {

    const rarityMap = {
        刹那: 'instant.png',
        世界: 'world.png',
        瞬: 'moment.png',
        月: 'moon.png',
        辰星: 'star1.png',
        星: 'star2.png',
    };

    const attributes = ['思维', '魅力', '体魄', '感知', '灵巧'];

    return (
        <div
            className="absolute w-full h-full z-10"
            onClick={() => {
                playClickSound();
                onClose();
            }}
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)',}}
        >

            <div className="absolute flex">

                <LazyLoadImage
                    src={card.图片信息[0].srcset}
                    placeholderSrc={card.图片信息[0].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${baseSize * 40}px`,
                        left: `${baseSize * 80}px`,
                        width: `${baseSize * 140}px`
                    }}
                />
                {/* 角标图标：定位在主图右上角 */}
                <Asset
                    src={rarityMap[card.稀有度]}
                    type="image"
                    className="absolute"
                    style={{
                        top: `${baseSize * 35}px`,
                        left: `${baseSize * 190}px`,
                        width: `${baseSize * 30}px`
                    }}
                />

                <LazyLoadImage
                    src={card.图片信息[1].srcset}
                    placeholderSrc={card.图片信息[1].src}
                    effect="blur"
                    className="absolute object-contain edge-blur-mask"
                    style={{
                        top: `${baseSize * 100}px`,
                        left: `${baseSize * 40}px`,
                        width: `${baseSize * 70}px`
                    }}
                />

                {/* 重逢图标：贴在卡面右上角 */}
                <Asset
                    src="重逢.png"
                    type="image"
                    alt="重逢图标"
                    className="absolute"
                    style={{
                        top: `${baseSize * 93}px`,
                        left: `${baseSize * 90}px`,
                        width: `${baseSize * 20}px`
                    }}
                />

                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: `${baseSize * 50}px`,
                        left: `${baseSize * 240}px`,
                        width: `${baseSize * 100}px`,
                        height: `${baseSize * 80}px`,
                    }}
                >
                    <label
                        style={{
                            color: 'lightgray',
                            fontWeight: 600,
                            fontSize: `${baseSize * 10}px`,
                    }}
                        className="absolute"
                    >
                        {card.主角}
                    </label>

                    <label
                        style={{
                            top: `${baseSize * 12}px`,
                            color: 'white',
                            fontWeight: 800,
                            fontSize: `${baseSize * 14}px`,
                        }}
                        className="absolute"
                    >
                        {card.卡名}
                    </label>

                    <div className="absolute flex flex-row" style={{top: `${baseSize * 40}px`}}>
                        {attributes.map(attr => (
                            <div
                                key={attr}
                                className="flex flex-col mr-[3vmin] items-center"
                            >
                                <Asset
                                    src={`60px-${attr}.png`}
                                    type="image"
                                    className="mb-[0.5vmin]"
                                    style={{width: `${baseSize * 12}px`}}
                                />

                                <label
                                    style={{
                                        color: card.属性 === attr ? 'gold' : 'white',
                                        fontWeight: 800,
                                        fontSize: `${baseSize * 8}px`,
                                    }}
                                >
                                    {card[attr]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DetailedImage;
