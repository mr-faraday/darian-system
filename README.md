# Darian System

This is module for Node.js to convert Earth time to Martian time in Darian system.

The [Darian calendar](https://en.wikipedia.org/wiki/Darian_calendar) is a proposed system of time-keeping on the planet Mars. It was created by aerospace engineer and political scientist Thomas Gangale in 1985. In 2002 he adopted the Telescopic Epoch, which is in 1609 in recognition of [Johannes Kepler](https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion)'s use of [Tycho Brahe](https://en.wikipedia.org/wiki/Tycho_Brahe)'s observations of Mars to elucidate the laws of planetary motion, and also [Galileo Galilei](https://en.wikipedia.org/wiki/Galileo_Galilei)'s first observations of Mars with a telescope.

I'm still working on this module. New methods and opportunities will soon appear and maybe I'll add more events.

## Usage

Clone repository to you *node_modules* folder.

```javascript
var ds = require('darian-system');
```

Class constructor can recive *Date()* object or date as arguments in syntax:
```javascript
new Darian_Date(year[, month[, day[, hour[, min[, sec[, timeZoneModifer]]]]]])
```
*timeZoneModifer* - for UTC+3 is *3*, UTC-5 - *-5*
If the constructor receives an empty argument string, it will create an object for the current time.

```javascript
var marsTime = new ds.Darian_Date();
console.log(marsTime.getTime());  // Sol Martis, 17 Mesha 217, 17:18:57
```

### Methods

```javascript
.getTime()  // Sol Mercurii, 04 Gemini 217, 03:42:40
```
Outputs date in format *[dayOfWeek], [monthDay] [Month] [Year], [Hour]:[Min]:[Sec]*

```javascript
.getDispThisSol()  // On this sol in 197: Contact with Viking Orbiter 1 was lost after 1,469 sols in Mars orbit.
```
Outputs events that occurred on this day of the sol(Mars year).

```javascript
.getDispThisDay()  // On this day in 1999: Mars Polar Lander was launched.
```
Outputs events that occurred on this day of the Earth year.

## Based on

* [MARTIAN DATE CALCULATOR](http://ops-alaska.com/time/gangale_converter/calendar_clock.htm) - Online converter developed by Alan Hensel and Thomas Gangale.
