import os
import re
import logging
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from google import genai
from PIL import Image
import io

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "images"))

client = genai.Client(api_key=GEMINI_API_KEY)

STORAGE_DIR.mkdir(exist_ok=True)

EXTRACT_PROMPT = (
    "This image contains Arabic text. Find the phrase 'ر.قائمة التوزيع' and extract "
    "the number that appears next to it (it may appear before or after the phrase). "
    "Reply with ONLY the number, nothing else. If you cannot find it, reply with 'NOT_FOUND'."
)


def find_image_by_number(number: str) -> Path | None:
    for ext in ("jpg", "jpeg", "png", "webp", "gif"):
        path = STORAGE_DIR / f"{number}.{ext}"
        if path.exists():
            return path
    return None


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "مرحباً!\n\n"
        "أرسل لي صورة وسأستخرج رقم قائمة التوزيع وأحفظها.\n"
        "أو أرسل لي رقماً لأسترجع الصورة المحفوظة."
    )


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("جاري تحليل الصورة...")

    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    file_bytes = await file.download_as_bytearray()

    image = Image.open(io.BytesIO(file_bytes))

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[EXTRACT_PROMPT, image],
        )
        extracted = response.text.strip()
    except Exception as e:
        logger.error("Gemini error: %s", e)
        await update.message.reply_text("حدث خطأ أثناء تحليل الصورة. حاول مرة أخرى.")
        return

    if extracted == "NOT_FOUND" or not re.search(r"\d", extracted):
        await update.message.reply_text(
            "لم أتمكن من إيجاد رقم قائمة التوزيع في هذه الصورة."
        )
        return

    number = re.sub(r"[^\w\-.]", "_", extracted)

    dest = STORAGE_DIR / f"{number}.jpg"
    image.save(dest, format="JPEG")

    await update.message.reply_text(
        f"تم حفظ الصورة بنجاح!\nالرقم المستخرج: {extracted}\n"
        f"أرسل الرقم '{extracted}' لاسترجاع الصورة لاحقاً."
    )


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = update.message.text.strip()

    if not re.search(r"\d", text):
        await update.message.reply_text("أرسل رقماً لاسترجاع الصورة المحفوظة.")
        return

    number = re.sub(r"[^\w\-.]", "_", text)
    image_path = find_image_by_number(number)

    if image_path is None:
        await update.message.reply_text(f"لا توجد صورة محفوظة بالرقم: {text}")
        return

    with open(image_path, "rb") as f:
        await update.message.reply_photo(photo=f, caption=f"الرقم: {text}")


def main() -> None:
    if not TELEGRAM_TOKEN:
        raise ValueError("TELEGRAM_TOKEN is not set in .env")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in .env")

    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))

    logger.info("Bot is running...")
    app.run_polling()


if __name__ == "__main__":
    main()
