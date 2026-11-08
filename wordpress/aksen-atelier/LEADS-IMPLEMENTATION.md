# Aksen Photo – indywidualne formularze i pomiar leadów

**Status: gotowa paczka źródłowa, testy składni i logiki wykonane offline. Nie wdrożono na `test.aksen-photo.pl`.**

Data: 8 listopada 2026. Docelowa domena testowa: `https://test.aksen-photo.pl/`. Produkcji `https://aksen-photo.pl/` i galerii Picu nie wolno zmieniać podczas testów.

## Dlaczego

W obecnym stagingu na 22 z 25 stron osadzono jeden formularz Fluent Forms `[fluentform id="3"]`. To utrudnia zebranie potrzebnych danych i uniemożliwia czysty podział leadów na usługi bez dodatkowej klasyfikacji.

**Docelowo:** 16 niezależnych wariantów formularzy Fluent Forms na 20 istniejących stronach usługowych/lokalnych plus gotowy wariant USC dla przyszłego landing page'a. Kontakt zachowuje istniejący formularz nr 3. Dzielenie formularza w miejscowościach jest celowe: użytkownik wybiera usługę, a lead zapisuje nazwę miejscowości.

### Przykładowe pytania (widoczne na formularzach)

| Formularz | Pola dopasowane do usługi |
|---|---|
| Ślub i wesele | rodzaj ceremonii, zakres reportażu, lokalizacje |
| Ślub cywilny / USC | urząd, zakres, liczba gości |
| Chrzest | parafia, zakres kościół/przyjęcie, lokalizacja przyjęcia |
| Komunia | pojedyncze dziecko / grupa, parafia, liczba dzieci |
| Urodziny | rodzaj imprezy, miejsce, krótki film |
| Studniówka | szkoła, liczba uczestników, polonez / cały wieczór |
| Sesja biznesowa | zastosowanie zdjęć, liczba osób, miejsce |
| Event / reportaż | typ eventu, liczba uczestników, godziny |
| Sesja rodzinna | liczba osób, plener/dom, styl |
| Narzeczeńska | miejsce i termin względem ślubu |
| Ciążowa | plener/dom, uczestnicy, bez pytań zdrowotnych |
| Kobieca | styl i lokalizacja |
| Wieczór panieński | liczba uczestniczek, zakres reportażu |
| Produktowa | liczba produktów, kanał sprzedaży, styl zdjęć |
| TFP | link portfolio, typ projektu (nie liczyć jako płatny lead) |
| Lokalny | usługa i miasto, lokalizacja strony przekazywana z formularza |

Wspólne pola: imię, e-mail, opcjonalny telefon, opcjonalna data i opis. Żaden formularz nie wymaga dokładnego adresu zamieszkania ani wrażliwych informacji.

## Wdrożenie na **staging** (tylko po backupie)

1. Zweryfikuj, że aktywny motyw to `wp-content/themes/aksen-atelier`, staging ma `blog_public=0`, działa Fluent Forms 6.2.x i bazowy formularz nr 3 jest poprawnie skonfigurowany (jego powiadomienia idą do `aksen.fotografia@gmail.com`).
2. Wykonaj świeży backup plików motywu i **bazy WordPress**. Zachowaj możliwość powrotu.
3. Skopiuj `inc/service-leads.php` do `wp-content/themes/aksen-atelier/inc/service-leads.php` oraz `assets/js/aksen-lead-tracking.js` do tego samego folderu w motywie.
4. Dopisz **jedną** linię na końcu obecnego `functions.php` (bez podmieniania całej zawartości):

   ```php
   require_once get_stylesheet_directory() . '/inc/service-leads.php';
   ```

