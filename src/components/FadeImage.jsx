import React, {useEffect, useState} from "react";

const ROTATED_WIDTH_MULTIPLIER = 211;
const ROTATED_HEIGHT_MULTIPLIER = (ROTATED_WIDTH_MULTIPLIER * 16) / 9;

const FadeImage = ({ cardSrc, cardSrcset, isRotated = false, baseSize }) => {

    // 预加载小图，等大图加载完以后跳出来
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const targetImage = cardSrcset;
            // card?.图片信息.length > 1
            //     ? card?.图片信息?.[1]?.srcset2 || card?.图片信息?.[1]?.src
            //     : card?.图片信息?.[0]?.srcset2 || card?.图片信息?.[0]?.src;

        if (!targetImage) return;

        const img = new Image();
        img.src = targetImage;
        img.onload = () => {
            setLoaded(true);
        };

        // 清理副作用（可选）
        return () => {
            img.onload = null;
        };
    }, []);

    const hasBaseSize = typeof baseSize === 'number' && !Number.isNaN(baseSize);
    const rotatedWidth = hasBaseSize ? `${baseSize * ROTATED_WIDTH_MULTIPLIER}px` : '100vh';
    const rotatedHeight = hasBaseSize ? `${baseSize * ROTATED_HEIGHT_MULTIPLIER}px` : '100vw';

    const baseContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: 'none',
        transformOrigin: 'center center',
    };

    const rotatedContainerStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: rotatedWidth,
        height: rotatedHeight,
        transform: 'translate(-50%, -50%) rotate(90deg)',
        transformOrigin: 'center center',
    };

    const containerStyle = isRotated ? rotatedContainerStyle : baseContainerStyle;


    return (
        <div style={containerStyle}>
            {/* 低清图：模糊背景 */}
            <div
                className="absolute w-full h-full transition-opacity duration-300"
                style={{
                    top: 0,
                    left: 0,
                    backgroundImage: `url(${cardSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(20px)",
                    opacity: loaded ? 0 : 1,
                }}
            />

            {/* 高清图：加载完后显示并播放动画 */}
            {loaded && (
                <div
                    // onClick={onClick}
                    className="absolute w-full h-full animate-fadeZoomIn"
                    style={{
                        top: 0,
                        left: 0,
                        backgroundImage: `url(${cardSrcset})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            )}
        </div>
    );
};

export default FadeImage;
