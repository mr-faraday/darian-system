'use strict';

const MARS_TO_EARTH_DAYS = 1.027491251;
const EPOCH_OFFSET = 587744.77817;
const ROUND_UP_SECOND = 1/86400;
const eDaysTilMonth = [-1, -1, 30, 58, 89, 119, 150, 180, 211, 242, 272, 303, 333];
const eDaysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DARIAN_MONTH_NAMES = ['Sagittarius', 'Dhanus', 'Capricornus', 'Makara', 'Aquarius', 'Kumbha', 'Pisces', 'Mina', 'Aries', 'Mesha', 'Taurus', 'Rishabha', 'Gemini', 'Mithuna', 'Cancer', 'Karka', 'Leo', 'Simha', 'Virgo', 'Kanya', 'Libra', 'Tula', 'Scorpius', 'Vrishika'];

var OTDS = require('./on_this_sol_day.js');
var events = new OTDS();

  // Exceptions
class TypeException extends Error {
  constructor(id) {
    var message;
    switch (id) {
      case '01':
        message = 'One or more of arguments is NaN.'
        break;
      case '02':
        message = 'It\'s not Darian_Date() object.'
        break;
      default:
        message = 'Unknow Error.'
    }
    super(message);
    this.name = 'TypeException';

    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
      else this.stack = (new Error(message)).stack;
  }
}

class RangeException extends Error {
  constructor(id) {
    var message;
    switch (id) {
      case '01':
        message = 'Warning: Dates before the year 1 are not handled exactly by this applet.';
        break;
      case '02':
        message = 'Warning: Gregorian calendar did not exist in the year specified.';
        break;
      case '03':
        message = 'Warning: The British Empire did not adopt the Gregorian calendar until 1752.';
        break;
      case '04':
        message = 'There are not that many months on Earth.';
        break;
      case '05':
        message = 'There are not that many days in this month on Earth.';
        break;
      case '06':
        message = 'There are not that many months on Mars.';
        break;
      case '07':
        message = 'There are not that many days in this month on Mars.';
        break;
      default:
        message = 'Unknow Error.'
    }
    super(message);
    this.name = 'RangeException';

    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
      else this.stack = (new Error(message)).stack;
  }
}

  // Convert martian time to Date()
function convMarsToEarth(mDate) {
  if (!(mDate instanceof Darian_Date)) throw new TypeException('02');

  var solsSince;
  var daysSince;
  var partialDay;

    // Range checking:
  if (mDate['mMonth'] < 1 || mDate['mMonth'] > 24)
    throw new RangeException('06');

  if (mDate['mDay'] < 1 || mDate['mDay'] > 28 || (mDate['mMonth'] % 6 == 0 && mDate['mDay'] == 28 && !(mDate['mMonth'] == 24 && isMartianLeapYear(mDate['mYear']))))
    throw new RangeException('07');

    // Convert Martian date to sols
  var year = +mDate['mYear'];
  var month = +mDate['mMonth'];
  var day  = +mDate['mDay'];
  var TestData = 3;

  solsSince = day + ((month - 1) * 28) - Math.floor((month - 1) / 6)
      + 668 * year
        + Math.floor(year / 2)
        + Math.floor((year-1) / 10)
        - Math.floor((year-1) / 100)
        + Math.floor((year-1) / 1000);

  var hour = +mDate['mHour'] / 24
  var min  = +mDate['mMin'] / 1440
  var sec  = +mDate['mSec'] / 86400;

  if (!isNaN(hour)) solsSince += hour;
  if (!isNaN(min))  solsSince += min;
  if (!isNaN(sec))  solsSince += sec;

    // Timezone for now "Airy"
  // solsSince -=
  //   document.calc.mTZ.options[document.calc.mTZ.selectedIndex].value/360;

    // Convert sols to days
  daysSince = solsSince * MARS_TO_EARTH_DAYS + EPOCH_OFFSET + ROUND_UP_SECOND;

  daysSince -= (new Date()).getTimezoneOffset() / 1440;

    // Convert back to date, and put it it form
    // get the fractional part, to do the time later
  partialDay = daysSince - Math.floor(daysSince);

  // Convert days to Gregorian date:

  var d = Math.floor(daysSince) + 1;

  var sCD = Math.floor(d/146097);   // what 400 year span
  var doCD= Math.floor(d-(sCD*146097));

  var sC = 0;
  var doC = doCD;
  if (doCD != 0) sC = Math.floor((doCD-1)/36524);
  if (sC != 0) doC -= (sC*36524+1);

  var sIV = 0;
  var doIV = doC;
  if (sC != 0) {  // 1460 + 1461*24
    sIV = Math.floor((doC+1)/1461);
    if(sIV != 0) doIV -= (sIV*1461-1);
  } else {  // 1461*25
    sIV = Math.floor(doC/1461);
    if(sIV != 0) doIV -= (sIV*1461);
  }

  var sI = 0;
  var doI = doIV;
  if (sC != 0 && sIV == 0) {  // four 365-day years in a row
    sI = Math.floor(doIV/365);
    if(sI != 0) doI -= (sI*365);
  } else {  // normal leap year cycle
    if(doI != 0) sI = Math.floor((doIV-1)/365);
    if(sI != 0) doI -= (sI*365 + 1);
  }

  var earthYear = 400*sCD + 100*sC + 4*sIV + sI;
  var tmpDayOfYear = doI+1;

  for (var i=1; i<12; i++) {
    var tmpDaysInMonth = eDaysInMonth[i];
    if (i==2 && !Darian_Date.isEarthLeapYear(earthYear))
      tmpDaysInMonth -= 1;

    if(tmpDayOfYear > tmpDaysInMonth)
      tmpDayOfYear -= tmpDaysInMonth;
    else
      break;
  }

  var earthMonth = i-1;
  var earthDay = tmpDayOfYear;

  var tmpHour = partialDay*24;
  var tmpMin  = (tmpHour - Math.floor(tmpHour))*60;
  var tmpSec  = (tmpMin - Math.floor(tmpMin))*60;

  var date = new Date(earthYear, earthMonth, earthDay, Math.floor(tmpHour), tmpMin, tmpSec);

    // Send Date()
  return date;

  function isMartianLeapYear(year) {
    if((year % 500) == 0) return true;
    if((year % 100) == 0) return false;
    if((year %  10) == 0) return true;
    if((year %   2) == 0) return false;
    return true;
  }
}

  // Darian_Date Class