5. W WordPressie przejdź **Narzędzia → Aksen – formularze usługowe**. Potwierdź backup i kliknij **Utwórz brakujące formularze**. Generator używa natywnego `FluentForm\\App\\Services\\Form\\FormService::duplicate()` i `::update()`; kopiuje powiadomienia i ustawienia bazowe. Każda usługa ma osobny identyfikator.
6. Sprawdź listę formularzy: nowe nazwy `Aksen Photo – [nazwa] [Lead]`. Na stronie usługi nowy shortcode automatycznie zastępuje w renderowaniu `[fluentform id="3"]`, nie nadpisuje tekstów, SEO, FAQ ani treści WordPress. Wpływ na istniejące opublikowane strony można szybko cofnąć, usuwając linię `require_once`.
7. Sprawdź przynajmniej: śluby, chrzty, komunię, urodziny, studniówkę, sesję biznesową i miejscowość. Testuj w trybie incognito bez ciasteczek, na telefonie i desktopie.
8. Zrób **próbne** wysłanie formularza w każdej kategorii, sprawdź wpis w Fluent Forms → Entries i dotarcie maila. Próbne zgłoszenia oznacz `TEST` i **nie licz ich jako prawdziwych konwersji** (np. filtrem w GTM lub po usunięciu próbek ze sprawozdań).
9. Sprawdź Lighthouse mobile oraz czy CookieYes nie uruchamia GA4, Google Ads i Meta Pixel przed zgodą.

**Bezpieczne ponowienie:** generator pomija formularze, które zostały wcześniej utworzone i są obecne. Nie nadpisuje późniejszych ręcznych zmian formularzy. Bazowy nr 3 zostaje bez zmian i jest nadal dostępny na stronie kontaktu.

**USC:** formularz jest gotowy, ale będzie używany po utworzeniu lub przypięciu dedykowanego landing page'a `fotograf-na-slub-cywilny-usc-szczecin` (lub `fotograf-slub-cywilny-usc-szczecin`). Nie twórz nowego URL produkcyjnego bez ustalenia przekierowań i strategii SEO.

## Co rejestruje JavaScript

| `dataLayer.event` | Kiedy | Czy jest konwersją? |
|---|---|---|
| `aksen_form_view` | Formularz wchodzi w pole widzenia | Nie |
| `aksen_form_start` | Pierwsze wejście w pole formularza | Nie |
| `aksen_lead_success` | Oficjalny `fluentform_submission_success`, po potwierdzeniu zapisu | **Tak** |
| `aksen_contact_click` | Kliknięcie numeru telefonu | Nie, mikrointerakcja |

