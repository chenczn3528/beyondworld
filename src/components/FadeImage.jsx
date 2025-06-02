import React, {useEffect, useState} from "react";

const FadeImage = ( {cardSrc, cardSrcset} ) => {

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


    return (
        <div>
            {/* 低清图：模糊背景 */}
            <div
                className="absolute w-full h-full transition-opacity duration-300"
                style={{
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