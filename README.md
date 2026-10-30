# TV Dashboard (TizenBrew-module)

Een strakke launcher voor je Samsung Tizen TV: klok, weer, je apps en je HDMI-bronnen, met een instellingenmenu op de TV zelf.

## Installeren via TizenBrew

1. Maak op GitHub een **publieke** repo, bijv. `tv-dashboard`.
2. Upload de inhoud van deze map (`package.json`, `README.md` en de map `app/`) via
   *Add file → Upload files*. `package.json` moet in de root staan.
3. Op de TV: **TizenBrew → Module Manager → Add GitHub module** en vul in (zonder `gh/`, dat zet TizenBrew er zelf voor):
   ```
   stingone/tv-dashboard
   ```
4. Ga terug naar het **TizenBrew-startscherm** en start daar **TV Dashboard**.
   (In de Module Manager betekent OK op een module: verwijderen.)

## Automatisch starten bij het aanzetten van de TV

1. **TizenBrew → Module Manager →** selecteer TV Dashboard → **Autolaunch**. TizenBrew opent dan meteen het dashboard.
2. **TV-instellingen → Algemeen → Smart-functies → Laatste app automatisch starten** (*Autorun Last App*) aan.
   Laat TizenBrew/het dashboard openstaan als je de TV uitzet; bij aanzetten komt het terug.
   (Naam en plek verschillen per bouwjaar; op sommige modellen heet het *Autorun Smart Hub*.)

## Bediening

| Toets | Actie |
|---|---|
| ◀ ▶ ▲ ▼ | Navigeren |
| OK | App starten / naar bron |
| ▲ vanaf de app-rij, dan OK | Instellingen (tandwiel) |
| Geel | Instellingen direct openen |
| Terug | Instellingen sluiten |

In **Instellingen** kies je achtergrond (sterrenhemel, noorderlicht, minimaal), 24/12-uursklok, weer aan/uit,
welke apps in de rij staan (OK = aan/uit, ◀ ▶ = volgorde) en per HDMI-ingang welk apparaat erop zit.
Op de TV worden geïnstalleerde apps automatisch herkend; apps die niet in de lijst staan verschijnen er ook.
Instellingen worden op de TV bewaard.

De eerste keer dat je een bron kiest vraagt de TV om toestemming voor "TV Dashboard": kies **Toestaan**.

## Updates

TizenBrew haalt de bestanden via jsDelivr, dat een branch tot ~12 uur cachet. Direct verversen:
`https://purge.jsdelivr.net/gh/<jouw-github-naam>/tv-dashboard@main/app/app.js` (per gewijzigd bestand).

## Lokaal bekijken

```
python -m http.server 8765
```
en open `http://localhost:8765/app/index.html`.
