from __future__ import annotations

import math
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
WIDTH, HEIGHT, FPS = 1280, 720, 24
DURATION = 16.0
BG = (10, 12, 14)
PANEL = (18, 21, 24)
PANEL2 = (23, 27, 30)
LINE = (48, 53, 57)
WHITE = (243, 244, 242)
MUTED = (151, 158, 163)
DIM = (101, 109, 115)
GOLD = (240, 185, 11)
GREEN = (69, 190, 132)
CURRENT_LANG = "zh"

ENGLISH_TEXT = {
    "演示界面 · 示例数据 · 不会提交真实交易": "DEMO UI · SAMPLE DATA · NO REAL TRANSACTION",
    "看到代币，顺手看清它。": "See a token. Understand it.",
    "把资产信息带到时间线旁": "Token context, right beside your timeline",
    "TRADETAG  /  功能演示": "TRADETAG  /  PRODUCT DEMO",
    "@marketnotes · 刚刚": "@marketnotes · just now",
    "观察 SOL 的链上流动性，": "Watching SOL liquidity on-chain,",
    "先核对网络和合约地址。": "checking the network and contract first.",
    "时间线代币提及": "TOKEN MENTION ON YOUR TIMELINE",
    "识别到代币提及": "TOKEN MENTION FOUND",
    "网络与资产仍需核对": "Review the network and asset",
    "查看资产信息": "VIEW ASSET DETAILS",
    "代币合约": "TOKEN CONTRACT",
    "价格 / 涨跌 / K 线": "PRICE / CHANGE / CANDLES",
    "示例行情": "SAMPLE MARKET DATA",
    "演示数据 · 数值并非实时报价": "DEMO VALUES · NOT LIVE PRICES",
    "TRADETAG  /  交易前报价": "TRADETAG  /  PRE-TRADE QUOTE",
    "买入 SOL": "BUY SOL",
    "使用": "PAY WITH",
    "示例金额": "SAMPLE AMOUNT",
    "预计到账": "ESTIMATED OUTPUT",
    "预估输出 · 需重新询价": "ESTIMATE · REQUOTE BEFORE TRADING",
    "报价来源": "QUOTE SOURCE",
    "滑点  0.5%": "SLIPPAGE  0.5%",
    "继续后由钱包展示交易详情": "YOUR WALLET REVIEWS THE TRANSACTION NEXT",
    "钱包交易确认": "WALLET TRANSACTION REVIEW",
    "确认交易内容": "REVIEW THE TRANSACTION",
    "请在你本地安装的钱包中复核并签名": "Review and sign in your locally installed wallet",
    "网络": "NETWORK",
    "预计支出": "YOU PAY",
    "费用由钱包显示": "Fees shown in your wallet",
    "真实操作时由用户决定是否签名": "YOU DECIDE WHETHER TO SIGN",
    "你的钱包，你来确认。": "Your wallet. Your decision.",
    "先看清资产，再决定下一步。": "Review the asset before taking the next step.",
    "产品流程演示  ·  非实盘交易": "PRODUCT DEMO  ·  NO LIVE TRADING",
}


def localize(value: str) -> str:
    return ENGLISH_TEXT.get(value, value) if CURRENT_LANG == "en" else value


