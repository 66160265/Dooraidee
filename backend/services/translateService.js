const translate = require('google-translate-api-x');

function stripHtml(text) {
    return text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
}

async function translateToThai(text) {
    if (!text) return text;

    const plainText = stripHtml(text);
    try {
        const result = await translate(plainText, { to: 'th' });
        return result.text;
    } catch (err) {
        console.error('Translation failed, falling back to original text:', err.message);
        return plainText;
    }
}

module.exports = {
    translateToThai,
};
