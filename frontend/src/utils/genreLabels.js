const GENRE_LABELS_TH = {
    Action: "แอ็กชัน",
    Adventure: "ผจญภัย",
    Animation: "แอนิเมชัน",
    Comedy: "คอมเมดี้",
    Crime: "อาชญากรรม",
    Documentary: "สารคดี",
    Drama: "ดราม่า",
    Family: "ครอบครัว",
    Fantasy: "แฟนตาซี",
    History: "ประวัติศาสตร์",
    Horror: "สยองขวัญ",
    Music: "ดนตรี",
    Mystery: "ลึกลับ",
    Romance: "โรแมนซ์",
    "Science Fiction": "ไซไฟ",
    "Sci-Fi": "ไซไฟ",
    "TV Movie": "ภาพยนตร์ทีวี",
    Thriller: "ระทึกขวัญ",
    War: "สงคราม",
    Western: "เวสเทิร์น",
    "Action & Adventure": "แอ็กชันผจญภัย",
    Kids: "เด็ก",
    News: "ข่าว",
    Reality: "เรียลลิตี้",
    "Sci-Fi & Fantasy": "ไซไฟแฟนตาซี",
    Soap: "ละครน้ำเน่า",
    Talk: "ทอล์กโชว์",
    "War & Politics": "สงครามและการเมือง",
    Ecchi: "เอ็กจิ",
    Hentai: "เฮนไท",
    "Mahou Shoujo": "มาโฮโชโจ",
    Mecha: "หุ่นยนต์",
    Psychological: "จิตวิทยา",
    "Slice of Life": "สไลซ์ออฟไลฟ์",
    Sports: "กีฬา",
    Supernatural: "เหนือธรรมชาติ",
};

export function genreLabel(genreName) {
    return GENRE_LABELS_TH[genreName] || genreName;
}

export default GENRE_LABELS_TH;