def pick_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    paths = [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for path in paths:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


FONTS = {size: pick_font(size) for size in (13, 15, 17, 20, 24, 28, 34, 42, 52, 62)}
FONTS_BOLD = {size: pick_font(size, True) for size in (13, 15, 17, 20, 24, 28, 34, 42, 52, 62)}


def txt(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, size: int = 20, fill=WHITE, bold=False):
    draw.text(xy, localize(value), font=(FONTS_BOLD if bold else FONTS)[size], fill=fill)


def centered(draw: ImageDraw.ImageDraw, x: int, y: int, value: str, size: int, fill=WHITE, bold=False):
    value = localize(value)
    font = (FONTS_BOLD if bold else FONTS)[size]
    box = draw.textbbox((0, 0), value, font=font)
    draw.text((x - (box[2] - box[0]) / 2, y), value, font=font, fill=fill)


def rr(draw: ImageDraw.ImageDraw, box, radius=12, fill=PANEL, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def background(time: float, step: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)
    for x in range(64, WIDTH, 80):
        draw.line((x, 96, x, HEIGHT - 70), fill=(20, 23, 25), width=1)
    for y in range(120, HEIGHT - 48, 64):
        draw.line((48, y, WIDTH - 48, y), fill=(20, 23, 25), width=1)

    # A restrained price trace sits behind the product cards.
    chart = []
    for index in range(42):
        x = 650 + index * 15
        wave = math.sin(index * 0.47 + time * 0.28) * 14 + math.sin(index * 0.13) * 20
        trend = index * 1.25
        y = 545 - trend - wave
        chart.append((x, int(y)))
    draw.line(chart, fill=(47, 39, 18), width=2)

    # Header and top rule.
    draw.line((52, 82, WIDTH - 52, 82), fill=(39, 43, 46), width=1)
    draw.polygon([(57, 35), (79, 35), (91, 48), (79, 62), (57, 62)], outline=GOLD, width=2)
    draw.rectangle((63, 49, 67, 56), fill=WHITE)
    draw.rectangle((70, 45, 74, 56), fill=WHITE)
    draw.rectangle((77, 41, 81, 56), fill=GOLD)
    txt(draw, (105, 37), "TRADETAG", 17, WHITE, True)
    txt(draw, (WIDTH - 252, 39), "PRODUCT WALKTHROUGH", 13, MUTED)
    txt(draw, (WIDTH - 75, 39), step, 13, GOLD, True)
    draw.line((52, HEIGHT - 55, WIDTH - 52, HEIGHT - 55), fill=(39, 43, 46), width=1)
    txt(draw, (54, HEIGHT - 39), "演示界面 · 示例数据 · 不会提交真实交易", 13, DIM)
    draw.text((WIDTH - 104, HEIGHT - 42), "TRADETAG", font=FONTS[13], fill=(117, 122, 126))
    draw.rectangle((52, HEIGHT - 10, int(52 + (WIDTH - 104) * min(1, time / DURATION)), HEIGHT - 7), fill=GOLD)
    return image, draw


def logo_lockup(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0):
    tag = [(x, y + 20 * scale), (x + 105 * scale, y + 20 * scale), (x + 141 * scale, y + 62 * scale), (x + 105 * scale, y + 104 * scale), (x, y + 104 * scale), (x, y + 20 * scale)]
    draw.line(tag, fill=WHITE, width=max(2, int(4 * scale)), joint="curve")
    bar_x = x + 22 * scale
    for index, height in enumerate((29, 44, 63, 82)):
        color = GOLD if index == 2 else WHITE
        draw.rectangle((bar_x + index * 21 * scale, y + 88 * scale - height, bar_x + (index * 21 + 13) * scale, y + 88 * scale), fill=color)
    draw.ellipse((x + 108 * scale, y + 54 * scale, x + 121 * scale, y + 67 * scale), fill=WHITE)


def intro(image, draw, t):
    progress = min(1, t / 0.55)
    y = int(190 + (1 - progress) * 18)
    logo_lockup(draw, 530, y, 1.0)
    centered(draw, 640, 360, "看到代币，顺手看清它。", 42, WHITE, True)
    centered(draw, 640, 423, "把资产信息带到时间线旁", 20, MUTED)
    rr(draw, (516, 486, 764, 526), 20, fill=(29, 31, 32), outline=(66, 68, 67))
    centered(draw, 640, 497, "TRADETAG  /  功能演示", 15, GOLD, True)


def timeline(image, draw, t):
    slide = min(1, max(0, t / 0.7))
    left = int(-520 + 580 * (slide * slide * (3 - 2 * slide)))
    rr(draw, (left, 190, left + 530, 493), 12, fill=(16, 19, 21), outline=LINE)
    draw.line((left, 238, left + 530, 238), fill=LINE)
    rr(draw, (left + 20, 254, left + 57, 291), 20, fill=(197, 168, 79))
    centered(draw, left + 38, 261, "M", 17, (16, 17, 18), True)
    txt(draw, (left + 72, 254), "Market Notes", 17, WHITE, True)
    txt(draw, (left + 208, 256), "@marketnotes · 刚刚", 13, DIM)
    txt(draw, (left + 20, 315), "观察 SOL 的链上流动性，", 20, (212, 214, 214))
    txt(draw, (left + 20, 349), "先核对网络和合约地址。", 20, (212, 214, 214))
    rr(draw, (left + 20, 399, left + 164, 438), 7, fill=(29, 32, 34), outline=(69, 73, 76))
    txt(draw, (left + 35, 408), "$SOL  ·  Solana", 15, GOLD, True)
    txt(draw, (left + 18, 464), "时间线代币提及", 13, DIM)

    card_x = int(660 + (1 - min(1, max(0, (t - 0.35) / 0.8))) * 350)
    rr(draw, (card_x, 174, card_x + 430, 512), 14, fill=PANEL, outline=(69, 74, 77), width=2)
    txt(draw, (card_x + 24, 197), "TRADETAG CARD", 13, GOLD, True)
    txt(draw, (card_x + 24, 231), "识别到代币提及", 24, WHITE, True)
    txt(draw, (card_x + 24, 274), "SOL  /  Solana", 17, MUTED)
    rr(draw, (card_x + 24, 326, card_x + 406, 376), 8, fill=(12, 15, 17), outline=LINE)
    txt(draw, (card_x + 42, 339), "网络与资产仍需核对", 15, WHITE)
    rr(draw, (card_x + 24, 402, card_x + 406, 467), 8, fill=GOLD)
    centered(draw, card_x + 215, 420, "查看资产信息", 17, (17, 18, 19), True)


def chart_panel(draw, x, y, w, h, t):
    rr(draw, (x, y, x + w, y + h), 8, fill=(12, 15, 17), outline=LINE)
    for fraction in (0.25, 0.5, 0.75):
        yy = y + int(h * fraction)
        draw.line((x + 16, yy, x + w - 16, yy), fill=(31, 35, 38))
    pts = []
    for i in range(52):
        px = x + 18 + i * (w - 36) / 51
        wave = math.sin(i * 0.36 + t * 0.8) * h * 0.1 + math.sin(i * 0.12) * h * 0.12
        trend = i * h * 0.004
        py = y + h * 0.62 - wave - trend
        pts.append((int(px), int(py)))
    draw.line(pts, fill=GOLD, width=3, joint="curve")
    draw.ellipse((pts[-1][0] - 4, pts[-1][1] - 4, pts[-1][0] + 4, pts[-1][1] + 4), fill=WHITE)


def market(image, draw, t):
    rr(draw, (136, 144, 1144, 548), 14, fill=PANEL, outline=(64, 69, 72), width=2)
    rr(draw, (168, 174, 211, 217), 22, fill=(29, 34, 36), outline=(66, 72, 75))
    centered(draw, 190, 183, "◎", 20, GOLD, True)
    txt(draw, (230, 178), "Solana", 17, MUTED)
    txt(draw, (168, 236), "SOL", 34, WHITE, True)
    txt(draw, (260, 247), "Wrapped SOL · CT_501", 15, MUTED)
    txt(draw, (168, 292), "$82.04", 42, WHITE, True)
    rr(draw, (350, 300, 466, 339), 18, fill=(17, 50, 38), outline=(29, 95, 67))
    centered(draw, 408, 309, "+2.8%  24h", 15, GREEN, True)
    txt(draw, (168, 370), "代币合约", 13, DIM)
    txt(draw, (168, 391), "So1111…11112", 15, (213, 216, 216))
    txt(draw, (168, 443), "价格 / 涨跌 / K 线", 13, MUTED)
    chart_panel(draw, 535, 190, 565, 294, t)
    txt(draw, (555, 453), "1m", 13, GOLD, True)
    txt(draw, (598, 453), "5m", 13, DIM)
    txt(draw, (641, 453), "1h", 13, DIM)
    txt(draw, (1024, 453), "示例行情", 13, DIM)
    txt(draw, (168, 504), "演示数据 · 数值并非实时报价", 13, GOLD)


def quote(image, draw, t):
    rr(draw, (140, 150, 1140, 550), 14, fill=PANEL, outline=(64, 69, 72), width=2)
    txt(draw, (178, 182), "TRADETAG  /  交易前报价", 13, GOLD, True)
    txt(draw, (178, 222), "买入 SOL", 28, WHITE, True)
    txt(draw, (178, 270), "使用", 15, MUTED)
    rr(draw, (178, 300, 598, 382), 8, fill=(11, 14, 16), outline=LINE)
    txt(draw, (202, 311), "0.25", 34, WHITE, True)
    txt(draw, (493, 328), "SOL", 17, GOLD, True)
    txt(draw, (202, 357), "示例金额", 13, DIM)
    txt(draw, (632, 330), "→", 34, GOLD, True)
    txt(draw, (708, 270), "预计到账", 15, MUTED)
    rr(draw, (708, 300, 1098, 382), 8, fill=(11, 14, 16), outline=LINE)
    txt(draw, (732, 311), "20.48", 34, WHITE, True)
    txt(draw, (1000, 328), "USDC", 17, GOLD, True)
    txt(draw, (732, 357), "预估输出 · 需重新询价", 13, DIM)
    rr(draw, (178, 417, 1098, 469), 7, fill=(25, 28, 30), outline=LINE)
    txt(draw, (198, 432), "报价来源", 13, DIM)
    txt(draw, (292, 432), "Binance Web3 API", 15, WHITE, True)
    txt(draw, (830, 432), "滑点  0.5%", 15, MUTED)
    rr(draw, (178, 489, 1098, 529), 6, fill=GOLD)
    centered(draw, 638, 498, "继续后由钱包展示交易详情", 15, (15, 16, 17), True)


def wallet(image, draw, t):
    # Mock confirmation window, clearly labeled as an illustration.
    rr(draw, (367, 143, 913, 551), 14, fill=(16, 19, 21), outline=(82, 86, 89), width=2)
    draw.line((367, 199, 913, 199), fill=LINE)
    rr(draw, (395, 159, 429, 193), 10, fill=(35, 39, 41), outline=(93, 99, 103))
    centered(draw, 412, 165, "W", 17, GOLD, True)
    txt(draw, (445, 161), "钱包交易确认", 20, WHITE, True)
    txt(draw, (445, 186), "WALLET PREVIEW · SIMULATED", 13, MUTED)
    centered(draw, 640, 236, "确认交易内容", 28, WHITE, True)
    centered(draw, 640, 278, "请在你本地安装的钱包中复核并签名", 15, MUTED)
    rr(draw, (410, 316, 870, 376), 8, fill=(11, 14, 16), outline=LINE)
    txt(draw, (432, 328), "网络", 13, DIM)
    txt(draw, (432, 350), "Solana Mainnet", 15, WHITE)
    txt(draw, (664, 328), "预计支出", 13, DIM)
    txt(draw, (664, 350), "0.25 SOL", 15, WHITE)
    rr(draw, (410, 393, 870, 453), 8, fill=(11, 14, 16), outline=LINE)
    txt(draw, (432, 405), "预计到账", 13, DIM)
    txt(draw, (432, 427), "20.48 USDC", 15, WHITE)
    txt(draw, (664, 427), "费用由钱包显示", 13, MUTED)
    rr(draw, (410, 474, 870, 518), 7, fill=GOLD)
    centered(draw, 640, 485, "真实操作时由用户决定是否签名", 15, (15, 16, 17), True)


def outro(image, draw, t):
    logo_lockup(draw, 546, 181, 0.8)
    centered(draw, 640, 325, "你的钱包，你来确认。", 42, WHITE, True)
    centered(draw, 640, 388, "先看清资产，再决定下一步。", 20, MUTED)
    rr(draw, (476, 455, 804, 500), 22, fill=(30, 32, 33), outline=(80, 83, 83))
    centered(draw, 640, 468, "产品流程演示  ·  非实盘交易", 15, GOLD, True)


SCENES = [
    ("01 / 04", 2.0, intro),
    ("02 / 04", 3.0, timeline),
    ("03 / 04", 3.5, market),
    ("04 / 04", 3.0, quote),
    ("04 / 04", 2.5, wallet),
    ("END", 2.0, outro),
]


def render(scene_index: int, local_time: float, absolute_time: float) -> Image.Image:
    step, _, painter = SCENES[scene_index]
    image, draw = background(absolute_time, step)
    painter(image, draw, local_time)
    fade = min(1.0, absolute_time / 0.25, (DURATION - absolute_time) / 0.25)
    if fade < 1:
        overlay = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
        image = Image.blend(overlay, image, max(0, fade))
    return image


def render_language(language: str, video_name: str, poster_name: str):
    global CURRENT_LANG
    CURRENT_LANG = language
    PUBLIC.mkdir(parents=True, exist_ok=True)
    poster = render(2, 1.1, 6.2)
    poster.save(PUBLIC / poster_name, optimize=True)
    elapsed = 0.0
    frame_count = round(DURATION * FPS)
    with tempfile.TemporaryDirectory(prefix="tradetag-demo-") as temp:
        frames = Path(temp)
        starts = []
        for _, duration, _ in SCENES:
            starts.append(elapsed)
            elapsed += duration
        for frame_no in range(frame_count):
            absolute = frame_no / FPS
            index = len(SCENES) - 1
            for candidate, start in enumerate(starts):
                end = start + SCENES[candidate][1]
                if start <= absolute < end:
                    index = candidate
                    break
            local = absolute - starts[index]
            current = render(index, local, absolute)
            transition = 0.28
            end = starts[index] + SCENES[index][1]
            if index + 1 < len(SCENES) and absolute > end - transition:
                blend = (absolute - (end - transition)) / transition
                next_frame = render(index + 1, max(0, absolute - (end - transition)), absolute)
                current = Image.blend(current, next_frame, min(1, max(0, blend)))
            current.save(frames / f"{frame_no:04d}.png", compress_level=1)

        output = PUBLIC / video_name
        subprocess.run([
            "ffmpeg.exe", "-hide_banner", "-loglevel", "error", "-y",
            "-framerate", str(FPS), "-i", str(frames / "%04d.png"),
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)
        ], check=True)

    zh = """WEBVTT

00:00:00.300 --> 00:00:02.000
TradeTag 把代币信息卡片带到 X 时间线旁。

00:00:02.000 --> 00:00:05.000
从代币提及开始，核对网络和合约地址。

00:00:05.000 --> 00:00:08.500
查看价格、涨跌和 K 线。画面数据仅供演示。

00:00:08.500 --> 00:00:11.500
获取报价并检查预计到账数量和滑点。

00:00:11.500 --> 00:00:14.000
真实交易由你安装的钱包展示、签名和广播。

00:00:14.000 --> 00:00:16.000
本视频不连接钱包，也不会提交真实交易。
"""
    en = """WEBVTT

00:00:00.300 --> 00:00:02.000
TradeTag brings token context beside your X timeline.

00:00:02.000 --> 00:00:05.000
Start with a mention, then check its network and contract.

00:00:05.000 --> 00:00:08.500
Review price, change, and candles. Values shown are illustrative.

00:00:08.500 --> 00:00:11.500
Get a quote and review estimated output and slippage.

00:00:11.500 --> 00:00:14.000
Your installed wallet displays, signs, and broadcasts real trades.

00:00:14.000 --> 00:00:16.000
This video does not connect a wallet or submit a real transaction.
"""
    (PUBLIC / "tradetag-demo-zh.vtt").write_text(zh, encoding="utf-8")
    (PUBLIC / "tradetag-demo-en.vtt").write_text(en, encoding="utf-8")
    print(f"Created {output} ({output.stat().st_size} bytes)")


def main():
    render_language("zh", "tradetag-demo.mp4", "tradetag-demo-poster.png")
    render_language("en", "tradetag-demo-en.mp4", "tradetag-demo-en-poster.png")


if __name__ == "__main__":
    main()