class Darian_Date {
  constructor() {
    var eYear;
    var leapDay;
    var eMonth;
    var eDay;
    var eHour;
    var eMin;
    var eSec;
    var daysSince;

      // Today
    if (arguments.length === 0) {
      var today = new Date();

      eYear = today.getUTCFullYear();
      eMonth = today.getUTCMonth() + 1;
      eDay = today.getUTCDate();

      daysSince = eDay + Darian_Date.eDaysTilMonth[eMonth]
        + 365 * eYear
        + Math.floor(eYear / 4)
        - Math.floor(eYear / 100)
        + Math.floor(eYear / 400)

      if ((eMonth < 3) && Darian_Date.isEarthLeapYear(eYear))
        daysSince -= 1;

      eHour = today.getUTCHours()/24;
      eMin = today.getMinutes()/1440;
      eSec = today.getSeconds()/86400;

      daysSince += eHour;
      daysSince += eMin;
      daysSince += eSec;
    }

      // If prompt Date()
    if (arguments[0] instanceof Date) {
      var eDate = arguments[0];

      eYear = eDate.getUTCFullYear();
      eMonth = eDate.getUTCMonth() + 1;
      eDay = eDate.getUTCDate();

      daysSince = eDay + Darian_Date.eDaysTilMonth[eMonth]
        + 365 * eYear
        + Math.floor(eYear / 4)
        - Math.floor(eYear / 100)
        + Math.floor(eYear / 400)

      if ((eMonth < 3) && Darian_Date.isEarthLeapYear(eYear))
        daysSince -= 1;

      eHour = eDate.getUTCHours()/24;
      eMin = eDate.getMinutes()/1440;
      eSec = eDate.getSeconds()/86400;

      daysSince += eHour;
      daysSince += eMin;
      daysSince += eSec;
    }

      // Prompt year[, month[, day[, hour[, min[, sec[, timeZoneModifer]]]]]]
    if (arguments.length >= 1 && !(arguments[0] instanceof Date)) {

          // Type checking
      for (var key in arguments) {
        if (!+arguments[key]) throw new TypeException('01');
      }

      var timeZoneCorrector;

        // Timezonme correction
      if (arguments[6]) timeZoneCorrector = +arguments[6]
        else timeZoneCorrector = 0;

      eYear = +arguments[0];
      eMonth = +arguments[1] || 1;
      eDay = +arguments[2] || 1;

      daysSince = eDay + Darian_Date.eDaysTilMonth[eMonth]
        + 365 * eYear
        + Math.floor(eYear / 4)
        - Math.floor(eYear / 100)
        + Math.floor(eYear / 400);

      if ((eMonth < 3) && Darian_Date.isEarthLeapYear(eYear))
        daysSince -= 1;

      eHour = (+arguments[3] - timeZoneCorrector) / 24 || 0;
      eMin = +arguments[4] / 1440 || 0;
      eSec = +arguments[5] / 86400 || 0;

      daysSince += eHour;
      daysSince += eMin;
      daysSince += eSec;
    }

    if (eYear % 4 == 0 || (eYear % 100 != 0 && eYear % 400 == 0))
  		leapDay = 1;
  	else
  		leapDay = 0;

    // Range checking:
    if (eYear < 0) {
      throw new RangeException('01');
    }
    else if (eYear < 1582) {
      throw new RangeException('02');
    } else if (eYear < 1753) {
      throw new RangeException('03');
    }

    if (eMonth < 1 || eMonth > 12) {
      throw new RangeException('04');
    }

    if (eDay < 1 || eDay > Darian_Date.eDaysInMonth[eMonth] || (!Darian_Date.isEarthLeapYear(eYear) && eMonth == 2 && eDay > 28)) {
      throw new RangeException('05');
    }

    // Convert to straight days:
    // if(document.calc.eTZ.options[document.calc.eTZ.selectedIndex].text == "Local")
    //   daysSince += (new Date()).getTimezoneOffset()/1440;
    // else
    //   daysSince +=
    //     document.calc.eTZ.options[document.calc.eTZ.selectedIndex].value/1440;

    var daysSince;
    var solsSince;
    var partialSol;
    var marsYear;
    var marsMonth;
    var marsMonthName;
    var marsDay;
    var nSolName;

    // Convert days to sols:
    solsSince = (daysSince - Darian_Date.EPOCH_OFFSET) / Darian_Date.MARS_TO_EARTH_DAYS;

      // Mars timezone for now "Airy"
    // this.solsSince += document.calc.mTZ.options[document.calc.mTZ.selectedIndex].value/360;

      // Convert back to date, and put it it form:
      // get the fractional part, to do the time later
    var partialSol = solsSince - Math.floor(solsSince);
      // Convert sols to Martian date:
    var s = solsSince;

    var sD  = Math.floor(s/334296);
    var doD = Math.floor(s-(sD*334296));

    var sC = 0;
    var doC = doD;
    if (doD != 0) sC = Math.floor((doD-1)/66859);
    if (sC != 0) doC -= (sC*66859+1);

    var sX = 0;
    var doX = doC;
    if (sC != 0) { // century that does not begin with leap day
      sX = Math.floor((doC+1)/6686);
      if(sX != 0) doX -= (sX*6686-1);
    } else {
      sX = Math.floor(doC/6686);
      if(sX != 0) doX -= (sX*6686);
    }

    var sII = 0;
    var doII = doX;
    if (sC != 0 && sX == 0) {
        // decade that does not begin with leap day
      sII = Math.floor(doX/1337);
      if(sII != 0) doII -= (sII*1337);
    } else {
        // 1338, 1337, 1337, 1337 ...
      if(doX != 0) sII = Math.floor((doX-1)/1337);
      if(sII != 0) doII -= (sII*1337+1);
    }

    var sI = 0;
    var doI= doII;
    if (sII==0 && (sX != 0 || (sX == 0 && sC == 0))) {
      sI = Math.floor(doII/669);
      if(sI != 0) doI -= 669;
    } else {
        // 668, 669
      sI = Math.floor((doII+1)/669);
      if(sI != 0) doI -= 668;
    }

    marsYear = 500*sD + 100*sC + 10*sX + 2*sII + sI;


    // get the date from the day of the year:

    var tmpSeason = Darian_Date.getMartianSeasonFromSol(doI);            // 0-3
    var tmpSolOfSeason = doI-167*tmpSeason;                  // 0-167
    var tmpMonthOfSeason = Math.floor(tmpSolOfSeason/28);    // 0-5

    var marsMonth = tmpMonthOfSeason + 6*tmpSeason + 1;      // 1-24

    var marsDay   = doI - ((marsMonth-1)*28 - tmpSeason) + 1;  // 1-28

    // var SolNomen = parseInt(document.calc.InSolNomen.value, 10);
    var SolNomen = 1;



    var jdate;
    var earthday = 86400.0;
    var marsday = 88775.245;
    var jdate_ref = 2.442765667e6; // 19/12/1975 4:00:00, such that Ls=0

    var sol;
    var ls;

    var year_day = 668.59; // number of sols in a martian year
    var peri_day = 485.35; // perihelion date
    var e_ellip = 0.09340; // orbital ecentricity
    var timeperi = 1.90258341759902 // 2*Pi*(1-Ls(perihelion)/360); Ls(perihelion)=250.99
    var rad2deg = 180./Math.PI;

    var i;
    var zz,zanom,zdx = 10;
    var xref,zx0,zteta;
    // xref: mean anomaly, zx0: eccentric anomaly, zteta: true anomaly



    if (SolNomen == 1) {
        //Darian Sols of the Week
      if ((marsDay - 1) % 7 + 1 == 1)
        nSolName = "Sol Solis";
      if ((marsDay - 1) % 7 + 1 == 2)
        nSolName = "Sol Lunae";
      if ((marsDay - 1) % 7 + 1 == 3)
        nSolName = "Sol Martis";
      if ((marsDay - 1) % 7 + 1 == 4)
        nSolName = "Sol Mercurii";
      if ((marsDay - 1) % 7 + 1 == 5)
        nSolName = "Sol Jovis";
      if ((marsDay - 1) % 7 + 1 == 6)
        nSolName = "Sol Veneris";
      if ((marsDay - 1) % 7 + 1 == 7)
        nSolName = "Sol Saturni";
    }

    else if (SolNomen == 2) {
        //Darian Defrost Sols of the Week
      if ((marsDay - 1) % 7 + 1 == 1)
        nSolName = "Axatisol";
      if ((marsDay - 1) % 7 + 1 == 2)
        nSolName = "Benasol";
      if ((marsDay - 1) % 7 + 1 == 3)
        nSolName = "Ciposol";
      if ((marsDay - 1) % 7 + 1 == 4)
        nSolName = "Domesol";
      if ((marsDay - 1) % 7 + 1 == 5)
        nSolName = "Erjasol";
      if ((marsDay - 1) % 7 + 1 == 6)
        nSolName = "Fulisol";
      if ((marsDay - 1) % 7 + 1 == 7)
        nSolName = "Gavisol";
    }

    else if (SolNomen == 3) {
        //Utopian Sols of the Week
      if ((marsDay - 1) % 7 + 1 == 1)
        nSolName = "Sunsol";
      if ((marsDay - 1) % 7 + 1 == 2)
        nSolName = "Phobosol";
      if ((marsDay - 1) % 7 + 1 == 3)
        nSolName = "Deimosol";
      if ((marsDay - 1) % 7 + 1 == 4)
        nSolName = "Terrasol";
      if ((marsDay - 1) % 7 + 1 == 5)
        nSolName = "Venusol";
      if ((marsDay - 1) % 7 + 1 == 6)
        nSolName = "Mercurisol";
      if ((marsDay - 1) % 7 + 1 == 7)
        nSolName = "Jovisol";
    }

      // Darian months name
    marsMonthName = DARIAN_MONTH_NAMES[marsMonth-1];

    //------------------------------------------
    // From Laboratoire de Mйtйorologie Dynamique 'Planetary Atmospheres' team

    jdate = (Math.floor(solsSince*1.027491251*100000)/100000) + 584.838
    sol = (jdate-jdate_ref)*earthday/marsday;
    zz = (sol-peri_day)/year_day;
    zanom = 2.*Math.PI*(zz-Math.round(zz));
    xref = Math.abs(zanom);

    // Solve Kepler equation zx0 - e *sin(zx0) = xref
    // Using Newton iterations
    zx0 = xref+e_ellip*Math.sin(xref);
    do {
      zdx =- (zx0-e_ellip*Math.sin(zx0)-xref)/(1.-e_ellip*Math.cos(zx0));
      zx0 = zx0+zdx;
    } while (zdx>1.e-7);
    if (zanom<0) zx0=-zx0;

    // Compute true anomaly zteta, now that eccentric anomaly zx0 is known
    zteta = 2.*Math.atan(Math.sqrt((1.+e_ellip)/(1.-e_ellip))*Math.tan(zx0/2.));

    // compute Ls
    ls = zteta-timeperi;
    if (ls<0) ls = ls+2.*Math.PI;
    if (ls>2.*Math.PI) ls = ls-2.*Math.PI;
    // convert Ls into degrees
    ls = rad2deg*ls;
    //------------------------------------------

      // Set results

      // This sol
    this.dispThisSol = events.this_sol(doI);

      // This day
    this.dispThisDay = events.this_day(doI, leapDay);

    this.mYear = Darian_Date.threeDigit(marsYear);
    this.mMonth = marsMonth;
    this.mMonthName = marsMonthName;
    this.mDay = Darian_Date.twoDigit(marsDay);
    this.mJulianDay = (Math.floor(solsSince*100000)/100000);  // Julian Calendar Date
    this.mNumDay = Darian_Date.threeDigit(doI);  // Sol in mYear
    this.mSolName = nSolName;
      // Mars Solar Longitude
    if (Math.round(ls*10)/10 < 10) this.mSolarLongitude = "00" + Math.round(ls*10)/10
      else if (Math.round(ls*10)/100 < 10) this.mSolarLongitude = "0" + Math.round(ls*10)/10
        else this.mSolarLongitude = Math.round(ls*10)/10;

    var tmpHour = partialSol*24;
    var tmpMin  = (tmpHour - Math.floor(tmpHour))*60;
    var tmpSec  = (tmpMin - Math.floor(tmpMin))*60;
    this.mHour = Darian_Date.twoDigit(Math.floor(tmpHour));
    this.mMin  = Darian_Date.twoDigit(tmpMin);
    this.mSec  = Darian_Date.twoDigit(tmpSec);
  }

