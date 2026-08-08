# คู่มืออ่านโค้ด Dooraidee (สำหรับมือใหม่)

เอกสารนี้พาไล่ดูว่าไฟล์ไหนทำหน้าที่อะไร และข้อมูลไหลจากจุดหนึ่งไปอีกจุดหนึ่งยังไง เขียนไว้ให้อ่านควบคู่กับการเปิดโค้ดจริงไปด้วย ไม่ต้องอ่านรวดเดียวจบ — แนะนำให้อ่านหัวข้อ "ภาพรวมสถาปัตยกรรม" ก่อน แล้วค่อยตามด้วย "เดินตามข้อมูล 1 คำขอ" เพราะจะเห็นภาพรวมเร็วกว่าไล่อ่านทีละไฟล์

## ภาพรวมสถาปัตยกรรม

เว็บนี้แบ่งเป็น 2 โปรเจกต์แยกกัน รันคนละ process กัน:

```
เบราว์เซอร์ (React, :5173)  --fetch()-->  Backend (Express, :4000)  -->  API ภายนอก
                                                                          - TMDB (หนัง/ซีรีส์)
                                                                          - AniList (อนิเมะ)
                                                                          - MyAnimeList (เรตติ้งอายุ)
```

**ทำไมต้องมี backend คั่นกลาง แทนที่ frontend จะเรียก TMDB/AniList ตรงๆ?**
1. **ซ่อน API key** — TMDB token กับ MAL client ID เก็บไว้ใน `.env` ฝั่ง backend เท่านั้น ถ้า frontend เรียกตรง จะต้องฝัง key ไว้ในโค้ดที่ทุกคนเปิดดูได้ผ่านเบราว์เซอร์
2. **รวมข้อมูลจากหลายแหล่งให้เป็นรูปแบบเดียว** — TMDB กับ AniList คืนข้อมูลคนละ shape กันเลย backend มีหน้าที่ "แปลง" (normalize) ให้ frontend ใช้โครงสร้างเดียวกันไม่ว่าจะเป็นหนัง ซีรีส์ หรืออนิเมะ
3. **ทำ logic ที่ซับซ้อนได้โดยไม่ต้องส่งไปมาหลายรอบ** — เช่นการหาจำนวนหน้าจริงของอนิเมะ (อธิบายด้านล่าง) ถ้าทำฝั่ง frontend จะต้องยิง request ไปมาหลายรอบผ่านอินเทอร์เน็ต ช้ากว่าทำในเซิร์ฟเวอร์เดียวกับที่คุยกับ AniList อยู่แล้วเยอะ

---

## ฝั่ง Backend (`backend/`)

### `server.js` — จุดเริ่มต้นของทุกอย่าง

ไฟล์นี้คือสิ่งแรกที่รันเมื่อพิมพ์ `node server.js` มันทำแค่ 3 อย่าง:
1. สร้าง Express app แล้วเปิดใช้ CORS (อนุญาตให้ frontend ที่รันคนละพอร์ตเรียกเข้ามาได้)
2. "mount" router แต่ละตัวเข้ากับ path (เช่น `app.use('/api/movies', moviesRouter)` แปลว่าทุก request ที่ขึ้นต้นด้วย `/api/movies` จะถูกส่งต่อไปให้ `routes/movies.js` จัดการ)
3. ตั้ง error-handling middleware ตัวสุดท้าย (ฟังก์ชันที่รับ 4 พารามิเตอร์ `(err, req, res, next)`) ไว้ดักจับ error ที่เกิดจากทุก route แล้วตอบกลับเป็น JSON แทนที่ Express จะโชว์หน้า error HTML แบบ default

ลองดูตาราง mapping เส้นทาง (path) → ไฟล์ที่รับผิดชอบ:

| Path | ไฟล์ | ใช้ทำอะไร |
|---|---|---|
| `/api/movies` | `routes/movies.js` | รายการ + รายละเอียดหนัง |
| `/api/tv-shows` | `routes/tvShows.js` | รายการ + รายละเอียดซีรีส์ |
| `/api/anime` | `routes/anime.js` | รายการ + รายละเอียดอนิเมะ |
| `/api/watch-providers` | `routes/watchProviders.js` | ช่องทางรับชมของเรื่องหนึ่งๆ |
| `/api/anime-calendar` | `routes/calendar.js` | ปฏิทินออกอากาศอนิเมะ |
| `/api/release-calendar` | `routes/releaseCalendar.js` | ปฏิทินหนังเข้าใหม่ / ซีรีส์ตอนใหม่ |
| `/api/trending` | `routes/trending.js` | เนื้อหายอดนิยม (ใช้น้อยแล้วในตอนนี้) |

### `config/env.js` — อ่านค่าจาก `.env`

ใช้ package `dotenv` โหลดไฟล์ `.env` เข้ามาเป็น `process.env` แล้ว export ออกมาเป็น object เดียว (`config.port`, `config.tmdb.readAccessToken`, `config.mal.clientId`) เหตุผลที่ทำแบบนี้แทนที่จะเรียก `process.env.XXX` กระจายอยู่ทั่วโค้ด คือถ้าวันหนึ่งเปลี่ยนชื่อตัวแปร env จะแก้จุดเดียว

### `routes/*.js` — ตัวรับ HTTP request

แต่ละไฟล์ในนี้คือ **Express Router** — หน้าที่ของมันคือ "แปล" HTTP request (เช่น `GET /api/anime?page=2&genre=Comedy`) ให้เป็นการเรียกฟังก์ชันใน `services/` แล้วเอาผลลัพธ์ตอบกลับเป็น JSON มันไม่ควรมี logic การเรียก API ภายนอกโดยตรง (นั่นเป็นหน้าที่ของ `services/`) — route แค่ "ประสาน" งาน

ตัวอย่างที่ควรอ่านก่อนเพราะเห็น pattern ชัดที่สุด: **`routes/movies.js`**
```js
router.get('/', async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const { genre, year, search } = req.query;
    const data = search
        ? await tmdbService.searchMovies(page, search)
        : await tmdbService.getDiscoverMovies(page, { genreId: ..., year });
    res.json({ page: data.page, hasNextPage: ..., totalPages: ..., results: data.results.map(normalizeMovie) });
});
```
อ่านแบบนี้: รับ query param จาก URL → เรียก service ที่ถูกต้อง (ค้นหา หรือ เรียกดูตามหมวด) → แปลงผลลัพธ์ด้วย `normalizeMovie` → ตอบกลับ

