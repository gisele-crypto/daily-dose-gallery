# Nieuwsbrief koppelen aan Laposta

Het aanmeldformulier op de site (homepage en Contact) stuurt het e-mailadres naar Laposta. Laposta stuurt de bevestigingsmail (dubbele bevestiging, AVG); pas na een klik op de link staat iemand actief op de lijst.

## In Laposta

1. Log in op **laposta.nl**.
2. **Lijsten** → maak een lijst, bijvoorbeeld *Daily Dose Gallery Newsletter* (of gebruik je bestaande lijst).
3. Open de lijst → **Kenmerken** (of Instellingen) → zet **Bevestiging aanmelding (double opt-in)** aan. Pas de bevestigingsmail en de bedankpagina eventueel aan in het Engels.
4. Zorg dat alleen **E-mailadres** een verplicht veld is. Andere verplichte velden (zoals Naam) laten de aanmelding mislukken, want het formulier vraagt alleen het e-mailadres.
5. Noteer het **lijst-ID** (bij de lijst onder Kenmerken, een code van ongeveer 10 tekens).
6. **Account → Koppelingen → API**: kopieer je **API-sleutel**. Deel die met niemand en zet hem niet in de chat.

## In Netlify

7. Site → **Site configuration → Environment variables → Add a variable**:
   - `LAPOSTA_API_KEY` = de API-sleutel (zet **Contains secret values** aan)
   - `LAPOSTA_LIST_ID` = het lijst-ID
8. **Deploys → Trigger deploy → Deploy site**.

## Testen

9. Meld je aan met je eigen e-mailadres op de site. Je ziet "Thank you. Check your inbox to confirm."
10. In Laposta staat het adres nu als **onbevestigd**. Klik op de link in de bevestigingsmail; het adres wordt **actief**.

Gaat er iets mis, dan staat de foutmelding van Laposta in Netlify onder **Logs → Functions → subscribe**.
