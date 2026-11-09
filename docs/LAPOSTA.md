# Nieuwsbrief koppelen aan Laposta

Het aanmeldformulier op de site (homepage en Contact) stuurt het e-mailadres naar je Laposta-lijst.

## Hoe het nu werkt (gratis Laposta-account)

Het gratis account heeft **geen dubbele bevestiging (double opt-in)**. Er gaat dus geen bevestigingsmail uit. De site meldt nieuwe aanmelders daarom aan als **actief** (met `ignore_doubleoptin`), zodat niemand als "onbevestigd" blijft hangen.

- Na aanmelden ziet de bezoeker: "Thank you. You're on the list."
- Onder het formulier staat: "By subscribing you agree to receive our newsletter. Unsubscribe at any time. Privacy" (met link naar de privacypagina). Dat is de toestemming.
- Iemand die zich eerder heeft afgemeld en zich opnieuw aanmeldt, wordt weer actief.
- Elke nieuwsbrief uit Laposta heeft een afmeldlink.

## In Laposta

1. Log in op **laposta.nl**.
2. Gebruik de lijst met lijst-ID **emw1zzxote**.
3. Zorg dat alleen **E-mailadres** een verplicht veld is. Andere verplichte velden (zoals Naam) laten de aanmelding mislukken, want het formulier vraagt alleen het e-mailadres.
4. **Account → Koppelingen → API**: kopieer je **API-sleutel**. Deel die met niemand en zet hem niet in de chat.

## In Netlify

5. Site → **Site configuration → Environment variables → Add a variable**:
   - `LAPOSTA_API_KEY` = de API-sleutel (zet **Contains secret values** aan)
   - `LAPOSTA_LIST_ID` = `emw1zzxote`
6. **Deploys → Trigger deploy → Deploy site**.

## Controleren dat aanmelders actief worden

7. Meld je op de site aan met een eigen (tweede) e-mailadres. Je ziet "Thank you. You're on the list."
8. In Laposta: **Lijsten** → je lijst → **Relaties**. Het adres staat erin met status **Actief** (niet "Onbevestigd").
9. Extra controle in Netlify: **Logs → Functions → subscribe**. Bij elke aanmelding staat daar `Laposta member state: active`. Het e-mailadres zelf wordt niet gelogd.

Staat er "unconfirmed" of "Onbevestigd", of een foutmelding van Laposta in het log, stuur die regel dan door.

## Later: dubbele bevestiging (betaald account)

Met een betaald account kun je dubbele bevestiging gebruiken, zonder de code te veranderen:

1. Laposta: zet bij de lijst **Bevestiging aanmelding (double opt-in)** aan.
2. Netlify: voeg `LAPOSTA_DOUBLE_OPTIN` = `true` toe en start een nieuwe deploy.

De site meldt dan "Thank you. Check your inbox to confirm." en Laposta stuurt de bevestigingsmail.
