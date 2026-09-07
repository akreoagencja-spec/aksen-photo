# AGENTS.md

## Krytyczna zasada wdrożeniowa — Aksen Photo

Do czasu wyraźnej decyzji właściciela projektu o przełączeniu produkcji:

- obecna strona `https://aksen-photo.pl/` pozostaje produkcyjna,
- nie wolno usuwać, nadpisywać ani migrować destrukcyjnie obecnej instalacji WordPress,
- nie wolno usuwać ani modyfikować destrukcyjnie obecnej bazy danych,
- nie wolno zmieniać DNS domeny `aksen-photo.pl` na nowy frontend bez wyraźnej zgody,
- nowy projekt Next.js ma działać wyłącznie jako staging/test,
- wszystkie zmiany należy wykonywać tak, aby istniała pełna możliwość powrotu do starej strony,
- przed jakąkolwiek przyszłą migracją produkcyjną wymagany jest pełny backup plików, bazy danych i konfiguracji,
- przed przełączeniem produkcji należy zweryfikować SEO, istniejące adresy URL, przekierowania, formularze, analitykę, SSL, sitemapę i Core Web Vitals,
- żadna operacja testowa nie może naruszyć obecnej strony ani jej danych.

## Tryb pracy

1. Rozwój i testy wykonuj na Vercel Preview / staging.
2. WordPress produkcyjny traktuj obecnie jako źródło danych i system, którego nie wolno uszkodzić.
3. Preferuj operacje tylko do odczytu na produkcji.
4. Każdą operację zapisu na produkcji wykonuj tylko wtedy, gdy jest konieczna i bezpieczna.
5. Nie uruchamiaj destrukcyjnych migracji, resetów, importów nadpisujących ani czyszczenia bazy.
6. Produkcyjne przełączenie domeny nastąpi wyłącznie po odrębnej, jednoznacznej akceptacji właściciela projektu.