Dane w każdym zdarzeniu: `form_id`, `service_type`, `page_path`, `lead_source`, dostępne `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Przy sukcesie dodatkowo `aksen_event_id`, `lead_type`. **Nie wysyłaj do dataLayer imienia, e-maila, telefonu, treści wiadomości, IP ani surowego gclid/fbclid**.

Warianty formularzy zapisują do Fluent Forms ukryte pola: `ak_service`, `ak_page`, `ak_lead_event_id` oraz UTM. UTM pochodzą **wyłącznie z bieżącego URL** i nie są utrwalane w localStorage ani marketingowych cookies. Po nawigacji na kolejne strony bez UTM atrybucja może być niepełna – dla płatnych kampanii kieruj użytkownika na właściwą podstronę usługi z formularzem na tym samym URL.

## Google Tag Manager / GA4 / Google Ads / Meta – mapowanie

### GA4 (pomiar usługi; wcześniej zanotowane `G-PQFD3M4VTP`)

1. W GTM utwórz zmienne warstwy danych: `service_type`, `form_id`, `page_path`, `aksen_event_id`, `utm_source`, `utm_medium`, `utm_campaign`.
2. Utwórz wyzwalacz **Zdarzenie niestandardowe**: nazwa `aksen_lead_success`.
3. Utwórz tag **Google Analytics: GA4 Event**, nazwa zdarzenia **`generate_lead`**; parametry: `service_type`, `form_id`, `lead_source`, `aksen_event_id`. Nie przypisuj żadnej fikcyjnej wartości w PLN. Tag uruchamiaj na `aksen_lead_success`, z wymaganą zgodą `analytics_storage`.
4. W GA4 oznacz `generate_lead` jako kluczowe zdarzenie. Zarejestruj `service_type` jako niestandardowy wymiar zakresu zdarzenia, żeby raportować kategorię usługi.
5. `aksen_form_view` i `aksen_form_start` służą do analizy spadków w lejku; nie oznaczaj ich jako konwersji.

### Google Ads

- Konto Ads ma **niezweryfikowane AW-ID i etykietę konwersji**. Nie dodawaj wymyślonych wartości.
- Po weryfikacji utwórz konwersję typu **Przesłanie formularza kontaktowego**. Tag Google Ads Conversion Tracking w GTM uruchamiaj na `aksen_lead_success`, ale tylko po przyznaniu właściwych zgód (`ad_storage`, `ad_user_data`).
- Alternatywnie importuj `generate_lead` z GA4. Nie ustawiaj **obu** sposobów jako konwersji podstawowych dla tego samego leada, żeby nie zawyżyć liczby zgłoszeń.
- Gdy reklamy USC mają osobną kampanię, możesz segmentować po `service_type = usc` i przypisać osobne działania konwersji lub wartości leadów po uzyskaniu danych o jakości.

### Meta Ads (`Meta Pixel 2998967330426508`)

- W GTM utwórz tag Meta Pixel `Lead` uruchamiany wyłącznie na `aksen_lead_success` po zgodzie kategorii reklamowej CookieYes. Parametry: `content_name = {{DLV service_type}}`, `content_category = photography_service` oraz `eventID = {{DLV aksen_event_id}}` (konieczne przy późniejszym CAPI deduplication).
- **Nie uruchamiaj dodatkowego Meta `Lead` przez inny pixel/plugin/automatyczny regułę**. W Events Manager sprawdź, czy Lead jest tylko raz po jednym zgłoszeniu.
- Dla `tfp` traktuj zdarzenie jako kontakt, ale wyklucz je z komercyjnych optymalizacji Ads, jeżeli reklamy sprzedają usługi płatne.
- Conversions API (CAPI) nie jest w tej paczce aktywowane: wymaga osobnego, bezpiecznego serwerowego tokena i testu tego samego `aksen_event_id` po stronie serwera, bez ujawniania tokena w JS.

### Zgody i RODO

- `dataLayer` sam w sobie nie wysyła żądań reklamowych. Dopiero **odpowiednio skonfigurowane tagi w GTM** wyślą `generate_lead` / Ads Conversion / Meta `Lead`, o ile CookieYes udostępni zgodę.
- Domyślne stany Consent Mode v2 muszą być `denied` przed uruchomieniem tagów. Przesyłanie danych użytkowników w celach reklamowych wymaga odpowiednich zgód i zgodnej konfiguracji.
- Nie używaj obowiązkowej zgody marketingowej jako warunku wysłania zwykłego zapytania o ofertę. Informacja o przetwarzaniu danych i link do polityki prywatności pozostają na formularzu.

## Test plan – przejście musi zakończyć się wynikiem pozytywnym

| Test | Oczekiwany wynik |
|---|---|
| Walidacja pól nie przechodzi | Brak `aksen_lead_success` |
| Formularz wysyła się prawidłowo | Jedno `aksen_lead_success` ze swoim `service_type` |
| Kliknięto Wyślij dwukrotnie | Jeden event dla jednego potwierdzonego zapisu |
| Ponowne poprawne wysłanie | Nowe `aksen_event_id` i druga konwersja |
| Kliknięto numer telefonu | `aksen_contact_click`, bez `generate_lead` |
| Użytkownik odrzuca zgody reklamowe | Brak wysyłki Pixel/Ads (tagi zablokowane) |
| Formularz z reklamy `?utm_source=google&utm_campaign=sluby` | UTM zapisane z leadem i w `dataLayer` |
| Jeden klient testowy | Jedno zdarzenie GA4 i Meta, nie dwa |
| Zdarzenie CAPI w przyszłości | Ten sam event ID po obu stronach; deduplikacja potwierdzona |
| Mobile 320/375/768 | Pola mieszczą się w ekranie bez poziomego scrolla |
| SEO | Te same slug, nagłówki, FAQ, adresy i noindex na stagingu |

## Co jest jeszcze do wdrożenia

- Kod WordPress + formularze **nie są jeszcze na stagingu**. WPVibe PRO ma obecnie 0 dostępnych wywołań w limicie 24 h. Przed instalacją potrzebna jest kopia bazy.
- Konto Google Tag Manager nie jest połączone z tym środowiskiem narzędziowym, więc tagi GA4, Google Ads i Meta nie zostały opublikowane ani zweryfikowane w Preview/DebugView.
- Google Ads AW-ID i etykieta konwersji nie są zweryfikowane.
- Nie wysyłano testowych danych klientów ani maili.

## Uruchomione lokalnie testy

```bash
php -l inc/service-leads.php
node --check assets/js/aksen-lead-tracking.js
php tests/service-leads.test.php
node tests/lead-tracking.test.js
```

Paczka nie zawiera nowego pluginu WordPress ani żadnych danych dostępowych. Code review i staging QA przed produkcją są wymagane.