**`routes/anime.js`** ทำแบบเดียวกันแต่มีส่วนที่ซับซ้อนกว่า — ฟังก์ชัน `findTotalPages` ที่ใช้ **binary search** หาจำนวนหน้าจริงของอนิเมะ อ่านรายละเอียดในหัวข้อ ["ทำไมอนิเมะต้อง binary search หาจำนวนหน้า"](#ทำไมอนิเมะต้อง-binary-search-หาจำนวนหน้า) ด้านล่าง

**`routes/watchProviders.js`** สั้นแต่น่าสนใจ — มันแยกทางตาม `mediaType`: ถ้าเป็น `anime` ไปถาม AniList (เพราะ AniList มีลิงก์ช่องทางรับชมอยู่ในตัวเอง) ถ้าเป็น `movie`/`tv` ไปถาม TMDB (endpoint คนละตัว)

### `services/` — คนคุยกับ API ภายนอก + แปลงข้อมูล

นี่คือส่วนที่ "หนัก" ที่สุดของ backend

#### `services/tmdbService.js` — คุยกับ TMDB
สร้าง axios client ตัวเดียว (`tmdbClient`) ที่ตั้ง base URL กับ header `Authorization` ไว้ล่วงหน้า แล้วมีฟังก์ชันสำหรับแต่ละ endpoint ของ TMDB (`getDiscoverMovies`, `searchMovies`, `getMovieById`, ...) ทุกฟังก์ชันแค่ยิง request แล้วคืน `data` กลับมาดิบๆ (ยังไม่แปลง) — การแปลงเป็นหน้าที่ของ `normalizer.js`

จุดที่น่าสังเกต: `getMovieById`/`getTvById` ยิง 2 request พร้อมกันด้วย `Promise.all` — ครั้งแรกเอาข้อมูลเต็ม (รวม keywords ไว้เช็คเนื้อหาผู้ใหญ่) ครั้งที่สองขอ `overview` เป็นภาษาไทยโดยเฉพาะ (TMDB รองรับ `language=th-TH`) แล้วเอามาแทนที่ `overview` เดิมถ้ามี

#### `services/anilistService.js` — คุยกับ AniList (ซับซ้อนสุด)
AniList เป็น **GraphQL API** ไม่ใช่ REST เหมือน TMDB (ถ้าไม่คุ้นกับ GraphQL: แทนที่จะมีหลาย endpoint แบบ TMDB, GraphQL มี endpoint เดียว รับ "query string" ที่บอกว่าอยากได้ field ไหนบ้าง ส่งไปพร้อมกันทีเดียว) ไฟล์นี้เก็บ query string พวกนั้นไว้เป็นค่าคงที่ (เช่น `ANIME_LIST_QUERY`, `ANIME_BY_ID_QUERY`)

ฟังก์ชันสำคัญคือ `postGraphQL(query, variables)` — จุดเดียวที่ยิง request จริงไปหา AniList ทุกฟังก์ชันอื่นในไฟล์นี้เรียกผ่านตัวนี้หมด เหตุผลที่รวมไว้จุดเดียว: ทำให้ใส่ **retry logic** และ **request deduplication** ได้ที่เดียวแล้วทุกคนได้ประโยชน์:
- **retry**: ถ้า AniList ตอบ 429 (rate limit) หรือ connection หลุด จะลองใหม่สูงสุด 3 ครั้ง หน่วงเวลาเพิ่มขึ้นเรื่อยๆ
- **dedup**: ถ้ามี request ที่ query + variables เหมือนกันเป๊ะยิงเข้ามาพร้อมกัน (เช่นเปิดหน้าเว็บ 2 แท็บพร้อมกัน) จะใช้ผลลัพธ์เดียวกันแทนที่จะยิงไป AniList ซ้ำ — เก็บ "สัญญา (Promise) ที่กำลังทำงานอยู่" ไว้ใน `Map` ชื่อ `inFlightRequests`

#### `services/malService.js` — คุยกับ MyAnimeList
ไฟล์เล็กที่สุด มีฟังก์ชันเดียว `getAnimeRating(malId)` ไปขอ field `rating` ของอนิเมะจาก MAL API (ใช้ `idMal` ที่ได้มาจาก AniList เป็นตัวเชื่อม เพราะ AniList เก็บ ID ของ MAL ไว้ในตัวเอง)

#### `services/translateService.js` — แปลคำอธิบายเป็นไทย
ใช้ package `google-translate-api-x` แปล description ภาษาอังกฤษของอนิเมะเป็นไทย มี `stripHtml()` ตัดแท็ก HTML (เช่น `<br>`) ออกก่อนแปล เพราะคำอธิบายจาก AniList มักมี HTML แทรกอยู่ ถ้าแปลไม่สำเร็จ (เช่น service ล่ม) จะ catch แล้วคืนข้อความอังกฤษต้นฉบับแทน ไม่ทำให้ทั้งหน้าพัง

#### `services/normalizer.js` — หัวใจของการแปลงข้อมูล
ไฟล์นี้**ไม่เรียก API ใดๆ เลย** เป็น pure function ล้วนๆ (input เดิม → output เดิมเสมอ) เหมาะมากสำหรับมือใหม่ที่จะเริ่มอ่าน เพราะไม่มี side effect ให้งง และเป็นไฟล์เดียวที่มี**automated test ครบที่สุด** (`normalizer.test.js`) ลองเปิดคู่กันจะเห็นว่าแต่ละฟังก์ชันคาดหวัง input/output แบบไหน

ฟังก์ชันหลักที่ควรรู้จัก:
- `normalizeMovie` / `normalizeTv` / `normalizeAnime` — แปลงข้อมูลดิบจาก TMDB/AniList ให้เป็น **shape เดียวกัน** (`uniqueId`, `title`, `posterUrl`, `score`, `genres`, ...) นี่คือเหตุผลที่ frontend เขียน component เดียว (`MediaCard`) ใช้แสดงได้ทั้ง 3 ประเภท
- `isAdultAnime` / `isAdultTmdb` — เช็คเนื้อหาสำหรับผู้ใหญ่ คนละ logic กันเพราะ AniList กับ TMDB บอกข้อมูลนี้คนละแบบ
- `extractStreamingPlatforms` — กรองช่องทางรับชมของอนิเมะให้เหลือแค่ที่มีในไทย (`TH_AVAILABLE_SITES`) และแปลงชื่อช่อง YouTube จาก handle (`@museasia`) เป็นชื่อที่อ่านง่าย (`Muse Asia`)
- `ageRatingLabel` — map รหัสเรตติ้งจาก MAL (`pg_13`, `r+`, ...) เป็นข้อความไทย

---

## ฝั่ง Frontend (`frontend/src/`)

### `main.jsx` — จุดเริ่มต้น
mount React app เข้า `<div id="root">` ใน `index.html` ห่อด้วย `<BrowserRouter>` (เปิดใช้ routing แบบ URL จริง ไม่ใช่ hash `#`) และ `<StrictMode>` (โหมดช่วยเตือน bug ตอน dev เช่นจะเรียก `useEffect` สองรอบโดยตั้งใจเพื่อจับ bug ที่เกิดจาก side effect ที่ทำงานไม่ถูกต้อง)

### `App.jsx` — ผังเส้นทาง (routing)
กำหนดว่า URL ไหนแสดง component ไหน ผ่าน `<Routes>`/`<Route>` ของ `react-router-dom` สังเกตว่า `DetailPage` ถูกใช้ซ้ำ 3 ครั้งสำหรับหนัง/ซีรีส์/อนิเมะ โดยส่ง prop `mediaType` ต่างกันไป — component เดียวจัดการได้ทั้ง 3 แบบเพราะ backend คืนข้อมูลรูปแบบเดียวกันแล้ว (จากที่อธิบายไปข้างบน)

### `pages/` — หน้าเว็บระดับ route

แต่ละไฟล์ในนี้ผูกกับ 1 URL ทำหน้าที่ **ดึงข้อมูล + จัดวาง component ย่อยๆ** ไม่ควรมี UI ซับซ้อนอยู่ในตัวมันเอง (UI ซับซ้อนแยกไปเป็น component ใน `components/`)

- **`Home.jsx`** — หน้าแรก มี hero banner + carousel "อนิเมะออกอากาศวันนี้" (ดึงจาก `/api/anime-calendar/today`)
- **`Movies.jsx` / `TvShows.jsx` / `Anime.jsx`** — เหมือนกันเป๊ะทั้ง 3 ไฟล์ ต่างกันแค่ค่า `mediaType` ที่ส่งให้ `MediaGrid` เก็บ state ของช่องค้นหา (`searchQuery`) กับตัวกรอง (`filters`) ไว้ที่ชั้นนี้ แล้วส่งลงไปให้ `SearchBar`/`FilterBar`/`MediaGrid` ใช้ (เป็น pattern "lift state up" — เก็บ state ไว้ที่ parent ร่วมของ component ที่ต้องใช้ค่าเดียวกัน)
- **`DetailPage.jsx`** — หน้ารายละเอียด ดึงข้อมูลหลัก (`/api/{movies|tv-shows|anime}/:id`) และช่องทางรับชม (`/api/watch-providers/...`) แยก 2 รอบ (คนละ `useEffect`) เพราะช่องทางรับชมต้องรอให้รู้ `title`/`mediaType` ก่อนถึงจะยิงได้
- **`AnimeCalendar.jsx`** — หน้าปฏิทิน มี 3 แท็บ (หนัง/ซีรีส์/อนิเมะ) ดึงข้อมูลทั้ง 3 เส้นพร้อมกันด้วย `Promise.all` ตอน mount ครั้งเดียว แล้วสลับแค่ส่วนที่แสดงผลตาม tab ที่เลือก (ไม่ได้ fetch ใหม่ทุกครั้งที่สลับแท็บ)

### `components/` — ชิ้นส่วน UI ที่ใช้ซ้ำ

ไฟล์ที่ควรอ่านก่อนเพราะเป็นแกนกลางของเกือบทุกหน้า:

**`MediaGrid.jsx`** — ตัวจัดการ fetch รายการ + pagination ให้หน้า Movies/TvShows/Anime ทั้ง 3 หน้า จุดที่ซับซ้อนที่สุดในนี้คือการจัดการตอน**เปลี่ยนตัวกรอง** (เช่นเปลี่ยนแนวหนังตอนอยู่หน้า 5) — ถ้า fetch หน้า 5 ของตัวกรองใหม่ทันทีจะพังเพราะตัวกรองใหม่อาจมีแค่ 2 หน้า ในโค้ดแก้ด้วยการเช็คว่า "identity" (ประเภท+ตัวกรอง) เปลี่ยนไหมก่อน ถ้าเปลี่ยนให้ reset กลับหน้า 1 ก่อนแล้วค่อย fetch (ดูฟังก์ชัน `useEffect` ตัวหลักในไฟล์ พร้อมคอมเมนต์อธิบายไว้ในโค้ดเลย)

**`MediaCard.jsx`** — การ์ดแสดงหนัง/ซีรีส์/อนิเมะ 1 เรื่อง ใช้ prop shape เดียวกับที่ `normalizer.js` คืนมา จึงใช้ได้กับข้อมูลทั้ง 3 ประเภท

**`Pagination.jsx`** — เรนเดอร์ปุ่มเลขหน้า มีฟังก์ชัน `getPageNumbers(current, total)` ที่คำนวณว่าจะโชว์เลขหน้าไหนบ้างและตรงไหนต้องใส่ `...` (เช่นหน้า 1, ..., 8, 9, 10, 11, 12, ..., 20) ลองเปิด `Pagination.test.jsx` คู่กันจะเห็นตัวอย่าง input/output ชัดๆ

**`Countdown.jsx`** — ตัวนับถอยหลังแบบเรียลไทม์ ใช้ `setInterval` อัปเดตทุก 1 วินาที (ต้อง `clearInterval` ตอน component หายไปด้วย ไม่งั้น memory leak — ดูใน `useEffect` return function)

**`PlatformIcon.jsx`** — ไอคอนช่องทางรับชม มี logic เล็กๆ ที่น่าสังเกต: ถ้ามี prop `color` มาด้วย (มาจาก AniList ที่ให้ไอคอนขาวล้วน+สีพื้นหลังแยก) จะวาดวงกลมพื้นหลังสีนั้นเอง ถ้าไม่มี (มาจาก TMDB ที่ให้โลโก้เต็มสีอยู่แล้ว) ก็แสดงรูปตรงๆ

### `utils/` — ฟังก์ชันช่วยเล็กๆ

- **`slugify.js`** — แปลงชื่อเรื่องเป็น URL-friendly string (`"Attack on Titan"` → `"attack-on-titan"`) ใช้สร้าง URL หน้า detail ให้อ่านง่ายและ SEO ดีกว่าใช้แค่ ID
- **`genreLabels.js`** — แปลชื่อแนวหนัง/อนิเมะจากอังกฤษเป็นไทย เก็บเป็น object แบบ lookup table ธรรมดา

---

## เดินตามข้อมูล 1 คำขอ (ตัวอย่างที่ช่วยให้เห็นภาพรวมเร็วที่สุด)

### เคส 1: เปิดหน้า "อนิเมะ" แล้วเปลี่ยนตัวกรองเป็นแนว Comedy

1. ผู้ใช้เปิด `/anime` → React Router เรนเดอร์ `pages/Anime.jsx`
2. `Anime.jsx` เรนเดอร์ `<MediaGrid mediaType="anime" ... />`
3. `MediaGrid` มี `useEffect` ที่ยิง `fetch("http://localhost:4000/api/anime?page=1")`
4. คำขอไปถึง `backend/server.js` → ถูกส่งต่อไปให้ `routes/anime.js` (เพราะ path ขึ้นต้นด้วย `/api/anime`)
5. `routes/anime.js` เรียก `anilistService.getAnimeList(1, 20, {})` → ไปเรียก `postGraphQL()` → ยิง GraphQL request จริงไปหา AniList
6. ผลลัพธ์ดิบจาก AniList ถูกส่งผ่าน `.map(normalizeAnime)` แปลงเป็น shape กลาง
7. `routes/anime.js` ตอบกลับเป็น JSON `{ page, totalPages, results }`
8. `MediaGrid` ได้ข้อมูลมา `setItems(data.results)` → React re-render แสดงการ์ดผ่าน `MediaCard`
9. ผู้ใช้เลือกแนว "Comedy" ที่ `FilterBar` → เรียก `onChange` ที่ส่งขึ้นไปเปลี่ยน state `filters` ใน `Anime.jsx` → ค่านี้ไหลลงมาที่ `MediaGrid` เป็น prop ใหม่
10. `MediaGrid` เห็นว่า "identity" (mediaType+filters) เปลี่ยน → reset `page` กลับเป็น 1 → `useEffect` ยิง fetch ใหม่ไปที่ `/api/anime?page=1&genre=Comedy`
11. รอบนี้ `routes/anime.js` ต้องหาว่า genre นี้มีกี่หน้าจริงๆ ด้วย (ดูหัวข้อถัดไป) แล้วค่อยตอบกลับ

### เคส 2: คลิกการ์ดเพื่อดูรายละเอียด

1. `MediaCard` เป็น `<Link to="/anime/detail/16498/attack-on-titan">` (สร้าง URL ด้วย `slugify`)
2. React Router เรนเดอร์ `DetailPage` พร้อม `mediaType="anime"` (กำหนดไว้ใน `App.jsx`) และอ่าน `id` จาก URL ด้วย `useParams()`
3. `DetailPage` ยิง `fetch("/api/anime/16498")` → `routes/anime.js` เส้น `GET /:id` → เรียก `anilistService.getAnimeById` + `tmdbService.findCompanyLogoUrl` (หาโลโก้สตูดิโอ) + `translateService.translateToThai` + `malService.getAnimeRating` **พร้อมกัน** ด้วย `Promise.all` (เร็วกว่าเรียกทีละอันมาก)
4. ได้ข้อมูลมาแล้ว `DetailPage` ยิง `fetch` รอบสองไปที่ `/api/watch-providers/anime/16498` (ต้องรอรอบแรกเสร็จก่อนเพราะต้องใช้ `title`)

---

## ทำไมอนิเมะต้อง binary search หาจำนวนหน้า

อันนี้เป็นจุดที่ซับซ้อนสุดในโปรเจกต์ อธิบายแยกเพราะเข้าใจยากถ้าไม่มีบริบท:

**ปัญหา**: หน้า list ต้องรู้ "มีกี่หน้าทั้งหมด" เพื่อวาดปุ่มเลขหน้า (`Pagination`) TMDB บอกค่านี้มาตรงๆ ในคำตอบ (`total_pages`) แต่ **AniList ไม่บอกค่าที่แม่นยำ** — ถ้ากรองผลลัพธ์ให้แคบแค่ไหนก็ตาม (เช่น genre เดียว + ปีเดียว + ฤดูกาลเดียว) AniList ก็ยังคืน total มาเป็นค่าคงที่สูงๆ เท่าเดิมอยู่ดี (ไม่ตรงกับจำนวนจริง)

**วิธีแก้ (`findTotalPages` ใน `routes/anime.js`)**: ในเมื่อเชื่อค่าที่ AniList บอกไม่ได้ ก็ต้อง "ทดลองยิง" ไปถามเองว่าหน้าไหนยังมีผลลัพธ์อยู่ ใช้หลัก **binary search** (แบ่งครึ่งค้นหา) แทนที่จะไล่ทีละหน้า (ซึ่งอาจต้องยิงถึง 250 ครั้ง!) — ยิงไปที่หน้ากึ่งกลางก่อน ถ้ายังมีผลลัพธ์ให้ขยับไปค้นครึ่งหลัง ถ้าไม่มีให้ขยับไปค้นครึ่งแรก ทำซ้ำจนกว่าจะเจอหน้าสุดท้ายที่แน่นอน วิธีนี้ใช้แค่ ~8 ครั้งในการหาคำตอบแทนที่จะต้องยิงเป็นร้อยครั้ง

หาเจอแล้วจะ**เก็บผลลัพธ์ไว้ใน cache** (ตัวแปร `pageCountCache`) นาน 1 ชั่วโมง ต่อชุดตัวกรอง เพื่อไม่ต้องคำนวณซ้ำทุกครั้งที่มีคนกรองแบบเดิม

---

## คำศัพท์ที่เจอบ่อยในโค้ดนี้ (สรุปสั้นๆ)

| คำศัพท์ | ความหมายในบริบทนี้ |
|---|---|
| **Router / Route** | ตัวจับคู่ URL → ฟังก์ชันที่จะรัน (ฝั่ง backend คือ Express Router, ฝั่ง frontend คือ React Router) |
| **Middleware** | ฟังก์ชันที่ Express รันคั่นกลางก่อนถึง route handler (เช่น `cors()`, error handler ตัวสุดท้ายใน `server.js`) |
| **Normalize** | แปลงข้อมูลจากหลายแหล่งที่มี shape ต่างกัน ให้กลายเป็น shape เดียวกัน |
| **useState** | React hook เก็บค่าที่เปลี่ยนแล้วต้อง re-render UI |
| **useEffect** | React hook รันโค้ดหลัง component render เสร็จ (ส่วนใหญ่ใช้ยิง fetch ในโปรเจกต์นี้) |
| **Promise.all** | รอหลาย async operation ให้เสร็จ**พร้อมกัน**แทนที่จะรอทีละอัน (เร็วกว่ามากเมื่อ operation ไม่ได้ขึ้นกับกัน) |
| **Dedup (deduplication)** | กันไม่ให้ request ที่เหมือนกันถูกยิงซ้ำโดยไม่จำเป็น |
| **In-flight request** | request ที่ยิงออกไปแล้วแต่ยังไม่ได้คำตอบกลับมา |

## แนะนำลำดับการอ่านโค้ดถ้าเพิ่งเริ่ม

1. `backend/services/normalizer.js` + `backend/services/normalizer.test.js` คู่กัน (pure function อ่านง่ายสุด ไม่มี side effect)
2. `backend/routes/movies.js` (route ที่ simple ที่สุด เห็น pattern route → service → normalize → response)
3. `backend/server.js` (เห็นภาพรวมว่า route ต่างๆ ถูกต่อเข้าด้วยกันยังไง)
4. `frontend/src/pages/Movies.jsx` → `frontend/src/components/MediaGrid.jsx` (เห็นฝั่ง frontend เรียก backend ยังไง)
5. `frontend/src/components/Pagination.jsx` + `Pagination.test.jsx` คู่กัน
6. ที่เหลือ (`anime.js`, `anilistService.js`, `DetailPage.jsx`, `AnimeCalendar.jsx`) ค่อยอ่านทีหลังเพราะซับซ้อนกว่า
