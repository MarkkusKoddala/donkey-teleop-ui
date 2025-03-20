# Väikesemõõtmelise kaugjuhitava auto juhtimissüsteem

See projekt sisaldab frontendi ja backendi komponente, mille abil saab juhtida Raspberry Pi 4 põhist DonkeyCar mänguautot reaalajas klaviatuuri, rooli või mängupuldiga. Süsteem toetab ka autonoomset režiimi, mis aktiveerub videovooga ühenduse katkemisel.



## Paigaldus

1. **Klooni projekt**:

```
git clone https://github.com/sinu-kasutaja/kaugjuhtimise-auto.git
cd kaugjuhtimise-auto
```

2. **Paigalda sõltuvused**:

```
npm install
```

3. **Sea `.env` fail**:

Loo fail `.env` ja määra auto IP:

```
PUBLIC_CAR_IP=192.168.1.100
```

4. **Käivita dev-server**:

```
npm run dev
```
