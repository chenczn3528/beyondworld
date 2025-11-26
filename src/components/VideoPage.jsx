import React, { useMemo } from "react";
import LeftIcon from "../icons/LeftIcon.jsx";

const VideoPage = ({
    baseSize,
    isPortrait,
    showPageZIndex,
    setShowPageZIndex,
    video_url,
}) => {
    const resolvedUrl = useMemo(() => {
        if (!video_url) return "";
        try {
            const url = new URL(video_url);
            const { hostname, pathname, searchParams } = url;
            if (hostname.includes("player.bilibili.com")) {
                return video_url;
            }
            if (pathname.includes("video")) {
                const segments = pathname.split("/");
                const bvid = segments.find((seg) => seg.startsWith("BV"));
                if (bvid) {
                    const page = searchParams.get("p") || "1";
                    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&autoplay=0&preload=auto&quality=1080p&isOutside=true`;
                }
            }
        } catch (err) {
            // ignore invalid url
        }
        return video_url;
    }, [video_url]);

    const { iframeWidth, iframeHeight } = useMemo(() => {
        const ASPECT_RATIO = 16 / 9;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let width = viewportHeight * ASPECT_RATIO;
        let height = viewportHeight;

        if (width > viewportWidth) {
            width = viewportWidth;
            height = viewportWidth / ASPECT_RATIO;
        }

        return { iframeWidth: width, iframeHeight: height };
    }, []);

    return (
        <div
            className="absolute w-full h-full flex items-center justify-center"
            style={{zIndex: showPageZIndex}}
            onClick={(e) => {
                e.stopPropagation();
                setShowPageZIndex(-1)
            }}
        >
            {/*返回按钮*/}
            <button
                className="absolute z-110"
                onClick={()=>setShowPageZIndex(-1)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    left: `${baseSize*5}px`,
                    top: `${baseSize * 5}px`
                }}
            >
                <LeftIcon size={baseSize * 24} color="white"/>
            </button>


            <iframe
                src={resolvedUrl}
                width={iframeWidth}
                height={iframeHeight}
                scrolling="no"
                border="0"
                frameBorder="no"
                framespacing="0"
                allowFullScreen="true"
                referrerPolicy="no-referrer"
                style={{ borderRadius: `${baseSize}px`, backgroundColor: "black" }}
            ></iframe>
        </div>
    );
}

export default VideoPage;
