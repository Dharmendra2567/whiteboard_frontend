import html2canvas from "html2canvas";
import { PAGE_HEIGHT } from "./whiteboardPages";

export async function captureCurrentPage(containerId) {
    const container = document.getElementById(containerId);

    if (!container) return null;

    const canvas = await html2canvas(container, {
        height: PAGE_HEIGHT,
        width: window.innerWidth,
        scale: 2,
        useCORS: true,
    });

    return canvas.toDataURL("image/png");
}