    // Methods
  getDate() {
    var output = '';

    if (this.hasOwnProperty('mSolName')) output += this.mSolName+', ';
    if (this.hasOwnProperty('mDay')) output += this.mDay+' ';
    if (this.hasOwnProperty('mMonthName')) output += this.mMonthName+' ';
    if (this.hasOwnProperty('mYear')) output += this.mYear+', ';
    if (this.hasOwnProperty('mHour')) output += this.mHour+':';
    if (this.hasOwnProperty('mMin')) output += this.mMin+':';
    if (this.hasOwnProperty('mSec')) output += this.mSec;

    return output;
  }
  getJSON() {
    return {
      dispThisSol: this.dispThisSol,
      dispThisDay: this.dispThisDay,
      mYear: this.mYear,
      mMonth: this.mMonth,
      mMonthName: this.mMonthName,
      mDay: this.mDay,
      mJulianDay: this.mJulianDay,
      mNumDay: this.mNumDay,
      mSolName: this.mSolName,
      mSolarLongitude: this.mSolarLongitude,
      mHour: this.mHour,
      mMin: this.mMin,
      mSec: this.mSec
    };
  }
  getDispThisSol() {
    return this.dispThisSol;
  }
  getDispThisDay() {
    return this.dispThisDay;
  }

    // Static methods and constannts
  static getMartianSeasonFromSol(sol) {
    if(sol < 167) return 0;
    if(sol < 334) return 1;
    if(sol < 501) return 2;
    return 3;
  }
  static isEarthLeapYear(year) {
    if((year % 400) == 0) return true;
    if((year % 100) == 0) return false;
    if((year %   4) == 0) return true;
    return false;
  }
  static twoDigit(n) {
    if (n<10) return "0"+Math.floor(n);
    else return Math.floor(n);
  }
  static threeDigit(n) {
    if (n < 0) return "-" + Darian_Date.PadLeft(-n, 3, "0")
      else return Darian_Date.PadLeft(n, 3, "0");
  }
  static fiveDigit(n) {
    if (n < 0) return "-" + Darian_Date.PadLeft(-n, 5, "0")
      else return Darian_Date.PadLeft(n, 5, "0");
  }
  static PadLeft(value, width, chPad) {
    // convert to a string:
    var result = value + "";
    // add pad characters until desired width is reached:
    while (result.length < width)
    	result = chPad + result;
    return result;
  }
  static get MARS_TO_EARTH_DAYS() { return MARS_TO_EARTH_DAYS; }
  static get EPOCH_OFFSET() { return EPOCH_OFFSET; }
  static get ROUND_UP_SECOND() { return ROUND_UP_SECOND; }
  static get eDaysTilMonth() { return eDaysTilMonth; }
  static get eDaysInMonth() { return eDaysInMonth; }
  static get DARIAN_MONTH_NAMES() { return DARIAN_MONTH_NAMES; }
}

module.exports.Darian_Date = Darian_Date;
module.exports.convMarsToEarth = convMarsToEarth;
