# Sanity eenmalig instellen

Dit doe je één keer. Daarna werk je alleen nog met de handleiding (HANDLEIDING-CMS.md).

## 1. Sanity-project aanmaken (jij)

1. Ga naar **sanity.io** en maak een gratis account (bijvoorbeeld met je Google-account).
2. Maak een nieuw project: naam *Daily Dose Gallery*, dataset **production**, zichtbaarheid **public**.
3. Noteer het **Project ID** (8 tekens, staat op sanity.io/manage bij het project).
4. Ga in het project naar **API → CORS origins** en voeg toe, telkens met **Allow credentials** aan:
   - `https://www.dailydosegallery.com`
   - `https://dailydosegallery.netlify.app`

## 2. Netlify koppelen (jij)

1. Netlify → je site → **Site configuration → Environment variables** → **Add a variable**:
   - `SANITY_STUDIO_PROJECT_ID` = het Project ID
   - `SANITY_STUDIO_DATASET` = `production`
2. Netlify → **Site configuration → Build & deploy → Build hooks** → **Add build hook**, naam *Sanity*. Kopieer de link.
3. Sanity (sanity.io/manage) → project → **API → Webhooks** → **Create webhook**:
   - Name: *Netlify*
   - URL: de build-hook-link uit stap 2
   - Dataset: production
   - Trigger on: Create, Update, Delete
   - HTTP method: POST
   - Opslaan.

Vanaf nu bouwt de site zichzelf opnieuw zodra je in Sanity op Publish klikt.

## 3. De huidige inhoud overzetten (Claude Code)

Het script `scripts/import-to-sanity.mjs` zet alle huidige werken, foto's, teksten en gegevens in Sanity. Daarvoor is eenmalig een **API-token** nodig: sanity.io/manage → project → **API → Tokens → Add API token**, rechten **Editor**. Geef dit token alleen via het veilige invulscherm dat Claude Code je laat zien, nooit in de chat.

Zolang Sanity nog leeg is, blijft de website gewoon de huidige inhoud tonen.
