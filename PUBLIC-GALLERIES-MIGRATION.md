# Aksen Photo — tylko Picu jako wtyczka galerii

## Docelowy podział
- **Picu**: prywatne kolekcje klientów, wybór zdjęć, akceptacje i ich prywatne pliki. Bez zmian w kodzie, bazie i katalogach `uploads/picu/`.
- **Aksen Atelier**: publiczne portfolio, zdjęcia w artykułach, sesje i reportaże. WordPress Media Library i natywny blok Galeria albo shortcode motywu. Bez FooGallery, Modula lub nowych wtyczek.
- **EWWW Image Optimizer**: tylko optymalizacja dopuszczonych, publicznych załączników. To nie jest wtyczka galerii. Oryginały pozostają nietknięte.

## Gotowy moduł (bez nowej wtyczki)
- `inc/public-gallery.php` — shortcode `[aksen_gallery ids="123,456,789" id="reportaz-2026" per_page="24"]`, zgodność z natywnym `[gallery ids="..."]`.
- `assets/css/site.css` — responsywny układ zdjęć bez przycinania: 3 kolumny desktop, 2 tablet, 1 telefon.
- `assets/js/public-gallery.js` — podgląd `<dialog>` z klawiaturą, ekranem dotykowym, bez zewnętrznych bibliotek i bez wpływu na Picu.
- WordPress `wp_get_attachment_image()` automatycznie dostarcza istniejące warianty `srcset`, `sizes` i wymiary zdjęć.
- Do HTML trafia maks. 24 zdjęcia na stronę galerii (konfigurowalne 6–48); kolejne strony mają zwykłe, indeksowalne URL-e.
- Kod odrzuca ID zdjęć z katalogów Picu i zdjęcia powiązane z kolekcjami Picu.
- Pliki pełnej rozdzielczości pobierane są wyłącznie po otwarciu podglądu.

## Migracja galerii produkcyjnych
1. **Backup** wszystkich plików produkcji (w tym katalogu `picu`) i bazy danych, potwierdzona możliwość przywrócenia. Nie wykonywać żadnych usunięć przed tym etapem.
2. Sporządzić inwentaryzację: post ID i slug, dawne shortcode'y `[foogallery]`, `[modula]`, `[gallery]`, bloki galerii, oraz widżety galerii w metadanych `_elementor_data`. Istnieje 55 wpisów z danymi Elementora, które trzeba sprawdzić przed wyłączeniem go.
3. Dla każdej publicznej galerii zapisać **oryginalną kolejność ID załączników i podpisów**, na podstawie danych produkcji. Nie używać stagingowych ID, bo identyfikatory WordPress mogą się różnić.
4. Na stagingu zaktualizować galerię do bloku Galeria WordPress albo do `[aksen_gallery ids="..."]`. Nie importować mediów ani nie powielać plików.
5. Zweryfikować pełną kolejność zdjęć, ich liczbę, podpisy/alt, linki, wersję mobile i desktop, nawigację, paginację, brak błędnych URL-i, obecność galerii w starych wpisach i nowych landingach.
6. Dopiero gdy **zero aktywnych referencji FooGallery/Modula i układów galerii Elementora**: dezaktywować te wtyczki. Trzymać dostępny backup i możliwość przywrócenia do czasu testów produkcyjnych. Użytkownik nie chce wtyczek galerii poza Picu.
7. Po przeniesieniu motywu ponownie zweryfikować prywatny adres kolekcji Picu, dostęp klientów, wybieranie/akceptację zdjęć i brak zdjęć Picu w portfolio publicznym.

## Optymalizacja zdjęć — bez ryzyka dla Picu
- **Nie wykonywać** globalnego `regenerate-thumbnails`, optymalizacji całej biblioteki, `wp media regenerate --yes`, automatycznej kompresji na `uploads/picu`, ani masowej zmiany fizycznych plików.
- Publiczne galerie: wykorzystywać istniejące rozmiary WordPress (`medium_large`, `large`, 1536, 2048) i `srcset`; w miejscach wymagających dużego zdjęcia podawać większy dostępny wariant, żeby uniknąć pikselozy.
- EWWW może przygotowywać WebP/AVIF dla **wybranych publicznych** załączników po wcześniejszym potwierdzeniu wykluczenia katalogu Picu, backupu i wielkości zdjęć.
- Do 25 tys. obecnych załączników nie wolno stosować globalnej masowej kompresji. Na produkcji wykryto ~7842 załączniki Picu i ~17304 w standardowych folderach rocznych.
- Zdjęcia główne: odpowiednio duży wariant, `fetchpriority=high` tylko dla właściwego LCP; pozostałe zdjęcia lazy. Nie pobierać oryginału o kilkunastu MB do siatki galerii.
- Jeśli zewnętrzny URL zdjęcia nie ma mapowania na attachment ID, najpierw odszukać jego istniejący odpowiednik w produkcyjnej bibliotece — nie duplikować uploadu.

## Wstrzymanie przełączenia
**Nie aktywować nowego motywu ani nie wyłączać istniejących wtyczek galerii na produkcji**, dopóki nie mamy spójnego raportu migracji wszystkich galerii, backupu i testu przywrócenia. Ten PR przygotowuje kod, nie przenosi jeszcze galerii ani nie dezaktywuje wtyczek.
